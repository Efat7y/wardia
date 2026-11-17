'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { GateScannerView } from '@/components/GateScannerView';

export default function GatePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Cairo',sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900">بوابة الأمن الصناعي</h1>
              <p className="text-[11px] text-slate-500">مدينة العاشر من رمضان</p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl transition"
          >
            الرئيسية
          </Link>
        </div>
      </header>

      {/* Main Scanner Container */}
      <main className="max-w-md mx-auto p-4">
        <GateScannerView />
      </main>
    </div>
  );
}
