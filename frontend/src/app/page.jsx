'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  QrCode,
  MapPin,
  Building2,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { MobileShiftCard } from '@/components/MobileShiftCard';
import { DynamicQrModal } from '@/components/DynamicQrModal';
import { WalletLedgerView } from '@/components/WalletLedgerView';
import { WorkerAuthModal } from '@/components/WorkerAuthModal';
import { loadState, bookShift, TENTH_OF_RAMADAN_ZONES } from '@/lib/store';

export default function WorkerHomePage() {
  const [workerTab, setWorkerTab] = useState('shifts'); // 'shifts' | 'my-shifts' | 'wallet'
  const [selectedZone, setSelectedZone] = useState('all');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [state, setState] = useState(null);

  const refreshState = () => {
    setState(loadState());
  };

  useEffect(() => {
    refreshState();
    window.addEventListener('wardia_state_changed', refreshState);
    return () => window.removeEventListener('wardia_state_changed', refreshState);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-bold">
        جاري فتح تطبيق وردية...
      </div>
    );
  }

  const activeWorker = state.workers.find((w) => w.id === state.activeWorkerId) || state.workers[0];
  const workerBookings = state.bookings.filter((b) => b.worker_id === activeWorker.id);
  const latestBooking = workerBookings[0];
  const latestShift = latestBooking
    ? state.shifts.find((s) => s.id === latestBooking.shift_id)
    : null;
  const latestFactory = latestShift
    ? state.factories.find((f) => f.id === latestShift.factory_id)
    : null;

  // Filter shifts by zone in 10th of Ramadan
  const filteredShifts = state.shifts.filter((shift) => {
    if (selectedZone === 'all') return true;
    const factory = state.factories.find((f) => f.id === shift.factory_id);
    return factory?.industrial_zone === selectedZone;
  });

  const handleBook = (shiftId) => {
    const res = bookShift(shiftId, activeWorker.id);
    setToast(res);
    refreshState();
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Cairo',sans-serif]">
      {/* Worker App Header */}
      <AppHeader worker={activeWorker} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto p-4">
        {/* Simple Toast Message */}
        {toast && (
          <div
            className={`fixed top-16 left-4 right-4 max-w-md mx-auto z-50 p-4 rounded-2xl shadow-lg border flex items-start gap-3 transition-all ${
              toast.success
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {toast.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-bold leading-relaxed">{toast.message}</div>
          </div>
        )}

        {/* Worker Interface Exclusive Content */}
        <div className="space-y-4">
          {/* Welcome Banner with Quick QR Access */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-green-600" />
                <span>مدينة العاشر من رمضان</span>
              </div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                أهلاً بك، {activeWorker.full_name}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-500">
                <span>الرقم القومي: <strong className="text-slate-800">{activeWorker.national_id}</strong></span>
                <span>•</span>
                <span>كاش: <strong className="text-slate-800">{activeWorker.phone}</strong></span>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-green-700 font-bold underline mr-1 text-[10px]"
                >
                  تغيير البطاقة
                </button>
              </div>
            </div>

            {latestBooking ? (
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>كود الحضور</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                لا توجد حجوزات اليوم
              </span>
            )}
          </div>

          {/* TAB 1: Available Shifts in 10th of Ramadan */}
          {workerTab === 'shifts' && (
            <div className="space-y-3 pb-24">
              {/* Zones of 10th of Ramadan Filter */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-600 px-1">
                  اختر المنطقة الصناعية بالعاشر:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setSelectedZone('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                      selectedZone === 'all'
                        ? 'bg-green-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    كل مناطق العاشر ({state.shifts.length})
                  </button>
                  {TENTH_OF_RAMADAN_ZONES.map((zone) => (
                    <button
                      key={zone}
                      onClick={() => setSelectedZone(zone)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                        selectedZone === zone
                          ? 'bg-green-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shift Cards List */}
              <div className="space-y-3">
                {filteredShifts.length > 0 ? (
                  filteredShifts.map((shift) => {
                    const factory = state.factories.find((f) => f.id === shift.factory_id);
                    const isBooked = state.bookings.some(
                      (b) => b.shift_id === shift.id && b.worker_id === activeWorker.id
                    );

                    return (
                      <MobileShiftCard
                        key={shift.id}
                        shift={shift}
                        factory={factory}
                        isBookedByWorker={isBooked}
                        onBook={handleBook}
                        onShowQr={() => setIsQrModalOpen(true)}
                      />
                    );
                  })
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500">
                    لا توجد شواغر حالية في هذه المنطقة بالعاشر من رمضان، اختر منطقة أخرى للتصفح.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Worker Bookings */}
          {workerTab === 'my-shifts' && (
            <div className="space-y-3 pb-24">
              <div className="text-xs font-bold text-slate-600 px-1">
                الورديات المحجوزة لك في العاشر من رمضان ({workerBookings.length}):
              </div>

              {workerBookings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                  <p className="text-xs text-slate-500">لم تحجز أي وردية حتى الآن.</p>
                  <button
                    onClick={() => setWorkerTab('shifts')}
                    className="bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    تصفح ورديات العاشر من رمضان
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {workerBookings.map((booking) => {
                    const shift = state.shifts.find((s) => s.id === booking.shift_id);
                    const factory = state.factories.find((f) => f.id === shift?.factory_id);
                    const isAttended = booking.status === 'attended';

                    return (
                      <div
                        key={booking.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">{factory?.name}</span>
                          {isAttended ? (
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-md">
                              ✓ تم تسجيل الحضور
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                              حجز مؤكد - جاهز للدخول
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{shift?.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {factory?.industrial_zone} • {shift?.shift_date} من {shift?.start_time} إلى {shift?.end_time}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="font-black text-green-700 font-mono text-sm">
                            {shift?.worker_wage} جنيه
                          </div>
                          <button
                            onClick={() => setIsQrModalOpen(true)}
                            className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>كود الحضور بالبوابة</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Wallet */}
          {workerTab === 'wallet' && (
            <div className="pb-24">
              <WalletLedgerView
                worker={activeWorker}
                ledger={state.ledger}
                onRefresh={refreshState}
              />
            </div>
          )}

          {/* Professional Footer for Factory / Gate Links */}
          <footer className="pt-6 pb-20 border-t border-slate-200/80 text-center space-y-2">
            <p className="text-xs text-slate-500">
              منصة وردية - الشبكة المعتمدة لتشغيل العمالة الصناعية بمدينة العاشر من رمضان
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600">
              <Link
                href="/factory/login"
                className="hover:text-slate-900 underline flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>بوابة أصحاب المصانع</span>
              </Link>
              <span>•</span>
              <Link
                href="/gate"
                className="hover:text-slate-900 underline flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>بوابة مشرفي البوابات</span>
              </Link>
            </div>
          </footer>
        </div>

        {/* Worker Bottom Navigation */}
        <BottomNav
          activeTab={workerTab}
          onTabChange={setWorkerTab}
          hasActiveBooking={workerBookings.length > 0}
        />
      </main>

      {/* Dynamic QR Modal */}
      <DynamicQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        worker={activeWorker}
        activeBooking={latestBooking}
        shift={latestShift}
        factory={latestFactory}
      />

      {/* Worker National ID & Phone Auth Modal */}
      <WorkerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentWorker={activeWorker}
        workers={state.workers}
        onWorkerChanged={refreshState}
      />
    </div>
  );
}
