'use client';

import React, { useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  Users,
  Shield,
  Clock,
  Calendar,
} from 'lucide-react';
import { submitGateReport } from '@/lib/store';

export function GateReportModal({
  isOpen,
  onClose,
  factory,
  attendedBookings = [],
  absentBookings = [],
  workers = [],
  shifts = [],
  onReportSubmitted,
}) {
  const [officerName, setOfficerName] = useState('كابتن مصطفى عثمان (أمن المناوبة)');
  const [notes, setNotes] = useState(
    'تم التفتيش ومطابقة هويات جميع العمال والتأكد من ارتداء مهمات السلامة (سيفتي وخوذة) وخلو الدخول من أي ملاحظات أمنية.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Prepare workers summary for report
  const workersSummaryList = attendedBookings.map((b) => {
    const worker = workers.find((w) => w.id === b.worker_id);
    const shift = shifts.find((s) => s.id === b.shift_id);
    return {
      worker_id: b.worker_id,
      worker_name: worker?.full_name || 'عامل غير مسجل',
      national_id: worker?.national_id || '',
      phone: worker?.phone || '',
      shift_title: shift?.title || 'وردية صناعية',
      check_in_time: b.check_in_at
        ? new Date(b.check_in_at).toLocaleTimeString('ar-EG')
        : '08:00 ص',
    };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reportPayload = {
        factory_id: factory.id,
        report_title: `تقرير أمن بوابة ${factory.gate_name || 'المصنع'} - وردية اليوم`,
        report_date: todayStr,
        security_officer_name: officerName,
        total_attended: attendedBookings.length,
        total_absent: absentBookings.length,
        workers_summary: workersSummaryList,
        notes: notes,
      };

      const res = await submitGateReport(reportPayload);
      if (res.success) {
        setSubmittedSuccess(true);
        if (onReportSubmitted) onReportSubmitted(res.report);
        setTimeout(() => {
          setSubmittedSuccess(false);
          onClose();
        }, 1500);
      } else {
        alert(res.message || 'حدث خطأ أثناء رفع التقرير');
      }
    } catch {
      alert('تعذر إرسال التقرير لإدارة المصنع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">رفع تقرير الأمن اليومي للإدارة</h3>
              <p className="text-xs text-slate-300 font-medium">
                {factory.name} • {factory.gate_name || 'البوابة الرئيسية'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-black text-lg text-slate-900">تم رفع التقرير بنجاح!</h4>
            <p className="text-xs text-slate-600 font-bold">
              تم إرسال الكشف ببيانات العمال الحاضرين فورياً إلى لوحة إدارة المصنع.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 mb-1">العمال الحاضرين بالبوابة</div>
                <div className="text-2xl font-black text-green-700 font-mono">
                  {attendedBookings.length}{' '}
                  <span className="text-xs font-bold text-slate-400">عامل</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 mb-1">الغياب / لم يحضر</div>
                <div className="text-2xl font-black text-rose-600 font-mono">
                  {absentBookings.length}{' '}
                  <span className="text-xs font-bold text-slate-400">عامل</span>
                </div>
              </div>
            </div>

            {/* Officer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم مسؤول أمن البوابة ومحرر التقرير:
              </label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Preview of Attended Workers */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>كشف العمال المسجل حضورهم بالتقرير:</span>
                <span className="text-[11px] text-green-700">{workersSummaryList.length} عامل</span>
              </div>
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50 p-1">
                {workersSummaryList.length > 0 ? (
                  workersSummaryList.map((w, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{w.worker_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {w.national_id} • {w.shift_title}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md">
                        {w.check_in_time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    لا يوجد عمال سجلوا حضورهم حتى الآن بهذه البوابة.
                  </div>
                )}
              </div>
            </div>

            {/* Security Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ملاحظات أمن البوابة وتوصيات الوردية:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                placeholder="أدخل أي ملاحظات على انتظام العمال أو مهمات الوقاية..."
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال التقرير لإدارة المصنع الآن'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
