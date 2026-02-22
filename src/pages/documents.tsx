import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Search, Filter, FolderOpen, Clock, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAppStore } from '@/lib/store';

// ── Document types ────────────────────────────────────────────────────
interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  accessLevel: 'all' | 'management' | 'admin';
}

type DocumentCategory =
  | 'policy'
  | 'procedure'
  | 'template'
  | 'training'
  | 'compliance'
  | 'report';

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; color: string; bg: string }> = {
  policy: { label: 'Policy', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  procedure: { label: 'Procedure', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  template: { label: 'Template', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  training: { label: 'Training', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  compliance: { label: 'Compliance', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
  report: { label: 'Report', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
};

const FILE_ICONS: Record<string, { color: string; label: string }> = {
  pdf: { color: 'text-red-500', label: 'PDF' },
  docx: { color: 'text-blue-500', label: 'DOCX' },
  xlsx: { color: 'text-green-500', label: 'XLSX' },
  pptx: { color: 'text-orange-500', label: 'PPTX' },
};

// ── Mock documents ────────────────────────────────────────────────────
const documents: Document[] = [
  {
    id: 'DOC-001',
    title: 'NNPC Retail Employee Handbook 2026',
    category: 'policy',
    description: 'Comprehensive guide covering employment policies, code of conduct, benefits, leave policies, and disciplinary procedures for all NNPC Retail staff.',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    uploadedBy: 'HR Department',
    uploadedAt: '2026-01-15',
    version: 'v3.2',
    accessLevel: 'all',
  },
  {
    id: 'DOC-002',
    title: 'Station Operations Manual',
    category: 'procedure',
    description: 'Standard operating procedures for daily station operations including fuel dispensing, cash handling, shift handover protocols, and emergency procedures.',
    fileType: 'pdf',
    fileSize: '12.3 MB',
    uploadedBy: 'Operations Division',
    uploadedAt: '2025-11-20',
    version: 'v5.0',
    accessLevel: 'all',
  },
  {
    id: 'DOC-003',
    title: 'Health, Safety & Environment (HSE) Policy',
    category: 'compliance',
    description: 'NNPC Retail HSE policy document covering fire safety, hazardous materials handling, environmental protection standards, and incident reporting procedures.',
    fileType: 'pdf',
    fileSize: '8.1 MB',
    uploadedBy: 'HSE Department',
    uploadedAt: '2026-01-05',
    version: 'v4.1',
    accessLevel: 'all',
  },
  {
    id: 'DOC-004',
    title: 'Monthly Attendance Report Template',
    category: 'template',
    description: 'Standardized Excel template for recording and submitting monthly employee attendance data by station supervisors.',
    fileType: 'xlsx',
    fileSize: '245 KB',
    uploadedBy: 'HR Department',
    uploadedAt: '2026-02-01',
    version: 'v2.0',
    accessLevel: 'management',
  },
  {
    id: 'DOC-005',
    title: 'Fire Safety & Emergency Response Training',
    category: 'training',
    description: 'Training materials for the mandatory fire safety certification program. Includes emergency evacuation procedures, fire extinguisher usage, and first aid basics.',
    fileType: 'pptx',
    fileSize: '15.6 MB',
    uploadedBy: 'Training Division',
    uploadedAt: '2025-12-10',
    version: 'v2.3',
    accessLevel: 'all',
  },
  {
    id: 'DOC-006',
    title: 'Lubricant Sales Target Setting Guide',
    category: 'procedure',
    description: 'Guide for setting and tracking lubricant product sales targets per station. Includes product pricing, margin calculations, and incentive structures.',
    fileType: 'pdf',
    fileSize: '3.2 MB',
    uploadedBy: 'Sales & Marketing',
    uploadedAt: '2026-01-22',
    version: 'v1.5',
    accessLevel: 'management',
  },
  {
    id: 'DOC-007',
    title: 'Employee Transfer Request Form',
    category: 'template',
    description: 'Official form for requesting employee transfers between NNPC Retail stations. Must be approved by both station managers and regional HR.',
    fileType: 'docx',
    fileSize: '180 KB',
    uploadedBy: 'HR Department',
    uploadedAt: '2025-10-15',
    version: 'v1.2',
    accessLevel: 'management',
  },
  {
    id: 'DOC-008',
    title: 'NNPC Brand Standards & Compliance Manual',
    category: 'compliance',
    description: 'Brand identity guidelines for all NNPC Retail stations. Covers signage standards, uniform requirements, customer service protocols, and station appearance.',
    fileType: 'pdf',
    fileSize: '22.4 MB',
    uploadedBy: 'Brand & Communications',
    uploadedAt: '2025-09-30',
    version: 'v2.0',
    accessLevel: 'all',
  },
  {
    id: 'DOC-009',
    title: 'Performance Evaluation Form — Attendants',
    category: 'template',
    description: 'Quarterly performance evaluation form for pump attendants. Covers sales performance, customer service, punctuality, and compliance metrics.',
    fileType: 'docx',
    fileSize: '156 KB',
    uploadedBy: 'HR Department',
    uploadedAt: '2026-01-08',
    version: 'v3.0',
    accessLevel: 'management',
  },
  {
    id: 'DOC-010',
    title: 'Q4 2025 Regional Performance Report',
    category: 'report',
    description: 'Quarterly performance report covering all 6 NNPC Retail regions. Includes revenue analysis, attendance statistics, training compliance, and incident summaries.',
    fileType: 'pdf',
    fileSize: '6.7 MB',
    uploadedBy: 'Analytics Division',
    uploadedAt: '2026-01-28',
    version: 'v1.0',
    accessLevel: 'admin',
  },
  {
    id: 'DOC-011',
    title: 'Fuel Dispensing Safety Procedures',
    category: 'training',
    description: 'Step-by-step safety procedures for fuel dispensing operations. Covers PMS, AGO, and DPK handling, spill prevention, and customer interaction during fueling.',
    fileType: 'pdf',
    fileSize: '5.4 MB',
    uploadedBy: 'HSE Department',
    uploadedAt: '2025-11-01',
    version: 'v3.1',
    accessLevel: 'all',
  },
  {
    id: 'DOC-012',
    title: 'Salary Structure & Benefits Guide 2026',
    category: 'policy',
    description: 'Detailed breakdown of NNPC Retail salary bands, allowances, pension contributions, health insurance, and other employee benefits by grade level.',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    uploadedBy: 'Compensation & Benefits',
    uploadedAt: '2026-02-01',
    version: 'v2.0',
    accessLevel: 'admin',
  },
  {
    id: 'DOC-013',
    title: 'Station Onboarding Checklist',
    category: 'template',
    description: 'Complete onboarding checklist for new NNPC Retail employees. Covers documentation, training assignments, uniform issuance, and station orientation.',
    fileType: 'xlsx',
    fileSize: '320 KB',
    uploadedBy: 'HR Department',
    uploadedAt: '2026-01-10',
    version: 'v2.5',
    accessLevel: 'management',
  },
  {
    id: 'DOC-014',
    title: 'Incident Reporting & Investigation Guide',
    category: 'compliance',
    description: 'Procedures for reporting and investigating workplace incidents, accidents, and near-misses. Includes root cause analysis frameworks and corrective action templates.',
    fileType: 'pdf',
    fileSize: '4.5 MB',
    uploadedBy: 'HSE Department',
    uploadedAt: '2025-12-20',
    version: 'v2.2',
    accessLevel: 'all',
  },
  {
    id: 'DOC-015',
    title: 'Customer Service Excellence Training',
    category: 'training',
    description: 'Training module on delivering exceptional customer service at NNPC Retail stations. Covers greeting protocols, complaint handling, and upselling techniques.',
    fileType: 'pptx',
    fileSize: '9.8 MB',
    uploadedBy: 'Training Division',
    uploadedAt: '2026-02-05',
    version: 'v1.0',
    accessLevel: 'all',
  },
  {
    id: 'DOC-016',
    title: 'Cash Handling & Reconciliation Procedure',
    category: 'procedure',
    description: 'Standard procedures for cash management at stations. Covers shift-end reconciliation, bank lodgement, discrepancy reporting, and fraud prevention measures.',
    fileType: 'pdf',
    fileSize: '3.8 MB',
    uploadedBy: 'Finance Division',
    uploadedAt: '2025-10-28',
    version: 'v4.0',
    accessLevel: 'management',
  },
];

// ── Document Library Page ─────────────────────────────────────────────
export function DocumentLibraryPage() {
  const { currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const role = currentUser?.role || 'attendant';
  const isAdmin = role === 'admin';
  const isManagement = ['admin', 'regional_manager', 'branch_manager'].includes(role);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Access control
      if (doc.accessLevel === 'admin' && !isAdmin) return false;
      if (doc.accessLevel === 'management' && !isManagement) return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        if (
          !doc.title.toLowerCase().includes(q) &&
          !doc.description.toLowerCase().includes(q) &&
          !doc.category.toLowerCase().includes(q)
        )
          return false;
      }

      // Category filter
      if (categoryFilter && doc.category !== categoryFilter) return false;

      return true;
    });
  }, [search, categoryFilter, isAdmin, isManagement]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of documents) {
      if (doc.accessLevel === 'admin' && !isAdmin) continue;
      if (doc.accessLevel === 'management' && !isManagement) continue;
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    }
    return counts;
  }, [isAdmin, isManagement]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Library"
        description="Access policies, procedures, templates, and training materials"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(CATEGORY_CONFIG) as DocumentCategory[]).map((cat, i) => {
          const config = CATEGORY_CONFIG[cat];
          const count = categoryCounts[cat] || 0;
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
              className={cn(
                'rounded-lg border p-3 text-center transition-all',
                categoryFilter === cat
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--primary)]/30',
              )}
            >
              <p className={cn('text-2xl font-bold font-mono', config.color)}>{count}</p>
              <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{config.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--input)] bg-[var(--background)]/50 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | '')}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-[var(--input)] bg-[var(--background)]/50 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 appearance-none"
          >
            <option value="">All Categories</option>
            {(Object.keys(CATEGORY_CONFIG) as DocumentCategory[]).map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDocs.map((doc, i) => {
          const catConfig = CATEGORY_CONFIG[doc.category];
          const fileConfig = FILE_ICONS[doc.fileType];

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 hover:shadow-md transition-shadow group"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('p-2.5 rounded-lg flex-shrink-0', catConfig.bg)}>
                  <FileText className={cn('h-5 w-5', catConfig.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] leading-tight line-clamp-2">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge
                      label={catConfig.label}
                      colorClass={cn(catConfig.bg, catConfig.color)}
                    />
                    <span className={cn('text-[10px] font-bold uppercase', fileConfig.color)}>
                      {fileConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4">
                {doc.description}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{doc.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] mb-4">
                <span>{doc.fileSize}</span>
                <span>{doc.version}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--foreground)] bg-[var(--secondary)] hover:bg-[var(--muted)] transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-[var(--primary)] hover:opacity-90 transition-opacity"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="h-12 w-12 text-[var(--muted-foreground)] mb-3 opacity-40" />
          <p className="text-sm font-medium text-[var(--foreground)]">No documents found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl mx-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', CATEGORY_CONFIG[previewDoc.category].bg)}>
                  <FileText className={cn('h-5 w-5', CATEGORY_CONFIG[previewDoc.category].color)} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{previewDoc.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {CATEGORY_CONFIG[previewDoc.category].label} &middot; {previewDoc.version} &middot; {previewDoc.fileSize}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="h-5 w-5 text-[var(--muted-foreground)]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-[var(--foreground)]">{previewDoc.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Uploaded By</p>
                  <p className="text-sm text-[var(--foreground)]">{previewDoc.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Upload Date</p>
                  <p className="text-sm text-[var(--foreground)]">{previewDoc.uploadedAt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">File Type</p>
                  <p className={cn('text-sm font-medium', FILE_ICONS[previewDoc.fileType].color)}>
                    {FILE_ICONS[previewDoc.fileType].label}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Access Level</p>
                  <p className="text-sm text-[var(--foreground)] capitalize">{previewDoc.accessLevel === 'all' ? 'All Staff' : previewDoc.accessLevel}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 transition-opacity"
                >
                  <Download className="h-4 w-4" />
                  Download {FILE_ICONS[previewDoc.fileType].label}
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] bg-[var(--secondary)] hover:bg-[var(--muted)] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
