import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Milk, DollarSign, TrendingUp, TrendingDown, PlusCircle, FileText, BarChart3, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Sample data
const recentRecords = [
  { date: "2024-03-15", milkAM: 45, milkPM: 42, expenses: 1200, revenue: 3500 },
  { date: "2024-03-14", milkAM: 43, milkPM: 40, expenses: 800, revenue: 3300 },
  { date: "2024-03-13", milkAM: 46, milkPM: 44, expenses: 950, revenue: 3600 },
  { date: "2024-03-12", milkAM: 41, milkPM: 39, expenses: 1100, revenue: 3200 },
];

export default function Dashboard() {
  const [monthIndex, setMonthIndex] = useState(2); // March
  const year = 2024;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your farm performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center glass-card px-2 py-1 gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setMonthIndex(Math.max(0, monthIndex - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
              {months[monthIndex]} {year}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setMonthIndex(Math.min(11, monthIndex + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Link to="/new-record">
            <Button size="sm">
              <PlusCircle className="h-3.5 w-3.5" />
              New Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Milk" value="1,340 L" subtitle="This month" icon={Milk} variant="primary" trend="up" trendValue="5.2% vs last month" />
        <StatCard title="Revenue" value="₹42,500" subtitle="This month" icon={TrendingUp} variant="accent" trend="up" trendValue="8.1% vs last month" />
        <StatCard title="Expenses" value="₹18,200" subtitle="This month" icon={TrendingDown} variant="warning" trend="down" trendValue="3.4% vs last month" />
        <StatCard title="Net Balance" value="₹24,300" subtitle="This month" icon={DollarSign} variant="primary" trend="up" trendValue="12.3% vs last month" />
      </div>

      {/* Quick Actions + Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/new-record" className="block">
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Daily Record
              </Button>
            </Link>
            <Link to="/records" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Monthly Records
              </Button>
            </Link>
            <Link to="/reports" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </Link>
            <Link to="/records/update" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Update Existing Record
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Records */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Records</h2>
            <Link to="/records">
              <Button variant="ghost" size="compact" className="text-muted-foreground">View All</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milk (L)</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expenses</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r, i) => (
                  <tr key={r.date} className={`border-b border-border/30 hover:bg-secondary/50 transition-colors ${i % 2 === 0 ? "bg-secondary/20" : ""}`}>
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.date}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{r.milkAM + r.milkPM}</td>
                    <td className="py-2.5 px-3 text-right text-destructive">₹{r.expenses.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-primary">₹{r.revenue.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-foreground">₹{(r.revenue - r.expenses).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
