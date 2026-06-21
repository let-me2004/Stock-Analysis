import { fmt } from '../../utils/formatters'

export default function BusinessProfile({ data }) {
  const p = data?.profile?.[0] || {}
  const q = data?.quote?.[0] || {}

  const infoItems = [
    { label: 'CEO',         value: p.ceo },
    { label: 'Founded',     value: p.ipoDate ? fmt.year(p.ipoDate) + ' (IPO)' : null },
    { label: 'Headquarters', value: p.city && p.country ? `${p.city}, ${p.country}` : p.country },
    { label: 'Employees',   value: p.fullTimeEmployees ? fmt.compact(p.fullTimeEmployees) : null },
    { label: 'Exchange',    value: p.exchangeShortName },
    { label: 'Currency',    value: p.currency },
    { label: 'Sector',      value: p.sector },
    { label: 'Industry',    value: p.industry },
    { label: 'Mkt Cap',     value: fmt.money(q.marketCap || p.mktCap) },
    { label: 'Shares Out.', value: fmt.compact(p.sharesOutstanding) },
  ].filter((i) => i.value)

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">1</div>
          Business Profile
        </div>
        {p.sector && <span className="badge badge-blue">{p.sector}</span>}
      </div>
      <div className="card-body">
        {p.description && (
          <p style={{ fontSize: 13, color: 'var(--t-secondary)', lineHeight: 1.65, marginBottom: 'var(--sp-5)' }}>
            {p.description.length > 700
              ? p.description.slice(0, 700) + '…'
              : p.description}
          </p>
        )}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {infoItems.map((item) => (
            <div className="metric-item" key={item.label}>
              <div className="metric-label">{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-primary)', marginTop: 2 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
