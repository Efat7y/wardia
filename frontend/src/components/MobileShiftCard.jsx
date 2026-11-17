'use client';

import React from 'react';
import { MapPin, Clock, Users, QrCode, CheckCircle2 } from 'lucide-react';

export function MobileShiftCard({
  shift,
  factory,
  isBookedByWorker = false,
  onBook,
  onShowQr,
}) {
  const slotsRemaining = shift.slots_needed - shift.slots_filled;
  const isFull = slotsRemaining <= 0;

  return (
    <div
      className={`rounded-2xl border transition-all p-4 bg-white shadow-xs ${
        isBookedByWorker
          ? 'border-green-500 ring-2 ring-green-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Booked Banner */}
      {isBookedByWorker && (
        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-xl text-xs font-bold mb-3 w-fit">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم حجز هذه الوردية بنجاح</span>
        </div>
      )}

      {/* Title & Wage */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <span className="text-xs font-bold text-slate-500 block mb-0.5">
            {factory?.name || 'مصنع معتمد'}
          </span>
          <h3 className="font-extrabold text-base text-slate-900 leading-snug">
            {shift.title}
          </h3>
        </div>

        {/* Big Wage */}
        <div className="text-left shrink-0 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
          <div className="text-green-700 font-black text-lg font-mono leading-none">
            {shift.worker_wage} <span className="text-xs font-bold">ج.م</span>
          </div>
          <div className="text-[10px] text-green-800 text-center font-medium mt-0.5">اليومية</div>
        </div>
      </div>

      {/* Info Pills */}
      <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700">{factory?.industrial_zone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {shift.shift_date} من {shift.start_time} إلى {shift.end_time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {isFull ? (
              <strong className="text-rose-600">اكتمل العدد</strong>
            ) : (
              <span>متبقي <strong className="text-green-700">{slotsRemaining} أماكن شاغرة</strong> (من أصل {shift.slots_needed})</span>
            )}
          </span>
        </div>
      </div>

      {/* Single, Clear Action Button */}
      {isBookedByWorker ? (
        <button
          onClick={() => onShowQr && onShowQr(shift.id)}
          className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
        >
          <QrCode className="w-5 h-5" />
          <span>عرض كود الدخول للبوابة (QR)</span>
        </button>
      ) : isFull ? (
        <button
          disabled
          className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed"
        >
          اكتمل عدد العمال
        </button>
      ) : (
        <button
          onClick={() => onBook(shift.id)}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
        >
          <span>احجز الوردية الآن</span>
        </button>
      )}
    </div>
  );
}
