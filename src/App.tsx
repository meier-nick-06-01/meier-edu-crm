/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScheduleView } from './components/ScheduleView';
import { TeachersView } from './components/TeachersView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { PaymentsView } from './components/PaymentsView';
import { MonthlyUnpaidView } from './components/MonthlyUnpaidView';
import { TeacherPayoutsView } from './components/TeacherPayoutsView';
import { LeadsView } from './components/LeadsView';
import { ExpensesView } from './components/ExpensesView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminPanelView } from './components/AdminPanelView';
import { AiAssistantView } from './components/AiAssistantView';
import { CertificatesView } from './components/CertificatesView';
import { PaymentModal } from './components/PaymentModal';
import { StudentModal } from './components/StudentModal';
import { TeacherPayoutModal } from './components/TeacherPayoutModal';
import { Student } from './types';

// Clean out previous v1 demo data if present so user gets 100% clean start
try {
  ['crm_teachers_v1', 'crm_students_v1', 'crm_groups_v1', 'crm_payments_v1', 'crm_teacher_payouts_v1', 'crm_attendance_v1'].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch {}

const MainAppContent: React.FC = () => {
  const { activeTab } = useData();

  // Global Modals State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPreselectedStudentId, setPaymentPreselectedStudentId] = useState<string | undefined>();
  const [paymentPreselectedGroupId, setPaymentPreselectedGroupId] = useState<string | undefined>();
  const [paymentPreselectedMonthFor, setPaymentPreselectedMonthFor] = useState<string | undefined>();

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isTeacherPayoutModalOpen, setIsTeacherPayoutModalOpen] = useState(false);
  const [payoutPreselectedTeacherId, setPayoutPreselectedTeacherId] = useState<string | undefined>();

  // Open Payment Modal Handler
  const handleOpenPaymentModal = (studentId?: string, groupId?: string, monthFor?: string) => {
    setPaymentPreselectedStudentId(studentId);
    setPaymentPreselectedGroupId(groupId);
    setPaymentPreselectedMonthFor(monthFor);
    setIsPaymentModalOpen(true);
  };

  // Open Student Modal Handler
  const handleOpenStudentModal = (student?: Student) => {
    setStudentToEdit(student || null);
    setIsStudentModalOpen(true);
  };

  // Open Teacher Payout Modal Handler
  const handleOpenTeacherPayoutModal = (teacherId?: string) => {
    setPayoutPreselectedTeacherId(teacherId);
    setIsTeacherPayoutModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          onOpenPaymentModal={() => handleOpenPaymentModal()}
          onOpenStudentModal={() => handleOpenStudentModal()}
        />

        {/* Scrollable Tab Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenTeacherPayoutModal={handleOpenTeacherPayoutModal}
            />
          )}

          {activeTab === 'schedule' && <ScheduleView />}

          {activeTab === 'teachers' && (
            <TeachersView onOpenPayoutModal={handleOpenTeacherPayoutModal} />
          )}

          {activeTab === 'students' && (
            <StudentsView
              onOpenStudentModal={handleOpenStudentModal}
              onOpenPaymentModal={handleOpenPaymentModal}
            />
          )}

          {activeTab === 'attendance' && <AttendanceView />}

          {activeTab === 'payments' && (
            <PaymentsView onOpenPaymentModal={() => handleOpenPaymentModal()} />
          )}

          {activeTab === 'monthly_unpaid' && (
            <MonthlyUnpaidView onOpenPaymentModal={handleOpenPaymentModal} />
          )}

          {activeTab === 'teacher_payouts' && (
            <TeacherPayoutsView onOpenPayoutModal={handleOpenTeacherPayoutModal} />
          )}

          {activeTab === 'ai_assistant' && <AiAssistantView />}

          {activeTab === 'certificates' && <CertificatesView />}

          {activeTab === 'leads' && <LeadsView />}

          {activeTab === 'expenses' && <ExpensesView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'admin_panel' && <AdminPanelView />}
        </main>
      </div>

      {/* Global Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        preselectedStudentId={paymentPreselectedStudentId}
        preselectedGroupId={paymentPreselectedGroupId}
        preselectedMonthFor={paymentPreselectedMonthFor}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        studentToEdit={studentToEdit}
      />

      <TeacherPayoutModal
        isOpen={isTeacherPayoutModalOpen}
        onClose={() => setIsTeacherPayoutModalOpen(false)}
        preselectedTeacherId={payoutPreselectedTeacherId}
      />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainAppContent />
    </DataProvider>
  );
}
