import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { fmt, metricClass } from '../../utils/formatters'

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name}: {p.value?.toFixed(1)}%
        </div>
      ))}
    </div>
  )
}

export default function Profitability({ data }) {
  const ratios = data?.ratios || []
  const cashflow = data?.cashflow || []
  const income = data?.income || []
  const rtTTM = data?.ratiosTTM?.[0] || {}
  const kmTTM = data?.keyMetricsTTM?.[0] || {}

  const chartData = ratios.slice(0, 8).reverse().map((r, i) => {
    const cf = cashflow[ratios.length - 1 - i] || {}
    const inc = income[ratios.length - 1 - i] || {}
    const fcfMargin = inc.revenue > 0 ? (cf.freeCashFlow / inc.revenue) * 100 : null
    return {
      year: fmt.year(r.date),
      'Gross Margin': r.grossProfitMargin != null ? r.grossProfitMargin * 100 : null,
      'Op. Margin':   r.operatingProfitMargin != null ? r.operatingProfitMargin * 100 : null,
      'Net Margin':   r.netProfitMargin != null ? r.netProfitMargin * 100 : null,
      'FCF Margin':   fcfMargin,
    }
  })

  const latestInc = income[0] || {}
  const latestCF = cashflow[0] || {}
  
  const fallbackEbitda = latestInc.ebitda != null 
    ? latestInc.ebitda 
    : (latestInc.operatingIncome != null ? latestInc.operatingIncome + Math.abs(latestCF.depreciationAndAmortization || 0) : null)
    
  const fallbackEbitdaMargin = (latestInc.revenue && fallbackEbitda != null) ? (fallbackEbitda / latestInc.revenue) : null
  const fallbackFcfMargin = (latestInc.revenue && latestCF.freeCashFlow != null) ? (latestCF.freeCashFlow / latestInc.revenue) : null

  const ebitdaMargin = (rtTTM.ebitdaMarginTTM != null && !isNaN(rtTTM.ebitdaMarginTTM)) ? rtTTM.ebitdaMarginTTM : fallbackEbitdaMargin
  const fcfMargin = (kmTTM.freeCashFlowMargin != null && !isNaN(kmTTM.freeCashFlowMargin)) ? kmTTM.freeCashFlowMargin : ((kmTTM.freeCashFlowMarginTTM != null && !isNaN(kmTTM.freeCashFlowMarginTTM)) ? kmTTM.freeCashFlowMarginTTM : fallbackFcfMargin)

  const margins = [
    { label: 'Gross Margin (TTM)',     value: rtTTM.grossProfitMarginTTM,      good: 0.4,  bad: 0.2 },
    { label: 'Operating Margin (TTM)', value: rtTTM.operatingProfitMarginTTM,  good: 0.2,  bad: 0.05 },
    { label: 'Net Margin (TTM)',       value: rtTTM.netProfitMarginTTM,        good: 0.15, bad: 0.03 },
    { label: 'EBITDA Margin (TTM)',    value: ebitdaMargin,  good: 0.25, bad: 0.1 },
    { label: 'FCF Margin',             value: fcfMargin, good: 0.15, bad: 0.05 },
    { label: 'ROE (TTM)',              value: rtTTM.returnOnEquityTTM,          good: 0.15, bad: 0.08 },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">9</div>
          Profitability
        </div>
        {rtTTM.grossProfitMarginTTM != null && (
          <span className={`badge ${metricClass(rtTTM.grossProfitMarginTTM, 0.4, 0.2) === 'good' ? 'badge-green' : metricClass(rtTTM.grossProfitMarginTTM, 0.4, 0.2) === 'bad' ? 'badge-red' : 'badge-amber'}`}>
            GM: {fmt.pct(rtTTM.grossProfitMarginTTM)}
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="metrics-grid" style={{ marginBottom: 24 }}>
          {margins.map((m) => (
            <div className="metric-item" key={m.label}>
              <div className="metric-label">{m.label}</div>
              <div className={`metric-value ${metricClass(m.value, m.good, m.bad)}`}>
                {fmt.pct(m.value)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          Margin Trend (%)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 12 }} />
            <Line type="monotone" dataKey="Gross Margin" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Op. Margin"   stroke="#C9A84C" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Net Margin"   stroke="#1B7E4E" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="FCF Margin"   stroke="#5B21B6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
