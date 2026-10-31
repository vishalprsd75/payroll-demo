// ─── Meridian – Employee Directory ───────────────────────────────────────────
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Plus, X, ChevronDown, Users, Filter,
} from 'lucide-react';
import { useStore } from '../store';
import { salaryStructures } from '../data';
import { formatDate, getInitials, getStatusColor, cn, generateId } from '../utils/format';
import type { Employee, EmployeeStatus } from '../types';

const statusOptions: { value: EmployeeStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'probation', label: 'Probation' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
];

const avatarColors = [
  'bg-teal-600', 'bg-indigo-600', 'bg-amber-600', 'bg-rose-600',
  'bg-emerald-600', 'bg-violet-600', 'bg-sky-600', 'bg-orange-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function statusLabel(status: EmployeeStatus): string {
  const map: Record<EmployeeStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    on_leave: 'On Leave',
    terminated: 'Terminated',
    probation: 'Probation',
  };
  return map[status];
}

export default function Employees() {
  const employees = useStore((s) => s.employees);
  const departments = useStore((s) => s.departments);
  const addEmployee = useStore((s) => s.addEmployee);
  const addNotification = useStore((s) => s.addNotification);
  const userRole = useStore((s) => s.userRole);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter((emp) => {
      if (deptFilter !== 'all' && emp.departmentId !== deptFilter) return false;
      if (statusFilter !== 'all' && emp.status !== statusFilter) return false;
      if (q) {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const eid = emp.employeeId.toLowerCase();
        const dept = emp.department.toLowerCase();
        if (!fullName.includes(q) && !eid.includes(q) && !dept.includes(q)) return false;
      }
      return true;
    });
  }, [employees, search, deptFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            {userRole === 'employee' ? 'Company Directory' : 'Employee Management'}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {userRole === 'employee'
              ? 'Find colleagues and department teams across the organization'
              : `${employees.length} employees total · ${filtered.length} shown`}
          </p>
        </div>
        {userRole === 'hr_admin' ? (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        ) : (
          <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <span>🔒 Confidential Compensation Hidden in Employee Mode</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, employee ID, or department…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | 'all')}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* Active filter chips */}
      {(deptFilter !== 'all' || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          {deptFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-md border border-teal-200">
              {departments.find((d) => d.id === deptFilter)?.name}
              <button onClick={() => setDeptFilter('all')} className="hover:text-teal-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-md border border-teal-200">
              {statusOptions.find((s) => s.value === statusFilter)?.label}
              <button onClick={() => setStatusFilter('all')} className="hover:text-teal-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setDeptFilter('all');
              setStatusFilter('all');
            }}
            className="text-xs text-stone-500 hover:text-stone-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Employee grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-stone-400" />
          </div>
          <p className="text-sm font-medium text-stone-900">No employees found</p>
          <p className="text-sm text-stone-500 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            const dept = departments.find((d) => d.id === emp.departmentId);
            return (
              <Link
                key={emp.id}
                to={`/employees/${emp.id}`}
                className="group bg-white border border-stone-200 rounded-lg p-5 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0',
                      getAvatarColor(fullName),
                    )}
                  >
                    {getInitials(fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-stone-900 truncate group-hover:text-teal-700 transition-colors">
                        {fullName}
                      </h3>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border shrink-0',
                          getStatusColor(emp.status),
                        )}
                      >
                        {statusLabel(emp.status)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{emp.employeeId}</p>
                    <p className="text-xs text-stone-600 mt-1">{emp.designation}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        {dept && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: dept.color }}
                          />
                        )}
                        <span className="text-xs text-stone-500">{emp.department}</span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        Joined {formatDate(emp.joiningDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <AddEmployeeModal
          departments={departments}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSave={(emp) => {
            addEmployee(emp);
            addNotification({
              type: 'success',
              title: 'Employee Added',
              message: `${emp.firstName} ${emp.lastName} has been added successfully.`,
            });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Add Employee Modal ──────────────────────────────────────────────────────

interface AddEmployeeModalProps {
  departments: { id: string; name: string }[];
  employees: Employee[];
  onClose: () => void;
  onSave: (emp: Employee) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  departmentId: string;
  designation: string;
  joiningDate: string;
  salaryStructureId: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

function AddEmployeeModal({ departments, employees, onClose, onSave }: AddEmployeeModalProps) {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    departmentId: '',
    designation: '',
    joiningDate: '',
    salaryStructureId: 'engineer',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Auto-generate next employee ID
  const nextEmployeeId = useMemo(() => {
    const nums = employees
      .map((e) => {
        const match = e.employeeId.match(/^MRD-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(Boolean);
    const max = nums.length > 0 ? Math.max(...nums) : 1000;
    return `MRD-${max + 1}`;
  }, [employees]);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.departmentId) errs.departmentId = 'Department is required';
    if (!form.designation.trim()) errs.designation = 'Designation is required';
    if (!form.joiningDate) errs.joiningDate = 'Joining date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const dept = departments.find((d) => d.id === form.departmentId);
    const ssId = form.salaryStructureId || 'engineer';
    const employee: Employee = {
      id: generateId(),
      employeeId: nextEmployeeId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender as 'male' | 'female' | 'other',
      address: '',
      city: '',
      state: '',
      pincode: '',
      departmentId: form.departmentId,
      designationId: '',
      designation: form.designation.trim(),
      department: dept?.name ?? '',
      joiningDate: form.joiningDate,
      status: 'active',
      salaryStructureId: ssId,
      salaryStructure: salaryStructures[ssId],
    };
    onSave(employee);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl mx-4">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Add New Employee</h2>
            <p className="text-xs text-stone-500 mt-0.5">Employee ID: {nextEmployeeId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="First Name"
                required
                error={errors.firstName}
              >
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="e.g. Arjun"
                  className={inputClass(errors.firstName)}
                />
              </Field>
              <Field
                label="Last Name"
                required
                error={errors.lastName}
              >
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="e.g. Mehta"
                  className={inputClass(errors.lastName)}
                />
              </Field>
              <Field label="Email" required error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="e.g. arjun@meridian.io"
                  className={inputClass(errors.email)}
                />
              </Field>
              <Field label="Phone" required error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={inputClass(errors.phone)}
                />
              </Field>
              <Field label="Date of Birth" required error={errors.dateOfBirth}>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className={inputClass(errors.dateOfBirth)}
                />
              </Field>
              <Field label="Gender" required error={errors.gender}>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value as FormData['gender'])}
                    className={cn(inputClass(errors.gender), 'appearance-none pr-8')}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </Field>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Employment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Employee ID">
                <input
                  type="text"
                  value={nextEmployeeId}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed"
                />
              </Field>
              <Field label="Department" required error={errors.departmentId}>
                <div className="relative">
                  <select
                    value={form.departmentId}
                    onChange={(e) => updateField('departmentId', e.target.value)}
                    className={cn(inputClass(errors.departmentId), 'appearance-none pr-8')}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Designation" required error={errors.designation}>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => updateField('designation', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className={inputClass(errors.designation)}
                />
              </Field>
              <Field label="Joining Date" required error={errors.joiningDate}>
                <input
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => updateField('joiningDate', e.target.value)}
                  className={inputClass(errors.joiningDate)}
                />
              </Field>
              <Field label="Salary Grade Template">
                <div className="relative">
                  <select
                    value={form.salaryStructureId}
                    onChange={(e) => updateField('salaryStructureId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none pr-8 cursor-pointer"
                  >
                    {Object.entries(salaryStructures).map(([id, ss]) => (
                      <option key={id} value={id}>
                        {ss.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} (Gross: ₹{ss.grossSalary.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inputClass(error?: string): string {
  return cn(
    'w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors',
    error
      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
      : 'border-stone-200 focus:ring-teal-500/20 focus:border-teal-500',
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
