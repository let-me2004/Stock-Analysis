import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })
import express from 'express'
import cors from 'cors'
import stockRoutes from './routes/stock.js'
import aiRoutes from './routes/ai.js'
import intelligenceRoutes from './routes/intelligence.js'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))

// ── Request logging ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  const ts = new Date().toISOString().slice(11, 19)
  console.log(`[${ts}] ${req.method} ${req.path}`)
  next()
})

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/stock', stockRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/stock', intelligenceRoutes)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    fmp: !!process.env.FMP_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
  })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ error: err.message })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`)
  console.log(`║  Stock Analysis API  →  :${PORT}        ║`)
  console.log(`║  FMP key: ${process.env.FMP_API_KEY ? '✓ loaded' : '✗ MISSING'}               ║`)
  console.log(`║  Groq key: ${process.env.GROQ_API_KEY ? '✓ loaded' : '✗ MISSING'}              ║`)
  console.log(`╚══════════════════════════════════════╝\n`)
})
