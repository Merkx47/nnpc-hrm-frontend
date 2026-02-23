import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  accessor: string;
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

function resolveValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function buildRows(data: Record<string, unknown>[], columns: ExportColumn[]): string[][] {
  return data.map((row) =>
    columns.map((col) => {
      const raw = resolveValue(row, col.accessor);
      if (col.format) return col.format(raw, row);
      if (raw === null || raw === undefined) return '';
      return String(raw);
    }),
  );
}

export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const headers = columns.map((c) => c.header);
  const rows = buildRows(data, columns);

  const escape = (v: string) => {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportToXLSX(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const headers = columns.map((c) => c.header);
  const rows = buildRows(data, columns);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPDF(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const doc = new jsPDF({ orientation: data.length > 0 && columns.length > 6 ? 'landscape' : 'portrait' });
  const headers = columns.map((c) => c.header);
  const rows = buildRows(data, columns);

  doc.setFontSize(14);
  doc.text(filename.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), 14, 15);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString('en-NG')}`, 14, 22);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [26, 86, 50], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${filename}.pdf`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
