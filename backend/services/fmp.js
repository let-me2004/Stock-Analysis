import fetch from 'node-fetch'
import * as cache from '../cache.js'

const FMP_BASE = 'https://financialmodelingprep.com/stable'

async function fmpFetch(path, cacheTtlMs = 15 * 60 * 1000) {
  const cacheKey = path
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const separator = path.includes('?') ? '&' : '?'
  const url = `${FMP_BASE}${path}${separator}apikey=${process.env.FMP_API_KEY}`

  const res = await fetch(url, { timeout: 15000 })
  if (!res.ok) {
    throw new Error(`FMP API ${res.status}: ${path}`)
  }
  const data = await res.json()

  if (data && !data['Error Message']) {
    cache.set(cacheKey, data, cacheTtlMs)
  }

  return data
}

// ── Profile & Quote ────────────────────────────────────────────────────────
export const getProfile = (ticker) =>
  fmpFetch(`/profile?symbol=${encodeURIComponent(ticker)}`)

export const getQuote = (ticker) =>
  fmpFetch(`/quote?symbol=${encodeURIComponent(ticker)}`, 2 * 60 * 1000) // 2 min TTL for live price

// ── Financials ────────────────────────────────────────────────────────────
export const getIncomeStatement = (ticker) =>
  fmpFetch(`/income-statement?symbol=${encodeURIComponent(ticker)}&period=annual&limit=5`)

export const getBalanceSheet = (ticker) =>
  fmpFetch(`/balance-sheet-statement?symbol=${encodeURIComponent(ticker)}&period=annual&limit=5`)

export const getCashFlow = (ticker) =>
  fmpFetch(`/cash-flow-statement?symbol=${encodeURIComponent(ticker)}&period=annual&limit=5`)

// ── Metrics & Ratios ──────────────────────────────────────────────────────
export const getKeyMetrics = (ticker) =>
  fmpFetch(`/key-metrics?symbol=${encodeURIComponent(ticker)}&period=annual&limit=5`)

export const getRatios = (ticker) =>
  fmpFetch(`/ratios?symbol=${encodeURIComponent(ticker)}&period=annual&limit=5`)

export const getKeyMetricsTTM = (ticker) =>
  fmpFetch(`/key-metrics-ttm?symbol=${encodeURIComponent(ticker)}`)

export const getRatiosTTM = (ticker) =>
  fmpFetch(`/ratios-ttm?symbol=${encodeURIComponent(ticker)}`)

// ── Management & Ownership ────────────────────────────────────────────────
export const getExecutives = (ticker) =>
  fmpFetch(`/key-executives?symbol=${encodeURIComponent(ticker)}`)

export const getInsiderTrading = (ticker) =>
  fmpFetch(`/insider-trading?symbol=${encodeURIComponent(ticker)}&limit=20`)

export const getInstitutionalHolders = (ticker) =>
  fmpFetch(`/institutional-ownership?symbol=${encodeURIComponent(ticker)}`)

// ── Estimates & Peers ─────────────────────────────────────────────────────
export const getAnalystEstimates = (ticker) =>
  fmpFetch(`/analyst-estimates?symbol=${encodeURIComponent(ticker)}&period=annual&limit=5`)

export const getAnalystRecommendations = (ticker) =>
  fmpFetch(`/analyst-stock-recommendations?symbol=${encodeURIComponent(ticker)}&limit=1`)

export const getPeers = (ticker) =>
  fmpFetch(`/stock-peers?symbol=${encodeURIComponent(ticker)}`)

// ── Price History ─────────────────────────────────────────────────────────
export const getPriceHistory = async (ticker) => {
  const data = await fmpFetch(`/historical-price-eod/full?symbol=${encodeURIComponent(ticker)}`)
  // Standardize the stable array output to match the legacy format expected by the frontend
  if (Array.isArray(data)) return { symbol: ticker, historical: data }
  return data
}

// ── Bulk data fetch for full analysis ────────────────────────────────────
export async function getFullAnalysis(ticker) {
  const upper = ticker.toUpperCase()

  const [
    profile,
    quote,
    income,
    balance,
    cashflow,
    keyMetrics,
    ratios,
    keyMetricsTTM,
    ratiosTTM,
    executives,
    insiderTrading,
    institutionalHolders,
    analystEstimates,
    analystRecommendations,
    peers,
    priceHistory,
  ] = await Promise.allSettled([
    getProfile(upper),
    getQuote(upper),
    getIncomeStatement(upper),
    getBalanceSheet(upper),
    getCashFlow(upper),
    getKeyMetrics(upper),
    getRatios(upper),
    getKeyMetricsTTM(upper),
    getRatiosTTM(upper),
    getExecutives(upper),
    getInsiderTrading(upper),
    getInstitutionalHolders(upper),
    getAnalystEstimates(upper),
    getAnalystRecommendations(upper),
    getPeers(upper),
    getPriceHistory(upper),
  ])

  const resolve = (result, fallback = []) =>
    result.status === 'fulfilled' ? result.value : fallback

  return {
    profile: resolve(profile, []),
    quote: resolve(quote, []),
    income: resolve(income, []),
    balance: resolve(balance, []),
    cashflow: resolve(cashflow, []),
    keyMetrics: resolve(keyMetrics, []),
    ratios: resolve(ratios, []),
    keyMetricsTTM: resolve(keyMetricsTTM, []),
    ratiosTTM: resolve(ratiosTTM, []),
    executives: resolve(executives, []),
    insiderTrading: resolve(insiderTrading, []),
    institutionalHolders: resolve(institutionalHolders, []),
    analystEstimates: resolve(analystEstimates, []),
    analystRecommendations: resolve(analystRecommendations, []),
    peers: resolve(peers, []),
    priceHistory: resolve(priceHistory, {}),
  }
}

// ── Peer profiles ─────────────────────────────────────────────────────────
export async function getPeerDetails(peerTickers) {
  const results = await Promise.allSettled(
    peerTickers.slice(0, 5).map(async (t) => {
      const [profile, ratiosTTM, keyMetricsTTM] = await Promise.allSettled([
        getProfile(t),
        getRatiosTTM(t),
        getKeyMetricsTTM(t),
      ])
      return {
        ticker: t,
        profile: profile.status === 'fulfilled' ? profile.value?.[0] : null,
        ratiosTTM: ratiosTTM.status === 'fulfilled' ? ratiosTTM.value?.[0] : null,
        keyMetricsTTM: keyMetricsTTM.status === 'fulfilled' ? keyMetricsTTM.value?.[0] : null,
      }
    })
  )
  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((r) => r.profile)
}
