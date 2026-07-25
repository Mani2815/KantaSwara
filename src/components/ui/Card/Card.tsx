import styles from './Card.module.css';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
}

export function Card({ clickable, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(styles.card, clickable && styles['card--clickable'], className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.card__header, className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn(styles.card__title, className)} {...props}>
      {children}
    </h5>
  );
}

function CardActions({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.card__actions, className)} {...props}>
      {children}
    </div>
  );
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

function CardBody({ compact, className, children, ...props }: CardBodyProps) {
  return (
    <div
      className={cn(
        styles.card__body,
        compact && styles['card__body--compact'],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.card__footer, className)} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Actions = CardActions;
Card.Body = CardBody;
Card.Footer = CardFooter;
