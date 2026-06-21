import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ErrorBar, LineChart, Line, ReferenceLine } from 'recharts'
import { fmt } from '../../utils/formatters'

export default function Outlook({ data }) {
  const estimates = data?.analystEstimates || []
  const rec = data?.analystRecommendations?.[0] || {}
  const quote = data?.quote?.[0] || {}

  const totalRecs = (rec.strongBuy || 0) + (rec.buy || 0) + (rec.hold || 0) + (rec.sell || 0) + (rec.strongSell || 0)
  const bullRecs = (rec.strongBuy || 0) + (rec.buy || 0)
  const bullPct = totalRecs > 0 ? (bullRecs / totalRecs) * 100 : null

  const consensusLabel = bullPct == null ? 'N/A'
    : bullPct >= 70 ? 'Strong Buy'
    : bullPct >= 55 ? 'Buy'
    : bullPct >= 40 ? 'Hold'
    : 'Sell'
  const consensusClass = bullPct == null ? 'badge-navy'
    : bullPct >= 70 ? 'badge-green'
    : bullPct >= 55 ? 'badge-green'
    : bullPct >= 40 ? 'badge-amber'
    : 'badge-red'

  // Forward estimates chart
  const fwdData = estimates.slice(0, 4).reverse().map((e) => ({
    period: e.date?.slice(0, 4) || '',
    'Est. Revenue': e.estimatedRevenueAvg,
    'Est. EPS': e.estimatedEpsAvg,
    'Rev Low': e.estimatedRevenueLow,
    'Rev High': e.estimatedRevenueHigh,
  }))

  const priceTarget = quote.priceAvgTarget || quote.targetPriceAverage
  const upside = priceTarget && quote.price
    ? ((priceTarget - quote.price) / quote.price) * 100
    : null

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">11</div>
          Outlook &amp; Analyst Estimates
        </div>
        <span className={`badge ${consensusClass}`}>{consensusLabel}</span>
      </div>
      <div className="card-body">
        <div className="metrics-grid" style={{ marginBottom: 24 }}>
          <div className="metric-item">
            <div className="metric-label">Consensus</div>
            <div className="metric-value">{consensusLabel}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Bull / Total</div>
            <div className={`metric-value ${bullPct != null && bullPct >= 60 ? 'good' : 'neutral'}`}>
              {bullPct != null ? `${bullPct.toFixed(0)}%` : 'N/A'}
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Price Target</div>
            <div className="metric-value">{priceTarget ? fmt.price(priceTarget) : 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Upside Potential</div>
            <div className={`metric-value ${upside != null && upside > 0 ? 'good' : upside != null ? 'bad' : ''}`}>
              {upside != null ? `${upside > 0 ? '+' : ''}${upside.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Analyst breakdown */}
        {totalRecs > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Analyst Rating Distribution ({totalRecs} analysts)
            </div>
            {[
              { label: 'Strong Buy', count: rec.strongBuy || 0, color: '#1B7E4E' },
              { label: 'Buy',        count: rec.buy || 0,       color: '#4CAF7D' },
              { label: 'Hold',       count: rec.hold || 0,      color: '#B45309' },
              { label: 'Sell',       count: rec.sell || 0,      color: '#E07070' },
              { label: 'Strong Sell',count: rec.strongSell || 0,color: '#C0392B' },
            ].map((r) => (
              <div key={r.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--t-secondary)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--t-primary)', fontWeight: 600 }}>{r.count}</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${totalRecs > 0 ? (r.count / totalRecs) * 100 : 0}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Forward Estimates */}
        {fwdData.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Forward Revenue Estimates
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={fwdData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => fmt.compact(v)} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, n) => [fmt.money(v), n]} />
                <Bar dataKey="Est. Revenue" fill="#1565C0" radius={[3,3,0,0]} maxBarSize={40} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  )
}
