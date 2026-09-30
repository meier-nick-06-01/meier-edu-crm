import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle2, Building, User, Calendar, CreditCard, FileText } from 'lucide-react';
import { Payment, Student, Group, Course, Teacher } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate, formatMonthPeriod, PAYMENT_METHODS } from '../utils/formatters';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const { students, groups, courses, teachers, settings } = useData();
  const printRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const student = students.find((s) => s.id === payment.studentId);
  const group = groups.find((g) => g.id === payment.groupId);
  const course = courses.find((c) => c.id === group?.courseId);
  const teacher = teachers.find((t) => t.id === group?.teacherId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Actions */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>To'lov Cheki / Kvitansiya</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div ref={printRef} className="p-6 text-slate-800 receipt-print-area">
          {/* Receipt Brand */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg mb-2 shadow-sm">
              E
            </div>
            <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-wide">
              {settings.centerName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{settings.centerAddress}</p>
            <p className="text-xs text-slate-500">Tel: {settings.centerPhone}</p>
          </div>

          {/* Receipt Title & Number */}
          <div className="py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Kvitansiya Raqami
              </span>
              <span className="text-base font-mono font-bold text-slate-900">{payment.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Sana & Vaqt
              </span>
              <span className="text-xs font-semibold text-slate-700">{formatDate(payment.date)}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="py-4 space-y-2.5 text-xs border-b border-dashed border-slate-300">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Talaba F.I.Sh:</span>
              <span className="font-bold text-slate-900 text-right">{student?.fullName || 'Noma\'lum'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Telefon:</span>
              <span className="font-medium text-slate-800">{student?.phone || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Guruh / Kurs:</span>
              <span className="font-semibold text-slate-900 text-right">
                {group?.name || 'Guruh'} ({course?.title || 'Kurs'})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">O'qituvchi:</span>
              <span className="font-medium text-slate-800">{teacher?.fullName || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Qaysi oy uchun:</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {formatMonthPeriod(payment.monthFor)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">To'lov turi:</span>
              <span className="font-semibold text-slate-800">
                {PAYMENT_METHODS[payment.method] || payment.method}
              </span>
            </div>
            {payment.notes && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Izoh:</span>
                <span className="font-medium text-slate-600 text-right italic">{payment.notes}</span>
              </div>
            )}
          </div>

          {/* Amount Paid Highlight */}
          <div className="my-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800 block">
                To'langan Summa
              </span>
              <span className="text-2xl font-black text-emerald-700">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-100/80 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>To'landi</span>
            </div>
          </div>

          {/* Stamp simulation & Signatures */}
          <div className="pt-2 pb-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              <div className="font-medium text-slate-700">Qabul qiluvchi:</div>
              <div className="text-[11px] text-slate-400 mt-1">Administrator / Kassa</div>
              <div className="mt-3 border-b border-slate-300 w-28"></div>
            </div>

            {/* Stamp Circle */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-400 flex flex-col items-center justify-center text-center p-1 text-[9px] text-blue-700 rotate-[-12deg] select-none font-bold">
              <span>{settings.centerName}</span>
              <span className="text-[8px] font-normal text-blue-500">MUHR / CHECK</span>
              <span className="text-[8px] text-emerald-600">TASDIQLANGAN</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-center text-slate-400 pt-3 border-t border-slate-200">
            {settings.receiptFooterText}
          </p>
        </div>
      </div>
    </div>
  );
};
