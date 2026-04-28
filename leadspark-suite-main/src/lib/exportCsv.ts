import { Lead } from "@/types/lead";

export function exportLeadsToCsv(leads: Lead[]) {
  const header = ["Name", "Email", "Phone", "Source", "Status", "Tag", "Priority", "Value", "Follow-up", "Notes", "Created At"];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [l.name, l.email, l.phone, l.source, l.status, l.tag, l.priority, l.value, l.followUpAt ?? "", l.notes, l.createdAt].map(escape).join(","),
  );
  const csv = [header.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
