import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, BarChart3, Calendar, Settings, Sparkles, KanbanSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function CrmSidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col gap-6 p-5 glass-card m-4 mr-0 animate-fade-in sticky top-4 self-start max-h-[calc(100vh-2rem)]">
      <div className="flex items-center gap-3 px-1">
        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary grid place-items-center neon-violet animate-pulse-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-lg font-bold neon-text leading-tight">NovaCRM</div>
          <div className="text-[11px] text-muted-foreground">Premium Lead Manager</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all border border-transparent",
                  isActive
                    ? "bg-primary/15 text-foreground border-primary/40 shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-4 w-4 transition-colors", isActive && "text-primary")} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="text-xs font-semibold text-primary">Pro Tip</div>
        <p className="mt-1 text-xs text-foreground/80 leading-relaxed">
          Drag leads on the Pipeline board to update their status instantly.
        </p>
      </div>
    </aside>
  );
}

export function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-30 glass-card p-1.5 flex justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all flex-1",
                isActive ? "bg-primary/20 text-primary" : "text-muted-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span className="leading-none">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
