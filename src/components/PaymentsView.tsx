import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Calendar, 
  Printer, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Receipt
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Payment } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatMonthPeriod, 
  getCurrentMonthString, 
  PAYMENT_METHODS 
} from '../utils/formatters';
import { ReceiptModal } from './ReceiptModal';

interface PaymentsViewProps {
  onOpenPaymentModal: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onOpenPaymentModal }) => {
  const { 
    payments, 
    students, 
    groups, 
    deletePayment, 
    getStudentBalance, 
    settings,
    searchQuery 
  } = useData();

  const currentMonth = getCurrentMonthString();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    // Month filter
    if (selectedMonth && p.monthFor !== selectedMonth) return false;

    // Method filter
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const student = students.find((s) => s.id === p.studentId);
      const group = groups.find((g) => g.id === p.groupId);
      const matchName = student?.fullName.toLowerCase().includes(q);
      const matchReceipt = p.receiptNo.toLowerCase().includes(q);
      const matchGroup = group?.name.toLowerCase().includes(q);
      if (!matchName && !matchReceipt && !matchGroup) return false;
    }

    return true;
  });

  // Total collected for selected month
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">To'lovlar Jurnali</h1>
          <p className="text-xs text-slate-500">
            Talabalardan qabul qilingan badallar va kassa operatsiyalari
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
            onClick={onOpenPaymentModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi To'lov</span>
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Jami Tushum ({formatMonthPeriod(selectedMonth)})
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {formatCurrency(totalAmount)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {filteredPayments.length} ta to'lov operatsiyasi
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Naqd Pul Tushumi
          </span>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {formatCurrency(
              filteredPayments
                .filter((p) => p.method === 'cash')
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Kassada qolgan naqd</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Karta / Bank / Payme Tushumi
          </span>
          <div className="text-2xl font-black text-blue-600 mt-2">
            {formatCurrency(
              filteredPayments
                .filter((p) => p.method !== 'cash')
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Elektron va bank o'tkazmalari</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-slate-900">
            To'lovlar Ro'yxati ({filteredPayments.length} ta)
          </h3>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">To'lov usuli:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">Barcha usullar</option>
              <option value="cash">Naqd pul</option>
              <option value="card_click_payme">Karta (Payme/Click)</option>
              <option value="bank_transfer">Bank o'tkazmasi</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Chek №</th>
                <th className="p-3.5">Talaba F.I.Sh</th>
                <th className="p-3.5">Guruh / Kurs</th>
                <th className="p-3.5">To'lov Usuli</th>
                <th className="p-3.5 text-right">Summa</th>
                <th className="p-3.5 text-center">Sana</th>
                <th className="p-3.5">Izoh</th>
                <th className="p-3.5 text-right">Chek & Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Ushbu oy uchun to'lovlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const student = students.find((s) => s.id === payment.studentId);
                  const group = groups.find((g) => g.id === payment.groupId);

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">{payment.receiptNo}</td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 text-sm block">
                          {student?.fullName || 'Noma\'lum'}
                        </span>
                        <span className="text-[11px] text-slate-400">{student?.phone}</span>
                      </td>

                      <td className="p-3.5 text-slate-700 font-medium">{group?.name || '—'}</td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {PAYMENT_METHODS[payment.method] || payment.method}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-black text-emerald-600 text-sm">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="p-3.5 text-center text-slate-600 font-medium">
                        {formatDate(payment.date)}
                      </td>

                      <td className="p-3.5 text-slate-500 italic max-w-xs truncate">
                        {payment.notes || '—'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View & Print Receipt */}
                          <button
                            onClick={() => setReceiptPayment(payment)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                            title="Chekni ko'rish va chop etish"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Chek</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`"${payment.receiptNo}" chekli to'lovni o'chirishni tasdiqlaysizmi?`)) {
                                deletePayment(payment.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receiptPayment && (
        <ReceiptModal
          payment={receiptPayment}
          onClose={() => setReceiptPayment(null)}
        />
      )}
    </div>
  );
};
