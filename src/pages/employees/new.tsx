import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, User, Briefcase, FolderOpen, ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { ROLE_LABELS } from '@/lib/constants';
import { stations } from '@/data/stations';
import { NIGERIAN_STATES } from '@/data/nigerian-states';
import type { Role, IDType } from '@/types';

const STEPS = [
  { id: 1, label: 'Personal Details', icon: User },
  { id: 2, label: 'Employment', icon: Briefcase },
  { id: 3, label: 'Documents', icon: FolderOpen },
  { id: 4, label: 'Review', icon: ClipboardList },
] as const;

const ROLES: Role[] = ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'];
const ID_TYPES: IDType[] = ['NIN', 'Voters Card', 'Drivers License', 'Passport'];
const GENDERS = ['Male', 'Female'] as const;

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  idType: string;
  idNumber: string;
  stationId: string;
  role: string;
  yearOfEmployment: string;
}

const initialFormData: FormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  phone: '+234',
  email: '',
  dateOfBirth: '',
  gender: '',
  stateOfOrigin: '',
  lga: '',
  address: '',
  nextOfKinName: '',
  nextOfKinPhone: '+234',
  nextOfKinRelationship: '',
  emergencyName: '',
  emergencyPhone: '+234',
  emergencyRelationship: '',
  idType: '',
  idNumber: '',
  stationId: '',
  role: 'attendant',
  yearOfEmployment: '2026',
};

