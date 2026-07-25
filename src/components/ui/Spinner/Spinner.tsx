import styles from './Spinner.module.css';
import { cn } from '@/lib/utils/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <span
      className={cn(styles.spinner, className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading</span>
    </span>
  );
}
