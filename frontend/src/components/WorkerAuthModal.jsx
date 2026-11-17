'use client';

import React, { useState } from 'react';
import { ShieldCheck, UserCheck, X, AlertCircle, CheckCircle2, CreditCard, Phone, Camera, Image as ImageIcon } from 'lucide-react';
import { loginOrRegisterWorker, switchActiveWorker } from '@/lib/store';

export function WorkerAuthModal({ isOpen, onClose, currentWorker, workers = [], onWorkerChanged }) {
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (side === 'front') setIdFront(reader.result);
      if (side === 'back') setIdBack(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validate 14 digits National ID
    const cleanId = nationalId.trim();
    if (cleanId.length !== 14 || !/^\d{14}$/.test(cleanId)) {
      setError('الرقم القومي يجب أن يتكون من 14 رقماً بالضبط كما في بطاقتك الشخصية.');
      return;
    }

    // Validate 11 digits phone
    const cleanPhone = phone.trim();
    if (cleanPhone.length !== 11 || !/^01[0125]\d{8}$/.test(cleanPhone)) {
      setError('رقم الموبايل يجب أن يتكون من 11 رقماً ويبدأ بـ (010, 011, 012, 015) لاستلام كاش.');
      return;
    }

    if (!fullName.trim()) {
      setError('يرجى كتابة الاسم كاملاً كما هو مدون في بطاقة الرقم القومي.');
      return;
    }

    const res = loginOrRegisterWorker(fullName, cleanId, cleanPhone, idFront, idBack);
    setSuccess(res.message);
    if (onWorkerChanged) onWorkerChanged();
    setTimeout(() => {
      onClose();
      setSuccess(null);
    }, 1500);
  };

  const handleSelectExisting = (workerId) => {
    switchActiveWorker(workerId);
    if (onWorkerChanged) onWorkerChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Cairo',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">تسجيل الهوية بالرقم القومي</h3>
              <p className="text-[11px] text-slate-500">مطلوب لدخول مصانع العاشر واستلام الأجر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-[11px] leading-relaxed mb-3">
          <strong>تنبيه أمن المصنع:</strong> يُشترط تسجيل رقمك القومي ومطابقته بأصل البطاقة الشخصية عند بوابة الدخول.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">الاسم بالكامل (كما بالبطاقة):</label>
            <input
              type="text"
              required
              placeholder="مثال: إسلام فتحي حسن علي"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">الرقم القومي (14 رقم):</label>
            <input
              type="text"
              required
              maxLength={14}
              placeholder="29801011234567"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">رقم الموبايل (المحفظة لاستلام اليومية):</label>
            <input
              type="text"
              required
              maxLength={11}
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:border-green-600"
            />
          </div>

          {/* National ID Photo Upload (Front & Back) */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-slate-700 font-bold mb-1.5">
              <span>إرفاق صورة البطاقة:</span>
              <span className="text-[10px] text-slate-400 font-normal">(اختياري للتوثيق الفوري)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Front Side */}
              <label className="border border-dashed border-slate-300 hover:border-green-600 bg-slate-50 rounded-2xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition text-center relative overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, 'front')}
                />
                {idFront ? (
                  <div className="relative w-full h-16 rounded-xl overflow-hidden">
                    <img src={idFront} alt="وجه البطاقة" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                      ✓ تم تصوير الوجه
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-slate-500 mb-1 group-hover:text-green-700" />
                    <span className="text-[11px] font-bold text-slate-700">وجه البطاقة</span>
                    <span className="text-[9px] text-slate-400">الاسم والصورة</span>
                  </>
                )}
              </label>

              {/* Back Side */}
              <label className="border border-dashed border-slate-300 hover:border-green-600 bg-slate-50 rounded-2xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition text-center relative overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, 'back')}
                />
                {idBack ? (
                  <div className="relative w-full h-16 rounded-xl overflow-hidden">
                    <img src={idBack} alt="ظهر البطاقة" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                      ✓ تم تصوير الظهر
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-slate-500 mb-1 group-hover:text-green-700" />
                    <span className="text-[11px] font-bold text-slate-700">ظهر البطاقة</span>
                    <span className="text-[9px] text-slate-400">المهنة والعنوان</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl flex items-center gap-1.5 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-[11px] text-green-700 bg-green-50 p-2 rounded-xl flex items-center gap-1.5 border border-green-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs shadow-xs transition"
          >
            تأكيد تسجيل البطاقة والدخول
          </button>
        </form>

        {/* Fast Switcher for Testing Existing Workers */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 font-bold mb-2">أو اختر عاملاً مسجلاً للتجربة السريعة:</div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {workers.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelectExisting(w.id)}
                className={`w-full text-right p-2 rounded-xl border text-xs flex items-center justify-between transition ${
                  currentWorker?.id === w.id
                    ? 'bg-green-50 border-green-300 text-green-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-bold">{w.full_name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{w.national_id} • {w.phone}</div>
                </div>
                {currentWorker?.id === w.id && (
                  <span className="text-[10px] bg-green-700 text-white px-2 py-0.5 rounded-md">الحالي</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
