import { Outlet, useNavigate } from "react-router-dom";
import { CrmSidebar, MobileTabBar } from "@/components/crm/CrmSidebar";
import { useLeads } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Plus } from "lucide-react";
import { exportLeadsToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { useState } from "react";
import { LeadFormDialog } from "@/components/crm/LeadFormDialog";

export default function AppLayout() {
  const { leads, addLead, resetData } = useLeads();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleExport = () => {
    if (!leads.length) return toast.error("No leads to export");
    exportLeadsToCsv(leads);
    toast.success("Leads exported as CSV");
  };

  return (
    <div className="min-h-screen flex">
      <CrmSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-border/40 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Welcome back — manage your pipeline at a glance.
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleExport}
              className="border-secondary/40 hover:border-secondary hover:text-secondary hover:shadow-[0_0_18px_hsl(var(--secondary)/0.35)]">
              <Download className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm"
                  className="border-destructive/40 hover:border-destructive hover:text-destructive hover:shadow-[0_0_18px_hsl(var(--destructive)/0.35)]">
                  <RotateCcw className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace your current leads with the original sample data. You can't undo this.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => { resetData(); toast.success("Sample data restored"); }}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="px-6 py-4 text-center text-xs text-muted-foreground hidden md:block">
          NovaCRM • Premium Lead Manager • Built with Lovable
        </footer>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 220 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground grid place-items-center shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
        aria-label="Add lead"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <LeadFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={null}
        onSubmit={(data) => {
          const l = addLead(data);
          toast.success("Lead created");
          setOpen(false);
          navigate(`/leads/${l.id}`);
        }}
      />

      <MobileTabBar />
    </div>
  );
}
