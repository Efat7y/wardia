'use client';

import React from 'react';
import Link from 'next/link';
import { UserCircle, Shield, Building2 } from 'lucide-react';

export function AppHeader({ worker }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & City */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-green-700 flex items-center justify-center text-white font-black text-xl shadow-xs">
            و
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              وَرْدِيَّة
            </h1>
            <p className="text-[11px] text-green-700 font-bold mt-0.5">
              تطبيق عمال العاشر من رمضان
            </p>
          </div>
        </div>

        {/* Worker Info / Factory Portal Link */}
        <div className="flex items-center gap-2">
          {worker ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-medium">العامل المسجل</div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {worker.full_name.split(' ')[0]}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center">
                {worker.full_name[0]}
              </div>
            </div>
          ) : (
            <Link
              href="/factory/login"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>دخول المصانع</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
