import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/lib/export-utils';
import type { ExportColumn } from '@/lib/export-utils';

interface ExportDropdownProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
}

export function ExportDropdown({ data, columns, filename }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = (type: 'csv' | 'xlsx' | 'pdf') => {
    if (type === 'csv') exportToCSV(data, columns, filename);
    else if (type === 'xlsx') exportToXLSX(data, columns, filename);
    else exportToPDF(data, columns, filename);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--input)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            <FileDown className="h-3.5 w-3.5 text-green-500" />
            Export as CSV
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
            Export as Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-red-500" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}
