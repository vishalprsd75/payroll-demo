import { useState } from 'react';
import {
  Download, Eye, Search,
  Lock, ShieldCheck, UserCheck
} from 'lucide-react';
import { useStore } from '../store';
import { generatePayslip, MONTHS } from '../data';
import { downloadPayslipPDF } from '../utils/pdf';
import { formatCurrency, getInitials, getStatusColor, cn } from '../utils/format';
import type { Payslip as PayslipType, PayrollItem } from '../types';

export default function Payslips() {
  const {
    payrollRuns,
    departments,
    currentPayrollMonth,
    currentPayrollYear,
    setPayrollMonth,
    addNotification,
    userRole,
    currentUser,
    switchRole,
  } = useStore();

  const [selectedMonth, setSelectedMonth] = useState(currentPayrollMonth);
  const [selectedYear] = useState(currentPayrollYear);
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPayslip, setPreviewPayslip] = useState<PayslipType | null>(null);

  // Find the selected payroll run
  const activeRun = payrollRuns.find(r => r.month === selectedMonth && r.year === selectedYear) || payrollRuns[0];

  // RBAC Permission Boundary:
  // If user is Employee, strictly filter to their own records only!
  const allItems = activeRun?.items || [];
  const scopedItems = userRole === 'employee'
    ? allItems.filter(item => item.employeeId === (currentUser?.employeeId || 'emp-2'))
    : allItems;

  // Filter items in run
  const filteredItems = scopedItems.filter(item => {
    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    const matchesSearch = item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handlePreview = (item: PayrollItem) => {
    const payslip = generatePayslip(item, activeRun);
    setPreviewPayslip(payslip);
  };

  const handleDownloadSingle = (item: PayrollItem) => {
    const payslip = generatePayslip(item, activeRun);
    downloadPayslipPDF(payslip);
    addNotification({
      type: 'success',
      title: 'PDF Downloaded',
      message: `Payslip for ${item.employeeName} (${MONTHS[selectedMonth - 1]} ${selectedYear}) generated.`,
    });
  };

  const handleDownloadBulk = () => {
    if (filteredItems.length === 0) return;
    // Download first 3 to prevent browser popup block
    filteredItems.slice(0, 3).forEach(item => {
      const payslip = generatePayslip(item, activeRun);
      downloadPayslipPDF(payslip);
    });
    addNotification({
      type: 'info',
      title: 'Bulk Export Triggered',
      message: `Exported payslips for ${Math.min(filteredItems.length, 3)} employees.`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-meridian-600" />
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              {userRole === 'employee' ? 'My Payslips & Tax Statements' : 'Payslips & Disbursal Records'}
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {userRole === 'employee'
              ? 'Access and download your verified personal salary slips in official PDF format'
              : 'Generate, preview, and download compliance-ready PDF salary slips for all employees'}
          </p>
        </div>

        {userRole === 'hr_admin' && (
          <button
            onClick={handleDownloadBulk}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Download size={14} className="text-meridian-600" />
            Export Batch PDFs
          </button>
        )}
      </div>

      {/* ─── Permission Boundary Notice ───────────────────────────────── */}
      {userRole === 'employee' ? (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Lock size={14} />
            </div>
            <div>
              <span className="font-bold text-amber-900 block">
                Employee Role Boundary Enforced
              </span>
              <span className="text-amber-700">
                You are viewing restricted records for <strong>{currentUser?.name || 'Priya Sharma'}</strong> only. Colleague compensation is confidential under DPDP privacy regulations.
              </span>
            </div>
          </div>
          <button
            onClick={() => switchRole('hr_admin')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs whitespace-nowrap self-end sm:self-auto"
          >
            <UserCheck size={13} />
            Switch to HR Admin
          </button>
        </div>
      ) : (
        <div className="bg-meridian-50/60 border border-meridian-200 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-meridian-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-meridian-700 flex-shrink-0" />
            <span>
              <strong>HR Administrator Mode</strong> — Complete visibility over all 30 personnel, statutory deductions, and bulk PDF generation.
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-meridian-700">
            Full Audit Scope
          </span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder={userRole === 'employee' ? 'Filter by month or payslip...' : 'Search by employee name or ID...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-600"
          />
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => {
              const m = Number(e.target.value);
              setSelectedMonth(m);
              setPayrollMonth(m, selectedYear);
            }}
            className="px-3 py-2 text-xs font-medium border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-meridian-600"
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>{name} {selectedYear}</option>
            ))}
          </select>

          {/* Department Filter (HR only) */}
          {userRole === 'hr_admin' && (
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-meridian-600"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>
            {userRole === 'employee'
              ? `Showing your personal statement for ${MONTHS[selectedMonth - 1]} ${selectedYear}`
              : `Showing ${filteredItems.length} records for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
          </span>
          <span className="font-medium text-stone-700">
            Cycle Status: <strong className="capitalize text-meridian-700">{activeRun.status}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department & Role</th>
                <th className="px-4 py-3 text-right">Gross Salary</th>
                <th className="px-4 py-3 text-right">Total Deductions</th>
                <th className="px-4 py-3 text-right">Net Payable</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {getInitials(item.employeeName)}
                        </div>
                        <div>
                          <span className="font-semibold text-stone-900 block">{item.employeeName}</span>
                          <span className="text-[11px] font-mono text-stone-400">{item.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-stone-800 block">{item.designation}</span>
                      <span className="text-[11px] text-stone-500">{item.department}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-stone-700">
                      {formatCurrency(item.grossSalary)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-700">
                      -{formatCurrency(item.totalDeductions)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-stone-900 text-sm">
                      {formatCurrency(item.netSalary)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize', getStatusColor(activeRun.status === 'processed' ? 'paid' : 'pending'))}>
                        {activeRun.status === 'processed' ? 'Disbursed' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePreview(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-stone-200 rounded text-stone-700 hover:bg-stone-50 text-[11px] font-medium"
                          title="Preview Payslip"
                        >
                          <Eye size={12} /> Preview
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-meridian-50 border border-meridian-200 rounded text-meridian-700 hover:bg-meridian-100 text-[11px] font-medium"
                          title="Download PDF"
                        >
                          <Download size={12} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400 text-xs">
                    No payslip records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Payslip Preview Modal (Document Quality) ────────────────────── */}
      {previewPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[92vh] overflow-y-auto animate-scale-in">
            {/* Modal Controls */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between sticky top-0 z-10">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Official Document Preview
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
                  ✕
                </button>
              </div>
            </div>

            {/* Document Surface */}
            <div className="p-8 space-y-6 bg-white font-sans text-stone-900">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b-2 border-meridian-700 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-meridian-700 text-white font-black text-sm flex items-center justify-center">
                      M
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900">MERIDIAN TECH LABS</h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Plot 42, Sector 15, Cyber City, Gurugram, HR - 122001</p>
                  <p className="text-[11px] text-stone-400 font-mono">CIN: U72200DL2021PTC384729</p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold uppercase tracking-wider text-meridian-800 block">Payslip Statement</span>
                  <span className="text-base font-bold text-stone-800 block mt-0.5">
                    {MONTHS[previewPayslip.month - 1]} {previewPayslip.year}
                  </span>
                  <span className="text-[11px] text-stone-500 block">Payment Mode: {previewPayslip.paymentMode}</span>
                </div>
              </div>

              {/* Employee Bio Matrix */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Employee Name</span>
                  <span className="font-bold text-stone-900 mt-0.5 block">{previewPayslip.employee.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Employee ID</span>
                  <span className="font-mono font-bold text-stone-900 mt-0.5 block">{previewPayslip.employee.employeeId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Designation</span>
                  <span className="font-medium text-stone-800 mt-0.5 block">{previewPayslip.employee.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Department</span>
                  <span className="font-medium text-stone-800 mt-0.5 block">{previewPayslip.employee.department}</span>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Bank & Branch</span>
                  <span className="font-medium text-stone-800 mt-0.5 block">{previewPayslip.employee.bankName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Account Number</span>
                  <span className="font-mono text-stone-800 mt-0.5 block">{previewPayslip.employee.accountNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">PAN / UAN</span>
                  <span className="font-mono text-stone-800 mt-0.5 block">{previewPayslip.employee.panNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Paid / LOP Days</span>
                  <span className="font-medium text-stone-800 mt-0.5 block">
                    {previewPayslip.paidDays} Paid / {previewPayslip.lopDays} LOP
                  </span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                  <div className="bg-meridian-700 text-white font-bold px-3 py-2 flex justify-between">
                    <span>Earnings</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {previewPayslip.earnings.map((e, idx) => (
                      <div key={idx} className="px-3 py-2 flex justify-between text-stone-700">
                        <span>{e.name}</span>
                        <span className="font-mono text-stone-900">{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-stone-50 px-3 py-2.5 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                    <span>Gross Earnings</span>
                    <span className="font-mono">{formatCurrency(previewPayslip.grossSalary)}</span>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                  <div className="bg-stone-800 text-white font-bold px-3 py-2 flex justify-between">
                    <span>Deductions</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {previewPayslip.deductions.map((d, idx) => (
                      <div key={idx} className="px-3 py-2 flex justify-between text-stone-700">
                        <span>{d.name}</span>
                        <span className="font-mono text-amber-700">-{formatCurrency(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-stone-50 px-3 py-2.5 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                    <span>Total Deductions</span>
                    <span className="font-mono text-amber-800">-{formatCurrency(previewPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Disbursal Highlight Box */}
              <div className="bg-meridian-700 text-white rounded-lg p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold block text-meridian-200">Net Take-Home Pay</span>
                  <span className="text-[11px] text-meridian-100">Credited to employee bank account</span>
                </div>
                <span className="text-2xl font-black font-mono tracking-tight">
                  {formatCurrency(previewPayslip.netSalary)}
                </span>
              </div>

              {/* Footer Note */}
              <div className="text-center text-[10px] text-stone-400 border-t border-stone-100 pt-4">
                This is a computer-generated statement issued under the Meridian Payroll Automation System and requires no physical signature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
