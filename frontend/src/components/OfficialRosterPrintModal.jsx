'use client';

import React from 'react';
import { Printer, Download, X, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function OfficialRosterPrintModal({ isOpen, onClose, factory, shifts = [], bookings = [], workers = [] }) {
  if (!isOpen) return null;

  const todayDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const factoryShiftIds = shifts.filter((s) => s.factory_id === factory.id).map((s) => s.id);
  const factoryBookings = bookings.filter((b) => factoryShiftIds.includes(b.shift_id));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['م', 'الاسم بالكامل', 'الرقم القومي', 'رقم الهاتف', 'الوردية', 'وقت الدخول', 'وقت الانصراف', 'ساعات الإضافي', 'الحالة'];
    const rows = factoryBookings.map((b, idx) => {
      const worker = workers.find((w) => w.id === b.worker_id);
      const shift = shifts.find((s) => s.id === b.shift_id);
      return [
        idx + 1,
        `"${worker?.full_name || ''}"`,
        `"${worker?.national_id || ''}"`,
        `"${worker?.phone || ''}"`,
        `"${shift?.title || ''}"`,
        b.check_in_at ? new Date(b.check_in_at).toLocaleTimeString('ar-EG') : 'لم يسجل',
        b.check_out_at ? new Date(b.check_out_at).toLocaleTimeString('ar-EG') : 'لم ينصرف بعد',
        b.overtime_hours ? `${b.overtime_hours} س` : '0',
        b.status === 'attended' ? 'حاضر' : b.status === 'no_show' ? 'غياب' : 'حجز مؤكد',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `كشف_أمني_${factory.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-['Cairo',sans-serif] overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-slate-200 print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:m-0">
        
        {/* Modal Action Bar (Hidden during print) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-700" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-800">
              معاينة الكشف الأمني الرسمي: {factory.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-green-700" />
              <span className="hidden sm:inline">Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة كشف A4 رسمي</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area: Fills full A4 page directly */}
        <div className="printable-document p-6 sm:p-8 space-y-6 text-slate-900 max-h-[82vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible print:space-y-6">
          
          {/* Official Egyptian Government / 10th of Ramadan Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between text-black">
            <div className="text-right space-y-1">
              <div className="font-bold text-xs text-slate-700">جمهورية مصر العربية</div>
              <div className="font-bold text-xs text-slate-800">محافظة الشرقية - جهاز تنمية مدينة العاشر من رمضان</div>
              <div className="font-black text-sm text-green-900">منظومة تشغيل وإدارة العمالة المعتمدة "وردية"</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl mx-auto mb-1 print:border print:border-black">
                و
              </div>
              <div className="text-xs font-black text-slate-900 border border-slate-800 px-3 py-0.5 rounded-full inline-block">
                كشف أمني معتمد
              </div>
            </div>

            <div className="text-left space-y-1 text-xs text-slate-800 font-mono">
              <div>تاريخ البيان: <strong>{todayDate}</strong></div>
              <div>كود المنظومة: <strong>10R-SEC-{factory.id}</strong></div>
              <div>سجل المصنع: <strong>{factory.tax_record}</strong></div>
            </div>
          </div>

          {/* Factory Destination Block */}
          <div className="border border-slate-300 p-4 rounded-xl text-xs flex items-center justify-between bg-slate-50 print:bg-white print:border-slate-800">
            <div>
              <span className="text-slate-600 text-xs font-bold block mb-0.5">بيان أمني رسمي موجه إلى إدارة ومنشأة:</span>
              <span className="font-black text-base text-slate-950 block">{factory.name}</span>
              <span className="text-slate-700 font-medium text-xs">{factory.industrial_zone}</span>
            </div>
            <div className="text-left text-xs font-black text-slate-900">
              إجمالي العمال المسجلين بالوردية: <span className="font-mono text-base">{factoryBookings.length}</span> عامل
            </div>
          </div>

          {/* Mobile view on screen only (Hidden during print) */}
          <div className="sm:hidden space-y-2.5 print:hidden">
            {factoryBookings.length > 0 ? (
              factoryBookings.map((b, idx) => {
                const worker = workers.find((w) => w.id === b.worker_id);
                const shift = shifts.find((s) => s.id === b.shift_id);
                const isAttended = b.status === 'attended';

                return (
                  <div key={b.id} className="border border-slate-200 rounded-2xl p-3 bg-slate-50 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{worker?.full_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{worker?.national_id}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        isAttended ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isAttended ? 'حاضر ✓' : 'حجز مؤكد'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">لا يوجد عمال مسجلين</div>
            )}
          </div>

          {/* Full Professional A4 Table (Visible on Desktop Screen AND 100% on Print) */}
          <div className="hidden sm:block print:block border border-slate-800 rounded-none overflow-hidden">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-800 print:bg-slate-100">
                <tr>
                  <th className="p-2 border-l border-slate-400 text-center w-8">م</th>
                  <th className="p-2 border-l border-slate-400">اسم العامل (رباعي)</th>
                  <th className="p-2 border-l border-slate-400 text-center">الرقم القومي (14 رقماً)</th>
                  <th className="p-2 border-l border-slate-400 text-center">رقم الموبايل / كاش</th>
                  <th className="p-2 border-l border-slate-400">الوردية المسجل بها</th>
                  <th className="p-2 border-l border-slate-400 text-center">ساعة الدخول</th>
                  <th className="p-2 border-l border-slate-400 text-center">ساعة الخروج</th>
                  <th className="p-2 border-l border-slate-400 text-center">إضافي</th>
                  <th className="p-2 text-center">توقيع البوابة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900 font-medium">
                {factoryBookings.length > 0 ? (
                  factoryBookings.map((b, idx) => {
                    const worker = workers.find((w) => w.id === b.worker_id);
                    const shift = shifts.find((s) => s.id === b.shift_id);
                    const isAttended = b.status === 'attended';

                    return (
                      <tr key={b.id} className="border-b border-slate-300">
                        <td className="p-2.5 border-l border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="p-2.5 border-l border-slate-300 font-extrabold text-slate-950">
                          {worker?.full_name}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono font-bold text-center tracking-wider text-black">
                          {worker?.national_id}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono text-center text-slate-800">
                          {worker?.phone}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 text-xs text-slate-800">
                          {shift?.title}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono text-center font-bold text-slate-900">
                          {b.check_in_at ? new Date(b.check_in_at).toLocaleTimeString('ar-EG') : '—'}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono text-center text-slate-700">
                          {b.check_out_at ? new Date(b.check_out_at).toLocaleTimeString('ar-EG') : 'قيد العمل'}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono text-center font-bold">
                          {b.overtime_hours ? `${b.overtime_hours} س` : '0'}
                        </td>
                        <td className="p-2.5 text-center text-xs font-bold text-slate-800">
                          {isAttended ? 'مطابق أمنياً ✓' : b.status === 'no_show' ? 'غياب' : 'مسجل'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 font-bold">
                      لا يوجد عمال مسجلين بهذا المصنع في تاريخ اليوم.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Official Signatures & Stamp Box (Full Width at bottom of sheet) */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-xs text-slate-900 print-avoid-break">
            <div className="border border-slate-400 p-4 rounded-lg text-center space-y-8 bg-white">
              <div className="font-bold text-xs text-slate-800">مسؤول أمن بوابة المصنع بالعاشر</div>
              <div className="text-xs text-slate-500">الاسم والتوقيع: ............................</div>
            </div>

            <div className="border border-slate-400 p-4 rounded-lg text-center space-y-8 bg-white">
              <div className="font-bold text-xs text-slate-800">مدير الموارد البشرية / التشغيل</div>
              <div className="text-xs text-slate-500">الاسم والتوقيع: ............................</div>
            </div>

            <div className="border-2 border-dashed border-slate-500 p-4 rounded-lg text-center flex flex-col items-center justify-center bg-slate-50/50 print:bg-white">
              <div className="font-black text-slate-900 text-xs mb-1">خاتم وتوثيق منصة وردية</div>
              <div className="text-xs text-green-900 font-bold">معتمد إلكترونياً بكود QR</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
