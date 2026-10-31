import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase,
  IndianRupee, Clock, FileText, CheckCircle2,
  Building, User, Edit3, Save, X, Download, Lock
} from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, formatDate, getInitials, getStatusColor, cn } from '../utils/format';

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    employees,
    updateEmployee,
    attendanceSummaries,
    payrollRuns,
    addNotification,
    userRole,
    currentUser,
    switchRole,
  } = useStore();

  const employee = employees.find(e => e.id === id);
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'compensation' | 'attendance' | 'payroll' | 'documents'>('personal');
  const [isEditing, setIsEditing] = useState(false);

  // RBAC Permission Boundary
  const isOwnProfile = employee?.id === (currentUser?.employeeId || 'emp-2');
  const canViewFinancials = userRole === 'hr_admin' || isOwnProfile;

  // Form state for inline editing personal info
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    dateOfBirth: employee?.dateOfBirth || '',
    gender: employee?.gender || 'male',
    address: employee?.address || '',
    city: employee?.city || '',
    state: employee?.state || '',
    pincode: employee?.pincode || '',
  });

  if (!employee) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20">
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Employee Not Found</h2>
        <p className="text-sm text-stone-500 mb-6">The employee you are looking for does not exist or has been removed.</p>
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 px-4 py-2 bg-meridian-600 text-white rounded-lg text-sm font-medium hover:bg-meridian-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>
    );
  }

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(employee.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as 'male' | 'female' | 'other',
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
    });
    setIsEditing(false);
    addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Employee personal details saved successfully.',
    });
  };

  // Current month attendance summary
  const currentAttendance = attendanceSummaries.find(
    a => a.employeeId === employee.id && a.month === '2026-10'
  ) || {
    workingDays: 22,
    presentDays: 21,
    absentDays: 0,
    halfDays: 0,
    leaveDays: 1,
    wfhDays: 4,
    lossOfPayDays: 0
  };

  // Past payroll history for this employee
  const employeePayrollHistory = payrollRuns
    .map(run => {
      const item = run.items.find(i => i.employeeId === employee.id);
      return item ? { run, item } : null;
    })
    .filter(Boolean) as { run: typeof payrollRuns[0]; item: typeof payrollRuns[0]['items'][0] }[];

  const ss = employee.salaryStructure;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <span className="text-xs font-mono text-stone-400">ID: {employee.employeeId}</span>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-meridian-100 text-meridian-800 flex items-center justify-center text-xl font-bold border border-meridian-200 flex-shrink-0">
            {getInitials(`${employee.firstName} ${employee.lastName}`)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', getStatusColor(employee.status))}>
                {employee.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-stone-800">{employee.designation}</span>
              <span className="text-stone-300">•</span>
              <span className="text-meridian-700 bg-meridian-50 px-2 py-0.5 rounded text-xs font-medium">{employee.department}</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-400">Joined {formatDate(employee.joiningDate)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {canViewFinancials && ss ? (
            <div className="bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-lg text-right w-full sm:w-auto">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">Monthly Net</span>
              <span className="text-lg font-bold text-stone-900">{formatCurrency(ss.netSalary)}</span>
            </div>
          ) : !canViewFinancials ? (
            <div className="bg-amber-50/60 border border-amber-200 px-3 py-2 rounded-lg text-right w-full sm:w-auto text-xs text-amber-800 flex items-center gap-1.5 font-medium">
              <Lock size={12} /> Confidential Financials
            </div>
          ) : null}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-1 overflow-x-auto pb-px">
        {[
          { key: 'personal', label: 'Personal Information', icon: User },
          { key: 'employment', label: 'Employment Details', icon: Briefcase },
          { key: 'compensation', label: 'Compensation & Structure', icon: IndianRupee },
          { key: 'attendance', label: 'Attendance & Leave', icon: Clock },
          { key: 'payroll', label: 'Payroll History', icon: FileText },
          { key: 'documents', label: 'Documents', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                isActive
                  ? 'border-meridian-600 text-meridian-700 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm min-h-[400px]">
        {/* 1. PERSONAL TAB */}
        {activeTab === 'personal' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-semibold text-stone-900">Personal Details</h3>
                <p className="text-xs text-stone-500">Employee contact and identity information</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Edit3 size={14} /> Edit Information
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">State & Pincode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-meridian-600 text-white rounded-lg text-xs font-medium hover:bg-meridian-700"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Full Name</span>
                  <span className="text-sm font-semibold text-stone-800">{employee.firstName} {employee.lastName}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Email Address</span>
                  <span className="text-sm text-stone-800 flex items-center gap-1.5">
                    <Mail size={14} className="text-stone-400" /> {employee.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Phone Number</span>
                  <span className="text-sm text-stone-800 flex items-center gap-1.5">
                    <Phone size={14} className="text-stone-400" /> +91 {employee.phone}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Date of Birth</span>
                  <span className="text-sm text-stone-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-stone-400" /> {formatDate(employee.dateOfBirth)}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Gender</span>
                  <span className="text-sm text-stone-800 capitalize">{employee.gender}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Residential Address</span>
                  <span className="text-sm text-stone-800 flex items-start gap-1.5">
                    <MapPin size={14} className="text-stone-400 mt-0.5 flex-shrink-0" />
                    <span>{employee.address}, {employee.city}, {employee.state} - {employee.pincode}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. EMPLOYMENT TAB */}
        {activeTab === 'employment' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-stone-900 mb-1">Employment Information</h3>
              <p className="text-xs text-stone-500 mb-6">Organizational role, reporting structure, and banking credentials</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 border-b border-stone-100">
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Employee ID</span>
                  <span className="text-sm font-mono font-semibold text-stone-900">{employee.employeeId}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Department</span>
                  <span className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                    <Building size={14} className="text-meridian-600" /> {employee.department}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Designation</span>
                  <span className="text-sm font-semibold text-stone-900">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Joining Date</span>
                  <span className="text-sm text-stone-800">{formatDate(employee.joiningDate)}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Employment Status</span>
                  <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', getStatusColor(employee.status))}>
                    {employee.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank & Statutory Info */}
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-4">Bank & Statutory Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">Bank Name</span>
                  <span className="text-sm font-semibold text-stone-800 mt-1 block">
                    {employee.bankDetails?.bankName || 'Not Submitted'}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5">
                    {employee.bankDetails?.branchName || '—'}
                  </span>
                </div>
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">Account Number</span>
                  <span className="text-sm font-mono font-semibold text-stone-800 mt-1 block">
                    {employee.bankDetails?.accountNumber || '—'}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5">
                    IFSC: {employee.bankDetails?.ifscCode || '—'}
                  </span>
                </div>
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">PAN Number</span>
                  <span className="text-sm font-mono font-semibold text-stone-800 mt-1 block">
                    {employee.taxInfo?.panNumber || '—'}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5 capitalize">
                    Regime: {employee.taxInfo?.taxRegime || 'new'}
                  </span>
                </div>
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">UAN / PF Number</span>
                  <span className="text-sm font-mono font-semibold text-stone-800 mt-1 block">
                    {employee.taxInfo?.uanNumber || '—'}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5">Provident Fund Account</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. COMPENSATION TAB */}
        {activeTab === 'compensation' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-semibold text-stone-900">Salary Structure & Components</h3>
                <p className="text-xs text-stone-500">Configured salary breakdown and annual compensation package</p>
              </div>
              {userRole === 'hr_admin' && (
                <Link
                  to="/salary-structures"
                  className="text-xs text-meridian-700 hover:text-meridian-800 font-medium underline"
                >
                  View all structures →
                </Link>
              )}
            </div>

            {!canViewFinancials ? (
              <div className="text-center py-12 bg-amber-50/40 rounded-xl border border-amber-200 p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock size={22} />
                </div>
                <h4 className="text-base font-bold text-amber-950">Confidential Compensation Record</h4>
                <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                  Under corporate governance and role-based access restrictions (RBAC), employees can only inspect their own compensation statements. Colleague packages are confidential and accessible to HR Administrators only.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => switchRole('hr_admin')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-meridian-600 text-white rounded-lg text-xs font-semibold hover:bg-meridian-700 shadow-2xs transition-colors"
                  >
                    Switch to HR Admin for Demo
                  </button>
                </div>
              </div>
            ) : ss ? (
              <div className="space-y-6">
                {/* Visual Ratio Bar */}
                <div>
                  <div className="flex justify-between text-xs text-stone-500 mb-1.5 font-medium">
                    <span>Net Take-home: {formatCurrency(ss.netSalary)} ({Math.round((ss.netSalary / ss.grossSalary) * 100)}%)</span>
                    <span>Total Deductions: {formatCurrency(ss.totalDeductions)} ({Math.round((ss.totalDeductions / ss.grossSalary) * 100)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-meridian-600 h-full rounded-l-full"
                      style={{ width: `${(ss.netSalary / ss.grossSalary) * 100}%` }}
                      title="Net Salary"
                    />
                    <div
                      className="bg-amber-500 h-full rounded-r-full"
                      style={{ width: `${(ss.totalDeductions / ss.grossSalary) * 100}%` }}
                      title="Deductions"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Earnings */}
                  <div className="border border-stone-200 rounded-lg overflow-hidden">
                    <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Earnings (Monthly)</span>
                      <span className="text-xs font-bold text-stone-900">{formatCurrency(ss.grossSalary)}</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {ss.components.filter(c => c.type === 'earning').map(c => {
                        const amount = c.category === 'basic' ? c.value :
                          c.calculationType === 'percentage_of_basic' ? Math.round((ss.components.find(x => x.category === 'basic')?.value || 0) * (c.value / 100)) : c.value;
                        return (
                          <div key={c.id} className="flex justify-between items-center text-sm py-1 border-b border-stone-50">
                            <div>
                              <span className="text-stone-800 font-medium">{c.name}</span>
                              {c.description && <span className="block text-[11px] text-stone-400">{c.description}</span>}
                            </div>
                            <span className="font-mono text-stone-800">{formatCurrency(amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="border border-stone-200 rounded-lg overflow-hidden">
                    <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Deductions (Monthly)</span>
                      <span className="text-xs font-bold text-amber-700">{formatCurrency(ss.totalDeductions)}</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {ss.components.filter(c => c.type === 'deduction').map(c => (
                        <div key={c.id} className="flex justify-between items-center text-sm py-1 border-b border-stone-50">
                          <div>
                            <span className="text-stone-800 font-medium">{c.name}</span>
                            {c.description && <span className="block text-[11px] text-stone-400">{c.description}</span>}
                          </div>
                          <span className="font-mono text-stone-800">{formatCurrency(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Annual Summary Card */}
                <div className="p-4 bg-meridian-50 border border-meridian-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-meridian-800 font-bold">Annual Cost to Company (CTC)</span>
                    <p className="text-xs text-meridian-700 mt-0.5">Includes monthly gross, employer PF contribution & statutory gratuity accrual</p>
                  </div>
                  <span className="text-2xl font-bold text-meridian-950 font-mono">
                    {formatCurrency(ss.annualCTC)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                <p className="text-sm font-medium text-stone-600 mb-2">No Salary Structure Configured</p>
                <p className="text-xs text-stone-400 mb-4">Assign a salary template to enable automated monthly payroll runs.</p>
                <Link
                  to="/salary-structures"
                  className="px-3 py-1.5 bg-meridian-600 text-white rounded text-xs font-medium hover:bg-meridian-700"
                >
                  Assign Structure
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 4. ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-semibold text-stone-900">Attendance Summary</h3>
                <p className="text-xs text-stone-500">Cycle: October 2026 (1st Oct – 31st Oct)</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-stone-100 rounded text-stone-600">
                Working Days: {currentAttendance.workingDays}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                <span className="text-[11px] font-medium text-emerald-800 block">Present Days</span>
                <span className="text-xl font-bold text-emerald-900 mt-1 block">{currentAttendance.presentDays}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                <span className="text-[11px] font-medium text-blue-800 block">Work From Home</span>
                <span className="text-xl font-bold text-blue-900 mt-1 block">{currentAttendance.wfhDays}</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
                <span className="text-[11px] font-medium text-purple-800 block">Leaves Taken</span>
                <span className="text-xl font-bold text-purple-900 mt-1 block">{currentAttendance.leaveDays}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
                <span className="text-[11px] font-medium text-amber-800 block">Half Days</span>
                <span className="text-xl font-bold text-amber-900 mt-1 block">{currentAttendance.halfDays}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-center">
                <span className="text-[11px] font-medium text-stone-600 block">Absences</span>
                <span className="text-xl font-bold text-stone-800 mt-1 block">{currentAttendance.absentDays}</span>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
                <span className="text-[11px] font-medium text-red-800 block">Loss of Pay (LOP)</span>
                <span className="text-xl font-bold text-red-900 mt-1 block">{currentAttendance.lossOfPayDays}</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
              <div className="flex items-center gap-2 font-medium text-stone-800 mb-1">
                <CheckCircle2 size={16} className="text-meridian-600" />
                Attendance Sync Status
              </div>
              Biometric check-in and leave records have been synchronized with the HRMS portal for the October payroll cycle. No unverified anomalies detected.
            </div>
          </div>
        )}

        {/* 5. PAYROLL HISTORY TAB */}
        {activeTab === 'payroll' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-semibold text-stone-900">Historical Disbursal Records</h3>
                <p className="text-xs text-stone-500">Record of all monthly payslips and transactions</p>
              </div>
            </div>

            {employeePayrollHistory.length > 0 ? (
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Payroll Month</th>
                      <th className="px-4 py-3 text-right">Gross Earnings</th>
                      <th className="px-4 py-3 text-right">Deductions</th>
                      <th className="px-4 py-3 text-right">Net Disbursed</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {employeePayrollHistory.map(({ run, item }) => (
                      <tr key={run.id} className="hover:bg-stone-50/50">
                        <td className="px-4 py-3 font-medium text-stone-900">
                          {['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][run.month]} {run.year}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-stone-800">
                          {formatCurrency(item.grossSalary)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-stone-600">
                          {formatCurrency(item.totalDeductions)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-meridian-700">
                          {formatCurrency(item.netSalary)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize', getStatusColor(run.status))}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/payslips"
                            className="text-meridian-600 hover:text-meridian-800 font-medium hover:underline"
                          >
                            View Payslip
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-stone-400 text-xs">
                No past payroll records found for this employee.
              </div>
            )}
          </div>
        )}

        {/* 6. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-semibold text-stone-900">Documents & Compliance Vault</h3>
                <p className="text-xs text-stone-500">Employment agreements, Form 16, and tax proof filings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-stone-200 rounded-lg flex items-center justify-between hover:border-stone-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-meridian-50 text-meridian-700 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">Employment Contract</span>
                    <span className="text-[10px] text-stone-400 block">Signed 2021-01-15</span>
                  </div>
                </div>
                <button className="text-stone-400 hover:text-stone-700 p-1" title="Download">
                  <Download size={16} />
                </button>
              </div>

              <div className="p-4 border border-stone-200 rounded-lg flex items-center justify-between hover:border-stone-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">Form 16 (FY 2025-26)</span>
                    <span className="text-[10px] text-stone-400 block">Verified by Finance</span>
                  </div>
                </div>
                <button className="text-stone-400 hover:text-stone-700 p-1" title="Download">
                  <Download size={16} />
                </button>
              </div>

              <div className="p-4 border border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-center p-6 text-stone-400 hover:border-stone-400 cursor-pointer">
                <span className="text-xs font-medium text-stone-600 block mb-0.5">+ Upload Document</span>
                <span className="text-[10px] text-stone-400">PDF, JPG up to 10MB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

