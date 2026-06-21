import { fmt, changeClass } from '../../utils/formatters'

export default function StockHeader({ data }) {
  const p = data?.profile?.[0] || {}
  const q = data?.quote?.[0] || {}
  const km = data?.keyMetricsTTM?.[0] || {}
  const rt = data?.ratiosTTM?.[0] || {}

  const change = q.changePercentage ?? p.changePercentage ?? 0
  const isUp = change >= 0

  const stats = [
    { label: 'Market Cap',    value: fmt.money(q.marketCap || p.marketCap) },
    { label: 'Volume',        value: fmt.compact(q.volume || p.volume) },
    { label: '52W High',      value: fmt.price(q.yearHigh || p.range?.split('-')[1]) },
    { label: '52W Low',       value: fmt.price(q.yearLow || p.range?.split('-')[0]) },
    { label: 'P/E (TTM)',     value: fmt.multiple(rt.priceToEarningsRatioTTM) },
    { label: 'EV/EBITDA',     value: fmt.multiple(rt.enterpriseValueMultipleTTM) },
    { label: 'Div Yield',     value: fmt.pct(rt.dividendYieldTTM) },
    { label: 'Beta',          value: fmt.number(p.beta, 2) },
    { label: 'Avg Volume',    value: fmt.compact(q.avgVolume || p.averageVolume) },
    { label: 'Float',         value: fmt.compact(p.floatShares) },
  ]

  return (
    <div className="stock-header">
      <div className="stock-name-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="stock-company-name">{p.companyName || q.name || '—'}</h1>
            <span className="stock-ticker-badge">{p.symbol || '—'}</span>
          </div>
          <div className="stock-meta" style={{ marginTop: 6 }}>
            <span className="stock-meta-item">{p.exchangeShortName} · {p.currency}</span>
            <span className="stock-meta-item">·</span>
            <span className="stock-meta-item">{p.sector}</span>
            <span className="stock-meta-item">·</span>
            <span className="stock-meta-item">{p.industry}</span>
            {p.fullTimeEmployees && (
              <>
                <span className="stock-meta-item">·</span>
                <span className="stock-meta-item">{fmt.compact(p.fullTimeEmployees)} employees</span>
              </>
            )}
            {p.website && (
              <>
                <span className="stock-meta-item">·</span>
                <a href={p.website} target="_blank" rel="noreferrer" className="stock-meta-item"
                  style={{ color: 'var(--c-blue)' }}>
                  {p.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </>
            )}
          </div>
        </div>

        <div className="stock-price-block">
          <div className="stock-price">{fmt.price(q.price || p.price)}</div>
          <div className={`stock-change ${isUp ? 'up' : 'down'}`}>
            {isUp ? '▲' : '▼'} {fmt.price(Math.abs((q.change ?? p.change) || 0))} ({fmt.change(change)})
          </div>
          <div style={{ fontSize: 11, color: 'var(--t-muted)', marginTop: 4, textAlign: 'right' }}>
            {q.timestamp ? new Date(q.timestamp * 1000).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Delayed quote'}
          </div>
        </div>
      </div>

      <div className="stock-stats-row">
        {stats.map((s) => (
          <div className="stock-stat" key={s.label}>
            <div className="stock-stat-label">{s.label}</div>
            <div className="stock-stat-value">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
