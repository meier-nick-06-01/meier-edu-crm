import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Wallet,
  Calendar,
  Building,
  CreditCard
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { 
  formatCurrency, 
  formatDate, 
  formatMonthPeriod, 
  getCurrentMonthString, 
  getTodayDateString, 
  PAYMENT_METHODS 
} from '../utils/formatters';

interface DashboardViewProps {
  onOpenPaymentModal: (studentId?: string, groupId?: string) => void;
  onOpenTeacherPayoutModal: (teacherId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPaymentModal,
  onOpenTeacherPayoutModal,
}) => {
  const { 
    teachers, 
    students, 
    groups, 
    courses, 
    payments, 
    teacherPayouts, 
    attendance, 
    getTeacherCalculations, 
    getStudentBalance,
    settings,
    setActiveTab
  } = useData();

  const currentMonth = getCurrentMonthString();
  const todayStr = getTodayDateString();

  // 1. Total revenue for this month
  const totalRevenueThisMonth = payments
    .filter((p) => p.monthFor === currentMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  // 2. Total teacher payouts paid this month
  const totalTeacherPayoutsThisMonth = teacherPayouts
    .filter((tp) => tp.period === currentMonth)
    .reduce((sum, tp) => sum + tp.amount, 0);

  // 3. Total center debt to teachers (remaining salaries to pay!)
  let totalRemainingTeacherLiabilities = 0;
  teachers.forEach((t) => {
    const calc = getTeacherCalculations(t.id, currentMonth);
    if (calc.remainingBalance > 0) {
      totalRemainingTeacherLiabilities += calc.remainingBalance;
    }
  });

  // 4. Total student debts for this month
  let totalStudentDebt = 0;
  let debtorCount = 0;
  const debtorsList: { student: any; debt: number; groups: string[] }[] = [];

  students.forEach((s) => {
    if (s.status === 'active') {
      const balance = getStudentBalance(s.id, currentMonth);
      if (balance.debt > 0) {
        totalStudentDebt += balance.debt;
        debtorCount++;
        const sGroupNames = groups
          .filter((g) => s.groupIds.includes(g.id))
          .map((g) => g.name);
        debtorsList.push({ student: s, debt: balance.debt, groups: sGroupNames });
      }
    }
  });

  // 5. Net Profit (Operatsion sof foyda)
  const netProfit = totalRevenueThisMonth - totalTeacherPayoutsThisMonth;

  // 6. Active students count
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;

  // 7. Today's attendance percentage
  const todayAttendanceRecords = attendance.filter((a) => a.date === todayStr);
  const presentToday = todayAttendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = todayAttendanceRecords.length > 0 
    ? Math.round((presentToday / todayAttendanceRecords.length) * 100) 
    : 100;

  // 8. Recent 5 payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Period */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-blue-100 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{settings.centerName} • Moliya davri: {formatMonthPeriod(currentMonth)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{settings.centerName} Boshqaruv Markazi</h1>
          <p className="text-blue-100 text-sm mt-1">
            Barcha darslar, to'lovlar, o'qituvchilar maoshi va davomat nazorati bir joyda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenPaymentModal()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>To'lov qabul qilish</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Oylik Tushum (Kassa)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenueThisMonth)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>{payments.filter(p => p.monthFor === currentMonth).length} ta to'lov qabul qilindi</span>
            </p>
          </div>
        </div>

        {/* Card 2: Teacher Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              O'qituvchilarga To'langan
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalTeacherPayoutsThisMonth)}</div>
            <p className="text-xs text-blue-600 font-medium mt-1">
              Avans va oyliklar to'landi
            </p>
          </div>
        </div>

        {/* Card 3: Remaining Teacher Liabilities */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              O'qituvchiga Qoldiq Qarz
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-900">{formatCurrency(totalRemainingTeacherLiabilities)}</div>
            <button
              onClick={() => setActiveTab('teacher_payouts')}
              className="text-xs text-amber-700 font-semibold hover:underline mt-1 flex items-center gap-1 cursor-pointer"
            >
              <span>Hisob-kitobni ko'rish</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sof Foyda (Tushum - Maosh)
            </span>
            <div className={`p-2.5 rounded-xl ${netProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Markaz operatsion qoldig'i
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Faol Talabalar</span>
            <span className="text-lg font-bold text-slate-900">{activeStudentsCount} nafar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">O'qituvchilar</span>
            <span className="text-lg font-bold text-slate-900">{teachers.length} nafar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Faol Guruhlar</span>
            <span className="text-lg font-bold text-slate-900">
              {groups.filter(g => g.status === 'active').length} ta guruh
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Qarzdor Talabalar</span>
            <span className="text-lg font-bold text-rose-600">{debtorCount} nafar ({formatCurrency(totalStudentDebt)})</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Today's Schedule & Debtors / Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Recent Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Groups & Today's Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Guruhlar va Dars Vaqtlari</h3>
                <p className="text-xs text-slate-500">Faol kurslar jadvali va xonalari</p>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>To'liq jadval</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {groups.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p className="mb-3">Dars jadvali hali shakllantirilmagan.</p>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    + Dars Jadvalini Kiritish
                  </button>
                </div>
              ) : (
                groups.slice(0, 4).map((g) => {
                  const teacher = teachers.find((t) => t.id === g.teacherId);
                  const course = courses.find((c) => c.id === g.courseId);
                  const enrolledCount = students.filter(s => s.groupIds.includes(g.id) && s.status === 'active').length;
                  return (
                    <div key={g.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-blue-700 font-bold text-xs">
                          <span>{g.startTime}</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{g.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                              {course?.title}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Ustoz: <strong className="text-slate-700">{teacher?.fullName || 'Belgilanmagan'}</strong></span>
                            <span>•</span>
                            <span>Kunlar: <strong className="text-blue-600">{g.daysSchedule}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {enrolledCount} talaba
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Oxirgi Qabul Qilingan To'lovlar</h3>
                <p className="text-xs text-slate-500">Kassa orqali o'tgan so'nggi kvitansiyalar</p>
              </div>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Barcha to'lovlar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Chek №</th>
                    <th className="pb-3">Talaba</th>
                    <th className="pb-3">Guruh</th>
                    <th className="pb-3">To'lov Turi</th>
                    <th className="pb-3 text-right">Summa</th>
                    <th className="pb-3 text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Hozircha qabul qilingan to'lovlar mavjud emas.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => {
                      const student = students.find((s) => s.id === p.studentId);
                      const group = groups.find((g) => g.id === p.groupId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-mono font-medium text-slate-600">{p.receiptNo}</td>
                          <td className="py-2.5 font-bold text-slate-900">{student?.fullName || '—'}</td>
                          <td className="py-2.5 text-slate-600">{group?.name || '—'}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {PAYMENT_METHODS[p.method] || p.method}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-black text-emerald-600">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-2.5 text-right text-slate-500">{formatDate(p.date)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Teacher Payroll Status & Debtors */}
        <div className="space-y-6">
          {/* Teacher Payouts Quick Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">O'qituvchilar Maoshi</h3>
                <p className="text-xs text-slate-500">To'lanishi kutilayotgan qoldiqlar</p>
              </div>
              <button
                onClick={() => setActiveTab('teacher_payouts')}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                Barchasi →
              </button>
            </div>

            <div className="space-y-3">
              {teachers.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <p className="mb-2">O'qituvchilar hali kiritilmagan.</p>
                  <button
                    onClick={() => setActiveTab('teachers')}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + O'qituvchi Qo'shish
                  </button>
                </div>
              ) : (
                teachers.map((teacher) => {
                  const calc = getTeacherCalculations(teacher.id, currentMonth);
                  return (
                    <div
                      key={teacher.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate">{teacher.fullName}</span>
                        <span className="text-[11px] text-slate-500">{teacher.subject}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Qoldiq qarz:</span>
                          <span className={`font-black ${calc.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatCurrency(calc.remainingBalance)}
                          </span>
                        </div>

                        {calc.remainingBalance > 0 ? (
                          <button
                            onClick={() => onOpenTeacherPayoutModal(teacher.id)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            To'lash
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Yopilgan</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Debtors Warning Box */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs bg-rose-50/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">Qarzdor Talabalar</h3>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                {debtorCount} nafar
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {debtorsList.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  🎉 Barcha talabalar to'lovlarni amalga oshirgan!
                </div>
              ) : (
                debtorsList.slice(0, 5).map(({ student, debt, groups }) => (
                  <div
                    key={student.id}
                    className="p-2.5 bg-white border border-rose-200/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{student.fullName}</span>
                      <span className="text-[11px] text-slate-500">{student.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-rose-600 block">{formatCurrency(debt)}</span>
                      <button
                        onClick={() => onOpenPaymentModal(student.id)}
                        className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        To'lov olish
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {debtorsList.length > 5 && (
              <button
                onClick={() => setActiveTab('payments')}
                className="w-full mt-3 py-2 text-center text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
              >
                Barcha {debtorsList.length} ta qarzdorni ko'rish →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
