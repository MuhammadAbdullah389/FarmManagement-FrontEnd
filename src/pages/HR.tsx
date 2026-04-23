import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { api, type HrEmployeeDetail, type HrEmployeeSummary, type HrLeftEmployee, type HrSettlementPreview } from "@/lib/api";
import { toast } from "sonner";
import { BriefcaseBusiness, CalendarDays, Coins, Download, HandCoins, ListChecks, Pencil, PlusCircle, RotateCcw, Sparkles, UserRound, UserX } from "lucide-react";

type TransactionType = "advance" | "payback";

function formatMoney(value: number) {
  const rupees = Math.ceil(Number(value || 0));
  return `${rupees.toLocaleString()} PKR`;
}

function describeNetBalance(value: number) {
  const amount = Number(value || 0);

  if (Math.abs(amount) < 0.000001) {
    return { label: "Settled", tone: "text-foreground" };
  }

  if (amount > 0) {
    return { label: `Owner pays ${formatMoney(amount)}`, tone: "text-primary" };
  }

  return { label: `Employee pays ${formatMoney(Math.abs(amount))}`, tone: "text-destructive" };
}

function todayInputValue() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function HR() {
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);
  const [leftEmployees, setLeftEmployees] = useState<HrLeftEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<HrEmployeeDetail | null>(null);
  const [preview, setPreview] = useState<HrSettlementPreview | null>(null);
  const [employeeForm, setEmployeeForm] = useState({ name: "", monthlyPay: "", joiningDate: todayInputValue() });
  const [pendingEmployee, setPendingEmployee] = useState<{ name: string; monthlyPay: number; joiningDate: string } | null>(null);
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ increaseAmount: "", note: "", effectiveDate: todayInputValue() });
  const [pendingSalaryIncrease, setPendingSalaryIncrease] = useState<{ previousPay: number; increaseAmount: number; newMonthlyPay: number; note: string; effectiveDate: string } | null>(null);
  const [confirmPayIncreaseOpen, setConfirmPayIncreaseOpen] = useState(false);
  const [payIncreaseOpen, setPayIncreaseOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({ type: "advance" as TransactionType, amount: "", note: "", transactionDate: todayInputValue() });
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editTransactionForm, setEditTransactionForm] = useState({ type: "advance" as TransactionType, amount: "", note: "", transactionDate: todayInputValue() });
  const [deleteTransactionOpen, setDeleteTransactionOpen] = useState(false);
  const [pendingDeleteTransaction, setPendingDeleteTransaction] = useState<HrEmployeeDetail["transactions"][number] | null>(null);
  const [settlementDate, setSettlementDate] = useState(todayInputValue());
  const [leftDate, setLeftDate] = useState(todayInputValue());
  const [confirmLeftOpen, setConfirmLeftOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const overviewTotals = useMemo(() => {
    return employees.reduce(
      (acc, employee) => ({
        totalEmployees: acc.totalEmployees + 1,
        totalMonthlyPay: acc.totalMonthlyPay + Number(employee.monthlyPay || 0),
        totalCurrentDue: acc.totalCurrentDue + Number(employee.currentDue || 0),
      }),
      { totalEmployees: 0, totalMonthlyPay: 0, totalCurrentDue: 0 },
    );
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(query)
        || employee.joiningDate.toLowerCase().includes(query)
        || String(employee.monthlyPay).includes(query)
      );
    });
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getHrOverview();
      setEmployees(data.employees || []);
      setLeftEmployees(data.leftEmployees || []);
      if (!selectedEmployeeId && data.employees?.length) {
        setSelectedEmployeeId(data.employees[0].id);
      } else if (selectedEmployeeId && data.employees?.length && !data.employees.some((employee) => employee.id === selectedEmployeeId)) {
        setSelectedEmployeeId(data.employees[0].id);
      } else if (selectedEmployeeId && (!data.employees || data.employees.length === 0)) {
        setSelectedEmployeeId(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load HR overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setSelectedEmployee(null);
      setPreview(null);
      setHistoryOpen(false);
      return;
    }

    let active = true;
    const loadEmployee = async () => {
      try {
        const data = await api.getHrEmployee(selectedEmployeeId);
        if (!active) return;
        setSelectedEmployee(data.employee);
        setPreview(null);
        setHistoryOpen(false);
      } catch (err) {
        if (active) {
          toast.error(err instanceof Error ? err.message : "Unable to load employee");
        }
      }
    };

    loadEmployee();
    return () => {
      active = false;
    };
  }, [selectedEmployeeId]);

  const handleCreateEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = employeeForm.name.trim();
    const monthlyPay = Number(employeeForm.monthlyPay || 0);
    const joiningDate = employeeForm.joiningDate;

    if (!name || !monthlyPay || !joiningDate) {
      toast.error("Please complete all employee details");
      return;
    }

    setPendingEmployee({ name, monthlyPay, joiningDate });
    setAddEmployeeOpen(false);
    setConfirmAddOpen(true);
  };

  const handleSalaryIncrease = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedEmployee) {
      toast.error("Select an employee first");
      return;
    }

    const increaseAmount = Number(salaryForm.increaseAmount || 0);
    if (!increaseAmount || increaseAmount <= 0) {
      toast.error("Increase amount must be greater than zero");
      return;
    }

    setPendingSalaryIncrease({
      previousPay: selectedEmployee.monthlyPay,
      increaseAmount,
      newMonthlyPay: selectedEmployee.monthlyPay + increaseAmount,
      note: salaryForm.note.trim(),
      effectiveDate: salaryForm.effectiveDate,
    });
    setPayIncreaseOpen(false);
    setConfirmPayIncreaseOpen(true);
  };

  const confirmSalaryIncrease = async () => {
    if (!selectedEmployeeId || !pendingSalaryIncrease) return;

    setBusy(true);
    try {
      const result = await api.increaseHrPay(selectedEmployeeId, {
        increaseAmount: pendingSalaryIncrease.increaseAmount,
        note: pendingSalaryIncrease.note,
        effectiveDate: pendingSalaryIncrease.effectiveDate,
      });
      toast.success(result.message || "Pay increased");
      setSalaryForm({ increaseAmount: "", note: "", effectiveDate: todayInputValue() });
      setPendingSalaryIncrease(null);
      setConfirmPayIncreaseOpen(false);
      await loadEmployees();
      const refreshed = await api.getHrEmployee(selectedEmployeeId);
      setSelectedEmployee(refreshed.employee);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to increase pay");
    } finally {
      setBusy(false);
    }
  };

  const confirmCreateEmployee = async () => {
    if (!pendingEmployee) return;

    setBusy(true);
    try {
      const result = await api.createHrEmployee(pendingEmployee);
      toast.success(result.message || "Employee added");
      setEmployeeForm({ name: "", monthlyPay: "", joiningDate: todayInputValue() });
      setPendingEmployee(null);
      setConfirmAddOpen(false);
      await loadEmployees();
      setSelectedEmployeeId(result.employee.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add employee");
    } finally {
      setBusy(false);
    }
  };

  const handleAddTransaction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedEmployeeId) return;
    setTransactionOpen(false);
    setBusy(true);
    try {
      const result = await api.addHrTransaction(selectedEmployeeId, {
        type: transactionForm.type,
        amount: Number(transactionForm.amount || 0),
        note: transactionForm.note.trim(),
        transactionDate: transactionForm.transactionDate,
      });
      toast.success(result.message || "Transaction added");
      setTransactionForm({ type: "advance", amount: "", note: "", transactionDate: todayInputValue() });
      await loadEmployees();
      const refreshed = await api.getHrEmployee(selectedEmployeeId);
      setSelectedEmployee(refreshed.employee);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add transaction");
    } finally {
      setBusy(false);
    }
  };

  const openTransactionDialog = (type: TransactionType) => {
    setTransactionForm((prev) => ({ ...prev, type }));
    setTransactionOpen(true);
  };

  const openEditTransactionDialog = (transaction: HrEmployeeDetail["transactions"][number]) => {
    if (!transaction._id) {
      toast.error("Transaction id missing");
      return;
    }

    if (transaction.settledAt) {
      toast.error("Settled transaction cannot be edited");
      return;
    }

    setEditingTransactionId(transaction._id);
    setEditTransactionForm({
      type: transaction.type,
      amount: String(transaction.amount || ""),
      note: transaction.note || "",
      transactionDate: transaction.transactionDate,
    });
    setEditTransactionOpen(true);
  };

  const handleUpdateTransaction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedEmployeeId || !editingTransactionId) return;

    setBusy(true);
    try {
      const result = await api.updateHrTransaction(selectedEmployeeId, editingTransactionId, {
        type: editTransactionForm.type,
        amount: Number(editTransactionForm.amount || 0),
        note: editTransactionForm.note.trim(),
        transactionDate: editTransactionForm.transactionDate || todayInputValue(),
      });
      toast.success(result.message || "Transaction updated");
      setEditTransactionOpen(false);
      setEditingTransactionId(null);
      await loadEmployees();
      const refreshed = await api.getHrEmployee(selectedEmployeeId);
      setSelectedEmployee(refreshed.employee);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update transaction");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTransaction = async (transaction: HrEmployeeDetail["transactions"][number]) => {
    if (!selectedEmployeeId || !transaction._id) {
      toast.error("Transaction id missing");
      return;
    }

    if (transaction.settledAt) {
      toast.error("Settled transaction cannot be deleted");
      return;
    }

    setPendingDeleteTransaction(transaction);
    setDeleteTransactionOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!selectedEmployeeId || !pendingDeleteTransaction?._id) {
      return;
    }

    setBusy(true);
    try {
      const result = await api.deleteHrTransaction(selectedEmployeeId, pendingDeleteTransaction._id);
      toast.success(result.message || "Transaction deleted");
      setDeleteTransactionOpen(false);
      setPendingDeleteTransaction(null);
      await loadEmployees();
      const refreshed = await api.getHrEmployee(selectedEmployeeId);
      setSelectedEmployee(refreshed.employee);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete transaction");
    } finally {
      setBusy(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedEmployeeId) return;
    setBusy(true);
    try {
      const data = await api.previewHrSettlement(selectedEmployeeId, { settlementDate });
      setPreview(data);
      toast.success("Settlement preview prepared");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to prepare settlement preview");
    } finally {
      setBusy(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedEmployeeId) return;
    if (!preview) {
      toast.error("Preview the settlement first");
      return;
    }

    const netBalance = Number(preview.snapshot.netPay || 0);
    if (Math.abs(netBalance) > 0.000001) {
      const dueMessage = netBalance > 0
        ? `Settlement blocked: owner has to pay ${formatMoney(Math.abs(netBalance))} first.`
        : `Settlement blocked: employee has to clear ${formatMoney(Math.abs(netBalance))} first.`;
      toast.error(dueMessage);
      return;
    }

    setBusy(true);
    try {
      const result = await api.executeHrSettlement(selectedEmployeeId, { settlementDate });
      toast.success(result.message || "Settlement executed");
      setPreview(null);
      await loadEmployees();
      const refreshed = await api.getHrEmployee(selectedEmployeeId);
      setSelectedEmployee(refreshed.employee);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to execute settlement");
    } finally {
      setBusy(false);
    }
  };

  const handleMarkLeft = async () => {
    if (!selectedEmployeeId || !selectedEmployee) return;

    setBusy(true);
    try {
      const result = await api.markHrEmployeeLeft(selectedEmployeeId, { leftDate });
      toast.success(result.message || "Employee marked as left");
      setConfirmLeftOpen(false);
      setPreview(null);
      await loadEmployees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to mark employee as left");
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadEmployeeReport = async () => {
    if (!selectedEmployee) {
      toast.error("Select an employee first");
      return;
    }

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const pendingAdvances = selectedEmployee.transactions
      .filter((item) => item.type === "advance" && !item.settledAt)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pendingPaybacks = selectedEmployee.transactions
      .filter((item) => item.type === "payback" && !item.settledAt)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netBalance = Number(selectedEmployee.netBalance ?? selectedEmployee.currentDue ?? 0);

    const generatedAt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    doc.setFontSize(18);
    doc.text("Employee HR Report", 40, 44);
    doc.setFontSize(11);
    doc.text(`Generated: ${generatedAt}`, 40, 62);

    autoTable(doc, {
      startY: 78,
      theme: "grid",
      head: [["Field", "Value"]],
      body: [
        ["Name", selectedEmployee.name],
        ["Joining Date", selectedEmployee.joiningDate],
        ["Monthly Pay", formatMoney(selectedEmployee.monthlyPay)],
        ["Last Settlement", selectedEmployee.lastSettlementDate || "none"],
        ["Pending Advances", formatMoney(pendingAdvances)],
        ["Pending Paybacks", formatMoney(pendingPaybacks)],
        ["Current Net", describeNetBalance(netBalance).label],
        ["Settlement Count", String(selectedEmployee.settlements.length)],
      ],
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [31, 41, 55] },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ? (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable!.finalY + 16 : 220,
      theme: "striped",
      head: [["Transactions", "Date", "Amount", "Note", "Settled"]],
      body: selectedEmployee.transactions.length
        ? selectedEmployee.transactions.map((tx) => [
          tx.type.toUpperCase(),
          tx.transactionDate,
          formatMoney(tx.amount),
          tx.note || "-",
          tx.settledAt ? "Yes" : "No",
        ])
        : [["-", "-", "-", "No transactions", "-"]],
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [55, 65, 81] },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ? (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable!.finalY + 16 : 360,
      theme: "striped",
      head: [["Settlement Date", "Days", "Base Pay", "Net Pay", "Transactions"]],
      body: selectedEmployee.settlements.length
        ? selectedEmployee.settlements.slice().reverse().map((item) => [
          item.settlementDate,
          String(item.daysWorked),
          formatMoney(item.basePay),
          formatMoney(item.netPay),
          String(item.transactionCount),
        ])
        : [["-", "-", "-", "No settlements", "-"]],
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [55, 65, 81] },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ? (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable!.finalY + 16 : 500,
      theme: "striped",
      head: [["Effective Date", "Previous Pay", "Increase", "New Pay", "Note"]],
      body: selectedEmployee.salaryAdjustments?.length
        ? selectedEmployee.salaryAdjustments.slice().reverse().map((item) => [
          item.effectiveDate,
          formatMoney(item.previousPay),
          formatMoney(item.increaseAmount),
          formatMoney(item.newMonthlyPay),
          item.note || "-",
        ])
        : [["-", "-", "-", "No pay adjustments", "-"]],
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [55, 65, 81] },
    });

    const safeName = selectedEmployee.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
    doc.save(`employee-report-${safeName || "employee"}-${todayInputValue()}.pdf`);
    toast.success("Employee report downloaded");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">HR Module</h1>
            <p className="text-sm text-muted-foreground">Manage employees, advances, paybacks, and settlement calculations.</p>
          </div>
          <div className="flex gap-2 flex-wrap text-sm">
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-2">
              <div className="text-xs text-muted-foreground">Employees</div>
              <div className="font-semibold text-foreground">{overviewTotals.totalEmployees}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-2">
              <div className="text-xs text-muted-foreground">Left Employees</div>
              <div className="font-semibold text-foreground">{leftEmployees.length}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-2">
              <div className="text-xs text-muted-foreground">Monthly Pay</div>
              <div className="font-semibold text-foreground">{formatMoney(overviewTotals.totalMonthlyPay)}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-2">
              <div className="text-xs text-muted-foreground">Current Due</div>
              <div className="font-semibold text-primary">{formatMoney(overviewTotals.totalCurrentDue)}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-6">
            <div className="glass-card p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <UserRound className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Add Employee</h2>
              </div>
              <Button type="button" disabled={busy} className="w-full sm:w-auto" onClick={() => setAddEmployeeOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Employee
              </Button>

              <AlertDialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Add Employee Details</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter the employee information, then you will confirm it in the next popup.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <form className="grid gap-4" onSubmit={handleCreateEmployee}>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Name</Label>
                      <Input value={employeeForm.name} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Employee name" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Monthly Pay</Label>
                      <Input type="number" value={employeeForm.monthlyPay} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, monthlyPay: e.target.value }))} placeholder="e.g. 50000" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Joining Date</Label>
                      <Input type="date" value={employeeForm.joiningDate} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, joiningDate: e.target.value }))} required />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel type="button" disabled={busy}>Cancel</AlertDialogCancel>
                      <AlertDialogAction type="submit" disabled={busy}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog open={confirmAddOpen} onOpenChange={setConfirmAddOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm New Employee</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please review the employee details before confirming.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {pendingEmployee && (
                    <div className="space-y-2 rounded-lg border border-border/60 bg-secondary/20 p-3 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{pendingEmployee.name}</span></p>
                      <p><span className="text-muted-foreground">Monthly Pay:</span> <span className="font-medium text-foreground">{formatMoney(pendingEmployee.monthlyPay)}</span></p>
                      <p><span className="text-muted-foreground">Joining Date:</span> <span className="font-medium text-foreground">{pendingEmployee.joiningDate}</span></p>
                    </div>
                  )}

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmCreateEmployee} disabled={busy}>
                      {busy ? "Adding..." : "Confirm and Add"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="glass-card overflow-hidden animate-slide-up">
              <div className="px-5 py-4 border-b border-border/50 space-y-3">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">All Employees</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, pay, or joining date"
                    className="h-10"
                  />
                  <select
                    value={selectedEmployeeId ?? ""}
                    onChange={(e) => setSelectedEmployeeId(e.target.value || null)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="">Select employee</option>
                    {filteredEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} · {formatMoney(employee.currentDue)} due
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="divide-y divide-border/40">
                {loading ? (
                  <div className="p-5 text-sm text-muted-foreground">Loading employees...</div>
                ) : employees.length === 0 ? (
                  <div className="p-5 text-sm text-muted-foreground">No employees added yet.</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="p-5 text-sm text-muted-foreground">No employees match your search.</div>
                ) : filteredEmployees.map((employee) => {
                  const isSelected = employee.id === selectedEmployeeId;
                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => setSelectedEmployeeId(employee.id)}
                      className={`w-full text-left p-5 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-secondary/40"}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-foreground">{employee.name}</h3>
                            <Badge variant="secondary">{employee.pendingTransactions} pending</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Joined {employee.joiningDate} · Last settlement {employee.lastSettlementDate || "not settled yet"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm">
                          <div className="rounded-lg bg-secondary/30 px-3 py-2">
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Monthly Pay</div>
                            <div className="font-semibold text-foreground">{formatMoney(employee.monthlyPay)}</div>
                          </div>
                          <div className="rounded-lg bg-secondary/30 px-3 py-2">
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Current Due</div>
                            <div className="font-semibold text-primary">{formatMoney(employee.currentDue)}</div>
                          </div>
                          <div className="rounded-lg bg-secondary/30 px-3 py-2 col-span-2 sm:col-span-1">
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Settlements</div>
                            <div className="font-semibold text-foreground">{employee.settlementCount}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="glass-card p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Employee Details</h2>
              </div>

              {!selectedEmployee ? (
                <p className="text-sm text-muted-foreground">Select an employee to manage transactions and settlement.</p>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{selectedEmployee.name}</h3>
                        <p className="text-sm text-muted-foreground">Joining date {selectedEmployee.joiningDate} · Monthly pay {formatMoney(selectedEmployee.monthlyPay)}</p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary/30">{selectedEmployee.transactions.length} transactions</Badge>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Last Settlement</div>
                        <div className="font-semibold text-foreground">{selectedEmployee.lastSettlementDate || "none"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Advances</div>
                        <div className="font-semibold text-destructive">{formatMoney(selectedEmployee.transactions.filter((item) => item.type === "advance" && !item.settledAt).reduce((sum, item) => sum + item.amount, 0))}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Paybacks</div>
                        <div className="font-semibold text-primary">{formatMoney(selectedEmployee.transactions.filter((item) => item.type === "payback" && !item.settledAt).reduce((sum, item) => sum + item.amount, 0))}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Net Balance</div>
                        {(() => {
                          const netBalance = selectedEmployee.netBalance ?? selectedEmployee.currentDue;
                          const balanceText = describeNetBalance(netBalance);
                          return <div className={`font-semibold ${balanceText.tone}`}>{balanceText.label}</div>;
                        })()}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Settlement Count</div>
                        <div className="font-semibold text-foreground">{selectedEmployee.settlements.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-secondary/10 p-3 sm:p-4 space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pay Actions</div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <Button type="button" variant="outline" onClick={() => setPayIncreaseOpen(true)} disabled={busy} className="h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm">
                        <Sparkles className="h-4 w-4 shrink-0" /> <span>Increase Pay</span>
                      </Button>
                      <Button type="button" onClick={() => openTransactionDialog("advance")} disabled={busy} className="h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm">
                        <HandCoins className="h-4 w-4 shrink-0" /> <span>Add Advance</span>
                      </Button>
                      <Button type="button" onClick={() => openTransactionDialog("payback")} disabled={busy} className="h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm">
                        <HandCoins className="h-4 w-4 shrink-0" /> <span>Add Payback</span>
                      </Button>
                    </div>
                  </div>

                  <AlertDialog open={payIncreaseOpen} onOpenChange={setPayIncreaseOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Increase Employee Pay</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter the salary increase details, then confirm in the next popup.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <form className="grid gap-4" onSubmit={handleSalaryIncrease}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Increase Amount</Label>
                          <Input type="number" value={salaryForm.increaseAmount} onChange={(e) => setSalaryForm((prev) => ({ ...prev, increaseAmount: e.target.value }))} placeholder="e.g. 5000" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Effective Date</Label>
                          <Input type="date" value={salaryForm.effectiveDate} onChange={(e) => setSalaryForm((prev) => ({ ...prev, effectiveDate: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Note</Label>
                          <Textarea value={salaryForm.note} onChange={(e) => setSalaryForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Optional reason for increase" />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel type="button" disabled={busy}>Cancel</AlertDialogCancel>
                          <AlertDialogAction type="submit" disabled={busy}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog open={confirmPayIncreaseOpen} onOpenChange={setConfirmPayIncreaseOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Pay Increase</AlertDialogTitle>
                        <AlertDialogDescription>
                          Review the new salary before applying it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      {pendingSalaryIncrease && (
                        <div className="space-y-2 rounded-lg border border-border/60 bg-secondary/20 p-3 text-sm">
                          <p><span className="text-muted-foreground">Previous Pay:</span> <span className="font-medium text-foreground">{formatMoney(pendingSalaryIncrease.previousPay)}</span></p>
                          <p><span className="text-muted-foreground">Increase Amount:</span> <span className="font-medium text-foreground">{formatMoney(pendingSalaryIncrease.increaseAmount)}</span></p>
                          <p><span className="text-muted-foreground">New Monthly Pay:</span> <span className="font-medium text-foreground">{formatMoney(pendingSalaryIncrease.newMonthlyPay)}</span></p>
                          <p><span className="text-muted-foreground">Effective Date:</span> <span className="font-medium text-foreground">{pendingSalaryIncrease.effectiveDate}</span></p>
                        </div>
                      )}

                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSalaryIncrease} disabled={busy}>
                          {busy ? "Applying..." : "Confirm Increase"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog open={confirmLeftOpen} onOpenChange={setConfirmLeftOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark Employee as Left</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the employee from active HR operations and keep a compact exit history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      {selectedEmployee && (
                        <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/20 p-3 text-sm">
                          <p><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{selectedEmployee.name}</span></p>
                          <p><span className="text-muted-foreground">Joining Date:</span> <span className="font-medium text-foreground">{selectedEmployee.joiningDate}</span></p>
                          <p><span className="text-muted-foreground">Monthly Pay:</span> <span className="font-medium text-foreground">{formatMoney(selectedEmployee.monthlyPay)}</span></p>
                          <p><span className="text-muted-foreground">Net Balance:</span> <span className="font-medium text-foreground">{describeNetBalance(selectedEmployee.netBalance ?? selectedEmployee.currentDue).label}</span></p>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Left Date</Label>
                            <Input type="date" value={leftDate} onChange={(e) => setLeftDate(e.target.value)} />
                          </div>
                        </div>
                      )}

                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkLeft} disabled={busy}>
                          {busy ? "Processing..." : "Confirm Leave"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog open={historyOpen} onOpenChange={setHistoryOpen}>
                    <AlertDialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Employee History</AlertDialogTitle>
                        <AlertDialogDescription>
                          View transactions, settlements, and salary changes in one place.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="space-y-4">
                        <div className="space-y-4 rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <h4 className="font-semibold text-foreground">Transaction History</h4>
                          {selectedEmployee.transactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No transactions found for this employee.</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedEmployee.transactions.map((transaction) => (
                                <div key={transaction._id || `${transaction.type}-${transaction.transactionDate}-${transaction.amount}`} className="rounded-lg bg-background/70 p-3 text-sm flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <div className="font-medium text-foreground capitalize">{transaction.type}</div>
                                    <div className="text-muted-foreground">{transaction.transactionDate} {transaction.note ? `· ${transaction.note}` : ""}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`font-semibold ${transaction.type === "advance" ? "text-destructive" : "text-primary"}`}>
                                      {transaction.type === "advance" ? "-" : "+"}{formatMoney(transaction.amount)}
                                    </div>
                                    {!transaction.settledAt && (
                                      <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={() => openEditTransactionDialog(transaction)}>
                                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                                        </Button>
                                        <Button type="button" variant="destructive" size="sm" className="h-8 px-2" disabled={busy} onClick={() => handleDeleteTransaction(transaction)}>
                                          Delete
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <h4 className="font-semibold text-foreground">Settlement History</h4>
                          {selectedEmployee.settlements.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No settlements executed yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedEmployee.settlements.slice().reverse().map((settlement) => (
                                <div key={settlement._id || `${settlement.settlementDate}-${settlement.netPay}`} className="rounded-lg bg-background/70 p-3 text-sm grid gap-2 sm:grid-cols-2">
                                  <div>
                                    <div className="font-medium text-foreground">{settlement.settlementDate}</div>
                                    <div className="text-muted-foreground">{settlement.daysWorked} days · {settlement.transactionCount} transactions</div>
                                  </div>
                                  <div className="sm:text-right font-semibold text-foreground">Net Pay: {formatMoney(settlement.netPay)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <h4 className="font-semibold text-foreground">Pay Increase History</h4>
                          {!selectedEmployee.salaryAdjustments || selectedEmployee.salaryAdjustments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No pay increases recorded yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedEmployee.salaryAdjustments.slice().reverse().map((adjustment) => (
                                <div key={adjustment._id || `${adjustment.effectiveDate}-${adjustment.newMonthlyPay}`} className="rounded-lg bg-background/70 p-3 text-sm grid gap-2 sm:grid-cols-2">
                                  <div>
                                    <div className="font-medium text-foreground">{adjustment.effectiveDate}</div>
                                    <div className="text-muted-foreground">+{formatMoney(adjustment.increaseAmount)} from {formatMoney(adjustment.previousPay)}</div>
                                  </div>
                                  <div className="sm:text-right font-semibold text-foreground">New Pay: {formatMoney(adjustment.newMonthlyPay)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog open={transactionOpen} onOpenChange={setTransactionOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{transactionForm.type === "advance" ? "Add Advance" : "Add Payback"}</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter the transaction details, then confirm in the next popup.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <form className="grid gap-4" onSubmit={handleAddTransaction}>
                        <div className="rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 text-sm">
                          <span className="text-muted-foreground">Type:</span>{" "}
                          <span className="font-medium capitalize text-foreground">{transactionForm.type}</span>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Amount</Label>
                          <Input type="number" value={transactionForm.amount} onChange={(e) => setTransactionForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="0" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Note</Label>
                          <Textarea value={transactionForm.note} onChange={(e) => setTransactionForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Optional note" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Transaction Date</Label>
                          <Input type="date" value={transactionForm.transactionDate} onChange={(e) => setTransactionForm((prev) => ({ ...prev, transactionDate: e.target.value }))} required />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel type="button" disabled={busy}>Cancel</AlertDialogCancel>
                          <AlertDialogAction type="submit" disabled={busy}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog open={editTransactionOpen} onOpenChange={setEditTransactionOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Edit Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                          Correct amount, note, type, or date for this unsettled transaction.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <form className="grid gap-4" onSubmit={handleUpdateTransaction}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Type</Label>
                          <select
                            value={editTransactionForm.type}
                            onChange={(e) => setEditTransactionForm((prev) => ({ ...prev, type: e.target.value as TransactionType }))}
                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                          >
                            <option value="advance">Advance</option>
                            <option value="payback">Payback</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Amount</Label>
                          <Input type="number" value={editTransactionForm.amount} onChange={(e) => setEditTransactionForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="0" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Note</Label>
                          <Textarea value={editTransactionForm.note} onChange={(e) => setEditTransactionForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Optional note" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Transaction Date</Label>
                          <Input type="date" value={editTransactionForm.transactionDate} onChange={(e) => setEditTransactionForm((prev) => ({ ...prev, transactionDate: e.target.value }))} />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel type="button" disabled={busy}>Cancel</AlertDialogCancel>
                          <AlertDialogAction type="submit" disabled={busy}>
                            {busy ? "Saving..." : "Save Changes"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog
                    open={deleteTransactionOpen}
                    onOpenChange={(open) => {
                      setDeleteTransactionOpen(open);
                      if (!open) {
                        setPendingDeleteTransaction(null);
                      }
                    }}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete this unsettled transaction? It will also be removed from the daily record and monthly report.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 text-sm">
                        <div className="font-medium text-foreground capitalize">{pendingDeleteTransaction?.type}</div>
                        <div className="text-muted-foreground">
                          {pendingDeleteTransaction?.transactionDate} {pendingDeleteTransaction?.note ? `· ${pendingDeleteTransaction.note}` : ""}
                        </div>
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel type="button" disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction type="button" disabled={busy} onClick={() => { void confirmDeleteTransaction(); }}>
                          {busy ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="space-y-4 rounded-xl border border-border/50 bg-secondary/20 p-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Settlement Preview and Execute</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Settlement Date</Label>
                        <Input type="date" value={settlementDate} onChange={(e) => { setSettlementDate(e.target.value); setPreview(null); }} />
                      </div>
                      <Button type="button" onClick={handlePreview} disabled={busy} variant="outline">
                        <Sparkles className="h-4 w-4 mr-2" /> Approve Preview
                      </Button>
                    </div>

                    {preview && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <ListChecks className="h-4 w-4 text-primary" /> Settlement Snapshot
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg bg-background/70 p-3">Days Worked: <span className="font-semibold">{preview.snapshot.daysWorked}</span></div>
                          <div className="rounded-lg bg-background/70 p-3">Daily Rate: <span className="font-semibold">{formatMoney(preview.snapshot.dailyRate)}</span></div>
                          <div className="rounded-lg bg-background/70 p-3">Base Pay: <span className="font-semibold">{formatMoney(preview.snapshot.basePay)}</span></div>
                          <div className="rounded-lg bg-background/70 p-3">Advances: <span className="font-semibold text-destructive">-{formatMoney(preview.snapshot.advancesTotal)}</span></div>
                          <div className="rounded-lg bg-background/70 p-3">Paybacks: <span className="font-semibold text-primary">+{formatMoney(preview.snapshot.paybacksTotal)}</span></div>
                          <div className="rounded-lg bg-background/70 p-3">Net Pay: <span className="font-semibold text-foreground">{formatMoney(preview.snapshot.netPay)}</span></div>
                        </div>
                        {Math.abs(Number(preview.snapshot.netPay || 0)) > 0.000001 && (
                          <p className="text-xs text-destructive font-medium">
                            Settlement can be executed only when Net Pay is 0.
                          </p>
                        )}
                        <Button
                          onClick={handleExecute}
                          disabled={busy || Math.abs(Number(preview.snapshot.netPay || 0)) > 0.000001}
                          className="w-full sm:w-auto"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" /> Execute Settlement
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/50 bg-secondary/10 p-3 sm:p-4 space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Post-Settlement Actions</div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <Button type="button" variant="outline" onClick={() => setHistoryOpen(true)} disabled={busy} className="h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm">
                        <ListChecks className="h-4 w-4 shrink-0" /> <span>History</span>
                      </Button>
                      <Button type="button" variant="outline" onClick={handleDownloadEmployeeReport} disabled={busy} className="h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm">
                        <Download className="h-4 w-4 shrink-0" /> <span>Download PDF</span>
                      </Button>
                      <Button type="button" variant="destructive" onClick={() => setConfirmLeftOpen(true)} disabled={busy} className="h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm">
                        <UserX className="h-4 w-4 shrink-0" /> <span>Mark Left</span>
                      </Button>
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="glass-card p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <UserX className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Left Employees (Compact History)</h2>
              </div>
              {leftEmployees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No employees marked as left yet.</p>
              ) : (
                <div className="space-y-3">
                  {leftEmployees.map((employee) => (
                    <div key={employee.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3 text-sm grid gap-2 sm:grid-cols-2">
                      <div>
                        <div className="font-medium text-foreground">{employee.name}</div>
                        <div className="text-muted-foreground">Joined {employee.joiningDate} · Left {employee.leftDate || "-"}</div>
                      </div>
                      <div className="sm:text-right space-y-1 font-semibold text-foreground">
                        <div>Pay at Leaving: {formatMoney(employee.payAtLeaving)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}