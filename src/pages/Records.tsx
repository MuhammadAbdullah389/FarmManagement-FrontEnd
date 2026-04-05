import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { api, type RecordSummary } from "@/lib/api";
import { toast } from "sonner";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDisplayDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-GB");
}

export default function Records() {
  const now = new Date();
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<RecordSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRecords = async () => {
      setLoading(true);
      try {
        const data = await api.getRecords(monthIndex + 1, year);
        if (active) {
          setRecords(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setRecords([]);
          toast.error(err instanceof Error ? err.message : "Unable to load records");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecords();
    return () => {
      active = false;
    };
  }, [monthIndex, year]);

  const goPrevMonth = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((prev) => prev - 1);
      return;
    }
    setMonthIndex((prev) => prev - 1);
  };

  const goNextMonth = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((prev) => prev + 1);
      return;
    }
    setMonthIndex((prev) => prev + 1);
  };

  return (
    <AppLayout>
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={goPrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold text-accent min-w-[160px] text-center">
          {months[monthIndex]} {year}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={goNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <h2 className="text-xl font-bold text-foreground text-center mb-6">Entries Table</h2>

      {loading ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-2">Loading records...</h3>
        </div>
      ) : records.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No records found</h3>
          <p className="text-sm text-muted-foreground mb-4">No records for {months[monthIndex]} {year}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {records.map((r) => (
            <div key={r.date} className="animate-slide-up">
              <h3 className="text-lg font-bold text-accent text-center mb-3">{formatDisplayDate(r.date)}</h3>
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Morning Milk Yield</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Noon Milk Yield</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Expenses</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border/30">
                        <td className="py-3 px-4 text-center text-foreground">{r.milkMorning}</td>
                        <td className="py-3 px-4 text-center text-foreground">{r.milkEvening}</td>
                        <td className="py-3 px-4 text-center text-foreground">{r.totalExpenses.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-foreground">{r.totalRevenue.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-center font-semibold ${r.balance >= 0 ? "text-primary" : "text-destructive"}`}>{r.balance.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-2">
                <Link to={`/records/${encodeURIComponent(r.date)}`}>
                  <Button variant="default" size="sm" className="gradient-primary">
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
