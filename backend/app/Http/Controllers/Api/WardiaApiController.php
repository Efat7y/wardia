<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Factory;
use App\Models\Worker;
use App\Models\Shift;
use App\Models\ShiftBooking;
use App\Models\EarningsLedger;
use App\Models\GateReport;

class WardiaApiController extends Controller
{
    const SECRET_SALT = 'wardia_secure_dynamic_salt_2026_shift_key';
    const GEOFENCE_RADIUS_METERS = 500;

    /**
     * Get Complete System State for Frontend Hydration
     */
    public function getState()
    {
        $factories = Factory::all();
        $shifts = Shift::with('factory')->orderBy('id', 'desc')->get();
        $workers = Worker::all();
        $bookings = ShiftBooking::with(['shift', 'worker'])->orderBy('id', 'desc')->get();
        $ledger = EarningsLedger::orderBy('id', 'desc')->get();
        $gateReports = GateReport::with('factory')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'factories' => $factories,
            'shifts' => $shifts,
            'workers' => $workers,
            'bookings' => $bookings,
            'ledger' => $ledger,
            'gateReports' => $gateReports,
            'activeWorkerId' => $workers->first()?->id ?? 1,
        ]);
    }

    /**
     * Get list of factories
     */
    public function getFactories()
    {
        return response()->json(Factory::all());
    }

    /**
     * Get available shifts
     */
    public function getShifts()
    {
        return response()->json(Shift::with('factory')->orderBy('id', 'desc')->get());
    }

    /**
     * Atomic shift booking with SELECT FOR UPDATE
     */
    public function bookShift(Request $request)
    {
        $validated = $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'worker_id' => 'required|exists:workers,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $shift = Shift::where('id', $validated['shift_id'])->lockForUpdate()->first();

            if ($shift->slots_filled >= $shift->slots_needed) {
                return response()->json([
                    'success' => false,
                    'message' => 'عذراً! اكتملت المقاعد الشاغرة لهذه الوردية للتو',
                ], 422);
            }

            $existing = ShiftBooking::where('shift_id', $shift->id)
                ->where('worker_id', $validated['worker_id'])
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'لقد قمت بحجز هذه الوردية بالفعل',
                ], 422);
            }

            $booking = ShiftBooking::create([
                'shift_id' => $shift->id,
                'worker_id' => $validated['worker_id'],
                'status' => 'booked',
            ]);

            $shift->increment('slots_filled');

            return response()->json([
                'success' => true,
                'message' => 'تم تأكيد حجز الوردية بنجاح!',
                'booking' => $booking->load(['shift', 'worker']),
            ]);
        });
    }

    /**
     * Worker Login or Registration by National ID + Phone
     */
    public function loginOrRegisterWorker(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'nullable|string|max:100',
            'national_id' => 'required|string|size:14',
            'phone' => 'required|string|size:11',
            'id_card_front' => 'nullable|string',
            'id_card_back' => 'nullable|string',
            'meeza_card_number' => 'nullable|string',
            'meeza_bank_name' => 'nullable|string',
        ]);

        $cleanId = trim($validated['national_id']);
        $cleanPhone = trim($validated['phone']);

        $worker = Worker::where('national_id', $cleanId)
            ->orWhere('phone', $cleanPhone)
            ->first();

        if ($worker) {
            if (!empty($validated['id_card_front'])) $worker->id_card_front = $validated['id_card_front'];
            if (!empty($validated['id_card_back'])) $worker->id_card_back = $validated['id_card_back'];
            $worker->save();

            return response()->json([
                'success' => true,
                'message' => "أهلاً بك مجدداً يا {$worker->full_name}",
                'worker' => $worker,
            ]);
        }

        $newWorker = Worker::create([
            'full_name' => trim($validated['full_name'] ?? 'عامل جديد'),
            'national_id' => $cleanId,
            'phone' => $cleanPhone,
            'id_card_front' => $validated['id_card_front'] ?? null,
            'id_card_back' => $validated['id_card_back'] ?? null,
            'meeza_card_number' => $validated['meeza_card_number'] ?? null,
            'meeza_bank_name' => $validated['meeza_bank_name'] ?? null,
            'attendance_score' => 100.0,
            'status' => 'active',
            'wallet_balance' => 0.0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل بيانات بطاقتك بنجاح وحسابك جاهز لحجز الورديات!',
            'worker' => $newWorker,
        ]);
    }

    /**
     * Link or Update Meeza Card
     */
    public function saveMeezaCard(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'card_number' => 'required|string',
            'bank_name' => 'nullable|string',
        ]);

        $worker = Worker::find($validated['worker_id']);
        $cleanCard = preg_replace('/\s+/', '', $validated['card_number']);

        if (strlen($cleanCard) !== 16 || !ctype_digit($cleanCard)) {
            return response()->json([
                'success' => false,
                'message' => 'رقم كارت ميزة يجب أن يتكون من 16 رقماً بالضبط.',
            ], 422);
        }

        $worker->update([
            'meeza_card_number' => $cleanCard,
            'meeza_bank_name' => $validated['bank_name'] ?? 'كارت ميزة وطني',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم ربط وتثبيت كارت ميزة بنجاح وسيكون وسيلة الصرف المعتمدة!',
            'worker' => $worker,
        ]);
    }

    /**
     * Execute Worker Payout
     */
    public function executePayout(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'amount' => 'required|numeric|min:1',
            'method' => 'required|in:MEEZA,WALLET',
            'destination' => 'required|string',
        ]);

        $worker = Worker::find($validated['worker_id']);
        $amount = (float) $validated['amount'];

        if ($amount > $worker->wallet_balance) {
            return response()->json([
                'success' => false,
                'message' => 'رصيدك الحالي لا يكفي لهذا المبلغ',
            ], 422);
        }

        $isMeeza = $validated['method'] === 'MEEZA';
        $notes = $isMeeza
            ? "تحويل نقدي لحظي لكارت ميزة ({$validated['destination']}) - متاح للصرف من أي ATM"
            : "تحويل نقدي لمحفظة كاش بالموبايل ({$validated['destination']})";

        DB::transaction(function () use ($worker, $amount, $notes) {
            EarningsLedger::create([
                'worker_id' => $worker->id,
                'shift_booking_id' => 0,
                'transaction_type' => 'PAYOUT',
                'amount' => -$amount,
                'notes' => $notes,
            ]);

            $worker->decrement('wallet_balance', $amount);
        });

        return response()->json([
            'success' => true,
            'message' => $isMeeza
                ? "تم تحويل {$amount} ج.م فورياً إلى كارت ميزة الخاص بك، يمكنك سحب المبلغ الآن من أي ماكينة ATM!"
                : "تم إرسال {$amount} ج.م بنجاح إلى محفظة {$validated['destination']}",
            'new_balance' => (float) $worker->fresh()->wallet_balance,
        ]);
    }

    /**
     * Create Shift (Admin / Factory)
     */
    public function createShift(Request $request)
    {
        $validated = $request->validate([
            'factory_id' => 'nullable|exists:factories,id',
            'factory_name' => 'nullable|string|max:150',
            'industrial_zone' => 'nullable|string|max:100',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'shift_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'worker_wage' => 'required|numeric',
            'service_fee' => 'nullable|numeric',
            'slots_needed' => 'required|integer|min:1',
        ]);

        $factoryId = $validated['factory_id'] ?? null;

        // If a new factory name is provided or factory_id is missing
        if (!empty($validated['factory_name'])) {
            $factory = Factory::firstOrCreate(
                ['name' => trim($validated['factory_name'])],
                [
                    'tax_record' => 'TR-10R-' . rand(10000, 99999),
                    'industrial_zone' => $validated['industrial_zone'] ?? 'المنطقة الصناعية الأولى (A1/B1)',
                    'latitude' => 30.2982,
                    'longitude' => 31.7456,
                    'status' => 'verified',
                    'gate_email' => 'gate_' . rand(100, 999) . '@wardia.eg',
                    'gate_password' => 'gate1234',
                    'gate_name' => 'البوابة الرئيسية',
                ]
            );
            $factoryId = $factory->id;
        }

        if (empty($factoryId)) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تحديد مصنع مسجل أو إدخال اسم المصنع / الشركة',
            ], 422);
        }

        $shift = Shift::create([
            'factory_id' => $factoryId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? 'وردية معتمدة بالعاشر من رمضان تشمل وجبة ومواصلات.',
            'shift_date' => $validated['shift_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'worker_wage' => $validated['worker_wage'],
            'service_fee' => $validated['service_fee'] ?? 50.0,
            'slots_needed' => $validated['slots_needed'],
            'slots_filled' => 0,
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم نشر الوردية بنجاح!',
            'shift' => $shift->load('factory'),
            'factory' => $shift->factory,
        ]);
    }

    /**
     * Update Shift (Admin / Factory)
     */
    public function updateShift(Request $request)
    {
        $validated = $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'factory_id' => 'nullable|exists:factories,id',
            'factory_name' => 'nullable|string|max:150',
            'industrial_zone' => 'nullable|string|max:100',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'shift_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'worker_wage' => 'required|numeric',
            'service_fee' => 'nullable|numeric',
            'slots_needed' => 'required|integer|min:1',
            'status' => 'nullable|string',
        ]);

        $shift = Shift::findOrFail($validated['shift_id']);
        $factoryId = $validated['factory_id'] ?? $shift->factory_id;

        if (!empty($validated['factory_name'])) {
            $factory = Factory::firstOrCreate(
                ['name' => trim($validated['factory_name'])],
                [
                    'tax_record' => 'TR-10R-' . rand(10000, 99999),
                    'industrial_zone' => $validated['industrial_zone'] ?? 'المنطقة الصناعية الأولى (A1/B1)',
                    'latitude' => 30.2982,
                    'longitude' => 31.7456,
                    'status' => 'verified',
                    'gate_email' => 'gate_' . rand(100, 999) . '@wardia.eg',
                    'gate_password' => 'gate1234',
                    'gate_name' => 'البوابة الرئيسية',
                ]
            );
            $factoryId = $factory->id;
        }

        $shift->update([
            'factory_id' => $factoryId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? $shift->description,
            'shift_date' => $validated['shift_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'worker_wage' => $validated['worker_wage'],
            'service_fee' => $validated['service_fee'] ?? $shift->service_fee,
            'slots_needed' => $validated['slots_needed'],
            'status' => $validated['status'] ?? $shift->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الوردية بنجاح!',
            'shift' => $shift->fresh()->load('factory'),
            'factory' => $shift->factory,
        ]);
    }

    /**
     * Delete Shift (Admin / Factory)
     */
    public function deleteShift(Request $request)
    {
        $validated = $request->validate([
            'shift_id' => 'required|exists:shifts,id',
        ]);

        $shift = Shift::findOrFail($validated['shift_id']);
        
        // Remove attached bookings
        $shift->bookings()->delete();
        $shift->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الوردية بنجاح!',
            'shift_id' => $validated['shift_id'],
        ]);
    }

    /**
     * Gate Supervisor QR Verification & Check-in
     */
    public function verifyGateQr(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'factory_id' => 'nullable|exists:factories,id',
            'supervisor_latitude' => 'nullable|numeric',
            'supervisor_longitude' => 'nullable|numeric',
            'bypass_geofence' => 'nullable|boolean',
        ]);

        $parts = explode(':', trim($validated['token']));
        if (count($parts) !== 6 || $parts[0] !== 'WARDIA') {
            return response()->json([
                'success' => false,
                'message' => 'تنسيق رمز الاستجابة السريعة (QR) غير صالح أو لا يتبع منظومة وردية',
            ], 400);
        }

        $workerId = (int) $parts[1];
        $bookingId = (int) $parts[2];
        $timestamp = (int) $parts[3];
        $nonce = $parts[4];
        $providedSignature = $parts[5];

        $now = time();
        $age = $now - $timestamp;
        if ($age > 35 || $age < -10) {
            return response()->json([
                'success' => false,
                'message' => "انتهت صلاحية الرمز! مر على توليده {$age} ثانية",
            ], 400);
        }

        $payloadToSign = "{$workerId}:{$bookingId}:{$timestamp}:{$nonce}";
        $expectedSignature = substr(hash_hmac('sha256', $payloadToSign, self::SECRET_SALT), 0, 16);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            return response()->json([
                'success' => false,
                'message' => 'فشل التحقق من التوقيع الرقمي للرمز (تنبيه: محاولة تزوير أو تلاعب)',
            ], 403);
        }

        $booking = ShiftBooking::with(['shift.factory', 'worker'])->find($bookingId);
        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'الحجز غير موجود',
            ], 404);
        }

        $factory = $booking->shift->factory;
        $worker = $booking->worker;

        // Security Check: Verify that worker is checking in at THIS specific factory's gate
        if (!empty($validated['factory_id']) && (int) $validated['factory_id'] !== (int) $factory->id) {
            $gateFactory = Factory::find($validated['factory_id']);
            return response()->json([
                'success' => false,
                'message' => "⚠️ تنبيه أمني: هذا العامل حجز ورديته في ({$factory->name}) وليس في ({$gateFactory?->name})! يُرجى توجيهه للمصنع الصحيح.",
                'mismatch' => true,
                'bookedFactoryName' => $factory->name,
                'currentGateFactoryName' => $gateFactory?->name,
            ], 422);
        }

        if ($booking->check_in_at) {
            return response()->json([
                'success' => false,
                'message' => 'تم تسجيل حضور هذا العامل مسبقاً',
                'workerName' => $worker->full_name,
                'shiftTitle' => $booking->shift->title,
                'factoryName' => $factory->name,
            ], 422);
        }

        DB::transaction(function () use ($booking, $worker) {
            $booking->update([
                'status' => 'attended',
                'check_in_at' => now(),
                'verified_by_user_id' => 99,
            ]);

            EarningsLedger::create([
                'worker_id' => $worker->id,
                'shift_booking_id' => $booking->id,
                'transaction_type' => 'EARNED',
                'amount' => $booking->shift->worker_wage,
                'notes' => "مستحقات حضور معتمد للوردية: {$booking->shift->title}",
            ]);

            $worker->increment('wallet_balance', $booking->shift->worker_wage);
        });

        return response()->json([
            'success' => true,
            'message' => "تم اعتماد الحضور بنجاح في بوابة ({$factory->name}) وقيد {$booking->shift->worker_wage} ج.م في حساب العامل!",
            'workerName' => $worker->full_name,
            'workerNationalId' => $worker->national_id,
            'workerPhone' => $worker->phone,
            'workerIdCardFront' => $worker->id_card_front,
            'workerIdCardBack' => $worker->id_card_back,
            'shiftTitle' => $booking->shift->title,
            'factoryName' => $factory->name,
            'factoryId' => $factory->id,
            'bookingId' => $booking->id,
            'checkInTime' => now()->toIso8601String(),
        ]);
    }

    /**
     * Check Out Worker with Overtime
     */
    public function checkOutWorker(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:shift_bookings,id',
            'overtime_hours' => 'nullable|numeric|min:0|max:12',
        ]);

        $booking = ShiftBooking::with(['shift', 'worker'])->find($validated['booking_id']);
        if (!$booking->check_in_at) {
            return response()->json(['success' => false, 'message' => 'العامل لم يسجل دخوله بعد'], 422);
        }
        if ($booking->check_out_at) {
            return response()->json(['success' => false, 'message' => 'العامل سجل انصرافه مسبقاً'], 422);
        }

        $overtimeHours = (float) ($validated['overtime_hours'] ?? 0);
        $overtimeBonus = 0;
        $worker = $booking->worker;
        $shift = $booking->shift;

        DB::transaction(function () use ($booking, $worker, $shift, $overtimeHours, &$overtimeBonus) {
            $booking->update([
                'check_out_at' => now(),
                'overtime_hours' => $overtimeHours,
            ]);

            if ($overtimeHours > 0) {
                $hourlyRate = $shift->worker_wage / 8.0;
                $overtimeBonus = round($hourlyRate * 1.5 * $overtimeHours);

                EarningsLedger::create([
                    'worker_id' => $worker->id,
                    'shift_booking_id' => $booking->id,
                    'transaction_type' => 'EARNED',
                    'amount' => $overtimeBonus,
                    'notes' => "بدل ساعات عمل إضافية ({$overtimeHours} ساعات أوفر تايم) - {$shift->title}",
                ]);

                $worker->increment('wallet_balance', $overtimeBonus);
            }
        });

        return response()->json([
            'success' => true,
            'message' => $overtimeHours > 0
                ? "تم تسجيل انصراف العامل بنجاح وقيد {$overtimeBonus} جنيه بدل {$overtimeHours} ساعات أوفر تايم!"
                : 'تم تسجيل انصراف العامل بنجاح.',
            'workerName' => $worker->full_name,
            'overtimeBonus' => $overtimeBonus,
            'overtimeHours' => $overtimeHours,
        ]);
    }

    /**
     * Mark Worker No-Show
     */
    public function markNoShow(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:shift_bookings,id',
        ]);

        $booking = ShiftBooking::with(['worker', 'shift'])->find($validated['booking_id']);
        if ($booking->check_in_at) {
            return response()->json(['success' => false, 'message' => 'العامل سجل حضوره بالفعل'], 422);
        }

        $worker = $booking->worker;
        $booking->update(['status' => 'no_show']);

        $newScore = max(0, round($worker->attendance_score - 15, 1));
        $worker->attendance_score = $newScore;
        $warning = 'تم خصم 15 نقطة من تقييم انضباط العامل.';

        if ($newScore < 70) {
            $worker->status = 'restricted';
            $warning = 'انخفض تقييم العامل عن 70% وتم تقييد حسابه تلقائياً من حجز ورديات جديدة لمدة أسبوع!';
        }
        $worker->save();

        return response()->json([
            'success' => true,
            'message' => "تم تسجيل غياب العامل ({$worker->full_name}). {$warning}",
            'workerName' => $worker->full_name,
            'newScore' => $newScore,
        ]);
    }

    /**
     * Admin: Update Worker Status & Reliability Score
     */
    public function updateWorkerStatus(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'status' => 'required|in:active,restricted,blocked',
            'attendance_score' => 'nullable|numeric|min:0|max:100',
        ]);

        $worker = Worker::find($validated['worker_id']);
        $worker->status = $validated['status'];
        if (isset($validated['attendance_score'])) {
            $worker->attendance_score = (float) $validated['attendance_score'];
        }
        $worker->save();

        return response()->json([
            'success' => true,
            'message' => "تم تحديث حالة وسجل العامل ({$worker->full_name}) بنجاح!",
            'worker' => $worker,
        ]);
    }

    /**
     * Admin: Register New Factory in 10th of Ramadan
     */
    public function createFactory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'tax_record' => 'required|string|max:50',
            'industrial_zone' => 'required|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $factory = Factory::create([
            'name' => $validated['name'],
            'tax_record' => $validated['tax_record'],
            'industrial_zone' => $validated['industrial_zone'],
            'latitude' => $validated['latitude'] ?? 30.2982,
            'longitude' => $validated['longitude'] ?? 31.7456,
            'status' => 'verified',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل المنشأة الصناعية بنجاح ضمن شبكة مصانع العاشر!',
            'factory' => $factory,
        ]);
    }

    /**
     * Factory Management Portal Login
     */
    public function loginFactory(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $factory = Factory::where('manager_email', $validated['email'])
            ->orWhere('tax_record', $validated['email'])
            ->first();

        if (!$factory) {
            return response()->json([
                'success' => false,
                'message' => 'البريد الإلكتروني أو السجل الصناعي غير مسجل لدينا في مصانع العاشر',
            ], 404);
        }

        if ($factory->manager_password && $factory->manager_password !== $validated['password']) {
            return response()->json([
                'success' => false,
                'message' => 'كلمة المرور غير صحيحة',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => "مرحباً بكم، تم تسجيل الدخول لإدارة مصنع ({$factory->name})",
            'factory' => $factory,
        ]);
    }

    /**
     * Factory Gate Security Login
     */
    public function loginGate(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $factory = Factory::where('gate_email', $validated['email'])->first();

        if (!$factory) {
            return response()->json([
                'success' => false,
                'message' => 'بريد البوابة غير مسجل لأي مصنع بالعاشر من رمضان',
            ], 404);
        }

        if ($factory->gate_password && $factory->gate_password !== $validated['password']) {
            return response()->json([
                'success' => false,
                'message' => 'كلمة المرور الخاصة ببوابة الأمن غير صحيحة',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => "تم تسجيل دخول أمن ({$factory->gate_name}) لمصنع ({$factory->name}) بنجاح",
            'factory' => $factory,
        ]);
    }

    /**
     * Submit Gate Security Report to Factory Management
     */
    public function submitGateReport(Request $request)
    {
        $validated = $request->validate([
            'factory_id' => 'required|exists:factories,id',
            'report_title' => 'required|string|max:150',
            'report_date' => 'required|date',
            'security_officer_name' => 'nullable|string|max:100',
            'total_attended' => 'required|integer|min:0',
            'total_absent' => 'required|integer|min:0',
            'workers_summary' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $report = GateReport::create([
            'factory_id' => $validated['factory_id'],
            'report_title' => $validated['report_title'],
            'report_date' => $validated['report_date'],
            'security_officer_name' => $validated['security_officer_name'] ?? 'مسؤول أمن الوردية',
            'total_attended' => $validated['total_attended'],
            'total_absent' => $validated['total_absent'],
            'workers_summary' => $validated['workers_summary'] ?? [],
            'notes' => $validated['notes'] ?? 'تم فحص جميع العمال ومطابقة بطاقات الرقم القومي وكود الحضور بنجاح.',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفع التقرير الأمني اليومي بنجاح وإرساله لإدارة المصنع!',
            'report' => $report->load('factory'),
        ]);
    }
}

