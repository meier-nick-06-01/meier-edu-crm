import React, { useState, useEffect } from 'react';
import { X, Wallet, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TeacherPayoutType, PaymentMethod } from '../types';
import { 
  getCurrentMonthString, 
  getTodayDateString, 
  formatCurrency, 
  PAYMENT_METHODS, 
  formatMonthPeriod 
} from '../utils/formatters';

interface TeacherPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTeacherId?: string;
}

export const TeacherPayoutModal: React.FC<TeacherPayoutModalProps> = ({
  isOpen,
  onClose,
  preselectedTeacherId,
}) => {
  const { teachers, addTeacherPayout, getTeacherCalculations } = useData();

  const [teacherId, setTeacherId] = useState<string>(preselectedTeacherId || '');
  const [period, setPeriod] = useState<string>(getCurrentMonthString());
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(getTodayDateString());
  const [payoutType, setPayoutType] = useState<TeacherPayoutType>('salary');
  const [method, setMethod] = useState<PaymentMethod>('card_click_payme');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (preselectedTeacherId) {
      setTeacherId(preselectedTeacherId);
    } else if (teachers.length > 0 && !teacherId) {
      setTeacherId(teachers[0].id);
    }
  }, [preselectedTeacherId, isOpen, teachers]);

  // When teacher changes, calculate balance and auto-suggest amount if positive remaining
  useEffect(() => {
    if (teacherId) {
      const calc = getTeacherCalculations(teacherId, period);
      if (calc.remainingBalance > 0) {
        setAmount(calc.remainingBalance);
      }
    }
  }, [teacherId, period]);

  if (!isOpen) return null;

  const currentTeacher = teachers.find((t) => t.id === teacherId);
  const calc = teacherId ? getTeacherCalculations(teacherId, period) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) {
      alert('Iltimos, o\'qituvchini tanlang');
      return;
    }
    if (amount <= 0) {
      alert('To\'lov summasi 0 dan katta bo\'lishi shart');
      return;
    }

    addTeacherPayout({
      teacherId,
      amount: Number(amount),
      date,
      period,
      payoutType,
      method,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">O'qituvchiga Ish Haqi To'lash</h3>
              <p className="text-xs text-amber-100">Oylik maosh yoki avans o'tkazish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculation Card */}
        {calc && currentTeacher && (
          <div className="bg-amber-50 p-4 border-b border-amber-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase">
                {currentTeacher.fullName} ({currentTeacher.subject})
              </span>
              <span className="text-xs font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                {formatMonthPeriod(period)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                <span className="text-[10px] text-slate-500 block">Hisoblangan haq</span>
                <span className="font-bold text-slate-900">{formatCurrency(calc.earnedSalary)}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                <span className="text-[10px] text-slate-500 block">To'langan summa</span>
                <span className="font-bold text-emerald-700">{formatCurrency(calc.paidAmount)}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                <span className="text-[10px] text-slate-500 block">To'lash kerak (Qoldiq)</span>
                <span className={`font-bold ${calc.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(calc.remainingBalance)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Teacher Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              O'qituvchini Tanlang <span className="text-red-500">*</span>
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} — {t.subject} (
                  {t.salaryType === 'percentage'
                    ? `${t.salaryValue}% stavka`
                    : formatCurrency(t.salaryValue)}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To'lanadigan Summa (so'm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="10000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                placeholder="1 500 000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-amber-600 font-semibold block mt-1">
                {amount > 0 ? formatCurrency(amount) : ''}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Qaysi Oy Davri Uchun
              </label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payout Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To'lov Turi
              </label>
              <select
                value={payoutType}
                onChange={(e) => setPayoutType(e.target.value as TeacherPayoutType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              >
                <option value="salary">Asosiy Oylik Maosh</option>
                <option value="advance">Avans (Bo'nak)</option>
                <option value="bonus">Mukofot (Bonus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To'lov Sanasi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hisob-kitob Shakli
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              >
                {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Izoh
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Plastik kartaga o'tkazildi..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              Ish Haqini To'lash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
