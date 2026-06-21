// ── Number formatters ──────────────────────────────────────────
export const fmt = {
  /** $1.23B / $456M / $12.3K */
  money(v, decimals = 1) {
    if (v == null || isNaN(v)) return 'N/A'
    const abs = Math.abs(v)
    const sign = v < 0 ? '-' : ''
    if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(decimals)}T`
    if (abs >= 1e9)  return `${sign}$${(abs / 1e9).toFixed(decimals)}B`
    if (abs >= 1e6)  return `${sign}$${(abs / 1e6).toFixed(decimals)}M`
    if (abs >= 1e3)  return `${sign}$${(abs / 1e3).toFixed(decimals)}K`
    return `${sign}$${abs.toFixed(2)}`
  },

  /** Raw number with commas */
  number(v, decimals = 2) {
    if (v == null || isNaN(v)) return 'N/A'
    return Number(v).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  },

  /** 12.3% */
  pct(v, decimals = 1) {
    if (v == null || isNaN(v)) return 'N/A'
    return `${(v * 100).toFixed(decimals)}%`
  },

  /** When value is already in % (e.g. 12.3) */
  pctRaw(v, decimals = 1) {
    if (v == null || isNaN(v)) return 'N/A'
    return `${Number(v).toFixed(decimals)}%`
  },

  /** 4.2x */
  multiple(v, decimals = 1) {
    if (v == null || isNaN(v)) return 'N/A'
    return `${Number(v).toFixed(decimals)}x`
  },

  /** Stock price $123.45 */
  price(v) {
    if (v == null || isNaN(v)) return 'N/A'
    return `$${Number(v).toFixed(2)}`
  },

  /** +1.23% or -0.45% with sign */
  change(v) {
    if (v == null || isNaN(v)) return 'N/A'
    const sign = v >= 0 ? '+' : ''
    return `${sign}${Number(v).toFixed(2)}%`
  },

  /** 2024, from "2024-12-31" */
  year(dateStr) {
    if (!dateStr) return ''
    return dateStr.slice(0, 4)
  },

  /** Jan 15, 2024 */
  date(dateStr) {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    } catch { return dateStr }
  },

  /** Compact: 1.2B */
  compact(v) {
    if (v == null || isNaN(v)) return 'N/A'
    const abs = Math.abs(v)
    if (abs >= 1e12) return `${(v / 1e12).toFixed(1)}T`
    if (abs >= 1e9)  return `${(v / 1e9).toFixed(1)}B`
    if (abs >= 1e6)  return `${(v / 1e6).toFixed(1)}M`
    if (abs >= 1e3)  return `${(v / 1e3).toFixed(1)}K`
    return Number(v).toFixed(0)
  },
}

// ── CAGR calculator ────────────────────────────────────────────
export function calcCAGR(start, end, years) {
  if (!start || !end || !years || start <= 0) return null
  return Math.pow(end / start, 1 / years) - 1
}

// ── Color helpers ──────────────────────────────────────────────
export function changeClass(v) {
  if (v == null) return ''
  return Number(v) >= 0 ? 'positive' : 'negative'
}

export function metricClass(v, goodThreshold, badThreshold, higherIsBetter = true) {
  if (v == null) return ''
  if (higherIsBetter) {
    if (v >= goodThreshold) return 'good'
    if (v <= badThreshold) return 'bad'
    return 'neutral'
  } else {
    if (v <= goodThreshold) return 'good'
    if (v >= badThreshold) return 'bad'
    return 'neutral'
  }
}

// ── Chart color palette ─────────────────────────────────────────
export const CHART_COLORS = {
  primary:  '#1565C0',
  secondary:'#C9A84C',
  green:    '#1B7E4E',
  red:      '#C0392B',
  purple:   '#5B21B6',
  teal:     '#0E7490',
  orange:   '#C2410C',
}

export const CHART_COLOR_LIST = [
  '#1565C0', '#C9A84C', '#1B7E4E', '#C0392B', '#5B21B6', '#0E7490',
]
