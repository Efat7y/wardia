'use client';

import { verifyGeofence } from './geo';
import { verifyDynamicQrToken } from './crypto';

// API Base URL (defaults to same host on port 8000 for LAN / Phone testing)
export const API_BASE =
  typeof window !== 'undefined' && window.location.hostname
    ? `http://${window.location.hostname}:8000/api/v1`
    : 'http://localhost:8000/api/v1';

// Zones of 10th of Ramadan City:
export const TENTH_OF_RAMADAN_ZONES = [
  'المنطقة الصناعية الأولى (A1/B1)',
  'المنطقة الصناعية الثانية (A2/B2)',
  'المنطقة الصناعية الثالثة (A3/B3)',
  'المنطقة الصناعية الرابعة (A4/B4)',
  'منطقة المطورين (CPC / بيراميدز / بولاريس)',
  'مجمع الصناعات الخفيفة (الـ 71 فدان)',
];

// Factories based exclusively in 10th of Ramadan City
const INITIAL_FACTORIES = [
  {
    id: 1,
    name: 'مجموعة الأمل للأجهزة الكهربائية والصناعات الهندسية',
    tax_record: 'TR-10R-98214',
    industrial_zone: 'المنطقة الصناعية الثالثة (A3/B3)',
    latitude: 30.2982,
    longitude: 31.7456,
    status: 'verified',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 2,
    name: 'الشركة المصرية لصناعات الغزل والنسيج والملابس',
    tax_record: 'TR-10R-45129',
    industrial_zone: 'المنطقة الصناعية الأولى (A1/B1)',
    latitude: 30.3085,
    longitude: 31.7291,
    status: 'verified',
    created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 3,
    name: 'الشرق الأوسط للصناعات الغذائية والتعبئة والتغليف',
    tax_record: 'TR-10R-77310',
    industrial_zone: 'منطقة المطورين (CPC / بيراميدز / بولاريس)',
    latitude: 30.3224,
    longitude: 31.7712,
    status: 'verified',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 4,
    name: 'مصنع الأهرام للكرتون ومستلزمات التعبئة',
    tax_record: 'TR-10R-62180',
    industrial_zone: 'المنطقة الصناعية الرابعة (A4/B4)',
    latitude: 30.2871,
    longitude: 31.7589,
    status: 'verified',
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 5,
    name: 'دلتا مصر للصناعات البلاستيكية والكيماوية',
    tax_record: 'TR-10R-33190',
    industrial_zone: 'المنطقة الصناعية الثانية (A2/B2)',
    latitude: 30.3112,
    longitude: 31.7384,
    status: 'verified',
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 6,
    name: 'ورش ومجمع العاشر للصناعات المغذية والخفيفة',
    tax_record: 'TR-10R-11450',
    industrial_zone: 'مجمع الصناعات الخفيفة (الـ 71 فدان)',
    latitude: 30.2815,
    longitude: 31.725,
    status: 'verified',
    created_at: '2026-03-20T10:00:00Z',
  },
];

const INITIAL_WORKERS = [
  {
    id: 1,
    full_name: 'إسلام فتحي حسن',
    phone: '01012345678',
    national_id: '29801011234567',
    meeza_card_number: '5078021489654219',
    meeza_bank_name: 'كارت ميزة - البريد المصري',
    attendance_score: 99.0,
    status: 'active',
    wallet_balance: 1450.0,
    created_at: '2026-01-01T12:00:00Z',
  },
  {
    id: 2,
    full_name: 'أحمد محمود عبد الرحمن',
    phone: '01123456789',
    national_id: '29505051234568',
    meeza_card_number: null,
    meeza_bank_name: null,
    attendance_score: 95.0,
    status: 'active',
    wallet_balance: 900.0,
    created_at: '2026-01-05T12:00:00Z',
  },
  {
    id: 3,
    full_name: 'محمود جابر السيد',
    phone: '01234567890',
    national_id: '29910101234569',
    meeza_card_number: '5078129845321088',
    meeza_bank_name: 'كارت ميزة - البنك الأهلي المصري',
    attendance_score: 100.0,
    status: 'active',
    wallet_balance: 2100.0,
    created_at: '2026-02-01T12:00:00Z',
  },
];

