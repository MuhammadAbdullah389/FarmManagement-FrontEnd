import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DynamicField {
  id: number;
  description: string;
  value: string;
}

export default function NewRecord() {
  const location = useLocation();
  const isExisting = location.pathname.includes("/existing");

  const [date, setDate] = useState("");
  const [milkMorning, setMilkMorning] = useState("0");
  const [milkEvening, setMilkEvening] = useState("0");
  const [expenses, setExpenses] = useState<DynamicField[]>([]);
  const [revenues, setRevenues] = useState<DynamicField[]>([]);

  const addExpense = () => setExpenses([...expenses, { id: Date.now(), description: "", value: "" }]);
  const addRevenue = () => setRevenues([...revenues, { id: Date.now(), description: "", value: "" }]);
  const removeExpense = (id: number) => setExpenses(expenses.filter((e) => e.id !== id));
  const removeRevenue = (id: number) => setRevenues(revenues.filter((r) => r.id !== id));
  const updateExpense = (id: number, field: "description" | "value", val: string) =>
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  const updateRevenue = (id: number, field: "description" | "value", val: string) =>
    setRevenues(revenues.map((r) => (r.id === id ? { ...r, [field]: val } : r)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isExisting ? "Record updated successfully!" : "New record inserted!");
  };

  const title = isExisting
    ? `Update Entry for ${date || "Select Date"}`
    : `New Entry for ${date || "Select Date"}`;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div className="glass-card p-5 animate-slide-up">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Select Date
            </h2>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-xs h-10 bg-secondary border-border"
              required
            />
          </div>

          {/* Milk + Expenses + Revenue in one card like the screenshot */}
          <div className="glass-card p-5 animate-slide-up space-y-6">
            {/* Morning Milk */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Morning Milk Quantity:</Label>
              <Input
                type="number"
                step="0.5"
                value={milkMorning}
                onChange={(e) => setMilkMorning(e.target.value)}
                className="h-10 bg-secondary border-border"
                required
              />
            </div>

            {/* Evening Milk */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Evening Milk Quantity:</Label>
              <Input
                type="number"
                step="0.5"
                value={milkEvening}
                onChange={(e) => setMilkEvening(e.target.value)}
                className="h-10 bg-secondary border-border"
                required
              />
            </div>

            {/* Expenses */}
            <div>
              <h2 className="text-lg font-semibold text-accent text-center mb-3">Expenses</h2>
              {expenses.length > 0 && (
                <div className="space-y-3 mb-3">
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
              <Button type="button" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={addExpense}>
                <Plus className="h-3.5 w-3.5" /> Add Expense
              </Button>
            </div>

            {/* Revenues */}
            <div>
              <h2 className="text-lg font-semibold text-accent text-center mb-3">Revenues</h2>
              {revenues.length > 0 && (
                <div className="space-y-3 mb-3">
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
              <div className="flex gap-2">
                <Button type="button" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={addRevenue}>
                  <Plus className="h-3.5 w-3.5" /> Add Revenue
                </Button>
                <Button type="submit" size="sm">
                  <Save className="h-3.5 w-3.5" /> {isExisting ? "Update Record" : "Submit Record"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
