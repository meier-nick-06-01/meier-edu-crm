import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  HelpCircle 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AttendanceStatus, AttendanceRecord } from '../types';
import { 
  formatDate, 
  getTodayDateString, 
  getCurrentMonthString, 
  formatMonthPeriod, 
  UZ_MONTH_NAMES 
} from '../utils/formatters';

export const AttendanceView: React.FC = () => {
  const { 
    groups, 
    students, 
    teachers, 
    courses, 
    attendance, 
    setAttendanceRecord, 
    bulkSetAttendance, 
    settings 
  } = useData();

  // Mode switcher: 'monthly' (Oylik Jurnal) vs 'daily' (Kunlik nazorat)
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');

  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];
  const currentTeacher = teachers.find((t) => t.id === currentGroup?.teacherId);
  const currentCourse = courses.find((c) => c.id === currentGroup?.courseId);

  // Active students in selected group
  const groupStudents = students.filter(
    (s) => s.status === 'active' && s.groupIds.includes(currentGroup?.id || '')
  );

  // Parse days in selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const yearNum = parseInt(yearStr || '2026', 10);
  const monthNum = parseInt(monthStr || '09', 10);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

  const daysList = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayFormatted = String(day).padStart(2, '0');
    const fullDate = `${selectedMonth}-${dayFormatted}`;
    const dateObj = new Date(yearNum, monthNum - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ...
    const dayNamesShort = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
    const dayFullName = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][dayOfWeek];
    
    // Check if this weekday matches group schedule
    const scheduleLower = currentGroup?.daysSchedule?.toLowerCase() || '';
    const isScheduledDay = 
      scheduleLower.includes(dayFullName.toLowerCase()) || 
      scheduleLower.includes(dayNamesShort[dayOfWeek].toLowerCase()) ||
      scheduleLower.includes('har kuni');

    return {
      day,
      dayFormatted,
      fullDate,
      dayOfWeek,
      shortName: dayNamesShort[dayOfWeek],
      dayFullName,
      isScheduledDay,
      isToday: fullDate === getTodayDateString(),
    };
  });

  // Cycle status for cell in monthly matrix
  const handleCellClick = (studentId: string, fullDate: string) => {
    const currentRec = attendance.find(
      (a) => a.date === fullDate && a.groupId === (currentGroup?.id || '') && a.studentId === studentId
    );

    let nextStatus: AttendanceStatus | null = 'present';
    if (!currentRec) {
      nextStatus = 'present';
    } else if (currentRec.status === 'present') {
      nextStatus = 'late';
    } else if (currentRec.status === 'late') {
      nextStatus = 'excused';
    } else if (currentRec.status === 'excused') {
      nextStatus = 'absent';
    } else {
      nextStatus = null; // resets to empty
    }

    if (nextStatus) {
      setAttendanceRecord({
        date: fullDate,
        groupId: currentGroup?.id || '',
        studentId,
        status: nextStatus,
        comment: currentRec?.comment || '',
      });
    } else {
      // Remove record or mark as excused/reset
      setAttendanceRecord({
        date: fullDate,
        groupId: currentGroup?.id || '',
        studentId,
        status: 'absent',
        comment: '',
      });
    }
  };

  // Mark all students present for a specific date
  const handleMarkDayAllPresent = (targetDate: string) => {
    const records = groupStudents.map((s) => ({
      date: targetDate,
      groupId: currentGroup?.id || '',
      studentId: s.id,
      status: 'present' as AttendanceStatus,
      comment: '',
    }));
    bulkSetAttendance(records);
  };

  // Single day status change for Daily mode
  const handleDailySetStatus = (studentId: string, status: AttendanceStatus) => {
    const existing = attendance.find(
      (a) => a.date === selectedDate && a.groupId === (currentGroup?.id || '') && a.studentId === studentId
    );
    setAttendanceRecord({
      date: selectedDate,
      groupId: currentGroup?.id || '',
      studentId,
      status,
      comment: existing?.comment || '',
    });
  };

  // Change comment for Daily mode
  const handleDailySetComment = (studentId: string, comment: string) => {
    const existing = attendance.find(
      (a) => a.date === selectedDate && a.groupId === (currentGroup?.id || '') && a.studentId === studentId
    );
    setAttendanceRecord({
      date: selectedDate,
      groupId: currentGroup?.id || '',
      studentId,
      status: existing?.status || 'present',
      comment,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {settings.centerName}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">Davomat Nazorati</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Talabalar Davomati Jurnali
          </h1>
          <p className="text-xs text-slate-500">
            Darsga qatnashuv jurnali, kechikishlar va sababli qoldirilgan darslar nazorati
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oylik Jurnal Matritsasi
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kunlik Davomat
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Select Group & Select Month / Date */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Select Group */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Guruh:</span>
            {groups.length === 0 ? (
              <span className="text-xs text-rose-600 font-semibold">Guruhlar hali kiritilmagan</span>
            ) : (
              <select
                value={selectedGroupId || groups[0]?.id}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.daysSchedule})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Month Selector if Monthly Mode */}
          {viewMode === 'monthly' ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Oylik Davr:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            /* Date Selector if Daily Mode */
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Sana:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Quick Group Info */}
        {currentGroup && (
          <div className="text-xs text-slate-600 flex items-center gap-3">
            <span>Ustoz: <strong className="text-slate-900">{currentTeacher?.fullName || 'Belgilanmagan'}</strong></span>
            <span>•</span>
            <span>Dars kunlari: <strong className="text-blue-600">{currentGroup.daysSchedule}</strong></span>
            <span>•</span>
            <span>Vaqti: <strong className="text-slate-800">{currentGroup.startTime} - {currentGroup.endTime}</strong></span>
          </div>
        )}
      </div>

      {/* Empty State when no groups exist */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Guruhlar Hali Kiritilmagan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Dars jadvali bo'limida guruhlarni kiritib, o'quvchilarni biriktirganingizdan so'ng, ushbu oylik davomat jurnali avtomatik shakllanadi.
          </p>
        </div>
      ) : viewMode === 'monthly' ? (
        /* ================= 1. OYLIK DAVOMAT JURNALI (MONTHLY MATRIX) ================= */
        <div className="space-y-4">
          {/* Action Bar & Legend */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Quick Action: Mark Today Present */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkDayAllPresent(getTodayDateString())}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Bugungi darsga barchani keldi qilish</span>
              </button>
              <span className="text-[11px] text-slate-400">
                (Katak ustiga bosib: <strong>+</strong>, <strong>K</strong>, <strong>S</strong>, <strong>-</strong> belgilang)
              </span>
            </div>

            {/* Matrix Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span>+</span> <span>Keldi</span>
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <span>K</span> <span>Kechikdi</span>
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                <span>S</span> <span>Sababli</span>
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <span>-</span> <span>Kelmadi</span>
              </span>
            </div>
          </div>

          {/* Interactive Monthly Grid Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white select-none">
                  <tr>
                    <th className="p-3 sticky left-0 bg-slate-900 z-10 w-44 font-bold uppercase text-[10px] tracking-wider">
                      Talaba F.I.Sh
                    </th>
                    {daysList.map((d) => (
                      <th
                        key={d.day}
                        className={`p-1 text-center min-w-[32px] border-l border-slate-800 ${
                          d.isToday ? 'bg-blue-600 text-white font-black' : d.isScheduledDay ? 'bg-slate-800 font-bold' : 'text-slate-400'
                        }`}
                        title={`${d.day}-${monthStr} ${d.dayFullName}`}
                      >
                        <div className="text-[11px] leading-tight">{d.day}</div>
                        <div className="text-[9px] opacity-75 font-normal">{d.shortName}</div>
                      </th>
                    ))}
                    <th className="p-2 text-center bg-slate-900 font-bold text-[10px] uppercase w-16">
                      Keldi
                    </th>
                    <th className="p-2 text-center bg-slate-900 font-bold text-[10px] uppercase w-16">
                      Qoldirdi
                    </th>
                    <th className="p-2 text-center bg-slate-900 font-bold text-[10px] uppercase w-16">
                      Foiz %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupStudents.length === 0 ? (
                    <tr>
                      <td colSpan={daysList.length + 4} className="py-12 text-center text-slate-400 italic">
                        Ushbu guruhga hali talabalar biriktirilmagan. "Talabalar" bo'limida talaba qo'shishingiz mumkin.
                      </td>
                    </tr>
                  ) : (
                    groupStudents.map((student) => {
                      let studentAttended = 0;
                      let studentMissed = 0;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Student Name */}
                          <td className="p-2.5 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200 font-bold text-slate-900 truncate max-w-[170px]">
                            <div className="truncate">{student.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{student.phone}</div>
                          </td>

                          {/* Day Columns */}
                          {daysList.map((d) => {
                            const rec = attendance.find(
                              (a) => a.date === d.fullDate && a.groupId === currentGroup?.id && a.studentId === student.id
                            );

                            let cellContent = '';
                            let cellClass = 'bg-slate-50/40 text-slate-300 hover:bg-blue-50';

                            if (rec?.status === 'present') {
                              cellContent = '+';
                              cellClass = 'bg-emerald-100 text-emerald-800 font-black';
                              studentAttended++;
                            } else if (rec?.status === 'late') {
                              cellContent = 'K';
                              cellClass = 'bg-amber-100 text-amber-900 font-black';
                              studentAttended++;
                            } else if (rec?.status === 'excused') {
                              cellContent = 'S';
                              cellClass = 'bg-blue-100 text-blue-900 font-black';
                            } else if (rec?.status === 'absent') {
                              cellContent = '-';
                              cellClass = 'bg-rose-100 text-rose-800 font-black';
                              studentMissed++;
                            }

                            return (
                              <td
                                key={d.day}
                                onClick={() => handleCellClick(student.id, d.fullDate)}
                                className={`p-0 text-center border-l border-slate-100 cursor-pointer select-none transition-colors ${cellClass}`}
                                title={`${student.fullName} — ${d.day}-${monthStr} (${rec?.status || 'Belgilanmagan'}). O'zgartirish uchun bosing.`}
                              >
                                <div className="h-8 flex items-center justify-center text-xs">
                                  {cellContent}
                                </div>
                              </td>
                            );
                          })}

                          {/* Attended Count */}
                          <td className="p-2 text-center font-black text-emerald-700 bg-emerald-50/30 border-l border-slate-200">
                            {studentAttended}
                          </td>

                          {/* Missed Count */}
                          <td className="p-2 text-center font-black text-rose-600 bg-rose-50/30 border-l border-slate-200">
                            {studentMissed}
                          </td>

                          {/* Attendance Rate */}
                          <td className="p-2 text-center font-black text-slate-800 border-l border-slate-200">
                            {studentAttended + studentMissed > 0
                              ? `${Math.round((studentAttended / (studentAttended + studentMissed)) * 100)}%`
                              : '100%'}
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
      ) : (
        /* ================= 2. KUNLIK TEZKOR DAVOMAT (DAILY VIEW) ================= */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {formatDate(selectedDate)} kungi davomat nazorati
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleMarkDayAllPresent(selectedDate)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + Barchasini keldi qilish
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Talaba F.I.Sh</th>
                    <th className="p-3.5">Telefon</th>
                    <th className="p-3.5 text-center">Davomat Holati</th>
                    <th className="p-3.5">Sabab / Izoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        Ushbu guruhda talabalar mavjud emas
                      </td>
                    </tr>
                  ) : (
                    groupStudents.map((student) => {
                      const rec = attendance.find(
                        (a) => a.date === selectedDate && a.groupId === currentGroup?.id && a.studentId === student.id
                      );
                      const currentStatus = rec?.status || null;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{student.fullName}</td>
                          <td className="p-3.5 text-slate-600">{student.phone}</td>
                          <td className="p-3.5 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => handleDailySetStatus(student.id, 'present')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                                  currentStatus === 'present' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'
                                }`}
                              >
                                Keldi
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDailySetStatus(student.id, 'late')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                                  currentStatus === 'late' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-amber-50'
                                }`}
                              >
                                Kechikdi
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDailySetStatus(student.id, 'excused')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                                  currentStatus === 'excused' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'
                                }`}
                              >
                                Sababli
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDailySetStatus(student.id, 'absent')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                                  currentStatus === 'absent' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-rose-50'
                                }`}
                              >
                                Kelmadi
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <input
                              type="text"
                              value={rec?.comment || ''}
                              onChange={(e) => handleDailySetComment(student.id, e.target.value)}
                              placeholder="Izoh..."
                              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full max-w-xs focus:outline-none"
                            />
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
      )}
    </div>
  );
};
