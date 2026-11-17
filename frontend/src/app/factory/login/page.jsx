'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Shield, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { loadState, loginFactoryAccount } from '@/lib/store';

export default function FactoryLoginPage() {
  const router = useRouter();
  const [state, setState] = useState(null);
  const [email, setEmail] = useState('manager@amal-group.com');
  const [password, setPassword] = useState('amal1234');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setState(loadState());
  }, []);

  const handleSelectFactory = (factory) => {
    if (factory.manager_email) {
      setEmail(factory.manager_email);
      setPassword(factory.manager_password || 'amal1234');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginFactoryAccount(email, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          router.push('/factory');
        }, 700);
      } else {
        setErrorMsg(res.message || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setErrorMsg('تعذر الاتصال بالسيرفر، حاول مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-bold text-slate-500">
        جاري تحميل بوابة الدخول...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-['Cairo',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md mb-3 border-4 border-white">
          <Building2 className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">بوابة إدارة المصانع والشركات</h2>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          مدينة العاشر من رمضان • حساب الإدارة والتشغيل ومتابعة التقارير
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-xl rounded-3xl sm:px-9 border border-slate-200">
          {/* Quick Account Switcher for Demo */}
          <div className="mb-5 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <div className="text-[11px] font-extrabold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>اختر منشأة للتعبئة التلقائية:</span>
              <span className="text-green-700 text-[10px]">حسابات معتمدة</span>
            </div>
            <select
              onChange={(e) => {
                const fac = state.factories.find((f) => f.id === Number(e.target.value));
                if (fac) handleSelectFactory(fac);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {state.factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.industrial_zone})
                </option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                البريد الإلكتروني لإدارة المصنع:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                  placeholder="manager@factory.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'جاري التحقق...' : 'دخول لوحة إدارة المصنع'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch to Gate security login */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/gate"
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center justify-between border border-blue-200 transition"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>أنت فرد أمن؟ الدخول لبوابة أمن المصنع</span>
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 font-medium">
              <Link href="/admin" className="text-slate-600 hover:text-slate-900 underline">
                لوحة الإدارة المركزية (وردية)
              </Link>
              <Link href="/" className="text-green-700 hover:underline font-bold">
                تطبيق العامل
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
