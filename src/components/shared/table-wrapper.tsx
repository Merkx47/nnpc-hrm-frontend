import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import type { ExportColumn } from '@/lib/export-utils';

interface TableWrapperProps {
  title?: string;
  icon?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  totalItems: number;
  pageSize?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  className?: string;
  exportConfig?: {
    data: Record<string, unknown>[];
    columns: ExportColumn[];
    filename: string;
  };
}

export function TableWrapper({
  title,
  icon,
  toolbar,
  children,
  totalItems,
  pageSize = 10,
  currentPage,
  onPageChange,
  onRefresh,
  className,
  exportConfig,
}: TableWrapperProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm overflow-hidden', className)}
    >
      {/* Header */}
      {(title || toolbar) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            {icon}
            {title && (
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
            )}
            <button
              onClick={handleRefresh}
              className="rounded-md p-1.5 hover:bg-[var(--secondary)] transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={cn(
                  'h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform duration-700',
                  isRefreshing && 'animate-spin'
                )}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {toolbar}
            {exportConfig && (
              <ExportDropdown
                data={exportConfig.data}
                columns={exportConfig.columns}
                filename={exportConfig.filename}
              />
            )}
          </div>
        </div>
      )}

      {/* Table content */}
      <div className="overflow-x-auto">
        {children}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)]">
          {totalItems === 0
            ? 'No results'
            : `Showing ${startItem}–${endItem} of ${totalItems}`}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-md p-1.5 hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-[var(--foreground)]" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let page: number;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'h-7 w-7 rounded-md text-xs font-medium transition-colors',
                  currentPage === page
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                )}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md p-1.5 hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-[var(--foreground)]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
