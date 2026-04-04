import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Send, Milk } from "lucide-react";
import { toast } from "sonner";

interface DynamicField {
  id: number;
  description: string;
  value: string;
}

export default function Dashboard() {
  const [milkMorning, setMilkMorning] = useState("");
  const [milkEvening, setMilkEvening] = useState("");
  const [revenues, setRevenues] = useState<DynamicField[]>([]);
  const [expenses, setExpenses] = useState<DynamicField[]>([]);

  const addRevenue = () => setRevenues([...revenues, { id: Date.now(), description: "", value: "" }]);
  const addExpense = () => setExpenses([...expenses, { id: Date.now(), description: "", value: "" }]);

  const removeRevenue = (id: number) => setRevenues(revenues.filter((r) => r.id !== id));
  const removeExpense = (id: number) => setExpenses(expenses.filter((e) => e.id !== id));

  const updateRevenue = (id: number, field: "description" | "value", val: string) =>
    setRevenues(revenues.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  const updateExpense = (id: number, field: "description" | "value", val: string) =>
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Record submitted successfully!");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mx-auto mb-3">
            <Milk className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Daily Record Entry</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter today's milk yield and transactions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Milk Fields */}
          <div className="glass-card p-5 animate-slide-up">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">🥛 Milk Yield</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Morning (Liters)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 39"
                  value={milkMorning}
                  onChange={(e) => setMilkMorning(e.target.value)}
                  className="h-10 bg-secondary border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Evening (Liters)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 48.5"
                  value={milkEvening}
                  onChange={(e) => setMilkEvening(e.target.value)}
                  className="h-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="glass-card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">💰 Revenue</h2>
              <Button type="button" variant="outline" size="sm" onClick={addRevenue}>
                <Plus className="h-3.5 w-3.5" /> Add Revenue
              </Button>
            </div>
            {revenues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">No revenue entries. Click "Add Revenue" to add one.</p>
            ) : (
              <div className="space-y-3">
                {revenues.map((r) => (
                  <div key={r.id} className="flex items-end gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input
                        placeholder="e.g. Milk sale"
                        value={r.description}
                        onChange={(e) => updateRevenue(r.id, "description", e.target.value)}
                        className="h-9 bg-secondary border-border"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <Label className="text-xs text-muted-foreground">Amount (PKR)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={r.value}
                        onChange={(e) => updateRevenue(r.id, "value", e.target.value)}
                        className="h-9 bg-secondary border-border"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeRevenue(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Section */}
          <div className="glass-card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">📉 Expenses</h2>
              <Button type="button" variant="outline" size="sm" onClick={addExpense}>
                <Plus className="h-3.5 w-3.5" /> Add Expense
              </Button>
            </div>
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">No expense entries. Click "Add Expense" to add one.</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-end gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input
                        placeholder="e.g. Feed purchase"
                        value={exp.description}
                        onChange={(e) => updateExpense(exp.id, "description", e.target.value)}
                        className="h-9 bg-secondary border-border"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <Label className="text-xs text-muted-foreground">Amount (PKR)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={exp.value}
                        onChange={(e) => updateExpense(exp.id, "value", e.target.value)}
                        className="h-9 bg-secondary border-border"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeExpense(exp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-11">
            <Send className="h-4 w-4" /> Submit Record
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
