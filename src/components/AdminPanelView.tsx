import React, { useState } from 'react';
import { 
  Settings, 
  BookOpen, 
  DoorClosed, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Edit, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Course, Room } from '../types';
import { formatCurrency } from '../utils/formatters';

export const AdminPanelView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    courses, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    rooms, 
    addRoom, 
    updateRoom, 
    deleteRoom, 
    exportDatabaseJson, 
    importDatabaseJson, 
    resetToDemoData, 
    clearAllData 
  } = useData();

  // Settings local state
  const [centerName, setCenterName] = useState(settings.centerName);
  const [centerPhone, setCenterPhone] = useState(settings.centerPhone);
  const [centerAddress, setCenterAddress] = useState(settings.centerAddress);
  const [directorName, setDirectorName] = useState(settings.directorName);
  const [receiptFooterText, setReceiptFooterText] = useState(settings.receiptFooterText);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // New Course Modal / Inline Form
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('');
  const [courseMonthlyPrice, setCourseMonthlyPrice] = useState(450000);
  const [courseDuration, setCourseDuration] = useState(6);

  // New Room Modal / Inline Form
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(20);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      centerName,
      centerPhone,
      centerAddress,
      directorName,
      receiptFooterText,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;
    addCourse({
      title: courseTitle.trim(),
      subject: courseSubject.trim() || 'Umumiy',
      monthlyPrice: Number(courseMonthlyPrice),
      durationMonths: Number(courseDuration),
    });
    setCourseTitle('');
    setCourseSubject('');
    setIsAddCourseOpen(false);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    addRoom({
      name: roomName.trim(),
      capacity: Number(roomCapacity),
    });
    setRoomName('');
    setIsAddRoomOpen(false);
  };

  // Export JSON backup file
  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduCenter_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJson(content);
      if (success) {
        alert('Ma\'lumotlar bazasi muvaffaqiyatli tiklandi!');
      } else {
        alert('Fayl formati noto\'g\'ri yoki fayl buzilgan.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Admin Panel & Ma'lumotlar Bazasi
        </h1>
        <p className="text-xs text-slate-500">
          Markaz profili, kurslar, xonalar va ma'lumotlar bazasini to'liq boshqarish
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Center Profile & Courses & Rooms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Center Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Markaz Rekvizitlari</h3>
                  <p className="text-xs text-slate-500">Chek va hujjatlarda ko'rsatiladigan ma'lumotlar</p>
                </div>
              </div>

              {settingsSaved && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saqlandi</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Markaz Nomi
                  </label>
                  <input
                    type="text"
                    required
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Aloqa Telefoni
                  </label>
                  <input
                    type="text"
                    required
                    value={centerPhone}
                    onChange={(e) => setCenterPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Direktor F.I.Sh
                  </label>
                  <input
                    type="text"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Markaz Manzili
                  </label>
                  <input
                    type="text"
                    value={centerAddress}
                    onChange={(e) => setCenterAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chek / Kvitansiya tagidagi minnatdorchilik matni
                </label>
                <input
                  type="text"
                  value={receiptFooterText}
                  onChange={(e) => setReceiptFooterText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Sozlamalarni Saqlash</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Courses Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Kurslar va Ta'lim Yo'nalishlari</h3>
                  <p className="text-xs text-slate-500">Narxlar va o'qish muddatlari</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddCourseOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Yangi Kurs</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {courses.map((course) => (
                <div key={course.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{course.title}</h4>
                    <p className="text-xs text-slate-500">
                      Yo'nalish: <strong className="text-slate-700">{course.subject}</strong> • Davomiyligi: {course.durationMonths} oy
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-600 text-sm">
                      {formatCurrency(course.monthlyPrice)} / oy
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`"${course.title}" kursini o'chirishni tasdiqlaysizmi?`)) {
                          deleteCourse(course.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Course Inline Form */}
            {isAddCourseOpen && (
              <form onSubmit={handleAddCourse} className="mt-4 p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-indigo-900 uppercase block">Yangi Kurs Qo'shish</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Kurs nomi (masalan: Rus tili so'zlashuv)"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-medium focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Fani (masalan: Rus tili)"
                    value={courseSubject}
                    onChange={(e) => setCourseSubject(e.target.value)}
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="10000"
                    placeholder="Oylik narx (so'm)"
                    value={courseMonthlyPrice}
                    onChange={(e) => setCourseMonthlyPrice(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Davomiyligi (oy)"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCourseOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 3: Rooms Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <DoorClosed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Dars Xonalari</h3>
                  <p className="text-xs text-slate-500">Auditoriyalar va ularning sig'imi</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddRoomOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Yangi Xona</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{room.name}</span>
                    <span className="text-[11px] text-slate-500">Sig'imi: {room.capacity} kishi</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`"${room.name}" xonasini o'chirishni tasdiqlaysizmi?`)) {
                        deleteRoom(room.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Room Inline Form */}
            {isAddRoomOpen && (
              <form onSubmit={handleAddRoom} className="mt-4 p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-purple-900 uppercase block">Yangi Xona Qo'shish</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Xona nomi (masalan: 301-Lab)"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-medium focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Sig'imi (kishi)"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRoomOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right 1 Col: Database Backup, Restore & Reset */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Ma'lumotlar Bazasi</h3>
                <p className="text-xs text-slate-500">Zaxira nusxa va tiklash (Backup)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Barcha o'qituvchilar, guruhlar, talabalar, davomat yozuvlari va to'lovlar brauzer xotirasida xavfsiz saqlanadi. Ma'lumotlarni yo'qotmaslik uchun zaxira nusxasini kompyuteringizga yuklab olishingiz mumkin.
            </p>

            {/* Export JSON Backup */}
            <div>
              <button
                onClick={handleDownloadBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Zaxira Nusxani Yuklab Olish (JSON)</span>
              </button>
              <span className="text-[10px] text-slate-400 block mt-1 text-center">
                To'liq CRM bazasi JSON fayl shaklida saqlanadi
              </span>
            </div>

            {/* Import JSON Backup */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Zaxira Fayldan Qayta Tiklash:
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 border-dashed cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>JSON Faylni Tanlash</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset to Demo Data */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Dastlabki Holatga Qaytish:</span>
              
              <button
                onClick={() => {
                  if (confirm('Barcha ma\'lumotlarni dastlabki namunaviy o\'zbekcha namunalar bilan qayta yuklashni tasdiqlaysizmi?')) {
                    resetToDemoData();
                    alert('Namunaviy ma\'lumotlar qayta tiklandi!');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Namuna Ma'lumotlarni Qayta Yuklash</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('DIQQAT! Barcha ma\'lumotlar butunlay o\'chiriladi. Rozimisiz?')) {
                    clearAllData();
                    alert('Ma\'lumotlar tozalandi.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Baza Ma'lumotlarini Tozalash</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
