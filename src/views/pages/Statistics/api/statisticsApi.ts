import request from "@/utils/request";
import type {
  TurnoverReportVO,
  OrderReportVO,
  UserReportVO,
  SalesTop10ReportVO,
} from "../types/statistics";

export function getTurnoverStatistics(begin: string, end: string) {
  return request.get<TurnoverReportVO>("/report/turnoverStatistics", {
    params: { begin, end },
  });
}

export function getOrdersStatistics(begin: string, end: string) {
  return request.get<OrderReportVO>("/report/ordersStatistics", {
    params: { begin, end },
  });
}

export function getUserStatistics(begin: string, end: string) {
  return request.get<UserReportVO>("/report/userStatistics", {
    params: { begin, end },
  });
}

export function getTop10(begin: string, end: string) {
  return request.get<SalesTop10ReportVO>("/report/top10", {
    params: { begin, end },
  });
}

export function exportReport(begin: string, end: string) {
  return request.get("/report/export", {
    params: { begin, end },
    responseType: "blob",
    showError: false,
  } as any);
}
