import { useCallback, useEffect, useState } from "react";
import { Lead, LeadStatus } from "@/types/lead";
import { buildSeedLeads } from "@/data/seedLeads";

const STORAGE_KEY = "mini-crm:leads:v2";

const uid = () =>
  (crypto as any)?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const loadLeads = (): Lead[] => {
  if (typeof window === "undefined") return buildSeedLeads();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildSeedLeads();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Lead[];
    if (!Array.isArray(parsed)) throw new Error("bad");
    return parsed;
  } catch {
    const seed = buildSeedLeads();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

const saveLeads = (leads: Lead[]) => {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); } catch {}
};

export type LeadInput = Omit<Lead, "id" | "createdAt" | "activity">;

let cachedLeads: Lead[] | null = null;
const subscribers = new Set<(l: Lead[]) => void>();

const setAll = (next: Lead[]) => {
  cachedLeads = next;
  saveLeads(next);
  subscribers.forEach((s) => s(next));
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(() => cachedLeads ?? []);
  const [loading, setLoading] = useState(cachedLeads === null);

  useEffect(() => {
    const sub = (l: Lead[]) => setLeads(l);
    subscribers.add(sub);
    if (cachedLeads === null) {
      const t = setTimeout(() => {
        const data = loadLeads();
        cachedLeads = data;
        setLeads(data);
        setLoading(false);
        subscribers.forEach((s) => s !== sub && s(data));
      }, 350);
      return () => { clearTimeout(t); subscribers.delete(sub); };
    } else {
      setLoading(false);
    }
    return () => { subscribers.delete(sub); };
  }, []);

  const addLead = useCallback((input: LeadInput) => {
    const now = new Date().toISOString();
    const lead: Lead = {
      ...input,
      id: uid(),
      createdAt: now,
      activity: [{ id: uid(), at: now, message: "Lead created" }],
    };
    setAll([lead, ...(cachedLeads ?? [])]);
    return lead;
  }, []);

  const updateLead = useCallback((id: string, patch: Partial<LeadInput>) => {
    const next = (cachedLeads ?? []).map((l) => {
      if (l.id !== id) return l;
      const activity = [...l.activity];
      if (patch.status && patch.status !== l.status) {
        activity.unshift({ id: uid(), at: new Date().toISOString(), message: `Status: ${l.status} → ${patch.status}` });
      } else {
        activity.unshift({ id: uid(), at: new Date().toISOString(), message: "Lead updated" });
      }
      return { ...l, ...patch, activity };
    });
    setAll(next);
  }, []);

  const updateStatus = useCallback((id: string, status: LeadStatus) => {
    const next = (cachedLeads ?? []).map((l) => {
      if (l.id !== id || l.status === status) return l;
      return {
        ...l,
        status,
        activity: [{ id: uid(), at: new Date().toISOString(), message: `Status: ${l.status} → ${status}` }, ...l.activity],
      };
    });
    setAll(next);
  }, []);

  const addNote = useCallback((id: string, note: string) => {
    const next = (cachedLeads ?? []).map((l) => {
      if (l.id !== id) return l;
      return {
        ...l,
        activity: [{ id: uid(), at: new Date().toISOString(), message: `Note: ${note}` }, ...l.activity],
      };
    });
    setAll(next);
  }, []);

  const setFollowUp = useCallback((id: string, iso: string | null) => {
    const next = (cachedLeads ?? []).map((l) => {
      if (l.id !== id) return l;
      return {
        ...l,
        followUpAt: iso,
        activity: [{ id: uid(), at: new Date().toISOString(), message: iso ? `Follow-up scheduled: ${new Date(iso).toLocaleString()}` : "Follow-up cleared" }, ...l.activity],
      };
    });
    setAll(next);
  }, []);

  const deleteLead = useCallback((id: string) => {
    setAll((cachedLeads ?? []).filter((l) => l.id !== id));
  }, []);

  const resetData = useCallback(() => {
    setAll(buildSeedLeads());
  }, []);

  return { leads, loading, addLead, updateLead, updateStatus, addNote, setFollowUp, deleteLead, resetData };
}
