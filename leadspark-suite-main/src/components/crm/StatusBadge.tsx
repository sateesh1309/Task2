import { LeadStatus, LeadTag, LeadPriority } from "@/types/lead";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-info/15 text-info border-info/40 shadow-[0_0_12px_hsl(var(--info)/0.35)]",
  Contacted: "bg-warning/15 text-warning border-warning/40 shadow-[0_0_12px_hsl(var(--warning)/0.35)]",
  Converted: "bg-success/15 text-success border-success/40 shadow-[0_0_12px_hsl(var(--success)/0.35)]",
  Lost: "bg-destructive/15 text-destructive border-destructive/40 shadow-[0_0_12px_hsl(var(--destructive)/0.35)]",
};

const TAG_STYLES: Record<LeadTag, string> = {
  Hot: "bg-destructive/15 text-destructive border-destructive/40 shadow-[0_0_10px_hsl(var(--destructive)/0.4)]",
  Warm: "bg-warning/15 text-warning border-warning/40",
  Cold: "bg-info/15 text-info border-info/40",
};

const PRI_STYLES: Record<LeadPriority, string> = {
  High: "bg-primary/15 text-primary border-primary/40",
  Medium: "bg-secondary/15 text-secondary border-secondary/40",
  Low: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function TagBadge({ tag, className }: { tag: LeadTag; className?: string }) {
  const icon = tag === "Hot" ? "🔥" : tag === "Warm" ? "☀️" : "❄️";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", TAG_STYLES[tag], className)}>
      <span>{icon}</span>{tag}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: LeadPriority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium", PRI_STYLES[priority], className)}>
      {priority}
    </span>
  );
}
