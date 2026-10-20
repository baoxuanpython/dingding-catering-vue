export interface TurnoverReportVO {
  dateList: string
  turnoverList: string
}

export interface OrderReportVO {
  dateList: string
  orderCountList: string
  validOrderCountList: string
  totalOrderCount: number
  validOrderCount: number
  orderCompletionRate: number
}

export interface UserReportVO {
  dateList: string
  totalUserList: string
  newUserList: string
}

export interface SalesTop10ReportVO {
  nameList: string
  numberList: string
}

export type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom'
