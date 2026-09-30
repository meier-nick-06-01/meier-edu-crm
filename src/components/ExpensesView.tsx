import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Calendar, 
  Building, 
  PieChart, 
  Sparkles, 
  ShoppingBag, 
  Megaphone, 
  Zap, 
  Tag 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Expense } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getCurrentMonthString, 
  formatMonthPeriod 
} from '../utils/formatters';

export const ExpensesView: React.FC = () => {
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    payments, 
    teacherPayouts, 
    settings 
  } = useData();

  const currentMonth = getCurrentMonthString();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'rent' | 'marketing' | 'utilities' | 'supplies' | 'other'>('rent');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Filter expenses for selected month
  const periodExpenses = expenses.filter((e) => e.monthFor === selectedMonth);
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Financial Context
  const totalRevenue = payments
    .filter((p) => p.monthFor === selectedMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTeacherPayouts = teacherPayouts
    .filter((tp) => tp.period === selectedMonth)
    .reduce((sum, tp) => sum + tp.amount, 0);

  // REAL NET PROFIT (Tushum - Maosh - Xarajatlar)
  const realNetProfit = totalRevenue - totalTeacherPayouts - totalExpenses;

  const categoryLabels: Record<string, string> = {
    rent: 'Bino Ijarasi',
    marketing: 'Reklama & Marketing',
    utilities: 'Kommunal & Internet',
    supplies: 'Jihozlar & Kantselyariya',
    other: 'Boshqa Xarajatlar',
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    addExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      monthFor: selectedMonth,
      notes: notes.trim(),
    });

    setTitle('');
    setAmount(0);
    setNotes('');
    setIsModalOpen(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = periodExpenses.map((e, idx) => ({
      '№': idx + 1,
      'Xarajat nomi': e.title,
      'Kategoriya': categoryLabels[e.category] || e.category,
      'Summa': e.amount,
      'Sana': formatDate(e.date),
      'Oy': formatMonthPeriod(e.monthFor),
      'Izoh': e.notes || '',
    }));

    exportToExcel(data, `Xarajatlar_${selectedMonth}.xlsx`, 'Xarajatlar');
  };

  // Export to PDF
  const handleExportPDF = () => {
    const headers = ['№', 'Xarajat', 'Kategoriya', 'Summa', 'Sana', 'Izoh'];
    const rows = periodExpenses.map((e, idx) => [
      idx + 1,
      e.title,
      categoryLabels[e.category] || e.category,
      formatCurrency(e.amount),
      formatDate(e.date),
      e.notes || '—',
    ]);

    exportToPDF(
      `${settings.centerName} — Markaz Xarajatlari Hisoboti (${formatMonthPeriod(selectedMonth)})`,
      headers,
      rows,
      `Xarajatlar_${selectedMonth}.pdf`,
      settings
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
              {settings.centerName} Moliya
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">Operatsion Xarajatlar</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Markaz Xarajatlari & Haqiqiy Sof Foyda
          </h1>
          <p className="text-xs text-slate-500">
            Ijara, reklama, internet va ma'muriy xarajatlarni hisobga olgan holda haqiqiy foydani hisoblang
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-slate-500">Oy:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-slate-900 font-bold focus:outline-none bg-transparent"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Xarajat Kiritish</span>
          </button>
        </div>
      </div>

      {/* Financial Formula Cards (Tushum - Maosh - Xarajatlar = Haqiqiy Sof Foyda) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tushum */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">1. Jami Tushum (+)</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(totalRevenue)}</div>
          <span className="text-xs text-slate-500 mt-1 block">{formatMonthPeriod(selectedMonth)} oyi badallari</span>
        </div>

        {/* O'qituvchilar Maoshi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">2. O'qituvchi Maoshi (-)</span>
          <div className="text-2xl font-black text-amber-700 mt-2">{formatCurrency(totalTeacherPayouts)}</div>
          <span className="text-xs text-slate-500 mt-1 block">To'langan oylik va avanslar</span>
        </div>

        {/* Markaz Xarajatlari */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">3. Markaz Xarajatlari (-)</span>
          <div className="text-2xl font-black text-rose-600 mt-2">{formatCurrency(totalExpenses)}</div>
          <span className="text-xs text-slate-500 mt-1 block">Ijara, reklama, kommunal</span>
        </div>

        {/* Haqiqiy Sof Foyda */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-indigo-950/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">= HAQIQIY SOF FOYDA</span>
          <div className={`text-2xl font-black mt-2 ${realNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(realNetProfit)}
          </div>
          <span className="text-xs text-indigo-200 mt-1 block">Barcha xarajatlardan so'ng</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {formatMonthPeriod(selectedMonth)} Oyi Xarajatlar Ro'yxati
          </h3>
          <span className="text-xs font-bold text-slate-600">
            Jami: {formatCurrency(totalExpenses)}
          </span>
        </div>

        {periodExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <p className="mb-3">Ushbu oy uchun markaz xarajatlari kiritilmagan.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors"
            >
              + Xarajat Kiritish (Ijara, Reklama va b.)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Xarajat Nomi</th>
                  <th className="p-3.5">Kategoriya</th>
                  <th className="p-3.5 text-right">Summa</th>
                  <th className="p-3.5 text-center">Sana</th>
                  <th className="p-3.5">Izoh</th>
                  <th className="p-3.5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 text-sm">{expense.title}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-[11px] text-slate-700">
                        {categoryLabels[expense.category] || expense.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-rose-600 text-sm">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="p-3.5 text-center text-slate-600 font-medium">
                      {formatDate(expense.date)}
                    </td>
                    <td className="p-3.5 text-slate-500 italic max-w-xs truncate">
                      {expense.notes || '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`"${expense.title}" xarajatini o'chirishni tasdiqlaysizmi?`)) {
                            deleteExpense(expense.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Yangi Xarajat Kiritish</h3>
                <p className="text-xs text-rose-100">Bino ijarasi, reklama, internet yoki boshqa xarajatlar</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Xarajat Nomi / Tavsifi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Bino oylik ijarasi yoki Instagram target reklama"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="rent">Bino Ijarasi</option>
                    <option value="marketing">Reklama & Marketing</option>
                    <option value="utilities">Kommunal & Internet</option>
                    <option value="supplies">Jihozlar & Kantselyariya</option>
                    <option value="other">Boshqa Xarajatlar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Summa (so'm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="10000"
                    required
                    placeholder="1 200 000"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    To'langan Sana
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Qo'shimcha Izoh
                  </label>
                  <input
                    type="text"
                    placeholder="Chek raqami, shaxs..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Xarajatni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
