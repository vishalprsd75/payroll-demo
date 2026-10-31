import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, UserCheck, ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '../../store';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  moduleName?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  moduleName = 'This administrative module',
}: ProtectedRouteProps) {
  const { userRole, currentUser, switchRole } = useStore();

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="p-8 max-w-3xl mx-auto my-12 animate-slide-up">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Top Banner */}
          <div className="bg-stone-900 text-white p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                  Access Restricted
                </span>
                <span className="text-xs font-mono text-stone-400">Error 403: Forbidden</span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">
                HR Administrator Privileges Required
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                {moduleName} contains sensitive financial, salary structure, and bank disbursement controls restricted to the HR & Finance operations team.
              </p>
            </div>
          </div>

          {/* Context & Boundary Explanation */}
          <div className="p-6 space-y-6">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  Current Authenticated Session
                </span>
                <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                  {currentUser?.name || 'Active User'}
                </span>
                <span className="text-xs text-stone-500">
                  Assigned Role: <strong className="capitalize text-amber-700 font-semibold">{userRole}</strong> (Employee Self-Service)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchRole('hr_admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-meridian-600 text-white rounded-lg text-xs font-semibold hover:bg-meridian-700 transition-colors shadow-2xs"
                >
                  <UserCheck size={13} />
                  Switch to HR Admin
                </button>
              </div>
            </div>

            {/* Why this is blocked */}
            <div>
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock size={14} className="text-stone-500" />
                Enforced Role-Based Access Controls (RBAC)
              </h3>
              <ul className="text-xs text-stone-600 space-y-2 border border-stone-200 rounded-lg p-3.5 bg-stone-50/50">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Employees can only access personal salary breakdowns, their own tax statements, and self leave balances.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Access to company-wide compensation grades, batch disbursement triggers, and colleague records is restricted by corporate privacy policies.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <Link
                to="/self-service"
                className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <ArrowLeft size={14} /> Return to Employee Portal
              </Link>

              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" /> Meridian RBAC Active
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

