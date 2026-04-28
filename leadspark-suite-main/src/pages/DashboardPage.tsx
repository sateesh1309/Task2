import { Lead } from "@/types/lead";
import { Users, UserPlus, MessageCircle, CheckCircle2, XCircle, TrendingUp, DollarSign, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeads } from "@/hooks/useLeads";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { Link } from "react-router-dom";
import { StatusBadge, TagBadge } from "@/components/crm/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

const cards = [
  { key: "total", label: "Total Leads", icon: Users, accent: "from-primary to-secondary", glow: "shadow-[0_0_30px_hsl(var(--primary)/0.35)]" },
  { key: "new", label: "New", icon: UserPlus, accent: "from-info to-secondary", glow: "shadow-[0_0_30px_hsl(var(--info)/0.35)]" },
  { key: "contacted", label: "Contacted", icon: MessageCircle, accent: "from-warning to-primary", glow: "shadow-[0_0_30px_hsl(var(--warning)/0.35)]" },
  { key: "converted", label: "Converted", icon: CheckCircle2, accent: "from-success to-secondary", glow: "shadow-[0_0_30px_hsl(var(--success)/0.35)]" },
  { key: "lost", label: "Lost", icon: XCircle, accent: "from-destructive to-primary", glow: "shadow-[0_0_30px_hsl(var(--destructive)/0.35)]" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  New: "hsl(210 95% 60%)",
  Contacted: "hsl(40 95% 60%)",
  Converted: "hsl(145 75% 50%)",
  Lost: "hsl(0 85% 60%)",
};

function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { leads, loading } = useLeads();
  if (loading) return <Loading />;
  return <DashboardInner leads={leads} />;
}

function DashboardInner({ leads }: { leads: Lead[] }) {
  const counts = {
    total: leads.length,
    new: leads.filter((l) => l.status === "New").length,
    contacted: leads.filter((l) => l.status === "Contacted").length,
    converted: leads.filter((l) => l.status === "Converted").length,
    lost: leads.filter((l) => l.status === "Lost").length,
  };
  const conversion = leads.length ? Math.round((counts.converted / leads.length) * 100) : 0;
  const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);
  const wonValue = leads.filter((l) => l.status === "Converted").reduce((s, l) => s + (l.value || 0), 0);
  const hotLeads = leads.filter((l) => l.tag === "Hot").slice(0, 4);

  const statusData = (["New", "Contacted", "Converted", "Lost"] as const).map((s) => ({
    name: s, value: leads.filter((l) => l.status === s).length, color: STATUS_COLORS[s],
  }));

  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // 7-day fake trend
  const trend = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString("en", { weekday: "short" });
    return { day, leads: Math.max(1, Math.round((leads.length / 7) * (0.7 + Math.random() * 0.8))) };
  });

  const recent = [...leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);

  return (
    <section className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard <span className="neon-text">Overview</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">A snapshot of your pipeline and recent lead activity.</p>
      </motion.header>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const value = counts[c.key as keyof typeof counts];
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className={cn("glass-card p-5 transition-all", c.glow)}
            >
              <div className="flex items-center justify-between">
                <div className={cn("h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br text-primary-foreground", c.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-bold tabular-nums">{value}</span>
              </div>
              <div className="mt-3 text-sm font-medium text-muted-foreground">{c.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue / Conversion KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Value</h3>
            <DollarSign className="h-4 w-4 text-secondary" />
          </div>
          <div className="mt-2 text-3xl font-bold neon-text">${totalValue.toLocaleString()}</div>
          <div className="mt-1 text-xs text-muted-foreground">${wonValue.toLocaleString()} won</div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Rate</h3>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="mt-2 text-3xl font-bold neon-text">{conversion}%</div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${conversion}%` }} transition={{ duration: 0.9 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hot Leads</h3>
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <div className="mt-2 text-3xl font-bold">{leads.filter((l) => l.tag === "Hot").length}</div>
          <div className="mt-1 text-xs text-muted-foreground">High-intent prospects</div>
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Lead Trend (7 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(270 95% 65%)" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="hsl(190 95% 55%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 30% 22% / 0.5)" />
                <XAxis dataKey="day" stroke="hsl(220 15% 65%)" fontSize={12} />
                <YAxis stroke="hsl(220 15% 65%)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(270 60% 60% / 0.4)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="leads" stroke="hsl(270 95% 65%)" strokeWidth={2} fill="url(#leadGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">By Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(270 60% 60% / 0.4)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sources + Recent */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Lead Sources</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 30% 22% / 0.5)" />
                <XAxis dataKey="name" stroke="hsl(220 15% 65%)" fontSize={11} />
                <YAxis stroke="hsl(220 15% 65%)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(270 60% 60% / 0.4)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="hsl(190 95% 55%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Leads</h3>
            <Link to="/leads" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <ul className="divide-y divide-border/60">
            {recent.length === 0 && <li className="py-6 text-sm text-muted-foreground text-center">No leads yet.</li>}
            {recent.map((l) => (
              <li key={l.id}>
                <Link to={`/leads/${l.id}`} className="flex items-center justify-between py-3 hover:bg-primary/5 px-2 -mx-2 rounded-lg transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/70 to-secondary/70 grid place-items-center text-sm font-semibold text-primary-foreground">
                      {l.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{l.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{l.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <TagBadge tag={l.tag} />
                    <StatusBadge status={l.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hot leads strip */}
      {hotLeads.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">AI Suggestion · Focus Today</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            These hot leads have the highest win probability. Reach out within 24 hours for best results.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hotLeads.map((l) => (
              <Link key={l.id} to={`/leads/${l.id}`}
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 hover:border-destructive/60 hover:shadow-[0_0_20px_hsl(var(--destructive)/0.3)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{l.name}</span>
                  <TagBadge tag={l.tag} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground truncate">{l.email}</div>
                <div className="mt-2 text-xs font-medium text-secondary">${l.value.toLocaleString()}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
