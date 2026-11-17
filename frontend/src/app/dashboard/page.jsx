'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  ArrowLeft,
  X,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { loadState, createShift, TENTH_OF_RAMADAN_ZONES } from '@/lib/store';

export default function DashboardPage() {
  const [state, setState] = useState(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New shift form state
  const [selectedFactoryId, setSelectedFactoryId] = useState(1);
  const [title, setTitle] = useState('');
  const [wage, setWage] = useState('380');
  const [slots, setSlots] = useState('15');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [transitStop, setTransitStop] = useState('موقف الأردنية');

  const refresh = () => {
    setState(loadState());
  };

  useEffect(() => {
    refresh();
    window.addEventListener('wardia_state_changed', refresh);
    return () => window.removeEventListener('wardia_state_changed', refresh);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">
        جاري تحميل لوحة التحكم...
      </div>
    );
  }

  // Filtered shifts
  const filteredShifts = state.shifts.filter((shift) => {
    if (selectedZone === 'all') return true;
    const factory = state.factories.find((f) => f.id === shift.factory_id);
    return factory?.industrial_zone === selectedZone;
  });

  const totalSlotsNeeded = state.shifts.reduce((acc, s) => acc + s.slots_needed, 0);
  const totalSlotsFilled = state.shifts.reduce((acc, s) => acc + s.slots_filled, 0);
  const attendedCount = state.bookings.filter((b) => b.status === 'attended').length;
  const totalWages = state.shifts.reduce((acc, s) => acc + s.slots_filled * s.worker_wage, 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createShift({
      factory_id: Number(selectedFactoryId),
      title,
      description: `تشمل وجبة ومواصلات من ${transitStop}.`,
      shift_date: new Date().toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      worker_wage: parseFloat(wage) || 380,
      service_fee: 50,
      slots_needed: parseInt(slots, 10) || 10,
      status: 'open',
    });

    refresh();
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Cairo',sans-serif]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl text-slate-900">
                  لوحة تحكم مصانع العاشر من رمضان
                </h1>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  إدارة العمليات المركزية
                </span>
              </div>
              <p className="text-xs text-slate-500">
                متابعة تشغيل الورديات، إشغال المقاعد، وبوابات الدخول اللحظية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Smartphone className="w-4 h-4 text-green-600" />
              <span>واجهة موبايل العامل</span>
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>نشر وردية جديدة بالعاشر</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* 4 Big KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">مصانع العاشر المعتمدة</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {state.factories.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">موزعة على كافة المناطق الصناعية</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">إجمالي الشواغر والعمال</span>
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {totalSlotsFilled}{' '}
              <span className="text-sm font-bold text-slate-400">/ {totalSlotsNeeded}</span>
            </div>
            <div className="text-xs text-amber-600 font-bold mt-1">
              نسبة التغطية:{' '}
              {totalSlotsNeeded > 0 ? Math.round((totalSlotsFilled / totalSlotsNeeded) * 100) : 0}%
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">الحضور الفعلي للبوابات</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-black text-green-700 font-mono">{attendedCount}</div>
            <div className="text-xs text-green-700 font-bold mt-1">
              تم اعتماد دخولهم عبر مسح الـ QR
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">إجمالي أجور الورديات</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {totalWages.toLocaleString('ar-EG')}{' '}
              <span className="text-sm font-bold text-slate-500">ج.م</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">محسوبة ومقيدة بالدفتر المالي</div>
          </div>
        </div>

        {/* Zone Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-bold shrink-0 ml-2">تصفية حسب المنطقة:</span>
          <button
            onClick={() => setSelectedZone('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedZone === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع مناطق العاشر ({state.shifts.length})
          </button>
          {TENTH_OF_RAMADAN_ZONES.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                selectedZone === zone
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Shifts Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                جدول الورديات النشطة بالعاشر من رمضان
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديث لحظي لعدد العمال المسجلين ونسبة الإشغال
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              {filteredShifts.length} ورديات معروضة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">الوردية والمجال</th>
                  <th className="p-4">المصنع والمنطقة</th>
                  <th className="p-4">المواعيد</th>
                  <th className="p-4">اليومية</th>
                  <th className="p-4">المقاعد والعمال</th>
                  <th className="p-4">حضور البوابة</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredShifts.map((shift) => {
                  const factory = state.factories.find((f) => f.id === shift.factory_id);
                  const shiftBookings = state.bookings.filter((b) => b.shift_id === shift.id);
                  const shiftAttended = shiftBookings.filter((b) => b.status === 'attended');
                  const fillPercent = Math.round((shift.slots_filled / shift.slots_needed) * 100);

                  return (
                    <tr key={shift.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{shift.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {shift.description}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{factory?.name}</div>
                        <div className="text-[11px] text-green-700 font-medium mt-0.5">
                          {factory?.industrial_zone}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        <div>{shift.shift_date}</div>
                        <div className="text-[11px] text-slate-500">
                          {shift.start_time} - {shift.end_time}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <span className="font-black text-green-700 text-sm">
                          {shift.worker_wage} ج.م
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 font-mono">
                            {shift.slots_filled} / {shift.slots_needed}
                          </span>
                          <span className="text-[11px] text-slate-500">({fillPercent}%)</span>
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, fillPercent)}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-blue-600">
                        {shiftAttended.length} عمال
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200">
                          مفتوحة للحجز
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Gate Attendance Feed */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>سجل الحضور الفعلي عبر بوابات العاشر من رمضان</span>
            </h3>
            <span className="text-xs text-slate-500">محدث لحظياً عند مسح رمز الـ QR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.bookings.map((booking) => {
              const worker = state.workers.find((w) => w.id === booking.worker_id);
              const shift = state.shifts.find((s) => s.id === booking.shift_id);
              const factory = state.factories.find((f) => f.id === shift?.factory_id);
              const isAttended = booking.status === 'attended';

              return (
                <div
                  key={booking.id}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{worker?.full_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {shift?.title} • {factory?.name}
                    </div>
                    {booking.check_in_at && (
                      <div className="text-[10px] text-green-700 font-mono font-bold mt-1">
                        وقت الحضور:{' '}
                        {new Date(booking.check_in_at).toLocaleTimeString('ar-EG')}
                      </div>
                    )}
                  </div>

                  <div className="text-left shrink-0">
                    {isAttended ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        حضر بالبوابة
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
                        في انتظار الوصول
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal: Create Shift */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">نشر وردية عمل جديدة بالعاشر</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">المصنع والمنطقة بالعاشر:</label>
                <select
                  value={selectedFactoryId}
                  onChange={(e) => setSelectedFactoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                >
                  {state.factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.industrial_zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">عنوان الوردية:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعبئة وتغليف كرتون - خط إنتاج أ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اليومية (جنيه):</label>
                  <input
                    type="number"
                    required
                    value={wage}
                    onChange={(e) => setWage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-green-700 font-black text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">العدد المطلوب:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">وقت البدء:</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">وقت الانتهاء:</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نقطة تجمع ومواصلات العمال:</label>
                <select
                  value={transitStop}
                  onChange={(e) => setTransitStop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none"
                >
                  <option value="موقف الأردنية">موقف الأردنية (الموقف الرئيسي بالعاشر)</option>
                  <option value="صينية سيتي سنتر">صينية سيتي سنتر</option>
                  <option value="كوبري 54">كوبري 54</option>
                  <option value="موقف الكيلو 4.5">موقف الكيلو 4.5</option>
                  <option value="موقف بلبيس والزقازيق بالعاشر">موقف بلبيس والزقازيق بالعاشر</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-xs"
                >
                  نشر الوردية فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
