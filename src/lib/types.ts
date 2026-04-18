export interface WeeklyData {
  newCompanies: number;
  repeatCompanies: number;
  newOrderPeople: number;
  residentOrderPeople: number;
  repeatPeople: number;
  replaceOrderPeople: number;
  totalProspectCompanies: number;
  totalProspectPeople: number;
  newProspectCompanies: number;
  newProspectPeople: number;
  newApptDone: number;
  reApptDone: number;
  patrolCount: number;
  newApptGained: number;
  reApptGained: number;
  callDuration: number;
  callCount: number;
  contactCount: number;
  walkInCount: number;
  notes: string;
}

export interface MonthlyGoals {
  callCount: number;
  newApptGained: number;
  newApptDone: number;
  reApptDone: number;
  reApptGained: number;
  orderPeople: number;
  newProspectCompanies: number;
}

export interface MonthlyManagement {
  managedCompanies: number;
  activeWorkers: number;
  newHires: number;
  nextMonthHires: number;
  applicants: number;
  docCollecting: number;
  confirmedResignations: number;
  plannedResignations: number;
  replacements: number;
}

export interface WeeklyIssue {
  goal: string;
  result: string;
  issue: string;
  improvement: string;
  aiSuggestion?: string;
}

export interface MemberMonthData {
  goals: MonthlyGoals;
  weeks: WeeklyData[];
  monthly: MonthlyManagement;
  issues: WeeklyIssue[];
}

export const emptyWeek: WeeklyData = {
  newCompanies: 0, repeatCompanies: 0, newOrderPeople: 0,
  residentOrderPeople: 0, repeatPeople: 0, replaceOrderPeople: 0,
  totalProspectCompanies: 0, totalProspectPeople: 0,
  newProspectCompanies: 0, newProspectPeople: 0,
  newApptDone: 0, reApptDone: 0, patrolCount: 0,
  newApptGained: 0, reApptGained: 0,
  callDuration: 0, callCount: 0, contactCount: 0,
  walkInCount: 0, notes: "",
};

export const emptyGoals: MonthlyGoals = {
  callCount: 0, newApptGained: 0, newApptDone: 0,
  reApptDone: 0, reApptGained: 0, orderPeople: 0,
  newProspectCompanies: 0,
};

export const emptyMonthly: MonthlyManagement = {
  managedCompanies: 0, activeWorkers: 0, newHires: 0,
  nextMonthHires: 0, applicants: 0, docCollecting: 0,
  confirmedResignations: 0, plannedResignations: 0, replacements: 0,
};

export const emptyIssue: WeeklyIssue = {
  goal: "", result: "", issue: "", improvement: "",
};

export const emptyMemberMonth: MemberMonthData = {
  goals: { ...emptyGoals },
  weeks: Array.from({ length: 5 }, () => ({ ...emptyWeek })),
  monthly: { ...emptyMonthly },
  issues: Array.from({ length: 5 }, () => ({ ...emptyIssue })),
};

export const MEMBERS = ["岡村", "榊原", "中野", "田中", "横山", "長尾", "小川", "玉木", "塩崎"];

export function getStorageKey(name: string, month: string) {
  return `gc_data_${name}_${month}`;
}
