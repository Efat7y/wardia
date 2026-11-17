'use client';

import React, { useState } from 'react';
import { Building2, Plus, Users, Briefcase, CheckCircle2, X, Pencil, Trash2 } from 'lucide-react';
import { createShift, updateShift, deleteShift, loadState } from '@/lib/store';

export function FactoryDashboardView({ onRefresh }) {
  const [state, setState] = useState(null);
  const [selectedFactoryId, setSelectedFactoryId] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  React.useEffect(() => {
    setState(loadState());
    const handleSync = () => setState(loadState());
    window.addEventListener('wardia_state_changed', handleSync);
    return () => window.removeEventListener('wardia_state_changed', handleSync);
  }, []);

  // Shift form state
  const [title, setTitle] = useState('');
  const [wage, setWage] = useState('350');
  const [slots, setSlots] = useState('10');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');

  if (!state) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        جاري تحميل لوحة تحكم المصنع...
      </div>
    );
  }

  const currentFactory =
    state.factories.find((f) => f.id === selectedFactoryId) || state.factories[0];

  const factoryShifts = state.shifts.filter((s) => s.factory_id === currentFactory.id);
  const factoryShiftIds = factoryShifts.map((s) => s.id);
  const factoryBookings = state.bookings.filter((b) => factoryShiftIds.includes(b.shift_id));
  const attendedCount = factoryBookings.filter((b) => b.status === 'attended').length;

  const openCreateModal = () => {
    setEditingShift(null);
    setTitle('');
    setWage('350');
    setSlots('10');
    setStartTime('08:00');
    setEndTime('16:00');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    setTitle(shift.title);
    setWage(shift.worker_wage?.toString() || '350');
    setSlots(shift.slots_needed?.toString() || '10');
    setStartTime(shift.start_time || '08:00');
    setEndTime(shift.end_time || '16:00');
    setIsCreateModalOpen(true);
  };

  const handleDelete = (shift) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف وردية "${shift.title}"؟`)) {
      deleteShift(shift.id);
      setState(loadState());
      if (onRefresh) onRefresh();
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      factory_id: currentFactory.id,
      title,
      description: 'وردية عمل معتمدة تشمل كافة مهمات الوقاية والسلامة.',
      shift_date: editingShift?.shift_date || new Date().toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      worker_wage: parseFloat(wage) || 350,
      service_fee: 50,
      slots_needed: parseInt(slots, 10) || 10,
      status: editingShift?.status || 'open',
    };

    if (editingShift) {
      updateShift(editingShift.id, payload);
    } else {
      createShift(payload);
    }

    setState(loadState());
    setIsCreateModalOpen(false);
    setEditingShift(null);
    setTitle('');
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-5 pb-20 max-w-3xl mx-auto">
      {/* Factory Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg">لوحة تحكم المنشأة الصناعية</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 font-bold">المصنع:</span>
            <select
              value={selectedFactoryId}
              onChange={(e) => setSelectedFactoryId(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 text-xs font-bold focus:outline-none"
            >
              {state.factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} - {f.industrial_zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة وردية جديدة</span>
        </button>
      </div>

      {/* 3 Simple KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <div className="text-xs text-slate-500 font-bold mb-1">الورديات المعلنة</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{factoryShifts.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <div className="text-xs text-slate-500 font-bold mb-1">العمال المسجلين</div>
          <div className="text-2xl font-black text-blue-600 font-mono">{factoryBookings.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <div className="text-xs text-slate-500 font-bold mb-1">الحضور الفعلي</div>
          <div className="text-2xl font-black text-green-600 font-mono">{attendedCount}</div>
        </div>
      </div>

      {/* Shifts List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base">الورديات الحالية ومتابعة الحضور</h3>

        <div className="space-y-2.5">
          {factoryShifts.map((shift) => {
            const shiftBookings = factoryBookings.filter((b) => b.shift_id === shift.id);
            const shiftAttended = shiftBookings.filter((b) => b.status === 'attended');

            return (
              <div key={shift.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{shift.title}</h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      اليوم {shift.shift_date} من {shift.start_time} إلى {shift.end_time}
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <span className="font-black text-green-700 text-base">{shift.worker_wage} ج.م</span>
                    <div className="text-[10px] text-slate-500">يومية العامل</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 text-slate-600 font-medium">
                  <span>المقاعد: <strong>{shift.slots_filled} من {shift.slots_needed}</strong></span>
                  <span className="text-green-700 font-bold">حضر بالبوابة: {shiftAttended.length} عمال</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => openEditModal(shift)}
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition text-xs shadow-2xs"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => handleDelete(shift)}
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
      </div>

      {/* Modal: Create / Edit Shift */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingShift ? 'تعديل بيانات الوردية' : 'إضافة وردية جديدة'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingShift(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الوردية:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعبئة وتغليف كرتون"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اليومية (جنيه):</label>
                  <input
                    type="number"
                    required
                    value={wage}
                    onChange={(e) => setWage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-green-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">عدد العمال المطلوبة:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">وقت البدء:</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">وقت الانتهاء:</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingShift(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-xs"
                >
                  {editingShift ? 'حفظ التعديلات' : 'نشر الوردية الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
