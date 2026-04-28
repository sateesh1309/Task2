import { useEffect, useState } from "react";
import { Lead, LEAD_STATUSES, LeadStatus, LEAD_TAGS, LeadTag, LEAD_PRIORITIES, LeadPriority, LEAD_SOURCES } from "@/types/lead";
import { LeadInput } from "@/hooks/useLeads";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const empty: LeadInput = {
  name: "", email: "", phone: "", source: "Website",
  status: "New", tag: "Warm", priority: "Medium", value: 1000,
  followUpAt: null, notes: "",
};

export function LeadFormDialog({
  open, onOpenChange, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Lead | null;
  onSubmit: (data: LeadInput) => void;
}) {
  const [form, setForm] = useState<LeadInput>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadInput, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name, email: initial.email, phone: initial.phone,
        source: initial.source, status: initial.status, tag: initial.tag,
        priority: initial.priority, value: initial.value,
        followUpAt: initial.followUpAt ?? null, notes: initial.notes,
      } : empty);
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/30 sm:max-w-[560px] max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-xl">{initial ? "Edit Lead" : "New Lead"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update lead details below." : "Add a new lead to your pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: LeadStatus) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tag</Label>
              <Select value={form.tag} onValueChange={(v: LeadTag) => setForm({ ...form, tag: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_TAGS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v: LeadPriority) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Value (USD)</Label>
              <Input id="value" type="number" min={0} value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="followup">Follow-up</Label>
              <Input id="followup" type="datetime-local"
                value={form.followUpAt ? new Date(form.followUpAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => setForm({ ...form, followUpAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything important about this lead…" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 neon-violet">
              {initial ? "Save Changes" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
