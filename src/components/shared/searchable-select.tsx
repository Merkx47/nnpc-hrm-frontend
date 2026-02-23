import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.subtitle?.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(!open); }}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-left transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
          disabled && 'opacity-50 cursor-not-allowed bg-[var(--secondary)]',
          !selected && 'text-[var(--muted-foreground)]',
          selected && 'text-[var(--foreground)]'
        )}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        {value && !disabled ? (
          <X
            className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); setSearch(''); }}
          />
        ) : (
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)] transition-transform', open && 'rotate-180')} />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
            <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search…"
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-[220px] overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-[var(--muted-foreground)]">
                No results found
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--secondary)]',
                    opt.value === value && 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                  )}
                >
                  <span className="block truncate">{opt.label}</span>
                  {opt.subtitle && (
                    <span className="block text-[11px] text-[var(--muted-foreground)] truncate">{opt.subtitle}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
