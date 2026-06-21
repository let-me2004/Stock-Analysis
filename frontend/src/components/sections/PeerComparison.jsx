import { useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { usePeerDetails } from '../../hooks/useStock'
import { fmt } from '../../utils/formatters'

const COLORS = ['#1565C0', '#C9A84C', '#1B7E4E', '#C0392B', '#5B21B6', '#0E7490']

export default function PeerComparison({ ticker, data }) {
  const [peerInput, setPeerInput] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { peers, loading } = usePeerDetails(ticker, submitted || undefined)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(peerInput.trim().toUpperCase())
  }

  // Build radar data
  const normalize = (val, max) => max > 0 ? Math.min((val / max) * 100, 100) : 0

  const radarData = peers.length > 1 ? [
    { metric: 'Gross Margin' },
    { metric: 'Net Margin' },
    { metric: 'ROIC' },
    { metric: 'FCF Margin' },
    { metric: 'Rev Growth' },
  ].map((row) => {
    const result = { metric: row.metric }
    peers.forEach((p) => {
      const rt = p.ratiosTTM || {}
      const km = p.keyMetricsTTM || {}
      let val = 0
      if (row.metric === 'Gross Margin')  val = (rt.grossProfitMarginTTM || 0) * 100
      if (row.metric === 'Net Margin')    val = (rt.netProfitMarginTTM || 0) * 100
      if (row.metric === 'ROIC')          val = (km.roicTTM || 0) * 100
      if (row.metric === 'FCF Margin')    val = (km.freeCashFlowMargin || 0) * 100
      if (row.metric === 'Rev Growth')    val = (rt.revenueGrowthTTM || 0) * 100
      result[p.ticker] = parseFloat(val.toFixed(1))
    })
    return result
  }) : []

  const tableMetrics = [
    { label: 'Market Cap',      fn: (p) => fmt.money(p.profile?.mktCap) },
    { label: 'P/E (TTM)',       fn: (p) => fmt.multiple(p.ratiosTTM?.priceToEarningsRatioTTM) },
    { label: 'EV/EBITDA',      fn: (p) => fmt.multiple(p.ratiosTTM?.enterpriseValueMultipleTTM) },
    { label: 'Gross Margin',    fn: (p) => fmt.pct(p.ratiosTTM?.grossProfitMarginTTM) },
    { label: 'Net Margin',      fn: (p) => fmt.pct(p.ratiosTTM?.netProfitMarginTTM) },
    { label: 'ROIC',            fn: (p) => fmt.pct(p.keyMetricsTTM?.roicTTM) },
    { label: 'Div Yield',       fn: (p) => fmt.pct(p.ratiosTTM?.dividendYieldTTM) },
    { label: 'Debt/Equity',     fn: (p) => fmt.multiple(p.ratiosTTM?.debtToEquityRatioTTM) },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">13</div>
          Peer Comparison
        </div>
      </div>
      <div className="card-body">
        <form className="peer-input-row" onSubmit={handleSubmit}>
          <input
            className="peer-input"
            value={peerInput}
            onChange={(e) => setPeerInput(e.target.value.toUpperCase())}
            placeholder="Override peers: MSFT,GOOGL,META  (comma-separated)"
            id="peer-override-input"
          />
          <button type="submit" className="btn btn-primary btn-sm">Compare</button>
          {submitted && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSubmitted(''); setPeerInput('') }}>Reset</button>
          )}
        </form>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--t-muted)', padding: 20, fontSize: 13 }}>
            <div className="spinner" /> Loading peer data...
          </div>
        ) : peers.length > 0 ? (
          <>
            {radarData.length > 0 && peers.length > 1 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                  Competitive Positioning
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--t-secondary)' }} />
                    <Tooltip />
                    <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    {peers.map((p, i) => (
                      <Radar
                        key={p.ticker}
                        name={p.ticker}
                        dataKey={p.ticker}
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Metrics Comparison
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 500 }}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    {peers.map((p, i) => (
                      <th key={p.ticker} className="right" style={{ color: p.ticker === ticker ? 'var(--c-blue)' : undefined }}>
                        {p.ticker}
                        {p.ticker === ticker && ' ★'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableMetrics.map((row) => (
                    <tr key={row.label}>
                      <td className="label">{row.label}</td>
                      {peers.map((p) => (
                        <td key={p.ticker} className="right" style={{ fontWeight: p.ticker === ticker ? 600 : 400 }}>
                          {row.fn(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state">No peer data available.</div>
        )}
      </div>
    </div>
  )
}
