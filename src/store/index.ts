// ─── Meridian – Global State (Zustand) ───────────────────────────────────────
import { create } from 'zustand';
import type {
  Employee, PayrollRun, PayrollException, Notification,
  DemoUser, PayrollActivity, LeaveRequest, UserRole,
} from '../types';
import {
  employees as demoEmployees,
  payrollRuns as demoPayrollRuns,
  payrollExceptions as demoExceptions,
  payrollActivities as demoActivities,
  leaveRequests as demoLeaveRequests,
  departments as demoDepartments,
  demoUsers,
  salaryStructures,
  readinessItems as demoReadiness,
  announcements as demoAnnouncements,
  leaveBalances as demoLeaveBalances,
  attendanceSummaries as demoAttendance,
} from '../data';
import type { Department, ReadinessItem, Announcement, LeaveBalance, AttendanceSummary } from '../types';
import { generateId } from '../utils/format';

interface AppState {
  // Auth
  currentUser: DemoUser | null;
  userRole: UserRole;
  login: (user: DemoUser) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Employees
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  getEmployee: (id: string) => Employee | undefined;

  // Departments
  departments: Department[];

  // Payroll
  payrollRuns: PayrollRun[];
  currentPayrollMonth: number;
  currentPayrollYear: number;
  setPayrollMonth: (month: number, year: number) => void;
  updatePayrollRun: (id: string, updates: Partial<PayrollRun>) => void;
  approvePayroll: (runId: string) => void;
  processPayroll: (runId: string) => void;

  // Exceptions
  payrollExceptions: PayrollException[];
  resolveException: (id: string) => void;

  // Activities
  activities: PayrollActivity[];
  addActivity: (activity: Omit<PayrollActivity, 'id'>) => void;

  // Leave
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;

  // Attendance
  attendanceSummaries: AttendanceSummary[];

  // Readiness
  readinessItems: ReadinessItem[];

  // Announcements
  announcements: Announcement[];

  // Salary structures
  salaryStructures: Record<string, import('../types').SalaryStructure>;

  // Notifications (toasts)
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;

  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Demo reset
  resetDemo: () => void;
}

const initialState = {
  currentUser: demoUsers[0],
  userRole: 'hr_admin' as UserRole,
  employees: [...demoEmployees],
  departments: [...demoDepartments],
  payrollRuns: [...demoPayrollRuns],
  currentPayrollMonth: 10,
  currentPayrollYear: 2026,
  payrollExceptions: [...demoExceptions],
  activities: [...demoActivities],
  leaveRequests: [...demoLeaveRequests],
  leaveBalances: [...demoLeaveBalances],
  attendanceSummaries: [...demoAttendance],
  readinessItems: [...demoReadiness],
  announcements: [...demoAnnouncements],
  salaryStructures: { ...salaryStructures },
  notifications: [] as Notification[],
  sidebarCollapsed: false,
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  login: (user) => set({ currentUser: user, userRole: user.role }),
  logout: () => set({ currentUser: null }),
  switchRole: (role) => {
    const user = role === 'hr_admin' ? demoUsers[0] : demoUsers[1];
    set({ currentUser: user, userRole: role });
  },

  addEmployee: (employee) => set((state) => ({
    employees: [...state.employees, employee],
  })),

  updateEmployee: (id, updates) => set((state) => ({
    employees: state.employees.map(e =>
      e.id === id ? { ...e, ...updates } : e
    ),
  })),

  getEmployee: (id) => get().employees.find(e => e.id === id),

  setPayrollMonth: (month, year) => set({
    currentPayrollMonth: month,
    currentPayrollYear: year,
  }),

  updatePayrollRun: (id, updates) => set((state) => ({
    payrollRuns: state.payrollRuns.map(r =>
      r.id === id ? { ...r, ...updates } : r
    ),
  })),

  approvePayroll: (runId) => {
    const user = get().currentUser;
    set((state) => ({
      payrollRuns: state.payrollRuns.map(r =>
        r.id === runId ? {
          ...r,
          status: 'approved',
          stage: 'approval',
          approvedBy: user?.name,
          approvedAt: new Date().toISOString(),
        } : r
      ),
    }));
    get().addActivity({
      type: 'payroll_approved',
      description: `Payroll approved by ${user?.name}`,
      timestamp: new Date().toISOString(),
      user: user?.name ?? 'System',
    });
    get().addNotification({
      type: 'success',
      title: 'Payroll Approved',
      message: 'Payroll has been approved and is ready for processing.',
    });
  },

  processPayroll: (runId) => {
    set((state) => ({
      payrollRuns: state.payrollRuns.map(r =>
        r.id === runId ? {
          ...r,
          status: 'processed',
          stage: 'processed',
          processedAt: new Date().toISOString(),
          readinessScore: 100,
          items: r.items.map(i => ({ ...i, status: 'approved' as const, hasException: false })),
        } : r
      ),
    }));
    get().addActivity({
      type: 'payroll_processed',
      description: `Payroll processed successfully`,
      timestamp: new Date().toISOString(),
      user: get().currentUser?.name ?? 'System',
    });
    get().addNotification({
      type: 'success',
      title: 'Payroll Processed',
      message: 'All salaries have been processed successfully.',
    });
  },

  resolveException: (id) => set((state) => ({
    payrollExceptions: state.payrollExceptions.map(e =>
      e.id === id ? { ...e, resolved: true, resolvedAt: new Date().toISOString() } : e
    ),
  })),

  addActivity: (activity) => set((state) => ({
    activities: [{ ...activity, id: generateId() }, ...state.activities],
  })),

  addLeaveRequest: (req) => {
    const newReq: LeaveRequest = {
      ...req,
      id: generateId(),
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    set((state) => ({
      leaveRequests: [newReq, ...state.leaveRequests],
    }));
    get().addActivity({
      type: 'leave_approved',
      description: `Leave request submitted by ${get().currentUser?.name || 'Employee'} (${req.days} days)`,
      timestamp: new Date().toISOString(),
      user: get().currentUser?.name ?? 'Employee',
    });
  },

  approveLeave: (id) => set((state) => ({
    leaveRequests: state.leaveRequests.map(l =>
      l.id === id ? { ...l, status: 'approved', approvedBy: state.currentUser?.name } : l
    ),
  })),

  rejectLeave: (id) => set((state) => ({
    leaveRequests: state.leaveRequests.map(l =>
      l.id === id ? { ...l, status: 'rejected' } : l
    ),
  })),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: generateId() }],
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),

  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed,
  })),

  resetDemo: () => {
    set({
      ...initialState,
      notifications: [{
        id: generateId(),
        type: 'success',
        title: 'Demo Reset',
        message: 'All data has been restored to its initial state.',
      }],
    });
  },
}));

