import { getApiBaseUrl, request } from "@/lib/apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
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
}

interface DailyRecordRaw {
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
    return `${base}/api/reports/${encodeURIComponent(monthLabelOrCode)}/pdf`;
  },
};
