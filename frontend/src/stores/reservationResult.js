import { ref } from 'vue'

// This summary is intentionally memory-only and contains no personal information.
export const reservationResult = ref(null)

export function setReservationResult(result) {
  reservationResult.value = result
}
