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
    const service = getService(ticker)
    const data = await service.getFullAnalysis(ticker)

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

  try {
    let peerTickers

    const service = getService(ticker)

    if (overrides) {
      // Manual peer override from frontend
      peerTickers = overrides.split(',').map((t) => t.trim().toUpperCase())
    } else {
      const peersData = await service.getPeers?.(ticker) || []
      peerTickers = peersData?.[0]?.peersList || []
    }

    // Always include the main ticker for self-comparison
    const allTickers = [ticker, ...peerTickers.filter((t) => t !== ticker)].slice(0, 6)
    const details = await service.getPeerDetails(allTickers)
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
