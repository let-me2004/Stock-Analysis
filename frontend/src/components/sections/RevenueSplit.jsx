import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { fmt } from '../../utils/formatters'

const COLORS = ['#1565C0', '#C9A84C', '#1B7E4E', '#5B21B6', '#C0392B', '#0E7490']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)', borderRadius: 8,
      padding: '8px 12px', boxShadow: 'var(--shadow-md)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--t-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name}: {fmt.money(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function RevenueSplit({ data }) {
  const income = data?.income || []

  // Build annual revenue trend (last 8 years)
  const revenueData = income
    .slice(0, 8)
    .reverse()
    .map((y) => ({
      year: fmt.year(y.date),
      Revenue: y.revenue,
      'Gross Profit': y.grossProfit,
      'Net Income': y.netIncome,
    }))

  // Revenue by segment (if available in reportedCurrency segments, else show COGS breakdown)
  const latest = income[0] || {}
  const segments = [
    { name: 'Gross Profit',  value: latest.grossProfit },
    { name: 'Operating Exp', value: latest.operatingExpenses },
    { name: 'R&D',           value: latest.researchAndDevelopmentExpenses },
    { name: 'SG&A',          value: latest.sellingGeneralAndAdministrativeExpenses },
    { name: 'Net Income',    value: latest.netIncome },
  ].filter((s) => s.value && s.value > 0)

  const total = segments.reduce((s, x) => s + x.value, 0)

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">2</div>
          Revenue &amp; P&amp;L Split
        </div>
        {latest.date && (
          <span className="badge badge-navy">FY {fmt.year(latest.date)}</span>
        )}
      </div>
      <div className="card-body">
        {/* Revenue Trend Chart */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Annual Revenue &amp; Profitability
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => fmt.compact(v)} tick={{ fontSize: 11, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Bar dataKey="Revenue" fill="#1565C0" radius={[3,3,0,0]} maxBarSize={40} />
              <Bar dataKey="Gross Profit" fill="#C9A84C" radius={[3,3,0,0]} maxBarSize={40} />
              <Bar dataKey="Net Income" fill="#1B7E4E" radius={[3,3,0,0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* P&L Breakdown */}
        {segments.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Latest Period P&amp;L Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {segments.map((seg, i) => {
                const pct = total > 0 ? (seg.value / latest.revenue) * 100 : 0
                return (
                  <div key={seg.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: 'var(--t-secondary)', fontWeight: 500 }}>{seg.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--t-primary)', fontWeight: 600 }}>
                        {fmt.money(seg.value)} &nbsp;
                        <span style={{ color: 'var(--t-muted)', fontWeight: 400 }}>({pct.toFixed(1)}% of rev)</span>
                      </span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(pct, 100)}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
