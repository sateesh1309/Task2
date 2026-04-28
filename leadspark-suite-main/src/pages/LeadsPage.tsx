import { useMemo, useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { Lead, LEAD_STATUSES, LeadStatus } from "@/types/lead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, LayoutGrid, Rows3, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge, TagBadge, PriorityBadge } from "@/components/crm/StatusBadge";
import { LeadFormDialog } from "@/components/crm/LeadFormDialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = "all" | LeadStatus;
type ViewMode = "table" | "card";

export default function LeadsPage() {
  const { leads, loading, addLead, updateLead, updateStatus, deleteLead } = useLeads();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>("table");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.source, l.notes].some((v) => v.toLowerCase().includes(q));
    });
  }, [leads, query, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <section className="space-y-5 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="neon-text">Leads</span></h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} of {leads.length} leads shown</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl border border-border/60 bg-muted/40">
            <button onClick={() => setView("table")}
              className={cn("h-8 w-8 grid place-items-center rounded-lg transition", view === "table" ? "bg-primary/20 text-primary" : "text-muted-foreground")}>
              <Rows3 className="h-4 w-4" />
            </button>
            <button onClick={() => setView("card")}
              className={cn("h-8 w-8 grid place-items-center rounded-lg transition", view === "card" ? "bg-primary/20 text-primary" : "text-muted-foreground")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 neon-violet">
            <Plus className="h-4 w-4 mr-1.5" /> New Lead
          </Button>
        </div>
      </header>

      <div className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, source or notes…"
            className="pl-9 bg-input/60 border-border/60 focus-visible:ring-primary" />
        </div>
        <Select value={statusFilter} onValueChange={(v: StatusFilter) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-input/60 border-border/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No leads match your filters.</p>
        </div>
      ) : view === "table" ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Tag</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Source</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((lead) => (
                    <motion.tr key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-t border-border/50 hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/leads/${lead.id}`} className="flex items-center gap-3 group">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/70 to-secondary/70 grid place-items-center text-xs font-semibold text-primary-foreground">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium group-hover:text-primary transition-colors">{lead.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{lead.email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-col text-xs">
                          <span className="flex items-center gap-1.5 text-foreground/80"><Mail className="h-3 w-3" /> {lead.email}</span>
                          <span className="flex items-center gap-1.5 text-muted-foreground mt-0.5"><Phone className="h-3 w-3" /> {lead.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <TagBadge tag={lead.tag} />
                          <PriorityBadge priority={lead.priority} />
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{lead.source}</td>
                      <td className="px-4 py-3">
                        <Select value={lead.status} onValueChange={(v: LeadStatus) => { updateStatus(lead.id, v); toast.success(`Status: ${v}`); }}>
                          <SelectTrigger className="h-8 w-[130px] border-border/60 bg-transparent">
                            <SelectValue><StatusBadge status={lead.status} /></SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                          onClick={() => { setEditing(lead); setOpen(true); }} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmId(lead.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((lead, i) => (
              <motion.div key={lead.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                className="glass-card p-5 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/leads/${lead.id}`} className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-base font-bold text-primary-foreground">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate hover:text-primary transition">{lead.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
                    </div>
                  </Link>
                  <TagBadge tag={lead.tag} />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{lead.source}</span>
                  <span className="font-semibold text-secondary">${lead.value.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <StatusBadge status={lead.status} />
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(lead); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setConfirmId(lead.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <LeadFormDialog
        open={open} onOpenChange={setOpen} initial={editing}
        onSubmit={(data) => {
          if (editing) { updateLead(editing.id, data); toast.success("Lead updated"); }
          else { addLead(data); toast.success("Lead created"); }
        }}
      />

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (confirmId) { deleteLead(confirmId); toast.success("Lead deleted"); } setConfirmId(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
