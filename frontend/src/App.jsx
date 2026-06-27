import { useState, useRef, useEffect, useCallback } from 'react'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import StockHeader from './components/StockHeader/StockHeader'
import AIOverview from './components/AIOverview/AIOverview'
import BusinessProfile from './components/sections/BusinessProfile'
import RevenueSplit from './components/sections/RevenueSplit'
import Management from './components/sections/Management'
import MoatAnalysis from './components/sections/MoatAnalysis'
import SWOTAnalysis from './components/sections/SWOTAnalysis'
import CapitalIntensity from './components/sections/CapitalIntensity'
import CapitalAllocation from './components/sections/CapitalAllocation'
import BalanceSheet from './components/sections/BalanceSheet'
import Profitability from './components/sections/Profitability'
import HistoricalGrowth from './components/sections/HistoricalGrowth'
import Outlook from './components/sections/Outlook'
import Valuation from './components/sections/Valuation'
import PeerComparison from './components/sections/PeerComparison'
import StockHistory from './components/sections/StockHistory'
import MarketIntelligence from './components/sections/MarketIntelligence/MarketIntelligence'
import WelcomeState from './components/WelcomeState/WelcomeState'
import { useStock } from './hooks/useStock'
import { exportToPDF } from './utils/pdfExport'

function LoadingState({ ticker }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <div className="loading-text">Analyzing {ticker}</div>
      <div className="loading-sub">Fetching financial data &amp; running models</div>
    </div>
  )
}

function ErrorState({ error, ticker }) {
  return (
    <div className="error-state">
      <div className="error-code">—</div>
      <div className="error-title">Signal not found — {ticker}</div>
      <div className="error-msg">{error}</div>
      <div style={{ fontSize: 11, color: 'var(--t-muted)', marginTop: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Try: AAPL · MSFT · RELIANCE.NS · BP.L
      </div>
    </div>
  )
}

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
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function App() {
  const [ticker, setTicker] = useState('')
  const { data, loading, error } = useStock(ticker)
  const reportRef = useRef(null)

  const handleSearch = (t) => setTicker(t.trim().toUpperCase())

  const handleExport = async () => {
    if (!reportRef.current || !ticker) return
    await exportToPDF(reportRef.current, ticker)
  }

  return (
    <div className="app-root">
      <Header onSearch={handleSearch} onExport={handleExport} ticker={ticker} />
      <div className="app-body">
        <Sidebar currentTicker={ticker} onSelectTicker={handleSearch} />
        <main className={`main-content ${!ticker ? 'welcome-mode' : ''}`} ref={reportRef}>
          {!ticker && <WelcomeState onSearch={handleSearch} scrollContainerRef={reportRef} />}
          {ticker && loading && <LoadingState ticker={ticker} />}
          {ticker && !loading && error && <ErrorState error={error} ticker={ticker} />}
          {ticker && !loading && !error && data && (
            <>
              <StockHeader data={data} />
              <AIOverview ticker={ticker} data={data} />
              <div className="analysis-sections">
                <div className="two-col">
                  <BusinessProfile data={data} />
                  <RevenueSplit data={data} />
                </div>
                <Management data={data} />
                <div className="two-col">
                  <MoatAnalysis data={data} />
                  <SWOTAnalysis ticker={ticker} data={data} />
                </div>
                <div className="two-col">
                  <CapitalIntensity data={data} />
                  <CapitalAllocation data={data} />
                </div>
                <div className="two-col">
                  <BalanceSheet data={data} />
                  <Profitability data={data} />
                </div>
                <HistoricalGrowth data={data} />
                <div className="two-col">
                  <Outlook data={data} />
                  <Valuation data={data} />
                </div>
                <PeerComparison ticker={ticker} data={data} />
                <StockHistory data={data} />
                <MarketIntelligence ticker={ticker} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
