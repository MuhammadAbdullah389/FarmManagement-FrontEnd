import { getApiBaseUrl, request } from "@/lib/apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  details?: Record<string, unknown> | null;
}

export interface LineItem {
  description: string;
  amount: number;
  readonly?: boolean;
  source?: string;
  sourceRefType?: string | null;
  sourceRefId?: string | null;
}

export interface DailyRecordRaw {
  date: string;
  morningMilkQuantity: number;
  eveningMilkQuantity: number;
  milkPrice: number;
  expenses: LineItem[];
  revenues: LineItem[];
  totalRevenue: number;
  totalExpenditure: number;
  Balance: number;
}

export interface RecordPayload {
  recordDate?: string;
  morningMilk: number;
  eveningMilk: number;
  expenses: LineItem[];
  revenues: LineItem[];
}

export interface RecordSummary {
  date: string;
  milkMorning: number;
  milkEvening: number;
  totalExpenses: number;
  totalRevenue: number;
  balance: number;
}

export interface RecordDetail extends RecordPayload {
  date: string;
  milkRate: number;
}

export interface MonthlyReportRow {
  date: string;
  totalMilk: number;
  revByMilk: number;
  otherRev: number;
  totalRev: number;
  totalExp: number;
  balance: number;
}

export interface MonthlyReportSummary {
  openingBalance: number;
  netBalance: number;
  closingBalance: number;
}

export interface MonthlyReportResponse {
  records: DailyRecordRaw[];
  rows: MonthlyReportRow[];
  totals: {
    totalMilk: number;
    totalRevMilk: number;
    totalOtherRev: number;
    totalRev: number;
    totalExp: number;
  };
  summary: MonthlyReportSummary;
}

export interface DownloadedPdf {
  blob: Blob;
  filename: string;
}

export interface HrTransaction {
  _id?: string;
  type: "advance" | "payback";
  amount: number;
  note: string;
  transactionDate: string;
  settledAt?: string | null;
}

export interface HrSettlement {
  _id?: string;
  settlementDate: string;
  daysWorked: number;
  dailyRate: number;
  basePay: number;
  advancesTotal: number;
  paybacksTotal: number;
  netPay: number;
  transactionCount: number;
  approvedAt?: string | null;
  executedAt?: string | null;
}

export interface HrSalaryAdjustment {
  _id?: string;
  previousPay: number;
  increaseAmount: number;
  newMonthlyPay: number;
  effectiveDate: string;
  note: string;
}

export interface HrEmployeeSummary {
  id: string;
  name: string;
  monthlyPay: number;
  joiningDate: string;
  lastSettlementDate: string | null;
  currentDue: number;
  netBalance: number;
  advancesTotal: number;
  paybacksTotal: number;
  pendingTransactions: number;
  settlementCount: number;
  employmentStatus: "active" | "left";
  leftDate?: string | null;
  payAtLeaving?: number | null;
  netBalanceAtLeaving?: number | null;
}

export interface HrLeftEmployee {
  id: string;
  name: string;
  joiningDate: string;
  leftDate: string | null;
  payAtLeaving: number;
  netBalanceAtLeaving: number;
}

export interface HrEmployeeDetail {
  id: string;
  name: string;
  monthlyPay: number;
  joiningDate: string;
  lastSettlementDate: string | null;
  currentDue: number;
  netBalance: number;
  employmentStatus: "active" | "left";
  leftDate?: string | null;
  payAtLeaving?: number | null;
  netBalanceAtLeaving?: number | null;
  transactions: HrTransaction[];
  settlements: HrSettlement[];
  salaryAdjustments: HrSalaryAdjustment[];
}

export interface HrSettlementPreview {
  employee: {
    id: string;
    name: string;
    monthlyPay: number;
    joiningDate: string;
    lastSettlementDate: string | null;
  };
  snapshot: {
    settlementDate: string;
    lastSettlementDate: string;
    daysWorked: number;
    dailyRate: number;
    basePay: number;
    advancesTotal: number;
    paybacksTotal: number;
    netPay: number;
    eligibleTransactions: HrTransaction[];
  };
  transactions: HrTransaction[];
}

export interface HrOverviewResponse {
  employees: HrEmployeeSummary[];
  leftEmployees: HrLeftEmployee[];
  totals: {
    totalEmployees: number;
    totalMonthlyPay: number;
    totalCurrentDue: number;
    totalAdvances: number;
    totalPaybacks: number;
  };
}

