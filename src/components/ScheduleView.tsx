import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Users, 
  DoorClosed, 
  Edit, 
  Trash2, 
  Download, 
  Filter,
  Search,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Group, Course, Teacher, Room } from '../types';
import { DAYS_OF_WEEK, formatCurrency } from '../utils/formatters';

export const ScheduleView: React.FC = () => {
  const { 
    groups, 
    courses, 
    teachers, 
    rooms, 
    students, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    settings 
  } = useData();

  const [filterTeacherId, setFilterTeacherId] = useState<string>('all');
  const [filterRoomId, setFilterRoomId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [customDaysSchedule, setCustomDaysSchedule] = useState('Dushanba, Chorshanba, Juma');
  const [selectedQuickDays, setSelectedQuickDays] = useState<string[]>(['Dush', 'Chor', 'Jum']);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [teacherSharePercent, setTeacherSharePercent] = useState<number | undefined>(undefined);

  const quickDayPresets = [
    { label: 'Dush - Chor - Jum', days: ['Dush', 'Chor', 'Jum'], text: 'Dushanba, Chorshanba, Juma' },
    { label: 'Sesh - Pay - Shan', days: ['Sesh', 'Pay', 'Shan'], text: 'Seshanba, Payshanba, Shanba' },
    { label: 'Har kuni (Du-Sh)', days: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'], text: 'Har kuni (Dushanba - Shanba)' },
    { label: 'Dam olish kunlari', days: ['Shan', 'Yak'], text: 'Shanba, Yakshanba' },
  ];

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setName('');
    setCourseId(courses[0]?.id || '');
    setTeacherId(teachers[0]?.id || '');
    setRoomId(rooms[0]?.id || '');
    setCustomDaysSchedule('Dushanba, Chorshanba, Juma');
    setSelectedQuickDays(['Dush', 'Chor', 'Jum']);
    setStartTime('14:00');
    setEndTime('15:30');
    setMonthlyPrice(courses[0]?.monthlyPrice || 450000);
    setTeacherSharePercent(50);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setEditingGroup(group);
    setName(group.name);
    setCourseId(group.courseId);
    setTeacherId(group.teacherId);
    setRoomId(group.roomId);
    setCustomDaysSchedule(group.daysSchedule);
    setSelectedQuickDays(group.selectedDays || []);
    setStartTime(group.startTime);
    setEndTime(group.endTime);
    setMonthlyPrice(group.monthlyPrice || 0);
    setTeacherSharePercent(group.teacherSharePercent);
    setIsModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Iltimos, guruh nomini kiriting');
      return;
    }
    if (!customDaysSchedule.trim()) {
      alert('Iltimos, dars kunlarini kiriting');
      return;
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: name.trim(),
        courseId,
        teacherId,
        roomId,
        daysSchedule: customDaysSchedule.trim(),
        selectedDays: selectedQuickDays,
        startTime,
        endTime,
        monthlyPrice: Number(monthlyPrice) || undefined,
        teacherSharePercent: teacherSharePercent !== undefined ? Number(teacherSharePercent) : undefined,
      });
    } else {
      addGroup({
        name: name.trim(),
        courseId,
        teacherId,
        roomId,
        daysSchedule: customDaysSchedule.trim(),
        selectedDays: selectedQuickDays,
        startTime,
        endTime,
        status: 'active',
        monthlyPrice: Number(monthlyPrice) || undefined,
        teacherSharePercent: teacherSharePercent !== undefined ? Number(teacherSharePercent) : undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    if (filterTeacherId !== 'all' && g.teacherId !== filterTeacherId) return false;
    if (filterRoomId !== 'all' && g.roomId !== filterRoomId) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dars Jadvali</h1>
          <p className="text-xs text-slate-500">
            Dars kunlari, vaqtlari, xonalar va o'qituvchilar taqsimoti
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Group */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Guruh / Dars</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Teacher Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">O'qituvchi:</span>
            <select
              value={filterTeacherId}
              onChange={(e) => setFilterTeacherId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Barcha o'qituvchilar ({teachers.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Xona:</span>
            <select
              value={filterRoomId}
              onChange={(e) => setFilterRoomId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Barcha xonalar ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher: Grid vs List */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Haftalik Jadval
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guruhlar Ro'yxati
          </button>
        </div>
      </div>

      {/* Grid View: Monday to Sunday Columns */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            // Find groups that take place on this day
            const groupsOnThisDay = filteredGroups.filter((g) => {
              const scheduleLower = g.daysSchedule.toLowerCase();
              const dayLower = day.id.toLowerCase();
              const shortLower = day.short.toLowerCase();
              return scheduleLower.includes(dayLower) || scheduleLower.includes(shortLower) || scheduleLower.includes('har kuni');
            });

            return (
              <div key={day.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <span className="font-bold text-sm tracking-wide">{day.id}</span>
                  <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    {groupsOnThisDay.length} ta dars
                  </span>
                </div>

                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {groupsOnThisDay.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      Darslar belgilanmagan
                    </div>
                  ) : (
                    groupsOnThisDay.map((group) => {
                      const teacher = teachers.find((t) => t.id === group.teacherId);
                      const course = courses.find((c) => c.id === group.courseId);
                      const room = rooms.find((r) => r.id === group.roomId);
                      const studentCount = students.filter((s) => s.groupIds.includes(group.id) && s.status === 'active').length;

                      return (
                        <div
                          key={group.id}
                          className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{group.startTime} - {group.endTime}</span>
                            </span>
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                              {room?.name || 'Xona'}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm">{group.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">{course?.title}</p>

                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                            <span className="font-medium text-slate-700 truncate max-w-[120px]">
                              {teacher?.fullName}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {studentCount} talaba
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(group)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                              title="Tahrirlash"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`"${group.name}" guruhini o'chirmoqchimisiz?`)) {
                                  deleteGroup(group.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5">Guruh Nomi</th>
                  <th className="p-3.5">Kurs / Fan</th>
                  <th className="p-3.5">O'qituvchi</th>
                  <th className="p-3.5">Xona</th>
                  <th className="p-3.5">Dars Kunlari (Foydalanuvchi yozgan)</th>
                  <th className="p-3.5">Dars Vaqti</th>
                  <th className="p-3.5 text-center">Talabalar</th>
                  <th className="p-3.5 text-right">Dars Summasi</th>
                  <th className="p-3.5 text-center">O'qituvchi Foizi</th>
                  <th className="p-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map((g) => {
                  const teacher = teachers.find((t) => t.id === g.teacherId);
                  const course = courses.find((c) => c.id === g.courseId);
                  const room = rooms.find((r) => r.id === g.roomId);
                  const studentCount = students.filter((s) => s.groupIds.includes(g.id) && s.status === 'active').length;
                  const percentDisplay = g.teacherSharePercent 
                    ? `${g.teacherSharePercent}%` 
                    : (teacher?.salaryType === 'percentage' ? `${teacher.salaryValue}%` : 'Stavkada');

                  return (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{g.name}</td>
                      <td className="p-3.5 text-slate-700 font-medium">{course?.title}</td>
                      <td className="p-3.5 font-medium text-slate-800">{teacher?.fullName}</td>
                      <td className="p-3.5 text-slate-600">{room?.name}</td>
                      <td className="p-3.5">
                        <span className="bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {g.daysSchedule}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        {g.startTime} - {g.endTime}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {studentCount} nafar
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-600">
                        {formatCurrency(g.monthlyPrice || course?.monthlyPrice || 0)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold text-xs">
                          {percentDisplay}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(g)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`"${g.name}" guruhini o'chirishni tasdiqlaysizmi?`)) {
                                deleteGroup(g.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingGroup ? 'Guruh va Dars Jadvalini Tahrirlash' : 'Yangi Guruh va Dars Qo\'shish'}
                </h3>
                <p className="text-xs text-blue-100">Dars kunlarini erkin matn yoki shablon orqali kiriting</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Guruh Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: SAT Math-Alpha yoki IELTS 7.0 (Ertalabki)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Course & Teacher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kurs / Yo'nalish
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      setCourseId(cId);
                      const c = courses.find((item) => item.id === cId);
                      if (c) setMonthlyPrice(c.monthlyPrice);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Kursni tanlang --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({formatCurrency(c.monthlyPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    O'qituvchi
                  </label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- O'qituvchini tanlang --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dars Xonasi
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Xonani tanlang --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (sig'im: {r.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dars Summasi (Oylik to'lov)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    placeholder="Masalan: 450000"
                    value={monthlyPrice || ''}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Teacher Percentage per group */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    O'qituvchi Foiz Stavkasi (%) Ushbu Guruh Uchun
                  </label>
                  <span className="text-[11px] font-bold text-amber-700">
                    {teacherSharePercent ? `${teacherSharePercent}%` : "O'qituvchi foizi bo'yicha"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Masalan: 50"
                    value={teacherSharePercent ?? ''}
                    onChange={(e) => setTeacherSharePercent(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-32 px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-amber-950 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[40, 45, 50, 60, 70].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTeacherSharePercent(p)}
                        className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                          teacherSharePercent === p
                            ? 'bg-amber-600 text-white'
                            : 'bg-white hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-amber-700/80 mt-1">
                  * Guruh tushumidan o'qituvchiga to'lanadigan ulush foizda hisoblanadi.
                </p>
              </div>

              {/* CUSTOM DAYS SECTION (User requested: "dars kunlarini ozim yozaman") */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Dars Kunlari (O'zingiz yozing yoki tanlang) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-blue-600 font-semibold">Erkin matn kiritish</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {quickDayPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setCustomDaysSchedule(preset.text);
                        setSelectedQuickDays(preset.days);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Free Text Input for custom days */}
                <input
                  type="text"
                  required
                  value={customDaysSchedule}
                  onChange={(e) => setCustomDaysSchedule(e.target.value)}
                  placeholder="Masalan: Dushanba, Chorshanba, Juma yoki Har kuni"
                  className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 italic">
                  * Dars jadvalida ushbu matn ko'rsatiladi va kunlar bo'yicha taqsimlanadi.
                </p>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Boshlanish Vaqti
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tugash Vaqti
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
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
