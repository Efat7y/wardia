'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  UserX,
  CreditCard,
  Phone,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { updateWorkerStatus } from '@/lib/store';

export function WorkerDossierModal({
  isOpen,
  onClose,
  worker,
  bookings = [],
  shifts = [],
  factories = [],
  ledger = [],
  onWorkerUpdated,
}) {
  const [selectedStatus, setSelectedStatus] = useState(worker?.status || 'active');
  const [scoreInput, setScoreInput] = useState(worker?.attendance_score || 100);
  const [actionMsg, setActionMsg] = useState(null);

  if (!isOpen || !worker) return null;

  const workerBookings = bookings.filter((b) => b.worker_id === worker.id);
  const workerLedger = ledger.filter((l) => l.worker_id === worker.id);

  const attendedBookings = workerBookings.filter((b) => b.status === 'attended');
  const totalWagesEarned = workerLedger
    .filter((l) => l.amount > 0)
    .reduce((acc, l) => acc + l.amount, 0);

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    const res = updateWorkerStatus(worker.id, selectedStatus, scoreInput);
    setActionMsg(res.message);
    if (onWorkerUpdated) onWorkerUpdated();
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-['Cairo',sans-serif] overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-slate-200 print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:m-0">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                ملف وسجل العامل: {worker.full_name}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">رقم قومي: {worker.national_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة بيان حالة (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable & Responsive Content */}
        <div className="printable-document p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible text-slate-900 print:space-y-6">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-right space-y-0.5">
              <div className="font-bold text-[11px] text-slate-500">جمهورية مصر العربية</div>
              <div className="font-extrabold text-xs text-green-800">
                منظومة تشغيل وإدارة العمالة الصناعية "وردية"
              </div>
              <div className="text-[11px] text-slate-500">جهاز تنمية مدينة العاشر من رمضان - محافظة الشرقية</div>
            </div>

            <div className="text-center hidden sm:block">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black mx-auto mb-1">
                و
              </div>
              <span className="text-[10px] bg-green-50 text-green-800 border border-green-200 font-bold px-2 py-0.5 rounded-full">
                بيان حالة وسجل أمني معتمد
              </span>
            </div>

            <div className="text-right sm:text-left space-y-0.5 text-xs text-slate-600 font-mono">
              <div>
                تاريخ الاستخراج: <strong>{new Date().toLocaleDateString('ar-EG')}</strong>
              </div>
              <div>
                رقم الملف: <strong className="text-slate-900">W-DOS-{worker.id}</strong>
              </div>
              <div>الحالة: <span className="text-green-700 font-bold">مصرح له بالعمل</span></div>
            </div>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Identity Info */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">الاسم بالكامل:</span>
              <div className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{worker.full_name}</span>
                <BadgeCheck className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-xs text-slate-700 font-mono pt-1">
                الرقم القومي: <strong>{worker.national_id}</strong>
              </div>
              <div className="text-xs text-slate-700 font-mono">
                الموبايل / كاش: <strong>{worker.phone}</strong>
              </div>
            </div>

            {/* Financial & Meeza Status */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">الماليات والوسائل:</span>
              <div className="text-xs text-slate-800">
                كارت ميزة: {worker.meeza_card_number ? (
                  <strong className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    •••• {worker.meeza_card_number.slice(-4)} ({worker.meeza_bank_name || 'البريد'})
                  </strong>
                ) : (
                  <span className="text-slate-400">محفظة كاش بالموبايل</span>
                )}
              </div>
              <div className="text-xs text-slate-700 pt-1">
                إجمالي اليوميات المستلمة: <strong className="text-green-800 font-mono">{totalWagesEarned} ج.م</strong>
              </div>
              <div className="text-xs text-slate-700">
                الرصيد المتاح للسحب: <strong className="text-slate-900 font-mono">{worker.wallet_balance || 0} ج.م</strong>
              </div>
            </div>

            {/* Reliability Rating */}
            <div className="space-y-1 sm:text-left">
              <span className="text-[11px] text-slate-500 font-bold block">تقييم الانضباط الأمني:</span>
              <div className="text-2xl font-black text-green-700 font-mono leading-none">
                {worker.attendance_score}%
              </div>
              <div className="text-xs font-bold pt-1">
                {worker.status === 'active' && (
                  <span className="text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full inline-block">
                    نشط ومصرح له بالدخول ✓
                  </span>
                )}
                {worker.status === 'restricted' && (
                  <span className="text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block">
                    حساب مقيد مؤقتاً ⚠️
                  </span>
                )}
                {worker.status === 'blocked' && (
                  <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full inline-block">
                    محظور أمنياً ⛔
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                حضر <strong>{attendedBookings.length}</strong> من أصل <strong>{workerBookings.length}</strong> وردية
              </div>
            </div>
          </div>

          {/* National ID Photos */}
          {(worker.id_card_front || worker.id_card_back) && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">صور بطاقة الرقم القومي المرفوعة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {worker.id_card_front && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">وجه البطاقة (الاسم والصورة)</span>
                    <img src={worker.id_card_front} alt="وجه البطاقة" className="w-full h-32 object-contain rounded-xl" />
                  </div>
                )}
                {worker.id_card_back && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">ظهر البطاقة (المهنة والعنوان)</span>
                    <img src={worker.id_card_back} alt="ظهر البطاقة" className="w-full h-32 object-contain rounded-xl" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Shift Work History */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm">
              سجل الورديات ومصانع العاشر من رمضان التي عمل بها ({workerBookings.length}):
            </h4>

            {/* Mobile View: Clean Cards (sm:hidden) */}
            <div className="sm:hidden space-y-2.5">
              {workerBookings.length > 0 ? (
                workerBookings.map((b, idx) => {
                  const shift = shifts.find((s) => s.id === b.shift_id);
                  const factory = factories.find((f) => f.id === shift?.factory_id);

                  return (
                    <div
                      key={b.id}
                      className="border border-slate-200 rounded-2xl p-3 bg-slate-50/60 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900">{shift?.title || 'وردية صناعية'}</div>
                          <div className="text-[11px] text-slate-600">{factory?.name} ({factory?.industrial_zone})</div>
                        </div>
                        <span className="font-mono font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-lg text-xs">
                          {shift?.worker_wage || 380} ج.م
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-100">
                        <span>التاريخ: {shift?.shift_date || 'اليوم'}</span>
                        <span>دخول: {b.check_in_at ? new Date(b.check_in_at).toLocaleTimeString('ar-EG') : 'لم يسجل'}</span>
                        <span className="font-bold">
                          {b.status === 'attended' ? 'حضر ✓' : b.status === 'no_show' ? 'غياب ✗' : 'حجز'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  لا توجد ورديات سابقة مسجلة لهذا العامل بعد.
                </div>
              )}
            </div>

            {/* Desktop View: Full Table (hidden sm:block) */}
            <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">م</th>
                    <th className="p-3">الوردية</th>
                    <th className="p-3">المصنع والمنطقة</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">الدخول</th>
                    <th className="p-3">الانصراف</th>
                    <th className="p-3">أوفر تايم</th>
                    <th className="p-3">اليومية</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {workerBookings.length > 0 ? (
                    workerBookings.map((b, idx) => {
                      const shift = shifts.find((s) => s.id === b.shift_id);
                      const factory = factories.find((f) => f.id === shift?.factory_id);

                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{shift?.title || 'وردية صناعية'}</td>
                          <td className="p-3">
                            <div className="font-bold">{factory?.name || 'مصنع معتمد'}</div>
                            <div className="text-[10px] text-slate-500">{factory?.industrial_zone}</div>
                          </td>
                          <td className="p-3 font-mono">{shift?.shift_date || 'اليوم'}</td>
                          <td className="p-3 font-mono text-green-700 font-bold">
                            {b.check_in_at ? new Date(b.check_in_at).toLocaleTimeString('ar-EG') : '—'}
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {b.check_out_at ? new Date(b.check_out_at).toLocaleTimeString('ar-EG') : '—'}
                          </td>
                          <td className="p-3 font-mono">{b.overtime_hours ? `${b.overtime_hours} س` : '0'}</td>
                          <td className="p-3 font-mono font-bold text-green-800">{shift?.worker_wage || 380} ج.م</td>
                          <td className="p-3 font-bold">
                            {b.status === 'attended' ? (
                              <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded">حضر ✓</span>
                            ) : b.status === 'no_show' ? (
                              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">غياب ✗</span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">حجز</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        لا توجد ورديات سابقة مسجلة لهذا العامل بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures (Crisp on Print) */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-bold text-slate-600 mb-8 sm:mb-10">مسؤول الموارد البشرية والعمليات:</div>
              <div className="font-bold text-slate-900 border-t border-dotted border-slate-400 pt-1">
                إدارة تشغيل وردية
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-600 mb-8 sm:mb-10">خاتم المنظومة المعتمد:</div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-green-800 mx-auto flex items-center justify-center text-[9px] font-black text-green-800">
                وردية - العاشر
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-600 mb-8 sm:mb-10">اعتماد أمن المنشآت:</div>
              <div className="font-bold text-slate-900 border-t border-dotted border-slate-400 pt-1">
                الأمن الصناعي
              </div>
            </div>
          </div>

          {/* Admin Management Controls (Hidden on Print) */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-3.5 print:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h4 className="font-extrabold text-xs sm:text-sm text-white">
                تعديل حالة العامل (صلاحيات الإدارة):
              </h4>
            </div>

            <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الحالة الأمنية للعامل:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                >
                  <option value="active">نشط (مصرح له بالدخول والعمل)</option>
                  <option value="restricted">مقيد (تجميد الحجز مؤقتاً)</option>
                  <option value="blocked">محظور (ممنوع من دخول المصانع نهائياً)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">تقييم الانضباط (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition active:scale-95 shadow-sm"
                >
                  حفظ تعديل ملف العامل
                </button>
              </div>
            </form>

            {actionMsg && (
              <div className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-2.5 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
