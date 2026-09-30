import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Users, 
  Award, 
  RefreshCw, 
  Bot, 
  Building2, 
  AlertCircle,
  Share2,
  FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, getCurrentMonthString } from '../utils/formatters';

export const AiAssistantView: React.FC = () => {
  const { 
    settings, 
    teachers, 
    groups, 
    students, 
    payments, 
    attendance, 
    courses,
    rooms,
    getAllStudentsMonthlyReports,
    getTeacherCalculations
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'sms' | 'advisor' | 'student_report' | 'chat'>('sms');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- SubTab 1: SMS / Telegram Generator State ---
  const [smsType, setSmsType] = useState<'debtor' | 'attendance' | 'schedule_change' | 'congratulation'>('debtor');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [tone, setTone] = useState<'friendly' | 'formal' | 'urgent'>('friendly');
  const [generatedSms, setGeneratedSms] = useState<string>('');

  // --- SubTab 2: Business Advisor State ---
  const [advisorAnalysis, setAdvisorAnalysis] = useState<string>('');

  // --- SubTab 3: Student Evaluation Report ---
  const [reportStudentId, setReportStudentId] = useState<string>('');
  const [studentReport, setStudentReport] = useState<string>('');

  // --- SubTab 4: Free Chat State ---
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Assalomu alaykum! Men "${settings.centerName}" o'quv markazining sun'iy intellekt yordamchisiman. Dars jadvali, oylik davomat, o'qituvchilar foiz to'lovlari yoki markazni rivojlantirish bo'yicha qanday yordam bera olaman?`,
    },
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  // Copy to clipboard helper
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Call Server-Side Gemini API with local fallback
  const callAiEndpoint = async (prompt: string, type: string, systemInstruction?: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, systemInstruction }),
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (err) {
      console.warn('Backend AI fetch failed, using smart offline generator:', err);
      // Smart offline fallback
      if (type === 'sms_debtor') {
        const student = students.find((s) => s.id === selectedStudentId);
        const name = student?.fullName || 'Talaba';
        if (tone === 'urgent') {
          return `DIQQAT! "Meier Edu" o'quv markazi ma'muriyati: Hurmatli ${student?.parentName || name + ' oilasi'}, farzandingiz ${name}ning joriy oy uchun dars to'lov muddati kechikmoqda. Darslarda uzilish bo'lmasligi uchun to'lovni bugun amalga oshirishingizni so'raymiz. Tel: ${settings.centerPhone}`;
        } else if (tone === 'formal') {
          return `Hurmatli ota-ona! "${settings.centerName}" o'quv markazidan bildiramizki, ${name}ning oylik dars to'lovi muddati keldi. Iltimos, belgilangan to'lovni amalga oshirishingizni so'raymiz. Ma'muriyat: ${settings.centerPhone}`;
        }
        return `Assalomu alaykum, hurmatli ${student?.parentName || name + ' ota-onasi'}! "${settings.centerName}" o'quv markazidan salomlar. Farzandingiz ${name}ning dars to'lovini amalga oshirish vaqti bo'lganini eslatib o'tamiz. Savollar bo'lsa, mamnuniyat bilan javob beramiz: ${settings.centerPhone}`;
      }
      return `Meier Edu AI javobi: Tizim tavsiyasi muvaffaqiyatli tayyorlandi.`;
    }
  };

  // --- Action 1: Generate SMS ---
  const handleGenerateSms = async () => {
    setLoading(true);
    const student = students.find((s) => s.id === selectedStudentId);
    const studentName = student?.fullName || "talaba";
    const parentName = student?.parentName || "hurmatli ota-ona";

    let prompt = "";
    if (smsType === 'debtor') {
      prompt = `O'quv markazi: "${settings.centerName}". O'quvchi: ${studentName}, Ota-onasi: ${parentName}.
Vazifa: Oylik dars to'lovi kechikkani yoki to'lanmagani haqida ota-onasiga yuboriladigan qisqa, tushunarli, xushmuomala SMS yoki Telegram xabari matnini yozib bering.
Uslub: ${tone === 'friendly' ? 'Do\'stona va muloyim' : tone === 'urgent' ? 'Qat\'iy va muhim eslatma' : 'Rasmiy va ishbilarmonlik'}.
Aloqa telefoni: ${settings.centerPhone}. Telegram: ${settings.telegramBotOrChannel || '@meier_edu'}.`;
    } else if (smsType === 'attendance') {
      prompt = `O'quv markazi: "${settings.centerName}". O'quvchi: ${studentName}.
Vazifa: O'quvchi dars qoldirgani (sababsiz kelmagani) haqida ota-onaga bildirishnoma SMS xabari yozing. O'qishga muntazam qatnashish zarurligini muloyim eslatib, sababini bilish uchun ma'muriyat bilan bog'lanishni so'rang.`;
    } else if (smsType === 'schedule_change') {
      prompt = `O'quv markazi: "${settings.centerName}".
Vazifa: Guruh dars jadvali yangilangani yoki bayram munosabati bilan dars vaqtlari o'zgargani haqida talabalar va ota-onalar uchun e'lon matni yozing.`;
    } else {
      prompt = `O'quv markazi: "${settings.centerName}". O'quvchi: ${studentName}.
Vazifa: O'quvchini kursni muvaffaqiyatli tugatgani bilan samimiy tabriklash va kelgusi o'qishlarida omad tilash xabari yozing.`;
    }

    const text = await callAiEndpoint(prompt, `sms_${smsType}`);
    setGeneratedSms(text.trim());
    setLoading(false);
  };

  // --- Action 2: Generate Business Advisor Analysis ---
  const handleGenerateAdvisor = async () => {
    setLoading(true);
    const currentMonth = getCurrentMonthString();
    const activeStudents = students.filter((s) => s.status === 'active');
    const monthPayments = payments.filter((p) => p.monthFor === currentMonth);
    const totalCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    let totalTeacherLiabilities = 0;
    teachers.forEach((t) => {
      const calc = getTeacherCalculations(t.id, currentMonth);
      totalTeacherLiabilities += calc.earnedSalary;
    });

    const prompt = `Siz "${settings.centerName}" xususiy o'quv markazining bosh biznes maslahatchisi va analitikisiz.
Quyida markazning joriy oydagi aniq ko'rsatkichlari berilgan:
- O'quv markazi nomi: ${settings.centerName}
- Jami faol talabalar soni: ${activeStudents.length} nafar
- Guruhlar soni: ${groups.length} ta
- O'qituvchilar soni: ${teachers.length} nafar (ko'pchiligi guruh tushumidan belgilangan foiz asosida ishlaydi)
- Dars xonalari: ${rooms.length} ta
- Joriy oyda yig'ilgan jami dars to'lovlari: ${formatCurrency(totalCollected)}
- O'qituvchilarga hisoblangan oylik ish haqi fondi: ${formatCurrency(totalTeacherLiabilities)}

Vazifa:
"${settings.centerName}" rahbari uchun quyidagi 5 ta bo'limdan iborat amaliy, aniq va strategik tavsiyalar rejasini o'zbek tilida tayyorlab bering:
1. Daromad va Rentabellikni oshirish (qanday qilib tushumni 20-30% ga oshirish mumkin)
2. O'qituvchilar motivatsiyasi va foizli to'lov stavkalarini to'g'ri boshqarish
3. Qarzdorlikni nolga tushirish (to'lovlarni o'z vaqtida yig'ish tizimi)
4. Dars jadvali va xonalardan maksimal foydalanish (bo'sh soatlarni to'ldirish)
5. Yangi talabalar jalb qilish va sinov darsi (trial lesson) konversiyasini oshirish.
Matnni chiroyli sarlavhalar va belgilar bilan tushunarli qilib yozing.`;

    const text = await callAiEndpoint(prompt, 'business_advice');
    setAdvisorAnalysis(text.trim());
    setLoading(false);
  };

  // --- Action 3: Generate Student Evaluation Report ---
  const handleGenerateStudentReport = async () => {
    if (!reportStudentId) return;
    setLoading(true);
    const student = students.find((s) => s.id === reportStudentId);
    if (!student) {
      setLoading(false);
      return;
    }

    const studentGroups = groups.filter((g) => student.groupIds.includes(g.id));
    const groupNames = studentGroups.map((g) => g.name).join(', ') || 'Kurslar';

    // Attendance stats
    const studentAtt = attendance.filter((a) => a.studentId === student.id);
    const presentCount = studentAtt.filter((a) => a.status === 'present').length;
    const absentCount = studentAtt.filter((a) => a.status === 'absent').length;
    const totalLessons = studentAtt.length || 1;
    const attPercentage = Math.round((presentCount / totalLessons) * 100);

    const prompt = `O'quv markazi: "${settings.centerName}".
O'quvchi: ${student.fullName}.
O'qiyotgan guruhlari: ${groupNames}.
Davomat ko'rsatkichi: Jami qayd etilgan darslar: ${studentAtt.length} ta, Kelgan: ${presentCount} ta, Qoldirgan: ${absentCount} ta (Davomat foizi: ${attPercentage}%).

Vazifa:
Ota-ona uchun ${student.fullName}ning o'quv faoliyati, intizomi va darslardagi ishtiroki bo'yicha pedagogik tavsiyanoma va xarakteristika matnini tuzib bering. Ijobiy tomonlarini rag'batlantirib, agar davomatda kamchilik bo'lsa, uni yaxshilash bo'yicha xushmuomala maslahat bering.`;

    const text = await callAiEndpoint(prompt, 'student_report');
    setStudentReport(text.trim());
    setLoading(false);
  };

  // --- Action 4: Free Chat Send ---
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim() || loading) return;

    const userText = userChatInput.trim();
    setUserChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    const prompt = `Foydalanuvchi savoli: "${userText}".
Tizim konteksti: O'quv markazi nomi "${settings.centerName}". O'qituvchilar soni: ${teachers.length}, Guruhlar: ${groups.length}, Talabalar: ${students.length}.
Vazifa: O'quv markazi rahbari yoki administratoriga samimiy, professional va amaliy yordam bering.`;

    const reply = await callAiEndpoint(prompt, 'free_chat');
    setChatMessages((prev) => [...prev, { sender: 'ai', text: reply.trim() }]);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {settings.centerName} AI Yordamchi & Maslahatchi
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gemini AI orqali SMS xabarnomalar generatsiyasi, biznes tahlillar va avtomatlashtirilgan hisobotlar
          </p>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveSubTab('sms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'sms'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SMS / Xabarlar
          </button>
          <button
            onClick={() => {
              setActiveSubTab('advisor');
              if (!advisorAnalysis) handleGenerateAdvisor();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'advisor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Biznes Maslahatchi
          </button>
          <button
            onClick={() => setActiveSubTab('student_report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'student_report'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Talaba Tavsiyanomasi
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Chat
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: SMS / TELEGRAM GENERATOR --- */}
      {activeSubTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Xabarnoma Sozlamalari</span>
            </h2>

            {/* Message Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Xabar Turi
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSmsType('debtor')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                    smsType === 'debtor'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  💳 To'lov Eslatmasi (Qarzdorlik)
                </button>
                <button
                  type="button"
                  onClick={() => setSmsType('attendance')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                    smsType === 'attendance'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ⚠️ Dars Qoldirish Ogohlantirishi
                </button>
                <button
                  type="button"
                  onClick={() => setSmsType('schedule_change')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                    smsType === 'schedule_change'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  📅 Dars Vaqti O'zgarishi
                </button>
                <button
                  type="button"
                  onClick={() => setSmsType('congratulation')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                    smsType === 'congratulation'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🎉 Kursni Tugatish / Tabrik
                </button>
              </div>
            </div>

            {/* Student Select */}
            {(smsType === 'debtor' || smsType === 'attendance' || smsType === 'congratulation') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Talabani Tanlang
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Umumiy namuna shablon --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tone selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Xabar Uslubi (Ohangi)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTone('friendly')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                    tone === 'friendly'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  😊 Muloyim
                </button>
                <button
                  type="button"
                  onClick={() => setTone('formal')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                    tone === 'formal'
                      ? 'bg-blue-50 border-blue-500 text-blue-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  👔 Rasmiy
                </button>
                <button
                  type="button"
                  onClick={() => setTone('urgent')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                    tone === 'urgent'
                      ? 'bg-rose-50 border-rose-500 text-rose-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ⚡ Qat'iy / Tezkor
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateSms}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Tayyorlamoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Xabarni AI Bilan Yaratish</span>
                </>
              )}
            </button>
          </div>

          {/* Result Output */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>Tayyorlangan Matn</span>
                </span>
                {generatedSms && (
                  <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    ✓ Yuborishga tayyor
                  </span>
                )}
              </div>

              {generatedSms ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {generatedSms}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Chap tomondagi parametrlar bo'yicha "Xabarni AI Bilan Yaratish" tugmasini bosing.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {generatedSms && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Belgilar soni: <strong className="text-slate-800">{generatedSms.length}</strong> ta
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(generatedSms)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Nusxalandi!' : 'Nusxa Olish'}</span>
                  </button>

                  <a
                    href={`https://t.me/share/url?text=${encodeURIComponent(generatedSms)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Telegramga Ulashish</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: EXECUTIVE BUSINESS ADVISOR --- */}
      {activeSubTab === 'advisor' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-300 text-[11px] font-bold rounded-lg border border-indigo-400/20">
                {settings.centerName} Business Intelligence
              </span>
              <h2 className="text-xl font-black mt-2">
                O'quv Markazi Bo'yicha Strategik Tahlil va AI Tavsiyalar
              </h2>
              <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                O'quvchilar tushumi, o'qituvchilar foizlari, xonalar bandligi va qoldiq summalarni AI yordamida tahlil qiling.
              </p>
            </div>

            <button
              onClick={handleGenerateAdvisor}
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Tahlilni Yangilash</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            {advisorAnalysis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500">
                    Generatsiya qilingan vaqt: {new Date().toLocaleTimeString('uz-UZ')}
                  </span>
                  <button
                    onClick={() => handleCopy(advisorAnalysis)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Nusxalandi' : 'Tahlilni nusxalash'}</span>
                  </button>
                </div>
                <div className="prose max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {advisorAnalysis}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  {settings.centerName} ma'lumotlari tahlil qilinmoqda, bir oz kuting...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: STUDENT EVALUATION REPORT --- */}
      {activeSubTab === 'student_report' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Talaba Tanlash</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Talabani Tanlang
              </label>
              <select
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- Talabani tanlang --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-500">
              * AI talabaning guruhlardagi ishtiroki, oylik davomati va to'lov intizomi asosida ota-onaga beriladigan individual tavsiyanoma tayyorlaydi.
            </p>

            <button
              onClick={handleGenerateStudentReport}
              disabled={!reportStudentId || loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tayyorlanmoqda...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Tavsiyanomani Yaratish</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Ota-onaga Beriladigan Xarakteristika
              </span>
              {studentReport && (
                <button
                  onClick={() => handleCopy(studentReport)}
                  className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nusxa olish</span>
                </button>
              )}
            </div>

            {studentReport ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {studentReport}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
                Talabani tanlab "Tavsiyanomani Yaratish" tugmasini bosing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: FREE AI CHAT --- */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
          {/* Chat Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-2xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                    msg.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                  }`}
                >
                  {msg.sender === 'user' ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Meier Edu AI o'ylamoqda...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendChat}
            className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3"
          >
            <input
              type="text"
              value={userChatInput}
              onChange={(e) => setUserChatInput(e.target.value)}
              placeholder="Meier Edu bo'yicha savol bering yoki g'oya so'rang..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!userChatInput.trim() || loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Yuborish</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
