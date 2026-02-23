import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Award, ShieldCheck, AlertTriangle, XCircle, Filter,
  Search, Calendar, FileDown,
} from 'lucide-react';
import { CertificateModal } from '@/components/shared/certificate-modal';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { formatDate } from '@/lib/formatters';

type CertificationStatus = 'valid' | 'expiring_soon' | 'expired';

interface CertificationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  certificationName: string;
  issueDate: string;
  expiryDate: string;
  status: CertificationStatus;
}

const CERTIFICATION_STATUS_COLORS: Record<CertificationStatus, string> = {
  valid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  expiring_soon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const CERTIFICATION_STATUS_LABELS: Record<CertificationStatus, string> = {
  valid: 'Valid',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

const certifications: CertificationRecord[] = [
  {
    id: 'CERT-001',
    employeeId: 'NRL-2025-000312',
    employeeName: 'Chinedu Okafor',
    certificationName: 'Fuel Pump Operations & Safety Certificate',
    issueDate: '2025-12-10',
    expiryDate: '2026-12-10',
    status: 'valid',
  },
  {
    id: 'CERT-002',
    employeeId: 'NRL-2024-000156',
    employeeName: 'Amina Bello',
    certificationName: 'Lubricant Product Specialist',
    issueDate: '2025-10-10',
    expiryDate: '2026-10-10',
    status: 'valid',
  },
  {
    id: 'CERT-003',
    employeeId: 'NRL-2024-000200',
    employeeName: 'Emmanuel Adeyemi',
    certificationName: 'Customer Service Excellence Award',
    issueDate: '2025-11-14',
    expiryDate: '2026-11-14',
    status: 'valid',
  },
  {
    id: 'CERT-004',
    employeeId: 'NRL-2024-000215',
    employeeName: 'Grace Eze',
    certificationName: 'Fire Safety & Emergency Response',
    issueDate: '2025-08-18',
    expiryDate: '2026-03-18',
    status: 'expiring_soon',
  },
  {
    id: 'CERT-005',
    employeeId: 'NRL-2024-000230',
    employeeName: 'Ibrahim Musa',
    certificationName: 'Fuel Pump Operations & Safety Certificate',
    issueDate: '2025-10-28',
    expiryDate: '2026-04-28',
    status: 'expiring_soon',
  },
  {
    id: 'CERT-006',
    employeeId: 'NRL-2025-000260',
    employeeName: 'Ngozi Ibe',
    certificationName: 'Cash Handling & POS Operations',
    issueDate: '2025-05-15',
    expiryDate: '2025-11-15',
    status: 'expired',
  },
  {
    id: 'CERT-007',
    employeeId: 'NRL-2025-000275',
    employeeName: 'Tunde Afolabi',
    certificationName: 'Fire Safety & Emergency Response',
    issueDate: '2026-01-18',
    expiryDate: '2027-01-18',
    status: 'valid',
  },
  {
    id: 'CERT-008',
    employeeId: 'NRL-2025-000288',
    employeeName: 'Halima Garba',
    certificationName: 'Environmental Health & Safety',
    issueDate: '2025-11-28',
    expiryDate: '2026-05-28',
    status: 'valid',
  },
  {
    id: 'CERT-009',
    employeeId: 'NRL-2025-000325',
    employeeName: 'Olumide Fasanya',
    certificationName: 'Cash Handling & POS Operations',
    issueDate: '2025-11-25',
    expiryDate: '2026-03-25',
    status: 'expiring_soon',
  },
  {
    id: 'CERT-010',
    employeeId: 'NRL-2024-000210',
    employeeName: 'Blessing Okonkwo',
    certificationName: 'Lubricant Product Specialist',
    issueDate: '2025-03-20',
    expiryDate: '2025-09-20',
    status: 'expired',
  },
];

const PAGE_SIZE = 10;

export function CertificationsPage() {
  const { currentUser } = useAppStore();
  const isAttendant = currentUser?.role === 'attendant';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCert, setSelectedCert] = useState<CertificationRecord | null>(null);

  // Filtered certifications
  const filteredCertifications = useMemo(() => {
    setCurrentPage(1);
    return certifications.filter((cert) => {
      if (isAttendant && currentUser && cert.employeeId !== currentUser.employee.id) return false;
      if (statusFilter !== 'all' && cert.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          cert.employeeName.toLowerCase().includes(q) ||
          cert.certificationName.toLowerCase().includes(q) ||
          cert.employeeId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [statusFilter, searchQuery, isAttendant, currentUser]);

  const paginatedCertifications = filteredCertifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Stats
  const totalCount = certifications.length;
  const validCount = certifications.filter((c) => c.status === 'valid').length;
  const expiringSoonCount = certifications.filter((c) => c.status === 'expiring_soon').length;
  const expiredCount = certifications.filter((c) => c.status === 'expired').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certifications"
        description="Track employee certifications, validity, and renewal requirements"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-1 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{totalCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Certifications</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <ShieldCheck className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{validCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Valid</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{expiringSoonCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Expiring Soon</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <XCircle className="h-6 w-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{expiredCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Expired</p>
          </div>
        </motion.div>
      </div>

      {/* Certifications Table */}
      <TableWrapper
        title="Employee Certifications"
        icon={<Award className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filteredCertifications.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        toolbar={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search..."
                className="rounded-lg border border-[var(--input)] bg-[var(--background)] pl-8 pr-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
              <select
                className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="valid">Valid</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Certification Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Issue Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Expiry Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCertifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No certifications found
                  </p>
                </td>
              </tr>
            ) : (
              paginatedCertifications.map((cert) => (
                <tr
                  key={cert.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {cert.employeeName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {cert.employeeId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {cert.certificationName}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      {formatDate(cert.issueDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      {formatDate(cert.expiryDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={CERTIFICATION_STATUS_LABELS[cert.status]}
                      colorClass={CERTIFICATION_STATUS_COLORS[cert.status]}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--input)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                      title="Generate Certificate"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Generate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>

      {selectedCert && (
        <CertificateModal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          certification={selectedCert}
        />
      )}
    </div>
  );
}
