export const reservationSteps = ['选择参观时间', '填写预约信息', '确认预约', '预约完成']

export const reservationDemo = {
  morning: { id: 'morning', title: '上午', label: '09:00—12:00', capacity: 100, booked: 42 },
  afternoon: { id: 'afternoon', title: '下午', label: '13:00—16:30', capacity: 100, booked: 24 },
  notice: '当前阶段仅展示预约界面与流程，不会提交或保存任何个人数据。',
}

export const getRemaining = ({ capacity, booked }) => Math.max(0, capacity - booked)

export function validateReservation({ name, phone, idCard, count, remaining, agreed }) {
  const errors = {}
  if (!name?.trim()) errors.name = '请填写预约人姓名'
  if (!/^1\d{10}$/.test(phone || '')) errors.phone = '请输入正确的手机号'
  if (!/^\d{17}[\dXx]$/.test(idCard || '')) errors.idCard = '请输入18位身份证号（演示）'
  if (!Number.isInteger(Number(count)) || Number(count) < 1) errors.count = '预约人数至少为1人'
  else if (Number(count) > remaining) errors.count = '预约人数不能超过当前剩余名额'
  if (!agreed) errors.agreed = '请先阅读并确认预约须知'
  return errors
}
