// ─── Meridian – Formatting Utilities ─────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateLong(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getMonthName(month: number): string {
  return [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][month];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    inactive: 'text-stone-500 bg-stone-50 border-stone-200',
    on_leave: 'text-amber-700 bg-amber-50 border-amber-200',
    terminated: 'text-red-700 bg-red-50 border-red-200',
    probation: 'text-blue-700 bg-blue-50 border-blue-200',
    draft: 'text-stone-500 bg-stone-50 border-stone-200',
    processing: 'text-blue-700 bg-blue-50 border-blue-200',
    review: 'text-amber-700 bg-amber-50 border-amber-200',
    approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    processed: 'text-teal-700 bg-teal-50 border-teal-200',
    paid: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    pending: 'text-amber-700 bg-amber-50 border-amber-200',
    rejected: 'text-red-700 bg-red-50 border-red-200',
    calculated: 'text-blue-700 bg-blue-50 border-blue-200',
    adjusted: 'text-purple-700 bg-purple-50 border-purple-200',
    exception: 'text-red-700 bg-red-50 border-red-200',
    on_hold: 'text-amber-700 bg-amber-50 border-amber-200',
  };
  return map[status] || 'text-stone-500 bg-stone-50 border-stone-200';
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    low: 'text-blue-700 bg-blue-50 border-blue-200',
    medium: 'text-amber-700 bg-amber-50 border-amber-200',
    high: 'text-orange-700 bg-orange-50 border-orange-200',
    critical: 'text-red-700 bg-red-50 border-red-200',
  };
  return map[severity] || 'text-stone-500 bg-stone-50 border-stone-200';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

