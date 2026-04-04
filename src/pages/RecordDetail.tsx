import { useParams, Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Milk, TrendingDown, TrendingUp, DollarSign } from "lucide-react";

export default function RecordDetail() {
  const { id } = useParams();

  // Sample data for display
  const record = {
    date: "2024-03-15",
    milkAM: 45, milkPM: 42, milkRate: 40,
    cattleFeed: 20, cattleFeedRate: 25, mineralMixture: 2, mineralMixtureRate: 80,
    fodder: 5, fodderRate: 100, labor: 300, veterinary: 0, miscExpense: 150,
    milkSale: 0, cattleSale: 0, subsidies: 0, miscRevenue: 200,
  };

  const totalMilk = record.milkAM + record.milkPM;
  const milkRevenue = totalMilk * record.milkRate;
  const totalExpenses = record.cattleFeed * record.cattleFeedRate + record.mineralMixture * record.mineralMixtureRate +
    record.fodder * record.fodderRate + record.labor + record.veterinary + record.miscExpense;
  const totalRevenue = milkRevenue + record.milkSale + record.cattleSale + record.subsidies + record.miscRevenue;
  const balance = totalRevenue - totalExpenses;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/records">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Record Detail</h1>
              <p className="text-sm text-muted-foreground">{record.date}</p>
            </div>
          </div>
          <Link to={`/records/${id}/edit`}>
            <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /> Edit</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SummaryItem icon={Milk} label="Total Milk" value={`${totalMilk} L`} color="text-accent" />
          <SummaryItem icon={TrendingUp} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="text-primary" />
          <SummaryItem icon={TrendingDown} label="Expenses" value={`₹${totalExpenses.toLocaleString()}`} color="text-destructive" />
          <SummaryItem icon={DollarSign} label="Balance" value={`₹${balance.toLocaleString()}`} color={balance >= 0 ? "text-primary" : "text-destructive"} />
        </div>

        {/* Milk Details */}
        <div className="glass-card p-5 mb-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">🥛 Milk Production</h2>
          <div className="grid grid-cols-3 gap-4">
            <DetailRow label="Morning" value={`${record.milkAM} L`} />
            <DetailRow label="Evening" value={`${record.milkPM} L`} />
            <DetailRow label="Rate" value={`₹${record.milkRate}/L`} />
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card p-5 mb-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">📉 Expenses</h2>
          <div className="space-y-2">
            <DetailLine label="Cattle Feed" detail={`${record.cattleFeed} kg × ₹${record.cattleFeedRate}`} value={`₹${(record.cattleFeed * record.cattleFeedRate).toLocaleString()}`} />
            <DetailLine label="Mineral Mixture" detail={`${record.mineralMixture} kg × ₹${record.mineralMixtureRate}`} value={`₹${(record.mineralMixture * record.mineralMixtureRate).toLocaleString()}`} />
            <DetailLine label="Fodder" detail={`${record.fodder} × ₹${record.fodderRate}`} value={`₹${(record.fodder * record.fodderRate).toLocaleString()}`} />
            <DetailLine label="Labor" value={`₹${record.labor.toLocaleString()}`} />
            <DetailLine label="Veterinary" value={`₹${record.veterinary.toLocaleString()}`} />
            <DetailLine label="Miscellaneous" value={`₹${record.miscExpense.toLocaleString()}`} />
            <div className="border-t border-border/50 pt-2 flex justify-between">
              <span className="font-semibold text-foreground text-sm">Total</span>
              <span className="font-bold text-destructive">₹{totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-card p-5 animate-slide-up">
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">📈 Revenue</h2>
          <div className="space-y-2">
            <DetailLine label="Milk Revenue" detail={`${totalMilk} L × ₹${record.milkRate}`} value={`₹${milkRevenue.toLocaleString()}`} />
            <DetailLine label="Milk Sale" value={`₹${record.milkSale.toLocaleString()}`} />
            <DetailLine label="Cattle Sale" value={`₹${record.cattleSale.toLocaleString()}`} />
            <DetailLine label="Subsidies" value={`₹${record.subsidies.toLocaleString()}`} />
            <DetailLine label="Miscellaneous" value={`₹${record.miscRevenue.toLocaleString()}`} />
            <div className="border-t border-border/50 pt-2 flex justify-between">
              <span className="font-semibold text-foreground text-sm">Total</span>
              <span className="font-bold text-primary">₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SummaryItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DetailLine({ label, detail, value }: { label: string; detail?: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <span className="text-muted-foreground">{label}</span>
        {detail && <span className="text-xs text-muted-foreground/60 ml-2">({detail})</span>}
      </div>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
