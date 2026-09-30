import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Teacher,
  Course,
  Room,
  Group,
  Student,
  AttendanceRecord,
  Payment,
  TeacherPayout,
  Lead,
  Expense,
  CenterSettings,
  ActiveTab,
} from '../types';
import { getCurrentMonthString, getTodayDateString, getRandomColor, UZ_MONTH_NAMES } from '../utils/formatters';

export interface MonthlyStatusItem {
  monthKey: string; // "2026-09"
  monthNum: string; // "09"
  monthName: string; // "Sentyabr"
  expected: number;
  paid: number;
  debt: number;
  status: 'paid' | 'partial' | 'unpaid' | 'not_enrolled';
  payments: Payment[];
}

export interface StudentMonthlyReport {
  student: Student;
  totalExpectedYear: number;
  totalPaidYear: number;
  totalDebtYear: number;
  unpaidMonthsCount: number;
  months: MonthlyStatusItem[];
}

interface DataContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Settings
  settings: CenterSettings;
  updateSettings: (newSettings: Partial<CenterSettings>) => void;

  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Courses
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Rooms
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // Groups
  groups: Group[];
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  setAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  bulkSetAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  // Payments
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  deletePayment: (id: string) => void;

  // Teacher Payouts
  teacherPayouts: TeacherPayout[];
  addTeacherPayout: (payout: Omit<TeacherPayout, 'id'>) => void;
  deleteTeacherPayout: (id: string) => void;

  // Leads (Yangi murojaatlar)
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  // Expenses (Markaz xarajatlari)
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Calculations & Helpers
  getTeacherCalculations: (teacherId: string, period?: string) => {
    studentCount: number;
    groupsCount: number;
    grossCourseFees: number;
    earnedSalary: number;
    paidAmount: number;
    remainingBalance: number;
  };
  getStudentBalance: (studentId: string, period?: string) => {
    totalExpected: number;
    totalPaid: number;
    debt: number;
    isPaid: boolean;
  };
  getStudentMonthlyReport: (studentId: string, year?: number) => StudentMonthlyReport;
  getAllStudentsMonthlyReports: (year?: number) => StudentMonthlyReport[];

  // Backup & Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;
}

const defaultSettings: CenterSettings = {
  centerName: 'Meier Edu',
  centerPhone: '+998 (90) 123-45-67',
  centerAddress: 'O\'zbekiston, Toshkent shahri',
  directorName: 'Rahbar',
  currency: 'UZS',
  receiptFooterText: 'Meier Edu o\'quv markazini tanlaganingiz uchun tashakkur!',
  telegramBotOrChannel: '@meier_edu',
};

// Default empty arrays - User requested manual entry for teachers, students, groups, schedules and fees!
const defaultEmptyTeachers: Teacher[] = [];
const defaultEmptyCourses: Course[] = [
  {
    id: 'c-1',
    title: 'Matematika',
    subject: 'Aniq fanlar',
    monthlyPrice: 400000,
    durationMonths: 6,
    description: 'Matematika kursi',
  },
  {
    id: 'c-2',
    title: 'Ingliz tili (IELTS / General)',
    subject: 'Xorijiy tillar',
    monthlyPrice: 450000,
    durationMonths: 6,
    description: 'Ingliz tili kursi',
  },
];
const defaultEmptyRooms: Room[] = [
  { id: 'r-1', name: '1-xona', capacity: 20 },
  { id: 'r-2', name: '2-xona', capacity: 15 },
  { id: 'r-3', name: '3-xona', capacity: 25 },
];
const defaultEmptyGroups: Group[] = [];
const defaultEmptyStudents: Student[] = [];
const defaultEmptyAttendance: AttendanceRecord[] = [];
const defaultEmptyPayments: Payment[] = [];
const defaultEmptyTeacherPayouts: TeacherPayout[] = [];
const defaultEmptyLeads: Lead[] = [];
const defaultEmptyExpenses: Expense[] = [];