export interface SuperadminFarm {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function toMoneyMap(items: LineItem[]) {
  return items.reduce<Record<string, LineItem>>((acc, item, idx) => {
    acc[`item_${idx + 1}`] = {
      description: item.description,
      amount: Number(item.amount || 0),
    };
    return acc;
  }, {});
}

function toRecordSummary(entry: DailyRecordRaw): RecordSummary {
  return {
    date: entry.date,
    milkMorning: Number(entry.morningMilkQuantity || 0),
    milkEvening: Number(entry.eveningMilkQuantity || 0),
    totalExpenses: Number(entry.totalExpenditure || 0),
    totalRevenue: Number(entry.totalRevenue || 0),
    balance: Number(entry.Balance || 0),
  };
}

function toRecordDetail(entry: DailyRecordRaw): RecordDetail {
  return {
    date: entry.date,
    milkRate: Number(entry.milkPrice || 0),
    recordDate: entry.date,
    morningMilk: Number(entry.morningMilkQuantity || 0),
    eveningMilk: Number(entry.eveningMilkQuantity || 0),
    expenses: Array.isArray(entry.expenses) ? entry.expenses : [],
    revenues: Array.isArray(entry.revenues) ? entry.revenues : [],
  };
}

function toReportRows(records: DailyRecordRaw[]): MonthlyReportRow[] {
  return records.map((entry) => {
    const morning = Number(entry.morningMilkQuantity || 0);
    const evening = Number(entry.eveningMilkQuantity || 0);
    const totalMilk = morning + evening;
    const revByMilk = totalMilk * Number(entry.milkPrice || 0);
    const totalRev = Number(entry.totalRevenue || 0);
    const otherRev = totalRev - revByMilk;
    const totalExp = Number(entry.totalExpenditure || 0);

    return {
      date: entry.date,
      totalMilk,
      revByMilk,
      otherRev,
      totalRev,
      totalExp,
      balance: Number(entry.Balance || totalRev - totalExp),
    };
  });
}

const MONTH_INDEX: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function parseMonthYear(input: string): { month: number; year: number } | null {
  const normalized = input.trim().toLowerCase();

  const byLabel = normalized.match(/^([a-z]+)\s+(\d{4})$/);
  if (byLabel) {
    const month = MONTH_INDEX[byLabel[1]];
    const year = Number(byLabel[2]);
    if (month && year >= 1900) {
      return { month, year };
    }
  }

  const byNumbers = normalized.match(/^(\d{1,2})[\s\/-](\d{4})$/);
  if (byNumbers) {
    const month = Number(byNumbers[1]);
    const year = Number(byNumbers[2]);
    if (month >= 1 && month <= 12 && year >= 1900) {
      return { month, year };
    }
  }

  const byIso = normalized.match(/^(\d{4})-(\d{1,2})$/);
  if (byIso) {
    const year = Number(byIso[1]);
    const month = Number(byIso[2]);
    if (month >= 1 && month <= 12 && year >= 1900) {
      return { month, year };
    }
  }

  return null;
}

async function requestEnvelope<T>(
  path: string,
  options?: RequestInit,
  query?: Record<string, string | number | undefined>,
): Promise<ApiEnvelope<T>> {
  const envelope = await request<ApiEnvelope<T>>(path, options, query);
  if (!envelope.success) {
    throw new Error(envelope.message || "Request failed");
  }
  return envelope;
}

export const api = {
  login(payload: LoginPayload) {
    return requestEnvelope<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => ({ user: res.data.user, message: res.message }));
  },

  getCurrentUser() {
    return requestEnvelope<{ user: AuthUser }>("/api/auth/me").then((res) => res.data.user);
  },

  logout() {
    return requestEnvelope<null>("/api/auth/logout", {
      method: "POST",
    }).then((res) => ({ message: res.message }));
  },

  createRecord(payload: RecordPayload) {
    return requestEnvelope<{ date: string; submission: DailyRecordRaw }>("/api/records", {
      method: "POST",
      body: JSON.stringify({
        recordDate: payload.recordDate,
        morningMilk: Number(payload.morningMilk || 0),
        eveningMilk: Number(payload.eveningMilk || 0),
        expenses: toMoneyMap(payload.expenses),
        revenues: toMoneyMap(payload.revenues),
      }),
    }).then((res) => ({ message: res.message, date: res.data.date }));
  },

