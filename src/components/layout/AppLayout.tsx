// ─── Meridian – App Layout with Navigation Rail ─────────────────────────────
import { type ReactNode, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, IndianRupee, CalendarClock,
  ShieldCheck, FileText, BarChart3, UserCircle,
  LogOut, RotateCcw, ChevronLeft, ChevronRight, Menu,
  Shield, Lock,
} from 'lucide-react';
import { useStore } from '../../store';
import { cn, getInitials } from '../../utils/format';
import type { UserRole } from '../../types';
import PermissionsModal from '../auth/PermissionsModal';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, userRole, switchRole, logout, resetDemo, sidebarCollapsed, toggleSidebar } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  // Role-based navigation items
  const hrNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Command Center', shortLabel: 'Home' },
    { to: '/employees', icon: Users, label: 'Employees', shortLabel: 'People' },
    { to: '/salary-structures', icon: IndianRupee, label: 'Salary Structures', shortLabel: 'Salary' },
    { to: '/payroll', icon: CalendarClock, label: 'Payroll Processing', shortLabel: 'Payroll' },
    { to: '/payroll-readiness', icon: ShieldCheck, label: 'Payroll Readiness', shortLabel: 'Readiness' },
    { to: '/payslips', icon: FileText, label: 'Payslips', shortLabel: 'Payslips' },
    { to: '/reports', icon: BarChart3, label: 'Reports', shortLabel: 'Reports' },
    { to: '/self-service', icon: UserCircle, label: 'Self-Service View', shortLabel: 'Self' },
  ];

  const employeeNavItems = [
    { to: '/self-service', icon: UserCircle, label: 'My Portal', shortLabel: 'Portal' },
    { to: '/payslips', icon: FileText, label: 'My Payslips', shortLabel: 'Payslips' },
    { to: '/employees', icon: Users, label: 'Company Directory', shortLabel: 'Directory' },
  ];

  const currentNavItems = userRole === 'employee' ? employeeNavItems : hrNavItems;

  const currentTitle = currentNavItems.find(item => {
    if (item.to === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  })?.label || 'Meridian';

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    if (newRole === 'employee') {
      navigate('/self-service');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* ─── Desktop Navigation Rail ─────────────────────────────── */}
      <nav
        className={cn(
          'hidden lg:flex flex-col border-r border-stone-200 bg-white transition-all duration-200 flex-shrink-0',
          sidebarCollapsed ? 'w-[72px]' : 'w-[245px]'
        )}
      >
        {/* Brand */}
        <div className={cn(
          'flex items-center border-b border-stone-200 h-[60px] flex-shrink-0',
          sidebarCollapsed ? 'justify-center px-2' : 'px-4'
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-meridian-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-[15px] font-semibold text-stone-900 tracking-tight leading-none">Meridian</h1>
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                    userRole === 'hr_admin' ? 'bg-meridian-50 text-meridian-800 border border-meridian-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  )}>
                    {userRole === 'hr_admin' ? 'Admin' : 'Employee'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 tracking-wider uppercase mt-0.5">
                  {userRole === 'employee' ? 'Self-Service Portal' : 'Payroll Operations'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2">
          <div className="space-y-0.5">
            {currentNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/' || item.to === '/self-service'}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors relative group',
                  isActive
                    ? 'bg-meridian-50 text-meridian-700 font-semibold'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50',
                  sidebarCollapsed && 'justify-center px-0'
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-meridian-600" />
                    )}
                    <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-stone-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* RBAC Inspection Button for Sidebar */}
          {!sidebarCollapsed && (
            <div className="mt-4 pt-3 border-t border-stone-100 px-1">
              <button
                onClick={() => setPermissionsModalOpen(true)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-meridian-600 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-stone-900 block leading-tight">
                      Security & RBAC
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Inspect role boundaries
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-meridian-700 group-hover:underline">
                  Matrix →
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <div className="px-2 py-1 border-t border-stone-100">
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 w-full px-3 py-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>

        {/* User + Demo controls */}
        <div className={cn('border-t border-stone-200 p-3', sidebarCollapsed && 'px-2')}>
          {!sidebarCollapsed && (
            <>
              {/* Role switcher with visual boundary cues */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  <span>Switch Role</span>
                  <button
                    onClick={() => setPermissionsModalOpen(true)}
                    className="text-meridian-700 hover:underline flex items-center gap-0.5 normal-case font-semibold"
                  >
                    View Scope
                  </button>
                </div>
                <div className="flex gap-1 bg-stone-100 rounded-lg p-0.5">
                  <button
                    onClick={() => handleRoleSwitch('hr_admin')}
                    className={cn(
                      'flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-1',
                      userRole === 'hr_admin' ? 'bg-white text-meridian-700 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-700'
                    )}
                  >
                    <ShieldCheck size={12} className={userRole === 'hr_admin' ? 'text-meridian-600' : 'text-stone-400'} />
                    HR Admin
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('employee')}
                    className={cn(
                      'flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-1',
                      userRole === 'employee' ? 'bg-white text-meridian-700 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-700'
                    )}
                  >
                    <Lock size={11} className={userRole === 'employee' ? 'text-amber-600' : 'text-stone-400'} />
                    Employee
                  </button>
                </div>
              </div>

              {/* User info */}
              <div className="flex items-center gap-2.5 mb-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                <div className="w-8 h-8 rounded-full bg-meridian-100 flex items-center justify-center text-meridian-700 text-xs font-semibold flex-shrink-0">
                  {getInitials(currentUser?.name ?? '')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-800 truncate">{currentUser?.name}</p>
                  </div>
                  <p className="text-[10px] text-stone-400 truncate">{currentUser?.email}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1">
                <button
                  onClick={resetDemo}
                  className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-600 py-1 px-2 rounded hover:bg-stone-50 transition-colors"
                  title="Reset Demo Data"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-red-600 py-1 px-2 rounded hover:bg-red-50 transition-colors ml-auto"
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </>
          )}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setPermissionsModalOpen(true)}
                className="text-stone-400 hover:text-meridian-600"
                title="Inspect Permissions Matrix"
              >
                <Shield size={16} />
              </button>
              <div className="w-8 h-8 rounded-full bg-meridian-100 flex items-center justify-center text-meridian-700 text-[10px] font-semibold">
                {getInitials(currentUser?.name ?? '')}
              </div>
              <button
                onClick={() => handleRoleSwitch(userRole === 'hr_admin' ? 'employee' : 'hr_admin')}
                className="text-[10px] text-stone-400 hover:text-meridian-600 font-bold"
                title={`Switch to ${userRole === 'hr_admin' ? 'Employee' : 'HR Admin'}`}
              >
                {userRole === 'hr_admin' ? 'EMP' : 'HR'}
              </button>
              <button onClick={logout} className="text-stone-400 hover:text-red-500 transition-colors" title="Sign Out">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Mobile Header ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-stone-500">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-meridian-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="font-semibold text-stone-800 text-sm">Meridian</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPermissionsModalOpen(true)}
              className="text-xs text-meridian-700 font-semibold flex items-center gap-1 bg-meridian-50 px-2 py-1 rounded border border-meridian-200"
            >
              <Shield size={12} /> RBAC
            </button>
            <span className="text-xs text-stone-400 font-medium">{currentTitle}</span>
          </div>
        </header>

        {/* Mobile nav overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-[280px] bg-white shadow-xl flex flex-col animate-slide-in-right">
              <div className="flex items-center justify-between h-14 px-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-meridian-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">M</span>
                  </div>
                  <span className="font-semibold text-stone-800 text-sm">Meridian</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-stone-400">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {currentNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/self-service'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
                      isActive ? 'bg-meridian-50 text-meridian-700 font-semibold' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                    )}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                <button
                  onClick={() => {
                    setPermissionsModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-4 flex items-center gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700"
                >
                  <Shield size={14} className="text-meridian-600" />
                  Inspect Security & RBAC Matrix
                </button>
              </div>
              <div className="border-t border-stone-200 p-3">
                <div className="flex gap-1 mb-3 bg-stone-100 rounded-lg p-0.5">
                  <button
                    onClick={() => { handleRoleSwitch('hr_admin'); setMobileMenuOpen(false); }}
                    className={cn(
                      'flex-1 text-xs font-medium py-1.5 rounded-md transition-all',
                      userRole === 'hr_admin' ? 'bg-white text-meridian-700 shadow-xs font-semibold' : 'text-stone-500'
                    )}
                  >
                    HR Admin
                  </button>
                  <button
                    onClick={() => { handleRoleSwitch('employee'); setMobileMenuOpen(false); }}
                    className={cn(
                      'flex-1 text-xs font-medium py-1.5 rounded-md transition-all',
                      userRole === 'employee' ? 'bg-white text-meridian-700 shadow-xs font-semibold' : 'text-stone-500'
                    )}
                  >
                    Employee
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-meridian-100 flex items-center justify-center text-meridian-700 text-xs font-semibold">
                    {getInitials(currentUser?.name ?? '')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">{currentUser?.name}</p>
                    <p className="text-[10px] text-stone-400">{currentUser?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { resetDemo(); setMobileMenuOpen(false); }} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                    <RotateCcw size={12} /> Reset
                  </button>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 ml-auto">
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Main Content ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* RBAC Modal */}
      <PermissionsModal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
      />
    </div>
  );
}
