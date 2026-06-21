/**
 * Simple in-memory cache with TTL support
 * Prevents repeated FMP API calls (250/day free limit)
 */

const store = new Map()

/**
 * @param {string} key - cache key
 * @param {*} value - data to cache
 * @param {number} ttlMs - time-to-live in milliseconds (default: 15 min)
 */
export function set(key, value, ttlMs = 15 * 60 * 1000) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })
}

/**
 * @param {string} key - cache key
 * @returns {*|null} cached value or null if expired/missing
 */
export function get(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value
}

export function del(key) {
  store.delete(key)
}

export function clear() {
  store.clear()
}

export function size() {
  return store.size
}
