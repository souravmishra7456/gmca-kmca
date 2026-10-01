import { APP_FULL_NAME } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-card py-6 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground sm:text-sm">
          &copy; {new Date().getFullYear()} {APP_FULL_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
