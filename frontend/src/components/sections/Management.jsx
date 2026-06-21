import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { fmt } from '../../utils/formatters'

export default function Management({ data }) {
  const executives = data?.executives || []
  const insiders = data?.insiderTrading || []
  const institutional = data?.institutionalHolders || []

  // Insider trading summary
  const buys = insiders.filter((t) => t.transactionType?.toLowerCase().includes('purchase') || t.acquistionOrDisposition === 'A')
  const sells = insiders.filter((t) => t.transactionType?.toLowerCase().includes('sale') || t.acquistionOrDisposition === 'D')

  const insiderChartData = [
    { name: 'Buys', count: buys.length, color: '#1B7E4E' },
    { name: 'Sells', count: sells.length, color: '#C0392B' },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">3</div>
          Management &amp; Shareholder Structure
        </div>
      </div>
      <div className="card-body">

        {/* Executive Team */}
        {executives.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Key Executives
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th className="right">Year Born</th>
                  <th className="right">Compensation</th>
                </tr>
              </thead>
              <tbody>
                {executives.slice(0, 8).map((exec, i) => (
                  <tr key={i}>
                    <td className="label">{exec.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--t-secondary)' }}>{exec.title}</td>
                    <td className="right">{exec.yearBorn || '—'}</td>
                    <td className="right">{exec.pay ? fmt.money(exec.pay) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="two-col" style={{ gap: 24 }}>
          {/* Insider Trading */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Recent Insider Transactions (last 20)
            </div>
            {insiders.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div className="metric-item" style={{ flex: 1 }}>
                    <div className="metric-label">Buys</div>
                    <div className="metric-value good">{buys.length}</div>
                  </div>
                  <div className="metric-item" style={{ flex: 1 }}>
                    <div className="metric-label">Sells</div>
                    <div className="metric-value bad">{sells.length}</div>
                  </div>
                  <div className="metric-item" style={{ flex: 1 }}>
                    <div className="metric-label">Signal</div>
                    <div className={`metric-value ${buys.length > sells.length ? 'good' : buys.length < sells.length ? 'bad' : 'neutral'}`}>
                      {buys.length > sells.length ? 'Bullish' : buys.length < sells.length ? 'Bearish' : 'Neutral'}
                    </div>
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Insider</th>
                      <th>Type</th>
                      <th className="right">Shares</th>
                      <th className="right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insiders.slice(0, 6).map((t, i) => {
                      const isBuy = t.acquistionOrDisposition === 'A' || t.transactionType?.toLowerCase().includes('purchase')
                      return (
                        <tr key={i}>
                          <td className="label" style={{ fontSize: 11 }}>{t.reportingName?.split(' ').slice(-1)[0] || '—'}</td>
                          <td>
                            <span className={`badge ${isBuy ? 'badge-green' : 'badge-red'}`}>
                              {isBuy ? 'Buy' : 'Sell'}
                            </span>
                          </td>
                          <td className="right">{fmt.compact(t.securitiesTransacted)}</td>
                          <td className="right">{t.price ? fmt.price(t.price) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="empty-state">No recent insider data</div>
            )}
          </div>

          {/* Institutional Holders */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Top Institutional Holders
            </div>
            {institutional.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th className="right">Shares</th>
                    <th className="right">% of Float</th>
                  </tr>
                </thead>
                <tbody>
                  {institutional.slice(0, 8).map((h, i) => (
                    <tr key={i}>
                      <td className="label" style={{ fontSize: 11 }}>{h.holder}</td>
                      <td className="right">{fmt.compact(h.shares)}</td>
                      <td className="right">{h.dateReported ? fmt.pctRaw(h.percentageHeld * 100, 2) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">No institutional data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
