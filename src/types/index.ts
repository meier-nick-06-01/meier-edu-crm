export type SalaryType = 'percentage' | 'fixed_monthly' | 'hourly';

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  subject: string;
  salaryType: SalaryType;
  salaryValue: number; // e.g. 50 (for 50%), or 3500000 (fixed sum per month), or 60000 (per lesson hour)
  status: 'active' | 'inactive';
  hireDate: string;
  notes?: string;
  avatarColor?: string;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  monthlyPrice: number;
  durationMonths: number;
  description?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface Group {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  roomId: string;
  daysSchedule: string; // e.g. "Dushanba, Chorshanba, Juma" or custom
  selectedDays?: string[]; // e.g. ['Dush', 'Chor', 'Jum']
  startTime: string; // e.g. "14:00"
  endTime: string; // e.g. "15:30"
  status: 'active' | 'completed' | 'upcoming';
  monthlyPrice?: number; // overrides course price if set
  teacherSharePercent?: number; // e.g. 50 for 50%
  startDate?: string;
}

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  groupIds: string[]; // groups enrolled
  enrollmentDate: string;
  status: 'active' | 'frozen' | 'left';
  customMonthlyFee?: number; // custom student fee if specified
  notes?: string;
  avatarColor?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  groupId: string;
  studentId: string;
  status: AttendanceStatus;
  comment?: string;
}

export type PaymentMethod = 'cash' | 'card_click_payme' | 'bank_transfer';

export interface Payment {
  id: string;
  studentId: string;
  groupId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  monthFor: string; // e.g. "2026-09"
  method: PaymentMethod;
  receiptNo: string;
  notes?: string;
}

export type TeacherPayoutType = 'salary' | 'advance' | 'bonus';

export interface TeacherPayout {
  id: string;
  teacherId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  period: string; // e.g. "2026-09"
  payoutType: TeacherPayoutType;
  method: PaymentMethod;
  notes?: string;
}

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  courseInterest: string;
  status: 'new' | 'trial_scheduled' | 'enrolled' | 'cancelled';
  trialDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'rent' | 'marketing' | 'utilities' | 'supplies' | 'other';
  amount: number;
  date: string;
  monthFor: string;
  notes?: string;
}

export interface CenterSettings {
  centerName: string;
  centerPhone: string;
  centerAddress: string;
  directorName: string;
  currency: string;
  receiptFooterText: string;
  telegramBotOrChannel?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'schedule'
  | 'teachers'
  | 'students'
  | 'attendance'
  | 'payments'
  | 'monthly_unpaid'
  | 'teacher_payouts'
  | 'ai_assistant'
  | 'certificates'
  | 'leads'
  | 'expenses'
  | 'analytics'
  | 'admin_panel';
