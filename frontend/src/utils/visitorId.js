export const VISITOR_ID_KEY = 'memorial_visitor_id'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function createUuidV4(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()

  const bytes = new Uint8Array(16)
  if (typeof cryptoApi?.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function createVisitorIdStore(storage, uuidFactory = createUuidV4) {
  return {
    getVisitorId() {
      const current = storage?.getItem?.(VISITOR_ID_KEY)
      if (UUID_V4.test(current || '')) return current
      const visitorId = uuidFactory()
      storage?.setItem?.(VISITOR_ID_KEY, visitorId)
      return visitorId
    },
  }
}

export function getVisitorId() {
  return createVisitorIdStore(typeof localStorage === 'undefined' ? null : localStorage).getVisitorId()
}
