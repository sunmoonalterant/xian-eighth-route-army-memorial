export const adminStatusLabels = Object.freeze({
  PENDING: '待确认',
  SUCCESS: '已确认',
  CANCELLED: '已取消',
  CHECKED_IN: '已核销',
  EXPIRED: '已过期',
})

const statusActions = Object.freeze({
  PENDING: ['SUCCESS', 'CANCELLED'],
  SUCCESS: ['CHECKED_IN', 'CANCELLED'],
})

export function availableAdminActions(status) {
  return statusActions[status] || []
}

export function buildAdminReservationParams(filters) {
  const result = { page: filters.page, pageSize: filters.pageSize }
  for (const key of ['keyword', 'status', 'visitDate']) {
    const value = typeof filters[key] === 'string' ? filters[key].trim() : filters[key]
    if (value) result[key] = value
  }
  return result
}

export function sanitizeAdminSession({ token, admin }) {
  return {
    token,
    admin: {
      id: admin?.id,
      username: admin?.username,
      displayName: admin?.displayName || admin?.display_name || admin?.username,
    },
  }
}

export function getAdminStatusLabel(status) {
  return adminStatusLabels[status] || '状态待确认'
}
