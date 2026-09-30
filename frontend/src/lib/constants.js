export const APP_NAME = "GMCA & KMCA";
export const GMCA_NAME = "Gayatri Mandir Cricket Association";
export const KMCA_NAME = "Kalyan Mandap Cricket Association";
export const APP_FULL_NAME = `${GMCA_NAME} (GMCA) & ${KMCA_NAME} (KMCA)`;

export const ROLES = {
  CHAIRMAN: "chairman",
  DIRECTOR: "director",
  PLAYER: "player",
};

export const ROLE_LABELS = {
  chairman: "Chairman",
  director: "Director",
  player: "Player",
};

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/dashboard", icon: "LayoutDashboard" },
  { label: "Profile", href: "/portal/profile", icon: "User" },
  { label: "Players", href: "/portal/players", icon: "Users" },
  { label: "Notices", href: "/portal/notices", icon: "Bell" },
  { label: "Team Selection", href: "/portal/team-selection", icon: "ClipboardCheck" },
];

export const CHAIRMAN_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: "Manage Stats", href: "/portal/player-stats", icon: "ChartNoAxesCombined" },
  { label: "Manage Members", href: "/portal/members", icon: "UserCog" },
  { label: "Password Requests", href: "/portal/password-requests", icon: "KeyRound" },
  { label: "Activity Log", href: "/portal/activity-log", icon: "History" },
];

export const DIRECTOR_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: "Manage Stats", href: "/portal/player-stats", icon: "ChartNoAxesCombined" },
];

export const AUTH_COOKIE_NAME = "token";
