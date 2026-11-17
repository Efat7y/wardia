'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plus,
  Building2,
  Users,
  Coins,
  TrendingUp,
  MapPin,
  CheckCircle2,
  X,
  PhoneCall,
  Smartphone,
  ExternalLink,
  FileText,
  Search,
  Filter,
  Eye,
  Edit2,
  Pencil,
  Trash2,
  Printer,
  Download,
  AlertTriangle,
  BadgeCheck,
  UserX,
  CreditCard,
  Briefcase,
  Layers,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  loadState,
  createShift,
  updateShift,
  deleteShift,
  createFactory,
  updateWorkerStatus,
  TENTH_OF_RAMADAN_ZONES,
} from '@/lib/store';
import { OfficialRosterPrintModal } from '@/components/OfficialRosterPrintModal';
import { WorkerDossierModal } from '@/components/WorkerDossierModal';
import { FactoryStatementModal } from '@/components/FactoryStatementModal';

export default function AdminOpsDashboard() {
  const [state, setState] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'workers', 'factories', 'shifts', 'ledger'

  // Modals state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isFactoryModalOpen, setIsFactoryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintFactoryId, setSelectedPrintFactoryId] = useState(1);

  // Worker Dossier Modal
  const [selectedWorkerForDossier, setSelectedWorkerForDossier] = useState(null);

  // Factory Statement Modal
  const [selectedFactoryForStatement, setSelectedFactoryForStatement] = useState(null);

  // Search & Filter States
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [workerStatusFilter, setWorkerStatusFilter] = useState('all');
  const [factoryZoneFilter, setFactoryZoneFilter] = useState('all');

  // Shift Form & Edit State
  const [editingShift, setEditingShift] = useState(null);
  const [factoryInputMode, setFactoryInputMode] = useState('existing'); // 'existing' | 'new'
  const [customFactoryName, setCustomFactoryName] = useState('');
  const [customFactoryZone, setCustomFactoryZone] = useState(TENTH_OF_RAMADAN_ZONES[0]);
  const [selectedFactoryId, setSelectedFactoryId] = useState(1);
  const [shiftTitle, setShiftTitle] = useState('');
  const [factoryPrice, setFactoryPrice] = useState('440');
  const [workerWage, setWorkerWage] = useState('380');
  const [slotsNeeded, setSlotsNeeded] = useState('20');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [transitStop, setTransitStop] = useState('موقف الأردنية');

  // New Factory Form State
  const [newFactoryName, setNewFactoryName] = useState('');
  const [newFactoryTax, setNewFactoryTax] = useState('');
  const [newFactoryZone, setNewFactoryZone] = useState(TENTH_OF_RAMADAN_ZONES[0]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wardia_admin_active_tab', tab);
      window.location.hash = tab;
    }
  };

  const refresh = () => {
    setState(loadState());
  };

  useEffect(() => {
    refresh();

    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const savedTab = localStorage.getItem('wardia_admin_active_tab');
      if (['overview', 'workers', 'factories', 'shifts', 'ledger'].includes(hash)) {
        setActiveTab(hash);
      } else if (savedTab && ['overview', 'workers', 'factories', 'shifts', 'ledger'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }

    window.addEventListener('wardia_state_changed', refresh);
    return () => window.removeEventListener('wardia_state_changed', refresh);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-bold">
        جاري تحميل لوحة عمليات وردية المركزية...
      </div>
    );
  }

  // Calculations
  const totalSlotsFilled = state.shifts.reduce((acc, s) => acc + s.slots_filled, 0);
  const attendedCount = state.bookings.filter((b) => b.status === 'attended').length;
  const platformCommissionPerWorker = 50;
  const totalCommissionEarned = attendedCount * platformCommissionPerWorker;
  const totalWagesEarned = state.ledger
    .filter((l) => l.amount > 0)
    .reduce((acc, l) => acc + l.amount, 0);

  const calculatedCommission = Math.max(
    0,
    (parseFloat(factoryPrice) || 0) - (parseFloat(workerWage) || 0)
  );

  // Open Create Shift Modal
  const openCreateShiftModal = () => {
    setEditingShift(null);
    setFactoryInputMode('existing');
    setSelectedFactoryId(state?.factories?.[0]?.id || 1);
    setCustomFactoryName('');
    setCustomFactoryZone(TENTH_OF_RAMADAN_ZONES[0]);
    setShiftTitle('');
    setFactoryPrice('440');
    setWorkerWage('380');
    setSlotsNeeded('20');
    setStartTime('08:00');
    setEndTime('16:00');
    setTransitStop('موقف الأردنية');
    setIsShiftModalOpen(true);
  };

  // Open Edit Shift Modal
  const openEditShiftModal = (shift) => {
    setEditingShift(shift);
    setFactoryInputMode('existing');
    setSelectedFactoryId(shift.factory_id);
    setCustomFactoryName('');
    setCustomFactoryZone(TENTH_OF_RAMADAN_ZONES[0]);
    setShiftTitle(shift.title);
    const comm = shift.service_fee || 50;
    setWorkerWage(shift.worker_wage?.toString() || '380');
    setFactoryPrice(((shift.worker_wage || 380) + comm).toString());
    setSlotsNeeded(shift.slots_needed?.toString() || '10');
    setStartTime(shift.start_time || '08:00');
    setEndTime(shift.end_time || '16:00');

    let stop = 'موقف الأردنية';
    if (shift.description) {
      const stops = [
        'موقف الأردنية',
        'صينية سيتي سنتر',
        'كوبري 54',
        'موقف الكيلو 4.5',
        'موقف بلبيس بالعاشر',
      ];
      for (const s of stops) {
        if (shift.description.includes(s)) {
          stop = s;
          break;
        }
      }
    }
    setTransitStop(stop);
    setIsShiftModalOpen(true);
  };

  // Handle Shift Creation or Update
  const handleSaveShift = (e) => {
    e.preventDefault();
    if (!shiftTitle.trim()) return;

    const wage = parseFloat(workerWage) || 380;
    const fPrice = parseFloat(factoryPrice) || 440;
    const commission = Math.max(0, fPrice - wage);
    const slots = parseInt(slotsNeeded, 10) || 10;

    const shiftPayload = {
      title: shiftTitle.trim(),
      description: `تشمل وجبة ساخنة ومواصلات من ${transitStop}.`,
      shift_date: editingShift?.shift_date || new Date().toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      worker_wage: wage,
      service_fee: commission,
      slots_needed: slots,
      status: editingShift?.status || 'open',
    };

    if (factoryInputMode === 'new' && customFactoryName.trim()) {
      shiftPayload.factory_name = customFactoryName.trim();
      shiftPayload.industrial_zone = customFactoryZone;
    } else {
      shiftPayload.factory_id = Number(selectedFactoryId);
    }

    if (editingShift) {
      updateShift(editingShift.id, shiftPayload);
    } else {
      createShift(shiftPayload);
    }

    refresh();
    setIsShiftModalOpen(false);
    setEditingShift(null);
    setShiftTitle('');
    setCustomFactoryName('');
  };

  // Handle Shift Deletion
  const handleDeleteShift = (shift) => {
    if (
      typeof window !== 'undefined' &&
      window.confirm(`هل أنت متأكد من رغبتك في حذف وردية "${shift.title}" نهائياً من المنظومة؟`)
    ) {
      deleteShift(shift.id);
      refresh();
    }
  };

  // Handle Factory Creation
  const handleCreateFactory = (e) => {
    e.preventDefault();
    if (!newFactoryName.trim() || !newFactoryTax.trim()) return;

    createFactory({
      name: newFactoryName,
      tax_record: newFactoryTax,
      industrial_zone: newFactoryZone,
      latitude: 30.2982,
      longitude: 31.7456,
    });

    refresh();
    setIsFactoryModalOpen(false);
    setNewFactoryName('');
    setNewFactoryTax('');
  };

  // Filtered Workers
  const filteredWorkers = state.workers.filter((w) => {
    const matchesSearch =
      w.full_name?.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      w.national_id?.includes(workerSearchQuery) ||
      w.phone?.includes(workerSearchQuery);

    const matchesStatus =
      workerStatusFilter === 'all' || w.status === workerStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered Factories
  const filteredFactories = state.factories.filter((f) => {
    if (factoryZoneFilter === 'all') return true;
    return f.industrial_zone === factoryZoneFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-['Cairo',sans-serif]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 px-4 sm:px-6 py-3.5 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xs">
              و
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900">
                  إدارة منصة وردية المركزية
                </h1>
                <span className="text-[10px] bg-green-50 text-green-800 border border-green-200 font-bold px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                إدارة العمال، المصانع، كشوف الحساب، والورديات بمدينة العاشر من رمضان
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-green-700" />
              <span>تطبيق العامل</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>كشف أمني (A4)</span>
            </button>

            <button
              onClick={() => setIsFactoryModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>إضافة مصنع</span>
            </button>

            <button
              onClick={openCreateShiftModal}
              className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>إضافة وردية</span>
            </button>
          </div>
        </div>

        {/* Responsive Pill Tabs Navigation */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>نظرة عامة والعمليات</span>
          </button>

          <button
            onClick={() => handleTabChange('workers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
              activeTab === 'workers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>إدارة وسجلات العمال ({state.workers.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('factories')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
              activeTab === 'factories'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>إدارة المصانع والحسابات ({state.factories.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('shifts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
              activeTab === 'shifts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>تشغيل الورديات ({state.shifts.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('ledger')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>الدفتر المالي والعمولات ({state.ledger.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 4 Operations KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">أرباح وعمولات المنصة</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {totalCommissionEarned.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs text-slate-400 font-bold">ج.م</span>
                </div>
                <div className="text-[11px] text-green-700 font-bold mt-1">
                  محصلة من حضور العمال المؤكد بالبوابات
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">إجمالي أجور العمال المدفوعة</span>
                  <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {totalWagesEarned.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs text-slate-400 font-bold">ج.م</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">يوميات وأوفر تايم بمحافظ العمال</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">الحضور المؤكد بالبوابات</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-green-700 font-mono">
                  {attendedCount} <span className="text-sm text-slate-400 font-bold">حضروا</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  تم فحص بطاقاتهم ومسح كود الـ QR
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">شبكة مصانع العاشر</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {state.factories.length} <span className="text-sm text-slate-400 font-bold">منشأة</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  في كافة المناطق (A1, A2, A3, A4, المطورين)
                </div>
              </div>
            </div>

            {/* Live Gate Feed & Shift Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Live Gate Feed */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>متابعة بوابات مصانع العاشر لحظة بلحظة</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">تحديث مباشر</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {state.bookings.map((booking) => {
                    const worker = state.workers.find((w) => w.id === booking.worker_id);
                    const shift = state.shifts.find((s) => s.id === booking.shift_id);
                    const factory = state.factories.find((f) => f.id === shift?.factory_id);
                    const isAttended = booking.status === 'attended';

                    return (
                      <div
                        key={booking.id}
                        className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{worker?.full_name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {shift?.title} • {factory?.name}
                          </div>
                          {booking.check_in_at && (
                            <div className="text-[10px] text-green-700 font-mono font-bold mt-1">
                              وقت الدخول: {new Date(booking.check_in_at).toLocaleTimeString('ar-EG')}
                            </div>
                          )}
                        </div>

                        <div>
                          {isAttended ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-green-100 text-green-800">
                              حضر بالبوابة ✓
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800">
                              حجز مؤكد
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Shifts Summary */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-green-700" />
                    <span>الورديات الجارية اليوم بمصانع العاشر</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('shifts')}
                    className="text-xs text-green-700 font-bold hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {state.shifts.slice(0, 5).map((shift) => {
                    const factory = state.factories.find((f) => f.id === shift.factory_id);
                    const shiftBookings = state.bookings.filter((b) => b.shift_id === shift.id);
                    const attended = shiftBookings.filter((b) => b.status === 'attended');

                    return (
                      <div
                        key={shift.id}
                        className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{shift.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {factory?.name} ({factory?.industrial_zone})
                          </div>
                        </div>

                        <div className="text-left font-mono">
                          <div className="text-xs text-slate-800 font-bold">
                            {shift.slots_filled} / {shift.slots_needed} عمال
                          </div>
                          <div className="text-[10px] text-green-700 font-bold">
                            {attended.length} حضروا
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: WORKERS DOSSIERS & MANAGEMENT ================= */}
        {activeTab === 'workers' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in">
            {/* Header + Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  إدارة وسجلات العمال المعتمدين بالعاشر من رمضان
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  متابعة حالة كل عامل، سجله الأمني، كشف حساب يومياته، وطباعة بيان حالة معتمد لأي مصنع
                </p>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={workerSearchQuery}
                    onChange={(e) => setWorkerSearchQuery(e.target.value)}
                    placeholder="بحث بالاسم أو الرقم القومي أو الموبايل..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-green-600"
                  />
                </div>

                <select
                  value={workerStatusFilter}
                  onChange={(e) => setWorkerStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط فقط</option>
                  <option value="restricted">مقيد</option>
                  <option value="blocked">محظور</option>
                </select>
              </div>
            </div>

            {/* Mobile View: Responsive Cards (sm:hidden) */}
            <div className="sm:hidden space-y-3">
              {filteredWorkers.map((worker) => {
                const hasMeeza = Boolean(worker.meeza_card_number);

                return (
                  <div
                    key={worker.id}
                    className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{worker.full_name}</span>
                          <BadgeCheck className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          الرقم القومي: {worker.national_id}
                        </div>
                        <div className="text-[11px] text-green-700 font-mono">
                          موبايل/كاش: {worker.phone}
                        </div>
                      </div>

                      <div>
                        {worker.status === 'active' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            نشط ✓
                          </span>
                        )}
                        {worker.status === 'restricted' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            مقيد ⚠️
                          </span>
                        )}
                        {worker.status === 'blocked' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            محظور ⛔
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                      <div>
                        كارت ميزة: {hasMeeza ? (
                          <span className="font-mono font-bold text-amber-700">•••• {worker.meeza_card_number.slice(-4)}</span>
                        ) : (
                          <span className="text-slate-400">غير مسجل</span>
                        )}
                      </div>
                      <div>
                        انضباط: <strong className="text-green-700 font-mono">{worker.attendance_score}%</strong>
                      </div>
                      <div>
                        رصيد: <strong className="font-mono text-slate-800">{worker.wallet_balance || 0} ج.م</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedWorkerForDossier(worker)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>فتح ملف وسجل العامل (A4)</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Professional Table (hidden sm:block) */}
            <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">العامل</th>
                    <th className="p-3.5">الرقم القومي (14 رقم)</th>
                    <th className="p-3.5">الموبايل / كاش</th>
                    <th className="p-3.5">كارت ميزة</th>
                    <th className="p-3.5">تقييم الانضباط</th>
                    <th className="p-3.5">رصيد المحفظة</th>
                    <th className="p-3.5">الحالة الأمنية</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredWorkers.map((worker) => {
                    const hasMeeza = Boolean(worker.meeza_card_number);

                    return (
                      <tr key={worker.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{worker.full_name}</span>
                            <BadgeCheck className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            مسجل منذ: {new Date(worker.created_at).toLocaleDateString('ar-EG')}
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-800">
                          {worker.national_id}
                        </td>

                        <td className="p-3.5 font-mono text-green-700 font-bold">
                          {worker.phone}
                        </td>

                        <td className="p-3.5">
                          {hasMeeza ? (
                            <span className="text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              •••• {worker.meeza_card_number.slice(-4)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">غير مسجل</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-green-700">
                              {worker.attendance_score}%
                            </span>
                            <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600"
                                style={{ width: `${worker.attendance_score}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {worker.wallet_balance || 0} ج.م
                        </td>

                        <td className="p-3.5">
                          {worker.status === 'active' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-green-50 text-green-800 border border-green-200">
                              نشط ومصرح له
                            </span>
                          )}
                          {worker.status === 'restricted' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              مقيد مؤقتاً
                            </span>
                          )}
                          {worker.status === 'blocked' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                              محظور
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedWorkerForDossier(worker)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 mx-auto transition active:scale-95 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>ملف وسجل العامل (A4)</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FACTORIES MANAGEMENT & BILLING ================= */}
        {activeTab === 'factories' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in">
            {/* Header + Zone Filter & Add Factory */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  إدارة شبكة مصانع العاشر من رمضان والمطالبات المالية
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  متابعة حالة المنشآت، كشوف الحساب، توريد العمالة، وطباعة الفواتير الرسمية
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={factoryZoneFilter}
                  onChange={(e) => setFactoryZoneFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">جميع المناطق الصناعية بالعاشر</option>
                  {TENTH_OF_RAMADAN_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsFactoryModalOpen(true)}
                  className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>تسجيل مصنع جديد</span>
                </button>
              </div>
            </div>

            {/* Mobile View: Responsive Cards (sm:hidden) */}
            <div className="sm:hidden space-y-3">
              {filteredFactories.map((factory) => {
                const factoryShifts = state.shifts.filter((s) => s.factory_id === factory.id);
                const factoryShiftIds = factoryShifts.map((s) => s.id);
                const factoryBookings = state.bookings.filter((b) =>
                  factoryShiftIds.includes(b.shift_id)
                );
                const attended = factoryBookings.filter((b) => b.status === 'attended');
                const estimatedBilling = attended.length * 430;

                return (
                  <div
                    key={factory.id}
                    className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{factory.name}</div>
                        <div className="text-[11px] text-green-700 font-bold mt-0.5">
                          {factory.industrial_zone}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          السجل الصناعي: {factory.tax_record}
                        </div>
                      </div>
                      <span className="font-mono font-black text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded-lg">
                        {estimatedBilling.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                      <span>الورديات: <strong className="font-mono">{factoryShifts.length}</strong></span>
                      <span>العمال الحاضرين: <strong className="font-mono text-green-700">{attended.length}</strong></span>
                      <span className="text-green-700 font-bold">موثق ✓</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setSelectedFactoryForStatement(factory)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition shadow-xs"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>فاتورة (A4)</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPrintFactoryId(factory.id);
                          setIsPrintModalOpen(true);
                        }}
                        className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-green-700" />
                        <span>كشف أمني</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Professional Table (hidden sm:block) */}
            <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">المنشأة الصناعية</th>
                    <th className="p-3.5">المنطقة بالعاشر</th>
                    <th className="p-3.5">السجل الصناعي</th>
                    <th className="p-3.5">الورديات المشغلة</th>
                    <th className="p-3.5">العمال الحاضرين</th>
                    <th className="p-3.5">إجمالي المطالبة</th>
                    <th className="p-3.5 text-center">الإجراءات والتقارير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredFactories.map((factory) => {
                    const factoryShifts = state.shifts.filter((s) => s.factory_id === factory.id);
                    const factoryShiftIds = factoryShifts.map((s) => s.id);
                    const factoryBookings = state.bookings.filter((b) =>
                      factoryShiftIds.includes(b.shift_id)
                    );
                    const attended = factoryBookings.filter((b) => b.status === 'attended');
                    const estimatedBilling = attended.length * 430;

                    return (
                      <tr key={factory.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-sm">{factory.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            إدارة: <strong className="text-slate-700">{factory.manager_email || 'غير محدد'}</strong>
                          </div>
                          <div className="text-[10px] text-blue-700 font-mono mt-0.5 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-blue-600" />
                            <span>بوابة الأمن: <strong>{factory.gate_email || 'غير محدد'}</strong></span>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-800 font-bold">
                          {factory.industrial_zone}
                        </td>

                        <td className="p-3.5 font-mono text-slate-600 font-bold">
                          {factory.tax_record}
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {factoryShifts.length} ورديات
                        </td>

                        <td className="p-3.5 font-mono font-bold text-green-700">
                          {attended.length} عامل
                        </td>

                        <td className="p-3.5 font-mono font-black text-slate-900">
                          {estimatedBilling.toLocaleString('ar-EG')} ج.م
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedFactoryForStatement(factory)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-xs"
                            >
                              <Coins className="w-3.5 h-3.5 text-amber-400" />
                              <span>كشف الحساب والفاتورة (A4)</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedPrintFactoryId(factory.id);
                                setIsPrintModalOpen(true);
                              }}
                              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5 text-green-700" />
                              <span>كشف أمني</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SHIFTS MANAGEMENT ================= */}
        {activeTab === 'shifts' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  إدارة وتشغيل ورديات مصانع العاشر من رمضان
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديد ساعات العمل، الأجور، عمولة المنصة، ومتابعة حجز العمال مع إمكانية التعديل والحذف
                </p>
              </div>

              <button
                onClick={openCreateShiftModal}
                className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>إضافة وردية جديدة</span>
              </button>
            </div>

            {/* Mobile View: Responsive Cards (sm:hidden) */}
            <div className="sm:hidden space-y-3">
              {state.shifts.map((shift) => {
                const factory = state.factories.find((f) => f.id === shift.factory_id);
                const shiftBookings = state.bookings.filter((b) => b.shift_id === shift.id);
                const attended = shiftBookings.filter((b) => b.status === 'attended');
                const commission = shift.service_fee || 50;

                return (
                  <div
                    key={shift.id}
                    className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{shift.title}</div>
                        <div className="text-[11px] text-slate-500">{factory?.name} ({factory?.industrial_zone})</div>
                      </div>
                      <span className="font-mono font-black text-green-700 text-xs bg-green-100 px-2 py-0.5 rounded-lg">
                        {shift.worker_wage} ج.م
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span>حجز: <strong className="font-mono">{shift.slots_filled} / {shift.slots_needed}</strong></span>
                      <span>حضر: <strong className="font-mono text-green-700">{attended.length}</strong></span>
                      <span>عمولة: <strong className="font-mono text-amber-700">+{commission} ج.م</strong></span>
                    </div>

                    {/* Mobile Shift Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/70">
                      <button
                        onClick={() => openEditShiftModal(shift)}
                        className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition text-xs shadow-2xs"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeleteShift(shift)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition text-xs shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table (hidden sm:block) */}
            <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">الوردية</th>
                    <th className="p-3.5">المصنع والمنطقة</th>
                    <th className="p-3.5">سعر المصنع</th>
                    <th className="p-3.5">يومية العامل</th>
                    <th className="p-3.5">عمولة وردية</th>
                    <th className="p-3.5">حجز العمال</th>
                    <th className="p-3.5">الحضور المؤكد</th>
                    <th className="p-3.5 text-center">التحكم والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {state.shifts.map((shift) => {
                    const factory = state.factories.find((f) => f.id === shift.factory_id);
                    const shiftBookings = state.bookings.filter((b) => b.shift_id === shift.id);
                    const attended = shiftBookings.filter((b) => b.status === 'attended');
                    const commissionPerShift = shift.service_fee || 50;

                    return (
                      <tr key={shift.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-sm">{shift.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {shift.shift_date} • من {shift.start_time} إلى {shift.end_time}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{factory?.name}</div>
                          <div className="text-[10px] text-green-700 font-bold mt-0.5">
                            {factory?.industrial_zone}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">
                          {shift.worker_wage + commissionPerShift} ج.م
                        </td>
                        <td className="p-3.5 font-mono font-bold text-green-700">
                          {shift.worker_wage} ج.م
                        </td>
                        <td className="p-3.5 font-mono font-black text-amber-700 bg-amber-50/50">
                          +{commissionPerShift} ج.م / عامل
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {shift.slots_filled} / {shift.slots_needed}
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-800 border border-green-200">
                            {attended.length} حضروا
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditShiftModal(shift)}
                              title="تعديل بيانات الوردية"
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition font-bold flex items-center gap-1 text-[11px]"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600" />
                              <span>تعديل</span>
                            </button>
                            <button
                              onClick={() => handleDeleteShift(shift)}
                              title="حذف الوردية نهائياً"
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 transition font-bold flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: FINANCIAL LEDGER & PAYOUTS ================= */}
        {activeTab === 'ledger' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  دفتر العمليات المالية المحمي (Immutable Financial Ledger)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سجل غير قابل للتعديل أو الحذف لتوثيق كل حركة أموال من يوميات وأوفر تايم وسحوبات كاش وميزة
                </p>
              </div>

              <div className="text-left font-mono text-xs">
                <span className="text-slate-500">إجمالي الحركات: </span>
                <span className="font-bold text-green-800">{state.ledger.length} قيد مالي</span>
              </div>
            </div>

            {/* Mobile View: Responsive Cards (sm:hidden) */}
            <div className="sm:hidden space-y-2.5">
              {state.ledger.map((entry) => {
                const worker = state.workers.find((w) => w.id === entry.worker_id);
                const isEarned = entry.amount > 0;

                return (
                  <div
                    key={entry.id}
                    className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{worker?.full_name || 'عامل'}</span>
                      <span className={`font-mono font-black ${isEarned ? 'text-green-700' : 'text-amber-700'}`}>
                        {isEarned ? '+' : ''}{entry.amount} ج.م
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span>{entry.notes}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(entry.created_at).toLocaleTimeString('ar-EG')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table (hidden sm:block) */}
            <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">رقم القيد</th>
                    <th className="p-3.5">العامل المستفيد</th>
                    <th className="p-3.5">نوع المعاملة</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">البيان والتفاصيل</th>
                    <th className="p-3.5">توقيت القيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {state.ledger.map((entry) => {
                    const worker = state.workers.find((w) => w.id === entry.worker_id);
                    const isEarned = entry.amount > 0;

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-mono text-slate-400">#{entry.id}</td>
                        <td className="p-3.5 font-bold text-slate-900">{worker?.full_name || 'عامل'}</td>
                        <td className="p-3.5">
                          {isEarned ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
                              إيداع يومية / أوفر تايم
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              صرف نقدي (كاش/ميزة)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-black">
                          <span className={isEarned ? 'text-green-700' : 'text-amber-700'}>
                            {isEarned ? '+' : ''}
                            {entry.amount} ج.م
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700">{entry.notes}</td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                          {new Date(entry.created_at).toLocaleString('ar-EG')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT SHIFT ================= */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingShift ? `تعديل بيانات الوردية (#${editingShift.id})` : 'إضافة وردية لمصنع بالعاشر'}
                </h3>
                <p className="text-xs text-green-700 font-bold">
                  {editingShift ? 'تحديث الأسعار وساعات العمل والمصنع المتعاقد' : 'حساب أوتوماتيكي لعمولة المنصة وإضافة المنشآت'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsShiftModalOpen(false);
                  setEditingShift(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-3.5 text-xs">
              {/* Factory Selection / Dynamic Entry */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-bold">المنشأة الصناعية أو الشركة:</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setFactoryInputMode('existing')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        factoryInputMode === 'existing'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      اختيار مسجل
                    </button>
                    <button
                      type="button"
                      onClick={() => setFactoryInputMode('new')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        factoryInputMode === 'new'
                          ? 'bg-green-700 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      + شركة / مصنع جديد
                    </button>
                  </div>
                </div>

                {factoryInputMode === 'existing' ? (
                  <select
                    value={selectedFactoryId}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setFactoryInputMode('new');
                      } else {
                        setSelectedFactoryId(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-green-600 cursor-pointer"
                  >
                    {state.factories.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.industrial_zone})
                      </option>
                    ))}
                    <option value="__NEW__" className="text-green-700 font-bold">
                      + تسجيل اسم مصنع أو شركة جديدة...
                    </option>
                  </select>
                ) : (
                  <div className="space-y-2.5 bg-green-50/60 p-3 rounded-2xl border border-green-200 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] text-green-950 font-bold mb-1">
                        اسم المنشأة أو الشركة الجديدة:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: مصنع النيل للصناعات الكيماوية والدهانات"
                        value={customFactoryName}
                        onChange={(e) => setCustomFactoryName(e.target.value)}
                        className="w-full bg-white border border-green-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-green-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-green-950 font-bold mb-1">
                        المنطقة الصناعية بالعاشر من رمضان:
                      </label>
                      <select
                        value={customFactoryZone}
                        onChange={(e) => setCustomFactoryZone(e.target.value)}
                        className="w-full bg-white border border-green-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none cursor-pointer"
                      >
                        {TENTH_OF_RAMADAN_ZONES.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-green-700 font-semibold leading-relaxed">
                      * سيتم حفظ المنشأة وإضافتها تلقائياً إلى قائمة مصانع العاشر المعتمدة لتظهر في السيلكتور مستقبلاً.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">عنوان الوردية وطبيعة الشغل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعبئة وتغليف كرتون، خط تجميع خفيف..."
                  value={shiftTitle}
                  onChange={(e) => setShiftTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سعر المصنع للوردية:</label>
                  <input
                    type="number"
                    required
                    value={factoryPrice}
                    onChange={(e) => setFactoryPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">يومية العامل المستحقة:</label>
                  <input
                    type="number"
                    required
                    value={workerWage}
                    onChange={(e) => setWorkerWage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-green-700 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Commission Alert */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                <span className="text-green-800 font-bold">عمولة منصة وردية الصافية:</span>
                <span className="text-green-800 font-mono font-black text-sm">
                  +{calculatedCommission} ج.م / عامل
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">العمال المطلوبين:</label>
                  <input
                    type="number"
                    required
                    value={slotsNeeded}
                    onChange={(e) => setSlotsNeeded(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">نقطة تجمع المواصلات:</label>
                  <select
                    value={transitStop}
                    onChange={(e) => setTransitStop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="موقف الأردنية">موقف الأردنية</option>
                    <option value="صينية سيتي سنتر">صينية سيتي سنتر</option>
                    <option value="كوبري 54">كوبري 54</option>
                    <option value="موقف الكيلو 4.5">موقف الكيلو 4.5</option>
                    <option value="موقف بلبيس بالعاشر">موقف بلبيس بالعاشر</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">وقت بدء الوردية:</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">وقت انتهاء الوردية:</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsShiftModalOpen(false);
                    setEditingShift(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-extrabold shadow-xs transition active:scale-95"
                >
                  {editingShift ? 'حفظ تعديلات الوردية' : 'نشر الوردية الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD FACTORY ================= */}
      {isFactoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">تسجيل منشأة صناعية جديدة</h3>
                <p className="text-xs text-sky-700 font-bold">إضافة مصنع إلى شبكة مدينة العاشر من رمضان</p>
              </div>
              <button
                onClick={() => setIsFactoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFactory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المصنع / الشركة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مصنع النور للصناعات الغذائية والتعبئة"
                  value={newFactoryName}
                  onChange={(e) => setNewFactoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">السجل التجاري / الصناعي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: TR-10R-88120"
                  value={newFactoryTax}
                  onChange={(e) => setNewFactoryTax(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المنطقة الصناعية بالعاشر:</label>
                <select
                  value={newFactoryZone}
                  onChange={(e) => setNewFactoryZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  {TENTH_OF_RAMADAN_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFactoryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-xs transition active:scale-95"
                >
                  اعتماد وتسجيل المصنع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WORKER DOSSIER & OFFICIAL CERTIFICATE ================= */}
      {selectedWorkerForDossier && (
        <WorkerDossierModal
          isOpen={Boolean(selectedWorkerForDossier)}
          onClose={() => setSelectedWorkerForDossier(null)}
          worker={selectedWorkerForDossier}
          bookings={state.bookings}
          shifts={state.shifts}
          factories={state.factories}
          ledger={state.ledger}
          onWorkerUpdated={() => {
            refresh();
            const updated = loadState().workers.find((w) => w.id === selectedWorkerForDossier.id);
            if (updated) setSelectedWorkerForDossier(updated);
          }}
        />
      )}

      {/* ================= MODAL: FACTORY STATEMENT & INVOICE ================= */}
      {selectedFactoryForStatement && (
        <FactoryStatementModal
          isOpen={Boolean(selectedFactoryForStatement)}
          onClose={() => setSelectedFactoryForStatement(null)}
          factory={selectedFactoryForStatement}
          shifts={state.shifts}
          bookings={state.bookings}
          workers={state.workers}
        />
      )}

      {/* ================= MODAL: OFFICIAL SECURITY ROSTER ================= */}
      <OfficialRosterPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        factory={
          state.factories.find((f) => f.id === selectedPrintFactoryId) || state.factories[0]
        }
        shifts={state.shifts}
        bookings={state.bookings}
        workers={state.workers}
      />
    </div>
  );
}