const INITIAL_SHIFTS = [
  {
    id: 1,
    factory_id: 1,
    title: 'تجميع وتعبئة شاشات وأجهزة منزلية',
    description: 'خط إنتاج خفيف وسريع، بيئة عمل مكيفة، تشمل وجبة ساخنة ومواصلات من موقف الأردنية وصينية سيتي سنتر.',
    shift_date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '16:00',
    worker_wage: 380.0,
    service_fee: 50.0,
    slots_needed: 25,
    slots_filled: 21,
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    factory_id: 2,
    title: 'فرز وتطبيق أقمشة وملابس جاهزة',
    description: 'صالة تصدير مريحة، العمل جلوس ووقوف خفيف، نوفر أتوبيسات من كوبري 54 وموقف بلبيس.',
    shift_date: new Date().toISOString().split('T')[0],
    start_time: '16:00',
    end_time: '00:00',
    worker_wage: 420.0,
    service_fee: 50.0,
    slots_needed: 15,
    slots_filled: 7,
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    factory_id: 3,
    title: 'تعبئة وتغليف خطوط بسكويت وحلويات',
    description: 'نظافة تامة واشتراطات سلامة غذائية، توفير وجبة خفيفة ومواصلات من صينية العاشر وموقف الأردنية.',
    shift_date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '16:00',
    worker_wage: 360.0,
    service_fee: 50.0,
    slots_needed: 20,
    slots_filled: 12,
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    factory_id: 4,
    title: 'تشغيل وتفريغ ماكينات قص الكرتون والورق',
    description: 'تطبيق وتجميع الصناديق الكرتونية، إتاحة مكافأة انتظام يومية 50 جنيه فوق اليومية.',
    shift_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '16:00',
    worker_wage: 400.0,
    service_fee: 50.0,
    slots_needed: 12,
    slots_filled: 9,
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    factory_id: 5,
    title: 'فرز حقن بلاستيك وتعبئة قطع سيارات',
    description: 'متابعة ماكينات الحقن وسحب القطع المطابقة للمواصفات، وردية هادئة بمزايا تأمين ووجبة.',
    shift_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '00:00',
    end_time: '08:00',
    worker_wage: 450.0,
    service_fee: 50.0,
    slots_needed: 10,
    slots_filled: 4,
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    factory_id: 6,
    title: 'تحميل وترتيب طرود بمجمع الورش الصغيرة',
    description: 'ترتيب البالتات الخفيفة بالمستودع، يومية سريعة كاش فور انتهاء الوردية.',
    shift_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    worker_wage: 370.0,
    service_fee: 40.0,
    slots_needed: 8,
    slots_filled: 2,
    status: 'open',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_BOOKINGS = [
  {
    id: 1,
    shift_id: 1,
    worker_id: 1,
    status: 'booked',
    check_in_at: null,
    check_out_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    shift_id: 2,
    worker_id: 2,
    status: 'attended',
    check_in_at: new Date(Date.now() - 3600000).toISOString(),
    check_out_at: null,
    verified_by_user_id: 99,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_LEDGER = [
  {
    id: 1,
    worker_id: 1,
    shift_booking_id: 901,
    transaction_type: 'EARNED',
    amount: 380.0,
    notes: 'يومية وردية تجميع أجهزة - المنطقة الصناعية الثالثة بالعاشر',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    shift_title: 'وردية خط تجميع',
  },
  {
    id: 2,
    worker_id: 1,
    shift_booking_id: 902,
    transaction_type: 'EARNED',
    amount: 420.0,
    notes: 'يومية وردية فرز نسيج - المنطقة الصناعية الأولى بالعاشر',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    shift_title: 'وردية فرز وتغليف',
  },
  {
    id: 3,
    worker_id: 1,
    shift_booking_id: 903,
    transaction_type: 'PAYOUT',
    amount: -700.0,
    notes: 'تحويل نقدي لمحفظة فودافون كاش 01012345678',
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
];

const STORAGE_KEY = 'wardia_app_state_10th_ramadan_v1';

export function loadState() {
  if (typeof window === 'undefined') {
    return {
      factories: INITIAL_FACTORIES,
      workers: INITIAL_WORKERS,
      shifts: INITIAL_SHIFTS,
      bookings: INITIAL_BOOKINGS,
      ledger: INITIAL_LEDGER,
      activeWorkerId: 1,
      activeFactoryId: 1,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = {
        factories: INITIAL_FACTORIES,
        workers: INITIAL_WORKERS,
        shifts: INITIAL_SHIFTS,
        bookings: INITIAL_BOOKINGS,
        ledger: INITIAL_LEDGER,
        activeWorkerId: 1,
        activeFactoryId: 1,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    return JSON.parse(raw);
  } catch {
    return {
      factories: INITIAL_FACTORIES,
      workers: INITIAL_WORKERS,
      shifts: INITIAL_SHIFTS,
      bookings: INITIAL_BOOKINGS,
      ledger: INITIAL_LEDGER,
      activeWorkerId: 1,
      activeFactoryId: 1,
    };
  }
}

export function saveState(state) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('wardia_state_changed'));
  }
}

// Background sync with Laravel Backend
export async function syncWithBackend() {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const state = loadState();
        if (data.factories && data.factories.length > 0) state.factories = data.factories;
        if (data.shifts && data.shifts.length > 0) state.shifts = data.shifts;
        if (data.workers && data.workers.length > 0) state.workers = data.workers;
        if (data.bookings) state.bookings = data.bookings;
        if (data.ledger) state.ledger = data.ledger;
        saveState(state);
      }
    }
  } catch {
    // Offline / Fallback
  }
}

// Auto-trigger sync on browser startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncWithBackend();
  }, 200);
}

