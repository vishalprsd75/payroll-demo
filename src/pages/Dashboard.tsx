// ─── Meridian – Payroll Command Center (Dashboard) ───────────────────────────
import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  CheckCircle2, Circle, AlertTriangle, ArrowRight,
  Users, Building2, IndianRupee, CalendarCheck,
  Clock, Bell, ChevronRight, FileText, Ban,
} from 'lucide-react';
import { useStore } from '../store';
import {
  formatCurrency, formatRelativeTime, getMonthName, cn, getSeverityColor,
} from '../utils/format';

// ─── Stage Pipeline ──────────────────────────────────────────────────────────
const STAGES: { key: string; label: string }[] = [
  { key: 'attendance_review', label: 'Attendance' },
  { key: 'calculation', label: 'Calculation' },
  { key: 'hr_review', label: 'HR Review' },
  { key: 'approval', label: 'Approval' },
  { key: 'processed', label: 'Processed' },
];

function stageIndex(stage: string): number {
  return STAGES.findIndex((s) => s.key === stage);
}

function PayrollPipeline({ currentStage }: { currentStage: string }) {
  const currentIdx = stageIndex(currentStage);

  return (
    <div className="flex items-center w-full gap-1">
      {STAGES.map((stage, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <div key={stage.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              {/* Dot / Check */}
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                  isCompleted && 'bg-teal-600 text-white',
                  isCurrent && 'bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse',
                  isFuture && 'bg-stone-100 text-stone-400 border border-stone-200',
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] mt-1.5 font-medium text-center truncate w-full',
                  isCompleted && 'text-teal-700',
                  isCurrent && 'text-teal-700 font-semibold',
                  isFuture && 'text-stone-400',
                )}
              >
                {stage.label}
              </span>
            </div>
            {/* Connector line */}
            {idx < STAGES.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-full -mt-5 mx-0.5',
                  idx < currentIdx ? 'bg-teal-500' : 'bg-stone-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Severity dot ────────────────────────────────────────────────────────────
function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-500',
    critical: 'bg-red-600',
    medium: 'bg-amber-500',
    low: 'bg-blue-400',
  };
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full flex-shrink-0',
        colors[severity] ?? 'bg-stone-400',
      )}
    />
  );
}

// ─── Activity icon ───────────────────────────────────────────────────────────
function activityIcon(type: string) {
  switch (type) {
    case 'payroll_processed': return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
    case 'payroll_approved': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'salary_revised': return <IndianRupee className="w-4 h-4 text-amber-600" />;
    case 'employee_added': return <Users className="w-4 h-4 text-blue-600" />;
    case 'exception_resolved': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'leave_approved': return <CalendarCheck className="w-4 h-4 text-violet-600" />;
    default: return <Circle className="w-4 h-4 text-stone-400" />;
  }
}

