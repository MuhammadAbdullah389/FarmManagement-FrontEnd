import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api, type RecordDetail as RecordDetailModel } from "@/lib/api";
import { toast } from "sonner";

export default function RecordDetail() {
  const { date } = useParams();
  const postingDate = date ? decodeURIComponent(date) : "";
  const [record, setRecord] = useState<RecordDetailModel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postingDate) return;
    let active = true;

    const loadRecord = async () => {
      setLoading(true);
      try {
        const data = await api.getRecord(postingDate);
        if (active) {
          setRecord(data);
        }
      } catch (err) {
        if (active) {
          setRecord(null);
          toast.error(err instanceof Error ? err.message : "Unable to load record details");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecord();
    return () => {
      active = false;
    };
  }, [postingDate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-foreground">Loading record details...</h1>
        </div>
      </AppLayout>
    );
  }

  if (!record) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-foreground">Record not found</h1>
          <p className="text-sm text-muted-foreground mt-2">No record exists for this date.</p>
        </div>
      </AppLayout>
    );
  }

  const totalMilk = record.morningMilk + record.eveningMilk;
  const milkRevenue = totalMilk * (record.milkRate ?? 0);
  const otherRevenue = record.revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalRevenue = milkRevenue + otherRevenue;
  const totalExpenses = record.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalRevenue - totalExpenses;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/records">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Date: {record.date}</h1>
          </div>
        </div>

        {/* Milk Yields */}
        <div className="glass-card p-5 mb-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wider">Milk Yields</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Morning Milk Yield</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Noon Milk Yield</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/30">
                  <td className="py-2.5 px-4 text-foreground">{record.morningMilk} liters</td>
                  <td className="py-2.5 px-4 text-foreground">{record.eveningMilk} liters</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card p-5 mb-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wider">Expenses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Source</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {record.expenses.length === 0 ? (
                  <tr className="border-t border-border/30">
                    <td colSpan={3} className="py-3 px-4 text-muted-foreground text-center">No expenses</td>
                  </tr>
                ) : (
                  record.expenses.map((exp, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="py-2.5 px-4 text-foreground">{exp.description}</td>
                      <td className="py-2.5 px-4 text-foreground">
                        {exp.readonly || exp.source === "hr" ? (
                          <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">HR</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">Manual</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-foreground">{exp.amount.toLocaleString()} PKR</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-card p-5 mb-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wider">Revenue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Source</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {record.revenues.length === 0 ? (
                  <tr className="border-t border-border/30">
                    <td colSpan={3} className="py-3 px-4 text-muted-foreground text-center">No revenue entries</td>
                  </tr>
                ) : (
                  record.revenues.map((rev, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="py-2.5 px-4 text-foreground">{rev.description}</td>
                      <td className="py-2.5 px-4 text-foreground">
                        {rev.readonly || rev.source === "hr" ? (
                          <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">HR</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">Manual</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-foreground">{rev.amount.toLocaleString()} PKR</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Information */}
        <div className="glass-card p-5 animate-slide-up">
          <h2 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wider">Additional Information</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border/30">
                  <td className="py-2.5 px-4 text-muted-foreground font-medium">Total Milk</td>
                  <td className="py-2.5 px-4 text-foreground font-semibold">{totalMilk} liters</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2.5 px-4 text-muted-foreground font-medium">Revenue by Milk</td>
                  <td className="py-2.5 px-4 text-foreground font-semibold">{milkRevenue.toLocaleString()} PKR</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2.5 px-4 text-muted-foreground font-medium">Other Revenue</td>
                  <td className="py-2.5 px-4 text-foreground font-semibold">{otherRevenue.toLocaleString()} PKR</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2.5 px-4 text-muted-foreground font-medium">Total Revenue</td>
                  <td className="py-2.5 px-4 text-primary font-semibold">{totalRevenue.toLocaleString()} PKR</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2.5 px-4 text-muted-foreground font-medium">Total Expenses</td>
                  <td className="py-2.5 px-4 text-destructive font-semibold">{totalExpenses.toLocaleString()} PKR</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-muted-foreground font-medium">Net Balance</td>
                  <td className={`py-2.5 px-4 font-bold ${netBalance >= 0 ? "text-primary" : "text-destructive"}`}>{netBalance.toLocaleString()} PKR</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
