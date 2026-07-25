import styles from './Skeleton.module.css';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'heading' | 'avatar' | 'card';
  className?: string;
}

export function Skeleton({ width, height, variant = 'text', className }: SkeletonProps) {
  return (
    <div
      className={cn(styles.skeleton, styles[`skeleton--${variant}`], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
