import React, { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LineWaves from '../LineWaves/LineWaves'
import './WelcomeState.css'

/* ── Animated mini sparkline SVG ── */
function Sparkline({ data, color, width = 80, height = 28 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
  ).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function WelcomeState({ onSearch, scrollContainerRef }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  
  const heroRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // Hero text sequence
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -100])




  
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data.slice(0, 5) : [])
      } catch { /* ignore */ } finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = query.trim().toUpperCase()
    if (t) onSearch(t)
  }

  const trendingStocks = [
    { sym: 'AAPL', name: 'Apple Inc.', spark: [142,145,148,147,152,155,158,160,165,170,175,178,182,185,190,195,198] },
    { sym: 'RELIANCE.NS', name: 'Reliance Ind.', spark: [1380,1395,1410,1405,1420,1435,1428,1440,1445,1450,1438] },
    { sym: 'NVDA', name: 'NVIDIA Corp.', spark: [108,112,118,125,128,132,130,135,138,140,136] },
    { sym: 'MSFT', name: 'Microsoft Corp.', spark: [410,415,420,425,422,430,435,438,440,442] },
    { sym: 'TCS.NS', name: 'TCS Ltd.', spark: [3900,3950,4000,3980,4020,4060,4080,4100,4125] },
    { sym: 'HDFCBANK.NS', name: 'HDFC Bank', spark: [1850,1870,1890,1910,1905,1920,1935,1940,1945] },
  ]

  const pillars = [
    { title: 'Business Profile', desc: 'Company overview, sector positioning & competitive landscape' },
    { title: 'Revenue & P&L', desc: 'Revenue trends, gross margins, net income trajectory' },
    { title: 'Moat Analysis', desc: 'Competitive advantages, switching costs & network effects' },
    { title: 'SWOT Analysis', desc: 'AI-powered strengths, weaknesses, opportunities & threats' },
    { title: 'Capital Allocation', desc: 'Buybacks, dividends, R&D spend & reinvestment rates' },
    { title: 'Profitability', desc: 'ROE, ROIC, ROCE & margin expansion analysis' },
    { title: 'Balance Sheet', desc: 'Debt structure, liquidity ratios & financial health' },
    { title: 'Valuation', desc: 'DCF, multiples, intrinsic value & margin of safety' },
  ]

  return (
    <div className="ws-root">
      
      {/* ── Background Animation ── */}
      <div className="ws-bg-animation">
        <LineWaves
          speed={0.2}
          innerLineCount={25}
          outerLineCount={30}
          warpIntensity={1.2}
          rotation={0}
          edgeFadeWidth={0.2}
          colorCycleSpeed={0.5}
          brightness={0.15}
          color1="#ffffff"
          color2="#aaaaaa"
          color3="#555555"
          enableMouseInteraction={true}
          mouseInfluence={2.5}
        />
      </div>

      {/* ── Section 1: Hero Sticky Sequence ── */}
      <div className="ws-hero-container" ref={heroRef}>
        <div className="ws-hero-sticky">
          


          {/* Title that fades out */}
          <motion.div 
            className="ws-hero-title-wrapper"
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          >
            <div className="ws-hero-badge">Institutional Equity Intelligence</div>
            <h1 className="ws-hero-title">
              Precision.
              <span>Signal. Edge.</span>
            </h1>
          </motion.div>

          {/* Search */}
          <div className="ws-search-container">
            <div className="ws-search-wrapper">
              <form className="ws-search-form" onSubmit={(e) => {
                e.preventDefault()
                if (query.trim()) onSearch(query.trim())
              }}>
                <div className="ws-search-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  className="ws-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search AAPL, RELIANCE.NS..."
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="submit" className="ws-search-btn">Analyze</button>
                
                {query.trim() && (
                  <div className="ws-search-dropdown">
                    {searching ? (
                      <div className="ws-search-dd-item muted">Searching...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map(s => (
                        <div key={s.symbol} className="ws-search-dd-item" onMouseDown={() => onSearch(s.symbol)}>
                          <span className="ws-dd-sym">{s.symbol}</span>
                          <span className="ws-dd-name">{s.name}</span>
                          <span className="ws-dd-exch">{s.exchange}</span>
                        </div>
                      ))
                    ) : (
                      <div className="ws-search-dd-item muted">No results found</div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* ── Section 2: Trending Stocks ── */}
      <div className="ws-section">
        <motion.div 
          className="ws-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ root: scrollContainerRef, once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="ws-section-label">Market Coverage</div>
          <h2 className="ws-section-title">Instruments we track.</h2>
        </motion.div>

        <div className="ws-trending-grid">
          {trendingStocks.map((s, i) => (
            <motion.button
              key={s.sym}
              className="ws-trending-card"
              onClick={() => onSearch(s.sym)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ root: scrollContainerRef, once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            >
              <div className="ws-trending-sym">{s.sym}</div>
              <div className="ws-trending-name">{s.name}</div>
              <div className="ws-trending-chart">
                <Sparkline data={s.spark} color="rgba(255,255,255,0.60)" width={100} height={36} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Section 3: 14-Pillar Framework ── */}
      <div className="ws-section" style={{ paddingBottom: 200 }}>
        <motion.div 
          className="ws-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ root: scrollContainerRef, once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="ws-section-label">Analysis Framework</div>
          <h2 className="ws-section-title">14 pillars. Zero noise.</h2>
        </motion.div>

        <div className="ws-pillars-grid">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              className="ws-pillar-card"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ root: scrollContainerRef, once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.1, ease: "easeOut" }}
            >
              <div className="ws-pillar-title">{p.title}</div>
              <div className="ws-pillar-desc">{p.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}
