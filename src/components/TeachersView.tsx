import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  DollarSign, 
  Percent, 
  Edit, 
  Trash2, 
  Wallet, 
  Clock, 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Teacher, SalaryType } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getCurrentMonthString, 
  formatMonthPeriod 
} from '../utils/formatters';

interface TeachersViewProps {
  onOpenPayoutModal: (teacherId: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ onOpenPayoutModal }) => {
  const { 
    teachers, 
    groups, 
    courses, 
    students, 
    addTeacher, 
    updateTeacher, 
    deleteTeacher, 
    getTeacherCalculations,
    settings,
    searchQuery 
  } = useData();

  const currentMonth = getCurrentMonthString();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentMonth);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [salaryType, setSalaryType] = useState<SalaryType>('percentage');
  const [salaryValue, setSalaryValue] = useState<number>(50);
  const [hireDate, setHireDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFullName('');
    setPhone('+998 ');
    setSubject('');
    setSalaryType('percentage');
    setSalaryValue(50);
    setHireDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFullName(teacher.fullName);
    setPhone(teacher.phone);
    setSubject(teacher.subject);
    setSalaryType(teacher.salaryType);
    setSalaryValue(teacher.salaryValue);
    setHireDate(teacher.hireDate);
    setNotes(teacher.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Iltimos, o\'qituvchi ism-familiyasini kiriting');
      return;
    }
    if (!subject.trim()) {
      alert('Iltimos, fan nomini kiriting');
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        salaryType,
        salaryValue: Number(salaryValue),
        hireDate,
        notes: notes.trim(),
      });
    } else {
      addTeacher({
        fullName: fullName.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        salaryType,
        salaryValue: Number(salaryValue),
        hireDate,
        status: 'active',
        notes: notes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Filter teachers by search query
  const filteredTeachers = teachers.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.fullName.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">O'qituvchilar</h1>
          <p className="text-xs text-slate-500">
            Pedagoglar tarkibi, shartnoma stavkalari va oylik hisob-kitoblar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-slate-500">Davr:</span>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-slate-900 font-bold focus:outline-none bg-transparent"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi O'qituvchi</span>
          </button>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">O'qituvchilar Ro'yxati Bo'sh</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            O'zingiz yangi o'qituvchilarni kiriting. Har bir o'qituvchiga to'lov stavkasi (foiz yoki fiksirlangan oylik) belgilashingiz va to'lovlarni hisoblab borishingiz mumkin.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi O'qituvchi Kiritish</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {filteredTeachers.map((teacher) => {
            const calc = getTeacherCalculations(teacher.id, selectedPeriod);
            const teacherGroups = groups.filter((g) => g.teacherId === teacher.id && g.status === 'active');

            return (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
              {/* Card Top */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${teacher.avatarColor || 'bg-blue-600 text-white'}`}
                    >
                      {teacher.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {teacher.fullName}
                      </h3>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">{teacher.subject}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{teacher.phone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(teacher)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${teacher.fullName}" o'qituvchisini o'chirishni tasdiqlaysizmi?`)) {
                          deleteTeacher(teacher.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Groups Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {teacherGroups.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">Hozircha guruh biriktirilmagan</span>
                  ) : (
                    teacherGroups.map((g) => (
                      <span
                        key={g.id}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium border border-slate-200"
                      >
                        {g.name} ({g.daysSchedule})
                      </span>
                    ))
                  )}
                </div>

                {/* Stats & Salary Model Pill */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Shartnoma Stavkasi</span>
                    <span className="font-bold text-slate-900">
                      {teacher.salaryType === 'percentage'
                        ? `${teacher.salaryValue}% foiz stavka`
                        : `${formatCurrency(teacher.salaryValue)} oylik`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">O'quvchilar Soni</span>
                    <span className="font-bold text-indigo-700">
                      {calc.studentCount} nafar talaba
                    </span>
                  </div>
                </div>

                {/* CRITICAL USER REQUIREMENT: ALOHIDA O'QITUVCHIGA QANCHA SUMMA TO'LASHIM KERAK */}
                <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-amber-600" />
                      <span>O'qituvchiga qancha summa to'lashim kerak?</span>
                    </span>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                      {formatMonthPeriod(selectedPeriod)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-slate-500 block">Hisoblangan haq</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(calc.earnedSalary)}</span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-slate-500 block">To'langan</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(calc.paidAmount)}</span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-amber-300">
                      <span className="text-[10px] text-slate-500 block">Qoldiq (Qarz)</span>
                      <span className={`font-black ${calc.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(calc.remainingBalance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {calc.remainingBalance > 0 ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>To'lov kutilmoqda</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>To'liq hisob-kitob qilingan</span>
                    </span>
                  )}
                </span>

                <button
                  onClick={() => onOpenPayoutModal(teacher.id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Ish haqi / Avans to'lash</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingTeacher ? 'O\'qituvchi Ma\'lumotlarini Tahrirlash' : 'Yangi O\'qituvchi Kiritish'}
                </h3>
                <p className="text-xs text-blue-100">Shartnoma stavkasi va fanini belgilash</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  F.I.Sh (Ism, Familiya) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Sardor Rustamov"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Subject & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fani / Mutaxassisligi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Masalan: Ingliz tili (IELTS)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Telefon Raqami <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Salary Model Configuration */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Ish Haqi To'lov Modeli
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSalaryType('percentage');
                      setSalaryValue(50);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      salaryType === 'percentage'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span>Foiz Stavkasi (%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSalaryType('fixed_monthly');
                      setSalaryValue(4000000);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      salaryType === 'fixed_monthly'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Fiksirlangan Oylik</span>
                  </button>
                </div>

                {/* Salary Value input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {salaryType === 'percentage'
                      ? 'Talabalar to\'lovidan o\'qituvchiga foiz stavkasi (% da):'
                      : 'Oylik kafolatlangan summa (so\'mda):'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={salaryType === 'percentage' ? 100 : undefined}
                    value={salaryValue || ''}
                    onChange={(e) => setSalaryValue(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  {salaryType === 'percentage' && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[35, 40, 45, 50, 55, 60, 70].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSalaryValue(p)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                            salaryValue === p
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-[11px] text-blue-600 font-semibold block mt-1">
                    {salaryType === 'percentage'
                      ? `Misol uchun: Guruh tushumining ${salaryValue}% qismi o'qituvchiga hisoblanadi`
                      : `Har oy qat'iy: ${formatCurrency(salaryValue)}`}
                  </span>
                </div>
              </div>

              {/* Hire Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ish Boshlagan Sana
                  </label>
                  <input
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
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
                    placeholder="Sertifikatlari, tajribasi..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
