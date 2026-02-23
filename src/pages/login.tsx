import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';
import { useLocation } from 'wouter';
import type { Role, User, Employee } from '@/types';

const ROLES: Role[] = ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'];

const mockAccountMap: Record<Role, { id: string; firstName: string; lastName: string; stationId: string; dealerName: string }> = {
  admin: { id: 'NRL-2024-000001', firstName: 'Adebayo', lastName: 'Okonkwo', stationId: 'STN-001', dealerName: 'NNPC HQ' },
  regional_manager: { id: 'NRL-2023-000015', firstName: 'Fatima', lastName: 'Abdullahi', stationId: 'STN-005', dealerName: 'NNPC HQ' },
  branch_manager: { id: 'NRL-2023-000042', firstName: 'Chinedu', lastName: 'Eze', stationId: 'STN-001', dealerName: 'NNPC HQ' },
  dealer: { id: 'NRL-2022-000088', firstName: 'Alhaji Musa', lastName: 'Ibrahim', stationId: 'STN-005', dealerName: 'Ibrahim Oil & Gas' },
  supervisor: { id: 'NRL-2024-000156', firstName: 'Ngozi', lastName: 'Okafor', stationId: 'STN-001', dealerName: 'Okonkwo Petroleum' },
  attendant: { id: 'NRL-2025-000312', firstName: 'Emeka', lastName: 'Nwankwo', stationId: 'STN-001', dealerName: 'Okonkwo Petroleum' },
};

