<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Factory;
use App\Models\Worker;
use App\Models\Shift;
use App\Models\ShiftBooking;
use App\Models\EarningsLedger;

class WardiaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Factories in 10th of Ramadan
        $factory1 = Factory::create([
            'name' => 'مجموعة الأمل للأجهزة الكهربائية والصناعات الهندسية',
            'tax_record' => 'TR-10R-98214',
            'industrial_zone' => 'المنطقة الصناعية الثالثة (A3/B3)',
            'latitude' => 30.29820000,
            'longitude' => 31.74560000,
            'status' => 'verified',
            'manager_email' => 'manager@amal-group.com',
            'manager_password' => 'amal1234',
            'gate_email' => 'gate@amal-group.com',
            'gate_password' => 'gate1234',
            'gate_name' => 'بوابة أمن الأمل (بوابة رقم 1 - شاحنات وعمال)',
        ]);

        $factory2 = Factory::create([
            'name' => 'الشركة المصرية لصناعات الغزل والنسيج والملابس',
            'tax_record' => 'TR-10R-45129',
            'industrial_zone' => 'المنطقة الصناعية الأولى (A1/B1)',
            'latitude' => 30.30850000,
            'longitude' => 31.72910000,
            'status' => 'verified',
            'manager_email' => 'manager@textile-egypt.com',
            'manager_password' => 'tex1234',
            'gate_email' => 'gate@textile-egypt.com',
            'gate_password' => 'gate1234',
            'gate_name' => 'بوابة أمن النسيج الرئيسية',
        ]);

        $factory3 = Factory::create([
            'name' => 'الشرق الأوسط للصناعات الغذائية والتعبئة والتغليف',
            'tax_record' => 'TR-10R-77310',
            'industrial_zone' => 'منطقة المطورين (CPC / بيراميدز / بولاريس)',
            'latitude' => 30.32240000,
            'longitude' => 31.77120000,
            'status' => 'verified',
            'manager_email' => 'manager@mideast-food.com',
            'manager_password' => 'food1234',
            'gate_email' => 'gate@mideast-food.com',
            'gate_password' => 'gate1234',
            'gate_name' => 'بوابة أمن الأغذية والتعبئة',
        ]);

        $factory4 = Factory::create([
            'name' => 'مصنع الأهرام للكرتون ومستلزمات التعبئة',
            'tax_record' => 'TR-10R-62180',
            'industrial_zone' => 'المنطقة الصناعية الرابعة (A4/B4)',
            'latitude' => 30.28710000,
            'longitude' => 31.75890000,
            'status' => 'verified',
            'manager_email' => 'manager@ahram-carton.com',
            'manager_password' => 'carton1234',
            'gate_email' => 'gate@ahram-carton.com',
            'gate_password' => 'gate1234',
            'gate_name' => 'بوابة أمن الأهرام للكرتون',
        ]);

        $factory5 = Factory::create([
            'name' => 'دلتا مصر للصناعات البلاستيكية والكيماوية',
            'tax_record' => 'TR-10R-33190',
            'industrial_zone' => 'المنطقة الصناعية الثانية (A2/B2)',
            'latitude' => 30.31120000,
            'longitude' => 31.73840000,
            'status' => 'verified',
            'manager_email' => 'manager@delta-plastic.com',
            'manager_password' => 'delta1234',
            'gate_email' => 'gate@delta-plastic.com',
            'gate_password' => 'gate1234',
            'gate_name' => 'بوابة أمن دلتا مصر',
        ]);

        $factory6 = Factory::create([
            'name' => 'ورش ومجمع العاشر للصناعات المغذية والخفيفة',
            'tax_record' => 'TR-10R-11450',
            'industrial_zone' => 'مجمع الصناعات الخفيفة (الـ 71 فدان)',
            'latitude' => 30.28150000,
            'longitude' => 31.72500000,
            'status' => 'verified',
            'manager_email' => 'manager@10th-complex.com',
            'manager_password' => 'complex1234',
            'gate_email' => 'gate@10th-complex.com',
            'gate_password' => 'gate1234',
            'gate_name' => 'بوابة أمن مجمع الـ 71 فدان',
        ]);

        // 2. Workers
        $worker1 = Worker::create([
            'full_name' => 'إسلام فتحي حسن',
            'phone' => '01012345678',
            'national_id' => '29801011234567',
            'meeza_card_number' => '5078021489654219',
            'meeza_bank_name' => 'كارت ميزة - البريد المصري',
            'wallet_balance' => 1450.00,
            'attendance_score' => 99.00,
            'status' => 'active',
        ]);

        $worker2 = Worker::create([
            'full_name' => 'أحمد محمود عبد الرحمن',
            'phone' => '01123456789',
            'national_id' => '29505051234568',
            'meeza_card_number' => null,
            'meeza_bank_name' => null,
            'wallet_balance' => 900.00,
            'attendance_score' => 95.00,
            'status' => 'active',
        ]);

        $worker3 = Worker::create([
            'full_name' => 'محمود جابر السيد',
            'phone' => '01234567890',
            'national_id' => '29910101234569',
            'meeza_card_number' => '5078129845321088',
            'meeza_bank_name' => 'كارت ميزة - البنك الأهلي المصري',
            'wallet_balance' => 2100.00,
            'attendance_score' => 100.00,
            'status' => 'active',
        ]);

        // 3. Shifts in 10th of Ramadan
        $shift1 = Shift::create([
            'factory_id' => $factory1->id,
            'title' => 'تجميع وتعبئة شاشات وأجهزة منزلية',
            'description' => 'تشمل وجبة ساخنة ومواصلات من موقف الأردنية وصينية سيتي سنتر.',
            'shift_date' => date('Y-m-d'),
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'worker_wage' => 380.00,
            'service_fee' => 50.00,
            'slots_needed' => 25,
            'slots_filled' => 21,
            'status' => 'open',
        ]);

        $shift2 = Shift::create([
            'factory_id' => $factory2->id,
            'title' => 'فرز وتطبيق أقمشة وملابس جاهزة',
            'description' => 'نوفر أتوبيسات من كوبري 54 وموقف بلبيس.',
            'shift_date' => date('Y-m-d'),
            'start_time' => '16:00:00',
            'end_time' => '00:00:00',
            'worker_wage' => 420.00,
            'service_fee' => 50.00,
            'slots_needed' => 15,
            'slots_filled' => 7,
            'status' => 'open',
        ]);

        $shift3 = Shift::create([
            'factory_id' => $factory3->id,
            'title' => 'تعبئة وتغليف خطوط بسكويت وحلويات',
            'description' => 'مواصلات من صينية العاشر وموقف الأردنية.',
            'shift_date' => date('Y-m-d'),
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'worker_wage' => 360.00,
            'service_fee' => 50.00,
            'slots_needed' => 20,
            'slots_filled' => 12,
            'status' => 'open',
        ]);

        // 4. Booking & Ledger
        $booking1 = ShiftBooking::create([
            'shift_id' => $shift1->id,
            'worker_id' => $worker1->id,
            'status' => 'booked',
        ]);

        EarningsLedger::create([
            'worker_id' => $worker1->id,
            'shift_booking_id' => $booking1->id,
            'transaction_type' => 'EARNED',
            'amount' => 380.00,
            'notes' => 'يومية حضور معتمد وردية تجميع أجهزة - العاشر من رمضان',
        ]);
    }
}
