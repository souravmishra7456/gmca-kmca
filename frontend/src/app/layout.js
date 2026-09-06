import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
