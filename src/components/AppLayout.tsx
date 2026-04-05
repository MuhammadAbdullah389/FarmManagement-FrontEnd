import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Edit, FileText, BarChart3, User, LogOut, Menu, X, Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Update a Record", path: "/records/update", icon: Edit },
  { label: "View Records", path: "/records", icon: FileText },
  { label: "Contact the Developer", path: "/contact", icon: User },
  { label: "Entry Report", path: "/reports", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
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
          <span className="text-xl font-bold text-foreground">Record for Muhammad Abdullah!</span>
        </Link>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center justify-between h-12">
            <div className="flex items-center gap-0 flex-1 justify-center">
              {navItems.map((item) => {
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
            <Button variant="ghost" size="sm" className="text-muted-foreground ml-4" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
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
              {navItems.map((item) => {
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
