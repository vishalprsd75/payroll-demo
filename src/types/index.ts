// ─── Meridian Payroll – Core Types ────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated' | 'probation';
export type PayrollStatus = 'draft' | 'processing' | 'review' | 'approved' | 'processed' | 'paid';
export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type LeaveType = 'casual' | 'sick' | 'earned' | 'unpaid' | 'maternity' | 'paternity' | 'compensatory';
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave' | 'holiday' | 'weekend' | 'work_from_home';
export type PayrollStage = 'attendance_review' | 'calculation' | 'hr_review' | 'approval' | 'processed';
export type UserRole = 'hr_admin' | 'employee' | 'finance' | 'manager';

export interface Department {
  id: string;
  name: string;
  headId?: string;
  employeeCount: number;
  color: string;
}

export interface Designation {
  id: string;
  title: string;
  level: number;
  departmentId: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  category: 'basic' | 'hra' | 'conveyance' | 'special' | 'bonus' | 'overtime' | 'other_earning' | 'pf' | 'professional_tax' | 'tds' | 'esi' | 'other_deduction';
  calculationType: 'fixed' | 'percentage_of_basic' | 'percentage_of_gross';
  value: number; // amount or percentage
  isStatutory: boolean;
  isConfigurable: boolean;
  description?: string;
}

export interface SalaryStructure {
  id: string;
  name: string;
  components: SalaryComponent[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  annualCTC: number;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface TaxInfo {
  panNumber: string;
  uanNumber?: string;
  esiNumber?: string;
  taxRegime: 'old' | 'new';
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  pincode: string;
  departmentId: string;
  designationId: string;
  designation: string;
  department: string;
  managerId?: string;
  joiningDate: string;
  status: EmployeeStatus;
  avatar?: string;
  bankDetails?: BankDetails;
  taxInfo?: TaxInfo;
  salaryStructureId?: string;
  salaryStructure?: SalaryStructure;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  remarks?: string;
}

export interface AttendanceSummary {
  employeeId: string;
  month: string;
  year: number;
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  holidays: number;
  weekends: number;
  wfhDays: number;
  lossOfPayDays: number;
}

export interface LeaveBalance {
  employeeId: string;
  leaveType: LeaveType;
  total: number;
  used: number;
  remaining: number;
  carryForward: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  approvedBy?: string;
}

export interface PayrollRun {
  id: string;
  month: number; // 1-12
  year: number;
  status: PayrollStatus;
  stage: PayrollStage;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  exceptionsCount: number;
  readinessScore: number;
  createdAt: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  items: PayrollItem[];
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  otherEarnings: number;
  bonus: number;
  overtime: number;
  grossSalary: number;
  pfDeduction: number;
  professionalTax: number;
  tds: number;
  esiDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  lossOfPayDays: number;
  lopDeduction: number;
  workingDays: number;
  presentDays: number;
  status: 'calculated' | 'adjusted' | 'exception' | 'approved' | 'on_hold';
  hasException: boolean;
  exceptionNote?: string;
}

export interface PayrollException {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  type: 'missing_bank_details' | 'missing_salary_structure' | 'incomplete_attendance' | 'pending_salary_revision' | 'new_joinee' | 'salary_on_hold' | 'tax_declaration_pending' | 'negative_net' | 'manual_adjustment';
  severity: ExceptionSeverity;
  description: string;
  recommendation: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  payrollRunId: string;
  month: number;
  year: number;
  employee: {
    name: string;
    employeeId: string;
    designation: string;
    department: string;
    dateOfJoining: string;
    bankName: string;
    accountNumber: string;
    panNumber: string;
    uanNumber: string;
  };
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paidDays: number;
  lopDays: number;
  totalDays: number;
  paymentStatus: 'pending' | 'paid';
  paymentDate?: string;
  paymentMode?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
}

export interface ReadinessItem {
  category: string;
  label: string;
  description: string;
  count: number;
  employees: { id: string; name: string; issue: string }[];
  icon: string;
  severity: ExceptionSeverity;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  avatar?: string;
}

export interface PayrollActivity {
  id: string;
  type: 'payroll_processed' | 'employee_added' | 'salary_revised' | 'exception_resolved' | 'payroll_approved' | 'leave_approved';
  description: string;
  timestamp: string;
  user: string;
  metadata?: Record<string, string>;
}

export interface MonthlyPayrollSummary {
  month: number;
  year: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  employeeCount: number;
  status: PayrollStatus;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

