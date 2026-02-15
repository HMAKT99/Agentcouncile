import { cn, formatCategory } from "@/lib/utils";
import { STATUS_COLORS, SEVERITY_COLORS } from "@/lib/constants";

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const colorClass = STATUS_COLORS[status] || "text-muted bg-muted/10 border-muted/20";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {formatCategory(status)}
    </span>
  );
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: string;
  className?: string;
}) {
  const colorClass = SEVERITY_COLORS[severity] || "text-muted bg-muted/10 border-muted/20";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase",
        colorClass,
        className
      )}
    >
      {severity}
    </span>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-muted bg-surface-elevated",
        className
      )}
    >
      {formatCategory(category)}
    </span>
  );
}
