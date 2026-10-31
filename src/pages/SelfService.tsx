import { useState } from 'react';
import {
  IndianRupee, FileText,
  Clock, Download, Eye,
  Bell, X
} from 'lucide-react';
import { useStore } from '../store';
import { generatePayslip, MONTHS, salaryStructures } from '../data';
import { downloadPayslipPDF } from '../utils/pdf';
import { formatCurrency, formatDate, getInitials, cn } from '../utils/format';
import type { Payslip as PayslipType, LeaveType } from '../types';

export default function SelfService() {
  const {
    currentUser,
    userRole,
    switchRole,
    employees,
    payrollRuns,
    leaveBalances,
    attendanceSummaries,
    announcements,
    addNotification,
    addLeaveRequest,
  } = useStore();

  // Find employee profile: match logged in user, or default to Priya Sharma (emp-2)
  const employee = employees.find(e => e.id === currentUser?.employeeId) ||
    employees.find(e => e.id === 'emp-2') ||
    employees[1] ||
    employees[0];

  const [activeTab, setActiveTab] = useState<'salary' | 'payslips' | 'leaves' | 'announcements'>('salary');
  const [previewPayslip, setPreviewPayslip] = useState<PayslipType | null>(null);

  // Leave application modal / form state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Attendance for employee in current cycle
  const currentAttendance = (employee ? attendanceSummaries.find(
    a => a.employeeId === employee.id && a.month === '2026-10'
  ) : null) || {
    workingDays: 22,
    presentDays: 20,
    wfhDays: 4,
    leaveDays: 1,
    lossOfPayDays: 0,
  };

  // Leave balances for this employee
  const myLeaves = employee ? leaveBalances.filter(l => l.employeeId === employee.id) : [];

  // Completed payroll runs for payslip download
  const myPayslipHistory = employee ? payrollRuns
    .map(run => {
      const item = run.items?.find(i => i.employeeId === employee.id);
      return item ? { run, item } : null;
    })
    .filter(Boolean) as { run: typeof payrollRuns[0]; item: typeof payrollRuns[0]['items'][0] }[] : [];

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      addNotification({
        type: 'error',
        title: 'Missing Details',
        message: 'Please specify dates and a reason for leave.',
      });
      return;
    }

    const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);

    addLeaveRequest({
      employeeId: employee.id,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason.trim(),
    });

    setShowLeaveModal(false);
    setReason('');
    setStartDate('');
    setEndDate('');
    addNotification({
      type: 'success',
      title: 'Leave Request Submitted',
      message: `${leaveType.toUpperCase()} leave request (${days} days) sent to Manager for approval.`,
    });
  };

  const handlePreviewPayslip = (item: typeof myPayslipHistory[0]['item'], run: typeof myPayslipHistory[0]['run']) => {
    const slip = generatePayslip(item, run);
    setPreviewPayslip(slip);
  };

  const handleDownloadPayslip = (item: typeof myPayslipHistory[0]['item'], run: typeof myPayslipHistory[0]['run']) => {
    const slip = generatePayslip(item, run);
    downloadPayslipPDF(slip);
    addNotification({
      type: 'success',
      title: 'Payslip Downloaded',
      message: `Downloaded payslip for ${MONTHS[run.month - 1]} ${run.year}`,
    });
  };

  // Guaranteed fallback salary structure
  const ss = employee?.salaryStructure ||
    (employee?.salaryStructureId ? salaryStructures[employee.salaryStructureId] : null) ||
    salaryStructures['senior-engineer'];

  if (!employee) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20">
        <h2 className="text-lg font-bold text-stone-800 mb-2">Employee Portal</h2>
        <p className="text-sm text-stone-500 mb-4">No employee profile active. Please select an employee account.</p>
        <button
          onClick={() => switchRole('hr_admin')}
          className="px-4 py-2 bg-meridian-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to HR Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Role Banner if viewed by HR Admin */}
      {userRole === 'hr_admin' && (
        <div className="bg-meridian-900 text-white rounded-xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-meridian-400 animate-pulse" />
            <span>
              <strong>Employee Self-Service Preview</strong> — Viewing as <strong>{employee.firstName} {employee.lastName}</strong> ({employee.designation})
            </span>
          </div>
          <button
            onClick={() => switchRole('hr_admin')}
            className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors self-end sm:self-auto"
          >
            Switch to HR Admin
          </button>
        </div>
      )}

      {/* ─── Hero Profile Header ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-meridian-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-xs">
            {getInitials(`${employee.firstName} ${employee.lastName}`)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                Welcome back, {employee.firstName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 capitalize">
                {employee.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-800">{employee.designation}</span>
              <span className="text-stone-300">•</span>
              <span className="text-meridian-700 font-medium">{employee.department}</span>
              <span className="text-stone-300">•</span>
              <span className="font-mono text-stone-400">ID: {employee.employeeId}</span>
            </p>
          </div>
        </div>

        {ss && (
          <div className="bg-stone-50 border border-stone-200 px-5 py-3 rounded-xl text-left md:text-right w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Estimated Monthly Net
            </span>
            <span className="text-2xl font-black text-stone-900 font-mono mt-0.5 block">
              {formatCurrency(ss.netSalary)}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Disbursal scheduled by 31st Oct</span>
          </div>
        )}
      </div>

      {/* ─── Navigation Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-stone-200 gap-1 overflow-x-auto pb-px">
        {[
          { key: 'salary', label: 'My Salary & Tax', icon: IndianRupee },
          { key: 'payslips', label: 'Payslips & History', icon: FileText },
          { key: 'leaves', label: 'Leaves & Attendance', icon: Clock },
          { key: 'announcements', label: 'Announcements', icon: Bell },
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

      {/* ─── Tab Content Panels ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm min-h-[420px]">
        {/* 1. MY SALARY TAB */}
        {activeTab === 'salary' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 mb-1">Compensation Breakdown</h3>
              <p className="text-xs text-stone-500">Your approved compensation package under {ss.name}</p>
            </div>

            {/* Visual Bar */}
            <div>
              <div className="flex justify-between text-xs text-stone-500 mb-1.5 font-medium">
                <span>In-Hand Net Pay: {formatCurrency(ss.netSalary)} ({Math.round((ss.netSalary / ss.grossSalary) * 100)}%)</span>
                <span>Statutory Deductions: {formatCurrency(ss.totalDeductions)} ({Math.round((ss.totalDeductions / ss.grossSalary) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-meridian-600 h-full rounded-l-full"
                  style={{ width: `${(ss.netSalary / ss.grossSalary) * 100}%` }}
                />
                <div
                  className="bg-amber-500 h-full rounded-r-full"
                  style={{ width: `${(ss.totalDeductions / ss.grossSalary) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Table */}
              <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex justify-between font-bold text-stone-800">
                  <span>Gross Earnings</span>
                  <span className="font-mono">{formatCurrency(ss.grossSalary)}</span>
                </div>
                <div className="p-4 space-y-2.5">
                  {ss.components.filter(c => c.type === 'earning').map(c => {
                    const amount = c.category === 'basic' ? c.value :
                      c.calculationType === 'percentage_of_basic' ? Math.round((ss.components.find(x => x.category === 'basic')?.value || 0) * (c.value / 100)) : c.value;
                    return (
                      <div key={c.id} className="flex justify-between py-1 border-b border-stone-50">
                        <div>
                          <span className="font-medium text-stone-800">{c.name}</span>
                          {c.description && <span className="block text-[10px] text-stone-400">{c.description}</span>}
                        </div>
                        <span className="font-mono text-stone-900 font-semibold">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deductions Table */}
              <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex justify-between font-bold text-amber-800">
                  <span>Statutory Withholdings</span>
                  <span className="font-mono">-{formatCurrency(ss.totalDeductions)}</span>
                </div>
                <div className="p-4 space-y-2.5">
                  {ss.components.filter(c => c.type === 'deduction').map(c => (
                    <div key={c.id} className="flex justify-between py-1 border-b border-stone-50">
                      <div>
                        <span className="font-medium text-stone-800">{c.name}</span>
                        {c.description && <span className="block text-[10px] text-stone-400">{c.description}</span>}
                      </div>
                      <span className="font-mono text-amber-700 font-semibold">-{formatCurrency(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-stone-600">
              <div>
                <span className="font-bold text-stone-900 block">Tax Regime: {employee.taxInfo?.taxRegime === 'old' ? 'Old Tax Scheme' : 'New Simplified Regime'}</span>
                <span className="text-stone-400">PAN: {employee.taxInfo?.panNumber || '—'} • UAN: {employee.taxInfo?.uanNumber || '—'}</span>
              </div>
              <span className="px-3 py-1 bg-white border border-stone-200 rounded font-medium text-stone-700">
                Annual CTC: {formatCurrency(ss.annualCTC)}
              </span>
            </div>
          </div>
        )}

        {/* 2. PAYSLIPS TAB */}
        {activeTab === 'payslips' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 mb-1">Historical Payslips</h3>
              <p className="text-xs text-stone-500">Download signed salary slips in compliance PDF format</p>
            </div>

            {myPayslipHistory.length > 0 ? (
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3 text-right">Gross Earnings</th>
                      <th className="px-4 py-3 text-right">Deductions</th>
                      <th className="px-4 py-3 text-right">Net Transferred</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myPayslipHistory.map(({ run, item }) => (
                      <tr key={run.id} className="hover:bg-stone-50/60">
                        <td className="px-4 py-3 font-semibold text-stone-900">
                          {MONTHS[run.month - 1]} {run.year}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-stone-700">
                          {formatCurrency(item.grossSalary)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-amber-700">
                          -{formatCurrency(item.totalDeductions)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-meridian-800">
                          {formatCurrency(item.netSalary)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                            {run.status === 'processed' ? 'Disbursed' : 'In Review'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePreviewPayslip(item, run)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-stone-200 rounded text-stone-700 hover:bg-stone-50 font-medium"
                            >
                              <Eye size={12} /> Preview
                            </button>
                            <button
                              onClick={() => handleDownloadPayslip(item, run)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-meridian-50 border border-meridian-200 rounded text-meridian-700 hover:bg-meridian-100 font-medium"
                            >
                              <Download size={12} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs">
                No past payslips on file.
              </div>
            )}
          </div>
        )}

        {/* 3. LEAVES & ATTENDANCE TAB */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 mb-1">Leave Quota & Attendance</h3>
                <p className="text-xs text-stone-500">Track balance days, biometric hours, and submit time-off requests</p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3.5 py-2 bg-meridian-600 text-white rounded-lg text-xs font-semibold hover:bg-meridian-700 transition-colors shadow-2xs"
              >
                + Apply for Leave
              </button>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {myLeaves.map(l => (
                <div key={l.leaveType} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 capitalize">
                      {l.leaveType} Leave
                    </span>
                    <span className="text-xs font-mono font-bold text-meridian-800">
                      {l.remaining} Available
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-meridian-600 h-full rounded-full"
                      style={{ width: `${(l.used / l.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>{l.used} days taken</span>
                    <span>{l.total} total quota</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Snapshot */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                October 2026 Attendance Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[11px]">Working Days</span>
                  <span className="text-base font-bold text-stone-900 font-mono mt-0.5 block">{currentAttendance.workingDays}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-emerald-200 bg-emerald-50/20">
                  <span className="text-emerald-700 block text-[11px]">Present in Office</span>
                  <span className="text-base font-bold text-emerald-800 font-mono mt-0.5 block">{currentAttendance.presentDays}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200 bg-blue-50/20">
                  <span className="text-blue-700 block text-[11px]">Work From Home</span>
                  <span className="text-base font-bold text-blue-800 font-mono mt-0.5 block">{currentAttendance.wfhDays}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[11px]">Loss of Pay (LOP)</span>
                  <span className="text-base font-bold text-stone-900 font-mono mt-0.5 block">{currentAttendance.lossOfPayDays}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 mb-1">Company Notices & Circulars</h3>
              <p className="text-xs text-stone-500">Official HR notifications regarding payroll schedules and holiday policies</p>
            </div>

            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        ann.type === 'warning' ? 'bg-amber-500' : 'bg-meridian-600'
                      )} />
                      <h4 className="text-sm font-bold text-stone-900">{ann.title}</h4>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">{formatDate(ann.createdAt)}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pl-4">{ann.content}</p>
                  <div className="mt-3 pl-4 flex items-center gap-2 text-[11px] text-stone-400">
                    <span>Issued by {ann.createdBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Apply Leave Modal ───────────────────────────────────────── */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-bold text-stone-900">Apply for Time Off</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                >
                  <option value="casual">Casual Leave (Available)</option>
                  <option value="sick">Sick Leave (Available)</option>
                  <option value="earned">Earned Privilege Leave (Available)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reason for Absence</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide brief context for your manager..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-meridian-600 text-white rounded-lg font-semibold hover:bg-meridian-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Payslip Preview Modal ───────────────────────────────────── */}
      {previewPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between sticky top-0 z-10">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Personal Salary Statement
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPayslipPDF(previewPayslip)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-meridian-600 text-white rounded-lg text-xs font-semibold hover:bg-meridian-700"
                >
                  <Download size={13} /> Download PDF
                </button>
                <button
                  onClick={() => setPreviewPayslip(null)}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs text-stone-900">
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-stone-900">MERIDIAN TECH LABS</h3>
                  <p className="text-stone-500 text-[11px]">Cyber City, Gurugram, HR</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-meridian-800 block text-sm">
                    {MONTHS[previewPayslip.month - 1]} {previewPayslip.year}
                  </span>
                  <span className="text-[10px] text-stone-400">Net Transferable</span>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-stone-400 block">Name</span>
                  <span className="font-semibold text-stone-800">{previewPayslip.employee.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Account</span>
                  <span className="font-mono text-stone-800">{previewPayslip.employee.accountNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-stone-200 rounded p-3">
                  <span className="font-bold text-stone-700 block mb-2 border-b pb-1">Earnings</span>
                  {previewPayslip.earnings.map((e, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 text-stone-600">
                      <span>{e.name}</span>
                      <span className="font-mono">{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1.5 mt-2 flex justify-between font-bold text-stone-900">
                    <span>Gross</span>
                    <span className="font-mono">{formatCurrency(previewPayslip.grossSalary)}</span>
                  </div>
                </div>

                <div className="border border-stone-200 rounded p-3">
                  <span className="font-bold text-stone-700 block mb-2 border-b pb-1">Deductions</span>
                  {previewPayslip.deductions.map((d, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 text-stone-600">
                      <span>{d.name}</span>
                      <span className="font-mono text-amber-700">-{formatCurrency(d.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1.5 mt-2 flex justify-between font-bold text-stone-900">
                    <span>Total Deductions</span>
                    <span className="font-mono text-amber-800">-{formatCurrency(previewPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-meridian-700 text-white rounded-lg flex justify-between items-center">
                <span className="font-bold text-sm">Net Pay Transferred</span>
                <span className="text-xl font-bold font-mono">{formatCurrency(previewPayslip.netSalary)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
