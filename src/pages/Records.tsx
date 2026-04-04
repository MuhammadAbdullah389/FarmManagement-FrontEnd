import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const sampleRecords = [
  { id: 1, date: "01/03/2026", milkMorning: 39, milkEvening: 48.5, totalExpenses: 25000, totalRevenue: 12250, balance: -12750 },
  { id: 2, date: "02/03/2026", milkMorning: 42, milkEvening: 45, totalExpenses: 1200, totalRevenue: 14500, balance: 13300 },
  { id: 3, date: "03/03/2026", milkMorning: 40, milkEvening: 47, totalExpenses: 800, totalRevenue: 13800, balance: 13000 },
  { id: 4, date: "04/03/2026", milkMorning: 38, milkEvening: 44, totalExpenses: 3500, totalRevenue: 12600, balance: 9100 },
  { id: 5, date: "05/03/2026", milkMorning: 41, milkEvening: 46, totalExpenses: 950, totalRevenue: 14200, balance: 13250 },
];

export default function Records() {
  const [monthIndex, setMonthIndex] = useState(2); // March
  const year = 2026;

  return (
    <AppLayout>
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => setMonthIndex(Math.max(0, monthIndex - 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold text-accent min-w-[160px] text-center">
          {months[monthIndex]} {year}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => setMonthIndex(Math.min(11, monthIndex + 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <h2 className="text-xl font-bold text-foreground text-center mb-6">Entries Table</h2>

      {sampleRecords.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No records found</h3>
          <p className="text-sm text-muted-foreground mb-4">No records for {months[monthIndex]} {year}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sampleRecords.map((r) => (
            <div key={r.id} className="animate-slide-up">
              <h3 className="text-lg font-bold text-accent text-center mb-3">{r.date}</h3>
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
                <Link to={`/records/${r.id}`}>
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
