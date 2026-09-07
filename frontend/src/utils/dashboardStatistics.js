const numberFormatter = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 })

export function formatMetric(value) {
  return numberFormatter.format(Number(value) || 0)
}

export function formatShortDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.slice(5) : String(date || '')
}

export function getAxisLabelInterval(pointCount) {
  return Math.max(0, Math.ceil((Number(pointCount) || 0) / 4) - 1)
}

export function hasPositiveReservationStatuses(data) {
  return Object.values(data?.statuses || {}).some((status) => Number(status?.reservations) > 0)
}

export function toRankingRows(records) {
  return Array.isArray(records) ? records : []
}

export const reservationStatusLabels = Object.freeze({
  PENDING: '待确认',
  SUCCESS: '预约成功',
  CANCELLED: '已取消',
  CHECKED_IN: '已签到',
  EXPIRED: '已过期',
})
