'use client';

import React from 'react';
import { Briefcase, CalendarCheck2, Wallet } from 'lucide-react';

export function BottomNav({ activeTab, onTabChange, hasActiveBooking }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {/* Available Shifts */}
        <button
          onClick={() => onTabChange('shifts')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
            activeTab === 'shifts'
              ? 'text-green-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-1" />
          <span className="text-xs">الورديات</span>
        </button>

        {/* My Booked Shifts */}
        <button
          onClick={() => onTabChange('my-shifts')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors relative ${
            activeTab === 'my-shifts'
              ? 'text-green-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarCheck2 className="w-5 h-5 mb-1" />
          <span className="text-xs">حجوزاتي</span>
          {hasActiveBooking && (
            <span className="absolute top-2 right-1/3 w-2.5 h-2.5 rounded-full bg-green-500" />
          )}
        </button>

        {/* Wallet / Earnings */}
        <button
          onClick={() => onTabChange('wallet')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
            activeTab === 'wallet'
              ? 'text-green-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-5 h-5 mb-1" />
          <span className="text-xs">فلوسي (المحفظة)</span>
        </button>
      </div>
    </nav>
  );
}
