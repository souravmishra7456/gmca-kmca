export const APP_NAME = "GMCA-KMCA";
export const APP_FULL_NAME =
  "Gujarat & Maharashtra Cricket Association - Kolhapur Maharashtra Cricket Association";

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
];

export const CHAIRMAN_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: "Manage Stats", href: "/portal/player-stats", icon: "ChartNoAxesCombined" },
  { label: "Manage Members", href: "/portal/members", icon: "UserCog" },
];

export const DIRECTOR_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: "Manage Stats", href: "/portal/player-stats", icon: "ChartNoAxesCombined" },
];

export const AUTH_COOKIE_NAME = "token";
