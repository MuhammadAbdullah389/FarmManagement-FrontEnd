import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Edit, FileText, BarChart3, User, LogOut, Menu, X, Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api, type AuthUser } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, adminOnly: true },
  { label: "Update a Record", path: "/records/update", icon: Edit, adminOnly: true },
  { label: "View Records", path: "/records", icon: FileText },
  { label: "Support", path: "/contact", icon: User },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const canManageRecords = currentUser?.role === "admin";

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      try {
        const user = await api.getCurrentUser();
        if (active) {
          setCurrentUser(user);
          localStorage.setItem("auth_user", JSON.stringify(user));
        }
      } catch {
        if (active) {
          setCurrentUser(null);
        }
      }
    };

    loadCurrentUser();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Move user to login even when API logout fails.
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      toast.success("Signed out successfully");
      navigate("/login");
    }
  };

  const isActive = (path: string) => {
    if (path === "/records") return location.pathname === "/records" || (location.pathname.startsWith("/records/") && !location.pathname.includes("/update"));
    if (path === "/records/update") return location.pathname.startsWith("/records/update");
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top banner */}
      <div className="bg-secondary/80 border-b border-border/50 py-3 text-center">
        <Link to="/dashboard" className="inline-flex items-center gap-2">
          <Milk className="h-5 w-5 text-primary" />
          <span className="text-xl font-bold text-foreground">Farm Records System</span>
        </Link>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center justify-between h-12">
            <div className="flex items-center gap-0 flex-1 justify-center">
              {navItems.filter((item) => !item.adminOnly || canManageRecords).map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} className="flex-1 text-center">
                    <div className={`py-3 text-sm font-medium transition-colors border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="ml-4 flex items-center gap-3">
              {currentUser && (
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="max-w-[180px] truncate font-medium text-foreground">{currentUser.name}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {currentUser.role}
                  </span>
                </div>
              )}
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          </div>

          {/* Mobile nav toggle */}
          <div className="md:hidden flex items-center justify-between h-12">
            <span className="text-sm font-semibold text-foreground">Menu</span>
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-md animate-fade-in">
            <div className="container py-2 flex flex-col gap-1">
              {currentUser && (
                <div className="mb-2 flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{currentUser.name}</div>
                    <div className="text-[10px] uppercase tracking-wide text-primary">{currentUser.role}</div>
                  </div>
                </div>
              )}
              {navItems.filter((item) => !item.adminOnly || canManageRecords).map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                    <div className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                      {item.label}
                    </div>
                  </Link>
                );
              })}
              <div
                className="py-2.5 px-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="container py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
