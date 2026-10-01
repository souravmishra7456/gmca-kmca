import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SiteFooter from "@/components/layout/SiteFooter";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "GMCA & KMCA | Cricket Association",
  description:
    "Gayatri Mandir Cricket Association and Kalyan Mandap Cricket Association member portal.",
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
