import { useLeads } from "@/hooks/useLeads";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarPage() {
  const { leads, loading } = useLeads();
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const followUps = useMemo(() => {
    const map = new Map<string, typeof leads>();
    leads.forEach((l) => {
      if (!l.followUpAt) return;
      const key = new Date(l.followUpAt).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    });
    return map;
  }, [leads]);

  if (loading) return <Skeleton className="h-[600px] rounded-2xl" />;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString("en", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const upcoming = [...leads]
    .filter((l) => l.followUpAt && new Date(l.followUpAt) >= new Date())
    .sort((a, b) => +new Date(a.followUpAt!) - +new Date(b.followUpAt!))
    .slice(0, 5);

  const today = new Date().toDateString();

  return (
    <section className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="neon-text">Calendar</span> & Follow-ups</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan and track scheduled lead touch-points.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="h-9 w-9 grid place-items-center rounded-lg border border-border/60 hover:bg-muted/50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium min-w-[160px] text-center">{monthLabel}</div>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="h-9 w-9 grid place-items-center rounded-lg border border-border/60 hover:bg-muted/50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-4 lg:col-span-2">
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {cells.map((c, i) => {
              if (!c) return <div key={i} />;
              const items = followUps.get(c.toDateString()) ?? [];
              const isToday = c.toDateString() === today;
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.005 }}
                  className={cn(
                    "min-h-[80px] rounded-xl p-1.5 border border-border/40 bg-muted/10",
                    isToday && "border-primary/60 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                  )}>
                  <div className={cn("text-xs font-medium mb-1 px-1", isToday && "text-primary")}>{c.getDate()}</div>
                  <div className="space-y-0.5">
                    {items.slice(0, 2).map((l) => (
                      <Link key={l.id} to={`/leads/${l.id}`}
                        className="block text-[10px] truncate rounded px-1.5 py-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 hover:from-primary/50 hover:to-secondary/50 transition">
                        {l.name}
                      </Link>
                    ))}
                    {items.length > 2 && <div className="text-[9px] text-muted-foreground px-1.5">+{items.length - 2} more</div>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <CalIcon className="h-4 w-4" /> Upcoming Reminders
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming follow-ups.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((l) => (
                <li key={l.id}>
                  <Link to={`/leads/${l.id}`} className="block rounded-xl border border-border/60 p-3 hover:border-primary/60 hover:bg-primary/5 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{l.name}</span>
                      <span className="text-[10px] text-secondary font-medium">{new Date(l.followUpAt!).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(l.followUpAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