  getRecords(month: number, year: number) {
    return requestEnvelope<{ entries: DailyRecordRaw[] }>("/api/records", {}, { month, year })
      .then((res) => (res.data.entries || []).map(toRecordSummary));
  },

  getRecord(date: string) {
    return requestEnvelope<{ entry: DailyRecordRaw }>(`/api/records/${encodeURIComponent(date)}`)
      .then((res) => toRecordDetail(res.data.entry));
  },

  updateRecord(encodedDate: string, payload: RecordPayload) {
    return requestEnvelope<{ date: string; updatedEntry: DailyRecordRaw }>(`/api/records/${encodeURIComponent(encodedDate)}`, {
      method: "PUT",
      body: JSON.stringify({
        morningMilk: Number(payload.morningMilk || 0),
        eveningMilk: Number(payload.eveningMilk || 0),
        expenses: toMoneyMap(payload.expenses),
        revenues: toMoneyMap(payload.revenues),
      }),
    }).then((res) => ({ message: res.message, date: res.data.date }));
  },

  checkNewDate(dateInput: string) {
    return requestEnvelope<{
      minDate: string;
      maxDate: string;
      selectedDateInput: string;
      selectedDate: string;
    }>("/api/records/check-new-date", {
      method: "POST",
      body: JSON.stringify({ date: dateInput }),
    }).then((res) => res.data);
  },

  resolveDate(dateInput: string) {
    return requestEnvelope<{
      requestedDate: string;
      formattedDate: string;
      encodedDate: string;
    }>("/api/records/resolve-date", {
      method: "POST",
      body: JSON.stringify({ date: dateInput }),
    }).then((res) => res.data);
  },

  getReportMonths() {
    return requestEnvelope<{ months: string[] }>("/api/reports/months").then((res) => res.data.months || []);
  },

  getMonthlyReport(monthLabelOrCode: string) {
    return requestEnvelope<{
      records: DailyRecordRaw[];
      monthlyRep: Record<string, unknown> | null;
    }>(`/api/reports/${encodeURIComponent(monthLabelOrCode)}`).then((res) => {
      const records = res.data.records || [];
      const rows = toReportRows(res.data.records || []);
      const totals = rows.reduce(
        (acc, row) => ({
          totalMilk: acc.totalMilk + row.totalMilk,
          totalRevMilk: acc.totalRevMilk + row.revByMilk,
          totalOtherRev: acc.totalOtherRev + row.otherRev,
          totalRev: acc.totalRev + row.totalRev,
          totalExp: acc.totalExp + row.totalExp,
        }),
        { totalMilk: 0, totalRevMilk: 0, totalOtherRev: 0, totalRev: 0, totalExp: 0 },
      );

      const monthlyRep = res.data.monthlyRep || {};
      const openingBalance = Number((monthlyRep as { openingBalance?: number }).openingBalance || 0);
      const netBalance = Number((monthlyRep as { netBalance?: number }).netBalance || (totals.totalRev - totals.totalExp));
      const closingBalance = Number((monthlyRep as { closingBalance?: number }).closingBalance || (openingBalance + netBalance));

      return {
        records,
        rows,
        totals,
        summary: {
          openingBalance,
          netBalance,
          closingBalance,
        },
      } as MonthlyReportResponse;
    });
  },

  getMonthlyReportPdfUrl(monthLabelOrCode: string) {
    const base = getApiBaseUrl();
    const parsed = parseMonthYear(monthLabelOrCode);
    if (parsed) {
      return `${base}/api/reports/${parsed.month}/${parsed.year}/pdf`;
    }
    return `${base}/api/reports/${encodeURIComponent(monthLabelOrCode)}/pdf`;
  },

