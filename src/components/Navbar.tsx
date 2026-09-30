import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Download, 
  RotateCcw,
  Sparkles,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate, getTodayDateString, UZ_MONTH_NAMES } from '../utils/formatters';

interface NavbarProps {
  onOpenPaymentModal: () => void;
  onOpenStudentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPaymentModal, onOpenStudentModal }) => {
  const { searchQuery, setSearchQuery, settings, activeTab } = useData();

  const today = new Date();
  const day = today.getDate();
  const monthKey = String(today.getMonth() + 1).padStart(2, '0');
  const monthName = UZ_MONTH_NAMES[monthKey] || '';
  const year = today.getFullYear();
  const dateFormatted = `${day}-${monthName}, ${year}-yil`;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Boshqaruv Paneli & Umumiy Holat';
      case 'schedule': return 'Dars Jadvali & Xonalar Taqsimoti';
      case 'teachers': return "O'qituvchilar Ro'yxati & Shartnomalar";
      case 'students': return "Talabalar Ro'yxati & Guruhlar";
      case 'attendance': return 'Talabalar Davomati Nazorati';
      case 'payments': return "To'lovlar & Qarzdorlik Hisoboti";
      case 'monthly_unpaid': return "Oylar Kesimida To'lovlar Matritsasi & Qarzdorlik";
      case 'teacher_payouts': return "O'qituvchilar Ish Haqi & Qoldiq Summalar";
      case 'leads': return "Qabul Bo'limi & Nomzod Lidlar (Voronka)";
      case 'expenses': return "Markaz Xarajatlari & Haqiqiy Sof Foyda";
      case 'analytics': return 'Moliya & Faoliyat Analitikasi';
      case 'admin_panel': return "Admin Panel & Ma'lumotlar Bazasi";
      default: return 'Boshqaruv Paneli';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Section Name */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{getTabTitle()}</h2>
          <p className="text-xs text-slate-500 font-medium">{settings.centerName}</p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Talaba, o'qituvchi, guruh yoki telefon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>{dateFormatted}</span>
        </div>

        {/* Quick Add Student */}
        <button
          onClick={onOpenStudentModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">+ Yangi Talaba</span>
        </button>

        {/* Quick Add Payment */}
        <button
          onClick={onOpenPaymentModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-emerald-600/30 cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>+ To'lov Qabul Qilish</span>
        </button>
      </div>
    </header>
  );
};
