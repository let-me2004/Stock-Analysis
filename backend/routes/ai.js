import { Router } from 'express'
import { generateAIOverview, generateSWOT } from '../services/groq.js'
import * as cache from '../cache.js'

const router = Router()

// POST /api/ai/overview
router.post('/overview', async (req, res) => {
  const { ticker, data } = req.body

  if (!ticker || !data) {
    return res.status(400).json({ error: 'ticker and data are required' })
  }

  const cacheKey = `ai:overview:${ticker.toUpperCase()}`
  const cached = cache.get(cacheKey)
  if (cached) return res.json({ ...cached, _cached: true })

  try {
    const overview = await generateAIOverview(ticker, data)
    cache.set(cacheKey, overview, 30 * 60 * 1000) // 30 min cache for AI responses
    res.json(overview)
  } catch (err) {
    console.error(`[ai/overview] ${ticker}:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/swot
router.post('/swot', async (req, res) => {
  const { ticker, data } = req.body

  if (!ticker || !data) {
    return res.status(400).json({ error: 'ticker and data are required' })
  }

  const cacheKey = `ai:swot:${ticker.toUpperCase()}`
  const cached = cache.get(cacheKey)
  if (cached) return res.json({ ...cached, _cached: true })

  try {
    const swot = await generateSWOT(ticker, data)
    cache.set(cacheKey, swot, 30 * 60 * 1000)
    res.json(swot)
  } catch (err) {
    console.error(`[ai/swot] ${ticker}:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
