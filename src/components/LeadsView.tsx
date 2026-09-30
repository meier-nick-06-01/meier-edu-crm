import React, { useState } from 'react';
import { 
  UserPlus, 
  Send, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  Sparkles,
  MessageSquare,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Lead } from '../types';
import { formatDate, getTodayDateString, formatCurrency } from '../utils/formatters';

interface LeadsViewProps {
  onOpenStudentModalWithLead?: (lead: Lead) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onOpenStudentModalWithLead }) => {
  const { leads, addLead, updateLead, deleteLead, addStudent, courses, groups, settings } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [courseInterest, setCourseInterest] = useState('');
  const [trialDate, setTrialDate] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    return true;
  });

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    addLead({
      fullName: fullName.trim(),
      phone: phone.trim(),
      courseInterest: courseInterest.trim() || 'Umumiy kurs',
      status: trialDate ? 'trial_scheduled' : 'new',
      trialDate: trialDate || undefined,
      notes: notes.trim(),
    });

    setFullName('');
    setPhone('+998 ');
    setCourseInterest('');
    setTrialDate('');
    setNotes('');
    setIsModalOpen(false);
  };

  // Convert Lead to Enrolled Student
  const handleConvertToStudent = (lead: Lead) => {
    addStudent({
      fullName: lead.fullName,
      phone: lead.phone,
      groupIds: groups.length > 0 ? [groups[0].id] : [],
      enrollmentDate: getTodayDateString(),
      status: 'active',
      notes: `Liddan o'tkazildi. Qiziqqan fani: ${lead.courseInterest}. ${lead.notes || ''}`,
    });

    updateLead(lead.id, { status: 'enrolled' });
    alert(`"${lead.fullName}" muvaffaqiyatli talabalar ro'yxatiga qo'shildi!`);
  };

  // Copy Template Message helper
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const templates = [
    {
      id: 'trial_invite',
      title: 'Sinov darsiga taklifnoma',
      category: 'Lidlar uchun',
      text: `Assalomu alaykum! "${settings.centerName}" o'quv markazimizga qiziqish bildirganingiz uchun tashakkur. Sizni ertaga soat 15:00 da bepul sinov darsimizga taklif qilamiz. Manzilimiz: ${settings.centerAddress}. Tel: ${settings.centerPhone}`,
    },
    {
      id: 'debt_reminder',
      title: 'Qarzdorlik eslatmasi (Ota-onaga)',
      category: 'Moliya',
      text: `Hurmatli ota-ona! "${settings.centerName}" o'quv markazidan eslatib o'tamizki, farzandingizning o'quv to'lovidan to'lanmagan qoldiq mavjud. Iltimos, to'lovni oyning 5-sanasiga qadar amalga oshirishingizni so'raymiz. Tel: ${settings.centerPhone}`,
    },
    {
      id: 'attendance_warning',
      title: 'Darsga kelmaganlik xabarnomasi',
      category: 'Davomat',
      text: `Hurmatli ota-ona! "${settings.centerName}" o'quv markazi ma'muriyati shuni ma'lum qiladiki, farzandingiz bugun dars mashg'ulotlarida ishtirok etmadi. Iltimos, sababini aniqlashtirish uchun biz bilan bog'laning: ${settings.centerPhone}`,
    },
    {
      id: 'payment_success',
      title: 'To\'lov qabul qilinganligi tasdig\'i',
      category: 'Chek',
      text: `Hurmatli o'quvchi! "${settings.centerName}" da to'lovingiz muvaffaqiyatli qabul qilindi. O'qishlaringizda ulkan muvaffaqiyatlar tilaymiz! ${settings.receiptFooterText}`,
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
              {settings.centerName} CRM
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">Qabul & Murojaatlar</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Lidlar & Yangi Murojaatlar (CRM Qabul Bo'limi)
          </h1>
          <p className="text-xs text-slate-500">
            Telefon qilgan va sinov darsiga yozilgan nomzodlarni kuzatib, 1 bosishda talabaga aylantiring
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yangi Nomzod / Murojaat</span>
        </button>
      </div>

      {/* Idea Banner: CRM Lead Conversion Workflow */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-purple-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-purple-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Markazni rivojlantirish g'oyasi: Konversiya voronkasi</span>
          </div>
          <h3 className="text-lg font-black tracking-tight">O'quvchilar sonini 2 baravar oshirish voronkasi</h3>
          <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
            Telefon qilgan yoki Telegram orqali yozgan har bir odamni ro'yxatga oling. Ularni bepul sinov darsiga chaqiring va sinov darsidan so'ng 1 ta tugma orqali faol talabaga aylantiring!
          </p>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Leads Table), Right 1 Col (SMS/Telegram Templates) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leads List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Holat:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="all">Barchasi ({leads.length})</option>
                <option value="new">Yangi murojaatlar</option>
                <option value="trial_scheduled">Sinov darsiga chaqirilgan</option>
                <option value="enrolled">Guruhga a'zo bo'lgan</option>
                <option value="cancelled">Rad etgan</option>
              </select>
            </div>
            <span className="text-xs text-slate-500">
              Jami: <strong className="text-slate-900">{filteredLeads.length}</strong> nafar
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <p className="mb-3">Hozircha yangi murojaatlar kiritilmagan.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-colors"
                >
                  + Birinchi Murojaatni Kiritish
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  return (
                    <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{lead.fullName}</h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'trial_scheduled' ? 'bg-amber-100 text-amber-800' :
                            lead.status === 'enrolled' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {lead.status === 'new' ? 'Yangi' :
                             lead.status === 'trial_scheduled' ? 'Sinov darsi' :
                             lead.status === 'enrolled' ? 'Guruhga qo\'shildi' : 'Bekor qilindi'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-slate-700">{lead.phone}</span>
                          <span>•</span>
                          <span>Qiziqishi: <strong className="text-purple-700">{lead.courseInterest}</strong></span>
                          {lead.trialDate && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-bold">Sinov darsi: {formatDate(lead.trialDate)}</span>
                            </>
                          )}
                        </div>

                        {lead.notes && (
                          <p className="text-[11px] text-slate-400 italic mt-1">{lead.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {lead.status !== 'enrolled' && (
                          <button
                            onClick={() => handleConvertToStudent(lead)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            title="Talabalar ro'yxatiga o'tkazish"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Talaba qilish</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`"${lead.fullName}" nomzodini o'chirishni tasdiqlaysizmi?`)) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: SMS & Telegram Templates */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">SMS & Telegram Shablonlari</h3>
                <p className="text-[11px] text-slate-500">1 bosishda ota-onaga nusxalash</p>
              </div>
            </div>

            <div className="space-y-3">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{tpl.title}</span>
                    <button
                      onClick={() => handleCopyText(tpl.id, tpl.text)}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedTemplate === tpl.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Nusxalandi!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Nusxalash</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed italic bg-white p-2 rounded-lg border border-slate-100">
                    "{tpl.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Yangi Nomzod / Murojaat Kiritish</h3>
                <p className="text-xs text-purple-200">Telefon qilgan yoki Telegram orqali murojaat etgan shaxs</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomzod F.I.Sh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Jamshid Aliyev"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Telefon Raqami <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Qiziqqan Fani / Kurs
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: IELTS yoki Matematika"
                    value={courseInterest}
                    onChange={(e) => setCourseInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sinov Darsi Sanasi (ixtiyoriy)
                  </label>
                  <input
                    type="date"
                    value={trialDate}
                    onChange={(e) => setTrialDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Qo'shimcha Izoh
                  </label>
                  <input
                    type="text"
                    placeholder="Qayerdan bildi, maqsadi..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
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
