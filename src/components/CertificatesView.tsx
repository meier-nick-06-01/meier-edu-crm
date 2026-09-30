import React, { useState, useRef } from 'react';
import { 
  Award, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  Building2 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate, getTodayDateString } from '../utils/formatters';

export const CertificatesView: React.FC = () => {
  const { students, courses, groups, teachers, settings } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [completionDate, setCompletionDate] = useState<string>(getTodayDateString());
  const [grade, setGrade] = useState<string>("A'lo (Excellent)");
  const [certificateNo, setCertificateNo] = useState<string>(`ME-${Math.floor(100000 + Math.random() * 900000)}`);

  const student = students.find((s) => s.id === selectedStudentId);
  const course = courses.find((c) => c.id === selectedCourseId);
  const teacher = teachers.find((t) => t.id === selectedTeacherId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {settings.centerName} Sertifikat Generatori
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kursni muvaffaqiyatli tamomlagan talabalar uchun rasmiy sertifikat yaratish va chop etish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Sertifikatni Chop Etish</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Sertifikat Ma'lumotlari
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Talaba
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              {students.length === 0 ? (
                <option value="">Talabalar ro'yxati bo'sh</option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.phone})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kurs / Yo'nalish
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              O'qituvchi / Murabbiy
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              {teachers.length === 0 ? (
                <option value="">O'qituvchi kiritilmagan</option>
              ) : (
                teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.subject})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Berilgan Sana
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bahosi / Daraja
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Sertifikat Raqami
            </label>
            <input
              type="text"
              value={certificateNo}
              onChange={(e) => setCertificateNo(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Live Certificate Preview Sheet */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl border-8 border-amber-600/30 p-8 sm:p-12 shadow-2xl relative text-center overflow-hidden">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-amber-600 rounded-tl-xl" />
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-amber-600 rounded-tr-xl" />
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-amber-600 rounded-bl-xl" />
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-amber-600 rounded-br-xl" />

            {/* Inner Border */}
            <div className="border border-amber-400/40 p-6 sm:p-8 rounded-2xl relative">
              {/* Center Brand */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="w-6 h-6 text-amber-600" />
                <span className="text-xl font-black tracking-widest text-slate-900 uppercase">
                  {settings.centerName}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-6">
                Zamonaviy Ta'lim & Rivojlanish Markazi
              </p>

              <h2 className="text-3xl sm:text-4xl font-serif font-black text-amber-700 tracking-wider uppercase my-4">
                SERTIFIKAT
              </h2>
              <p className="text-xs text-slate-500 italic mb-4">
                Ushbu rasmiy hujjat tasdiqlaydi:
              </p>

              <div className="my-6">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 border-b-2 border-amber-500/50 pb-2 inline-block px-8">
                  {student?.fullName || "Talabaning F.I.Sh."}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                "{settings.centerName}" o'quv markazida tashkil etilgan <br />
                <strong className="text-slate-900 text-base">{course?.title || "Kurs nomi"}</strong> bo'yicha o'quv dasturini to'liq va muvaffaqiyatli tamomladi.
              </p>

              <div className="mt-4 inline-block px-4 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
                O'zlashtirish darajasi: {grade}
              </div>

              {/* Signatures */}
              <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-3 items-center text-xs text-slate-600">
                <div className="text-left">
                  <p className="font-bold text-slate-900">{teacher?.fullName || "O'qituvchi"}</p>
                  <p className="text-[10px] text-slate-400">O'qituvchi</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-amber-600 flex items-center justify-center text-amber-700 font-serif font-bold text-[9px] uppercase tracking-tighter text-center">
                    MEIER<br />EDU
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">№ {certificateNo}</span>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">{settings.directorName || "Rahbar"}</p>
                  <p className="text-[10px] text-slate-400">Markaz Rahbari</p>
                  <p className="text-[10px] text-slate-400">{formatDate(completionDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
