import React, { useState, useEffect } from 'react';
import { X, CreditCard, User, Users, Calendar, DollarSign, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PaymentMethod, Student, Group } from '../types';
import { 
  getCurrentMonthString, 
  getTodayDateString, 
  generateReceiptNo, 
  formatCurrency, 
  PAYMENT_METHODS, 
  UZ_MONTH_NAMES 
} from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
  preselectedGroupId?: string;
  preselectedMonthFor?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedStudentId,
  preselectedGroupId,
  preselectedMonthFor,
}) => {
  const { students, groups, courses, addPayment, getStudentBalance } = useData();

  const [studentId, setStudentId] = useState<string>(preselectedStudentId || '');
  const [groupId, setGroupId] = useState<string>(preselectedGroupId || '');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(getTodayDateString());
  const [monthFor, setMonthFor] = useState<string>(preselectedMonthFor || getCurrentMonthString());
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [receiptNo, setReceiptNo] = useState<string>(generateReceiptNo());
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (preselectedStudentId) {
      setStudentId(preselectedStudentId);
    }
    if (preselectedGroupId) {
      setGroupId(preselectedGroupId);
    }
    if (preselectedMonthFor) {
      setMonthFor(preselectedMonthFor);
    } else {
      setMonthFor(getCurrentMonthString());
    }
    setReceiptNo(generateReceiptNo());
  }, [preselectedStudentId, preselectedGroupId, preselectedMonthFor, isOpen]);

  // When student changes, adjust default group and default amount
  useEffect(() => {
    if (studentId) {
      const selectedStudent = students.find((s) => s.id === studentId);
      if (selectedStudent) {
        if (selectedStudent.customMonthlyFee !== undefined && selectedStudent.customMonthlyFee > 0) {
          setAmount(selectedStudent.customMonthlyFee);
        } else if (selectedStudent.groupIds.length > 0) {
          const targetGroupId = selectedStudent.groupIds.includes(groupId)
            ? groupId
            : selectedStudent.groupIds[0];
          setGroupId(targetGroupId);

          const group = groups.find((g) => g.id === targetGroupId);
          if (group) {
            const course = courses.find((c) => c.id === group.courseId);
            const price = group.monthlyPrice || course?.monthlyPrice || 400000;
            setAmount(price);
          }
        }
      }
    }
  }, [studentId]);

  // When group changes, update suggested amount
  useEffect(() => {
    if (groupId) {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        const course = courses.find((c) => c.id === group.courseId);
        const price = group.monthlyPrice || course?.monthlyPrice || 450000;
        setAmount(price);
      }
    }
  }, [groupId]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === studentId);
  const studentBalance = studentId ? getStudentBalance(studentId, monthFor) : null;

  // Filter groups for selected student
  const availableGroups = currentStudent
    ? groups.filter((g) => currentStudent.groupIds.includes(g.id))
    : groups;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      alert('Iltimos, talabani tanlang');
      return;
    }
    if (!groupId) {
      alert('Iltimos, guruhni tanlang');
      return;
    }
    if (amount <= 0) {
      alert('To\'lov summasi 0 dan katta bo\'lishi shart');
      return;
    }

    addPayment({
      studentId,
      groupId,
      amount: Number(amount),
      date,
      monthFor,
      method,
      receiptNo: receiptNo || generateReceiptNo(),
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">To'lov Qabul Qilish</h3>
              <p className="text-xs text-emerald-100">Kvitansiya bilan ro'yxatga olish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Talabani tanlang <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">-- Talabani tanlang --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Student balance status helper */}
            {studentBalance && (
              <div className="mt-2 text-xs flex items-center justify-between px-3 py-1.5 bg-slate-100 rounded-lg">
                <span className="text-slate-600">Joriy oydagi qarzdorlik:</span>
                <span className={`font-bold ${studentBalance.debt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {studentBalance.debt > 0 ? formatCurrency(studentBalance.debt) : "To'liq to'langan"}
                </span>
              </div>
            )}
          </div>

          {/* Group Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Guruhni tanlang <span className="text-red-500">*</span>
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Guruhni tanlang --</option>
              {availableGroups.map((g) => {
                const course = courses.find((c) => c.id === g.courseId);
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} — {course?.title} ({g.daysSchedule})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Amount & Month in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To'lov Summasi (so'm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="450 000"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                {amount > 0 ? formatCurrency(amount) : ''}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Qaysi oy uchun
              </label>
              <input
                type="month"
                value={monthFor}
                onChange={(e) => setMonthFor(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To'lov Turi
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
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
                To'lov Sanasi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt No & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kvitansiya Raqami
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Qo'shimcha Izoh
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masalan: Qisman to'lov..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              To'lovni Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
