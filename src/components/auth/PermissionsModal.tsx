import { Check, X, Shield, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { useStore } from '../../store';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const permissions = [
  {
    category: 'Payroll & Operations',
    capabilities: [
      { name: 'Initiate Monthly Payroll Cycle', hr: true, emp: false, note: 'Trigger calculations and recalculate attendance' },
      { name: 'Approve & Finalize Disbursements', hr: true, emp: false, note: 'Dual-tier sign-off and state locking' },
      { name: 'Resolve Pre-Payroll Diagnostics', hr: true, emp: false, note: 'Fix missing bank IFSC, PAN, or LOP exceptions' },
      { name: 'Configure Salary Templates & Components', hr: true, emp: false, note: 'Basic, HRA, statutory PF caps, PT slabs' },
      { name: 'Executive Reports & Analytics', hr: true, emp: false, note: 'Department costs, 4-month spend trend, CTC distribution' },
    ],
  },
  {
    category: 'Employee Records & Directory',
    capabilities: [
      { name: 'Create & Onboard New Employees', hr: true, emp: false, note: 'Assign designation, salary template, and bank IFSC' },
      { name: 'View All Employees’ Bank & Tax Details', hr: true, emp: false, note: 'Confidential account numbers and PAN info' },
      { name: 'Access Colleague Directory', hr: true, emp: true, note: 'Employees see role & department; financial data masked' },
      { name: 'Edit Personal Contact Information', hr: true, emp: true, note: 'Employees can update address and phone' },
    ],
  },
  {
    category: 'Self-Service & Statements',
    capabilities: [
      { name: 'Download Personal PDF Payslips', hr: true, emp: true, note: 'Compliant monthly statements with official branding' },
      { name: 'Inspect Line-Item Salary Breakdown', hr: true, emp: true, note: 'Full transparency on take-home vs deductions' },
      { name: 'Submit Time-Off & Leave Applications', hr: true, emp: true, note: 'Casual, Sick, and Earned leave requests' },
      { name: 'View Company Announcements & Policies', hr: true, emp: true, note: 'Diwali bonus notices, holiday calendar' },
    ],
  },
];

export default function PermissionsModal({ isOpen, onClose }: PermissionsModalProps) {
  const { userRole, switchRole } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-meridian-600 flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Role-Based Access Control (RBAC) Matrix
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-meridian-300 border border-white/10">
                  Enterprise Security
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Current Active Session: <strong className="text-white capitalize">{userRole === 'hr_admin' ? 'HR Administrator' : 'Employee Self-Service'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
              <span>
                Meridian enforces strict segregation of duties conforming to <strong>ISO 27001</strong> and the <strong>Digital Personal Data Protection (DPDP) Act</strong>.
              </span>
            </div>
            <button
              onClick={() => {
                switchRole(userRole === 'hr_admin' ? 'employee' : 'hr_admin');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors shadow-2xs whitespace-nowrap self-end sm:self-auto"
            >
              <UserCheck size={13} className="text-meridian-600" />
              Switch to {userRole === 'hr_admin' ? 'Employee' : 'HR Admin'}
            </button>
          </div>

          {permissions.map((sec) => (
            <div key={sec.category} className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center text-xs font-bold text-stone-800 uppercase tracking-wider">
                <span>{sec.category}</span>
                <div className="grid grid-cols-2 gap-4 text-center w-40">
                  <span className="text-meridian-800">HR Admin</span>
                  <span className="text-stone-600">Employee</span>
                </div>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {sec.capabilities.map((cap) => (
                  <div key={cap.name} className="px-4 py-3 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                    <div className="pr-4">
                      <span className="font-semibold text-stone-900 block">{cap.name}</span>
                      <span className="text-[11px] text-stone-500 block mt-0.5">{cap.note}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-40 flex-shrink-0 text-center items-center">
                      {/* HR Column */}
                      <div className="flex justify-center">
                        {cap.hr ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                            <X size={12} />
                          </div>
                        )}
                      </div>

                      {/* Employee Column */}
                      <div className="flex justify-center">
                        {cap.emp ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center" title="Restricted to HR">
                            <Lock size={11} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-stone-500">
            Green check = Permitted & active • Amber lock = Confidential & restricted to administrators
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-meridian-600 text-white rounded-lg text-xs font-semibold hover:bg-meridian-700 transition-colors shadow-2xs"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}

