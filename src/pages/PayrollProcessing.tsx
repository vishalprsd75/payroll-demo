// ─── Meridian – Payroll Processing Page ──────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  ClipboardCheck, Calculator, UserCheck, ShieldCheck, CheckCircle2,
  X, Users, IndianRupee, AlertTriangle, TrendingDown, ChevronDown,
  ArrowUpRight, Calendar,
} from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, cn, getMonthName, getStatusColor } from '../utils/format';
import type { PayrollItem, PayrollStage } from '../types';

const STAGES: { key: PayrollStage; label: string; icon: React.ElementType }[] = [
  { key: 'attendance_review', label: 'Attendance Review', icon: ClipboardCheck },
  { key: 'calculation', label: 'Calculation', icon: Calculator },
  { key: 'hr_review', label: 'HR Review', icon: UserCheck },
  { key: 'approval', label: 'Approval', icon: ShieldCheck },
  { key: 'processed', label: 'Processed', icon: CheckCircle2 },
];

const STAGE_ORDER: Record<PayrollStage, number> = {
  attendance_review: 0,
  calculation: 1,
  hr_review: 2,
  approval: 3,
  processed: 4,
};

const MONTHS = [
  { value: 7, label: 'July 2026', year: 2026 },
  { value: 8, label: 'August 2026', year: 2026 },
  { value: 9, label: 'September 2026', year: 2026 },
  { value: 10, label: 'October 2026', year: 2026 },
];

