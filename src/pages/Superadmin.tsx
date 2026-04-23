import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, type SuperadminFarm, type SuperadminReport } from "@/lib/api";
import { toast } from "sonner";
import { Activity, Building2, ChevronRight, CircleDollarSign, Layers3, Plus, RefreshCw, ShieldCheck, ShieldX, Trash2, Users } from "lucide-react";

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
  const [report, setReport] = useState<SuperadminReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeUntilFarm, setActiveUntilFarm] = useState<SuperadminFarm | null>(null);
  const [activeUntilDate, setActiveUntilDate] = useState<Date | undefined>(undefined);
  const [activeUntilTime, setActiveUntilTime] = useState("12:00");
  const [deleteFarmTarget, setDeleteFarmTarget] = useState<SuperadminFarm | null>(null);
  const [deleteVerifyOpen, setDeleteVerifyOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteVerifyName, setDeleteVerifyName] = useState("");
  const [deleteVerifyCode, setDeleteVerifyCode] = useState("");
  const [newFarm, setNewFarm] = useState({
    name: "",
    adminEmail: "",
    adminPassword: "",
    codePrefix: "ALPHA" as TenantPrefix,
    codeNumber: "",
  });

  const tenantCodePreview = buildTenantCode(newFarm.codePrefix, newFarm.codeNumber) || `${newFarm.codePrefix}-001`;

  const toCalendarDate = (value?: string | null) => {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const toTimeValue = (value?: string | null) => {
    if (!value) {
      return "12:00";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "12:00";
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const buildActiveUntilValue = (date: Date | undefined, time: string) => {
    if (!date) {
      return null;
    }

    const [hoursPart, minutesPart] = String(time || "").split(":");
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return null;
    }

    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    if (Number.isNaN(combined.getTime())) {
      return null;
    }

    return combined.toISOString();
  };

  const openActiveUntilDialog = (farm: SuperadminFarm) => {
    setActiveUntilFarm(farm);
    setActiveUntilDate(toCalendarDate(farm.inactiveUntil));
    setActiveUntilTime(toTimeValue(farm.inactiveUntil));
  };

  const closeActiveUntilDialog = () => {
    setActiveUntilFarm(null);
    setActiveUntilDate(undefined);
    setActiveUntilTime("12:00");
  };

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

  const loadReport = async () => {
    try {
      const data = await api.getSuperadminReport();
      setReport(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load superadmin report");
      setReport(null);
    }
  };

  useEffect(() => {
    loadFarms();
    loadReport();
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
      await loadReport();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create farm");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleFarm = async (farm: SuperadminFarm, inactiveUntil?: string | null) => {
    const turningActive = !farm.isActiveNow;

    setBusy(true);
    try {
      const result = await api.updateSuperadminFarmStatus(farm.id, {
        isActive: turningActive,
        inactiveUntil: turningActive ? inactiveUntil || null : null,
      });
      toast.success(result.message || `Farm ${turningActive ? "activated" : "deactivated"}`);
      await loadFarms();
      await loadReport();
      closeActiveUntilDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to change farm status");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteFarm = async (farm: SuperadminFarm) => {
    setDeleteFarmTarget(farm);
    setDeleteVerifyName("");
    setDeleteVerifyCode("");
    setDeleteVerifyOpen(true);
  };

  const handleContinueDelete = () => {
    if (!deleteFarmTarget) {
      return;
    }

    const typedName = deleteVerifyName.trim().toLowerCase();
    const typedCode = deleteVerifyCode.trim().toLowerCase();
    const expectedName = deleteFarmTarget.name.trim().toLowerCase();
    const expectedCode = deleteFarmTarget.code.trim().toLowerCase();

    if (!typedName || !typedCode) {
      toast.error("Type both the farm name and tenant code");
      return;
    }

    if (typedName !== expectedName || typedCode !== expectedCode) {
      toast.error("Farm name and tenant code do not match");
      return;
    }

    setDeleteVerifyOpen(false);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteFarm = async () => {
    if (!deleteFarmTarget) {
      return;
    }

    setBusy(true);
    try {
      const result = await api.deleteSuperadminFarm(deleteFarmTarget.id);
      toast.success(result.message || "Farm deleted");
      setDeleteConfirmOpen(false);
      setDeleteFarmTarget(null);
      await loadFarms();
      await loadReport();
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
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
        <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-secondary/20 shadow-sm">
          <CardHeader className="gap-4 border-b border-border/50 bg-background/40 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Superadmin control center
              </div>
              <CardTitle className="text-2xl sm:text-3xl">Farm Management</CardTitle>
              <CardDescription className="max-w-2xl text-sm sm:text-base">
                Create farms, inspect platform activity, and manage farm activation without losing mobile usability.
              </CardDescription>
            </div>

            <Button type="button" variant="outline" onClick={loadFarms} disabled={loading || busy} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Farms
            </Button>
          </CardHeader>

          {report && (
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Total Farms", value: report.totalFarms, icon: Building2 },
                  { label: "Active Farms", value: report.activeFarms, icon: ShieldCheck },
                  { label: "Inactive Farms", value: report.inactiveFarms, icon: ShieldX },
                  { label: "Total Users", value: report.totalUsers, icon: Users },
                  { label: "Total Logs", value: report.totalUserLogs, icon: Layers3 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl">Add Farm</CardTitle>
              </div>
              <CardDescription>
                Create the tenant, initial admin login, and subscription access in one step.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateFarm} autoComplete="off" className="grid gap-4 sm:grid-cols-2">
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
                    name="farm-admin-email"
                    type="email"
                    autoComplete="off"
                    value={newFarm.adminEmail}
                    onChange={(e) => setNewFarm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="owner@farm.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Admin Password</Label>
                  <Input
                    name="farm-admin-password"
                    type="password"
                    autoComplete="new-password"
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

                <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2">
                  <Button type="button" variant="outline" disabled={busy || loading} onClick={handleSuggestTenantCode} className="w-full sm:w-auto">
                    Suggest Code
                  </Button>
                  <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> Add Farm
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl">Active Farms</CardTitle>
              </div>
              <CardDescription>
                Quick operational view of all tenant farms and their activation state.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading farms...</p>
              ) : farms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
                  No farms found.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {farms.map((farm) => (
                    <div key={farm.id} className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm transition-colors hover:border-primary/30">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="truncate text-base font-semibold text-foreground sm:text-lg">{farm.name}</div>
                            <Badge variant={farm.isActiveNow ? "default" : "secondary"} className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide">
                              {farm.isActiveNow ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Code: {farm.code}</div>
                          {farm.inactiveUntil && (
                            <div className="text-xs text-muted-foreground">
                              {farm.isActiveNow ? "Active until" : "Inactive until"}: {new Date(farm.inactiveUntil).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 sm:min-w-[170px]">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            className="w-full justify-center sm:justify-start"
                            onClick={() => {
                              if (farm.isActiveNow) {
                                void handleToggleFarm(farm, null);
                                return;
                              }

                              openActiveUntilDialog(farm);
                            }}
                          >
                            {farm.isActiveNow ? (
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
                            className="w-full justify-center sm:justify-start"
                            onClick={() => handleDeleteFarm(farm)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={Boolean(activeUntilFarm)} onOpenChange={(open) => {
          if (!open) {
            closeActiveUntilDialog();
          }
        }}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>Set active until</DialogTitle>
              <DialogDescription>
                Choose the date and time until which {activeUntilFarm?.name || "this farm"} should remain active.
              </DialogDescription>
            </DialogHeader>

            <form
              className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
              onSubmit={(event) => {
                event.preventDefault();
                if (!activeUntilFarm) return;

                const parsedValue = buildActiveUntilValue(activeUntilDate, activeUntilTime);
                if (!parsedValue) {
                  toast.error("Select a valid date and time.");
                  return;
                }

                void handleToggleFarm(activeUntilFarm, parsedValue);
              }}
            >
              <div className="space-y-2 lg:pr-2">
                <Label className="text-sm text-muted-foreground">Select date</Label>
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-secondary/20 p-2 sm:p-3">
                  <Calendar
                    mode="single"
                    selected={activeUntilDate}
                    onSelect={setActiveUntilDate}
                    initialFocus
                  />
                </div>
              </div>

              <div className="space-y-4 lg:border-l lg:border-border/60 lg:pl-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Select time</Label>
                  <Input
                    type="time"
                    value={activeUntilTime}
                    onChange={(e) => setActiveUntilTime(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">Activation preview</span>
                  </div>
                  <p className="mt-2">
                    The farm will be active until the selected date and time. After that, farm admins are redirected to the locked subscription page.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeActiveUntilDialog} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving..." : "Save Active Until"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteVerifyOpen}
          onOpenChange={(open) => {
            setDeleteVerifyOpen(open);
            if (!open) {
              setDeleteFarmTarget(null);
              setDeleteVerifyName("");
              setDeleteVerifyCode("");
            }
          }}
        >
          <DialogContent className="w-[95vw] max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>Verify farm deletion</DialogTitle>
              <DialogDescription>
                Type the farm name and tenant code exactly as shown before you continue.
              </DialogDescription>
            </DialogHeader>

            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleContinueDelete();
              }}
            >
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 text-sm">
                <div className="font-semibold text-foreground">{deleteFarmTarget?.name}</div>
                <div className="text-muted-foreground">Tenant: {deleteFarmTarget?.code}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Farm Name</Label>
                <Input
                  value={deleteVerifyName}
                  onChange={(e) => setDeleteVerifyName(e.target.value)}
                  placeholder="Type farm name"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Tenant Code</Label>
                <Input
                  value={deleteVerifyCode}
                  onChange={(e) => setDeleteVerifyCode(e.target.value)}
                  placeholder="Type tenant code"
                  autoComplete="off"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDeleteVerifyOpen(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={busy}>
                  Continue
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteConfirmOpen}
          onOpenChange={(open) => {
            setDeleteConfirmOpen(open);
            if (!open) {
              setDeleteFarmTarget(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm permanent deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Delete {deleteFarmTarget?.name || "this farm"} ({deleteFarmTarget?.code || "tenant"})? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
              <div className="font-medium text-foreground">{deleteFarmTarget?.name}</div>
              <div className="text-muted-foreground">Tenant: {deleteFarmTarget?.code}</div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="button" disabled={busy} onClick={() => { void handleConfirmDeleteFarm(); }}>
                {busy ? "Deleting..." : "Delete Farm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
