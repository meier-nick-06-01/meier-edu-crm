import React, { useState } from 'react';
import { 
  Wallet, 
  DollarSign, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Search, 
  ArrowDownLeft, 
  Building, 
  TrendingDown 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { 
  formatCurrency, 
  formatDate, 
  formatMonthPeriod, 
  getCurrentMonthString, 
  PAYMENT_METHODS 
} from '../utils/formatters';

interface TeacherPayoutsViewProps {
  onOpenPayoutModal: (teacherId?: string) => void;
}

export const TeacherPayoutsView: React.FC<TeacherPayoutsViewProps> = ({ onOpenPayoutModal }) => {
  const { 
    teachers, 
    groups, 
    teacherPayouts, 
    deleteTeacherPayout, 
    getTeacherCalculations, 
    settings,
    searchQuery 
  } = useData();

  const [selectedPeriod, setSelectedPeriod] = useState<string>(getCurrentMonthString());

  // Aggregate stats for this period
  let totalEarned = 0;
  let totalPaid = 0;
  let totalRemainingLiability = 0;
  let teachersWithDebtCount = 0;

  teachers.forEach((t) => {
    const calc = getTeacherCalculations(t.id, selectedPeriod);
    totalEarned += calc.earnedSalary;
    totalPaid += calc.paidAmount;
    if (calc.remainingBalance > 0) {
      totalRemainingLiability += calc.remainingBalance;
      teachersWithDebtCount++;
    }
  });

  // Filter payouts history for selected period
  const periodPayouts = teacherPayouts.filter((tp) => tp.period === selectedPeriod);

  // Filter teachers by search
  const filteredTeachers = teachers.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.fullName.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            O'qituvchilar Ish Haqi & Qoldiq Summalar
          </h1>
          <p className="text-xs text-slate-500">
            Har bir o'qituvchiga to'lanishi kerak bo'lgan maosh, avans va hisob-kitoblar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-slate-500">Oylik hisobot:</span>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-slate-900 font-bold focus:outline-none bg-transparent"
            />
          </div>

          <button
            onClick={() => onOpenPayoutModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Ish Haqi To'lash</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Earned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jami Hisoblangan Ish Haqi
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalEarned)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {teachers.length} ta o'qituvchining {formatMonthPeriod(selectedPeriod)} oyi uchun stavkasi
            </p>
          </div>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              To'langan Summa (Avans + Oylik)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Kassadan o'qituvchilarga berildi
            </p>
          </div>
        </div>

        {/* Card 3: REMAINING TO PAY TO TEACHERS (HIGHLIGHTED) */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-100">
              O'qituvchilarga To'lanishi Kerak (Qoldiq)
            </span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatCurrency(totalRemainingLiability)}
            </div>
            <p className="text-xs text-amber-100 font-medium mt-1">
              {teachersWithDebtCount} ta o'qituvchiga to'lov kutilmoqda
            </p>
          </div>
        </div>
      </div>

      {/* Main Table: Teachers Payroll Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Har bir o'qituvchi bo'yicha batafsil hisob-kitob ({formatMonthPeriod(selectedPeriod)})
          </h3>
          <span className="text-xs text-slate-500">
            Jami: {filteredTeachers.length} nafar o'qituvchi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">O'qituvchi</th>
                <th className="p-3.5">Guruh / Talabalar</th>
                <th className="p-3.5 text-right">Guruh Tushumi</th>
                <th className="p-3.5 text-center">Stavka</th>
                <th className="p-3.5 text-right">Hisoblangan Haq</th>
                <th className="p-3.5 text-right">To'langan (Avans)</th>
                <th className="p-3.5 text-right font-black">To'lash Kerak (Qoldiq)</th>
                <th className="p-3.5 text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher) => {
                const calc = getTeacherCalculations(teacher.id, selectedPeriod);
                const isSettled = calc.remainingBalance <= 0;

                return (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{teacher.fullName}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{teacher.subject}</div>
                      <div className="text-[11px] text-slate-400">{teacher.phone}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-700">
                        {calc.groupsCount} ta guruh
                      </div>
                      <div className="text-indigo-600 font-bold text-[11px]">
                        {calc.studentCount} nafar talaba
                      </div>
                    </td>

                    <td className="p-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(calc.grossCourseFees)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                        {teacher.salaryType === 'percentage'
                          ? `${teacher.salaryValue}%`
                          : 'Oylik fiksirlangan'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(calc.earnedSalary)}
                    </td>

                    <td className="p-3.5 text-right font-bold text-emerald-600">
                      {formatCurrency(calc.paidAmount)}
                    </td>

                    {/* REMAINING AMOUNT TO PAY COLUMN */}
                    <td className="p-3.5 text-right">
                      {calc.remainingBalance > 0 ? (
                        <div className="inline-block bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          <span className="text-xs font-black text-rose-600 block">
                            {formatCurrency(calc.remainingBalance)}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-rose-500">
                            To'lov kutilmoqda
                          </span>
                        </div>
                      ) : (
                        <div className="inline-block bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>0 so'm</span>
                          </span>
                          <span className="text-[9px] uppercase font-bold text-emerald-500">
                            To'liq yopilgan
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onOpenPayoutModal(teacher.id)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>To'lash</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payouts History for this period */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900">
              O'qituvchilarga Berilgan To'lovlar Tarixi ({formatMonthPeriod(selectedPeriod)})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Jami {periodPayouts.length} ta tranzaksiya
          </span>
        </div>

        {periodPayouts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            Ushbu oy uchun o'qituvchilarga to'lovlar kiritilmagan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Sana</th>
                  <th className="p-3">O'qituvchi</th>
                  <th className="p-3">To'lov Turi</th>
                  <th className="p-3">To'lov Usuli</th>
                  <th className="p-3">Izoh</th>
                  <th className="p-3 text-right">Summa</th>
                  <th className="p-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodPayouts.map((payout) => {
                  const teacher = teachers.find((t) => t.id === payout.teacherId);
                  return (
                    <tr key={payout.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-600">{formatDate(payout.date)}</td>
                      <td className="p-3 font-bold text-slate-900">{teacher?.fullName || '—'}</td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {payout.payoutType === 'advance' ? 'Avans' : payout.payoutType === 'bonus' ? 'Bonus' : 'Oylik Maosh'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{PAYMENT_METHODS[payout.method]}</td>
                      <td className="p-3 text-slate-500 italic">{payout.notes || '—'}</td>
                      <td className="p-3 text-right font-black text-emerald-600">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Ushbu to\'lov yozuvini o\'chirishni tasdiqlaysizmi?')) {
                              deleteTeacherPayout(payout.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
