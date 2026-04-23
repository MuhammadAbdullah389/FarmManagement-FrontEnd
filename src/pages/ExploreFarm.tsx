import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type FarmExploreOverview, type SuperadminFarm } from "@/lib/api";
import { toast } from "sonner";

const TENANT_SERIES = ["ALPHA", "BETA", "CHARLIE", "DELTA"] as const;

type TenantPrefix = typeof TENANT_SERIES[number];

export default function ExploreFarm() {
  const [farms, setFarms] = useState<SuperadminFarm[]>([]);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<FarmExploreOverview | null>(null);
  const [prefix, setPrefix] = useState<TenantPrefix>("ALPHA");
  const [codeNumber, setCodeNumber] = useState("");

  useEffect(() => {
    let active = true;

    const loadFarms = async () => {
      try {
        const data = await api.getSuperadminFarms();
        if (active) {
          setFarms(data);
        }
      } catch (err) {
        if (active) {
          toast.error(err instanceof Error ? err.message : "Unable to load farms");
        }
      }
    };

    loadFarms();
    return () => {
      active = false;
    };
  }, []);

  const selectedCode = codeNumber ? `${prefix}-${String(Number(codeNumber)).padStart(3, "0")}` : "";

  const handleExplore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode) {
      toast.error("Enter tenant code to explore");
      return;
    }

    setLoading(true);
    try {
      const data = await api.getFarmExploreOverview(selectedCode);
      setOverview(data);
    } catch (err) {
      setOverview(null);
      toast.error(err instanceof Error ? err.message : "Unable to fetch farm overview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Explore Farm</h1>
          <p className="text-sm text-muted-foreground">Provide tenant identifier to inspect all farm-level data.</p>
        </div>

        <div className="glass-card p-5">
          <form onSubmit={handleExplore} className="grid gap-4 sm:grid-cols-[1fr_120px_auto] items-end">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tenant Prefix</Label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as TenantPrefix)}
              >
                {TENANT_SERIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Code</Label>
              <Input
                inputMode="numeric"
                maxLength={3}
                placeholder="001"
                value={codeNumber}
                onChange={(e) => setCodeNumber(e.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Exploring..." : "Explore"}
            </Button>
          </form>
        </div>

        {overview && (
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold text-foreground">{overview.farm.name} ({overview.farm.code})</h2>
              <p className="text-sm text-muted-foreground">Status: {overview.farm.isActiveNow ? "Active" : "Inactive"}</p>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">Farm Totals</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="text-lg font-semibold text-foreground">{overview.totals.usersCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <p className="text-xs text-muted-foreground">Records</p>
                  <p className="text-lg font-semibold text-foreground">{overview.totals.recordsCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <p className="text-xs text-muted-foreground">HR Employees</p>
                  <p className="text-lg font-semibold text-foreground">{overview.totals.hrEmployeesCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <p className="text-xs text-muted-foreground">Monthly Reports</p>
                  <p className="text-lg font-semibold text-foreground">{overview.totals.monthlyReportsCount}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">Latest Records</h3>
              {overview.latestRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No records found for this farm.</p>
              ) : (
                <div className="space-y-2">
                  {overview.latestRecords.map((record) => (
                    <div key={`${record.date}-${record.Balance}`} className="rounded-lg border border-border/50 bg-secondary/20 p-3 text-sm flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{record.date}</span>
                      <span className="text-muted-foreground">Balance: {Number(record.Balance || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {farms.length > 0 && !overview && (
          <div className="text-xs text-muted-foreground">
            Existing tenant codes: {farms.map((farm) => farm.code).join(", ")}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
