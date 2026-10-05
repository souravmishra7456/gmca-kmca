export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";

export const SITE_KEYWORDS = [
  "GMCA",
  "KMCA",
  "Gayatri Mandir Cricket Association",
  "Kalyan Mandap Cricket Association",
  "cricket association",
  "cricket Khordha",
  "cricket Odisha",
  "Khordha cricket matches",
];

export const siteMetadataBase = SITE_URL ? new URL(SITE_URL) : undefined;
