import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { api, type MonthlyReportResponse } from "@/lib/api";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return `${value.toLocaleString()} PKR`;
}

function sumLineItems(items: { amount: number }[]) {
  return items.reduce((total, item) => total + Number(item.amount || 0), 0);
}

function isHrSyncedItem(item: { readonly?: boolean; source?: string }) {
  return Boolean(item.readonly || item.source === "hr");
}

async function buildMonthlyPdf(monthLabel: string, report: MonthlyReportResponse) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFillColor(15, 76, 117);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Advanced FMS Monthly Report", margin, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Month: ${monthLabel}`, margin, 68);

  doc.setTextColor(22, 28, 36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Summary", margin, 122);

  const summaryItems = [
    { label: "Opening Balance", value: formatCurrency(report.summary.openingBalance) },
    { label: "Net Balance", value: formatCurrency(report.summary.netBalance) },
    { label: "Closing Balance", value: formatCurrency(report.summary.closingBalance) },
    { label: "Total Revenue", value: formatCurrency(report.totals.totalRev) },
    { label: "Total Expenses", value: formatCurrency(report.totals.totalExp) },
    { label: "Total Milk", value: `${report.totals.totalMilk.toLocaleString()} liters` },
  ];

  const cardWidth = (pageWidth - margin * 2 - 16) / 3;
  const cardHeight = 58;
  summaryItems.forEach((item, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = margin + col * (cardWidth + 8);
    const y = 132 + row * (cardHeight + 10);
    doc.setFillColor(245, 248, 251);
    doc.roundedRect(x, y, cardWidth, cardHeight, 8, 8, "F");
    doc.setTextColor(91, 101, 118);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(item.label, x + 12, y + 20);
    doc.setTextColor(22, 28, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(item.value, x + 12, y + 40);
  });

  autoTable(doc, {
    startY: 272,
    margin: { left: margin, right: margin },
    head: [["Date", "Milk (L)", "Revenue by Milk", "Other Revenue", "Total Revenue", "Total Expenses", "Net Balance"]],
    body: report.rows.map((row) => [
      row.date,
      row.totalMilk.toLocaleString(),
      formatCurrency(row.revByMilk),
      formatCurrency(row.otherRev),
      formatCurrency(row.totalRev),
      formatCurrency(row.totalExp),
      formatCurrency(row.balance),
    ]),
    foot: [[
      "TOTAL",
      report.totals.totalMilk.toLocaleString(),
      formatCurrency(report.totals.totalRevMilk),
      formatCurrency(report.totals.totalOtherRev),
      formatCurrency(report.totals.totalRev),
      formatCurrency(report.totals.totalExp),
      formatCurrency(report.summary.netBalance),
    ]],
    theme: "striped",
    headStyles: { fillColor: [15, 76, 117], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [227, 239, 247], textColor: [15, 76, 117], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [249, 251, 253] },
    bodyStyles: { textColor: [34, 39, 46] },
    showFoot: "lastPage",
  });

  const expenseEntries = report.records.flatMap((record) =>
    (record.expenses || []).map((item) => ({ date: record.date, item })),
  );
  const manualExpenseEntries = expenseEntries.filter((entry) => !isHrSyncedItem(entry.item));
  const hrExpenseEntries = expenseEntries.filter((entry) => isHrSyncedItem(entry.item));

  const revenueEntries = report.records.flatMap((record) =>
    (record.revenues || []).map((item) => ({ date: record.date, item })),
  );
  const manualRevenueEntries = revenueEntries.filter((entry) => !isHrSyncedItem(entry.item));
  const hrRevenueEntries = revenueEntries.filter((entry) => isHrSyncedItem(entry.item));

  let sectionStart = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 272) + 28;

  doc.setTextColor(22, 28, 36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Expense Details - Manual", margin, sectionStart);

  autoTable(doc, {
    startY: sectionStart + 10,
    margin: { left: margin, right: margin },
    head: [["Date", "Description", "Amount"]],
    body: manualExpenseEntries.length > 0
      ? manualExpenseEntries.map((entry) => [
        entry.date,
        entry.item.description || "-",
        formatCurrency(Number(entry.item.amount || 0)),
      ])
      : [["-", "No manual expenses recorded", "0 PKR"]],
    foot: [[
      "TOTAL",
      "",
      formatCurrency(sumLineItems(manualExpenseEntries.map((entry) => ({ amount: Number(entry.item.amount || 0) })))),
    ]],
    theme: "striped",
    headStyles: { fillColor: [180, 83, 9], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [255, 244, 230], textColor: [180, 83, 9], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [255, 250, 245] },
    bodyStyles: { textColor: [34, 39, 46] },
    showFoot: "lastPage",
  });

  sectionStart = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? sectionStart + 10) + 28;
  doc.text("Expense Details - HR Synced", margin, sectionStart);

  autoTable(doc, {
    startY: sectionStart + 10,
    margin: { left: margin, right: margin },
    head: [["Date", "Description", "Amount"]],
    body: hrExpenseEntries.length > 0
      ? hrExpenseEntries.map((entry) => [
        entry.date,
        entry.item.description || "-",
        formatCurrency(Number(entry.item.amount || 0)),
      ])
      : [["-", "No HR-synced expenses recorded", "0 PKR"]],
    foot: [[
      "TOTAL",
      "",
      formatCurrency(sumLineItems(hrExpenseEntries.map((entry) => ({ amount: Number(entry.item.amount || 0) })))),
    ]],
    theme: "striped",
    headStyles: { fillColor: [161, 98, 7], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    bodyStyles: { textColor: [34, 39, 46] },
    showFoot: "lastPage",
  });

  sectionStart = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? sectionStart + 10) + 28;
  doc.text("Revenue Details - Manual", margin, sectionStart);

  autoTable(doc, {
    startY: sectionStart + 10,
    margin: { left: margin, right: margin },
    head: [["Date", "Description", "Amount"]],
    body: manualRevenueEntries.length > 0
      ? manualRevenueEntries.map((entry) => [
        entry.date,
        entry.item.description || "-",
        formatCurrency(Number(entry.item.amount || 0)),
      ])
      : [["-", "No manual revenues recorded", "0 PKR"]],
    foot: [[
      "TOTAL",
      "",
      formatCurrency(sumLineItems(manualRevenueEntries.map((entry) => ({ amount: Number(entry.item.amount || 0) })))),
    ]],
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [236, 253, 245], textColor: [22, 163, 74], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [247, 255, 250] },
    bodyStyles: { textColor: [34, 39, 46] },
    showFoot: "lastPage",
  });

  sectionStart = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? sectionStart + 10) + 28;
  doc.text("Revenue Details - HR Synced", margin, sectionStart);

  autoTable(doc, {
    startY: sectionStart + 10,
    margin: { left: margin, right: margin },
    head: [["Date", "Description", "Amount"]],
    body: hrRevenueEntries.length > 0
      ? hrRevenueEntries.map((entry) => [
        entry.date,
        entry.item.description || "-",
        formatCurrency(Number(entry.item.amount || 0)),
      ])
      : [["-", "No HR-synced revenues recorded", "0 PKR"]],
    foot: [[
      "TOTAL",
      "",
      formatCurrency(sumLineItems(hrRevenueEntries.map((entry) => ({ amount: Number(entry.item.amount || 0) })))),
    ]],
    theme: "striped",
    headStyles: { fillColor: [5, 122, 85], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [209, 250, 229], textColor: [6, 95, 70], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [236, 253, 245] },
    bodyStyles: { textColor: [34, 39, 46] },
    showFoot: "lastPage",
  });

  const filename = `monthly-report-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`;
  doc.save(filename);
}

