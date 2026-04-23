import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { api, type AuthUser, type TenantUserSummary } from "@/lib/api";
import { toast } from "sonner";
import { Plus, RefreshCw, Trash2, Users } from "lucide-react";

export default function Settings() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<TenantUserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" as "user" | "admin" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TenantUserSummary | null>(null);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getTenantUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load tenant users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrentUser();
    void loadUsers();
  }, []);

  const adminCount = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      toast.error("Name, email, and password are required");
      return;
    }

    setBusy(true);
    try {
      const result = await api.createTenantUser({
        name,
        email,
        password,
        role: form.role,
      });
      toast.success(result.message || "User created");
      setForm({ name: "", email: "", password: "", role: "user" });
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create user");
    } finally {
      setBusy(false);
    }
  };

  const openDeleteDialog = (user: TenantUserSummary) => {
    setPendingDelete(user);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setBusy(true);
    try {
      const result = await api.deleteTenantUser(pendingDelete.id);
      toast.success(result.message || "User deleted");
      setDeleteOpen(false);
      setPendingDelete(null);
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings - Farm Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage the accounts for {currentUser?.tenantName || currentUser?.tenantCode || "this farm"} by name and email.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={loadUsers} disabled={loading || busy}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Add User</h2>
          </div>

          <form onSubmit={handleCreateUser} autoComplete="off" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Name</Label>
              <Input
                name="tenant-user-name"
                autoComplete="off"
                autoCapitalize="words"
                spellCheck={false}
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input
                name="tenant-user-email"
                type="email"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Password</Label>
              <Input
                name="tenant-user-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as "user" | "admin" }))}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="submit" disabled={busy}>
                <Plus className="h-4 w-4 mr-2" /> Add User
              </Button>
            </div>
          </form>
        </div>

        <div className="glass-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Farm Users</h2>
              <p className="text-sm text-muted-foreground">Names and emails for this farm tenant.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-secondary/30 px-2 py-1">Total: {users.length}</span>
              <span className="rounded-full border border-border/60 bg-secondary/30 px-2 py-1">Admins: {adminCount}</span>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No farm users found.</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const isMe = currentUser?.id === user.id;
                return (
                  <div key={user.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">{user.role}</span>
                        {isMe && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">You</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={busy || isMe}
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) {
              setPendingDelete(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Delete {pendingDelete?.name || "this user"}? This will remove their login from the farm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 text-sm">
              <div className="font-medium text-foreground">{pendingDelete?.name}</div>
              <div className="text-muted-foreground">{pendingDelete?.email}</div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="button" disabled={busy} onClick={() => { void confirmDelete(); }}>
                {busy ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}