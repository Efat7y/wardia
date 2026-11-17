'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  RefreshCw,
  Clock,
  ArrowRight,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { createDynamicQrToken, QR_REFRESH_INTERVAL_SECONDS } from '@/lib/crypto';

export function DynamicQrModal({
  isOpen,
  onClose,
  worker,
  activeBooking,
  shift,
  factory,
  onSimulateScanAtGate,
}) {
  const [token, setToken] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(QR_REFRESH_INTERVAL_SECONDS);
  const [copied, setCopied] = useState(false);
  const [showManualCode, setShowManualCode] = useState(false);

  const refreshToken = async () => {
    if (!activeBooking || !worker) return;
    const newToken = await createDynamicQrToken(worker.id, activeBooking.id);
    setToken(newToken);
    setSecondsRemaining(QR_REFRESH_INTERVAL_SECONDS);
  };

  useEffect(() => {
    if (!isOpen || !activeBooking) return;

    refreshToken();

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          refreshToken();
          return QR_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeBooking?.id, worker?.id]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Cairo',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 text-center animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="text-right">
            <h3 className="font-extrabold text-slate-900 text-base">كود الحضور بالبوابة</h3>
            <p className="text-xs text-slate-500">أظهر الكود لمسؤول البوابة عند الدخول</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Summary */}
        <div className="bg-slate-50 p-3 rounded-2xl mb-4 text-right border border-slate-100">
          <div className="text-xs font-bold text-green-700">{factory?.name}</div>
          <div className="text-sm font-extrabold text-slate-800">{shift?.title}</div>
          <div className="text-xs text-slate-500 mt-1 flex justify-between">
            <span>العامل: {worker?.full_name}</span>
            <span className="font-bold text-slate-900 font-mono">{shift?.worker_wage} جنيه</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl inline-block shadow-inner mb-3">
          {token ? (
            <QRCodeSVG value={token} size={190} level="H" />
          ) : (
            <div className="w-[190px] h-[190px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Refresh Timer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
          <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>يتجدد الكود تلقائياً كل 15 ثانية</span>
          <span className="font-bold text-slate-800 font-mono">({secondsRemaining}ث)</span>
        </div>

        {/* ================= FALLBACK FOR BROKEN CAMERA ================= */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowManualCode(!showManualCode)}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-extrabold flex items-center justify-between transition"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
              <span>كاميرا الأمن لا تعمل؟ أظهر الكود النصي البديل</span>
            </span>
            <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-md font-bold">
              {showManualCode ? 'إخفاء' : 'عرض الكود'}
            </span>
          </button>

          {showManualCode && (
            <div className="mt-2 p-3 bg-slate-900 text-white rounded-2xl text-right space-y-2 border border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>كود الدخول المتغير اللحظي:</span>
                </span>
                <span className="font-mono text-slate-400">ينتهي خلال {secondsRemaining}ث</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] break-all select-all text-emerald-400 font-bold tracking-tight text-center">
                {token}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">تم نسخ الكود بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>نسخ الكود لإعطائه للأمن يدوياً</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                يقوم فرد أمن البوابة بلصق هذا الكود في خانة "الإدخال اليدوي" لتسجيل حضورك فوراً.
              </p>
            </div>
          )}
        </div>

        {/* National ID Security Verification Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-right text-xs space-y-1 mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>بيانات إثبات الشخصية:</span>
            <span className="text-green-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>بطاقة معتمدة</span>
            </span>
          </div>
          <div className="font-bold text-slate-900">{worker?.full_name}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1 border-t border-slate-200">
            <span>
              الرقم القومي: <strong>{worker?.national_id}</strong>
            </span>
            <span>
              كاش: <strong>{worker?.phone}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {onSimulateScanAtGate && (
            <button
              onClick={() => {
                onSimulateScanAtGate(token);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <span>تجربة مسح الكود كمسؤول بوابة الآن</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
