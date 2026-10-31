// ─── Meridian – Toast Notification Container ─────────────────────────────────
import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useStore } from '../../store';
import { cn } from '../../utils/format';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

const iconStyles = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-blue-600',
};

export default function ToastContainer() {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {notifications.map((n) => (
        <Toast
          key={n.id}
          id={n.id}
          type={n.type}
          title={n.title}
          message={n.message}
          duration={n.duration}
          onClose={() => removeNotification(n.id)}
        />
      ))}
    </div>
  );
}

function Toast({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}: {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-up',
        styles[type]
      )}
    >
      <Icon size={18} className={cn('flex-shrink-0 mt-0.5', iconStyles[type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800">{title}</p>
        <p className="text-xs text-stone-600 mt-0.5">{message}</p>
      </div>
      <button onClick={onClose} className="text-stone-400 hover:text-stone-600 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

