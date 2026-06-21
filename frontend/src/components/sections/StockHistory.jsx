import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fmt, calcCAGR } from '../../utils/formatters'

const PERIODS = [
  { label: '1M',  days: 30 },
  { label: '3M',  days: 90 },
  { label: '6M',  days: 180 },
  { label: '1Y',  days: 365 },
  { label: '3Y',  days: 1095 },
  { label: '5Y',  days: 1825 },
]

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ color: 'var(--t-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{fmt.price(payload[0]?.value)}</div>
    </div>
  )
}

export default function StockHistory({ data }) {
  const [period, setPeriod] = useState('1Y')
  const priceHistory = data?.priceHistory?.historical || []
  const quote = data?.quote?.[0] || {}

  const periodDays = PERIODS.find((p) => p.label === period)?.days || 365

  const chartData = useMemo(() => {
    if (!priceHistory.length) return []
    const sorted = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date))
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - periodDays)
    return sorted
      .filter((d) => new Date(d.date) >= cutoff)
      .map((d) => ({ date: d.date.slice(5), price: d.close || d.price }))
  }, [priceHistory, periodDays])

  // CAGR calculations
  const allSorted = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date))
  const oldest = allSorted[0]
  const latest = allSorted[allSorted.length - 1]
  const yearSpan = oldest && latest
    ? (new Date(latest.date) - new Date(oldest.date)) / (365.25 * 24 * 3600 * 1000)
    : null
  const historicalCAGR = oldest && latest && yearSpan > 0
    ? calcCAGR(oldest.close || oldest.price, latest.close || latest.price, yearSpan)
    : null

  // Period return
  const periodStart = chartData[0]?.price
  const periodEnd = chartData[chartData.length - 1]?.price
  const periodReturn = periodStart && periodEnd ? ((periodEnd - periodStart) / periodStart) * 100 : null
  const isPositive = periodReturn == null || periodReturn >= 0

  const high = chartData.length ? Math.max(...chartData.map((d) => d.price)) : null
  const low  = chartData.length ? Math.min(...chartData.map((d) => d.price)) : null

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">14</div>
          Historical Stock Price Performance
        </div>
        <div className="time-selector">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              className={`time-btn ${period === p.label ? 'active' : ''}`}
              onClick={() => setPeriod(p.label)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        {/* Performance Summary */}
        <div className="metrics-grid" style={{ marginBottom: 20 }}>
          <div className="metric-item">
            <div className="metric-label">{period} Return</div>
            <div className={`metric-value ${isPositive ? 'good' : 'bad'}`}>
              {periodReturn != null ? `${periodReturn > 0 ? '+' : ''}${periodReturn.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Historical CAGR</div>
            <div className={`metric-value ${historicalCAGR != null && historicalCAGR >= 0.10 ? 'good' : 'neutral'}`}>
              {historicalCAGR != null ? `${(historicalCAGR * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <div className="metric-sublabel">Since inception</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Period High</div>
            <div className="metric-value">{high ? fmt.price(high) : 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Period Low</div>
            <div className="metric-value">{low ? fmt.price(low) : 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">52W High</div>
            <div className="metric-value">{fmt.price(quote.yearHigh)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Current</div>
            <div className="metric-value">{fmt.price(quote.price)}</div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#1565C0' : '#C0392B'} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={isPositive ? '#1565C0' : '#C0392B'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--t-muted)' }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                tick={{ fontSize: 10, fill: 'var(--t-muted)' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<TTip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#1565C0' : '#C0392B'}
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">No price history data available.</div>
        )}

        {historicalCAGR != null && (
          <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--c-navy-light)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--t-secondary)' }}>
            <strong style={{ color: 'var(--t-primary)' }}>Historical Value Creation:</strong>{' '}
            {data?.profile?.[0]?.companyName || quote.name || 'This company'} has compounded at{' '}
            <strong style={{ color: historicalCAGR >= 0.10 ? 'var(--c-green)' : 'var(--t-primary)' }}>
              {(historicalCAGR * 100).toFixed(1)}% CAGR
            </strong>{' '}
            over {yearSpan?.toFixed(0)} years ({fmt.year(oldest?.date)} – {fmt.year(latest?.date)}).
            {historicalCAGR >= 0.10 && ' This exceeds the long-term S&P 500 average of ~10%.'}
          </div>
        )}
      </div>
    </div>
  )
}
