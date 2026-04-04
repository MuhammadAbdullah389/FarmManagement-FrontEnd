import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function NewRecord() {
  const [date, setDate] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    milkAM: "", milkPM: "", milkRate: "",
    cattleFeed: "", cattleFeedRate: "", mineralMixture: "", mineralMixtureRate: "",
    fodder: "", fodderRate: "", labor: "", veterinary: "", miscExpense: "",
    milkSale: "", cattleSale: "", subsidies: "", miscRevenue: "",
  });

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const totalMilk = (parseFloat(form.milkAM) || 0) + (parseFloat(form.milkPM) || 0);
  const milkRevenue = totalMilk * (parseFloat(form.milkRate) || 0);

  const totalExpenses =
    (parseFloat(form.cattleFeed) || 0) * (parseFloat(form.cattleFeedRate) || 0) +
    (parseFloat(form.mineralMixture) || 0) * (parseFloat(form.mineralMixtureRate) || 0) +
    (parseFloat(form.fodder) || 0) * (parseFloat(form.fodderRate) || 0) +
    (parseFloat(form.labor) || 0) + (parseFloat(form.veterinary) || 0) + (parseFloat(form.miscExpense) || 0);

  const totalRevenue = milkRevenue + (parseFloat(form.milkSale) || 0) + (parseFloat(form.cattleSale) || 0) +
    (parseFloat(form.subsidies) || 0) + (parseFloat(form.miscRevenue) || 0);

  const balance = totalRevenue - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">New Daily Record</h1>
          <p className="text-sm text-muted-foreground">Enter today's farm data</p>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            Record saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Date
            </h2>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs h-10 bg-secondary border-border" required />
          </div>

          {/* Milk Production */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">🥛 Milk Production</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Morning (L)" value={form.milkAM} onChange={(v) => update("milkAM", v)} />
              <FormField label="Evening (L)" value={form.milkPM} onChange={(v) => update("milkPM", v)} />
              <FormField label="Rate (₹/L)" value={form.milkRate} onChange={(v) => update("milkRate", v)} />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{totalMilk} L</span> · Revenue: <span className="font-semibold text-primary">₹{milkRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">📉 Expenses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Cattle Feed (kg)" value={form.cattleFeed} onChange={(v) => update("cattleFeed", v)} />
              <FormField label="Feed Rate (₹/kg)" value={form.cattleFeedRate} onChange={(v) => update("cattleFeedRate", v)} />
              <FormField label="Mineral Mixture (kg)" value={form.mineralMixture} onChange={(v) => update("mineralMixture", v)} />
              <FormField label="Mixture Rate (₹/kg)" value={form.mineralMixtureRate} onChange={(v) => update("mineralMixtureRate", v)} />
              <FormField label="Fodder (bundles)" value={form.fodder} onChange={(v) => update("fodder", v)} />
              <FormField label="Fodder Rate (₹)" value={form.fodderRate} onChange={(v) => update("fodderRate", v)} />
              <FormField label="Labor (₹)" value={form.labor} onChange={(v) => update("labor", v)} />
              <FormField label="Veterinary (₹)" value={form.veterinary} onChange={(v) => update("veterinary", v)} />
              <FormField label="Misc Expenses (₹)" value={form.miscExpense} onChange={(v) => update("miscExpense", v)} />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Total Expenses: <span className="font-semibold text-destructive">₹{totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">📈 Revenue</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Milk Sale (₹)" value={form.milkSale} onChange={(v) => update("milkSale", v)} />
              <FormField label="Cattle Sale (₹)" value={form.cattleSale} onChange={(v) => update("cattleSale", v)} />
              <FormField label="Subsidies (₹)" value={form.subsidies} onChange={(v) => update("subsidies", v)} />
              <FormField label="Misc Revenue (₹)" value={form.miscRevenue} onChange={(v) => update("miscRevenue", v)} />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Total Revenue: <span className="font-semibold text-primary">₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card p-5 border-primary/20">
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">💰 Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-lg font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                <p className="text-lg font-bold text-destructive">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Balance</p>
                <p className={`text-lg font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>₹{balance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            <Save className="h-4 w-4" />
            Save Record
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step="any"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 bg-secondary border-border focus:border-primary"
      />
    </div>
  );
}
