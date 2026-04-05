import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api, type MonthlyReportResponse } from "@/lib/api";
import { toast } from "sonner";

export default function Reports() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [report, setReport] = useState<MonthlyReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadMonths = async () => {
      try {
        const months = await api.getReportMonths();
        if (active) {
          setAvailableMonths(months);
        }
      } catch (err) {
        if (active) {
          toast.error(err instanceof Error ? err.message : "Unable to load report months");
        }
      }
    };

    loadMonths();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedMonth) {
      setReport(null);
      return;
    }

    let active = true;

    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await api.getMonthlyReport(selectedMonth);
        if (active) {
          setReport(data);
        }
      } catch (err) {
        if (active) {
          setReport(null);
          toast.error(err instanceof Error ? err.message : "Unable to load monthly report");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReport();
    return () => {
      active = false;
    };
  }, [selectedMonth]);

  const safeReport = useMemo<MonthlyReportResponse>(() => {
    return report ?? {
      rows: [],
      totals: {
        totalMilk: 0,
        totalRevMilk: 0,
        totalOtherRev: 0,
        totalRev: 0,
        totalExp: 0,
      },
      summary: {
        openingBalance: 0,
        netBalance: 0,
        closingBalance: 0,
      },
    };
  }, [report]);

  if (!selectedMonth) {
    return (
      <AppLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent">Select a Month to View Reports</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {availableMonths.map((monthLabel) => (
            <button
              key={monthLabel}
              onClick={() => setSelectedMonth(monthLabel)}
              className="glass-card p-5 text-center hover:border-accent/50 transition-all hover:bg-secondary/50"
            >
              <span className="text-sm font-medium text-foreground">View Records for {monthLabel}</span>
            </button>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(null)} className="text-muted-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Months
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Monthly Entry Report</h1>
        <p className="text-sm text-accent font-medium">Month: {selectedMonth}</p>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 px-3 text-center text-muted-foreground">Loading report...</td>
                </tr>
              ) : safeReport.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 px-3 text-center text-muted-foreground">No report data found for this month.</td>
                </tr>
              ) : safeReport.rows.map((r, i) => (
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
            <span className="font-semibold text-foreground">{safeReport.totals.totalMilk} liters</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Revenue from Milk</span>
            <span className="font-semibold text-foreground">{safeReport.totals.totalRevMilk.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Other Revenue</span>
            <span className="font-semibold text-foreground">{safeReport.totals.totalOtherRev.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-semibold text-primary">{safeReport.totals.totalRev.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-semibold text-destructive">{safeReport.totals.totalExp.toLocaleString()} PKR</span>
          </div>
        </div>
      </div>

      {/* Monthly Report Summary */}
      <div className="glass-card p-5 mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Monthly Report Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
            <p className="text-xl font-bold text-foreground">{safeReport.summary.openingBalance.toLocaleString()} PKR</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
            <p className="text-xl font-bold text-primary">{safeReport.summary.netBalance.toLocaleString()} PKR</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Closing Balance</p>
            <p className="text-xl font-bold text-accent">{safeReport.summary.closingBalance.toLocaleString()} PKR</p>
          </div>
        </div>
      </div>

    </AppLayout>
  );
}
