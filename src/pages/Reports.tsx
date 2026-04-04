import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Milk, DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const weeklyData = [
  { week: "Week 1 (1-7)", milk: 610, expenses: 6750, revenue: 24200 },
  { week: "Week 2 (8-14)", milk: 595, expenses: 6200, revenue: 23800 },
  { week: "Week 3 (15-21)", milk: 625, expenses: 6900, revenue: 25000 },
  { week: "Week 4 (22-28)", milk: 580, expenses: 6400, revenue: 23200 },
];

export default function Reports() {
  const [monthIndex, setMonthIndex] = useState(2);
  const year = 2024;

  const totalMilk = weeklyData.reduce((s, w) => s + w.milk, 0);
  const totalExpenses = weeklyData.reduce((s, w) => s + w.expenses, 0);
  const totalRevenue = weeklyData.reduce((s, w) => s + w.revenue, 0);
  const totalBalance = totalRevenue - totalExpenses;

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Report</h1>
          <p className="text-sm text-muted-foreground">Performance summary & analysis</p>
        </div>
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
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Milk" value={`${totalMilk.toLocaleString()} L`} icon={Milk} variant="primary" />
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={TrendingUp} variant="accent" />
        <StatCard title="Total Expenses" value={`₹${totalExpenses.toLocaleString()}`} icon={TrendingDown} variant="warning" />
        <StatCard title="Net Profit" value={`₹${totalBalance.toLocaleString()}`} icon={DollarSign} variant="primary" trend={totalBalance >= 0 ? "up" : "down"} />
      </div>

      {/* Weekly Breakdown */}
      <div className="glass-card p-5 mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" /> Weekly Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milk (L)</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expenses</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profit</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((w, i) => {
                const profit = w.revenue - w.expenses;
                const margin = ((profit / w.revenue) * 100).toFixed(1);
                return (
                  <tr key={w.week} className={`border-b border-border/30 hover:bg-secondary/50 transition-colors ${i % 2 === 0 ? "bg-secondary/10" : ""}`}>
                    <td className="py-3 px-4 font-medium text-foreground">{w.week}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{w.milk}</td>
                    <td className="py-3 px-4 text-right text-primary">₹{w.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-destructive">₹{w.expenses.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>₹{profit.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{margin}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/30 border-t border-border">
                <td className="py-3 px-4 font-semibold text-foreground">Total</td>
                <td className="py-3 px-4 text-right font-semibold text-foreground">{totalMilk.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-semibold text-primary">₹{totalRevenue.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-semibold text-destructive">₹{totalExpenses.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-primary">₹{totalBalance.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-semibold text-muted-foreground">{((totalBalance / totalRevenue) * 100).toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Daily Averages */}
      <div className="glass-card p-5 animate-slide-up">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">📊 Daily Averages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Milk / Day</p>
            <p className="text-xl font-bold text-foreground">{(totalMilk / 28).toFixed(1)} L</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Revenue / Day</p>
            <p className="text-xl font-bold text-primary">₹{(totalRevenue / 28).toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Expenses / Day</p>
            <p className="text-xl font-bold text-destructive">₹{(totalExpenses / 28).toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Profit / Day</p>
            <p className="text-xl font-bold text-primary">₹{(totalBalance / 28).toFixed(0)}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
