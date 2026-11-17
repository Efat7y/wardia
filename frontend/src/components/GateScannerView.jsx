'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  LogOut,
  UserX,
  Clock,
  Send,
  Building2,
  Lock,
  Mail,
  ShieldCheck,
  Shield,
  FileText,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import {
  verifyAndCheckIn,
  checkOutWorker,
  markNoShow,
  loadState,
  loginGateAccount,
} from '@/lib/store';
import { createDynamicQrToken } from '@/lib/crypto';
import { GateReportModal } from './GateReportModal';
import { CameraQrScanner } from './CameraQrScanner';

export function GateScannerView({ onCheckInSuccess }) {
  const [state, setState] = useState(null);
  const [loggedGateFactory, setLoggedGateFactory] = useState(null);

  // Login form state
  const [gateEmail, setGateEmail] = useState('gate@amal-group.com');
  const [gatePassword, setGatePassword] = useState('gate1234');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Scanner state
  const [inputToken, setInputToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedOvertimeHours, setSelectedOvertimeHours] = useState(2);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);

    // Check if previously logged in gate factory
    if (typeof window !== 'undefined') {
      const savedFactoryId = localStorage.getItem('wardia_logged_gate_factory_id');
      if (savedFactoryId && s.factories) {
        const found = s.factories.find((f) => f.id === Number(savedFactoryId));
        if (found) {
          setLoggedGateFactory(found);
          setGateEmail(found.gate_email || 'gate@amal-group.com');
          setGatePassword(found.gate_password || 'gate1234');
        }
      }
    }

    const handleUpdate = () => {
      const refreshed = loadState();
      setState(refreshed);
      if (loggedGateFactory) {
        const refreshedFac = refreshed.factories.find((f) => f.id === loggedGateFactory.id);
        if (refreshedFac) setLoggedGateFactory(refreshedFac);
      }
    };
    window.addEventListener('wardia_state_changed', handleUpdate);
    return () => window.removeEventListener('wardia_state_changed', handleUpdate);
  }, []);

  if (!state) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-xs font-bold text-slate-500 shadow-xs">
        جاري فتح بوابة الأمن الصناعي...
      </div>
    );
  }

  // Handle Gate Login
  const handleGateLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await loginGateAccount(gateEmail, gatePassword);
      if (res.success) {
        setLoggedGateFactory(res.factory);
      } else {
        setLoginError(res.message || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setLoginError('تعذر التحقق من الدخول، حاول مرة أخرى');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGateLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wardia_logged_gate_factory_id');
    }
    setLoggedGateFactory(null);
    setResult(null);
  };

  // If NOT logged in as gate security officer, show Gate Security Login Form
  if (!loggedGateFactory) {
    return (
      <div className="max-w-md mx-auto space-y-4 font-['Cairo',sans-serif]">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 text-center">
            تسجيل دخول مسؤول أمن البوابة
          </h2>
          <p className="text-xs text-slate-500 text-center mt-1">
            لكل مصنع بوابة أمن خاصة به لفحص ومطابقة عمال الورديات
          </p>

          {/* Quick Select for demo */}
          <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              اختر بوابة المصنع للتجربة السريعة:
            </label>
            <select
              onChange={(e) => {
                const fac = state.factories.find((f) => f.id === Number(e.target.value));
                if (fac) {
                  setGateEmail(fac.gate_email || 'gate@amal-group.com');
                  setGatePassword(fac.gate_password || 'gate1234');
                }
              }}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {state.factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.gate_name || 'البوابة الرئيسية'})
                </option>
              ))}
            </select>
          </div>

          {loginError && (
            <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleGateLogin} className="space-y-3 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                بريد بوابة الأمن الخاص بالمصنع:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={gateEmail}
                  onChange={(e) => setGateEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  placeholder="gate@factory.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة مرور البوابة:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={gatePassword}
                  onChange={(e) => setGatePassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoggingIn ? 'جاري التحقق...' : 'دخول شاشة أمن البوابة'}</span>
              <Shield className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LOGGED IN GATE SECURITY VIEW ---
  const activeFactory = loggedGateFactory;

  // Filter shifts and bookings STRICTLY for this factory
  const factoryShifts = state.shifts.filter((s) => s.factory_id === activeFactory.id);
  const factoryShiftIds = factoryShifts.map((s) => s.id);

  // Bookings specifically for THIS factory
  const thisFactoryBookings = state.bookings.filter((b) => factoryShiftIds.includes(b.shift_id));
  const readyForCheckIn = thisFactoryBookings.filter((b) => b.status === 'booked');
  const insideFactory = thisFactoryBookings.filter((b) => b.status === 'attended' && !b.check_out_at);
  const attendedToday = thisFactoryBookings.filter((b) => b.status === 'attended');
  const absentToday = thisFactoryBookings.filter((b) => b.status === 'no_show');

  // Verify function passing the logged gate factory id
  const handleVerify = async (tokenToTest) => {
    if (!tokenToTest || !tokenToTest.trim()) return;
    setIsVerifying(true);
    setResult(null);

    try {
      const res = await verifyAndCheckIn(
        tokenToTest,
        activeFactory.latitude,
        activeFactory.longitude,
        true,
        activeFactory.id
      );
      setResult(res);
      if (res.success && onCheckInSuccess) {
        onCheckInSuccess();
      }
    } catch {
      setResult({
        success: false,
        message: 'حدث خطأ أثناء فحص الكود',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // 1-Click Fast Check-In for this factory
  const handleFastCheckIn = async (booking) => {
    const freshToken = await createDynamicQrToken(booking.worker_id, booking.id);
    setInputToken(freshToken);
    await handleVerify(freshToken);
  };

  // Check-Out with Overtime
  const handleCheckOut = (bookingId, hours) => {
    const res = checkOutWorker(bookingId, hours);
    setResult(res);
    setState(loadState());
    if (onCheckInSuccess) onCheckInSuccess();
  };

  // No-Show Penalty
  const handleNoShow = (bookingId) => {
    if (!confirm('هل أنت متأكد من تسجيل غياب العامل؟ سيتم خصم نقاط من تقييمه الأمني.')) return;
    const res = markNoShow(bookingId);
    setResult(res);
    setState(loadState());
    if (onCheckInSuccess) onCheckInSuccess();
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 font-['Cairo',sans-serif]">
      {/* Active Gate Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-sm">{activeFactory.name}</h2>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  بوابة أمن نشطة
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                {activeFactory.gate_name || 'البوابة الرئيسية'} • {activeFactory.industrial_zone}
              </p>
            </div>
          </div>

          <button
            onClick={handleGateLogout}
            className="text-[11px] font-bold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition"
          >
            تبديل البوابة
          </button>
        </div>

        {/* Security Officer Info & Submit Report Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-600 font-mono">
            حساب البوابة: <strong className="text-slate-900">{activeFactory.gate_email}</strong>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>رفع تقرير الوردية للإدارة</span>
          </button>
        </div>
      </div>

      {/* Confirmation Result Banner */}
      {result && (
        <div
          className={`p-4 rounded-2xl border shadow-xs animate-in zoom-in-95 ${
            result.success
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-extrabold text-sm">{result.message}</div>
              {result.workerName && (
                <div className="text-xs mt-2 pt-2 border-t border-green-200/80 space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span>
                      العامل: <strong>{result.workerName}</strong>
                    </span>
                    {result.shiftTitle && (
                      <span className="font-bold text-green-700">{result.shiftTitle}</span>
                    )}
                  </div>
                  {result.workerNationalId && (
                    <div className="flex justify-between font-mono text-[11px] bg-white/80 p-1.5 rounded-lg border border-green-200">
                      <span>
                        الرقم القومي: <strong>{result.workerNationalId}</strong>
                      </span>
                      <span>
                        كاش: <strong>{result.workerPhone}</strong>
                      </span>
                    </div>
                  )}
                  {(result.workerIdCardFront || result.workerIdCardBack) && (
                    <div className="pt-1.5">
                      <div className="text-[10px] text-green-800 font-bold mb-1">
                        صورة بطاقة الرقم القومي المرفوعة:
                      </div>
                      <div className="flex gap-2">
                        {result.workerIdCardFront && (
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-green-300 shadow-xs">
                            <img
                              src={result.workerIdCardFront}
                              alt="وجه البطاقة"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {result.workerIdCardBack && (
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-green-300 shadow-xs">
                            <img
                              src={result.workerIdCardBack}
                              alt="ظهر البطاقة"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {result.overtimeBonus > 0 && (
                    <div className="text-[11px] font-bold text-blue-700 bg-blue-50 p-1 rounded-md">
                      ✓ تم قيد {result.overtimeBonus} ج.م أجر إضافي ({result.overtimeHours} ساعات أوفر تايم)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Arrival & Check-In */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span>تسجيل دخول العمال عند وصول البوابة ({readyForCheckIn.length})</span>
          </h4>
          <span className="text-[11px] text-slate-400">بانتظار المسح</span>
        </div>

        {readyForCheckIn.length > 0 ? (
          <div className="space-y-2">
            {readyForCheckIn.map((booking) => {
              const worker = state.workers.find((w) => w.id === booking.worker_id);
              const shift = state.shifts.find((s) => s.id === booking.shift_id);
              return (
                <div
                  key={booking.id}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{worker?.full_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      بطاقة: {worker?.national_id} • {shift?.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleFastCheckIn(booking)}
                      disabled={isVerifying}
                      className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition shadow-xs"
                      title="مطابقة البطاقة وتسجيل الدخول"
                    >
                      دخول
                    </button>
                    <button
                      onClick={() => handleNoShow(booking.id)}
                      className="bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-700 p-1.5 rounded-xl transition"
                      title="تسجيل غياب / No-Show"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 bg-slate-50 rounded-2xl text-xs text-slate-500">
            لا يوجد عمال في انتظار الدخول حالياً لهذه البوابة.
          </div>
        )}

        {/* Live Camera Scanner */}
        <div className="pt-2">
          <CameraQrScanner
            onScanSuccess={(scannedToken) => {
              if (scannedToken && !isVerifying) {
                setInputToken(scannedToken);
                handleVerify(scannedToken);
              }
            }}
          />
        </div>

        {/* Manual code fallback for broken camera */}
        <div className="pt-3 border-t border-slate-100 space-y-2 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/80">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>تسجيل يدوي (في حال تعطل كاميرا البوابة أو عدم وضوح الشاشة):</span>
          </div>
          <p className="text-[11px] text-slate-600">
            يضغط العامل على زر <strong>"أظهر الكود النصي البديل"</strong> في هاتفه، ويقوم فرد الأمن بنسخه أو كتابته هنا:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="الصق كود الـ QR المتغير هنا (WARDIA:...)"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={() => handleVerify(inputToken)}
              disabled={isVerifying || !inputToken}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs shrink-0"
            >
              {isVerifying ? 'فحص...' : 'تسجيل الحضور'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Check-Out & Overtime Calculation */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <LogOut className="w-4 h-4 text-blue-600" />
            <span>تسجيل انصراف العمال وحساب الإضافي ({insideFactory.length})</span>
          </h4>
          <span className="text-[11px] text-green-700 font-bold">داخل المصنع الآن</span>
        </div>

        {insideFactory.length > 0 ? (
          <div className="space-y-3">
            {insideFactory.map((booking) => {
              const worker = state.workers.find((w) => w.id === booking.worker_id);
              const shift = state.shifts.find((s) => s.id === booking.shift_id);
              return (
                <div
                  key={booking.id}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{worker?.full_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        حضر الساعة {new Date(booking.check_in_at).toLocaleTimeString('ar-EG')} • {shift?.title}
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-md">
                      قيد العمل
                    </span>
                  </div>

                  {/* Overtime Selector & Checkout Action */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>إضافي:</span>
                      <select
                        value={selectedOvertimeHours}
                        onChange={(e) => setSelectedOvertimeHours(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      >
                        <option value={0}>بدون إضافي (8 ساعات)</option>
                        <option value={1}>ساعة إضافي (+71 ج)</option>
                        <option value={2}>ساعتين إضافي (+143 ج)</option>
                        <option value={3}>3 ساعات إضافي (+214 ج)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleCheckOut(booking.id, selectedOvertimeHours)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs shrink-0"
                    >
                      تسجيل خروج
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 bg-slate-50 rounded-2xl text-xs text-slate-500">
            لا يوجد عمال متواجدين داخل المصنع في انتظار الخروج حالياً.
          </div>
        )}
      </div>

      {/* Gate Security Shift Report Modal */}
      <GateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        factory={activeFactory}
        attendedBookings={attendedToday}
        absentBookings={absentToday}
        workers={state.workers}
        shifts={state.shifts}
        onReportSubmitted={() => setState(loadState())}
      />
    </div>
  );
}
