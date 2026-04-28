import { useLeads } from "@/hooks/useLeads";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  New: "hsl(210 95% 60%)",
  Contacted: "hsl(40 95% 60%)",
  Converted: "hsl(145 75% 50%)",
  Lost: "hsl(0 85% 60%)",
};

export default function AnalyticsPage() {
  const { leads, loading } = useLeads();

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
      </div>
    );
  }

  const trend = Array.from({ length: 12 }).map((_, i) => {
    const month = new Date(2025, i, 1).toLocaleString("en", { month: "short" });
    return {
      month,
      new: Math.round(2 + Math.random() * 10),
      converted: Math.round(1 + Math.random() * 6),
    };
  });

  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  const tagMap: Record<string, number> = {};
  leads.forEach((l) => { tagMap[l.tag] = (tagMap[l.tag] || 0) + 1; });
  const tagData = Object.entries(tagMap).map(([name, value]) => ({ name, value }));

  const valueByStatus = (["New", "Contacted", "Converted", "Lost"] as const).map((s) => ({
    status: s,
    value: leads.filter((l) => l.status === s).reduce((sum, l) => sum + l.value, 0),
  }));

  const tooltipStyle = { background: "hsl(240 25% 10%)", border: "1px solid hsl(270 60% 60% / 0.4)", borderRadius: 12 };

  return (
    <section className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold tracking-tight"><span className="neon-text">Analytics</span></h1>
        <p className="text-muted-foreground text-sm mt-1">Insights & conversion trends across your pipeline.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Conversion Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 30% 22% / 0.5)" />
                <XAxis dataKey="month" stroke="hsl(220 15% 65%)" fontSize={12} />
                <YAxis stroke="hsl(220 15% 65%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="new" stroke="hsl(190 95% 55%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="converted" stroke="hsl(270 95% 65%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }} className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Lead Source Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {sourceData.map((_, i) => <Cell key={i} fill={["hsl(270 95% 65%)", "hsl(190 95% 55%)", "hsl(40 95% 60%)", "hsl(145 75% 50%)", "hsl(0 85% 60%)"][i % 5]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Pipeline Value by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 30% 22% / 0.5)" />
                <XAxis dataKey="status" stroke="hsl(220 15% 65%)" fontSize={12} />
                <YAxis stroke="hsl(220 15% 65%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {valueByStatus.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Lead Temperature</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tagData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {tagData.map((d) => <Cell key={d.name} fill={d.name === "Hot" ? "hsl(0 85% 60%)" : d.name === "Warm" ? "hsl(40 95% 60%)" : "hsl(210 95% 60%)"} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
