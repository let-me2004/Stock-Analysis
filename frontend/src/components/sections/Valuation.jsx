import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { fmt, metricClass } from '../../utils/formatters'

export default function Valuation({ data }) {
  const ratios = data?.ratios || []
  const keyMetrics = data?.keyMetrics || []
  const rtTTM = data?.ratiosTTM?.[0] || {}
  const kmTTM = data?.keyMetricsTTM?.[0] || {}
  const quote = data?.quote?.[0] || {}

  // Current vs 5Y average P/E
  const currentPE = rtTTM.priceToEarningsRatioTTM
  const avg5PE = ratios.slice(0, 5).reduce((s, r) => s + (r.priceEarningsRatio || 0), 0) / Math.min(ratios.length, 5)
  const peVsAvg = currentPE && avg5PE ? ((currentPE - avg5PE) / avg5PE) * 100 : null

  // Historical P/E trend
  const peData = ratios.slice(0, 8).reverse().map((r) => ({
    year: fmt.year(r.date),
    'P/E': r.priceEarningsRatio ? parseFloat(r.priceEarningsRatio.toFixed(1)) : null,
    'P/FCF': r.priceToFreeCashFlowsRatio ? parseFloat(r.priceToFreeCashFlowsRatio.toFixed(1)) : null,
    'Avg P/E': parseFloat(avg5PE.toFixed(1)),
  }))

  const valuationItems = [
    { label: 'P/E (TTM)',        value: rtTTM.priceToEarningsRatioTTM,                       fmt: fmt.multiple },
    { label: 'Fwd P/E',          value: kmTTM.priceToEarningsRatioTTM,                       fmt: fmt.multiple },
    { label: 'P/E 5Y Avg',       value: avg5PE,                                 fmt: fmt.multiple },
    { label: 'P/FCF (TTM)',      value: rtTTM.priceToFreeCashFlowRatioTTM || rtTTM.priceToFreeCashFlowsTTM,          fmt: fmt.multiple },
    { label: 'EV/EBITDA (TTM)', value: rtTTM.enterpriseValueMultipleTTM,       fmt: fmt.multiple },
    { label: 'P/S (TTM)',        value: rtTTM.priceToSalesRatioTTM,             fmt: fmt.multiple },
    { label: 'P/B (TTM)',        value: rtTTM.priceToBookRatioTTM,              fmt: fmt.multiple },
    { label: 'EV/Revenue',       value: kmTTM.evToSalesTTM,                     fmt: fmt.multiple },
    { label: 'PEG Ratio',        value: kmTTM.pegRatioTTM,                      fmt: (v) => fmt.number(v, 2) },
    { label: 'Div Yield',        value: rtTTM.dividendYieldTTM,                 fmt: fmt.pct },
  ]

  const valuationSignal = peVsAvg == null ? null
    : peVsAvg > 15 ? 'Overvalued'
    : peVsAvg < -15 ? 'Undervalued'
    : 'Fairly Valued'
  const signalClass = valuationSignal === 'Overvalued' ? 'badge-red'
    : valuationSignal === 'Undervalued' ? 'badge-green'
    : 'badge-amber'

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">12</div>
          Valuation
        </div>
        {valuationSignal && <span className={`badge ${signalClass}`}>{valuationSignal}</span>}
      </div>
      <div className="card-body">
        {peVsAvg != null && (
          <div style={{ background: 'var(--c-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Current P/E</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmt.multiple(currentPE)}</div>
            </div>
            <div style={{ fontSize: 20, color: 'var(--border-strong)' }}>vs</div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>5Y Avg P/E</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmt.multiple(avg5PE)}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: peVsAvg > 0 ? 'var(--c-red)' : 'var(--c-green)' }}>
                {peVsAvg > 0 ? '+' : ''}{peVsAvg.toFixed(1)}% {peVsAvg > 0 ? 'premium' : 'discount'} to 5Y avg
              </span>
            </div>
          </div>
        )}

        <div className="metrics-grid" style={{ marginBottom: 24 }}>
          {valuationItems.map((item) => (
            <div className="metric-item" key={item.label}>
              <div className="metric-label">{item.label}</div>
              <div className="metric-value" style={{ fontSize: 15 }}>
                {item.value != null ? item.fmt(item.value) : 'N/A'}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          Historical P/E vs 5Y Average
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={peData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [`${v?.toFixed(1)}x`, n]} />
            <Line type="monotone" dataKey="P/E" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="P/FCF" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" connectNulls />
            <Line type="monotone" dataKey="Avg P/E" stroke="#C0392B" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