// ── OTP Input Component ───────────────────────────────────────────────
function OtpInput({ length = 6, onComplete }: { length?: number; onComplete: (otp: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = newValues.join('');
    if (otp.length === length && !newValues.includes('')) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newValues = [...values];
      newValues[index - 1] = '';
      setValues(newValues);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const newValues = [...values];
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setValues(newValues);
    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    if (pasted.length === length) {
      onComplete(pasted);
    }
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold font-mono rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
        />
      ))}
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────
export function LoginPage() {
  const { setCurrentUser, setNotifications } = useAppStore();
  const [, setLocation] = useLocation();

  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const getDefaultEmail = (role: Role) => {
    const a = mockAccountMap[role];
    return `${a.firstName.toLowerCase().replace(/\s+/g, '')}.${a.lastName.toLowerCase()}@nnpcretail.com`;
  };
  const [email, setEmail] = useState(getDefaultEmail('admin'));
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  // OTP state
  const [step, setStep] = useState<'credentials' | 'otp' | 'sso_mfa'>('credentials');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoMfaNumber] = useState(() => Math.floor(10 + Math.random() * 89));
  const [ssoApproving, setSsoApproving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setEmail(getDefaultEmail(role));
    setPassword('password123');
  };

  const handleSsoLogin = () => {
    setSsoLoading(true);
    // Step 1: Simulate redirect to Azure AD (brief loading)
    setTimeout(() => {
      setSsoLoading(false);
      // Step 2: Show Microsoft Authenticator number-matching MFA screen
      setStep('sso_mfa');
    }, 1500);
  };

  const handleSsoMfaApprove = () => {
    setSsoApproving(true);
    // Simulate waiting for Authenticator approval
    setTimeout(() => {
      setSsoApproving(false);
      completeLogin();
    }, 1200);
  };

  const startResendTimer = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setOtpSent(true);
      startResendTimer();
    }, 800);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setOtpError('');
    startResendTimer();
  };

  const handleOtpComplete = (otp: string) => {
    setIsVerifying(true);
    setOtpError('');

    // Accept any 6-digit code for OTP verification
    setTimeout(() => {
      if (otp.length === 6) {
        completeLogin();
      } else {
        setOtpError('Invalid OTP. Please try again.');
        setIsVerifying(false);
      }
    }, 600);
  };

  const completeLogin = () => {
    const account = mockAccountMap[selectedRole];

    const employee: Employee = {
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: `${account.firstName.toLowerCase()}.${account.lastName.toLowerCase()}@nnpcretail.com`,
      phone: '+2348034567890',
      dateOfBirth: '1990-01-15',
      gender: 'Male',
      stateOfOrigin: 'Lagos',
      lga: 'Ikeja',
      address: 'Lagos, Nigeria',
      nextOfKin: { name: 'Jane Doe', phone: '+2348012345678', relationship: 'Spouse' },
      emergencyContact: { name: 'John Doe', phone: '+2348098765432', relationship: 'Sibling' },
      idType: 'NIN',
      idNumber: '12345678901',
      role: selectedRole,
      stationId: account.stationId,
      dealerId: 'DLR-001',
      dealerName: account.dealerName,
      employmentStatus: 'active',
      yearOfEmployment: parseInt(account.id.split('-')[1]),
      employmentHistory: [
        {
          id: 'EH-001',
          date: `${account.id.split('-')[1]}-01-15`,
          action: 'hired',
          toStation: account.stationId,
          toRole: selectedRole,
          details: `Hired as ${ROLE_LABELS[selectedRole]}`,
        },
      ],
      createdAt: '2024-01-15',
      updatedAt: '2025-01-15',
    };

    const user: User = { id: account.id, employee, role: selectedRole };
    setCurrentUser(user);

    import('@/data/notifications').then((mod) => {
      setNotifications(mod.notifications);
    }).catch(() => {});

    setLocation('/dashboard');
  };

  const selectedAccount = mockAccountMap[selectedRole];
  const maskedPhone = '+234 803 **** 890';

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-[#0a1a12] via-[#1A5632] to-[#0f2318] items-center justify-center p-12">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-lg"
        >
          <img
            src="/nnpc-logo.png"
            alt="NNPC"
            className="h-16 w-auto object-contain mb-8"
          />
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
            Employee Management<br />System
          </h1>
          <p className="text-emerald-200/70 text-lg mb-8 leading-relaxed">
            Manage your workforce across all NNPC Retail stations. Track attendance, performance, training compliance, and more.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { label: 'Real-time Attendance Tracking', desc: '35 stations monitored' },
              { label: 'Performance Analytics', desc: 'KPIs, sales targets & evaluations' },
              { label: 'Training Management', desc: 'Compliance tracking & certifications' },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{f.label}</p>
                  <p className="text-xs text-emerald-300/50">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-xs text-emerald-400/30">
              NNPC Retail Limited &mdash; Employee Management Tool v1.0
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Login Form / OTP */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#0d1f14]">
        <AnimatePresence mode="wait">
          {step === 'sso_mfa' ? (
            <motion.div
              key="sso_mfa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <img src="/nnpc-logo.png" alt="NNPC" className="h-12 w-auto object-contain" />
              </div>

              {/* Microsoft logo */}
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg viewBox="0 0 21 21" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 text-center">Approve sign-in</h2>
              <p className="text-emerald-300/50 text-sm mb-6 text-center">
                Open your Microsoft Authenticator app and enter the number shown below to sign in.
              </p>

              {/* Number display */}
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-3xl font-bold font-mono text-white">{ssoMfaNumber}</span>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-300">
                      {mockAccountMap[selectedRole].firstName[0]}{mockAccountMap[selectedRole].lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {mockAccountMap[selectedRole].firstName} {mockAccountMap[selectedRole].lastName}
                    </p>
                    <p className="text-xs text-emerald-300/40">
                      {mockAccountMap[selectedRole].firstName.toLowerCase().replace(/\s+/g, '')}.{mockAccountMap[selectedRole].lastName.toLowerCase()}@nnpcretail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-300/40">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  NNPC Retail Employee Portal
                </div>
              </div>

              <p className="text-xs text-emerald-300/30 text-center mb-6">
                Are you trying to sign in? Enter the number shown above in your Authenticator app, or tap the button below to simulate approval.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleSsoMfaApprove}
                  disabled={ssoApproving}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 transition-all duration-200"
                >
                  {ssoApproving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'I\'ve approved the sign-in request'
                  )}
                </button>
                <button
                  onClick={() => { setStep('credentials'); setSsoApproving(false); }}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-emerald-300/70 hover:bg-white/10 focus:outline-none transition-colors"
                >
                  Back to Sign In
                </button>
              </div>

              <p className="text-center text-emerald-400/20 text-xs mt-8">
                NNPC Retail Limited &copy; 2026
              </p>
            </motion.div>
          ) : step === 'credentials' ? (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <img src="/nnpc-logo.png" alt="NNPC" className="h-12 w-auto object-contain" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
              <p className="text-emerald-300/50 text-sm mb-8">
                Select a role and enter any credentials to continue.
              </p>

              {/* Microsoft AD SSO */}
              <button
                type="button"
                disabled={ssoLoading}
                onClick={handleSsoLogin}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 transition-all flex items-center justify-center gap-3"
              >
                {ssoLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting to Active Directory...
                  </span>
                ) : (
                  <>
                    <svg viewBox="0 0 21 21" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                    </svg>
                    Sign in with Active Directory
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0d1f14] px-3 text-xs text-emerald-300/40 uppercase tracking-wider">or sign in with credentials</span>
                </div>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-medium text-emerald-200/60 uppercase tracking-wider mb-2">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-colors"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role} className="bg-[#1a2f22] text-white">
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview: who you'll log in as */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-300">
                        {selectedAccount.firstName[0]}{selectedAccount.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedAccount.firstName} {selectedAccount.lastName}
                      </p>
                      <p className="text-xs font-mono text-emerald-300/50">{selectedAccount.id}</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-emerald-200/60 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`${selectedAccount.firstName.toLowerCase()}.${selectedAccount.lastName.toLowerCase()}@nnpcretail.com`}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-emerald-200/60 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter any password"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-colors"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>

              <p className="text-center text-emerald-400/20 text-xs mt-8">
                NNPC Retail Limited &copy; 2026
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <img src="/nnpc-logo.png" alt="NNPC" className="h-12 w-auto object-contain" />
              </div>

              {/* Lock icon */}
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-emerald-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1 text-center">Verify OTP</h2>
              <p className="text-emerald-300/50 text-sm mb-2 text-center">
                Enter the 6-digit code sent to
              </p>
              <p className="text-emerald-300 text-sm font-mono mb-8 text-center">
                {maskedPhone}
              </p>

              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 mb-6 text-center"
                >
                  <p className="text-xs text-emerald-300/70">
                    Enter the 6-digit verification code sent to your phone.
                  </p>
                </motion.div>
              )}

              <div className="space-y-6">
                <OtpInput onComplete={handleOtpComplete} />

                {otpError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-red-400"
                  >
                    {otpError}
                  </motion.p>
                )}

                {isVerifying && (
                  <div className="flex justify-center">
                    <svg className="animate-spin h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}

                {/* Resend */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-emerald-300/40">
                      Resend code in <span className="font-mono font-bold text-emerald-300/60">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                {/* Back button */}
                <button
                  onClick={() => { setStep('credentials'); setOtpError(''); setOtpSent(false); }}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-emerald-300/70 hover:bg-white/10 focus:outline-none transition-colors"
                >
                  Back to Sign In
                </button>
              </div>

              <p className="text-center text-emerald-400/20 text-xs mt-8">
                NNPC Retail Limited &copy; 2026
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
