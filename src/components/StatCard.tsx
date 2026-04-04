import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "accent" | "warning";
}

const variantClasses = {
  default: "glass-card",
  primary: "glass-card border-primary/20",
  accent: "glass-card border-accent/20",
  warning: "glass-card border-warning/20",
};

const iconBgClasses = {
  default: "bg-secondary",
  primary: "bg-primary/10",
  accent: "bg-accent/10",
  warning: "bg-warning/10",
};

const iconColorClasses = {
  default: "text-muted-foreground",
  primary: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = "default" }: StatCardProps) {
  return (
    <div className={`${variantClasses[variant]} p-5 animate-slide-up`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && trendValue && (
            <p className={`text-xs font-medium ${trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </p>
          )}
        </div>
        <div className={`${iconBgClasses[variant]} p-2.5 rounded-lg`}>
          <Icon className={`h-5 w-5 ${iconColorClasses[variant]}`} />
        </div>
      </div>
    </div>
  );
}
