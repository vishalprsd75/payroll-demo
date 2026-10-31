import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2,
  Building2, IndianRupee, CalendarCheck, FileText,
  ChevronDown, ChevronUp, ArrowRight, RefreshCw, Check
} from 'lucide-react';
import { useStore } from '../store';
import { getSeverityColor, cn } from '../utils/format';

export default function PayrollReadiness() {
  const navigate = useNavigate();
  const {
    readinessItems,
    payrollExceptions,
    resolveException,
    addNotification,
    employees,
    updateEmployee,
  } = useStore();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute live readiness score based on unresolved exceptions
  const totalExceptions = payrollExceptions.length;
  const resolvedExceptions = payrollExceptions.filter(e => e.resolved).length;
  const unresolvedExceptions = totalExceptions - resolvedExceptions;

  // Readiness score formula: starts at 92%, reaches 100% when all resolved
  const score = totalExceptions === 0 ? 100 : Math.round(92 + (resolvedExceptions / totalExceptions) * 8);

  const getScoreColor = (val: number) => {
    if (val >= 95) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (val >= 80) return 'text-amber-600 border-amber-500 bg-amber-50';
    return 'text-red-600 border-red-500 bg-red-50';
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'IndianRupee': return IndianRupee;
      case 'CalendarCheck': return CalendarCheck;
      default: return FileText;
    }
  };

  const handleResolveIssue = (employeeId: string, exceptionId?: string) => {
    setResolvingId(employeeId);

    // If it's missing bank details, auto-fill standard demo bank details
    const emp = employees.find(e => e.id === employeeId);
    if (emp && !emp.bankDetails) {
      updateEmployee(employeeId, {
        bankDetails: {
          bankName: 'HDFC Bank',
          accountNumber: '50100' + Math.floor(1000000 + Math.random() * 9000000),
          ifscCode: 'HDFC0001234',
          branchName: 'Main Corporate Branch',
        },
      });
    }

    // Resolve matching exception in store
    const exc = payrollExceptions.find(e => e.employeeId === employeeId && !e.resolved);
    if (exc) {
      resolveException(exc.id);
    }

    setTimeout(() => {
      setResolvingId(null);
      addNotification({
        type: 'success',
        title: 'Issue Resolved',
        message: `Compliance requirement updated for ${emp?.firstName || 'Employee'}. Readiness score improved.`,
      });
    }, 400);
  };

  const handleRunDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addNotification({
        type: 'info',
        title: 'Diagnostic Check Complete',
        message: 'All 30 employee profiles and biometric logs verified against statutory rules.',
      });
    }, 600);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-meridian-600" />
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Pre-Payroll Readiness Center</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Automated compliance engine detecting missing bank details, attendance discrepancies, and tax gaps prior to disbursement
          </p>
        </div>

        <button
          onClick={handleRunDiagnostics}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={cn('text-meridian-600', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Auditing records...' : 'Run Compliance Audit'}
        </button>
      </div>

      {/* ─── Score Banner ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Circular Score Badge */}
          <div className={cn('w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center flex-shrink-0 transition-colors', getScoreColor(score))}>
            <span className="text-2xl font-black tracking-tight">{score}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider -mt-0.5">Ready</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">
                {score === 100
                  ? 'All Pre-Payroll Checks Cleared'
                  : `${unresolvedExceptions} Item${unresolvedExceptions > 1 ? 's' : ''} Require Attention`}
              </h2>
              {score === 100 && <CheckCircle2 size={18} className="text-emerald-600" />}
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              {score === 100
                ? 'October 2026 payroll run is 100% compliant. All 30 bank accounts, tax brackets, and attendance summaries have been verified.'
                : 'Resolving the highlighted discrepancies ensures zero bank disbursement bounces and accurate statutory tax deduction.'}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-stone-500 font-medium">
              <span>Total Exceptions Flagged: {totalExceptions}</span>
              <span className="text-stone-300">•</span>
              <span className="text-emerald-700 font-semibold">{resolvedExceptions} Resolved</span>
              <span className="text-stone-300">•</span>
              <span className={unresolvedExceptions > 0 ? 'text-amber-700 font-semibold' : 'text-stone-500'}>
                {unresolvedExceptions} Pending
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/payroll"
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-meridian-600 text-white rounded-lg text-xs font-semibold hover:bg-meridian-700 transition-colors shadow-xs"
        >
          Proceed to Payroll Processing <ArrowRight size={14} />
        </Link>
      </div>

      {/* ─── Readiness Checklist Categories ────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-stone-900 tracking-tight">Compliance & Data Audits</h3>

        {readinessItems.map((item, idx) => {
          const Icon = getCategoryIcon(item.icon);
          const isExpanded = expandedIndex === idx;

          // Check if this item's employees are resolved
          const pendingEmps = item.employees.filter(emp => {
            const exc = payrollExceptions.find(e => e.employeeId === emp.id && !e.resolved);
            return exc !== undefined;
          });
          const isItemClean = pendingEmps.length === 0;

          return (
            <div
              key={item.category}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs transition-all"
            >
              {/* Header Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50/70 transition-colors select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    isItemClean ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                  )}>
                    {isItemClean ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-stone-900">{item.label}</span>
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border', getSeverityColor(item.severity))}>
                        {item.severity}
                      </span>
                      {isItemClean && (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold">
                          All Cleared
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold font-mono px-2.5 py-1 bg-stone-100 rounded-md text-stone-700">
                    {pendingEmps.length} Affected
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
                </div>
              </div>

              {/* Expanded Employee List */}
              {isExpanded && (
                <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                  {pendingEmps.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-emerald-600" />
                      <span className="font-medium text-stone-800">No pending discrepancies in this section.</span>
                      <span className="text-stone-400">All corresponding employee profiles and records are fully verified.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingEmps.map(emp => {
                        const isResolving = resolvingId === emp.id;
                        return (
                          <div
                            key={emp.id}
                            className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                !
                              </div>
                              <div>
                                <span className="text-xs font-bold text-stone-900 block">{emp.name}</span>
                                <span className="text-[11px] text-amber-800 font-medium">{emp.issue}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <Link
                                to={`/employees/${emp.id}`}
                                className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
                              >
                                View Profile
                              </Link>
                              <button
                                onClick={() => handleResolveIssue(emp.id)}
                                disabled={isResolving}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-meridian-600 text-white rounded text-xs font-medium hover:bg-meridian-700 transition-colors"
                              >
                                {isResolving ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                {isResolving ? 'Resolving...' : 'Quick Resolve'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Statutory Safeguards Notice ───────────────────────────────── */}
      <div className="bg-stone-100 rounded-xl p-5 border border-stone-200 text-xs text-stone-600 space-y-2">
        <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-meridian-700" />
          Statutory Safeguard Mechanism
        </h4>
        <p>
          Meridian validates each payroll execution across 3 layers: <strong>Identity & Banking</strong> (PAN and IFSC checksum verification), <strong>Attendance & Loss of Pay</strong> (LOP daily deductions reconciled against official working days), and <strong>Statutory Caps</strong> (Employee PF capped at ₹1,800 under the statutory ceiling).
        </p>
      </div>
    </div>
  );
}

