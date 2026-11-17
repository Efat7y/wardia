'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  FileText,
  Smartphone,
  ChevronDown,
  Shield,
  LogOut,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { loadState } from '@/lib/store';
import { OfficialRosterPrintModal } from '@/components/OfficialRosterPrintModal';
import { GateReportPrintModal } from '@/components/GateReportPrintModal';

export default function FactoryClientPortal() {
  const router = useRouter();
  const [state, setState] = useState(null);
  const [activeFactoryId, setActiveFactoryId] = useState(1);
  const [requestSent, setRequestSent] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, reports, gate_feed

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wardia_factory_active_tab', tab);
      window.location.hash = tab;
    }
  };

  const refresh = () => {
    setState(loadState());
  };

  useEffect(() => {
    const s = loadState();
    setState(s);

    if (typeof window !== 'undefined') {
      const savedFactoryId = localStorage.getItem('wardia_logged_factory_id');
      if (savedFactoryId) {
        setActiveFactoryId(Number(savedFactoryId));
      }

      // Restore activeTab from hash or localStorage
      const hash = window.location.hash.replace('#', '');
      const savedTab = localStorage.getItem('wardia_factory_active_tab');
      if (['overview', 'reports', 'gate_feed'].includes(hash)) {
        setActiveTab(hash);
      } else if (savedTab && ['overview', 'reports', 'gate_feed'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }

    window.addEventListener('wardia_state_changed', refresh);
    return () => window.removeEventListener('wardia_state_changed', refresh);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">
        جاري فتح بوابة المصنع...
      </div>
    );
  }

  const currentFactory =
    state.factories.find((f) => f.id === activeFactoryId) || state.factories[0];

  const factoryShifts = state.shifts.filter((s) => s.factory_id === currentFactory.id);
  const factoryShiftIds = factoryShifts.map((s) => s.id);
  const factoryBookings = state.bookings.filter((b) => factoryShiftIds.includes(b.shift_id));
  const attendedBookings = factoryBookings.filter((b) => b.status === 'attended');

  // Filter gate reports for THIS factory
  const gateReports = (state.gateReports || []).filter(
    (r) => r.factory_id === currentFactory.id
  );

  const totalSlotsNeeded = factoryShifts.reduce((acc, s) => acc + s.slots_needed, 0);
  const totalSlotsFilled = factoryShifts.reduce((acc, s) => acc + s.slots_filled, 0);

  // Quick Worker Request
  const handleQuickRequest = () => {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 4000);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wardia_logged_factory_id');
    }
    router.push('/factory/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Cairo',sans-serif]">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xs">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900">
                  لوحة إدارة المنشأة الصناعية
                </h1>
                <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200 hidden sm:inline-block">
                  حساب معتمد
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentFactory.name} • العاشر من رمضان
              </p>
            </div>
          </div>

          {/* Factory Selector & Actions */}
          <div className="flex items-center gap-2">
            <select
              value={activeFactoryId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setActiveFactoryId(newId);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('wardia_logged_factory_id', newId);
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-xs truncate"
            >
              {state.factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Factory Profile & Linked Gate Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-green-700 font-bold mb-1">
              <MapPin className="w-4 h-4" />
              <span>{currentFactory.industrial_zone}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{currentFactory.name}</h2>
            <div className="text-xs text-slate-500 mt-1 font-mono flex flex-wrap gap-x-3 gap-y-1">
              <span>السجل: {currentFactory.tax_record}</span>
              <span>•</span>
              <span className="text-slate-800 font-bold">
                إيميل الإدارة: {currentFactory.manager_email || 'غير محدد'}
              </span>
            </div>

            {/* Linked Gate Security Account Badge */}
            <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs text-blue-900">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                البوابة المرتبطة: <strong>{currentFactory.gate_name || 'البوابة الرئيسية'}</strong> (
                {currentFactory.gate_email})
              </span>
            </div>
          </div>

          {/* Quick Request & Security Roster Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs transition active:scale-95"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>كشف أمني رسمي (طباعة)</span>
            </button>

            <button
              onClick={handleQuickRequest}
              className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs transition active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>طلب عمالة إضافية</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {requestSent && (
          <div className="bg-green-50 border border-green-200 text-green-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>
              تم إرسال طلبكم فوراً إلى فريق عمليات وردية بالعاشر، وسيتم تجهيز العمال وتأكيد الوردية معكم هاتفياً الآن!
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            نظرة عامة والورديات
          </button>
          <button
            onClick={() => handleTabChange('reports')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>تقارير الأمن المرفوعة ({gateReports.length})</span>
          </button>
          <button
            onClick={() => handleTabChange('gate_feed')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gate_feed'
                ? 'bg-green-700 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>كشف الحضور اللحظي بالبوابة ({attendedBookings.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="text-xs text-slate-500 font-bold mb-1">العمال المطلوبين في وردياتكم</div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {totalSlotsFilled}{' '}
                  <span className="text-sm font-bold text-slate-400">/ {totalSlotsNeeded}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  نسبة الاكتمال:{' '}
                  {totalSlotsNeeded > 0
                    ? Math.round((totalSlotsFilled / totalSlotsNeeded) * 100)
                    : 0}
                  %
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="text-xs text-slate-500 font-bold mb-1">العمال الحاضرين بالبوابة اليوم</div>
                <div className="text-3xl font-black text-green-700 font-mono">
                  {attendedBookings.length}{' '}
                  <span className="text-sm font-bold text-slate-400">عامل</span>
                </div>
                <div className="text-xs text-green-700 font-bold mt-1">
                  تم فحص بطاقاتهم وبصمة الـ QR بالبوابة
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="text-xs text-slate-500 font-bold mb-1">تقارير أمن البوابة المستلمة</div>
                <div className="text-3xl font-black text-blue-600 font-mono">
                  {gateReports.length}{' '}
                  <span className="text-sm font-bold text-slate-400">تقرير</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">مرفوعة ومعتمدة من ضباط الأمن</div>
              </div>
            </div>

            {/* Active Shifts List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">ورديات مصنعكم النشطة اليوم:</h3>

              <div className="space-y-3">
                {factoryShifts.map((shift) => {
                  const bookings = factoryBookings.filter((b) => b.shift_id === shift.id);
                  const attended = bookings.filter((b) => b.status === 'attended');

                  return (
                    <div
                      key={shift.id}
                      className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{shift.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {shift.shift_date} من الساعة {shift.start_time} إلى {shift.end_time} • يومية:{' '}
                          <strong className="text-slate-900 font-mono">{shift.worker_wage} ج.م</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl">
                          حجز: {shift.slots_filled} / {shift.slots_needed}
                        </span>
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-xl">
                          حضر بالبوابة: {attended.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GATE SECURITY REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>التقارير اليومية المرفوعة من أمن البوابة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تقارير تسلمها الإدارة فورياً من بوابة ({currentFactory.gate_name || 'البوابة الرئيسية'})
                </p>
              </div>
            </div>

            {gateReports.length > 0 ? (
              <div className="space-y-4">
                {gateReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {report.report_title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>تاريخ التقرير: {report.report_date}</span>
                          <span>•</span>
                          <span>المسؤول: {report.security_officer_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-800 bg-green-100 px-3 py-1 rounded-xl">
                          حضور: {report.total_attended} عامل
                        </span>
                        <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-xl">
                          غياب: {report.total_absent}
                        </span>
                        <button
                          onClick={() => setSelectedReportForPrint(report)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>طباعة التقرير (A4)</span>
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      <strong className="text-slate-900 block mb-1">ملاحظات مسؤول الأمن:</strong>
                      {report.notes || 'لا توجد ملاحظات إضافية.'}
                    </div>

                    {/* Workers list attached to report */}
                    {report.workers_summary && report.workers_summary.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-extrabold text-slate-600">
                          قائمة العمال المرفقة بالتقرير:
                        </div>
                        <div className="max-h-32 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white p-1 text-xs">
                          {report.workers_summary.map((w, idx) => (
                            <div key={idx} className="p-2 flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                {w.worker_name}{' '}
                                <span className="font-mono text-slate-400 font-normal">
                                  ({w.national_id})
                                </span>
                              </span>
                              <span className="font-mono text-green-700 font-bold">
                                {w.check_in_time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl text-xs text-slate-500">
                لم يتم رفع تقارير أمنية لهذا المصنع حتى الآن. يقوم مسؤول أمن البوابة برفع التقرير بضغطة زر من شاشته.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE GATE FEED */}
        {activeTab === 'gate_feed' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>كشف حضور العمال بالبوابة (تحديث مباشر)</span>
              </h3>
              <span className="text-xs text-slate-500">يظهر هنا كل عامل فور عبوره البوابة</span>
            </div>

            <div className="divide-y divide-slate-100">
              {factoryBookings.length > 0 ? (
                factoryBookings.map((b) => {
                  const worker = state.workers.find((w) => w.id === b.worker_id);
                  const shift = state.shifts.find((s) => s.id === b.shift_id);
                  const isAttended = b.status === 'attended';

                  return (
                    <div
                      key={b.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{worker?.full_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          الرقم القومي: {worker?.national_id} • كاش: {worker?.phone} • {shift?.title}
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        {isAttended ? (
                          <span className="text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-lg">
                            حضر الساعة {new Date(b.check_in_at).toLocaleTimeString('ar-EG')}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg font-bold">
                            في انتظار وصوله
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  لا توجد حجوزات مسجلة لهذا المصنع حالياً.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Official Security Roster Print/Export Modal */}
      <OfficialRosterPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        factory={currentFactory}
        shifts={state.shifts}
        bookings={state.bookings}
        workers={state.workers}
      />

      {/* Official Gate Security Report Print Modal */}
      <GateReportPrintModal
        isOpen={Boolean(selectedReportForPrint)}
        onClose={() => setSelectedReportForPrint(null)}
        report={selectedReportForPrint}
        factory={currentFactory}
      />
    </div>
  );
}
