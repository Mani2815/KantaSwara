import styles from './Badge.module.css';
import { cn } from '@/lib/utils/cn';

type BadgeVariant =
  | 'active'
  | 'completed'
  | 'failed'
  | 'queued'
  | 'voicemail'
  | 'transferred'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

/** Only the 'active' variant gets a pulse animation on its dot. */
export function Badge({ variant, children, dot = false, className }: BadgeProps) {
  const showDot = dot || variant === 'active';

  return (
    <span
      className={cn(styles.badge, styles[`badge--${variant}`], className)}
      role="status"
    >
      {showDot && <span className={styles.badge__dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
