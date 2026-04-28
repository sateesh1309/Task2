import { useLeads } from "@/hooks/useLeads";
import { Lead, LEAD_STATUSES, LeadStatus } from "@/types/lead";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { TagBadge } from "@/components/crm/StatusBadge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_META: Record<LeadStatus, { color: string; bg: string }> = {
  New: { color: "text-info", bg: "from-info/20 to-info/5 border-info/30" },
  Contacted: { color: "text-warning", bg: "from-warning/20 to-warning/5 border-warning/30" },
  Converted: { color: "text-success", bg: "from-success/20 to-success/5 border-success/30" },
  Lost: { color: "text-destructive", bg: "from-destructive/20 to-destructive/5 border-destructive/30" },
};

function LeadCard({ lead, dragging }: { lead: Lead; dragging?: boolean }) {
  return (
    <div className={cn(
      "glass-card p-3 cursor-grab active:cursor-grabbing select-none",
      dragging && "shadow-[0_0_30px_hsl(var(--primary)/0.6)] rotate-2"
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-[11px] font-bold text-primary-foreground shrink-0">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm font-medium truncate">{lead.name}</div>
        </div>
        <TagBadge tag={lead.tag} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground truncate">{lead.email}</div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{lead.source}</span>
        <span className="font-semibold text-secondary">${lead.value.toLocaleString()}</span>
      </div>
    </div>
  );
}

function DraggableCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <Link to={`/leads/${lead.id}`} onClick={(e) => e.stopPropagation()} draggable={false}>
        <LeadCard lead={lead} />
      </Link>
    </div>
  );
}

function Column({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const meta = STATUS_META[status];
  const total = leads.reduce((s, l) => s + l.value, 0);
  return (
    <div ref={setNodeRef}
      className={cn(
        "rounded-2xl border bg-gradient-to-b p-3 min-h-[400px] transition-all",
        meta.bg,
        isOver && "ring-2 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
      )}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full bg-current", meta.color)} />
          <h3 className={cn("text-sm font-semibold", meta.color)}>{status}</h3>
          <span className="text-xs text-muted-foreground">({leads.length})</span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">${total.toLocaleString()}</span>
      </div>
      <div className="space-y-2">
        {leads.map((l) => <DraggableCard key={l.id} lead={l} />)}
        {leads.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/60 rounded-xl">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { leads, loading, updateStatus } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
      </div>
    );
  }

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const newStatus = e.over.id as LeadStatus;
    const lead = leads.find((l) => l.id === e.active.id);
    if (!lead || lead.status === newStatus) return;
    updateStatus(lead.id, newStatus);
    toast.success(`${lead.name} → ${newStatus}`);
  };

  const active = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <section className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline <span className="neon-text">Board</span></h1>
        <p className="text-muted-foreground text-sm mt-1">Drag leads between columns to update their status.</p>
      </header>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {LEAD_STATUSES.map((s) => (
            <motion.div key={s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Column status={s} leads={leads.filter((l) => l.status === s)} />
            </motion.div>
          ))}
        </div>
        <DragOverlay>{active ? <LeadCard lead={active} dragging /> : null}</DragOverlay>
      </DndContext>
    </section>
  );
}
