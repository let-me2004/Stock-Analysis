import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts'
import { fmt, metricClass } from '../../utils/formatters'

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name}: {typeof p.value === 'number' && p.value < 2 ? fmt.pct(p.value) : fmt.money(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function CapitalAllocation({ data }) {
  const cashflow = data?.cashflow || []
  const keyMetrics = data?.keyMetrics || []
  const kmTTM = data?.keyMetricsTTM?.[0] || {}

  // FCF Allocation chart
  const fcfData = cashflow.slice(0, 6).reverse().map((cf, i) => {
    const km = keyMetrics[cashflow.length - 1 - i] || {}
    return {
      year: fmt.year(cf.date),
      'Dividends': Math.abs(cf.dividendsPaid || 0),
      'Buybacks': Math.abs(cf.commonStockRepurchased || 0),
      'Capex': Math.abs(cf.capitalExpenditure || 0),
      'Acquisitions': Math.abs(cf.acquisitionsNet || 0),
    }
  })

  // ROIC trend
  const roicData = keyMetrics.slice(0, 8).reverse().map((km) => ({
    year: fmt.year(km.date),
    ROIC: km.roic ? km.roic * 100 : null,
  }))

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">7</div>
          Capital Allocation
        </div>
        {kmTTM.roicTTM != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--t-muted)' }}>ROIC (TTM)</span>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: kmTTM.roicTTM >= 0.15 ? 'var(--c-green)' : kmTTM.roicTTM >= 0.08 ? 'var(--c-amber)' : 'var(--c-red)' }}>
              {fmt.pct(kmTTM.roicTTM)}
            </span>
          </div>
        )}
      </div>
      <div className="card-body">
        <p className="section-desc">
          Capital allocation shows how a company deploys its free cash flow. 
          Companies with ROIC &gt;15% are creating shareholder value.
        </p>

        <div className="metrics-grid" style={{ marginBottom: 24 }}>
          <div className="metric-item">
            <div className="metric-label">ROIC (TTM)</div>
            <div className={`metric-value ${metricClass(kmTTM.roicTTM, 0.15, 0.08)}`}>{fmt.pct(kmTTM.roicTTM)}</div>
            <div className="metric-sublabel">Target: &gt;15%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">ROCE (TTM)</div>
            <div className={`metric-value ${metricClass(kmTTM.returnOnCapitalEmployedTTM, 0.15, 0.08)}`}>{fmt.pct(kmTTM.returnOnCapitalEmployedTTM)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">ROE (TTM)</div>
            <div className={`metric-value ${metricClass(kmTTM.roeTTM, 0.15, 0.08)}`}>{fmt.pct(kmTTM.roeTTM)}</div>
            <div className="metric-sublabel">Return on Equity</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">FCF / Share</div>
            <div className="metric-value">{fmt.price(kmTTM.freeCashFlowPerShareTTM)}</div>
          </div>
        </div>

        <div className="two-col" style={{ gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              FCF Deployment (Annual)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fcfData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => fmt.compact(v)} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TTip />} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Bar dataKey="Dividends" fill="#1565C0" stackId="a" maxBarSize={36} />
                <Bar dataKey="Buybacks" fill="#C9A84C" stackId="a" maxBarSize={36} />
                <Bar dataKey="Capex" fill="#1B7E4E" stackId="a" maxBarSize={36} />
                <Bar dataKey="Acquisitions" fill="#5B21B6" stackId="a" maxBarSize={36} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              ROIC Trend
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={roicData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v?.toFixed(1)}%`, 'ROIC']} />
                <Line type="monotone" dataKey="ROIC" stroke="#1B7E4E" strokeWidth={2.5} dot={{ r: 4, fill: '#1B7E4E' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
