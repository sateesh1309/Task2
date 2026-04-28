import { Lead, LeadPriority, LeadStatus, LeadTag } from "@/types/lead";

const NAMES = ["Sateesh", "Nishith", "Vishnu", "Srinu", "Sushanth", "Chakri", "Manikanta", "Kalyan"];
const STATUS_CYCLE: LeadStatus[] = ["New", "Contacted", "Converted", "New", "Contacted", "Converted", "Lost", "Contacted"];
const TAG_CYCLE: LeadTag[] = ["Hot", "Warm", "Hot", "Cold", "Warm", "Hot", "Cold", "Warm"];
const PRI_CYCLE: LeadPriority[] = ["High", "Medium", "High", "Low", "Medium", "High", "Low", "Medium"];
const SOURCES = ["Website", "Instagram", "Referral", "Website", "Instagram", "Referral", "Website", "Instagram"];
const VALUES = [4500, 2200, 9800, 1500, 3200, 12000, 800, 2700];

const randomPhone = () => {
  let s = String(Math.floor(Math.random() * 4) + 6);
  for (let i = 0; i < 9; i++) s += String(Math.floor(Math.random() * 10));
  return s;
};

export const buildSeedLeads = (): Lead[] => {
  const now = Date.now();
  return NAMES.map((name, i) => {
    const id = `seed-${name.toLowerCase()}-${i}`;
    const createdAt = new Date(now - (NAMES.length - i) * 1000 * 60 * 60 * 6).toISOString();
    const followUpAt = i % 2 === 0
      ? new Date(now + (i + 1) * 1000 * 60 * 60 * 24).toISOString()
      : null;
    return {
      id,
      name,
      email: `${name.toLowerCase()}@gmail.com`,
      phone: randomPhone(),
      source: SOURCES[i],
      status: STATUS_CYCLE[i],
      tag: TAG_CYCLE[i],
      priority: PRI_CYCLE[i],
      value: VALUES[i],
      followUpAt,
      notes: "Interested in services",
      createdAt,
      activity: [{ id: `${id}-a0`, at: createdAt, message: "Lead created" }],
    };
  });
};