export default function PayrollProcessing() {
  const {
    payrollRuns, currentPayrollMonth, currentPayrollYear, setPayrollMonth,
    approvePayroll, processPayroll, addNotification,
  } = useStore();

  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<'approve' | 'process' | null>(null);

  const currentRun = useMemo(
    () => payrollRuns.find(r => r.month === currentPayrollMonth && r.year === currentPayrollYear),
    [payrollRuns, currentPayrollMonth, currentPayrollYear],
  );

  const sortedItems = useMemo(
    () => currentRun ? [...currentRun.items].sort((a, b) => a.department.localeCompare(b.department)) : [],
    [currentRun],
  );

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = MONTHS.find(m => m.value === Number(e.target.value));
    if (selected) setPayrollMonth(selected.value, selected.year);
  };

  const handleApprove = () => {
    if (currentRun) {
      approvePayroll(currentRun.id);
      setShowConfirmDialog(null);
    }
  };

  const handleProcess = () => {
    if (currentRun) {
      processPayroll(currentRun.id);
      setShowConfirmDialog(null);
    }
  };

  const handleStartPayroll = () => {
    addNotification({
      type: 'info',
      title: 'Payroll Initiated',
      message: `Payroll calculation started for ${getMonthName(currentPayrollMonth)} ${currentPayrollYear}.`,
    });
  };

  const currentStageIndex = currentRun ? STAGE_ORDER[currentRun.stage] : -1;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Payroll Processing</h1>
          <p className="text-sm text-stone-500 mt-1">
            Guided workflow for {getMonthName(currentPayrollMonth)} {currentPayrollYear}
          </p>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <select
            value={currentPayrollMonth}
            onChange={handleMonthChange}
            className="appearance-none pl-9 pr-8 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-[10%] right-[10%] h-px bg-stone-200" />
          {currentRun && (
            <div
              className="absolute top-5 left-[10%] h-px bg-teal-500 transition-all duration-500"
              style={{ width: `${Math.min(currentStageIndex / (STAGES.length - 1), 1) * 80}%` }}
            />
          )}

          {STAGES.map((stage, i) => {
            const isCompleted = currentRun ? i < currentStageIndex : false;
            const isCurrent = currentRun ? i === currentStageIndex : false;
            const isPending = currentRun ? i > currentStageIndex : true;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted && 'bg-teal-600 border-teal-600 text-white',
                    isCurrent && 'bg-white border-teal-600 text-teal-600 ring-4 ring-teal-100',
                    isPending && 'bg-stone-50 border-stone-200 text-stone-400',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 font-medium text-center',
                    isCompleted && 'text-teal-700',
                    isCurrent && 'text-teal-700',
                    isPending && 'text-stone-400',
                  )}
                >
                  {stage.label}
                </span>
                <span className="text-[10px] mt-0.5">
                  {isCompleted && <span className="text-teal-600">✓ Completed</span>}
                  {isCurrent && <span className="text-teal-600 font-semibold">● Current</span>}
                  {isPending && <span className="text-stone-400">○ Pending</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── No Payroll State ───────────────────────────────────────── */}
      {!currentRun && (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">No Payroll Initiated</h3>
          <p className="text-sm text-stone-500 mb-6">
            Payroll for {getMonthName(currentPayrollMonth)} {currentPayrollYear} has not been started yet.
          </p>
          <button
            onClick={handleStartPayroll}
            className="px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Start Payroll
          </button>
        </div>
      )}

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      {currentRun && (
        <>
          <div className="grid grid-cols-5 gap-4">
            <SummaryCard
              icon={Users}
              label="Total Employees"
              value={String(currentRun.totalEmployees)}
              color="text-teal-600 bg-teal-50"
            />
            <SummaryCard
              icon={IndianRupee}
              label="Gross Salary"
              value={formatCurrency(currentRun.totalGross)}
              color="text-blue-600 bg-blue-50"
            />
            <SummaryCard
              icon={TrendingDown}
              label="Total Deductions"
              value={formatCurrency(currentRun.totalDeductions)}
              color="text-orange-600 bg-orange-50"
            />
            <SummaryCard
              icon={IndianRupee}
              label="Net Salary"
              value={formatCurrency(currentRun.totalNet)}
              color="text-emerald-600 bg-emerald-50"
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Exceptions"
              value={String(currentRun.exceptionsCount)}
              color={currentRun.exceptionsCount > 0 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}
            />
          </div>

          {/* ── Employee Payroll Table ────────────────────────────────── */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200">
              <h2 className="text-base font-semibold text-stone-900">Employee Payroll Details</h2>
              <p className="text-xs text-stone-500 mt-0.5">{sortedItems.length} employees · Click a row to view salary breakdown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Employee</th>
                    <th className="text-left px-4 py-3 font-medium">Department</th>
                    <th className="text-right px-4 py-3 font-medium">Basic</th>
                    <th className="text-right px-4 py-3 font-medium">Gross</th>
                    <th className="text-right px-4 py-3 font-medium">Deductions</th>
                    <th className="text-right px-4 py-3 font-medium">Net</th>
                    <th className="text-center px-4 py-3 font-medium">LOP Days</th>
                    <th className="text-center px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sortedItems.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-stone-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="font-medium text-stone-900">{item.employeeName}</div>
                        <div className="text-xs text-stone-400">{item.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{item.department}</td>
                      <td className="px-4 py-3 text-right text-stone-700 tabular-nums">{formatCurrency(item.basicSalary)}</td>
                      <td className="px-4 py-3 text-right text-stone-700 tabular-nums">{formatCurrency(item.grossSalary)}</td>
                      <td className="px-4 py-3 text-right text-stone-700 tabular-nums">{formatCurrency(item.totalDeductions)}</td>
                      <td className="px-4 py-3 text-right font-medium text-stone-900 tabular-nums">{formatCurrency(item.netSalary)}</td>
                      <td className="px-4 py-3 text-center">
                        {item.lossOfPayDays > 0 ? (
                          <span className="text-amber-600 font-medium">{item.lossOfPayDays}</span>
                        ) : (
                          <span className="text-stone-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border', getStatusColor(item.status))}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {currentRun.status === 'draft' && (
              <button
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: 'Calculating Payroll',
                    message: 'Payroll calculations are being processed.',
                  });
                }}
                className="px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Calculator className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                Calculate Payroll
              </button>
            )}
            {currentRun.status === 'review' && (
              <button
                onClick={() => setShowConfirmDialog('approve')}
                className="px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                Approve Payroll
              </button>
            )}
            {currentRun.status === 'approved' && (
              <button
                onClick={() => setShowConfirmDialog('process')}
                className="px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                Process Payroll
              </button>
            )}
            {currentRun.status === 'processed' && (
              <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Payroll Processed
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Salary Detail Drawer ─────────────────────────────────────── */}
      {selectedItem && (
        <SalaryDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* ── Confirmation Dialog ──────────────────────────────────────── */}
      {showConfirmDialog && (
        <ConfirmDialog
          type={showConfirmDialog}
          runMonth={`${getMonthName(currentPayrollMonth)} ${currentPayrollYear}`}
          employeeCount={currentRun?.totalEmployees ?? 0}
          netAmount={currentRun?.totalNet ?? 0}
          onConfirm={showConfirmDialog === 'approve' ? handleApprove : handleProcess}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}
    </div>
  );
}

/* ─── Summary Card Component ───────────────────────────────────────────────── */
function SummaryCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-stone-500">{label}</p>
          <p className="text-base font-semibold text-stone-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Salary Detail Drawer ─────────────────────────────────────────────────── */
function SalaryDrawer({ item, onClose }: { item: PayrollItem; onClose: () => void }) {
  const grossBeforeLOP = item.basicSalary + item.hra + item.conveyance + item.specialAllowance + item.otherEarnings + item.bonus + item.overtime;

  const earnings = [
    { name: 'Basic Salary', amount: item.basicSalary },
    { name: 'House Rent Allowance', amount: item.hra },
    { name: 'Conveyance Allowance', amount: item.conveyance },
    { name: 'Special Allowance', amount: item.specialAllowance },
    ...(item.otherEarnings > 0 ? [{ name: 'Other Earnings', amount: item.otherEarnings }] : []),
    ...(item.bonus > 0 ? [{ name: 'Bonus', amount: item.bonus }] : []),
    ...(item.overtime > 0 ? [{ name: 'Overtime', amount: item.overtime }] : []),
  ];

  const deductions = [
    { name: 'Employee PF (12% capped)', amount: item.pfDeduction },
    { name: 'Professional Tax (PT)', amount: item.professionalTax },
    ...(item.tds > 0 ? [{ name: 'TDS (Income Tax)', amount: item.tds }] : []),
    ...(item.esiDeduction > 0 ? [{ name: 'ESI (0.75%)', amount: item.esiDeduction }] : []),
    ...(item.otherDeductions > 0 ? [{ name: 'Other Deductions', amount: item.otherDeductions }] : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">Salary Calculation Audit</h3>
            <p className="text-xs text-stone-500">Reconciled line-item formula breakdown</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Employee Info */}
          <div className="bg-stone-50 rounded-lg p-4">
            <h4 className="text-base font-semibold text-stone-900">{item.employeeName}</h4>
            <p className="text-sm text-stone-500 mt-0.5">{item.employeeCode} · {item.designation}</p>
            <p className="text-sm text-stone-500">{item.department}</p>
          </div>

          {/* Attendance */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-lg p-3 text-center">
              <p className="text-xs text-stone-500">Working Days</p>
              <p className="text-lg font-semibold text-stone-900">{item.workingDays}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-3 text-center">
              <p className="text-xs text-stone-500">Present Days</p>
              <p className="text-lg font-semibold text-stone-900">{item.presentDays}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-3 text-center">
              <p className="text-xs text-stone-500">LOP Days</p>
              <p className={cn('text-lg font-semibold', item.lossOfPayDays > 0 ? 'text-amber-600' : 'text-stone-900')}>
                {item.lossOfPayDays}
              </p>
            </div>
          </div>

          {/* Earnings Table */}
          <div>
            <h5 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Earnings Components</h5>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-stone-100">
                  {earnings.map(e => (
                    <tr key={e.name}>
                      <td className="px-4 py-2.5 text-stone-700">{e.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-stone-900">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  {item.lopDeduction > 0 && (
                    <tr className="bg-amber-50/50 text-amber-800">
                      <td className="px-4 py-2 text-xs">
                        Less: Loss of Pay ({item.lossOfPayDays} days @ {formatCurrency(Math.round(grossBeforeLOP / item.workingDays))}/day)
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums font-mono text-xs">
                        -{formatCurrency(item.lopDeduction)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-stone-50 font-semibold border-t border-stone-200">
                    <td className="px-4 py-2.5 text-stone-900">Earned Gross Salary</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-stone-900">{formatCurrency(item.grossSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions Table */}
          <div>
            <h5 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Statutory Deductions</h5>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-stone-100">
                  {deductions.map(d => (
                    <tr key={d.name}>
                      <td className="px-4 py-2.5 text-stone-700">{d.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-red-600">-{formatCurrency(d.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50 font-semibold border-t border-stone-200">
                    <td className="px-4 py-2.5 text-stone-900">Total Statutory Deductions</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-red-600">-{formatCurrency(item.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Net Salary Footer */}
        <div className="border-t border-stone-200 px-6 py-4 bg-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-teal-100 block">Net Payable Amount</span>
              <span className="text-[11px] text-teal-200">Earned Gross minus Total Deductions</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">{formatCurrency(item.netSalary)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Confirmation Dialog ──────────────────────────────────────────────────── */
function ConfirmDialog({ type, runMonth, employeeCount, netAmount, onConfirm, onCancel }: {
  type: 'approve' | 'process';
  runMonth: string;
  employeeCount: number;
  netAmount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isApprove = type === 'approve';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isApprove ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600',
          )}>
            {isApprove ? <ShieldCheck className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              {isApprove ? 'Approve Payroll' : 'Process Payroll'}
            </h3>
            <p className="text-xs text-stone-500">{runMonth}</p>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-4">
          {isApprove
            ? `You are about to approve the payroll for ${employeeCount} employees with a total net payout of ${formatCurrency(netAmount)}. This will move the payroll to the processing stage.`
            : `You are about to process the payroll for ${employeeCount} employees. Total net amount of ${formatCurrency(netAmount)} will be disbursed. This action cannot be undone.`
          }
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
              isApprove ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            {isApprove ? 'Yes, Approve' : 'Yes, Process'}
          </button>
        </div>
      </div>
    </div>
  );
}
