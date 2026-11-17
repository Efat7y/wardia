'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Camera,
  Edit2,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';
import { executeWorkerPayout, saveWorkerMeezaCard, loadState } from '@/lib/store';

export function WalletLedgerView({ worker, ledger = [], onRefresh }) {
  const [payoutMethod, setPayoutMethod] = useState('MEEZA'); // 'WALLET' or 'MEEZA'
  const [payoutAmount, setPayoutAmount] = useState('350');
  const [payoutPhone, setPayoutPhone] = useState(worker?.phone || '01012345678');
  const [payoutMessage, setPayoutMessage] = useState(null);

  // Meeza Card Setup State
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardInput, setCardInput] = useState(worker?.meeza_card_number || '5078021489654219');
  const [cardBank, setCardBank] = useState(worker?.meeza_bank_name || 'كارت ميزة - البريد المصري');
  const [cardSaveMsg, setCardSaveMsg] = useState(null);

  const workerLedger = ledger.filter((item) => item.worker_id === worker?.id);

  // Format 16 digits into blocks of 4
  const formatCardNumber = (digits) => {
    const clean = (digits || '').replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleCardInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardInput(raw);
  };

  // Quick Camera Scan Simulation
  const handleSimulateScanCard = () => {
    // Generate valid Egyptian Meeza prefix 5078 with random trailing digits
    const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000);
    const simulatedCard = `5078${randomSuffix}`;
    setCardInput(simulatedCard);
    setCardSaveMsg('تم التقاط رقم كارت ميزة بنجاح بالكاميرا!');
    setTimeout(() => setCardSaveMsg(null), 3000);
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    setCardSaveMsg(null);

    const res = saveWorkerMeezaCard(worker?.id, cardInput, cardBank);
    if (res.success) {
      setCardSaveMsg(res.message);
      setIsEditingCard(false);
      if (onRefresh) onRefresh();
    } else {
      setCardSaveMsg(res.message);
    }
  };

  // Request Payout
  const handleRequestPayout = (e) => {
    e.preventDefault();
    setPayoutMessage(null);

    const destination =
      payoutMethod === 'MEEZA'
        ? (worker?.meeza_card_number ? `كارت ميزة تنتهي بـ ${worker.meeza_card_number.slice(-4)}` : 'كارت ميزة')
        : payoutPhone;

    const res = executeWorkerPayout(worker?.id, payoutAmount, payoutMethod, destination);
    setPayoutMessage(res.message);

    if (res.success && onRefresh) {
      onRefresh();
    }
  };

  const hasMeezaCard = Boolean(worker?.meeza_card_number);

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto font-['Cairo',sans-serif]">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-green-700 to-green-900 text-white p-5 rounded-3xl shadow-md">
        <div className="flex items-center justify-between mb-3 text-green-100">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="text-xs font-bold">محفظة يوميات وردية</span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">جاهز للصرف الفوري</span>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-black font-mono tracking-tight">
            {worker?.wallet_balance?.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
            <span className="text-lg font-bold mr-1">جنيه</span>
          </div>
          <p className="text-xs text-green-100 mt-1">يُضاف أجر الوردية تلقائياً فور مسح الكود ببوابة المصنع</p>
        </div>

        {/* Payout Method Selection Tabs */}
        <div className="bg-white/10 backdrop-blur-xs p-1 rounded-2xl flex gap-1 mb-3">
          <button
            type="button"
            onClick={() => setPayoutMethod('MEEZA')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              payoutMethod === 'MEEZA'
                ? 'bg-white text-green-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>كارت ميزة (ATM)</span>
          </button>

          <button
            type="button"
            onClick={() => setPayoutMethod('WALLET')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              payoutMethod === 'WALLET'
                ? 'bg-white text-green-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>محفظة كاش بالموبايل</span>
          </button>
        </div>

        {/* Active Payout Method Summary / Form */}
        <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl space-y-2.5">
          {payoutMethod === 'MEEZA' ? (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                <span>الصرف على كارت ميزة الوطني:</span>
                <button
                  type="button"
                  onClick={() => setIsEditingCard(!isEditingCard)}
                  className="text-[11px] text-green-200 underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{hasMeezaCard ? 'تعديل الكارت' : 'تثبيت كارت'}</span>
                </button>
              </div>

              {hasMeezaCard && !isEditingCard ? (
                <div className="bg-slate-900/40 border border-white/20 rounded-xl p-2.5 flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-5 rounded bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center">
                      ميزة
                    </div>
                    <div>
                      <div className="font-mono font-bold tracking-wider text-amber-300">
                        •••• •••• •••• {worker.meeza_card_number.slice(-4)}
                      </div>
                      <div className="text-[10px] text-green-200">{worker.meeza_bank_name || 'البريد المصري'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-green-500/30 text-green-200 px-2 py-0.5 rounded-full font-bold">
                    معتمد ✓
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-white mb-1.5">تحويل لمحفظة كاش (فودافون / اتصالات / أورنج):</div>
              <input
                type="text"
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full bg-white text-slate-900 font-mono font-bold text-xs rounded-xl px-3 py-2 mb-2 focus:outline-none"
              />
            </div>
          )}

          {/* Amount and Payout Button */}
          <form onSubmit={handleRequestPayout} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="المبلغ"
                className="bg-white text-slate-900 font-bold text-xs rounded-xl px-3 py-2 w-28 focus:outline-none"
              />
              <button
                type="submit"
                className="flex-1 bg-white hover:bg-slate-100 text-green-800 font-black text-xs py-2 px-3 rounded-xl transition shadow-xs active:scale-95"
              >
                {payoutMethod === 'MEEZA' ? 'تحويل لكارت ميزة فوراً' : 'تحويل للمحفظة كاش'}
              </button>
            </div>
          </form>

          {payoutMessage && (
            <div
              className={`text-xs p-2.5 rounded-xl flex items-center gap-1.5 ${
                payoutMessage.includes('بنجاح') || payoutMessage.includes('فورياً')
                  ? 'bg-emerald-500/40 text-white border border-emerald-400/50'
                  : 'bg-rose-500/40 text-white border border-rose-400/50'
              }`}
            >
              {payoutMessage.includes('بنجاح') || payoutMessage.includes('فورياً') ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-200" />
              )}
              <span className="leading-snug">{payoutMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Meeza Card Management Card / Setup Card */}
      {(isEditingCard || !hasMeezaCard) && (
        <div className="bg-white border-2 border-green-600/30 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs">تثبيت كارت ميزة الوطني (16 رقم)</h3>
                <p className="text-[10px] text-slate-500">للصرف الفوري من أي ماكينة صراف آلي (ATM)</p>
              </div>
            </div>
            {hasMeezaCard && (
              <button
                type="button"
                onClick={() => setIsEditingCard(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                إلغاء
              </button>
            )}
          </div>

          {/* Realistic Meeza Card Preview */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-4 text-white shadow-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold tracking-wider text-emerald-200">
                {cardBank}
              </span>
              <div className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-sm tracking-wider">
                ميزة MEEZA
              </div>
            </div>

            <div className="w-8 h-6 rounded bg-amber-300/80 mb-3 border border-amber-200/50 flex items-center justify-center">
              <div className="w-5 h-3 border border-slate-700/40 rounded-xs" />
            </div>

            <div className="font-mono text-sm tracking-widest font-black text-amber-100 mb-2">
              {formatCardNumber(cardInput) || '5078 •••• •••• ••••'}
            </div>

            <div className="flex justify-between items-end text-[10px] text-emerald-200/80 font-mono">
              <div>
                <div className="text-[8px] text-emerald-300">صاحب الكارت</div>
                <div className="font-bold text-white font-['Cairo']">{worker?.full_name}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] text-emerald-300">الرقم القومي المرتبط</div>
                <div>•••• •••• {worker?.national_id?.slice(-4)}</div>
              </div>
            </div>
          </div>

          {/* Card Form */}
          <form onSubmit={handleSaveCard} className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-bold">رقم الكارت المطبوع (16 رقم):</label>
                <button
                  type="button"
                  onClick={handleSimulateScanCard}
                  className="text-[11px] text-green-700 font-bold flex items-center gap-1 hover:underline"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>تصوير الكارت بالكاميرا</span>
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={16}
                value={cardInput}
                onChange={handleCardInputChange}
                placeholder="5078xxxxxxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:border-green-600"
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>تبدأ كروت ميزة المصرية برقم 5078 ولا نطلب أبداً الرقم السري (PIN) أو كود CVV.</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">جهة إصدار الكارت:</label>
              <select
                value={cardBank}
                onChange={(e) => setCardBank(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-green-600 cursor-pointer"
              >
                <option value="كارت ميزة - البريد المصري">كارت ميزة - البريد المصري (الأكثر انتشاراً)</option>
                <option value="كارت ميزة - البنك الأهلي المصري">كارت ميزة - البنك الأهلي المصري</option>
                <option value="كارت ميزة - بنك مصر">كارت ميزة - بنك مصر</option>
                <option value="كارت ميزة - بنك القاهرة">كارت ميزة - بنك القاهرة</option>
                <option value="كارت ميزة - كارت المعاشات الذكي">كارت ميزة - كارت المعاشات الذكي</option>
                <option value="كارت ميزة - تكافل وكرامة">كارت ميزة - تكافل وكرامة</option>
              </select>
            </div>

            {cardSaveMsg && (
              <div className="p-2 rounded-xl text-xs font-bold bg-green-50 text-green-800 border border-green-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{cardSaveMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs shadow-xs transition active:scale-95"
            >
              حفظ وتثبيت الكارت كوسيلة صرف معتمدة
            </button>
          </form>
        </div>
      )}

      {/* Transaction History */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-slate-900 text-sm px-1">سجل المعاملات والأرباح</h4>
        <div className="space-y-2">
          {workerLedger.map((entry) => {
            const isCredit = entry.amount > 0;
            const isMeeza = entry.payout_method === 'MEEZA' || entry.notes?.includes('ميزة');

            return (
              <div
                key={entry.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isCredit
                        ? 'bg-green-100 text-green-700'
                        : isMeeza
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : isMeeza ? (
                      <CreditCard className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{isCredit ? 'يومية وردية عمل' : 'صرف نقدي'}</span>
                      {!isCredit && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {isMeeza ? 'كارت ميزة (ATM)' : 'كاش محفظة'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[210px]">
                      {entry.notes || 'تسجيل نظام وردية'}
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span
                    className={`text-sm font-black ${
                      isCredit ? 'text-green-700' : 'text-slate-700'
                    }`}
                  >
                    {isCredit ? '+' : ''}
                    {entry.amount} ج.م
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
