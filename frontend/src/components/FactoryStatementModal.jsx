'use client';

import React from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export function FactoryStatementModal({
  isOpen,
  onClose,
  factory,
  shifts = [],
  bookings = [],
  workers = [],
}) {
  if (!isOpen || !factory) return null;

  const factoryShifts = shifts.filter((s) => s.factory_id === factory.id);
  const factoryShiftIds = factoryShifts.map((s) => s.id);
  const factoryBookings = bookings.filter((b) => factoryShiftIds.includes(b.shift_id));
  const attendedBookings = factoryBookings.filter((b) => b.status === 'attended');

  // Financial calculations
  const totalWorkerWages = attendedBookings.reduce((acc, b) => {
    const shift = shifts.find((s) => s.id === b.shift_id);
    const overtimeBonus = b.overtime_hours
      ? Math.round(((shift?.worker_wage || 380) / 8) * 1.5 * b.overtime_hours)
      : 0;
    return acc + (shift?.worker_wage || 380) + overtimeBonus;
  }, 0);

  const platformCommissionRate = 50; // 50 EGP per attended worker
  const totalPlatformCommission = attendedBookings.length * platformCommissionRate;
  const totalInvoiceAmount = totalWorkerWages + totalPlatformCommission;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['م', 'الوردية', 'اسم العامل', 'الرقم القومي', 'تاريخ العمل', 'ساعات الأوفر تايم', 'يومية العامل', 'رسوم الخدمة', 'الإجمالي'];
    const rows = attendedBookings.map((b, idx) => {
      const shift = shifts.find((s) => s.id === b.shift_id);
      const worker = workers.find((w) => w.id === b.worker_id);
      const overtimeBonus = b.overtime_hours
        ? Math.round(((shift?.worker_wage || 380) / 8) * 1.5 * b.overtime_hours)
        : 0;
      const workerTotal = (shift?.worker_wage || 380) + overtimeBonus;
      return [
        idx + 1,
        `"${shift?.title || ''}"`,
        `"${worker?.full_name || ''}"`,
        `"${worker?.national_id || ''}"`,
        shift?.shift_date || '',
        b.overtime_hours || 0,
        workerTotal,
        platformCommissionRate,
        workerTotal + platformCommissionRate,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `فاتورة_${factory.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-['Cairo',sans-serif] overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-slate-200 print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:m-0">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                فاتورة ومطالبة مالية معتمدة: {factory.name}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">سجل صناعي: {factory.tax_record}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-green-700" />
              <span className="hidden sm:inline">Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة فاتورة A4 رسمية</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable & Responsive Invoice Body (Spans Full A4 Sheet) */}
        <div className="printable-document p-6 sm:p-8 space-y-6 text-slate-900 max-h-[82vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible print:space-y-6">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between text-black">
            <div className="text-right space-y-1">
              <div className="font-bold text-xs text-slate-700">جمهورية مصر العربية</div>
              <div className="font-black text-sm text-green-900">
                منظومة تشغيل وإدارة العمالة الصناعية "وردية"
              </div>
              <div className="text-xs text-slate-700">جهاز تنمية مدينة العاشر من رمضان - محافظة الشرقية</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl mx-auto mb-1 print:border print:border-black">
                و
              </div>
              <span className="text-xs font-black text-slate-900 border border-slate-800 px-3 py-0.5 rounded-full inline-block">
                فاتورة تشغيل معتمدة
              </span>
            </div>

            <div className="text-left space-y-1 text-xs text-slate-800 font-mono">
              <div>
                تاريخ الإصدار: <strong>{new Date().toLocaleDateString('ar-EG')}</strong>
              </div>
              <div>
                رقم الفاتورة: <strong className="text-slate-950 font-black">INV-10R-{factory.id}-{new Date().getFullYear()}</strong>
              </div>
              <div>الحالة: <span className="text-amber-800 font-black">مستحقة السداد</span></div>
            </div>
          </div>

          {/* Factory Info & Total Due Banner */}
          <div className="border border-slate-300 p-4 rounded-xl text-xs flex items-center justify-between bg-slate-50 print:bg-white print:border-slate-800">
            <div>
              <span className="text-slate-600 text-xs font-bold block mb-0.5">المنشأة الصناعية المستفيدة:</span>
              <h2 className="text-base font-black text-slate-950 leading-snug">
                {factory.name}
              </h2>
              <div className="text-xs text-slate-700 mt-1 flex items-center gap-3">
                <span>المنطقة: <strong>{factory.industrial_zone}</strong></span>
                <span>•</span>
                <span className="font-mono">السجل الصناعي: <strong>{factory.tax_record}</strong></span>
              </div>
            </div>

            <div className="border border-green-800 rounded-xl p-3 text-left shrink-0 bg-white print:border-slate-800">
              <span className="text-xs text-slate-600 font-bold block mb-0.5">إجمالي المبلغ المطلوب سداده:</span>
              <div className="text-2xl font-black text-green-950 font-mono leading-none">
                {totalInvoiceAmount.toLocaleString('ar-EG')}{' '}
                <span className="text-xs font-bold text-slate-700">ج.م</span>
              </div>
              <span className="text-[10px] text-green-800 font-bold mt-1 block">
                شامل أجور العمال وعمولة المنظومة
              </span>
            </div>
          </div>

          {/* 3 Metric Summary Boxes */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-slate-300 rounded-xl p-3 bg-white text-center">
              <span className="text-xs text-slate-600 font-bold block mb-0.5">العمال المشغلين فعلياً</span>
              <div className="text-xl font-black text-slate-950 font-mono">
                {attendedBookings.length} <span className="text-xs text-slate-500 font-bold">عامل</span>
              </div>
              <span className="text-[10px] text-green-800 font-bold mt-0.5 block">
                تم مسح أكوادهم بالبوابة
              </span>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 bg-white text-center">
              <span className="text-xs text-slate-600 font-bold block mb-0.5">صافي يوميات العمال</span>
              <div className="text-xl font-black text-slate-950 font-mono">
                {totalWorkerWages.toLocaleString('ar-EG')}{' '}
                <span className="text-xs text-slate-500 font-bold">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-600 mt-0.5 block">شامل ساعات الإضافي</span>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 bg-white text-center">
              <span className="text-xs text-slate-600 font-bold block mb-0.5">رسوم تشغيل وردية</span>
              <div className="text-xl font-black text-slate-950 font-mono">
                {totalPlatformCommission.toLocaleString('ar-EG')}{' '}
                <span className="text-xs text-slate-500 font-bold">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-600 mt-0.5 block">50 ج.م / عامل</span>
            </div>
          </div>

          {/* Breakdown Section: Desktop Table + Mobile Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <h4 className="font-black text-sm text-slate-950">
                بيان مفصل بتشغيل العمال والورديات ({attendedBookings.length}):
              </h4>
            </div>

            {/* Mobile View: Clean Responsive Cards (sm:hidden) */}
            <div className="sm:hidden space-y-2.5 print:hidden">
              {attendedBookings.length > 0 ? (
                attendedBookings.map((b, idx) => {
                  const shift = shifts.find((s) => s.id === b.shift_id);
                  const worker = workers.find((w) => w.id === b.worker_id);
                  const overtimeBonus = b.overtime_hours
                    ? Math.round(((shift?.worker_wage || 380) / 8) * 1.5 * b.overtime_hours)
                    : 0;
                  const wage = (shift?.worker_wage || 380) + overtimeBonus;
                  const totalLine = wage + platformCommissionRate;

                  return (
                    <div
                      key={b.id}
                      className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-slate-900">{worker?.full_name}</div>
                        <span className="font-mono font-black text-green-800">{totalLine} ج.م</span>
                      </div>
                      <div className="text-[11px] text-slate-600">{shift?.title}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">لا توجد ورديات منفذة حالياً</div>
              )}
            </div>

            {/* Desktop Table (Full Width and Crisp on Print) */}
            <div className="hidden sm:block print:block border border-slate-800 rounded-none overflow-hidden">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-800">
                  <tr>
                    <th className="p-2 border-l border-slate-400 text-center w-8">م</th>
                    <th className="p-2 border-l border-slate-400">اسم العامل</th>
                    <th className="p-2 border-l border-slate-400 text-center">الرقم القومي</th>
                    <th className="p-2 border-l border-slate-400">الوردية</th>
                    <th className="p-2 border-l border-slate-400 text-center">وقت الحضور</th>
                    <th className="p-2 border-l border-slate-400 text-center">أوفر تايم</th>
                    <th className="p-2 border-l border-slate-400 text-center">يومية العامل</th>
                    <th className="p-2 border-l border-slate-400 text-center">رسوم وردية</th>
                    <th className="p-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-900 font-medium">
                  {attendedBookings.length > 0 ? (
                    attendedBookings.map((b, idx) => {
                      const shift = shifts.find((s) => s.id === b.shift_id);
                      const worker = workers.find((w) => w.id === b.worker_id);
                      const overtimeBonus = b.overtime_hours
                        ? Math.round(((shift?.worker_wage || 380) / 8) * 1.5 * b.overtime_hours)
                        : 0;
                      const wage = (shift?.worker_wage || 380) + overtimeBonus;

                      return (
                        <tr key={b.id} className="border-b border-slate-300">
                          <td className="p-2.5 border-l border-slate-300 font-mono text-center font-bold">{idx + 1}</td>
                          <td className="p-2.5 border-l border-slate-300 font-extrabold text-slate-950">{worker?.full_name}</td>
                          <td className="p-2.5 border-l border-slate-300 font-mono text-center">{worker?.national_id}</td>
                          <td className="p-2.5 border-l border-slate-300 text-xs text-slate-800">{shift?.title}</td>
                          <td className="p-2.5 border-l border-slate-300 font-mono text-center font-bold text-slate-900">
                            {b.check_in_at ? new Date(b.check_in_at).toLocaleTimeString('ar-EG') : '—'}
                          </td>
                          <td className="p-2.5 border-l border-slate-300 font-mono text-center">{b.overtime_hours ? `${b.overtime_hours} س` : '0'}</td>
                          <td className="p-2.5 border-l border-slate-300 font-mono text-center font-bold text-slate-900">{wage} ج.م</td>
                          <td className="p-2.5 border-l border-slate-300 font-mono text-center text-slate-800">{platformCommissionRate} ج.م</td>
                          <td className="p-2.5 text-center font-mono font-black text-green-950">
                            {wage + platformCommissionRate} ج.م
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 font-bold">
                        لا توجد ورديات منفذة بحضور مسجل لهذا المصنع حتى الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bank Transfer Instructions */}
          <div className="border border-slate-300 bg-slate-50 print:bg-white p-3.5 rounded-xl text-xs space-y-1">
            <div className="font-black text-slate-950 flex items-center gap-1.5">
              <span>بيانات السداد والتحويل البنكي الرسمي:</span>
            </div>
            <p className="text-slate-800 text-xs leading-relaxed">
              يُرجى سداد المبلغ لصالح <strong>"شركة وردية لتشغيل العمالة الصناعية"</strong>: البنك الأهلي المصري - فرع العاشر من رمضان - رقم الحساب: <span className="font-mono font-bold text-black">100234567890123</span> أو عبر التحويل اللحظي للمنشآت (InstaPay Corporate).
            </p>
          </div>

          {/* Official Signatures (Full Width at bottom of sheet) */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs print-avoid-break">
            <div className="border border-slate-400 p-4 rounded-lg space-y-8 bg-white">
              <div className="font-bold text-slate-800">إعداد الحسابات والماليات</div>
              <div className="text-xs text-slate-500">التوقيع: ............................</div>
            </div>

            <div className="border-2 border-dashed border-slate-500 p-4 rounded-lg flex flex-col items-center justify-center bg-white">
              <div className="font-black text-slate-950 text-xs mb-1">خاتم الشركة المعتمد</div>
              <div className="text-xs text-green-900 font-bold">وردية - العاشر من رمضان</div>
            </div>

            <div className="border border-slate-400 p-4 rounded-lg space-y-8 bg-white">
              <div className="font-bold text-slate-800">استلام وموافقة المصنع</div>
              <div className="text-xs text-slate-500">التوقيع: ............................</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
