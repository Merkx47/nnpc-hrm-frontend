import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';
import { getInitials } from '@/lib/formatters';
import { Menu, Sun, Moon, Bell, LogOut, User, Settings, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { GlobalFilterBar } from './global-filter-bar';

// ── Language data ────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ha', label: 'Hausa', short: 'HA' },
  { code: 'yo', label: 'Yoruba', short: 'YO' },
  { code: 'ig', label: 'Igbo', short: 'IG' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ar', label: 'العربية', short: 'AR' },
  { code: 'pt', label: 'Português', short: 'PT' },
];

/** Trigger Google Translate programmatically */
function triggerGoogleTranslate(langCode: string) {
  // Method 1: Use the hidden combo box
  const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (combo) {
    combo.value = langCode;
    combo.dispatchEvent(new Event('change'));
    return;
  }
  // Method 2: Set the googtrans cookie and reload (fallback)
  document.cookie = `googtrans=/en/${langCode};path=/;`;
  document.cookie = `googtrans=/en/${langCode};path=/;domain=${window.location.hostname}`;
  window.location.reload();
}

export function Header() {
  const {
    currentUser, isDark, toggleTheme,
    setMobileSidebarOpen, notifications, markAllNotificationsRead,
    language, setLanguage,
  } = useAppStore();
  const [, setLocation] = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const unreadNotifs = notifications.filter((n) => !n.read);
  const activeLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLanguage(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentUser) return null;

  const employee = currentUser.employee;
  const initials = getInitials(employee.firstName, employee.lastName);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden rounded-md p-2 hover:bg-[var(--secondary)] transition-colors hover-elevate active-press"
          >
            <Menu className="h-5 w-5 text-[var(--foreground)]" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Employee Management</h2>
          </div>
        </div>

        {/* Center — Global Filters */}
        <div className="hidden lg:flex flex-1 justify-center mx-4">
          <GlobalFilterBar />
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language selector */}
          <div className="relative hidden sm:block" ref={langRef}>
            <button
              onClick={() => setShowLanguage(!showLanguage)}
              className="flex items-center gap-1.5 h-9 rounded-md border border-[var(--input)] bg-[var(--background)]/50 px-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              title="Change language"
            >
              <Globe className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <span className="font-medium text-xs">{activeLanguage.short}</span>
              <ChevronDown className="h-3 w-3 text-[var(--muted-foreground)]" />
            </button>
            {showLanguage && (
              <div className="absolute right-0 top-full mt-1.5 w-40 rounded-lg border border-[var(--border)] bg-[var(--popover)]/95 backdrop-blur-sm shadow-lg z-50 py-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLanguage(false);
                      triggerGoogleTranslate(l.code);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                      language === l.code
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                        : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                    )}
                  >
                    <span className="text-xs font-mono w-5">{l.short}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 hover:bg-[var(--secondary)] transition-colors hover-elevate active-press"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-[var(--foreground)]" />
            ) : (
              <Moon className="h-5 w-5 text-[var(--foreground)]" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-md p-2 hover:bg-[var(--secondary)] transition-colors hover-elevate active-press"
            >
              <Bell className="h-5 w-5 text-[var(--foreground)]" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--destructive)] text-[10px] font-bold text-white">
                  {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--popover)]/95 backdrop-blur-sm shadow-lg z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Notifications</h3>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors cursor-pointer',
                        !notif.read && 'bg-[var(--primary)]/5'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                        )}
                        <div className={cn(!notif.read ? '' : 'ml-4')}>
                          <p className="text-sm font-medium text-[var(--foreground)]">{notif.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-[var(--border)]">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setLocation('/notifications');
                    }}
                    className="text-xs text-[var(--primary)] hover:underline w-full text-center"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--secondary)] transition-colors hover-elevate active-press"
            >
              <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--primary-foreground)]">{initials}</span>
              </div>
              <div className="hidden xl:block text-left max-w-[140px]">
                <p className="text-sm font-medium text-[var(--foreground)] leading-tight truncate">
                  {employee.firstName} {employee.lastName}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] leading-tight truncate">
                  {ROLE_LABELS[currentUser.role]}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] hidden xl:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--popover)]/95 backdrop-blur-sm shadow-lg z-50">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{employee.id}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setLocation(`/employees/${employee.id}`);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setLocation('/settings');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-[var(--border)] py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      useAppStore.getState().setCurrentUser(null);
                      setLocation('/login');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