/**
 * Atomic Shift Booking (Connected to Laravel API + Local State)
 */
export function bookShift(shiftId, workerId) {
  // Fire background API request to Laravel
  fetch(`${API_BASE}/shifts/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shift_id: shiftId, worker_id: workerId }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  // Local immediate update for instant UI response
  const state = loadState();
  const shift = state.shifts.find((s) => s.id === shiftId);
  const worker = state.workers.find((w) => w.id === workerId);

  if (!shift) return { success: false, message: 'الوردية غير موجودة' };
  if (!worker) return { success: false, message: 'بيانات العامل غير موجودة' };

  const existing = state.bookings.find((b) => b.shift_id === shiftId && b.worker_id === workerId);
  if (existing) {
    return { success: false, message: 'أنت حاجز هذه الوردية بالفعل!' };
  }

  if (shift.slots_filled >= shift.slots_needed) {
    return { success: false, message: 'عذراً! اكتمل عدد العمال لهذه الوردية للتو' };
  }

  shift.slots_filled += 1;
  const newBooking = {
    id: Date.now(),
    shift_id: shiftId,
    worker_id: workerId,
    status: 'booked',
    check_in_at: null,
    check_out_at: null,
    created_at: new Date().toISOString(),
  };

  state.bookings.unshift(newBooking);
  saveState(state);

  return {
    success: true,
    message: 'تم تأكيد حجز الوردية بنجاح! كود الحضور جاهز في خانة حجوزاتي.',
    booking: newBooking,
  };
}

/**
 * Gate Supervisor QR Verification & Attendance Check-in
 */
export async function verifyAndCheckIn(
  qrTokenString,
  supervisorLat = 30.2982,
  supervisorLng = 31.7456,
  overrideGeofence = true,
  gateFactoryId = null
) {
  // Check with Laravel Backend first
  try {
    const res = await fetch(`${API_BASE}/gate/verify-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: qrTokenString,
        factory_id: gateFactoryId,
        supervisor_latitude: supervisorLat,
        supervisor_longitude: supervisorLng,
        bypass_geofence: overrideGeofence,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      syncWithBackend();
      return data;
    } else if (data.message) {
      return data;
    }
  } catch {
    // Fallback to local
  }

  const state = loadState();
  const tokenResult = await verifyDynamicQrToken(qrTokenString);
  if (!tokenResult.isValidFormat || !tokenResult.isAuthentic) {
    return {
      success: false,
      message: tokenResult.reason || 'كود الـ QR غير صالح أو منتهي!',
    };
  }

  const booking = state.bookings.find((b) => b.id === tokenResult.bookingId);
  if (!booking) {
    return { success: false, message: 'لا يوجد حجز مسجل لهذا الكود!' };
  }

  const worker = state.workers.find((w) => w.id === booking.worker_id);
  const shift = state.shifts.find((s) => s.id === booking.shift_id);
  const factory = state.factories.find((f) => f.id === shift?.factory_id);

  if (!shift || !factory || !worker) {
    return { success: false, message: 'بيانات الوردية أو المصنع غير مكتملة' };
  }

  // Security Check: Verify that worker belongs to this gate factory
  if (gateFactoryId && Number(gateFactoryId) !== Number(factory.id)) {
    const gateFactory = state.factories.find((f) => f.id === Number(gateFactoryId));
    return {
      success: false,
      message: `⚠️ تنبيه أمني: هذا العامل حجز ورديته في (${factory.name}) وليس في (${gateFactory?.name || 'هذا المصنع'})! يُرجى توجيهه للمصنع الصحيح.`,
      mismatch: true,
      bookedFactoryName: factory.name,
      currentGateFactoryName: gateFactory?.name,
    };
  }

  if (booking.check_in_at) {
    return {
      success: false,
      message: `العامل سجل دخوله مسبقاً في الساعة ${new Date(
        booking.check_in_at
      ).toLocaleTimeString('ar-EG')}`,
      workerName: worker.full_name,
      shiftTitle: shift.title,
      factoryName: factory.name,
    };
  }

  // Record Attendance
  booking.status = 'attended';
  booking.check_in_at = new Date().toISOString();
  booking.verified_by_user_id = 99;

  // Add Earning to Ledger
  const newLedgerEntry = {
    id: Date.now(),
    worker_id: worker.id,
    shift_booking_id: booking.id,
    transaction_type: 'EARNED',
    amount: shift.worker_wage,
    notes: `يومية حضور معتمد: ${shift.title}`,
    created_at: new Date().toISOString(),
    shift_title: shift.title,
  };
  state.ledger.unshift(newLedgerEntry);

  worker.wallet_balance = (worker.wallet_balance || 0) + shift.worker_wage;
  saveState(state);

  return {
    success: true,
    message: `تم تسجيل حضور العامل بنجاح وقيد ${shift.worker_wage} جنيه في حسابه!`,
    workerName: worker.full_name,
    workerNationalId: worker.national_id,
    workerPhone: worker.phone,
    workerIdCardFront: worker.id_card_front,
    workerIdCardBack: worker.id_card_back,
    shiftTitle: shift.title,
    factoryName: factory.name,
  };
}

