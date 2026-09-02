export const reservationStatusLabels = Object.freeze({
  0: '待确认',
  1: '预约成功',
  2: '已取消',
  3: '已核销',
  4: '已过期',
  pending: '待确认',
  success: '预约成功',
  cancelled: '已取消',
  checked_in: '已核销',
  expired: '已过期',
})

export function canSelectSchedule(schedule) {
  return Boolean(schedule?.available) && Number(schedule.remaining) > 0
}

export function getReservationStatusLabel(status) {
  return reservationStatusLabels[status] || '状态待确认'
}

export function canCancelReservation(status) {
  return [0, 1, 'pending', 'success'].includes(status)
}

export function getReservationErrorMessage(error) {
  const message = error?.message || ''
  if (!message || ['service unavailable', 'internal server error'].includes(message) || /network/i.test(message)) {
    return '预约服务暂时不可用，请稍后重试。'
  }
  const messages = {
    'reservation not found': '未找到匹配的预约记录，请核对预约编号和手机号。',
    'reservation already cancelled': '该预约已取消，无需重复操作。',
    'reservation cannot be cancelled': '当前预约状态不支持取消。',
    'visit schedule not found': '未找到可预约时段，请重新选择。',
  }
  if (messages[message]) return messages[message]
  return message
}

export function buildReservationResult(result, schedule) {
  return {
    reservationNo: result.reservationNo,
    visitDate: result.visitDate,
    period: result.period || schedule.period,
    periodLabel: result.periodLabel || result.label || schedule.periodLabel || schedule.label || schedule.period,
    peopleCount: result.peopleCount,
    status: result.status,
  }
}

export function createSubmissionLock() {
  let isSubmitting = false
  return {
    get isSubmitting() {
      return isSubmitting
    },
    tryEnter() {
      if (isSubmitting) return false
      isSubmitting = true
      return true
    },
    leave() {
      isSubmitting = false
    },
  }
}

export function makeReservationPayload(form, schedule) {
  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    idCard: form.idCard.trim(),
    scheduleId: schedule.id,
    peopleCount: Number(form.peopleCount),
  }
}

export function validateLiveReservation({ name, phone, idCard, peopleCount }) {
  const errors = {}
  if (!name?.trim()) errors.name = '请填写预约人姓名'
  if (!/^1[3-9]\d{9}$/.test(phone || '')) errors.phone = '请输入正确的11位手机号'
  if (!/^\d{17}[\dXx]$/.test(idCard || '')) errors.idCard = '请输入18位身份证号（演示）'
  if (!Number.isInteger(Number(peopleCount)) || Number(peopleCount) < 1 || Number(peopleCount) > 5) {
    errors.peopleCount = '预约人数应为1至5人'
  }
  return errors
}
