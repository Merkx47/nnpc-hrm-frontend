import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type IconComponent = LucideIcon | React.ComponentType<{ className?: string }>;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconComponent;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, delay = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        className={cn(
          'rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm p-6 hover-elevate h-full',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 h-full">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold font-mono tracking-tight text-[var(--foreground)] truncate">
              {value}
            </p>
            <div className="flex items-center gap-2 mt-1 min-h-[20px]">
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold',
                    trend.isPositive
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-[var(--muted-foreground)]">{subtitle}</span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--muted)]/50 text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