/**
 * Gate Supervisor Check-Out & Overtime Calculation
 */
export function checkOutWorker(bookingId, overtimeHours = 0) {
  // Fire background API request to Laravel
  fetch(`${API_BASE}/gate/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, overtime_hours: overtimeHours }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'الحجز غير موجود' };
  if (!booking.check_in_at) return { success: false, message: 'العامل لم يسجل دخوله بعد' };
  if (booking.check_out_at) return { success: false, message: 'العامل سجل انصرافه مسبقاً' };

  const worker = state.workers.find((w) => w.id === booking.worker_id);
  const shift = state.shifts.find((s) => s.id === booking.shift_id);
  if (!worker || !shift) return { success: false, message: 'بيانات غير مكتملة' };

  booking.check_out_at = new Date().toISOString();
  booking.overtime_hours = overtimeHours;

  let overtimeBonus = 0;
  if (overtimeHours > 0) {
    const hourlyRate = shift.worker_wage / 8.0;
    overtimeBonus = Math.round(hourlyRate * 1.5 * overtimeHours);

    const overtimeLedgerEntry = {
      id: Date.now(),
      worker_id: worker.id,
      shift_booking_id: booking.id,
      transaction_type: 'EARNED',
      amount: overtimeBonus,
      notes: `بدل ساعات عمل إضافية (${overtimeHours} ساعات أوفر تايم) - ${shift.title}`,
      created_at: new Date().toISOString(),
      shift_title: `أوفر تايم: ${shift.title}`,
    };
    state.ledger.unshift(overtimeLedgerEntry);
    worker.wallet_balance = (worker.wallet_balance || 0) + overtimeBonus;
  }

  saveState(state);

  return {
    success: true,
    message:
      overtimeHours > 0
        ? `تم تسجيل انصراف العامل بنجاح وقيد ${overtimeBonus} جنيه بدل ${overtimeHours} ساعات عمل إضافية!`
        : 'تم تسجيل انصراف العامل بنجاح.',
    workerName: worker.full_name,
    overtimeBonus,
    overtimeHours,
  };
}

/**
 * Gate Supervisor Mark No-Show & Penalty
 */
export function markNoShow(bookingId) {
  // Fire background API request to Laravel
  fetch(`${API_BASE}/gate/no-show`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'الحجز غير موجود' };
  if (booking.check_in_at)
    return { success: false, message: 'العامل سجل حضوره بالفعل ولا يمكن احتسابه غياب' };

  const worker = state.workers.find((w) => w.id === booking.worker_id);
  const shift = state.shifts.find((s) => s.id === booking.shift_id);
  if (!worker || !shift) return { success: false, message: 'بيانات غير مكتملة' };

  booking.status = 'no_show';
  worker.attendance_score = Math.max(0, Math.round((worker.attendance_score - 15) * 10) / 10);

  let warning = 'تم خصم 15 نقطة من تقييم انضباط العامل.';
  if (worker.attendance_score < 70) {
    worker.status = 'restricted';
    warning = 'انخفض تقييم العامل عن 70% وتم تقييد حسابه تلقائياً من حجز ورديات جديدة لمدة أسبوع!';
  }

  saveState(state);

  return {
    success: true,
    message: `تم تسجيل غياب العامل (${worker.full_name}). ${warning}`,
    workerName: worker.full_name,
    newScore: worker.attendance_score,
  };
}

/**
 * Add a new shift (Factory / Admin Portal)
 */
export function createShift(shiftData) {
  const state = loadState();

  // If a new factory name is provided, auto-create the factory in state
  let assignedFactoryId = shiftData.factory_id;
  if (shiftData.factory_name && shiftData.factory_name.trim()) {
    const cleanName = shiftData.factory_name.trim();
    let existingFactory = state.factories.find(
      (f) => f.name.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (!existingFactory) {
      existingFactory = {
        id: Date.now() + 1,
        name: cleanName,
        tax_record: `TR-10R-${Math.floor(10000 + Math.random() * 90000)}`,
        industrial_zone: shiftData.industrial_zone || TENTH_OF_RAMADAN_ZONES[0],
        latitude: 30.2982,
        longitude: 31.7456,
        status: 'verified',
        gate_email: `gate_${Math.floor(100 + Math.random() * 900)}@wardia.eg`,
        gate_password: 'gate1234',
        gate_name: 'البوابة الرئيسية',
        created_at: new Date().toISOString(),
      };
      state.factories.unshift(existingFactory);
    }
    assignedFactoryId = existingFactory.id;
  }

  // Fire background API request to Laravel
  fetch(`${API_BASE}/shifts/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...shiftData,
      factory_id: assignedFactoryId,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const newShift = {
    ...shiftData,
    factory_id: assignedFactoryId,
    id: Date.now(),
    slots_filled: 0,
    created_at: new Date().toISOString(),
  };

  state.shifts.unshift(newShift);
  saveState(state);
  return { success: true, shift: newShift, factoryId: assignedFactoryId };
}

/**
 * Update an existing shift (Factory / Admin Portal)
 */
export function updateShift(shiftId, updatedData) {
  const state = loadState();

  let assignedFactoryId = updatedData.factory_id;
  if (updatedData.factory_name && updatedData.factory_name.trim()) {
    const cleanName = updatedData.factory_name.trim();
    let existingFactory = state.factories.find(
      (f) => f.name.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (!existingFactory) {
      existingFactory = {
        id: Date.now() + 1,
        name: cleanName,
        tax_record: `TR-10R-${Math.floor(10000 + Math.random() * 90000)}`,
        industrial_zone: updatedData.industrial_zone || TENTH_OF_RAMADAN_ZONES[0],
        latitude: 30.2982,
        longitude: 31.7456,
        status: 'verified',
        gate_email: `gate_${Math.floor(100 + Math.random() * 900)}@wardia.eg`,
        gate_password: 'gate1234',
        gate_name: 'البوابة الرئيسية',
        created_at: new Date().toISOString(),
      };
      state.factories.unshift(existingFactory);
    }
    assignedFactoryId = existingFactory.id;
  }

  // Fire background API request to Laravel
  fetch(`${API_BASE}/shifts/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shift_id: shiftId,
      ...updatedData,
      factory_id: assignedFactoryId,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const shiftIndex = state.shifts.findIndex((s) => s.id === shiftId);
  if (shiftIndex !== -1) {
    state.shifts[shiftIndex] = {
      ...state.shifts[shiftIndex],
      ...updatedData,
      factory_id: assignedFactoryId || state.shifts[shiftIndex].factory_id,
    };
    saveState(state);
    return { success: true, message: 'تم تحديث بيانات الوردية بنجاح!', shift: state.shifts[shiftIndex] };
  }

  return { success: false, message: 'الوردية غير موجودة' };
}

/**
 * Delete a shift (Factory / Admin Portal)
 */
export function deleteShift(shiftId) {
  // Fire background API request to Laravel
  fetch(`${API_BASE}/shifts/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shift_id: shiftId }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  state.shifts = state.shifts.filter((s) => s.id !== shiftId);
  // Also clean up any bookings for this shift
  state.bookings = state.bookings.filter((b) => b.shift_id !== shiftId);

  saveState(state);
  return { success: true, message: 'تم حذف الوردية بنجاح!' };
}

/**
 * Worker Login or Registration by National ID + Phone
 */
export function loginOrRegisterWorker(
  fullName,
  nationalId,
  phone,
  idCardFront = null,
  idCardBack = null
) {
  const cleanId = nationalId.trim();
  const cleanPhone = phone.trim();

  // Fire background API request to Laravel
  fetch(`${API_BASE}/workers/login-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: fullName,
      national_id: cleanId,
      phone: cleanPhone,
      id_card_front: idCardFront,
      id_card_back: idCardBack,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  let worker = state.workers.find((w) => w.national_id === cleanId || w.phone === cleanPhone);

  if (worker) {
    if (idCardFront) worker.id_card_front = idCardFront;
    if (idCardBack) worker.id_card_back = idCardBack;
    state.activeWorkerId = worker.id;
    saveState(state);
    return { success: true, message: `أهلاً بك مجدداً يا ${worker.full_name}`, worker };
  }

  const newWorker = {
    id: Date.now(),
    full_name: fullName.trim() || 'عامل جديد',
    national_id: cleanId,
    phone: cleanPhone,
    id_card_front: idCardFront,
    id_card_back: idCardBack,
    meeza_card_number: null,
    meeza_bank_name: null,
    attendance_score: 100.0,
    status: 'active',
    wallet_balance: 0.0,
    created_at: new Date().toISOString(),
  };

  state.workers.push(newWorker);
  state.activeWorkerId = newWorker.id;
  saveState(state);

  return {
    success: true,
    message: 'تم تسجيل بيانات بطاقتك بنجاح وحسابك جاهز لحجز الورديات!',
    worker: newWorker,
  };
}

export function switchActiveWorker(workerId) {
  const state = loadState();
  state.activeWorkerId = workerId;
  saveState(state);
}

/**
 * Link or Update Worker Meeza Card
 */
export function saveWorkerMeezaCard(workerId, cardNumber, bankName) {
  const cleanCard = (cardNumber || '').replace(/\s+/g, '');

  // Fire background API request to Laravel
  fetch(`${API_BASE}/workers/meeza`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      worker_id: workerId,
      card_number: cleanCard,
      bank_name: bankName,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  const worker = state.workers.find((w) => w.id === workerId);
  if (!worker) return { success: false, message: 'العامل غير موجود' };

  if (cleanCard.length !== 16 || !/^\d{16}$/.test(cleanCard)) {
    return { success: false, message: 'رقم كارت ميزة يجب أن يتكون من 16 رقماً بالضبط.' };
  }

  worker.meeza_card_number = cleanCard;
  worker.meeza_bank_name = bankName || 'كارت ميزة وطني';
  saveState(state);

  return {
    success: true,
    message: 'تم ربط وتثبيت كارت ميزة بنجاح وسيكون وسيلة الصرف المعتمدة!',
    worker,
  };
}

/**
 * Execute Worker Payout (Mobile Wallet or Meeza Card)
 */
export function executeWorkerPayout(workerId, amount, method, destination) {
  const numAmount = parseFloat(amount);

  // Fire background API request to Laravel
  fetch(`${API_BASE}/workers/payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      worker_id: workerId,
      amount: numAmount,
      method: method,
      destination: destination,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  const worker = state.workers.find((w) => w.id === workerId);
  if (!worker) return { success: false, message: 'العامل غير موجود' };

  if (isNaN(numAmount) || numAmount <= 0) {
    return { success: false, message: 'يرجى إدخال مبلغ صحيح' };
  }

  if (numAmount > (worker.wallet_balance || 0)) {
    return { success: false, message: 'رصيدك الحالي لا يكفي لهذا المبلغ' };
  }

  const isMeeza = method === 'MEEZA';
  const notes = isMeeza
    ? `تحويل نقدي لحظي لكارت ميزة (${destination}) - متاح للصرف من أي ATM`
    : `تحويل نقدي لمحفظة كاش بالموبايل (${destination})`;

  const newEntry = {
    id: Date.now(),
    worker_id: worker.id,
    shift_booking_id: 0,
    transaction_type: 'PAYOUT',
    payout_method: isMeeza ? 'MEEZA' : 'WALLET',
    amount: -numAmount,
    notes,
    created_at: new Date().toISOString(),
  };

  state.ledger.unshift(newEntry);
  worker.wallet_balance = (worker.wallet_balance || 0) - numAmount;
  saveState(state);

  return {
    success: true,
    message: isMeeza
      ? `تم تحويل ${numAmount} ج.م فورياً إلى كارت ميزة الخاص بك، يمكنك سحب المبلغ الآن من أي ماكينة ATM!`
      : `تم إرسال ${numAmount} ج.م بنجاح إلى محفظة ${destination}`,
    newBalance: worker.wallet_balance,
  };
}

/**
 * Admin: Update Worker Status & Reliability Score
 */
export function updateWorkerStatus(workerId, newStatus, newScore = null) {
  fetch(`${API_BASE}/workers/update-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      worker_id: workerId,
      status: newStatus,
      attendance_score: newScore !== null ? Number(newScore) : undefined,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  const worker = state.workers.find((w) => w.id === workerId);
  if (!worker) return { success: false, message: 'العامل غير موجود' };

  worker.status = newStatus;
  if (newScore !== null && !isNaN(Number(newScore))) {
    worker.attendance_score = Number(newScore);
  }
  saveState(state);

  return {
    success: true,
    message: `تم تحديث حالة العامل (${worker.full_name}) إلى [${newStatus === 'active' ? 'نشط' : newStatus === 'restricted' ? 'مقيد' : 'محظور'}] بنجاح!`,
    worker,
  };
}

/**
 * Admin: Register New Factory in 10th of Ramadan
 */
export function createFactory(factoryData) {
  fetch(`${API_BASE}/factories/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(factoryData),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) syncWithBackend();
    })
    .catch(() => {});

  const state = loadState();
  const newFactory = {
    ...factoryData,
    id: Date.now(),
    status: 'verified',
    created_at: new Date().toISOString(),
  };
  state.factories.unshift(newFactory);
  saveState(state);

  return {
    success: true,
    message: 'تم إضافة المنشأة الصناعية بنجاح!',
    factory: newFactory,
  };
}

/**
 * Factory Management Portal Login
 */
export async function loginFactoryAccount(email, password) {
  try {
    const res = await fetch(`${API_BASE}/factories/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wardia_logged_factory_id', data.factory.id);
      }
      return data;
    }
    return data;
  } catch {
    // Local fallback
    const state = loadState();
    const match = state.factories.find(
      (f) =>
        (f.manager_email && f.manager_email.toLowerCase() === email.toLowerCase()) ||
        (f.tax_record && f.tax_record.toLowerCase() === email.toLowerCase())
    );
    if (!match) {
      return { success: false, message: 'البريد أو السجل غير مسجل لدينا في مصانع العاشر' };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('wardia_logged_factory_id', match.id);
    }
    return {
      success: true,
      message: `مرحباً بكم، تم تسجيل الدخول لمصنع (${match.name})`,
      factory: match,
    };
  }
}

/**
 * Gate Security Portal Login
 */
export async function loginGateAccount(email, password) {
  try {
    const res = await fetch(`${API_BASE}/gate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wardia_logged_gate_factory_id', data.factory.id);
      }
      return data;
    }
    return data;
  } catch {
    // Local fallback
    const state = loadState();
    const match = state.factories.find(
      (f) => f.gate_email && f.gate_email.toLowerCase() === email.toLowerCase()
    );
    if (!match) {
      return { success: false, message: 'بريد البوابة غير مسجل لأي مصنع بالعاشر' };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('wardia_logged_gate_factory_id', match.id);
    }
    return {
      success: true,
      message: `تم تسجيل الدخول لبوابة أمن (${match.name})`,
      factory: match,
    };
  }
}

/**
 * Submit Security Shift Report to Factory Management
 */
export async function submitGateReport(reportData) {
  try {
    const res = await fetch(`${API_BASE}/gate/submit-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      syncWithBackend();
      return data;
    }
    return data;
  } catch {
    // Local fallback
    const state = loadState();
    if (!state.gateReports) state.gateReports = [];
    const newReport = {
      id: Date.now(),
      ...reportData,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };
    state.gateReports.unshift(newReport);
    saveState(state);
    return {
      success: true,
      message: 'تم رفع التقرير الأمني اليومي بنجاح إلى إدارة المصنع!',
      report: newReport,
    };
  }
}

