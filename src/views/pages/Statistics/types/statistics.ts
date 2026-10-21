export interface TurnoverReportVO {
  dateList: string | null;
  hourList: string | null;
  turnoverList: string;
}

export interface OrderReportVO {
  dateList: string | null;
  hourList: string | null;
  orderCountList: string;
  validOrderCountList: string;
  totalOrderCount: number;
  validOrderCount: number;
  orderCompletionRate: number;
}

export interface UserReportVO {
  dateList: string | null;
  hourList: string | null;
  totalUserList: string;
  newUserList: string;
}

export interface SalesTop10ReportVO {
  nameList: string;
  numberList: string;
}

export type TimeRange = "today" | "yesterday" | "week" | "month" | "custom";
