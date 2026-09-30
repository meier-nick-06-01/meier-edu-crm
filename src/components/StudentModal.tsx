import React, { useState, useEffect } from 'react';
import { X, User, Phone, Users, BookOpen, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Student } from '../types';
import { getTodayDateString } from '../utils/formatters';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
}) => {
  const { groups, courses, addStudent, updateStudent } = useData();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [customMonthlyFee, setCustomMonthlyFee] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<'active' | 'frozen' | 'left'>('active');
  const [notes, setNotes] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(getTodayDateString());

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName);
      setPhone(studentToEdit.phone);
      setParentName(studentToEdit.parentName || '');
      setParentPhone(studentToEdit.parentPhone || '');
      setSelectedGroupIds(studentToEdit.groupIds || []);
      setCustomMonthlyFee(studentToEdit.customMonthlyFee);
      setStatus(studentToEdit.status);
      setNotes(studentToEdit.notes || '');
      setEnrollmentDate(studentToEdit.enrollmentDate || getTodayDateString());
    } else {
      setFullName('');
      setPhone('+998 ');
      setParentName('');
      setParentPhone('+998 ');
      setSelectedGroupIds(groups.length > 0 ? [groups[0].id] : []);
      setCustomMonthlyFee(undefined);
      setStatus('active');
      setNotes('');
      setEnrollmentDate(getTodayDateString());
    }
  }, [studentToEdit, isOpen, groups]);

  if (!isOpen) return null;

  const toggleGroup = (groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Iltimos, talaba ism-familiyasini kiriting');
      return;
    }

    if (studentToEdit) {
      updateStudent(studentToEdit.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        groupIds: selectedGroupIds,
        customMonthlyFee: customMonthlyFee ? Number(customMonthlyFee) : undefined,
        status,
        notes: notes.trim(),
        enrollmentDate,
      });
    } else {
      addStudent({
        fullName: fullName.trim(),
        phone: phone.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        groupIds: selectedGroupIds,
        customMonthlyFee: customMonthlyFee ? Number(customMonthlyFee) : undefined,
        enrollmentDate,
        status,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {studentToEdit ? 'Talaba Ma\'lumotlarini Tahrirlash' : 'Yangi Talaba Qo\'shish'}
              </h3>
              <p className="text-xs text-blue-100">Guruh va ota-onasi ma'lumotlari</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Talaba F.I.Sh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Sardor Aliyev"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Student Phone & Enrollment Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                A'zo Bo'lgan Sana
              </label>
              <input
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Parent Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Ota-Onasi / Vasiy Ma'lumotlari
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Ota/ona F.I.Sh"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Ota/ona telefoni"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Enrolled Groups (Multi-select) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Biriktirilgan Guruhlar
            </label>
            {groups.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Hozircha guruhlar kiritilmagan. Talabani saqlab, keyinroq guruhga biriktirishingiz yoki quyida oylik to'lov summasini kiritishingiz mumkin.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
                {groups.map((group) => {
                  const course = courses.find((c) => c.id === group.courseId);
                  const isChecked = selectedGroupIds.includes(group.id);
                  return (
                    <label
                      key={group.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isChecked ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGroup(group.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span>{group.name} ({course?.title})</span>
                        <span className="text-slate-400 font-normal">{group.daysSchedule}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Monthly Fee (Optional override) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Belgilangan Oylik To'lov Summasi (so'm) <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
            </label>
            <input
              type="number"
              step="10000"
              placeholder="Masalan: 450 000 (bo'sh qolsa, guruh narxi olinadi)"
              value={customMonthlyFee ?? ''}
              onChange={(e) => setCustomMonthlyFee(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Har oy talaba uchun qancha to'lov kutilishini o'zingiz aniq belgilashingiz mumkin.
            </span>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Talaba Holati
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Faol (O'qimoqda)</option>
                <option value="frozen">Muzlatilgan (Tanaffus)</option>
                <option value="left">Ketgan (Tugatgan)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Qo'shimcha Izoh
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Qobiliyati, maqsadi..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {studentToEdit ? 'O\'zgarishlarni Saqlash' : 'Talabani Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
