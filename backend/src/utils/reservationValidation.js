const { createHttpError } = require('./httpError')

const PHONE_PATTERN = /^1[3-9]\d{9}$/
const ID_CARD_PATTERN = /^\d{17}[\dXx]$/
const RESERVATION_NO_PATTERN = /^XA\d{12}$/

function validatePhone(value) {
  const phone = typeof value === 'string' ? value.trim() : ''
  if (!PHONE_PATTERN.test(phone)) throw createHttpError(400, 'phone must be a valid mainland China mobile number')
  return phone
}

function validateReservationNo(value) {
  const reservationNo = typeof value === 'string' ? value.trim() : ''
  if (!RESERVATION_NO_PATTERN.test(reservationNo)) throw createHttpError(400, 'reservationNo format is invalid')
  return reservationNo
}

function validateReservationInput(input = {}) {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!name || name.length > 50) throw createHttpError(400, 'name must be between 1 and 50 characters')

  const phone = validatePhone(input.phone)

  const idCard = typeof input.idCard === 'string' ? input.idCard.trim().toUpperCase() : ''
  if (!ID_CARD_PATTERN.test(idCard)) throw createHttpError(400, 'idCard format is invalid')

  const scheduleId = Number(input.scheduleId)
  if (!Number.isSafeInteger(scheduleId) || scheduleId < 1) throw createHttpError(400, 'scheduleId must be a positive integer')

  const peopleCount = Number(input.peopleCount)
  if (!Number.isSafeInteger(peopleCount) || peopleCount < 1 || peopleCount > 5) {
    throw createHttpError(400, 'peopleCount must be between 1 and 5')
  }

  return { idCard, name, peopleCount, phone, scheduleId }
}

module.exports = { validatePhone, validateReservationInput, validateReservationNo }
