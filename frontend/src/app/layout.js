import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SiteFooter from "@/components/layout/SiteFooter";
import { Toaster } from "sonner";
import { APP_FULL_NAME } from "@/lib/constants";
import { SITE_KEYWORDS, SITE_URL, siteMetadataBase } from "@/lib/site";
import "./globals.css";

export const metadata = {
  ...(siteMetadataBase ? { metadataBase: siteMetadataBase } : {}),
  title: {
    default: "GMCA & KMCA | Cricket in Khordha, Odisha",
    template: "%s | GMCA & KMCA",
  },
  description:
    `${APP_FULL_NAME} brings members together through cricket in Khordha, Odisha. View association information, notices, team announcements, fixtures, and public scorecards.`,
  applicationName: "GMCA & KMCA",
  keywords: SITE_KEYWORDS,
  verification: {
    google: "vlbin4aTrQE8zViQM6FhohFDbWpx3KUAmM5PsFZBwkw",
  },
  openGraph: {
    type: "website",
    siteName: "GMCA & KMCA",
    title: "GMCA & KMCA | Cricket in Khordha, Odisha",
    description:
      "Association information, notices, team announcements, fixtures, and public scorecards from GMCA & KMCA in Khordha, Odisha.",
    locale: "en_IN",
    ...(SITE_URL ? { url: SITE_URL, images: ["/images/gmca-logo.jpg"] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "GMCA & KMCA | Cricket in Khordha, Odisha",
    description:
      "Association information, notices, team announcements, fixtures, and public scorecards from GMCA & KMCA.",
    ...(SITE_URL ? { images: ["/images/gmca-logo.jpg"] } : {}),
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
