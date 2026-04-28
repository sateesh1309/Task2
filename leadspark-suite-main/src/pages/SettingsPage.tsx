import { useEffect, useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun, Bell } from "lucide-react";
import { toast } from "sonner";

const THEME_KEY = "mini-crm:theme";

export default function SettingsPage() {
  const { leads } = useLeads();
  const [dark, setDark] = useState(true);
  const [name, setName] = useState("Nova User");
  const [email, setEmail] = useState("you@novacrm.app");
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("light-theme", !isDark);
  }, []);

  const toggleTheme = (next: boolean) => {
    setDark(next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    document.documentElement.classList.toggle("light-theme", !next);
    toast.success(next ? "Dark mode enabled" : "Light mode enabled");
  };

  return (
    <section className="space-y-6 animate-fade-in max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight"><span className="neon-text">Settings</span></h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize your NovaCRM workspace.</p>
      </header>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary grid place-items-center neon-violet">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="text-xs text-muted-foreground">Your account details</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pemail">Email</Label>
            <Input id="pemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          onClick={() => toast.success("Profile saved")}>Save Profile</Button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <Row icon={dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} title="Dark Mode" desc="Toggle between dark and light themes">
          <Switch checked={dark} onCheckedChange={toggleTheme} />
        </Row>
        <Row icon={<Bell className="h-4 w-4" />} title="Notifications" desc="Show toast alerts for actions">
          <Switch checked={notif} onCheckedChange={setNotif} />
        </Row>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-2">Workspace</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="Leads" value={leads.length} />
          <Stat label="Hot" value={leads.filter((l) => l.tag === "Hot").length} />
          <Stat label="Converted" value={leads.filter((l) => l.status === "Converted").length} />
        </div>
      </div>
    </section>
  );
}

function Row({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center">{icon}</div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/20 border border-border/60 p-3">
      <div className="text-2xl font-bold neon-text">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
