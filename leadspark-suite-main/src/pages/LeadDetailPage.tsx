import { Link, useNavigate, useParams } from "react-router-dom";
import { useLeads } from "@/hooks/useLeads";
import { ArrowLeft, Mail, Phone, Calendar as CalIcon, Trash2, Pencil, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, TagBadge, PriorityBadge } from "@/components/crm/StatusBadge";
import { useState } from "react";
import { LeadFormDialog } from "@/components/crm/LeadFormDialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { leads, loading, updateLead, deleteLead, addNote, setFollowUp } = useLeads();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [followUp, setFollowUpLocal] = useState("");

  if (loading) return <div className="text-muted-foreground">Loading…</div>;
  const lead = leads.find((l) => l.id === id);
  if (!lead) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button asChild variant="link"><Link to="/leads">Back to Leads</Link></Button>
      </div>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(true)}><Pencil className="h-4 w-4 mr-1.5" /> Edit</Button>
          <Button variant="outline" className="border-destructive/40 hover:text-destructive hover:border-destructive"
            onClick={() => { deleteLead(lead.id); toast.success("Lead deleted"); nav("/leads"); }}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-3xl font-bold text-primary-foreground neon-violet">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              <TagBadge tag={lead.tag} />
              <PriorityBadge priority={lead.priority} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {lead.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {lead.phone}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Value</div>
            <div className="text-2xl font-bold neon-text">${lead.value.toLocaleString()}</div>
            <div className="mt-2"><StatusBadge status={lead.status} /></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profile</h3>
          <Field label="Source" value={lead.source} />
          <Field label="Created" value={new Date(lead.createdAt).toLocaleString()} />
          <Field label="Follow-up" value={lead.followUpAt ? new Date(lead.followUpAt).toLocaleString() : "—"} />
          <div>
            <div className="text-xs text-muted-foreground mb-1">Notes</div>
            <p className="text-sm whitespace-pre-wrap">{lead.notes || "—"}</p>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Add Note
          </h3>
          <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Quick follow-up note…" />
          <Button className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
            disabled={!note.trim()}
            onClick={() => { addNote(lead.id, note.trim()); setNote(""); toast.success("Note added"); }}>
            Save Note
          </Button>

          <div className="pt-4 border-t border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
              <CalIcon className="h-3.5 w-3.5" /> Schedule Follow-up
            </h4>
            <div className="flex gap-2">
              <Input type="datetime-local" value={followUp} onChange={(e) => setFollowUpLocal(e.target.value)} />
              <Button variant="outline" disabled={!followUp}
                onClick={() => { setFollowUp(lead.id, new Date(followUp).toISOString()); toast.success("Follow-up scheduled"); setFollowUpLocal(""); }}>
                Set
              </Button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Activity Timeline</h3>
          <ol className="relative border-l border-border/60 pl-5 space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin">
            {lead.activity.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</div>
                <div className="text-sm">{a.message}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <LeadFormDialog open={open} onOpenChange={setOpen} initial={lead}
        onSubmit={(data) => { updateLead(lead.id, data); toast.success("Lead updated"); }} />
    </motion.section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