  async downloadMonthlyReportPdf(monthLabelOrCode: string): Promise<DownloadedPdf> {
    const token = localStorage.getItem("auth_token");
    const base = getApiBaseUrl();
    const parsed = parseMonthYear(monthLabelOrCode);
    const urls = parsed
      ? [
        `${base}/api/reports/${parsed.month}/${parsed.year}/pdf`,
        `${base}/api/reports/${encodeURIComponent(monthLabelOrCode)}/pdf`,
      ]
      : [`${base}/api/reports/${encodeURIComponent(monthLabelOrCode)}/pdf`];

    let response: Response | null = null;
    for (const url of urls) {
      const candidate = await fetch(url, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (candidate.ok) {
        response = candidate;
        break;
      }

      if (candidate.status !== 404) {
        const message = await candidate.text();
        throw new Error(message || `Failed to download PDF (status ${candidate.status})`);
      }
    }

    if (!response) {
      throw new Error("Monthly report PDF was not found for this month.");
    }

    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const filenameMatch = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const encodedFilename = filenameMatch?.[1];
    const plainFilename = filenameMatch?.[2];

    return {
      blob,
      filename: decodeURIComponent(encodedFilename || plainFilename || `monthly-report-${monthLabelOrCode}.pdf`),
    };
  },

  getHrOverview() {
    return requestEnvelope<HrOverviewResponse>("/api/hr/overview").then((res) => res.data);
  },

  createHrEmployee(payload: { name: string; monthlyPay: number; joiningDate: string }) {
    return requestEnvelope<{ employee: HrEmployeeSummary }>("/api/hr/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, employee: res.data.employee }));
  },

  getHrEmployee(id: string) {
    return requestEnvelope<{ employee: HrEmployeeDetail; snapshot: HrSettlementPreview["snapshot"] }>(`/api/hr/employees/${encodeURIComponent(id)}`)
      .then((res) => res.data);
  },

  addHrTransaction(id: string, payload: { type: "advance" | "payback"; amount: number; note?: string; transactionDate?: string }) {
    return requestEnvelope<{ employee: HrEmployeeSummary; transaction: HrTransaction }>(`/api/hr/employees/${encodeURIComponent(id)}/transactions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, employee: res.data.employee, transaction: res.data.transaction }));
  },

  updateHrTransaction(id: string, transactionId: string, payload: { type?: "advance" | "payback"; amount: number; note?: string; transactionDate?: string }) {
    return requestEnvelope<{ employee: HrEmployeeSummary; transaction: HrTransaction }>(`/api/hr/employees/${encodeURIComponent(id)}/transactions/${encodeURIComponent(transactionId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, employee: res.data.employee, transaction: res.data.transaction }));
  },

  previewHrSettlement(id: string, payload: { settlementDate?: string }) {
    return requestEnvelope<HrSettlementPreview>(`/api/hr/employees/${encodeURIComponent(id)}/settlement-preview`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => res.data);
  },

  executeHrSettlement(id: string, payload: { settlementDate?: string }) {
    return requestEnvelope<{ employee: HrEmployeeSummary; settlement: HrSettlement }>(`/api/hr/employees/${encodeURIComponent(id)}/settle`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, employee: res.data.employee, settlement: res.data.settlement }));
  },

  increaseHrPay(id: string, payload: { increaseAmount: number; note?: string; effectiveDate?: string }) {
    return requestEnvelope<{ employee: HrEmployeeSummary; adjustment: HrSalaryAdjustment }>(`/api/hr/employees/${encodeURIComponent(id)}/increase-pay`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, employee: res.data.employee, adjustment: res.data.adjustment }));
  },

  markHrEmployeeLeft(id: string, payload: { leftDate?: string }) {
    return requestEnvelope<{ employee: HrLeftEmployee }>(`/api/hr/employees/${encodeURIComponent(id)}/mark-left`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, employee: res.data.employee }));
  },

  getSuperadminFarms() {
    return requestEnvelope<{ farms: SuperadminFarm[] }>("/api/superadmin/farms")
      .then((res) => res.data.farms || []);
  },

  createSuperadminFarm(payload: { name: string; code: string; email: string; password: string }) {
    return requestEnvelope<{ farm: SuperadminFarm }>("/api/superadmin/farms", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, farm: res.data.farm }));
  },

  updateSuperadminFarmStatus(id: string, payload: { isActive: boolean }) {
    return requestEnvelope<{ farm: SuperadminFarm }>(`/api/superadmin/farms/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then((res) => ({ message: res.message, farm: res.data.farm }));
  },

  deleteSuperadminFarm(id: string) {
    return requestEnvelope<null>(`/api/superadmin/farms/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).then((res) => ({ message: res.message }));
  },
};
