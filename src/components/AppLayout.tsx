import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Edit, FileText, BarChart3, User, LogOut, Menu, X, Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Update a Record", path: "/records/update", icon: Edit },
  { label: "View Records", path: "/records", icon: FileText },
  { label: "Contact Developer", path: "/contact", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Milk className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-gradient hidden sm:inline">FarmFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path || (item.path === "/records" && location.pathname.startsWith("/records") && !location.pathname.includes("/update"));
              return (
                <Link key={item.path} to={item.path}>
                  <Button variant={active ? "default" : "ghost"} size="compact" className={active ? "" : "text-muted-foreground"}>
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hidden md:flex" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md animate-fade-in">
            <nav className="container py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                    <Button variant={active ? "default" : "ghost"} className={`w-full justify-start ${active ? "" : "text-muted-foreground"}`} size="sm">
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="container py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
