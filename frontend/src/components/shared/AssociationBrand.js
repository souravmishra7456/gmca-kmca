import Image from "next/image";
import { APP_FULL_NAME, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AssociationBrand({
  compact = false,
  className,
  imageSize = compact ? 40 : 56,
  subtitle = "Cricket Association",
  stacked = false,
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 gap-3",
        stacked ? "flex-col items-center text-center" : "items-center",
        className
      )}
    >
      <Image
        src="/images/gmca-logo.jpg"
        alt="Gayatri Mandir Cricket Association crest"
        width={imageSize}
        height={imageSize}
        className="shrink-0 rounded-full object-contain"
      />
      <div className="min-w-0">
        <p className={cn("font-bold leading-tight", compact ? "text-sm" : "text-base")}>
          {APP_NAME}
        </p>
        {!compact && (
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {APP_FULL_NAME}
          </p>
        )}
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
