import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { NNPCLogo, NNPCIcon } from '@/components/brand/nnpc-logo';
import { SIDEBAR_NAV } from '@/lib/constants';
import { iconMap, ChevronLeft, ChevronRight, X } from '@/components/icons';
import { useState } from 'react';

export function Sidebar() {
  const [location] = useLocation();
  const { currentUser, sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const role = currentUser?.role;
  if (!role) return null;

  const filteredNav = SIDEBAR_NAV.filter((item) => item.roles.includes(role));

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return location === '/dashboard' || location === '/';
    return location === href || location.startsWith(href + '/');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-[var(--sidebar-border)] h-16 px-4',
        sidebarCollapsed ? 'justify-center' : ''
      )}>
        {sidebarCollapsed ? (
          <NNPCIcon size={24} />
        ) : (
          <NNPCLogo size={28} />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {filteredNav.map((item) => {
          const Icon = iconMap[item.icon];
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const filteredChildren = item.children?.filter((child) => child.roles.includes(role!));

          return (
            <div key={item.label}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'flex items-center w-full gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover-elevate active-press',
                      isExpanded
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!sidebarCollapsed && isExpanded && filteredChildren && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[var(--sidebar-border)] pl-3">
                      {filteredChildren.map((child) => {
                        const ChildIcon = iconMap[child.icon];
                        const childActive = location === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileSidebarOpen(false)}
                          >
                            <span
                              className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer hover-elevate active-press',
                                childActive
                                  ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-medium'
                                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]'
                              )}
                            >
                              {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                              <span>{child.label}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <span
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer hover-elevate active-press',
                      active
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto rounded-full bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 text-xs font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle - desktop only */}
      <div className="border-t border-[var(--sidebar-border)] p-3 hidden lg:block">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] w-full transition-colors hover-elevate active-press"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transition-all duration-300 shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transform transition-transform duration-300 lg:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-[var(--sidebar-accent)] transition-colors"
          >
            <X className="h-5 w-5 text-[var(--sidebar-foreground)]" />
          </button>
        </div>
        <NavContent />
      </aside>
    </>
  );
}
