import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Milk, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mb-4 shadow-lg shadow-primary/20">
            <Milk className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">FarmFlow</h1>
          <p className="text-sm text-muted-foreground mt-1">Farm Management System</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to manage your farm records</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-muted-foreground">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="h-10 bg-secondary border-border focus:border-primary focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-10 bg-secondary border-border focus:border-primary focus:ring-primary/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          © 2024 FarmFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
