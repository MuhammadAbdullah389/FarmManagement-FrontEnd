import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Edit, FileText, AlertCircle } from "lucide-react";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const sampleRecords = [
  { id: 1, date: "2024-03-01", milkAM: 45, milkPM: 42, totalExpenses: 1200, totalRevenue: 3500 },
  { id: 2, date: "2024-03-02", milkAM: 43, milkPM: 40, totalExpenses: 800, totalRevenue: 3300 },
  { id: 3, date: "2024-03-03", milkAM: 46, milkPM: 44, totalExpenses: 950, totalRevenue: 3600 },
  { id: 4, date: "2024-03-04", milkAM: 41, milkPM: 39, totalExpenses: 1100, totalRevenue: 3200 },
  { id: 5, date: "2024-03-05", milkAM: 48, milkPM: 45, totalExpenses: 750, totalRevenue: 3800 },
  { id: 6, date: "2024-03-06", milkAM: 44, milkPM: 41, totalExpenses: 900, totalRevenue: 3400 },
  { id: 7, date: "2024-03-07", milkAM: 47, milkPM: 43, totalExpenses: 1050, totalRevenue: 3700 },
];

export default function Records() {
  const [monthIndex, setMonthIndex] = useState(2);
  const year = 2024;

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Records</h1>
          <p className="text-sm text-muted-foreground">Daily farm records overview</p>
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

      {sampleRecords.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No records found</h3>
          <p className="text-sm text-muted-foreground mb-4">No records for {months[monthIndex]} {year}</p>
          <Link to="/new-record">
            <Button size="sm">Add Record</Button>
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AM (L)</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">PM (L)</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total (L)</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expenses</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sampleRecords.map((r, i) => {
                  const balance = r.totalRevenue - r.totalExpenses;
                  return (
                    <tr key={r.id} className={`border-b border-border/30 hover:bg-secondary/50 transition-colors ${i % 2 === 0 ? "bg-secondary/10" : ""}`}>
                      <td className="py-3 px-4 font-medium text-foreground">{r.date}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{r.milkAM}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{r.milkPM}</td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">{r.milkAM + r.milkPM}</td>
                      <td className="py-3 px-4 text-right text-destructive">₹{r.totalExpenses.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-primary">₹{r.totalRevenue.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>₹{balance.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/records/${r.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-accent">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link to={`/records/${r.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-secondary/30 border-t border-border">
                  <td className="py-3 px-4 font-semibold text-foreground">Totals</td>
                  <td className="py-3 px-4 text-right font-semibold text-foreground">{sampleRecords.reduce((s, r) => s + r.milkAM, 0)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-foreground">{sampleRecords.reduce((s, r) => s + r.milkPM, 0)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-foreground">{sampleRecords.reduce((s, r) => s + r.milkAM + r.milkPM, 0)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-destructive">₹{sampleRecords.reduce((s, r) => s + r.totalExpenses, 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-primary">₹{sampleRecords.reduce((s, r) => s + r.totalRevenue, 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-primary">₹{sampleRecords.reduce((s, r) => s + (r.totalRevenue - r.totalExpenses), 0).toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
