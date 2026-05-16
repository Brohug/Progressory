const iconPaths = {
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2.2" />
      <rect x="13" y="4" width="7" height="5" rx="2" />
      <rect x="13" y="11" width="7" height="9" rx="2.2" />
      <rect x="4" y="13" width="7" height="7" rx="2.2" />
    </>
  ),
  planner: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3.2" />
      <path d="M4 9.5h16" />
      <path d="M8 3v4M16 3v4" />
      <path d="M8 13h3M13 13h3M8 17h8" />
    </>
  ),
  logs: (
    <>
      <path d="M7 3.5h8l3 3V19a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 5 19V6a2.5 2.5 0 0 1 2-2.5Z" />
      <path d="M15 3.5V7h3" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5" />
    </>
  ),
  members: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 19.5c.9-3.1 3.2-5 5.5-5s4.6 1.9 5.5 5" />
      <circle cx="17.5" cy="9.5" r="2.5" />
      <path d="M16 15.2c2 .2 3.8 1.6 4.5 4.1" />
    </>
  ),
  curriculum: (
    <>
      <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v16H8.5A2.5 2.5 0 0 0 6 21.5z" />
      <path d="M6 5.5V21.5" />
      <path d="M9.5 7.5h6M9.5 11h6M9.5 14.5h4.5" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  library: (
    <>
      <path d="M5.5 6.5A2.5 2.5 0 0 1 8 4h10.5v14H8a2.5 2.5 0 0 0-2.5 2.5z" />
      <path d="M5.5 6.5V20.5" />
      <path d="M9 8.2h5.5M9 11.6h6.8M9 15h4.4" />
      <path d="M16.5 13.5l1.5 1.5 2.5-3" />
    </>
  ),
  trees: (
    <>
      <circle cx="12" cy="5" r="2.7" />
      <circle cx="6" cy="18.5" r="2.7" />
      <circle cx="18" cy="18.5" r="2.7" />
      <path d="M12 7.8v4.1M12 11.9H6M12 11.9h6M6 14.6v1.2M18 14.6v1.2" />
    </>
  ),
  reports: (
    <>
      <path d="M4 20h16" />
      <path d="M7 17V11" />
      <path d="M12 17V7" />
      <path d="M17 17v-4" />
      <path d="M6 7.5 10 11l3-3 4 2.5" />
    </>
  ),
  scenarios: (
    <>
      <rect x="3.8" y="4.3" width="6.6" height="6.6" rx="2" />
      <rect x="13.6" y="4.3" width="6.6" height="6.6" rx="2" />
      <rect x="8.7" y="13.1" width="6.6" height="6.6" rx="2" />
      <path d="M10.4 7.6h3.2M12 10.9v2.2" />
    </>
  ),
  topics: (
    <>
      <path d="M12 3.8l7.2 7.2L12 18.2 4.8 11z" />
      <path d="M12 8.2h.01" />
      <path d="M15.8 14.8l3.4 3.4" />
    </>
  ),
  programs: (
    <>
      <rect x="4" y="5" width="10" height="3" rx="1.5" />
      <rect x="4" y="10.5" width="16" height="3" rx="1.5" />
      <rect x="4" y="16" width="8" height="3" rx="1.5" />
      <path d="M16.8 5.6l2.5 2.4-2.5 2.4" />
    </>
  ),
  staff: (
    <>
      <path d="M12 3.5 19 6v5.3c0 4.6-3.1 7.6-7 9.7-3.9-2.1-7-5.1-7-9.7V6z" />
      <path d="m9.2 12.3 1.8 1.8 3.8-3.8" />
    </>
  ),
  progress: (
    <>
      <path d="M4.5 17.5 9 13l3 3 7-8" />
      <path d="M14.5 8H19v4.5" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M5 20c1.2-3.2 3.8-5.1 7-5.1s5.8 1.9 7 5.1" />
    </>
  ),
  logout: (
    <>
      <path d="M9 6.5V4.8A1.8 1.8 0 0 1 10.8 3h7.4A1.8 1.8 0 0 1 20 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8h-7.4A1.8 1.8 0 0 1 9 19.2v-1.7" />
      <path d="M14 12H4.5" />
      <path d="m7.8 8.7-3.3 3.3 3.3 3.3" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  attendance: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3.2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
      <path d="m8.6 14.2 2.1 2.1 4.7-4.7" />
    </>
  ),
  classes: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3.2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
      <path d="M8 13.2h8M8 16.8h5" />
    </>
  ),
  create: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="5.8" />
      <path d="m15 15 4 4" />
    </>
  ),
  study: (
    <>
      <path d="M4.5 18.5c2-.9 3.9-1.4 5.8-1.4 2.2 0 4.2.6 5.7 1.5 1.8-.9 3.7-1.4 5.5-1.4V6.2c-1.7 0-3.7.5-5.5 1.4-1.6-.9-3.6-1.4-5.7-1.4-1.9 0-3.8.5-5.8 1.4z" />
      <path d="M10.4 6.3v10.8M15.9 7.6v10.7" />
    </>
  )
};

export default function AppIcon({ name, className = '', title = '' }) {
  const icon = iconPaths[name] || iconPaths.dashboard;
  const combinedClassName = ['app-icon', className].filter(Boolean).join(' ');

  return (
    <svg
      className={combinedClassName}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : 'presentation'}
    >
      {title ? <title>{title}</title> : null}
      {icon}
    </svg>
  );
}
