import React from 'react';
import { 
  Building2, 
  Calendar, 
  Users, 
  GraduationCap, 
  CheckSquare, 
  CreditCard, 
  Wallet, 
  BarChart3, 
  Settings, 
  Sparkles, 
  ChevronRight,
  Clock,
  UserPlus,
  ShoppingBag,
  Award
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, teachers, students, groups, leads, getStudentBalance, getTeacherCalculations } = useData();

  // Calculate live badge counts
  const totalDebtors = students.filter((s) => s.status === 'active' && getStudentBalance(s.id).debt > 0).length;
  
  // Teachers with pending payouts
  const teachersPendingPayout = teachers.filter((t) => {
    const calc = getTeacherCalculations(t.id);
    return calc.remainingBalance > 0;
  }).length;

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;

  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Bosh sahifa',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 'schedule',
      label: 'Dars jadvali',
      icon: <Calendar className="w-5 h-5" />,
      badge: groups.filter(g => g.status === 'active').length || undefined,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'teachers',
      label: "O'qituvchilar",
      icon: <Users className="w-5 h-5" />,
      badge: teachers.length || undefined,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'students',
      label: 'Talabalar',
      icon: <GraduationCap className="w-5 h-5" />,
      badge: students.length || undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'attendance',
      label: 'Davomat (Oylik)',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'payments',
      label: "To'lovlar jurnali",
      icon: <CreditCard className="w-5 h-5" />,
      badge: totalDebtors > 0 ? `${totalDebtors} qarz` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'monthly_unpaid',
      label: "Oylar bo'yicha to'lov",
      icon: <Clock className="w-5 h-5" />,
      badge: totalDebtors > 0 ? `${totalDebtors} kutilmoqda` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
    },
    {
      id: 'teacher_payouts',
      label: "O'qituvchi oyligi",
      icon: <Wallet className="w-5 h-5" />,
      badge: teachersPendingPayout > 0 ? `${teachersPendingPayout} to'lash` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
    },
    {
      id: 'ai_assistant',
      label: 'Meier Edu AI & SMS',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      badge: 'Gemini AI',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold',
    },
    {
      id: 'certificates',
      label: 'Sertifikatlar',
      icon: <Award className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'leads',
      label: "Qabul / Lidlar",
      icon: <UserPlus className="w-5 h-5" />,
      badge: newLeadsCount > 0 ? `${newLeadsCount} yangi` : undefined,
      badgeColor: 'bg-purple-100 text-purple-800 font-bold',
    },
    {
      id: 'expenses',
      label: "Markaz xarajatlari",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'analytics',
      label: 'Analitika va hisobot',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'admin_panel',
      label: 'Admin panel',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-xl tracking-wider">
          M
        </div>
        <div className="overflow-hidden">
          <h1 className="font-extrabold text-white text-base leading-tight truncate tracking-tight">Meier Edu</h1>
          <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            O'quv Markazi CRM
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Asosiy Bo'limlar
        </div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Quick Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-semibold text-white">Administrator</span>
            <span className="text-emerald-400 font-medium">Onlayn</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Ma'lumotlar bazasi saqlanmoqda
          </div>
        </div>
      </div>
    </aside>
  );
};
