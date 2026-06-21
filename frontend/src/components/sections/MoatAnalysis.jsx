import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { fmt, metricClass } from '../../utils/formatters'

function MoatScore({ ratios, keyMetrics }) {
  let score = 0
  const checks = []

  const gmAvg = ratios.slice(0, 5).reduce((s, r) => s + (r.grossProfitMargin || 0), 0) / Math.min(ratios.length, 5)
  const roicAvg = keyMetrics.slice(0, 5).reduce((s, k) => s + (k.roic || 0), 0) / Math.min(keyMetrics.length, 5)
  const fcfMarginAvg = keyMetrics.slice(0, 5).reduce((s, k) => s + (k.freeCashFlowMargin || 0), 0) / Math.min(keyMetrics.length, 5)

  if (gmAvg > 0.4) { score += 25; checks.push({ label: 'High Gross Margin (>40%)', pass: true }) }
  else { checks.push({ label: 'High Gross Margin (>40%)', pass: false }) }

  if (roicAvg > 0.15) { score += 30; checks.push({ label: 'Strong ROIC (>15%)', pass: true }) }
  else { checks.push({ label: 'Strong ROIC (>15%)', pass: false }) }

  if (fcfMarginAvg > 0.15) { score += 25; checks.push({ label: 'High FCF Margin (>15%)', pass: true }) }
  else { checks.push({ label: 'High FCF Margin (>15%)', pass: false }) }

  // Margin stability
  const gmValues = ratios.slice(0, 5).map((r) => r.grossProfitMargin || 0).filter(Boolean)
  if (gmValues.length > 1) {
    const variance = gmValues.reduce((s, v) => s + Math.abs(v - gmAvg), 0) / gmValues.length
    if (variance < 0.05) { score += 20; checks.push({ label: 'Stable Margins (low variance)', pass: true }) }
    else { checks.push({ label: 'Stable Margins (low variance)', pass: false }) }
  }

  const label = score >= 75 ? 'Wide Moat' : score >= 45 ? 'Narrow Moat' : 'No Moat'
  const color = score >= 75 ? 'var(--c-green)' : score >= 45 ? 'var(--c-amber)' : 'var(--c-red)'
  const badgeClass = score >= 75 ? 'badge-green' : score >= 45 ? 'badge-amber' : 'badge-red'

  return { score, label, color, badgeClass, checks }
}

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name}: {(p.value * 100).toFixed(1)}%
        </div>
      ))}
    </div>
  )
}

export default function MoatAnalysis({ data }) {
  const ratios = data?.ratios || []
  const keyMetrics = data?.keyMetrics || []
  const rtTTM = data?.ratiosTTM?.[0] || {}
  const kmTTM = data?.keyMetricsTTM?.[0] || {}

  const chartData = ratios.slice(0, 8).reverse().map((r, i) => ({
    year: fmt.year(r.date),
    'Gross Margin': r.grossProfitMargin,
    'Net Margin': r.netProfitMarginTTM || r.netProfitMargin,
    'ROIC': keyMetrics[ratios.length - 1 - i]?.roic || null,
  }))

  const moat = MoatScore({ ratios, keyMetrics })

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">4</div>
          Moat Analysis
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: moat.color }}>
            {moat.score}
          </span>
          <span className={`badge ${moat.badgeClass}`}>{moat.label}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="two-col" style={{ gap: 24, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Moat Scorecard
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {moat.checks.map((c) => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span style={{ fontSize: 16 }}>{c.pass ? '✅' : '❌'}</span>
                  <span style={{ color: c.pass ? 'var(--t-primary)' : 'var(--t-muted)' }}>{c.label}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="metric-item">
                <div className="metric-label">Gross Margin (TTM)</div>
                <div className={`metric-value ${metricClass(rtTTM.grossProfitMarginTTM, 0.4, 0.2)}`}>
                  {fmt.pct(rtTTM.grossProfitMarginTTM)}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">ROIC (TTM)</div>
                <div className={`metric-value ${metricClass(kmTTM.roicTTM, 0.15, 0.08)}`}>
                  {fmt.pct(kmTTM.roicTTM)}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">FCF Margin (TTM)</div>
                <div className={`metric-value ${metricClass(kmTTM.freeCashFlowMargin, 0.15, 0.05)}`}>
                  {fmt.pct(kmTTM.freeCashFlowMargin)}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Op. Margin (TTM)</div>
                <div className={`metric-value ${metricClass(rtTTM.operatingProfitMarginTTM, 0.2, 0.05)}`}>
                  {fmt.pct(rtTTM.operatingProfitMarginTTM)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Margin &amp; ROIC Trend
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v*100).toFixed(0)}%`} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TTip />} />
                <ReferenceLine y={0.15} stroke="var(--c-green)" strokeDasharray="4 4" strokeWidth={1} label={{ value: '15% ROIC', fill: 'var(--c-green)', fontSize: 9 }} />
                <Line type="monotone" dataKey="Gross Margin" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Net Margin" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ROIC" stroke="#1B7E4E" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
