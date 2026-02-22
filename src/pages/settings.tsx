import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Settings, Moon, Sun, Bell, Shield, Globe, Monitor, Banknote } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '@/lib/utils';
import { NairaIcon } from '@/components/shared/naira-icon';

function SettingSection({ title, icon: Icon, children }: { title: string; icon: typeof Settings; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--primary)]" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={cn(
          'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2',
          checked
            ? 'bg-[var(--primary)]'
            : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <span className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}

const CURRENCY_INFO: { code: string; label: string; symbol: string; flag: string }[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
];

export function SettingsPage() {
  const { isDark, toggleTheme, language, setLanguage, currentUser, currencyRates, setCurrencyRates } = useAppStore();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [shiftReminder, setShiftReminder] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [editingRates, setEditingRates] = useState<Record<string, string>>({});
  const [isEditingRates, setIsEditingRates] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ha', label: 'Hausa' },
    { code: 'yo', label: 'Yoruba' },
    { code: 'ig', label: 'Igbo' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'pt', label: 'Português' },
  ];

  const handleToggle = (name: string, value: boolean, setter: (v: boolean) => void) => {
    setter(!value);
    toast.success(`${name} ${!value ? 'enabled' : 'disabled'}`, {
      description: `Notification preference updated.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your application preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <SettingSection title="Appearance" icon={Monitor}>
            <div className="space-y-1 divide-y divide-[var(--border)]">
              <ToggleRow
                label="Dark Mode"
                description="Switch between light and dark theme"
                checked={isDark}
                onChange={toggleTheme}
              />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Theme Preview</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Current: {isDark ? 'Dark' : 'Light'}</p>
                </div>
                {isDark ? <Moon className="h-5 w-5 text-[var(--primary)]" /> : <Sun className="h-5 w-5 text-amber-500" />}
              </div>
            </div>
          </SettingSection>

          <SettingSection title="Notifications" icon={Bell}>
            <div className="space-y-1 divide-y divide-[var(--border)]">
              <ToggleRow
                label="Email Notifications"
                description="Receive email alerts for important events"
                checked={emailNotif}
                onChange={() => handleToggle('Email notifications', emailNotif, setEmailNotif)}
              />
              <ToggleRow
                label="Push Notifications"
                description="Browser push notifications"
                checked={pushNotif}
                onChange={() => handleToggle('Push notifications', pushNotif, setPushNotif)}
              />
              <ToggleRow
                label="Shift Reminders"
                description="Get notified before your shift starts"
                checked={shiftReminder}
                onChange={() => handleToggle('Shift reminders', shiftReminder, setShiftReminder)}
              />
            </div>
          </SettingSection>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <SettingSection title="Language" icon={Globe}>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              Choose your preferred interface language.
            </p>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                // Trigger Google Translate
                const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
                if (combo) {
                  combo.value = e.target.value;
                  combo.dispatchEvent(new Event('change'));
                } else {
                  // Fallback: set cookie and reload
                  document.cookie = `googtrans=/en/${e.target.value};path=/;`;
                  document.cookie = `googtrans=/en/${e.target.value};path=/;domain=${window.location.hostname}`;
                  window.location.reload();
                }
              }}
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </SettingSection>

          <SettingSection title="Security" icon={Shield}>
            <div className="space-y-1 divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Change Password</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Update your account password</p>
                </div>
                <button
                  onClick={() => toast.info('Password change dialog', { description: 'This feature will be available when connected to a backend.' })}
                  className="rounded-lg border border-[var(--input)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Change
                </button>
              </div>
              <ToggleRow
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                checked={twoFactorEnabled}
                onChange={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  toast.success(`Two-factor auth ${!twoFactorEnabled ? 'enabled' : 'disabled'}`, {
                    description: !twoFactorEnabled ? 'Your account is now more secure.' : '2FA has been turned off.',
                  });
                }}
              />
            </div>
          </SettingSection>

          <SettingSection title="About" icon={Settings}>
            <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <p><strong className="text-[var(--foreground)]">App:</strong> NRL Employee Management Tool</p>
              <p><strong className="text-[var(--foreground)]">Version:</strong> 1.0.0</p>
              <p><strong className="text-[var(--foreground)]">Organization:</strong> NNPC Retail Limited</p>
            </div>
          </SettingSection>
        </motion.div>
      </div>

      {/* Currency Rates — Admin Only */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Banknote className="h-4 w-4 text-[var(--primary)]" />
                Currency Exchange Rates
                <span className="ml-2 inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)] uppercase">
                  Admin Only
                </span>
              </h3>
              {!isEditingRates ? (
                <button
                  onClick={() => {
                    setEditingRates(
                      Object.fromEntries(
                        Object.entries(currencyRates).map(([k, v]) => [k, String(v)])
                      )
                    );
                    setIsEditingRates(true);
                  }}
                  className="rounded-lg border border-[var(--input)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Edit Rates
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingRates(false)}
                    className="rounded-lg border border-[var(--input)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const parsed: Record<string, number> = {};
                      let hasError = false;
                      for (const [code, val] of Object.entries(editingRates)) {
                        const num = parseFloat(val);
                        if (isNaN(num) || num <= 0) {
                          toast.error(`Invalid rate for ${code}`, { description: 'Rate must be a positive number.' });
                          hasError = true;
                          break;
                        }
                        parsed[code] = num;
                      }
                      if (hasError) return;
                      setCurrencyRates(parsed);
                      setIsEditingRates(false);
                      toast.success('Currency rates updated', {
                        description: 'New exchange rates have been saved.',
                      });
                    }}
                    className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                  >
                    Save Rates
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-[var(--muted-foreground)] mb-4">
              Set the NGN exchange rate for each currency. These rates are used across compensation reports.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CURRENCY_INFO.map((c) => {
                const rate = isEditingRates
                  ? editingRates[c.code] ?? String(currencyRates[c.code] ?? '')
                  : currencyRates[c.code];

                return (
                  <div
                    key={c.code}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {c.symbol} 1 {c.code}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{c.label}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--muted-foreground)]">=</span>
                      <NairaIcon className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      {isEditingRates ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingRates[c.code] ?? ''}
                          onChange={(e) => setEditingRates((prev) => ({ ...prev, [c.code]: e.target.value }))}
                          className="w-24 rounded-md border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                      ) : (
                        <span className="text-sm font-bold font-mono text-[var(--foreground)]">
                          {Number(rate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-[var(--muted-foreground)] mt-3">
              Last updated by {currentUser?.employee.firstName} {currentUser?.employee.lastName}. Only Super Admin can modify these rates.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
