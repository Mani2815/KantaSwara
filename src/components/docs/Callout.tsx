import { AlertTriangle, Info, CheckCircle2, XOctagon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-800 dark:text-blue-200',
    warning: 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-800 dark:text-orange-200',
    success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200',
    error: 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-800 dark:text-red-200',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XOctagon className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className={cn('my-6 flex gap-4 p-4 border-l-4 rounded-r-lg', styles[type])}>
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div>
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
