import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  GraduationCap, 
  Award, 
  PieChart, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { 
  formatCurrency, 
  formatDate, 
  formatMonthPeriod, 
  getCurrentMonthString, 
  UZ_MONTH_NAMES 
} from '../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { 
    teachers, 
    courses, 
    groups, 
    students, 
    payments, 
    teacherPayouts, 
    attendance, 
    getTeacherCalculations, 
    getStudentBalance,
    settings 
  } = useData();

  const currentMonth = getCurrentMonthString();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentMonth);

  // 1. Financial stats for selected period
  const periodPayments = payments.filter((p) => p.monthFor === selectedPeriod);
  const totalRevenue = periodPayments.reduce((sum, p) => sum + p.amount, 0);

  const periodTeacherPayouts = teacherPayouts.filter((tp) => tp.period === selectedPeriod);
  const totalTeacherExpense = periodTeacherPayouts.reduce((sum, tp) => sum + tp.amount, 0);

  // Total calculated teacher salary liabilities for this period
  let totalCalculatedSalary = 0;
  teachers.forEach((t) => {
    const calc = getTeacherCalculations(t.id, selectedPeriod);
    totalCalculatedSalary += calc.earnedSalary;
  });

  const netProfit = totalRevenue - totalTeacherExpense;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // 2. Revenue by course
  const courseAnalytics = courses.map((course) => {
    const courseGroups = groups.filter((g) => g.courseId === course.id);
    const courseGroupIds = courseGroups.map((g) => g.id);

    const enrolledStudents = students.filter(
      (s) => s.status === 'active' && s.groupIds.some((gId) => courseGroupIds.includes(gId))
    );

    const courseRevenue = periodPayments
      .filter((p) => courseGroupIds.includes(p.groupId))
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      course,
      groupCount: courseGroups.length,
      studentCount: enrolledStudents.length,
      revenue: courseRevenue,
      percentOfTotal: totalRevenue > 0 ? Math.round((courseRevenue / totalRevenue) * 100) : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // 3. Overall attendance metrics
  const totalAttendanceRecords = attendance.length;
  const presentRecords = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const overallAttendanceRate = totalAttendanceRecords > 0 
    ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
    : 100;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analitika va Hisobotlar</h1>
          <p className="text-xs text-slate-500">
            Markaz daromadlari, o'qituvchilar xarajatlari va umumiy samaradorlik
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
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jami Tushum</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalRevenue)}</div>
          <span className="text-xs text-slate-400 mt-1 block">Talabalar to'lovlari</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">O'qituvchilar Maoshi</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{formatCurrency(totalTeacherExpense)}</div>
          <span className="text-xs text-slate-400 mt-1 block">To'langan avans va oylik</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sof Operatsion Foyda</span>
            <div className={`p-2 rounded-xl ${netProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatCurrency(netProfit)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Tushum - O'qituvchi oyliklari</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Foydalilik Marjasi</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{profitMargin}%</div>
          <span className="text-xs text-slate-400 mt-1 block">Sof foyda rentabelligi</span>
        </div>
      </div>

      {/* Visual Progress / Distribution Bars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Moliyaviy Taqsimot ({formatMonthPeriod(selectedPeriod)})
        </h3>

        {/* Visual Bar */}
        <div className="w-full bg-slate-100 rounded-2xl h-8 flex overflow-hidden p-1 gap-1">
          {totalRevenue > 0 && totalTeacherExpense > 0 && (
            <div
              style={{ width: `${Math.min(100, Math.round((totalTeacherExpense / totalRevenue) * 100))}%` }}
              className="bg-amber-500 rounded-xl flex items-center justify-center text-[10px] font-bold text-white transition-all overflow-hidden"
              title="O'qituvchilar maoshi"
            >
              Maosh: {Math.round((totalTeacherExpense / totalRevenue) * 100)}%
            </div>
          )}
          {netProfit > 0 && totalRevenue > 0 && (
            <div
              style={{ width: `${Math.round((netProfit / totalRevenue) * 100)}%` }}
              className="bg-indigo-600 rounded-xl flex items-center justify-center text-[10px] font-bold text-white transition-all overflow-hidden"
              title="Sof foyda"
            >
              Foyda: {Math.round((netProfit / totalRevenue) * 100)}%
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>O'qituvchilar xarajati: <strong>{formatCurrency(totalTeacherExpense)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span>Markaz sof foydasi: <strong>{formatCurrency(netProfit)}</strong></span>
          </div>
        </div>
      </div>

      {/* Course Revenue & Popularity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Yo'nalishlar va Kurslar Bo'yicha Tushum Ulushi
          </h3>
          <span className="text-xs text-slate-500">
            {courses.length} ta ta'lim yo'nalishi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Kurs Nomi</th>
                <th className="p-3.5">Guruhlar</th>
                <th className="p-3.5 text-center">Talabalar</th>
                <th className="p-3.5 text-right">Oylik Narxi</th>
                <th className="p-3.5 text-right">Oylik Tushum</th>
                <th className="p-3.5 text-center">Tushumdagi Ulushi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courseAnalytics.map(({ course, groupCount, studentCount, revenue, percentOfTotal }) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block text-sm">{course.title}</span>
                    <span className="text-[11px] text-slate-400">{course.subject}</span>
                  </td>

                  <td className="p-3.5 text-slate-700 font-medium">{groupCount} ta guruh</td>

                  <td className="p-3.5 text-center font-bold text-indigo-700">
                    {studentCount} nafar
                  </td>

                  <td className="p-3.5 text-right font-medium text-slate-600">
                    {formatCurrency(course.monthlyPrice)}
                  </td>

                  <td className="p-3.5 text-right font-black text-emerald-600 text-sm">
                    {formatCurrency(revenue)}
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${percentOfTotal}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-700 text-xs">{percentOfTotal}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
