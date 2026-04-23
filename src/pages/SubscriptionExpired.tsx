import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, LogOut } from "lucide-react";

export default function SubscriptionExpired() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Ignore logout errors and still clear the local session.
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      toast.success("Signed out successfully");
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-card p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Subscription expired. Please resubscribe.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your farm subscription has ended, so the app is locked until it is renewed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" onClick={handleLogout} disabled={loggingOut} variant="destructive">
            <LogOut className="h-4 w-4 mr-2" />
            {loggingOut ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}