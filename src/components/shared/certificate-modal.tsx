import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

interface CertificationData {
  id: string;
  employeeId: string;
  employeeName: string;
  certificationName: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  certification: CertificationData;
}

interface Template {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  previewBg: string;
  previewAccent: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'classic-green',
    name: 'Classic Green',
    description: 'Green/gold NNPC branding',
    primaryColor: '#1A5632',
    secondaryColor: '#2d7a4a',
    accentColor: '#c8a84e',
    previewBg: 'bg-green-800',
    previewAccent: 'bg-yellow-500',
  },
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    description: 'Blue/silver formal style',
    primaryColor: '#1e40af',
    secondaryColor: '#2563eb',
    accentColor: '#94a3b8',
    previewBg: 'bg-blue-700',
    previewAccent: 'bg-slate-400',
  },
  {
    id: 'safety-red',
    name: 'Safety Red',
    description: 'Red/orange for safety certs',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    accentColor: '#f97316',
    previewBg: 'bg-red-600',
    previewAccent: 'bg-orange-400',
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    description: 'Purple/blue contemporary style',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    accentColor: '#3b82f6',
    previewBg: 'bg-purple-600',
    previewAccent: 'bg-blue-500',
  },
];

function generateCertificatePDF(certification: CertificationData, template: Template) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 297
  const pageHeight = doc.internal.pageSize.getHeight(); // 210

  const { primaryColor, secondaryColor, accentColor } = template;

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 0, g: 0, b: 0 };
  };

  const primary = hexToRgb(primaryColor);
  const secondary = hexToRgb(secondaryColor);
  const accent = hexToRgb(accentColor);

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer border
  doc.setDrawColor(primary.r, primary.g, primary.b);
  doc.setLineWidth(3);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner border
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(1);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Decorative corner accents
  const cornerLen = 20;
  doc.setDrawColor(secondary.r, secondary.g, secondary.b);
  doc.setLineWidth(2);
  // Top-left
  doc.line(14, 14, 14 + cornerLen, 14);
  doc.line(14, 14, 14, 14 + cornerLen);
  // Top-right
  doc.line(pageWidth - 14, 14, pageWidth - 14 - cornerLen, 14);
  doc.line(pageWidth - 14, 14, pageWidth - 14, 14 + cornerLen);
  // Bottom-left
  doc.line(14, pageHeight - 14, 14 + cornerLen, pageHeight - 14);
  doc.line(14, pageHeight - 14, 14, pageHeight - 14 - cornerLen);
  // Bottom-right
  doc.line(pageWidth - 14, pageHeight - 14, pageWidth - 14 - cornerLen, pageHeight - 14);
  doc.line(pageWidth - 14, pageHeight - 14, pageWidth - 14, pageHeight - 14 - cornerLen);

  // Top decorative line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(50, 30, pageWidth - 50, 30);

  // "NNPC RETAIL LIMITED"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primary.r, primary.g, primary.b);
  doc.text('NNPC RETAIL LIMITED', pageWidth / 2, 42, { align: 'center' });

  // "CERTIFICATE" title
  doc.setFontSize(36);
  doc.setTextColor(primary.r, primary.g, primary.b);
  doc.text('CERTIFICATE', pageWidth / 2, 60, { align: 'center' });

  // Decorative line under title
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.8);
  doc.line(90, 65, pageWidth - 90, 65);

  // "This is to certify that"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(80, 80, 80);
  doc.text('This is to certify that', pageWidth / 2, 78, { align: 'center' });

  // Employee name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(primary.r, primary.g, primary.b);
  doc.text(certification.employeeName, pageWidth / 2, 93, { align: 'center' });

  // Decorative line under name
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(80, 97, pageWidth - 80, 97);

  // "has successfully completed"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(80, 80, 80);
  doc.text('has successfully completed', pageWidth / 2, 108, { align: 'center' });

  // Certification name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(secondary.r, secondary.g, secondary.b);
  doc.text(certification.certificationName, pageWidth / 2, 120, { align: 'center' });

  // Date formatting
  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Issue date and expiry date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Issue Date: ${formatDisplayDate(certification.issueDate)}`, pageWidth / 2 - 45, 135, {
    align: 'center',
  });
  doc.text(`Expiry Date: ${formatDisplayDate(certification.expiryDate)}`, pageWidth / 2 + 45, 135, {
    align: 'center',
  });

  // Certificate ID
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text(`Certificate ID: ${certification.id}`, pageWidth / 2, 145, { align: 'center' });

  // Signature lines
  const sigY = 170;
  const sigWidth = 60;

  // Left signature
  doc.setDrawColor(primary.r, primary.g, primary.b);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 80, sigY, pageWidth / 2 - 80 + sigWidth, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Authorized Signatory', pageWidth / 2 - 80 + sigWidth / 2, sigY + 5, {
    align: 'center',
  });

  // Right signature
  doc.line(pageWidth / 2 + 20, sigY, pageWidth / 2 + 20 + sigWidth, sigY);
  doc.text('Director of Operations', pageWidth / 2 + 20 + sigWidth / 2, sigY + 5, {
    align: 'center',
  });

  // Bottom decorative line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(50, pageHeight - 30, pageWidth - 50, pageHeight - 30);

  // Save
  const safeName = certification.employeeName.replace(/\s+/g, '_');
  doc.save(`${safeName}_${certification.id}_certificate.pdf`);
}

export function CertificateModal({ isOpen, onClose, certification }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic-green');

  const handleDownload = () => {
    const template = TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return;
    generateCertificatePDF(certification, template);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Generate Certificate
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Select a template and download the certificate as PDF
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="h-5 w-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Certification summary */}
              <div className="rounded-lg bg-[var(--secondary)] p-4 space-y-1">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {certification.employeeName}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {certification.certificationName} &middot; {certification.id}
                </p>
              </div>

              {/* Template grid */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                  Choose Template
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        'rounded-lg border-2 p-3 text-left transition-all hover:shadow-md',
                        selectedTemplate === template.id
                          ? 'border-[var(--primary)] shadow-md'
                          : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                      )}
                    >
                      {/* Preview */}
                      <div
                        className={cn(
                          'rounded-md h-20 mb-2 flex flex-col items-center justify-center gap-1 relative overflow-hidden',
                          template.previewBg
                        )}
                      >
                        <div
                          className={cn('h-1.5 w-16 rounded-full opacity-60', template.previewAccent)}
                        />
                        <p className="text-[10px] font-bold text-white/90 tracking-wide">
                          CERTIFICATE
                        </p>
                        <div
                          className={cn('h-1 w-12 rounded-full opacity-40', template.previewAccent)}
                        />
                        <div
                          className={cn('h-1 w-8 rounded-full opacity-30', template.previewAccent)}
                        />
                      </div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {template.name}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[var(--input)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
