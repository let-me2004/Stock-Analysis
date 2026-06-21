import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
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

export default function CapitalIntensity({ data }) {
  const cashflow = data?.cashflow || []
  const income = data?.income || []

  const chartData = cashflow.slice(0, 8).reverse().map((cf, i) => {
    const inc = income[cashflow.length - 1 - i] || {}
    const capex = Math.abs(cf.capitalExpenditure || 0)
    const rev = inc.revenue || 1
    const ocf = cf.operatingCashFlow || 1
    return {
      year: fmt.year(cf.date),
      'CAPEX/Sales': (capex / rev) * 100,
      'CAPEX/OCF': (capex / Math.abs(ocf)) * 100,
    }
  })

  // TTM calculations
  const latestCF = cashflow[0] || {}
  const latestInc = income[0] || {}
  const capex = Math.abs(latestCF.capitalExpenditure || 0)
  const revenue = latestInc.revenue || 1
  const ocf = Math.abs(latestCF.operatingCashFlow || 1)

  const capexSales = capex / revenue
  const capexOCF = capex / ocf

  const intensityLabel = capexSales < 0.05 ? 'Low Intensity' : capexSales < 0.10 ? 'Medium Intensity' : 'High Intensity'
  const intensityClass = capexSales < 0.05 ? 'badge-green' : capexSales < 0.10 ? 'badge-amber' : 'badge-red'

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">6</div>
          Capital Intensity
        </div>
        <span className={`badge ${intensityClass}`}>{intensityLabel}</span>
      </div>
      <div className="card-body">
        <p className="section-desc">
          Capital intensity measures how much capital a company requires to sustain growth. 
          Target: CAPEX/Sales &lt;5% and CAPEX/OCF &lt;15%.
        </p>

        <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 24 }}>
          <div className="metric-item">
            <div className="metric-label">CAPEX/Sales (TTM)</div>
            <div className={`metric-value ${metricClass(capexSales, 0.05, 0.10, false)}`}>
              {fmt.pct(capexSales)}
            </div>
            <div className="metric-sublabel">Target: &lt;5%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">CAPEX/OCF (TTM)</div>
            <div className={`metric-value ${metricClass(capexOCF, 0.15, 0.30, false)}`}>
              {fmt.pct(capexOCF)}
            </div>
            <div className="metric-sublabel">Target: &lt;15%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">CAPEX (TTM)</div>
            <div className="metric-value">{fmt.money(capex)}</div>
            <div className="metric-sublabel">Absolute spend</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          CAPEX Ratio Trend
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <ReferenceLine y={5} stroke="var(--c-green)" strokeDasharray="4 4" strokeWidth={1} label={{ value: '5%', fill: 'var(--c-green)', fontSize: 9 }} />
            <ReferenceLine y={15} stroke="var(--c-amber)" strokeDasharray="4 4" strokeWidth={1} label={{ value: '15%', fill: 'var(--c-amber)', fontSize: 9 }} />
            <Line type="monotone" dataKey="CAPEX/Sales" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="CAPEX/OCF" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