// New version keys (v3) to ensure Meier Edu brand name and clean slate
const STORAGE_KEYS = {
  SETTINGS: 'crm_settings_v3',
  TEACHERS: 'crm_teachers_v3',
  COURSES: 'crm_courses_v3',
  ROOMS: 'crm_rooms_v3',
  GROUPS: 'crm_groups_v3',
  STUDENTS: 'crm_students_v3',
  ATTENDANCE: 'crm_attendance_v3',
  PAYMENTS: 'crm_payments_v3',
  TEACHER_PAYOUTS: 'crm_teacher_payouts_v3',
  LEADS: 'crm_leads_v3',
  EXPENSES: 'crm_expenses_v3',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent States
  const [settings, setSettings] = useState<CenterSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return saved ? JSON.parse(saved) : defaultEmptyTeachers;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    return saved ? JSON.parse(saved) : defaultEmptyCourses;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return saved ? JSON.parse(saved) : defaultEmptyRooms;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return saved ? JSON.parse(saved) : defaultEmptyGroups;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : defaultEmptyStudents;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : defaultEmptyAttendance;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : defaultEmptyPayments;
  });

  const [teacherPayouts, setTeacherPayouts] = useState<TeacherPayout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_PAYOUTS);
    return saved ? JSON.parse(saved) : defaultEmptyTeacherPayouts;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEADS);
    return saved ? JSON.parse(saved) : defaultEmptyLeads;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : defaultEmptyExpenses;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHER_PAYOUTS, JSON.stringify(teacherPayouts));
  }, [teacherPayouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  // Actions
  const updateSettings = (newSettings: Partial<CenterSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addTeacher = (teacher: Omit<Teacher, 'id'>) => {
    const id = `t-${Date.now()}`;
    const newTeacher: Teacher = {
      ...teacher,
      id,
      avatarColor: teacher.avatarColor || getRandomColor(id),
    };
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...course, id: `c-${Date.now()}` };
    setCourses((prev) => [newCourse, ...prev]);
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addRoom = (room: Omit<Room, 'id'>) => {
    const newRoom: Room = { ...room, id: `r-${Date.now()}` };
    setRooms((prev) => [...prev, newRoom]);
  };

  const updateRoom = (id: string, updated: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const deleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const addGroup = (group: Omit<Group, 'id'>) => {
    const newGroup: Group = { ...group, id: `g-${Date.now()}` };
    setGroups((prev) => [newGroup, ...prev]);
  };

  const updateGroup = (id: string, updated: Partial<Group>) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const id = `s-${Date.now()}`;
    const newStudent: Student = {
      ...student,
      id,
      avatarColor: student.avatarColor || getRandomColor(id),
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const setAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    setAttendance((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.date === record.date && a.groupId === record.groupId && a.studentId === record.studentId
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...record };
        return copy;
      } else {
        return [...prev, { ...record, id: `att-${Date.now()}-${Math.random()}` }];
      }
    });
  };

  const bulkSetAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    setAttendance((prev) => {
      let copy = [...prev];
      records.forEach((record) => {
        const existingIndex = copy.findIndex(
          (a) => a.date === record.date && a.groupId === record.groupId && a.studentId === record.studentId
        );
        if (existingIndex >= 0) {
          copy[existingIndex] = { ...copy[existingIndex], ...record };
        } else {
          copy.push({ ...record, id: `att-${Date.now()}-${Math.random()}` });
        }
      });
      return copy;
    });
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: `p-${Date.now()}` };
    setPayments((prev) => [newPayment, ...prev]);
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const addTeacherPayout = (payout: Omit<TeacherPayout, 'id'>) => {
    const newPayout: TeacherPayout = { ...payout, id: `tp-${Date.now()}` };
    setTeacherPayouts((prev) => [newPayout, ...prev]);
  };

  const deleteTeacherPayout = (id: string) => {
    setTeacherPayouts((prev) => prev.filter((tp) => tp.id !== id));
  };

  // Leads
  const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLead = (id: string, updated: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  // Expenses
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: `exp-${Date.now()}` };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Teacher Salary & Payroll calculation
  const getTeacherCalculations = (teacherId: string, period: string = getCurrentMonthString()) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) {
      return {
        studentCount: 0,
        groupsCount: 0,
        grossCourseFees: 0,
        earnedSalary: 0,
        paidAmount: 0,
        remainingBalance: 0,
      };
    }

    // Teacher's groups
    const teacherGroups = groups.filter((g) => g.teacherId === teacherId && g.status === 'active');

    let studentCount = 0;
    let grossCourseFees = 0;
    let earnedSalary = 0;

    teacherGroups.forEach((group) => {
      const course = courses.find((c) => c.id === group.courseId);
      const groupPrice = group.monthlyPrice ?? course?.monthlyPrice ?? 0;
      const enrolledInThisGroup = students.filter(
        (s) => s.status === 'active' && s.groupIds.includes(group.id)
      );
      const groupGross = enrolledInThisGroup.reduce((sum, s) => {
        return sum + (s.customMonthlyFee !== undefined ? s.customMonthlyFee : groupPrice);
      }, 0);

      studentCount += enrolledInThisGroup.length;
      grossCourseFees += groupGross;

      if (teacher.salaryType === 'percentage') {
        const percent = group.teacherSharePercent ?? teacher.salaryValue;
        earnedSalary += Math.round((groupGross * percent) / 100);
      }
    });

    if (teacher.salaryType === 'fixed_monthly') {
      earnedSalary = teacher.salaryValue;
    } else if (teacher.salaryType === 'hourly') {
      earnedSalary = teacher.salaryValue * 24;
    }

    const paidForPeriod = teacherPayouts
      .filter((tp) => tp.teacherId === teacherId && tp.period === period)
      .reduce((sum, p) => sum + p.amount, 0);

    const remainingBalance = earnedSalary - paidForPeriod;

    return {
      studentCount,
      groupsCount: teacherGroups.length,
      grossCourseFees,
      earnedSalary,
      paidAmount: paidForPeriod,
      remainingBalance,
    };
  };

  // Student Balance for single month
  const getStudentBalance = (studentId: string, period: string = getCurrentMonthString()) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { totalExpected: 0, totalPaid: 0, debt: 0, isPaid: true };
    }

    let totalExpected = 0;
    if (student.customMonthlyFee !== undefined && student.customMonthlyFee > 0) {
      totalExpected = student.customMonthlyFee;
    } else {
      student.groupIds.forEach((gId) => {
        const group = groups.find((g) => g.id === gId);
        if (group) {
          const course = courses.find((c) => c.id === group.courseId);
          totalExpected += group.monthlyPrice || course?.monthlyPrice || 0;
        }
      });
    }

    const totalPaid = payments
      .filter((p) => p.studentId === studentId && p.monthFor === period)
      .reduce((sum, p) => sum + p.amount, 0);

    const debt = Math.max(0, totalExpected - totalPaid);
    const isPaid = totalPaid >= totalExpected && totalExpected > 0;

    return { totalExpected, totalPaid, debt, isPaid };
  };

  // Month-by-month Report for student across all 12 months of a given year
  const getStudentMonthlyReport = (studentId: string, year: number = new Date().getFullYear()): StudentMonthlyReport => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return {
        student: { id: studentId, fullName: 'Noma\'lum', phone: '', groupIds: [], enrollmentDate: '', status: 'active' },
        totalExpectedYear: 0,
        totalPaidYear: 0,
        totalDebtYear: 0,
        unpaidMonthsCount: 0,
        months: [],
      };
    }

    // Monthly expected fee
    let monthlyExpected = 0;
    if (student.customMonthlyFee !== undefined && student.customMonthlyFee > 0) {
      monthlyExpected = student.customMonthlyFee;
    } else {
      student.groupIds.forEach((gId) => {
        const group = groups.find((g) => g.id === gId);
        if (group) {
          const course = courses.find((c) => c.id === group.courseId);
          monthlyExpected += group.monthlyPrice || course?.monthlyPrice || 0;
        }
      });
    }

    const studentEnrollmentMonth = student.enrollmentDate ? student.enrollmentDate.substring(0, 7) : '';
    const currentMonthKey = getCurrentMonthString();

    let totalExpectedYear = 0;
    let totalPaidYear = 0;
    let totalDebtYear = 0;
    let unpaidMonthsCount = 0;

    const monthNums = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthsList: MonthlyStatusItem[] = monthNums.map((mNum) => {
      const monthKey = `${year}-${mNum}`;
      const monthName = UZ_MONTH_NAMES[mNum] || mNum;

      // Check if student was enrolled during or before this month
      const isEnrolled = !studentEnrollmentMonth || monthKey >= studentEnrollmentMonth;

      const expected = isEnrolled && monthlyExpected > 0 ? monthlyExpected : 0;
      const studentPaymentsForMonth = payments.filter(
        (p) => p.studentId === studentId && p.monthFor === monthKey
      );
      const paid = studentPaymentsForMonth.reduce((sum, p) => sum + p.amount, 0);
      const debt = Math.max(0, expected - paid);

      let status: 'paid' | 'partial' | 'unpaid' | 'not_enrolled' = 'not_enrolled';
      if (!isEnrolled) {
        status = 'not_enrolled';
      } else if (expected === 0 && paid === 0) {
        status = 'not_enrolled';
      } else if (paid >= expected && expected > 0) {
        status = 'paid';
      } else if (paid > 0 && paid < expected) {
        status = 'partial';
        unpaidMonthsCount++;
      } else if (debt > 0) {
        status = 'unpaid';
        // Only count as unpaid debt if up to current or past month
        if (monthKey <= currentMonthKey) {
          unpaidMonthsCount++;
        }
      }

      totalExpectedYear += expected;
      totalPaidYear += paid;
      totalDebtYear += debt;

      return {
        monthKey,
        monthNum: mNum,
        monthName,
        expected,
        paid,
        debt,
        status,
        payments: studentPaymentsForMonth,
      };
    });

    return {
      student,
      totalExpectedYear,
      totalPaidYear,
      totalDebtYear,
      unpaidMonthsCount,
      months: monthsList,
    };
  };

  const getAllStudentsMonthlyReports = (year: number = new Date().getFullYear()): StudentMonthlyReport[] => {
    return students
      .filter((s) => s.status === 'active')
      .map((s) => getStudentMonthlyReport(s.id, year));
  };

  // Reset to initial demo data
  const resetToDemoData = () => {
    // Re-seed minimal starter template if user clicks demo
    setTeachers([]);
    setStudents([]);
    setGroups([]);
    setPayments([]);
    setTeacherPayouts([]);
    setAttendance([]);
  };

  // Clear all data
  const clearAllData = () => {
    setTeachers([]);
    setCourses([]);
    setRooms([]);
    setGroups([]);
    setStudents([]);
    setAttendance([]);
    setPayments([]);
    setTeacherPayouts([]);
  };

  // Export full JSON
  const exportDatabaseJson = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      settings,
      teachers,
      courses,
      rooms,
      groups,
      students,
      attendance,
      payments,
      teacherPayouts,
    };
    return JSON.stringify(backup, null, 2);
  };

  // Import JSON
  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.teachers)) setTeachers(data.teachers);
      if (Array.isArray(data.courses)) setCourses(data.courses);
      if (Array.isArray(data.rooms)) setRooms(data.rooms);
      if (Array.isArray(data.groups)) setGroups(data.groups);
      if (Array.isArray(data.students)) setStudents(data.students);
      if (Array.isArray(data.attendance)) setAttendance(data.attendance);
      if (Array.isArray(data.payments)) setPayments(data.payments);
      if (Array.isArray(data.teacherPayouts)) setTeacherPayouts(data.teacherPayouts);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        settings,
        updateSettings,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
        groups,
        addGroup,
        updateGroup,
        deleteGroup,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        attendance,
        setAttendanceRecord,
        bulkSetAttendance,
        payments,
        addPayment,
        deletePayment,
        teacherPayouts,
        addTeacherPayout,
        deleteTeacherPayout,
        leads,
        addLead,
        updateLead,
        deleteLead,
        expenses,
        addExpense,
        deleteExpense,
        getTeacherCalculations,
        getStudentBalance,
        getStudentMonthlyReport,
        getAllStudentsMonthlyReports,
        resetToDemoData,
        clearAllData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
