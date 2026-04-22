import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type SuperadminFarm } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Plus, RefreshCw, ShieldCheck, ShieldX, Trash2 } from "lucide-react";

const TENANT_SERIES = ["ALPHA", "BETA", "CHARLIE", "DELTA"] as const;

type TenantPrefix = typeof TENANT_SERIES[number];

function parseTenantCode(code: string) {
  const normalized = String(code || "").trim().toUpperCase();
  const match = normalized.match(/^(ALPHA|BETA|CHARLIE|DELTA)-(\d{3})$/);
  if (!match) {
    return null;
  }

  const sequence = Number(match[2]);
  if (sequence < 1 || sequence > 999) {
    return null;
  }

  return {
    prefix: match[1] as TenantPrefix,
    sequence,
    normalized,
  };
}

function getNextNumberForPrefix(existingCodes: string[], prefix: TenantPrefix) {
  const parsedCodes = existingCodes
    .map((code) => parseTenantCode(code))
    .filter((entry): entry is NonNullable<ReturnType<typeof parseTenantCode>> => Boolean(entry))
    .filter((entry) => entry.prefix === prefix);

  const maxForPrefix = parsedCodes.reduce((max, entry) => Math.max(max, entry.sequence), 0);
  if (maxForPrefix >= 999) {
    return null;
  }

  return String(maxForPrefix + 1).padStart(3, "0");
}

function normalizeCodeNumber(raw: string) {
  const digitsOnly = String(raw || "").replace(/\D/g, "").slice(0, 3);
  if (!digitsOnly) {
    return "";
  }
  return String(Number(digitsOnly)).padStart(3, "0");
}

function buildTenantCode(prefix: TenantPrefix, codeNumber: string) {
  const normalizedNumber = normalizeCodeNumber(codeNumber);
  return normalizedNumber ? `${prefix}-${normalizedNumber}` : "";
}

export default function Superadmin() {
  const [farms, setFarms] = useState<SuperadminFarm[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: "",
    adminEmail: "",
    adminPassword: "",
    codePrefix: "ALPHA" as TenantPrefix,
    codeNumber: "",
  });

  const tenantCodePreview = buildTenantCode(newFarm.codePrefix, newFarm.codeNumber) || `${newFarm.codePrefix}-001`;

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await api.getSuperadminFarms();
      setFarms(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load farms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFarm.name.trim();
    const adminEmail = newFarm.adminEmail.trim();
    const adminPassword = newFarm.adminPassword;
    const code = buildTenantCode(newFarm.codePrefix, newFarm.codeNumber);

    if (!name || !adminEmail || !adminPassword || !code) {
      toast.error("Farm name, admin email, admin password, and tenant code are required");
      return;
    }

    const parsedCode = parseTenantCode(code);
    if (!parsedCode) {
      toast.error("Tenant code must be like ALPHA-001 to DELTA-999");
      return;
    }

    const duplicate = farms.some((farm) => farm.code.trim().toUpperCase() === parsedCode.normalized);
    if (duplicate) {
      toast.error("Tenant code already exists");
      return;
    }

    setBusy(true);
    try {
      const result = await api.createSuperadminFarm({
        name,
        code: parsedCode.normalized,
        email: adminEmail,
        password: adminPassword,
      });
      toast.success(result.message || "Farm created");
      setNewFarm((prev) => ({
        ...prev,
        name: "",
        adminEmail: "",
        adminPassword: "",
        codeNumber: "",
      }));
      await loadFarms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create farm");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleFarm = async (farm: SuperadminFarm) => {
    setBusy(true);
    try {
      const result = await api.updateSuperadminFarmStatus(farm.id, { isActive: !farm.isActive });
      toast.success(result.message || `Farm ${farm.isActive ? "deactivated" : "activated"}`);
      await loadFarms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to change farm status");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteFarm = async (farm: SuperadminFarm) => {
    const approved = window.confirm(`Delete farm ${farm.name}? This action cannot be undone.`);
    if (!approved) return;

    setBusy(true);
    try {
      const result = await api.deleteSuperadminFarm(farm.id);
      toast.success(result.message || "Farm deleted");
      await loadFarms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete farm");
    } finally {
      setBusy(false);
    }
  };

  const handleSuggestTenantCode = () => {
    const suggestedNumber = getNextNumberForPrefix(farms.map((farm) => farm.code), newFarm.codePrefix);
    if (!suggestedNumber) {
      toast.error(`All ${newFarm.codePrefix} tenant code numbers are exhausted`);
      return;
    }

    setNewFarm((prev) => ({ ...prev, codeNumber: suggestedNumber }));
    toast.success(`Suggested tenant code: ${newFarm.codePrefix}-${suggestedNumber}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Superadmin - Farm Management</h1>
            <p className="text-sm text-muted-foreground">View all farms, add new farms, delete farms, and toggle active status.</p>
          </div>
          <Button type="button" variant="outline" onClick={loadFarms} disabled={loading || busy}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Add Farm</h2>
          </div>

          <form onSubmit={handleCreateFarm} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Farm Name</Label>
              <Input
                value={newFarm.name}
                onChange={(e) => setNewFarm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Alpha Dairy Farm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Admin Email</Label>
              <Input
                type="email"
                value={newFarm.adminEmail}
                onChange={(e) => setNewFarm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                placeholder="owner@farm.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Admin Password</Label>
              <Input
                type="password"
                value={newFarm.adminPassword}
                onChange={(e) => setNewFarm((prev) => ({ ...prev, adminPassword: e.target.value }))}
                placeholder="Set initial password"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tenant Identifier</Label>
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={newFarm.codePrefix}
                  onChange={(e) => setNewFarm((prev) => ({
                    ...prev,
                    codePrefix: e.target.value as TenantPrefix,
                    codeNumber: "",
                  }))}
                >
                  {TENANT_SERIES.map((prefix) => (
                    <option key={prefix} value={prefix}>{prefix}</option>
                  ))}
                </select>
                <Input
                  inputMode="numeric"
                  maxLength={3}
                  value={newFarm.codeNumber}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setNewFarm((prev) => ({ ...prev, codeNumber: digitsOnly }));
                  }}
                  placeholder="001"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Format: {tenantCodePreview} (001..999)</p>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={busy || loading} onClick={handleSuggestTenantCode}>
                Suggest Code
              </Button>
              <Button type="submit" disabled={busy}>
                <Plus className="h-4 w-4 mr-2" /> Add Farm
              </Button>
            </div>
          </form>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">All Farms</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading farms...</p>
          ) : farms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No farms found.</p>
          ) : (
            <div className="space-y-3">
              {farms.map((farm) => (
                <div key={farm.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{farm.name}</div>
                    <div className="text-xs text-muted-foreground">Code: {farm.code}</div>
                    <div className="text-xs mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${farm.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                        {farm.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => handleToggleFarm(farm)}
                    >
                      {farm.isActive ? (
                        <><ShieldX className="h-4 w-4 mr-1" /> Set Inactive</>
                      ) : (
                        <><ShieldCheck className="h-4 w-4 mr-1" /> Set Active</>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={busy}
                      onClick={() => handleDeleteFarm(farm)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
