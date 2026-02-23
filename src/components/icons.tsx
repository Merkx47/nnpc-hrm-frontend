import type { SVGAttributes, ReactNode, JSX } from 'react';

type IconProps = SVGAttributes<SVGSVGElement>;

/** Base wrapper — every custom icon inherits defaults from here. */
function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  1. LayoutDashboard – 2×2 grid, top-left panel wider               */
/* ------------------------------------------------------------------ */
export function LayoutDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      {/* filled accent on the large panel */}
      <rect x="3" y="3" width="10" height="9" rx="1.5" fill="currentColor" opacity="0.15" />
      {/* large panel outline */}
      <rect x="3" y="3" width="10" height="9" rx="1.5" />
      {/* top-right small panel */}
      <rect x="15" y="3" width="6" height="9" rx="1.5" />
      {/* bottom-left small panel */}
      <rect x="3" y="14" width="6" height="7" rx="1.5" />
      {/* bottom-right panel */}
      <rect x="11" y="14" width="10" height="7" rx="1.5" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Users – two overlapping silhouettes                             */
/* ------------------------------------------------------------------ */
export function Users(props: IconProps) {
  return (
    <Icon {...props}>
      {/* front person head – filled accent */}
      <circle cx="9" cy="7.5" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="9" cy="7.5" r="3" />
      {/* front person body */}
      <path d="M3 20.5v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      {/* back person head */}
      <circle cx="16.5" cy="6.5" r="2.5" />
      {/* back person body */}
      <path d="M18 14.5a4 4 0 0 1 3 3.87V20" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  3. UserPlus – person with "+" sign                                 */
/* ------------------------------------------------------------------ */
export function UserPlus(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="7" r="3.5" />
      <path d="M3 21v-1.5a5.5 5.5 0 0 1 5.5-5.5h1a5.5 5.5 0 0 1 3.2 1" />
      {/* plus sign */}
      <line x1="19" y1="14" x2="19" y2="20" />
      <line x1="16" y1="17" x2="22" y2="17" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  4. ArrowLeftRight – two horizontal opposing arrows                 */
/* ------------------------------------------------------------------ */
export function ArrowLeftRight(props: IconProps) {
  return (
    <Icon {...props}>
      {/* top arrow pointing right */}
      <line x1="4" y1="8" x2="20" y2="8" />
      <polyline points="16,4 20,8 16,12" />
      {/* bottom arrow pointing left */}
      <line x1="20" y1="16" x2="4" y2="16" />
      <polyline points="8,12 4,16 8,20" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Briefcase – with handle and clasp                               */
/* ------------------------------------------------------------------ */
export function Briefcase(props: IconProps) {
  return (
    <Icon {...props}>
      {/* filled body accent */}
      <rect x="2" y="7" width="20" height="13" rx="2" fill="currentColor" opacity="0.15" />
      {/* body */}
      <rect x="2" y="7" width="20" height="13" rx="2" />
      {/* handle */}
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
      {/* clasp / belt */}
      <line x1="2" y1="13" x2="22" y2="13" />
      <rect x="10" y="11" width="4" height="4" rx="0.75" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  6. FileText – document with folded corner and text lines           */
/* ------------------------------------------------------------------ */
export function FileText(props: IconProps) {
  return (
    <Icon {...props}>
      {/* document outline with folded corner */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      {/* fold */}
      <polyline points="14,2 14,8 20,8" />
      {/* text lines */}
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="16.5" x2="14" y2="16.5" />
      <line x1="8" y1="10" x2="11" y2="10" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  7. ClipboardCheck – clipboard with checkmark                       */
/* ------------------------------------------------------------------ */
export function ClipboardCheck(props: IconProps) {
  return (
    <Icon {...props}>
      {/* board */}
      <rect x="4" y="4" width="16" height="18" rx="2" />
      {/* clipboard tab */}
      <path d="M9 2h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      {/* checkmark */}
      <polyline points="8.5,13 11,15.5 15.5,10.5" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  8. GraduationCap – mortarboard with tassel                         */
/* ------------------------------------------------------------------ */
export function GraduationCap(props: IconProps) {
  return (
    <Icon {...props}>
      {/* filled cap accent */}
      <polygon points="12,3 2,9 12,15 22,9" fill="currentColor" opacity="0.15" />
      {/* cap outline */}
      <polygon points="12,3 2,9 12,15 22,9" />
      {/* sides dropping down */}
      <path d="M6 11v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
      {/* tassel */}
      <line x1="22" y1="9" x2="22" y2="15" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  9. BookOpen – open book with visible pages                         */
/* ------------------------------------------------------------------ */
export function BookOpen(props: IconProps) {
  return (
    <Icon {...props}>
      {/* left page */}
      <path d="M2 4.5C4.5 3 7 3 12 5v15c-5-2-7.5-2-10-0.5V4.5Z" />
      {/* right page */}
      <path d="M22 4.5C19.5 3 17 3 12 5v15c5-2 7.5-2 10-0.5V4.5Z" />
      {/* spine */}
      <line x1="12" y1="5" x2="12" y2="20" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 10. ClipboardList – clipboard with bullet list                      */
/* ------------------------------------------------------------------ */
export function ClipboardList(props: IconProps) {
  return (
    <Icon {...props}>
      {/* board */}
      <rect x="4" y="4" width="16" height="18" rx="2" />
      {/* tab */}
      <path d="M9 2h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      {/* bullet lines */}
      <circle cx="8.5" cy="10.5" r="0.75" fill="currentColor" stroke="none" />
      <line x1="11" y1="10.5" x2="16" y2="10.5" />
      <circle cx="8.5" cy="14" r="0.75" fill="currentColor" stroke="none" />
      <line x1="11" y1="14" x2="16" y2="14" />
      <circle cx="8.5" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
      <line x1="11" y1="17.5" x2="15" y2="17.5" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 11. Award – medal with ribbon                                       */
/* ------------------------------------------------------------------ */
export function Award(props: IconProps) {
  return (
    <Icon {...props}>
      {/* medal circle filled accent */}
      <circle cx="12" cy="9" r="5" fill="currentColor" opacity="0.15" />
      <circle cx="12" cy="9" r="5" />
      {/* ribbon left */}
      <path d="M8.5 13.5 6 21l3.5-1.5L12 21" />
      {/* ribbon right */}
      <path d="M15.5 13.5 18 21l-3.5-1.5L12 21" />
      {/* inner star detail */}
      <path d="M12 6.5l1 2 2 .3-1.5 1.4.4 2L12 11.2l-1.9 1 .4-2L9 8.8l2-.3 1-2Z" fill="currentColor" stroke="none" opacity="0.4" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 12. TrendingUp – upward line with arrow tip                         */
/* ------------------------------------------------------------------ */
export function TrendingUp(props: IconProps) {
  return (
    <Icon {...props}>
      <polyline points="3,18 9,12 13,15 21,6" />
      <polyline points="16,6 21,6 21,11" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 13. BarChart3 – three vertical bars                                 */
/* ------------------------------------------------------------------ */
export function BarChart3(props: IconProps) {
  return (
    <Icon {...props}>
      {/* filled bar accents */}
      <rect x="4" y="14" width="4" height="7" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="16" y="4" width="4" height="17" rx="1" fill="currentColor" opacity="0.15" />
      {/* bar outlines */}
      <rect x="4" y="14" width="4" height="7" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="16" y="4" width="4" height="17" rx="1" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Target – bullseye with three rings and center dot               */
/* ------------------------------------------------------------------ */
export function Target(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 15. Star – five-point star                                          */
/* ------------------------------------------------------------------ */
export function Star(props: IconProps) {
  return (
    <Icon {...props}>
      <polygon
        points="12,2.5 14.9,8.4 21.5,9.3 16.75,13.9 17.8,20.5 12,17.4 6.2,20.5 7.25,13.9 2.5,9.3 9.1,8.4"
        fill="currentColor"
        opacity="0.15"
      />
      <polygon
        points="12,2.5 14.9,8.4 21.5,9.3 16.75,13.9 17.8,20.5 12,17.4 6.2,20.5 7.25,13.9 2.5,9.3 9.1,8.4"
      />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 16. Clock – clock face with hands                                   */
/* ------------------------------------------------------------------ */
export function Clock(props: IconProps) {
  return (
    <Icon {...props}>
      {/* filled circle accent */}
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.15" />
      <circle cx="12" cy="12" r="9.5" />
      {/* hour hand */}
      <line x1="12" y1="12" x2="12" y2="7.5" />
      {/* minute hand */}
      <line x1="12" y1="12" x2="16" y2="12" />
      {/* center dot */}
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 17. Calendar – calendar with top binding and grid                    */
/* ------------------------------------------------------------------ */
export function Calendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      {/* top bindings */}
      <line x1="8" y1="2.5" x2="8" y2="7" />
      <line x1="16" y1="2.5" x2="16" y2="7" />
      {/* header divider */}
      <line x1="3" y1="10" x2="21" y2="10" />
      {/* grid dots */}
      <circle cx="8" cy="14" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 18. CalendarCheck – calendar with checkmark                         */
/* ------------------------------------------------------------------ */
export function CalendarCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="8" y1="2.5" x2="8" y2="7" />
      <line x1="16" y1="2.5" x2="16" y2="7" />
      <line x1="3" y1="10" x2="21" y2="10" />
      {/* checkmark */}
      <polyline points="8.5,15 11,17.5 16,13" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 19. Activity – ECG heartbeat line                                   */
/* ------------------------------------------------------------------ */
export function Activity(props: IconProps) {
  return (
    <Icon {...props}>
      <polyline points="2,12 6,12 8.5,5 11.5,19 14,9 16,14 18,12 22,12" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 20. AlertTriangle – warning triangle with "!"                       */
/* ------------------------------------------------------------------ */
export function AlertTriangle(props: IconProps) {
  return (
    <Icon {...props}>
      {/* filled accent */}
      <path
        d="M10.3 3.8a2 2 0 0 1 3.4 0l7.8 13.2A2 2 0 0 1 19.8 20H4.2a2 2 0 0 1-1.7-2.97L10.3 3.8Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path d="M10.3 3.8a2 2 0 0 1 3.4 0l7.8 13.2A2 2 0 0 1 19.8 20H4.2a2 2 0 0 1-1.7-2.97L10.3 3.8Z" />
      {/* exclamation */}
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 21. Wallet – folded wallet                                          */
/* ------------------------------------------------------------------ */
export function Wallet(props: IconProps) {
  return (
    <Icon {...props}>
      {/* wallet body */}
      <rect x="2" y="6" width="20" height="14" rx="2" />
      {/* flap */}
      <path d="M2 6V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1" />
      {/* card slot / clasp area */}
      <rect x="15" y="11" width="7" height="4.5" rx="1.5" />
      <circle cx="18" cy="13.25" r="0.75" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 22. DollarSign – Naira-like: vertical stroke with two horizontals   */
/* ------------------------------------------------------------------ */
export function DollarSign(props: IconProps) {
  return (
    <Icon {...props}>
      {/* vertical stroke */}
      <line x1="12" y1="2" x2="12" y2="22" />
      {/* two horizontal crossing lines (Naira style) */}
      <line x1="6" y1="9" x2="18" y2="9" />
      <line x1="6" y1="15" x2="18" y2="15" />
      {/* curved top and bottom arcs for a currency feel */}
      <path d="M8 5.5c1-1 2.5-1.5 4-1.5s3 .5 4 1.5" />
      <path d="M8 18.5c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 23. Gift – gift box with ribbon and bow                             */
/* ------------------------------------------------------------------ */
export function Gift(props: IconProps) {
  return (
    <Icon {...props}>
      {/* lid */}
      <rect x="3" y="8" width="18" height="4" rx="1" />
      {/* box body */}
      <rect x="4" y="12" width="16" height="9" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="4" y="12" width="16" height="9" rx="1" />
      {/* vertical ribbon */}
      <line x1="12" y1="8" x2="12" y2="21" />
      {/* bow left */}
      <path d="M12 8c-2-2-5-2.5-5 0s3 2 5 0" />
      {/* bow right */}
      <path d="M12 8c2-2 5-2.5 5 0s-3 2-5 0" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 24. Receipt – bill with zigzag bottom                               */
/* ------------------------------------------------------------------ */
export function Receipt(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 2h14a1 1 0 0 1 1 1v18l-2.5-1.5L15 21l-2.5-1.5L10 21l-2.5-1.5L5 21V3a1 1 0 0 1 0 0Z" />
      {/* text lines */}
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="10.5" x2="14" y2="10.5" />
      <line x1="8" y1="14" x2="12" y2="14" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 25. MapPin – location pin with inner dot                            */
/* ------------------------------------------------------------------ */
export function MapPin(props: IconProps) {
  return (
    <Icon {...props}>
      {/* pin shape filled accent */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      {/* inner dot */}
      <circle cx="12" cy="9" r="2.5" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 26. FolderOpen – open folder with documents                         */
/* ------------------------------------------------------------------ */
export function FolderOpen(props: IconProps) {
  return (
    <Icon {...props}>
      {/* back panel */}
      <path d="M3 6V4.5A1.5 1.5 0 0 1 4.5 3h4l2 2.5H19.5A1.5 1.5 0 0 1 21 7v1" />
      {/* open folder body */}
      <path d="M1.5 10a1.5 1.5 0 0 1 1.47-1.5h18.06a1.5 1.5 0 0 1 1.47 1.8l-1.5 8a1.5 1.5 0 0 1-1.47 1.2H4.47a1.5 1.5 0 0 1-1.47-1.2l-1.5-8Z" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 27. Bell – notification bell                                        */
/* ------------------------------------------------------------------ */
export function Bell(props: IconProps) {
  return (
    <Icon {...props}>
      {/* bell body filled accent */}
      <path
        d="M6 10a6 6 0 0 1 12 0c0 3.5 1.5 5.5 2.5 7H3.5c1-1.5 2.5-3.5 2.5-7Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path d="M6 10a6 6 0 0 1 12 0c0 3.5 1.5 5.5 2.5 7H3.5c1-1.5 2.5-3.5 2.5-7Z" />
      {/* clapper */}
      <path d="M10 17v0.5a2 2 0 0 0 4 0V17" />
      {/* top nub */}
      <line x1="12" y1="2" x2="12" y2="4" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 28. Settings – gear / cog                                           */
/* ------------------------------------------------------------------ */
export function Settings(props: IconProps) {
  return (
    <Icon {...props}>
      {/* outer gear shape */}
      <path d="M12.22 2h-.44a1.5 1.5 0 0 0-1.5 1.36l-.14 1.13a7 7 0 0 0-1.72 1l-1.06-.43a1.5 1.5 0 0 0-1.82.56l-.22.38a1.5 1.5 0 0 0 .32 1.92l.92.7a7 7 0 0 0 0 2l-.92.7a1.5 1.5 0 0 0-.32 1.92l.22.38a1.5 1.5 0 0 0 1.82.56l1.06-.43a7 7 0 0 0 1.72 1l.14 1.13a1.5 1.5 0 0 0 1.5 1.36h.44a1.5 1.5 0 0 0 1.5-1.36l.14-1.13a7 7 0 0 0 1.72-1l1.06.43a1.5 1.5 0 0 0 1.82-.56l.22-.38a1.5 1.5 0 0 0-.32-1.92l-.92-.7a7 7 0 0 0 0-2l.92-.7a1.5 1.5 0 0 0 .32-1.92l-.22-.38a1.5 1.5 0 0 0-1.82-.56l-1.06.43a7 7 0 0 0-1.72-1l-.14-1.13A1.5 1.5 0 0 0 12.22 2Z" />
      {/* center circle */}
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 29. ChevronLeft – left pointing chevron                             */
/* ------------------------------------------------------------------ */
export function ChevronLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <polyline points="15,4 8,12 15,20" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 30. ChevronRight – right pointing chevron                           */
/* ------------------------------------------------------------------ */
export function ChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <polyline points="9,4 16,12 9,20" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* 31. X – close mark                                                  */
/* ------------------------------------------------------------------ */
export function X(props: IconProps) {
  return (
    <Icon {...props}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/*  ShieldCheck – shield with checkmark (Approvals)                    */
/* ------------------------------------------------------------------ */
export function ShieldCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 2l8 4v6c0 5.25-3.5 8.25-8 10-4.5-1.75-8-4.75-8-10V6l8-4Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path d="M12 2l8 4v6c0 5.25-3.5 8.25-8 10-4.5-1.75-8-4.75-8-10V6l8-4Z" />
      <polyline points="8.5,12 11,14.5 16,9.5" />
    </Icon>
  );
}

/* ================================================================== */
/*  Icon Map — lookup by string name                                   */
/* ================================================================== */
export const iconMap: Record<string, (props: IconProps) => JSX.Element> = {
  LayoutDashboard,
  Users,
  UserPlus,
  ArrowLeftRight,
  Briefcase,
  FileText,
  ClipboardCheck,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Award,
  TrendingUp,
  BarChart3,
  Target,
  Star,
  Clock,
  Calendar,
  CalendarCheck,
  Activity,
  AlertTriangle,
  Wallet,
  DollarSign,
  Gift,
  Receipt,
  MapPin,
  FolderOpen,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
};