function FormField({
  label, required, children, error,
}: {
  label: string; required?: boolean; children: React.ReactNode; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
        {label}
        {required && <span className="text-[var(--destructive)] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[var(--destructive)] mt-1">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

export function AddEmployeePage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Get LGAs for selected state
  const selectedState = NIGERIAN_STATES.find((s) => s.name === form.stateOfOrigin);
  const lgas = selectedState?.lgas ?? [];

  // Get dealer for selected station
  const selectedStation = stations.find((s) => s.id === form.stationId);

  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (s === 1) {
      if (!form.firstName.trim()) errs.firstName = 'Required';
      if (!form.lastName.trim()) errs.lastName = 'Required';
      if (!form.phone || form.phone.length < 10) errs.phone = 'Valid phone required';
      if (!form.email.includes('@')) errs.email = 'Valid email required';
      if (!form.dateOfBirth) errs.dateOfBirth = 'Required';
      if (!form.gender) errs.gender = 'Required';
      if (!form.stateOfOrigin) errs.stateOfOrigin = 'Required';
      if (!form.lga) errs.lga = 'Required';
      if (!form.address.trim()) errs.address = 'Required';
      if (!form.idType) errs.idType = 'Required';
      if (!form.idNumber.trim()) errs.idNumber = 'Required';
    }

    if (s === 2) {
      if (!form.stationId) errs.stationId = 'Required';
      if (!form.role) errs.role = 'Required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    toast.success('Employee created successfully', {
      description: `${form.firstName} ${form.lastName} has been added to the system.`,
    });
    setLocation('/employees');
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setLocation('/employees')}
        className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </button>

      <PageHeader title="Add New Employee" description="Fill in the employee details to create a new profile" />

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => { if (isCompleted) setStep(s.id); }}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive && 'bg-[var(--primary)] text-[var(--primary-foreground)]',
                  isCompleted && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-pointer',
                  !isActive && !isCompleted && 'text-[var(--muted-foreground)]',
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'w-8 sm:w-12 h-px',
                  step > s.id ? 'bg-green-500' : 'bg-[var(--border)]'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
      >
        {step === 1 && (
          <Step1Personal form={form} errors={errors} update={update} lgas={lgas} />
        )}
        {step === 2 && (
          <Step2Employment form={form} errors={errors} update={update} selectedStation={selectedStation} />
        )}
        {step === 3 && <Step3Documents />}
        {step === 4 && <Step4Review form={form} selectedStation={selectedStation} setStep={setStep} />}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--input)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <Check className="h-4 w-4" />
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────── Step 1: Personal Details ───────── */
function Step1Personal({
  form, errors, update, lgas,
}: {
  form: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  update: (field: keyof FormData, value: string) => void;
  lgas: string[];
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Personal Details</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField label="First Name" required error={errors.firstName}>
          <input className={inputClass} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="e.g. Adebayo" />
        </FormField>
        <FormField label="Middle Name">
          <input className={inputClass} value={form.middleName} onChange={(e) => update('middleName', e.target.value)} placeholder="Optional" />
        </FormField>
        <FormField label="Last Name" required error={errors.lastName}>
          <input className={inputClass} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="e.g. Okonkwo" />
        </FormField>
        <FormField label="Phone (+234)" required error={errors.phone}>
          <input className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+2348034567890" />
        </FormField>
        <FormField label="Email" required error={errors.email}>
          <input className={inputClass} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@nnpcretail.com" />
        </FormField>
        <FormField label="Date of Birth" required error={errors.dateOfBirth}>
          <input className={inputClass} type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
        </FormField>
        <FormField label="Gender" required error={errors.gender}>
          <select className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value)}>
            <option value="">Select Gender</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </FormField>
        <FormField label="State of Origin" required error={errors.stateOfOrigin}>
          <select className={inputClass} value={form.stateOfOrigin} onChange={(e) => { update('stateOfOrigin', e.target.value); update('lga', ''); }}>
            <option value="">Select State</option>
            {NIGERIAN_STATES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </FormField>
        <FormField label="LGA" required error={errors.lga}>
          <select className={inputClass} value={form.lga} onChange={(e) => update('lga', e.target.value)} disabled={!form.stateOfOrigin}>
            <option value="">Select LGA</option>
            {lgas.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label="Address" required error={errors.address}>
        <textarea className={cn(inputClass, 'min-h-[80px]')} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Full address" />
      </FormField>

      {/* ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="ID Type" required error={errors.idType}>
          <select className={inputClass} value={form.idType} onChange={(e) => update('idType', e.target.value)}>
            <option value="">Select ID Type</option>
            {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="ID Number" required error={errors.idNumber}>
          <input className={inputClass} value={form.idNumber} onChange={(e) => update('idNumber', e.target.value)} placeholder="e.g. 12345678901" />
        </FormField>
      </div>

      {/* Next of Kin */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Next of Kin</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Name">
            <input className={inputClass} value={form.nextOfKinName} onChange={(e) => update('nextOfKinName', e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <input className={inputClass} value={form.nextOfKinPhone} onChange={(e) => update('nextOfKinPhone', e.target.value)} />
          </FormField>
          <FormField label="Relationship">
            <input className={inputClass} value={form.nextOfKinRelationship} onChange={(e) => update('nextOfKinRelationship', e.target.value)} placeholder="e.g. Wife, Brother" />
          </FormField>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Emergency Contact</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Name">
            <input className={inputClass} value={form.emergencyName} onChange={(e) => update('emergencyName', e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <input className={inputClass} value={form.emergencyPhone} onChange={(e) => update('emergencyPhone', e.target.value)} />
          </FormField>
          <FormField label="Relationship">
            <input className={inputClass} value={form.emergencyRelationship} onChange={(e) => update('emergencyRelationship', e.target.value)} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

/* ───────── Step 2: Employment ───────── */
function Step2Employment({
  form, errors, update, selectedStation,
}: {
  form: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  update: (field: keyof FormData, value: string) => void;
  selectedStation?: typeof stations[number];
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Employment Details</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Station" required error={errors.stationId}>
          <select className={inputClass} value={form.stationId} onChange={(e) => update('stationId', e.target.value)}>
            <option value="">Select Station</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Dealer">
          <input className={cn(inputClass, 'bg-[var(--secondary)]')} value={selectedStation?.dealerName ?? '—'} readOnly />
        </FormField>

        <FormField label="Role" required error={errors.role}>
          <select className={inputClass} value={form.role} onChange={(e) => update('role', e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Year of Employment">
          <input className={inputClass} type="number" min="2000" max="2030" value={form.yearOfEmployment} onChange={(e) => update('yearOfEmployment', e.target.value)} />
        </FormField>
      </div>

      {selectedStation && (
        <div className="rounded-lg bg-[var(--secondary)] p-4 text-sm text-[var(--muted-foreground)]">
          <p><strong>Region:</strong> {selectedStation.region}</p>
          <p><strong>Branch:</strong> {selectedStation.branch}</p>
          <p><strong>Location:</strong> {selectedStation.address}, {selectedStation.city}, {selectedStation.state}</p>
        </div>
      )}
    </div>
  );
}

/* ───────── Step 3: Documents ───────── */
function Step3Documents() {
  const docTypes = ['Passport Photo', 'National ID (NIN)', 'Employment Contract', 'Certificates'];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Upload Documents</h3>
      <p className="text-sm text-[var(--muted-foreground)]">
        Upload required documents. This is a mock upload — files will not be stored.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {docTypes.map((type) => (
          <div key={type} className="rounded-xl border-2 border-dashed border-[var(--border)] p-6 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
            <p className="text-sm font-medium text-[var(--foreground)]">{type}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Click to upload or drag & drop</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Step 4: Review ───────── */
function Step4Review({
  form, selectedStation, setStep,
}: {
  form: FormData;
  selectedStation?: typeof stations[number];
  setStep: (s: number) => void;
}) {
  const Section = ({ title, stepNum, children }: { title: string; stepNum: number; children: React.ReactNode }) => (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[var(--foreground)]">{title}</h4>
        <button
          onClick={() => setStep(stepNum)}
          className="text-xs text-[var(--primary)] hover:underline"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      <p className="text-sm text-[var(--foreground)]">{value || '—'}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Review & Submit</h3>
      <p className="text-sm text-[var(--muted-foreground)]">Please review all details before submitting.</p>

      <Section title="Personal Details" stepNum={1}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="First Name" value={form.firstName} />
          <Field label="Middle Name" value={form.middleName} />
          <Field label="Last Name" value={form.lastName} />
          <Field label="Phone" value={form.phone} />
          <Field label="Email" value={form.email} />
          <Field label="Date of Birth" value={form.dateOfBirth} />
          <Field label="Gender" value={form.gender} />
          <Field label="State" value={form.stateOfOrigin} />
          <Field label="LGA" value={form.lga} />
          <Field label="ID Type" value={form.idType} />
          <Field label="ID Number" value={form.idNumber} />
        </div>
      </Section>

      <Section title="Employment" stepNum={2}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Station" value={selectedStation?.name ?? '—'} />
          <Field label="Dealer" value={selectedStation?.dealerName ?? '—'} />
          <Field label="Role" value={form.role ? ROLE_LABELS[form.role as Role] : '—'} />
          <Field label="Year" value={form.yearOfEmployment} />
        </div>
      </Section>

      <Section title="Documents" stepNum={3}>
        <p className="text-sm text-[var(--muted-foreground)]">No documents uploaded (mock)</p>
      </Section>
    </div>
  );
}
