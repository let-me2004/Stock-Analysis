import { Router } from 'express'
import * as cache from '../cache.js'
import {
  getFullIntelligence,
  getFinancialNews,
  getExaResults,
  getRedditPosts,
  getTwitterPosts,
  getYoutubeVideos,
} from '../services/intelligence.js'

const router = Router()
const CACHE_TTL = 20 * 60 * 1000 // 20 minutes

// GET /api/stock/:ticker/intelligence  — full aggregated intelligence
router.get('/:ticker/intelligence', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  const cacheKey = `intel:${ticker}`
  const cached = cache.get(cacheKey)
  if (cached) return res.json({ ...cached, _cached: true })

  try {
    const data = await getFullIntelligence(ticker)
    cache.set(cacheKey, data, CACHE_TTL)
    res.json(data)
  } catch (err) {
    console.error(`[intelligence] ${ticker}:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stock/:ticker/intelligence/news
router.get('/:ticker/intelligence/news', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  try {
    const news = await getFinancialNews(ticker)
    res.json(news)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stock/:ticker/intelligence/exa
router.get('/:ticker/intelligence/exa', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  try {
    const results = await getExaResults(ticker)
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stock/:ticker/intelligence/social  — reddit + twitter combined
router.get('/:ticker/intelligence/social', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  try {
    const [reddit, twitter] = await Promise.allSettled([
      getRedditPosts(ticker),
      getTwitterPosts(ticker),
    ])
    res.json({
      reddit: reddit.status === 'fulfilled' ? reddit.value : [],
      twitter: twitter.status === 'fulfilled' ? twitter.value : [],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stock/:ticker/intelligence/video  — YouTube analyst videos
router.get('/:ticker/intelligence/video', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  try {
    const videos = await getYoutubeVideos(ticker)
    res.json(videos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