// ─── Custom Recharts Tooltip ─────────────────────────────────────────────────
function DeptTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { name: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-stone-800">{payload[0].payload.name}</p>
      <p className="text-stone-500">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

// ─── Announcement type badge ─────────────────────────────────────────────────
function AnnouncementBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    info: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
    urgent: 'bg-red-50 text-red-700',
  };
  return (
    <span className={cn('text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded', styles[type] ?? styles.info)}>
      {type}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const currentUser = useStore((s) => s.currentUser);
  const userRole = useStore((s) => s.userRole);
  const employees = useStore((s) => s.employees);
  const payrollRuns = useStore((s) => s.payrollRuns);
  const payrollExceptions = useStore((s) => s.payrollExceptions);
  const activities = useStore((s) => s.activities);
  const announcements = useStore((s) => s.announcements);
  const leaveRequests = useStore((s) => s.leaveRequests);
  const departments = useStore((s) => s.departments);
  const readinessItems = useStore((s) => s.readinessItems);
  const approveLeave = useStore((s) => s.approveLeave);
  const rejectLeave = useStore((s) => s.rejectLeave);
  const currentPayrollMonth = useStore((s) => s.currentPayrollMonth);
  const currentPayrollYear = useStore((s) => s.currentPayrollYear);

  // Employee role → redirect
  if (userRole === 'employee') {
    return <Navigate to="/self-service" replace />;
  }

  // Current payroll run
  const currentRun = payrollRuns.find(
    (r) => r.month === currentPayrollMonth && r.year === currentPayrollYear,
  );

  // Active employees
  const activeEmployees = employees.filter(
    (e) => e.status === 'active' || e.status === 'probation',
  );

  // Unresolved exceptions
  const unresolvedExceptions = payrollExceptions.filter((e) => !e.resolved);

  // Pending leave requests
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser?.name.split(' ')[0] ?? '';

  // Department payroll breakdown
  const deptData = useMemo(() => {
    if (!currentRun) return [];
    const map = new Map<string, number>();
    currentRun.items.forEach((item) => {
      const prev = map.get(item.department) ?? 0;
      map.set(item.department, prev + item.netSalary);
    });
    return departments
      .map((d) => ({
        name: d.name.replace(' & ', ' & '),
        amount: map.get(d.name) ?? 0,
        color: d.color,
      }))
      .filter((d) => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [currentRun, departments]);

  // Action items (contextual, actionable)
  const actionItems = useMemo(() => {
    const items: {
      id: string;
      severity: string;
      text: string;
      detail: string;
      link?: string;
      actions?: { label: string; onClick: () => void; variant: 'primary' | 'secondary' }[];
    }[] = [];

    // Missing bank details
    const bankIssues = readinessItems.find((r) => r.category === 'Bank Details');
    if (bankIssues && bankIssues.count > 0) {
      items.push({
        id: 'bank',
        severity: 'high',
        text: `${bankIssues.count} employee${bankIssues.count > 1 ? 's' : ''} missing bank details`,
        detail: bankIssues.employees.map((e) => e.name).join(', '),
        link: '/employees',
      });
    }

    // Salary structure issues
    const salaryIssues = readinessItems.find((r) => r.category === 'Salary Structure');
    if (salaryIssues && salaryIssues.count > 0) {
      items.push({
        id: 'salary',
        severity: 'medium',
        text: `${salaryIssues.count} salary structure${salaryIssues.count > 1 ? 's' : ''} needs confirmation`,
        detail: salaryIssues.employees.map((e) => e.name).join(', '),
        link: '/employees',
      });
    }

    // Pending leaves
    pendingLeaves.forEach((lr) => {
      const emp = employees.find((e) => e.id === lr.employeeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
      items.push({
        id: `leave-${lr.id}`,
        severity: 'medium',
        text: `Leave request from ${empName}`,
        detail: `${lr.days} day${lr.days > 1 ? 's' : ''} ${lr.leaveType} leave · ${lr.reason}`,
        actions: [
          {
            label: 'Approve',
            variant: 'primary',
            onClick: () => approveLeave(lr.id),
          },
          {
            label: 'Reject',
            variant: 'secondary',
            onClick: () => rejectLeave(lr.id),
          },
        ],
      });
    });

    return items;
  }, [readinessItems, pendingLeaves, employees, approveLeave, rejectLeave]);

  // Recent activities (last 5)
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            Payroll Command Center
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {greeting}, {firstName} ·{' '}
            <span className="text-stone-400">
              {getMonthName(currentPayrollMonth)} {currentPayrollYear}
            </span>
          </p>
        </div>
        <Link
          to="/payroll"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
        >
          View payroll details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Two-column layout ────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LEFT COLUMN ──────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ── Payroll Status Banner ─────────────────────── */}
          {currentRun && (
            <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-stone-900">
                      {getMonthName(currentRun.month)} {currentRun.year} Payroll
                    </h2>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {currentRun.stage.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {currentRun.totalEmployees} employees · Readiness{' '}
                    <span className="font-semibold text-stone-700">{currentRun.readinessScore}%</span>
                  </p>
                </div>
                <Link
                  to="/payroll"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Review Payroll
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Readiness bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                  <span>Readiness</span>
                  <span className="font-semibold text-stone-700">{currentRun.readinessScore}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${currentRun.readinessScore}%` }}
                  />
                </div>
              </div>

              {/* Pipeline */}
              <PayrollPipeline currentStage={currentRun.stage} />
            </div>
          )}

          {/* ── Action Items ──────────────────────────────── */}
          {actionItems.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="text-sm font-semibold text-stone-900">Action Required</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {actionItems.length} item{actionItems.length > 1 ? 's' : ''} need your attention
                </p>
              </div>
              <ul className="divide-y divide-stone-100">
                {actionItems.map((item) => (
                  <li key={item.id} className="px-5 py-3.5 flex items-start gap-3">
                    <SeverityDot severity={item.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">{item.text}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.actions ? (
                        item.actions.map((action) => (
                          <button
                            key={action.label}
                            onClick={action.onClick}
                            className={cn(
                              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                              action.variant === 'primary'
                                ? 'bg-teal-600 text-white hover:bg-teal-700'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                            )}
                          >
                            {action.label}
                          </button>
                        ))
                      ) : item.link ? (
                        <Link
                          to={item.link}
                          className="text-xs font-medium text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 transition-colors"
                        >
                          Resolve
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Payroll Summary Table ─────────────────────── */}
          {currentRun && (
            <div className="bg-white border border-stone-200 rounded-xl">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="text-sm font-semibold text-stone-900">
                  Payroll Summary — {getMonthName(currentRun.month)} {currentRun.year}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100">
                {[
                  { label: 'Total Employees', value: String(currentRun.totalEmployees), plain: true },
                  { label: 'Gross Salary', value: formatCurrency(currentRun.totalGross) },
                  { label: 'Deductions', value: formatCurrency(currentRun.totalDeductions) },
                  { label: 'Net Payable', value: formatCurrency(currentRun.totalNet), highlight: true },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-4">
                    <p className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-1">
                      {stat.label}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-semibold tracking-tight',
                        stat.highlight ? 'text-teal-700' : 'text-stone-900',
                      )}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Department Breakdown ──────────────────────── */}
          {deptData.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="text-sm font-semibold text-stone-900">Department Breakdown</h2>
                <p className="text-xs text-stone-400 mt-0.5">Net salary by department</p>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={deptData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
                    barCategoryGap="20%"
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 12, fill: '#78716c' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<DeptTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {deptData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (Sidebar) ───────────────────────── */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* ── Quick Stats ───────────────────────────────── */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-sm text-stone-600">Active Employees</span>
                </div>
                <span className="text-sm font-semibold text-stone-900">{activeEmployees.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm text-stone-600">Payroll Month</span>
                </div>
                <span className="text-sm font-semibold text-stone-900">
                  {getMonthName(currentPayrollMonth).slice(0, 3)} {currentPayrollYear}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm text-stone-600">Open Exceptions</span>
                </div>
                <span className="text-sm font-semibold text-stone-900">{unresolvedExceptions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-sm text-stone-600">Pending Leaves</span>
                </div>
                <span className="text-sm font-semibold text-stone-900">{pendingLeaves.length}</span>
              </div>
            </div>
          </div>

          {/* ── Recent Activity ────────────────────────────── */}
          <div className="bg-white border border-stone-200 rounded-xl">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Recent Activity
              </h3>
              <Link
                to="/payroll"
                className="text-[11px] font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                View all
              </Link>
            </div>
            {recentActivities.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-stone-400">
                No recent activity
              </div>
            ) : (
              <ul className="divide-y divide-stone-50">
                {recentActivities.map((act) => (
                  <li key={act.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{activityIcon(act.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-700 leading-snug">{act.description}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {formatRelativeTime(act.timestamp)} · {act.user}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Announcements / Upcoming ────────────────── */}
          <div className="bg-white border border-stone-200 rounded-xl">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Upcoming & Announcements
              </h3>
            </div>
            {announcements.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-stone-400">
                No announcements
              </div>
            ) : (
              <ul className="divide-y divide-stone-50">
                {announcements.map((ann) => (
                  <li key={ann.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <AnnouncementBadge type={ann.type} />
                      <span className="text-[11px] text-stone-400">
                        {formatRelativeTime(ann.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-stone-800 leading-snug">{ann.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{ann.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
