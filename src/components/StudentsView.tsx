import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Phone, 
  Edit, 
  Trash2, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check,
  Filter
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Student } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getCurrentMonthString, 
  formatMonthPeriod 
} from '../utils/formatters';

interface StudentsViewProps {
  onOpenStudentModal: (student?: Student) => void;
  onOpenPaymentModal: (studentId?: string, groupId?: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenStudentModal,
  onOpenPaymentModal,
}) => {
  const { 
    students, 
    groups, 
    courses, 
    deleteStudent, 
    getStudentBalance, 
    settings,
    searchQuery 
  } = useData();

  const currentMonth = getCurrentMonthString();
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'debtors' | 'paid'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchPhone = s.phone.includes(q);
      const matchParent = s.parentName?.toLowerCase().includes(q) || s.parentPhone?.includes(q);
      if (!matchName && !matchPhone && !matchParent) return false;
    }

    // Group filter
    if (filterGroup !== 'all' && !s.groupIds.includes(filterGroup)) {
      return false;
    }

    // Payment status filter
    if (filterPaymentStatus !== 'all') {
      const balance = getStudentBalance(s.id, currentMonth);
      if (filterPaymentStatus === 'debtors' && balance.debt <= 0) return false;
      if (filterPaymentStatus === 'paid' && balance.debt > 0) return false;
    }

    return true;
  });

  // Copy SMS Reminder
  const handleCopyReminder = (student: Student, debt: number) => {
    const text = `Assalomu alaykum, hurmatli ${student.parentName || student.fullName + 'ning ota-onasi'}. "${settings.centerName}" tomonidan bildiramizki, ${student.fullName}ning ${formatMonthPeriod(currentMonth)} oyi uchun o'quv to'lovidan ${formatCurrency(debt)} qarz mavjud. Iltimos, to'lovni o'z vaqtida amalga oshirishingizni so'raymiz. Tel: ${settings.centerPhone}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Talabalar Ro'yxati</h1>
          <p className="text-xs text-slate-500">
            Jami {students.length} nafar o'quvchi ro'yxatga olingan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenStudentModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Talaba Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Group Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Guruh:</span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">Barcha guruhlar ({groups.length})</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">To'lov holati:</span>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">Barchasi</option>
              <option value="debtors">Faqat Qarzdorlar</option>
              <option value="paid">To'liq to'laganlar</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Natija: <strong className="text-slate-900">{filteredStudents.length}</strong> nafar talaba
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Talaba F.I.Sh</th>
                <th className="p-3.5">Telefon</th>
                <th className="p-3.5">Ota-Onasi</th>
                <th className="p-3.5">Guruhlari</th>
                <th className="p-3.5 text-right">To'lov Holati ({formatMonthPeriod(currentMonth)})</th>
                <th className="p-3.5 text-center">Tezkor Amal</th>
                <th className="p-3.5 text-right">Boshqarish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    Talabalar topilmadi
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const balance = getStudentBalance(student.id, currentMonth);
                  const studentGroups = groups.filter((g) => student.groupIds.includes(g.id));

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${student.avatarColor || 'bg-blue-600 text-white'}`}
                          >
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              A'zo: {formatDate(student.enrollmentDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Student Phone */}
                      <td className="p-3.5 font-medium text-slate-700">{student.phone}</td>

                      {/* Parent Contact */}
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{student.parentName || '—'}</div>
                        <div className="text-[11px] text-slate-400">{student.parentPhone || '—'}</div>
                      </td>

                      {/* Groups */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {studentGroups.map((g) => (
                            <span
                              key={g.id}
                              className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]"
                            >
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Payment Status Pill */}
                      <td className="p-3.5 text-right">
                        {balance.debt > 0 ? (
                          <div className="inline-block bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            <span className="text-xs font-black text-rose-600 block">
                              Qarz: {formatCurrency(balance.debt)}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              To'langan: {formatCurrency(balance.totalPaid)}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-block bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                            <span className="text-xs font-black text-emerald-600 flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>To'liq to'langan</span>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formatCurrency(balance.totalPaid)}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Quick Action: Pay or Copy Reminder */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onOpenPaymentModal(student.id, student.groupIds[0])}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            title="To'lov kiritish"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>To'lov</span>
                          </button>

                          {balance.debt > 0 && (
                            <button
                              onClick={() => handleCopyReminder(student, balance.debt)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="SMS eslatma matnini nusxalash"
                            >
                              {copiedId === student.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Edit / Delete */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenStudentModal(student)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`"${student.fullName}" talabasini o'chirishni tasdiqlaysizmi?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
};
