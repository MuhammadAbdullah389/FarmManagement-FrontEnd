import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";

const generateMonthButtons = () => {
  const months = [];
  const start = new Date(2025, 7, 1); // August 2025
  const end = new Date(2026, 3, 1); // April 2026
  const d = new Date(start);
  while (d <= end) {
    months.push({ month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleString("default", { month: "long", year: "numeric" }) });
    d.setMonth(d.getMonth() + 1);
  }
  return months;
};

const availableMonths = generateMonthButtons();

const sampleMonthlyData = [
  { date: "01/10/2025", totalMilk: 67, revByMilk: 9380, otherRev: 0, totalRev: 9380, totalExp: 2250, balance: 7130 },
  { date: "02/10/2025", totalMilk: 68, revByMilk: 9520, otherRev: 0, totalRev: 9520, totalExp: 0, balance: 9520 },
  { date: "03/10/2025", totalMilk: 69, revByMilk: 9660, otherRev: 0, totalRev: 9660, totalExp: 0, balance: 9660 },
  { date: "04/10/2025", totalMilk: 70, revByMilk: 9800, otherRev: 0, totalRev: 9800, totalExp: 9400, balance: 400 },
  { date: "05/10/2025", totalMilk: 69, revByMilk: 9660, otherRev: 12600, totalRev: 22260, totalExp: 5000, balance: 17260 },
  { date: "06/10/2025", totalMilk: 61.5, revByMilk: 8610, otherRev: 27800, totalRev: 36410, totalExp: 1000, balance: 35410 },
  { date: "07/10/2025", totalMilk: 62, revByMilk: 8680, otherRev: 0, totalRev: 8680, totalExp: 0, balance: 8680 },
];

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);

  const totalMilk = sampleMonthlyData.reduce((s, r) => s + r.totalMilk, 0);
  const totalRevMilk = sampleMonthlyData.reduce((s, r) => s + r.revByMilk, 0);
  const totalOtherRev = sampleMonthlyData.reduce((s, r) => s + r.otherRev, 0);
  const totalRev = sampleMonthlyData.reduce((s, r) => s + r.totalRev, 0);
  const totalExp = sampleMonthlyData.reduce((s, r) => s + r.totalExp, 0);

  if (!selectedMonth) {
    return (
      <AppLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent">Select a Month to View Reports</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {availableMonths.map((m) => (
            <button
              key={`${m.month}-${m.year}`}
              onClick={() => setSelectedMonth({ month: m.month, year: m.year })}
              className="glass-card p-5 text-center hover:border-accent/50 transition-all hover:bg-secondary/50"
            >
              <span className="text-sm font-medium text-foreground">View Records for {m.label}</span>
            </button>
          ))}
        </div>
      </AppLayout>
    );
  }

  const monthLabel = new Date(selectedMonth.year, selectedMonth.month).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(null)} className="text-muted-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Months
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Monthly Entry Report</h1>
        <p className="text-sm text-accent font-medium">Month: {selectedMonth.month + 1}/{selectedMonth.year}</p>
      </div>

      {/* Monthly Records Table */}
      <div className="glass-card overflow-hidden mb-6 animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border/50">
                <th className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Milk (L)</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue by Milk</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other Revenue</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Expenses</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {sampleMonthlyData.map((r, i) => (
                <tr key={r.date} className={`border-b border-border/30 hover:bg-secondary/50 transition-colors ${i % 2 === 0 ? "bg-secondary/10" : ""}`}>
                  <td className="py-3 px-3 font-medium text-foreground">{r.date}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{r.totalMilk} liters</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{r.revByMilk.toLocaleString()} PKR</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{r.otherRev.toLocaleString()} PKR</td>
                  <td className="py-3 px-3 text-right text-primary">{r.totalRev.toLocaleString()} PKR</td>
                  <td className="py-3 px-3 text-right text-destructive">{r.totalExp.toLocaleString()} PKR</td>
                  <td className={`py-3 px-3 text-right font-semibold ${r.balance >= 0 ? "text-primary" : "text-destructive"}`}>{r.balance.toLocaleString()} PKR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggregated Values */}
      <div className="glass-card p-5 mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Aggregated Values for the Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Milk for the Month</span>
            <span className="font-semibold text-foreground">{totalMilk} liters</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Revenue from Milk</span>
            <span className="font-semibold text-foreground">{totalRevMilk.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Other Revenue</span>
            <span className="font-semibold text-foreground">{totalOtherRev.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-semibold text-primary">{totalRev.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-semibold text-destructive">{totalExp.toLocaleString()} PKR</span>
          </div>
        </div>
      </div>

      {/* Monthly Report Summary */}
      <div className="glass-card p-5 mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Monthly Report Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
            <p className="text-xl font-bold text-foreground">79,891 PKR</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
            <p className="text-xl font-bold text-primary">129,652 PKR</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Closing Balance</p>
            <p className="text-xl font-bold text-accent">209,543 PKR</p>
          </div>
        </div>
      </div>

      {/* Download PDF */}
      <div className="text-center">
        <Button size="sm" className="gradient-primary">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>
    </AppLayout>
  );
}
