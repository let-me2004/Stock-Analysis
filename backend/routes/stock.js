import { Router } from 'express'
import * as fmp from '../services/fmp.js'
import * as yf from '../services/yf.js'
import * as cache from '../cache.js'

const router = Router()

function getService(ticker) {
  return ticker.includes('.') ? yf : fmp
}

// GET /api/stock/search?q=query
router.get('/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.json([])
  
  try {
    // FMP free tier restricts search, use YF for all searches
    const results = await yf.searchTickers(q)
    res.json(results)
  } catch (err) {
    console.error('[stock/search]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stock/:ticker/full — fetch all data for complete analysis
router.get('/:ticker/full', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  const cacheKey = `full:${ticker}`
  const cached = cache.get(cacheKey)

  if (cached) {
    return res.json({ ...cached, _cached: true })
  }

  try {
    let service = getService(ticker)
    let data = await service.getFullAnalysis(ticker)

    // Fallback to YF if FMP returns no profile data (e.g. rate limit exceeded)
    if ((!data.profile || data.profile.length === 0 || data.profile['Error Message']) && service === fmp) {
      console.log(`[stock/full] FMP failed for ${ticker}, falling back to YF`)
      service = yf
      data = await service.getFullAnalysis(ticker)
    }

    // Validate that we got some profile data
    if (!data.profile || data.profile.length === 0) {
      return res.status(404).json({
        error: `Ticker "${ticker}" not found. Check the symbol and try again.`,
      })
    }

    cache.set(cacheKey, data, 15 * 60 * 1000)
    res.json(data)
  } catch (err) {
    console.error(`[stock/full] ${ticker}:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stock/:ticker/peers-detail — get detailed metrics for peer tickers
router.get('/:ticker/peers-detail', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  const { overrides } = req.query
  const cacheKey = `peers:${ticker}`
  const cached = cache.get(cacheKey)

  if (cached) {
    return res.json(cached)
  }

  try {
    let service = getService(ticker)
    
    let peerTickers = []
    if (overrides) {
      peerTickers = overrides.split(',').map(t => t.trim().toUpperCase())
    } else {
      const peersData = await service.getPeers(ticker)
      peerTickers = Array.isArray(peersData) ? peersData : (peersData?.peersList || [])
    }

    // Always include the main ticker for self-comparison
    const allTickers = [ticker, ...peerTickers.filter((t) => t !== ticker)].slice(0, 6)
    let details = await service.getPeerDetails(allTickers)

    // Fallback to YF if FMP failed to get peers
    if ((!details || details.length === 0) && service === fmp) {
      console.log(`[stock/peers-detail] FMP failed for ${ticker}, falling back to YF`)
      service = yf
      if (!overrides) {
        const peersData = await service.getPeers(ticker)
        peerTickers = Array.isArray(peersData) ? peersData : (peersData?.peersList || [])
      }
      const allTickersYf = [ticker, ...peerTickers.filter((t) => t !== ticker)].slice(0, 6)
      details = await service.getPeerDetails(allTickersYf)
    }

    cache.set(cacheKey, details, 30 * 60 * 1000)
    res.json(details)
  } catch (err) {
    console.error(`[stock/peers-detail] ${ticker}:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stock/:ticker/price-history — get price history for charts
router.get('/:ticker/price-history', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()

  try {
    const data = await fmp.getPriceHistory(ticker)
    res.json(data)
  } catch (err) {
    console.error(`[stock/price-history] ${ticker}:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
