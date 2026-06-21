import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import { fmt, calcCAGR } from '../../utils/formatters'

export default function HistoricalGrowth({ data }) {
  const income = data?.income || []

  if (income.length === 0) return null

  // Find the most recent years with valid data
  const latestRevYear = income.find(r => r.revenue > 0) || {}
  const latestEpsYear = income.find(r => Math.abs(r.epsdiluted || r.eps || 0) > 0) || {}

  // Calculate actual year spans from date differences, using whatever data is available
  function getYearsBetween(dateA, dateB) {
    if (!dateA || !dateB) return 0
    return Math.round(Math.abs(new Date(dateA).getFullYear() - new Date(dateB).getFullYear()))
  }

  // Find the oldest available data
  const oldest = income[income.length - 1] || {}

  // Get index for ~5Y and ~10Y ago
  const yr5Idx = Math.min(4, income.length - 1)
  const yr10Idx = Math.min(9, income.length - 1)
  
  const yr5 = income[yr5Idx] || {}
  const yr10 = income[yr10Idx] || {}

  // Revenue spans
  const rev5Span = getYearsBetween(latestRevYear.date, yr5.date) || yr5Idx
  const rev10Span = getYearsBetween(latestRevYear.date, yr10.date) || yr10Idx
  
  // EPS spans
  const eps5Span = getYearsBetween(latestEpsYear.date, yr5.date) || yr5Idx
  const eps10Span = getYearsBetween(latestEpsYear.date, yr10.date) || yr10Idx

  const rev5CAGR  = rev5Span >= 2 ? calcCAGR(yr5.revenue, latestRevYear.revenue, rev5Span) : null
  const rev10CAGR = rev10Span > rev5Span ? calcCAGR(yr10.revenue, latestRevYear.revenue, rev10Span) : null
  
  const eps5CAGR  = eps5Span >= 2 ? calcCAGR(Math.abs(yr5.epsdiluted || yr5.eps || 0), Math.abs(latestEpsYear.epsdiluted || latestEpsYear.eps || 0), eps5Span) : null
  const eps10CAGR = eps10Span > eps5Span ? calcCAGR(Math.abs(yr10.epsdiluted || yr10.eps || 0), Math.abs(latestEpsYear.epsdiluted || latestEpsYear.eps || 0), eps10Span) : null

  // YoY revenue growth chart
  const growthData = income.slice(0, 8).reverse().map((yr, i, arr) => {
    const prev = arr[i - 1]
    const revGrowth = prev && prev.revenue > 0 ? ((yr.revenue - prev.revenue) / Math.abs(prev.revenue)) * 100 : null
    const epsGrowth = prev && Math.abs(prev.epsdiluted || prev.eps || 0) > 0
      ? ((Math.abs(yr.epsdiluted || yr.eps || 0) - Math.abs(prev.epsdiluted || prev.eps || 0)) / Math.abs(prev.epsdiluted || prev.eps || 0)) * 100
      : null
    return {
      year: fmt.year(yr.date),
      'Revenue': yr.revenue,
      'Rev Growth %': revGrowth,
    }
  })

  const epsData = income.slice(0, 8).reverse().map((yr) => ({
    year: fmt.year(yr.date),
    EPS: parseFloat((yr.epsdiluted || yr.eps || 0).toFixed(2)),
  }))

  const cagrItems = [
    { label: `Rev CAGR ${rev5Span}Y`,  value: rev5CAGR,  target: 0.05, unit: '%' },
    { label: `Rev CAGR ${rev10Span}Y`, value: rev10CAGR, target: 0.05, unit: '%' },
    { label: `EPS CAGR ${eps5Span}Y`,  value: eps5CAGR,  target: 0.07, unit: '%' },
    { label: `EPS CAGR ${eps10Span}Y`, value: eps10CAGR, target: 0.07, unit: '%' },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">10</div>
          Historical Growth
        </div>
      </div>
      <div className="card-body">
        <p className="section-desc">
          Target: Revenue CAGR &gt;5% and EPS CAGR &gt;7% over 5 and 10 years.
        </p>

        {/* CAGR Summary */}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {cagrItems.map((c) => (
            <div className="metric-item" key={c.label}>
              <div className="metric-label">{c.label}</div>
              <div className={`metric-value ${c.value == null ? '' : c.value >= c.target ? 'good' : c.value >= 0 ? 'neutral' : 'bad'}`}>
                {c.value != null ? `${(c.value * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="metric-sublabel">Target: &gt;{(c.target * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>

        <div className="two-col" style={{ gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Annual Revenue
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => fmt.compact(v)} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, n) => [fmt.money(v), n]} />
                <Bar dataKey="Revenue" radius={[3,3,0,0]} maxBarSize={36}>
                  {growthData.map((entry, index) => (
                    <Cell key={index} fill={index === growthData.length - 1 ? '#1565C0' : '#93B8E8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Diluted EPS
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={epsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`$${v}`, 'Diluted EPS']} />
                <ReferenceLine y={0} stroke="var(--border-strong)" />
                <Bar dataKey="EPS" radius={[3,3,0,0]} maxBarSize={36}>
                  {epsData.map((entry, index) => (
                    <Cell key={index} fill={entry.EPS >= 0 ? (index === epsData.length - 1 ? '#1B7E4E' : '#6DB895') : '#C0392B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
