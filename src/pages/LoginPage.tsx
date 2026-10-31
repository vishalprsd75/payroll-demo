// ─── Meridian – Login / Demo Selection Page ──────────────────────────────────
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { demoUsers } from '../data';
import { cn, getInitials } from '../utils/format';
import {
  Shield, Users, Calculator, ArrowRight,
  Sparkles, UserCircle,
} from 'lucide-react';

const valueProps = [
  { icon: Calculator, text: 'Complete payroll automation' },
  { icon: Users, text: 'Transparent salary calculations' },
  { icon: Shield, text: 'Employee self-service portal' },
];

const demoAccounts = [
  {
    user: demoUsers[0],
    label: 'HR Admin',
    sublabel: 'Full payroll management access',
    gradient: 'from-teal-600 to-teal-700',
    ring: 'ring-teal-200',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    user: demoUsers[1],
    label: 'Employee',
    sublabel: 'Self-service portal access',
    gradient: 'from-amber-500 to-amber-600',
    ring: 'ring-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
  },
];

export default function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = (index: number) => {
    const user = demoUsers[index];
    login(user);
    if (user.role === 'employee') {
      navigate('/self-service');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Demo mode indicator */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-stone-500 bg-white border border-stone-200 rounded-full shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Demo Mode
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row lg:items-center lg:gap-20 gap-12">
          {/* ── Left: Branding ─────────────────────────────── */}
          <div className="flex-1 lg:max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl leading-none">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
                  Meridian
                </h1>
                <p className="text-xs text-stone-400 tracking-wide uppercase">
                  Payroll Management
                </p>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight leading-tight mb-4">
              Precision Payroll,{' '}
              <span className="text-teal-600">Simplified.</span>
            </h2>
            <p className="text-stone-500 text-base leading-relaxed mb-8">
              A modern payroll platform built for Indian businesses.
              Manage salary processing, compliance, and employee
              self-service — all in one place.
            </p>

            {/* Value props */}
            <ul className="space-y-4">
              {valueProps.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-sm text-stone-600 font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: Demo Cards ─────────────────────────── */}
          <div className="flex-1 lg:max-w-md">
            <p className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-5">
              Select a demo account
            </p>

            <div className="space-y-4">
              {demoAccounts.map((account, idx) => (
                <button
                  key={account.user.id}
                  onClick={() => handleLogin(idx)}
                  className={cn(
                    'group w-full text-left bg-white border border-stone-200 rounded-xl p-5',
                    'hover:border-stone-300 hover:shadow-md transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    `focus:${account.ring}`,
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                        account.iconBg,
                      )}
                    >
                      <UserCircle className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded',
                            idx === 0
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200',
                          )}
                        >
                          {account.label}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-stone-900 mt-1">
                        {account.user.name}
                      </p>
                      <p className="text-sm text-stone-400 truncate">
                        {account.user.email}
                      </p>
                      <p className="text-xs text-stone-400 mt-1.5">
                        {account.sublabel}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center self-center">
                      <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-stone-400 text-center mt-6">
              No credentials required. Click a card to explore.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-stone-400 border-t border-stone-100">
        © 2026 Meridian Payroll Systems · Demo Environment
      </footer>
    </div>
  );
}
