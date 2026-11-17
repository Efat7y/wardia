'use client';

import React from 'react';
import { Printer, Download, X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Calendar, Building2 } from 'lucide-react';

export function GateReportPrintModal({
  isOpen,
  onClose,
  report,
  factory,
}) {
  if (!isOpen || !report || !factory) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = report.report_date
    ? new Date(report.report_date).toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('ar-EG');

  const workersList = report.workers_summary || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-['Cairo',sans-serif] overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-slate-200 print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:m-0">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                {report.report_title}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                {factory.name} • {report.security_officer_name || 'مسؤول أمن الوردية'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة التقرير الأمني (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body: Fills Full A4 Page */}
        <div className="printable-document p-6 sm:p-8 space-y-6 text-slate-900 max-h-[82vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible print:space-y-6">
          
          {/* Official Egyptian Government / Security Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between text-black">
            <div className="text-right space-y-1">
              <div className="font-bold text-xs text-slate-700">جمهورية مصر العربية</div>
              <div className="font-bold text-xs text-slate-800">محافظة الشرقية - جهاز تنمية مدينة العاشر من رمضان</div>
              <div className="font-black text-sm text-blue-900">إدارة الأمن الصناعي ومنظومة "وردية" المعتمدة</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl mx-auto mb-1 print:border print:border-black">
                و
              </div>
              <span className="text-xs font-black text-slate-900 border border-slate-800 px-3 py-0.5 rounded-full inline-block">
                تقرير أمني رسمي
              </span>
            </div>

            <div className="text-left space-y-1 text-xs text-slate-800 font-mono">
              <div>تاريخ التقرير: <strong>{formattedDate}</strong></div>
              <div>رقم المحضر: <strong>SEC-REP-{report.id}-{new Date().getFullYear()}</strong></div>
              <div>حالة الاعتماد: <span className="text-green-800 font-bold">مرفوع ومعتمد ✓</span></div>
            </div>
          </div>

          {/* Report Meta Card */}
          <div className="border border-slate-300 p-4 rounded-xl text-xs bg-slate-50 print:bg-white print:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-600 text-xs font-bold block mb-0.5">المنشأة الصناعية وموقع البوابة:</span>
                <span className="font-black text-base text-slate-950 block">{factory.name}</span>
                <span className="text-slate-700 font-medium text-xs">
                  {factory.gate_name || 'البوابة الرئيسية'} • {factory.industrial_zone}
                </span>
              </div>

              <div className="text-left">
                <span className="text-slate-600 text-xs font-bold block mb-0.5">محرر التقرير وضابط الأمن:</span>
                <span className="font-black text-sm text-slate-950 block">{report.security_officer_name || 'مسؤول أمن الوردية'}</span>
                <span className="text-slate-600 font-mono text-xs">{factory.gate_email}</span>
              </div>
            </div>
          </div>

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="border border-slate-300 rounded-xl p-3 bg-white">
              <span className="text-xs text-slate-600 font-bold block mb-0.5">العمال الحاضرين بالبوابة</span>
              <div className="text-2xl font-black text-green-900 font-mono">
                {report.total_attended} <span className="text-xs font-bold text-slate-600">عامل</span>
              </div>
              <span className="text-[10px] text-green-800 font-bold mt-0.5 block">تمت مطابقة الهويات والـ QR</span>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 bg-white">
              <span className="text-xs text-slate-600 font-bold block mb-0.5">حالات الغياب / عدم الحضور</span>
              <div className="text-2xl font-black text-rose-800 font-mono">
                {report.total_absent} <span className="text-xs font-bold text-slate-600">عامل</span>
              </div>
              <span className="text-[10px] text-rose-700 font-bold mt-0.5 block">لم يتواجدوا وقت فتح الوردية</span>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 bg-white">
              <span className="text-xs text-slate-600 font-bold block mb-0.5">نسبة الانضباط والحضور</span>
              <div className="text-2xl font-black text-blue-900 font-mono">
                {report.total_attended + report.total_absent > 0
                  ? Math.round((report.total_attended / (report.total_attended + report.total_absent)) * 100)
                  : 100}%
              </div>
              <span className="text-[10px] text-blue-800 font-bold mt-0.5 block">معدل التزام العمالة</span>
            </div>
          </div>

          {/* Security Officer Notes */}
          <div className="border border-slate-300 bg-slate-50 print:bg-white p-4 rounded-xl text-xs space-y-1.5">
            <div className="font-black text-slate-950 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>ملاحظات وإفادة أمن البوابة الرسمية:</span>
            </div>
            <p className="text-slate-800 text-xs leading-relaxed font-medium">
              {report.notes || 'تم تفتيش وفحص جميع العمال بدقة والتأكد من مطابقة بطاقات الرقم القومي والـ QR وارتداء مهمات الوقاية والسلامة المهنية وخلو الوردية من أي مخالفات أمنية.'}
            </p>
          </div>

          {/* Attended Workers Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <h4 className="font-black text-sm text-slate-950">
                كشف العمال الحاضرين بالاسم والرقم القومي المرفق بالتقرير ({workersList.length}):
              </h4>
            </div>

            <div className="border border-slate-800 rounded-none overflow-hidden">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-800">
                  <tr>
                    <th className="p-2 border-l border-slate-400 text-center w-8">م</th>
                    <th className="p-2 border-l border-slate-400">اسم العامل (رباعي)</th>
                    <th className="p-2 border-l border-slate-400 text-center">الرقم القومي (14 رقماً)</th>
                    <th className="p-2 border-l border-slate-400 text-center">رقم الهاتف / كاش</th>
                    <th className="p-2 border-l border-slate-400">الوردية المسكن عليها</th>
                    <th className="p-2 border-l border-slate-400 text-center">ساعة الدخول</th>
                    <th className="p-2 text-center">المطابقة الأمنية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-900 font-medium">
                  {workersList.length > 0 ? (
                    workersList.map((w, idx) => (
                      <tr key={idx} className="border-b border-slate-300">
                        <td className="p-2.5 border-l border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="p-2.5 border-l border-slate-300 font-extrabold text-slate-950">
                          {w.worker_name || 'عامل وردية'}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono font-bold text-center tracking-wider text-black">
                          {w.national_id || '—'}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono text-center text-slate-800">
                          {w.phone || '—'}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 text-xs text-slate-800">
                          {w.shift_title || 'وردية مصنع'}
                        </td>
                        <td className="p-2.5 border-l border-slate-300 font-mono text-center font-bold text-slate-900">
                          {w.check_in_time || '—'}
                        </td>
                        <td className="p-2.5 text-center text-xs font-bold text-green-900">
                          مطابق ومعتمد ✓
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                        لم يتم تسجيل حضور عمال في هذا التقرير.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Seal Section (Full Width at Bottom of Sheet) */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-xs text-slate-900 print-avoid-break">
            <div className="border border-slate-400 p-4 rounded-lg text-center space-y-8 bg-white">
              <div className="font-bold text-xs text-slate-800">ضابط / مسؤول أمن البوابة</div>
              <div className="text-xs text-slate-500">الاسم والتوقيع: ............................</div>
            </div>

            <div className="border border-slate-400 p-4 rounded-lg text-center space-y-8 bg-white">
              <div className="font-bold text-xs text-slate-800">مدير الأمن الصناعي بالمصنع</div>
              <div className="text-xs text-slate-500">الاسم والتوقيع: ............................</div>
            </div>

            <div className="border-2 border-dashed border-slate-500 p-4 rounded-lg text-center flex flex-col items-center justify-center bg-white">
              <div className="font-black text-slate-950 text-xs mb-1">خاتم وتوثيق منصة وردية</div>
              <div className="text-xs text-blue-900 font-bold">معتمد إلكترونياً بكود QR</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
