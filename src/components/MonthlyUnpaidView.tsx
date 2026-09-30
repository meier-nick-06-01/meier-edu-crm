import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  ArrowUpRight,
  Share2,
  MessageSquare
} from 'lucide-react';
import { useData, StudentMonthlyReport, MonthlyStatusItem } from '../context/DataContext';
import { formatCurrency, formatMonthPeriod, UZ_MONTH_NAMES, getCurrentMonthString } from '../utils/formatters';

interface MonthlyUnpaidViewProps {
  onOpenPaymentModal: (studentId?: string, groupId?: string, monthFor?: string) => void;
}

export const MonthlyUnpaidView: React.FC<MonthlyUnpaidViewProps> = ({ onOpenPaymentModal }) => {
  const { 
    students, 
    groups, 
    courses, 
    getAllStudentsMonthlyReports, 
    settings,
    searchQuery 
  } = useData();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid_only' | 'paid_only'>('all');
  const [selectedStudentReport, setSelectedStudentReport] = useState<StudentMonthlyReport | null>(null);

  const currentMonthKey = getCurrentMonthString();

  // Get reports for selected year
  const allReports = getAllStudentsMonthlyReports(selectedYear);

  // Filter reports
  const filteredReports = allReports.filter((report) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = report.student.fullName.toLowerCase().includes(q);
      const matchPhone = report.student.phone.includes(q);
      if (!matchName && !matchPhone) return false;
    }

    // Group filter
    if (groupFilter !== 'all') {
      if (!report.student.groupIds.includes(groupFilter)) return false;
    }

    // Status filter
    if (statusFilter === 'unpaid_only' && report.unpaidMonthsCount === 0) {
      return false;
    }
    if (statusFilter === 'paid_only' && report.unpaidMonthsCount > 0) {
      return false;
    }

    return true;
  });

  // Calculate year totals
  let yearTotalExpected = 0;
  let yearTotalPaid = 0;
  let yearTotalDebt = 0;
  let totalUnpaidMonthCount = 0;

  filteredReports.forEach((r) => {
    yearTotalExpected += r.totalExpectedYear;
    yearTotalPaid += r.totalPaidYear;
    yearTotalDebt += r.totalDebtYear;
    totalUnpaidMonthCount += r.unpaidMonthsCount;
  });

  const monthShorts = [
    { num: '01', name: 'Yan' },
    { num: '02', name: 'Fev' },
    { num: '03', name: 'Mar' },
    { num: '04', name: 'Apr' },
    { num: '05', name: 'May' },
    { num: '06', name: 'Iyn' },
    { num: '07', name: 'Iyl' },
    { num: '08', name: 'Avg' },
    { num: '09', name: 'Sen' },
    { num: '10', name: 'Okt' },
    { num: '11', name: 'Noy' },
    { num: '12', name: 'Dek' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Oylik To'lovlar & Qaysi Oylar To'lanmaganini Nazorat Qilish
          </h1>
          <p className="text-xs text-slate-500">
            Har bir talabaning 12 oylik to'lov xaritasi: qaysi oylar to'langan va qaysilari qarz ekanligini kuzating
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-slate-900 px-2">{selectedYear}-yil</span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Year Expected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Yillik Kutilgan Reja
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(yearTotalExpected)}</div>
            <p className="text-xs text-slate-500 mt-1">{selectedYear}-yilgi hisob-kitob</p>
          </div>
        </div>

        {/* Card 2: Year Paid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jami To'langan (Tushum)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700">{formatCurrency(yearTotalPaid)}</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              Kassaga qabul qilingan summa
            </p>
          </div>
        </div>

        {/* Card 3: Year Remaining Debt */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              To'lanmagan Oylar Qoldig'i
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">{formatCurrency(yearTotalDebt)}</div>
            <p className="text-xs text-rose-700 font-bold mt-1">
              Kutilayotgan umumiy qarzdorlik
            </p>
          </div>
        </div>

        {/* Card 4: Unpaid Months Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              To'lanmagan Oylar Soni
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-800">{totalUnpaidMonthCount} ta oy</div>
            <p className="text-xs text-slate-500 mt-1">Qarzdor oylar bo'yicha to'lov kutilmoqda</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Group Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Guruh:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">Barcha guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">To'lov holati:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">Barchasi</option>
              <option value="unpaid_only">Faqat To'lanmagan (Qarzdorlar)</option>
              <option value="paid_only">To'liq to'laganlar</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">To'langan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">Qisman to'langan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600">To'lanmagan (Qarz)</span>
          </div>
        </div>
      </div>

      {/* Empty State when no students exist yet */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Hozircha Talabalar Mavjud Emas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            O'zingiz yangi o'quvchilarni qo'lda kiritganingizdan so'ng, ularning oylar kesimidagi to'lov jurnali va qaysi oylar to'lanmaganligi avtomatik shu yerda ko'rinadi.
          </p>
          <button
            onClick={() => onOpenPaymentModal()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>+ Yangi To'lov / Talaba Kiritish</span>
          </button>
        </div>
      ) : (
        /* The Full 12-Month Matrix Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              12 Oylik To'lovlar Matritsasi ({selectedYear}-yil)
            </h3>
            <span className="text-xs text-slate-500">
              Har bir katak ustiga bosib to'lovni tezkor qabul qilishingiz mumkin
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 sticky left-0 bg-slate-900 z-10 w-44">Talaba F.I.Sh</th>
                  <th className="p-3 text-center">Guruh</th>
                  {monthShorts.map((m) => (
                    <th key={m.num} className="p-2 text-center min-w-[70px]">
                      {m.name}
                    </th>
                  ))}
                  <th className="p-3 text-right">Yillik Qarz</th>
                  <th className="p-3 text-center">Tafsilot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => {
                  const studentGroups = groups.filter((g) => report.student.groupIds.includes(g.id));

                  return (
                    <tr key={report.student.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Name */}
                      <td className="p-3 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200 font-bold text-slate-900">
                        <div className="truncate max-w-[150px]">{report.student.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{report.student.phone}</div>
                      </td>

                      {/* Group */}
                      <td className="p-2 text-center">
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded truncate inline-block max-w-[100px]">
                          {studentGroups.map((g) => g.name).join(', ') || '—'}
                        </span>
                      </td>

                      {/* 12 Months Cells */}
                      {report.months.map((m) => {
                        const isCurrentOrPast = m.monthKey <= currentMonthKey;

                        if (m.status === 'paid') {
                          return (
                            <td key={m.monthKey} className="p-1 text-center">
                              <div
                                title={`${m.monthName} ${selectedYear}: ${formatCurrency(m.paid)} to'langan`}
                                className="w-full py-1.5 px-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-800 font-extrabold text-[10px] flex flex-col items-center justify-center transition-colors select-none"
                              >
                                <span className="flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>To'landi</span>
                                </span>
                                <span className="text-[9px] font-bold text-emerald-700 opacity-90">
                                  {m.paid >= 1000000 ? `${(m.paid / 1000000).toFixed(1)}M` : `${Math.round(m.paid / 1000)}k`}
                                </span>
                              </div>
                            </td>
                          );
                        } else if (m.status === 'partial') {
                          return (
                            <td key={m.monthKey} className="p-1 text-center">
                              <button
                                type="button"
                                onClick={() => onOpenPaymentModal(report.student.id, report.student.groupIds[0], m.monthKey)}
                                title={`${m.monthName} ${selectedYear}: ${formatCurrency(m.paid)} to'langan, qarz: ${formatCurrency(m.debt)}. To'lov kiritish uchun bosing.`}
                                className="w-full py-1.5 px-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900 font-extrabold text-[10px] flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                              >
                                <span className="flex items-center gap-0.5 text-amber-700">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Qisman</span>
                                </span>
                                <span className="text-[9px] text-rose-600 font-black">
                                  -{m.debt >= 1000000 ? `${(m.debt / 1000000).toFixed(1)}M` : `${Math.round(m.debt / 1000)}k`}
                                </span>
                              </button>
                            </td>
                          );
                        } else if (m.status === 'unpaid') {
                          return (
                            <td key={m.monthKey} className="p-1 text-center">
                              <button
                                type="button"
                                onClick={() => onOpenPaymentModal(report.student.id, report.student.groupIds[0], m.monthKey)}
                                title={`${m.monthName} ${selectedYear}: To'lanmagan qarz: ${formatCurrency(m.expected)}. To'lov kiritish uchun bosing.`}
                                className={`w-full py-1.5 px-1 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ${
                                  isCurrentOrPast
                                    ? 'bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700'
                                    : 'bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-500'
                                }`}
                              >
                                <span className="text-[9px] uppercase font-bold text-rose-600">
                                  {isCurrentOrPast ? 'Qarz' : 'Kutilmoqda'}
                                </span>
                                <span className="text-[9px] font-black text-rose-700">
                                  {m.expected >= 1000000 ? `${(m.expected / 1000000).toFixed(1)}M` : `${Math.round(m.expected / 1000)}k`}
                                </span>
                              </button>
                            </td>
                          );
                        } else {
                          return (
                            <td key={m.monthKey} className="p-1 text-center text-slate-300 text-[10px]">
                              —
                            </td>
                          );
                        }
                      })}

                      {/* Total Year Debt */}
                      <td className="p-3 text-right font-black">
                        {report.totalDebtYear > 0 ? (
                          <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs block">
                            {formatCurrency(report.totalDebtYear)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[11px]">
                            0 so'm (Yopilgan)
                          </span>
                        )}
                      </td>

                      {/* View Breakdown Drawer Button */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedStudentReport(report)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Tafsilot
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detailed Breakdown Drawer / Modal */}
      {selectedStudentReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg leading-tight">
                  {selectedStudentReport.student.fullName} — Oylik To'lov Jurnali
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Telefon: {selectedStudentReport.student.phone} • {selectedYear}-yil bo'yicha to'lovlar
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentReport(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Summary strip */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Jami Kutilgan</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedStudentReport.totalExpectedYear)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Jami To'langan</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(selectedStudentReport.totalPaidYear)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">To'lanmagan Qarz</span>
                <span className={`text-sm font-black ${selectedStudentReport.totalDebtYear > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(selectedStudentReport.totalDebtYear)}
                </span>
              </div>
            </div>

            {/* Months List */}
            <div className="p-6 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {selectedStudentReport.months.map((m) => (
                <div
                  key={m.monthKey}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    m.status === 'paid'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : m.status === 'partial'
                      ? 'bg-amber-50/50 border-amber-200'
                      : m.status === 'unpaid'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{m.monthName} {selectedYear}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        m.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                        m.status === 'unpaid' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {m.status === 'paid' ? 'To\'langan' :
                         m.status === 'partial' ? 'Qisman to\'langan' :
                         m.status === 'unpaid' ? 'To\'lanmagan (Qarz)' : 'Rejada yo\'q'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>Kutilgan: <strong>{formatCurrency(m.expected)}</strong></span>
                      <span>•</span>
                      <span>To'langan: <strong className="text-emerald-600">{formatCurrency(m.paid)}</strong></span>
                      {m.debt > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 font-bold">Qarz: {formatCurrency(m.debt)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    {m.status !== 'paid' && m.expected > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedStudentReport(null);
                          onOpenPaymentModal(
                            selectedStudentReport.student.id,
                            selectedStudentReport.student.groupIds[0],
                            m.monthKey
                          );
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Shu oyga to'lash</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Yopilgan</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {selectedStudentReport.totalDebtYear > 0 ? (
                <a
                  href={`https://t.me/share/url?text=${encodeURIComponent(
                    `Hurmatli ${selectedStudentReport.student.parentName || selectedStudentReport.student.fullName + ' oilasi'}! "${settings.centerName}" o'quv markazidan eslatma: ${selectedStudentReport.student.fullName}ning dars to'lovidan ${formatCurrency(selectedStudentReport.totalDebtYear)} miqdorida qoldiq mavjud. To'lovni o'z vaqtida amalga oshirishingizni so'raymiz. Aloqa: ${settings.centerPhone}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Telegram orqali Eslatma Yuborish</span>
                </a>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Qarzdorlik mavjud emas</span>
                </span>
              )}
              <button
                onClick={() => setSelectedStudentReport(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