export default function Reports() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [report, setReport] = useState<MonthlyReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    let active = true;

    const loadMonths = async () => {
      try {
        const months = await api.getReportMonths();
        if (active) {
          setAvailableMonths(months);
        }
      } catch (err) {
        if (active) {
          toast.error(err instanceof Error ? err.message : "Unable to load report months");
        }
      }
    };

    loadMonths();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedMonth) {
      setReport(null);
      return;
    }

    let active = true;

    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await api.getMonthlyReport(selectedMonth);
        if (active) {
          setReport(data);
        }
      } catch (err) {
        if (active) {
          setReport(null);
          toast.error(err instanceof Error ? err.message : "Unable to load monthly report");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReport();
    return () => {
      active = false;
    };
  }, [selectedMonth]);

  const safeReport = useMemo<MonthlyReportResponse>(() => {
    return report ?? {
      records: [],
      rows: [],
      totals: {
        totalMilk: 0,
        totalRevMilk: 0,
        totalOtherRev: 0,
        totalRev: 0,
        totalExp: 0,
      },
      summary: {
        openingBalance: 0,
        netBalance: 0,
        closingBalance: 0,
      },
    };
  }, [report]);

  const handleDownloadPdf = async () => {
    if (!selectedMonth) return;

    setDownloadingPdf(true);
    try {
      if (loading) {
        throw new Error("Please wait for the report to finish loading.");
      }
      if (!safeReport.rows.length) {
        throw new Error("No report data available to generate a PDF.");
      }

      await buildMonthlyPdf(selectedMonth, safeReport);
      toast.success("Monthly PDF downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to download monthly report PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!selectedMonth) {
    return (
      <AppLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent">Select a Month to View Reports</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {availableMonths.map((monthLabel) => (
            <button
              key={monthLabel}
              onClick={() => setSelectedMonth(monthLabel)}
              className="glass-card p-5 text-center hover:border-accent/50 transition-all hover:bg-secondary/50"
            >
              <span className="text-sm font-medium text-foreground">View Records for {monthLabel}</span>
            </button>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(null)} className="text-muted-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Months
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Monthly Entry Report</h1>
            <p className="text-sm text-accent font-medium">Month: {selectedMonth}</p>
          </div>
          <Button onClick={handleDownloadPdf} disabled={downloadingPdf} className="sm:min-w-[180px]">
            <Download className="h-4 w-4" />
            {downloadingPdf ? "Downloading PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Monthly Records Table */}
      <div className="glass-card overflow-hidden mb-6 animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border/50">
                <th className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Milk (L)</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue by Milk</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other Revenue</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Expenses</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 px-3 text-center text-muted-foreground">Loading report...</td>
                </tr>
              ) : safeReport.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 px-3 text-center text-muted-foreground">No report data found for this month.</td>
                </tr>
              ) : safeReport.rows.map((r, i) => (
                <tr key={r.date} className={`border-b border-border/30 hover:bg-secondary/50 transition-colors ${i % 2 === 0 ? "bg-secondary/10" : ""}`}>
                  <td className="py-3 px-3 font-medium text-foreground">{r.date}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{r.totalMilk} liters</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{r.revByMilk.toLocaleString()} PKR</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{r.otherRev.toLocaleString()} PKR</td>
                  <td className="py-3 px-3 text-right text-primary">{r.totalRev.toLocaleString()} PKR</td>
                  <td className="py-3 px-3 text-right text-destructive">{r.totalExp.toLocaleString()} PKR</td>
                  <td className={`py-3 px-3 text-right font-semibold ${r.balance >= 0 ? "text-primary" : "text-destructive"}`}>{r.balance.toLocaleString()} PKR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggregated Values */}
      <div className="glass-card p-5 mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Aggregated Values for the Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Milk for the Month</span>
            <span className="font-semibold text-foreground">{safeReport.totals.totalMilk} liters</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Revenue from Milk</span>
            <span className="font-semibold text-foreground">{safeReport.totals.totalRevMilk.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Other Revenue</span>
            <span className="font-semibold text-foreground">{safeReport.totals.totalOtherRev.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-semibold text-primary">{safeReport.totals.totalRev.toLocaleString()} PKR</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-semibold text-destructive">{safeReport.totals.totalExp.toLocaleString()} PKR</span>
          </div>
        </div>
      </div>

      {/* Monthly Report Summary */}
      <div className="glass-card p-5 mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Monthly Report Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
            <p className="text-xl font-bold text-foreground">{safeReport.summary.openingBalance.toLocaleString()} PKR</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
            <p className="text-xl font-bold text-primary">{safeReport.summary.netBalance.toLocaleString()} PKR</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Closing Balance</p>
            <p className="text-xl font-bold text-accent">{safeReport.summary.closingBalance.toLocaleString()} PKR</p>
          </div>
        </div>
      </div>

    </AppLayout>
  );
}
