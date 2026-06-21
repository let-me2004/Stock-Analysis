import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, BarChart, Bar } from 'recharts'
import { fmt, metricClass } from '../../utils/formatters'

export default function BalanceSheet({ data }) {
  const balance = data?.balance || []
  const income = data?.income || []
  const cashflow = data?.cashflow || []
  const kmTTM = data?.keyMetricsTTM?.[0] || {}
  const rtTTM = data?.ratiosTTM?.[0] || {}

  const latest = balance[0] || {}
  const latestInc = income[0] || {}
  const latestCF = cashflow[0] || {}

  // Interest coverage = EBIT / Interest expense
  const ebit = latestInc.operatingIncome || 0
  const interest = Math.abs(latestInc.interestExpense || 1)
  const interestCoverage = interest > 0 ? ebit / interest : null

  // Net Debt / FCF
  const netDebt = (latest.totalDebt || 0) - (latest.cashAndCashEquivalents || 0)
  const fcf = latestCF.freeCashFlow || latestCF.operatingCashFlow || 1
  const netDebtFCF = fcf > 0 ? netDebt / fcf : null

  // Trend data
  const trendData = balance.slice(0, 6).reverse().map((b, i) => {
    const cf = cashflow[balance.length - 1 - i] || {}
    const inc = income[balance.length - 1 - i] || {}
    const nd = (b.totalDebt || 0) - (b.cashAndCashEquivalents || 0)
    const fcfVal = cf.freeCashFlow || 0
    return {
      year: fmt.year(b.date),
      'Total Debt': b.totalDebt,
      'Net Debt': nd,
      'Cash': b.cashAndCashEquivalents,
    }
  })

  const icClass = interestCoverage != null
    ? metricClass(interestCoverage, 10, 3)
    : ''
  const ndFCFClass = netDebtFCF != null
    ? metricClass(netDebtFCF, 4, 8, false)
    : ''

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">8</div>
          Balance Sheet Health
        </div>
        <span className={`badge ${icClass === 'good' && ndFCFClass === 'good' ? 'badge-green' : icClass === 'bad' || ndFCFClass === 'bad' ? 'badge-red' : 'badge-amber'}`}>
          {icClass === 'good' && ndFCFClass === 'good' ? 'Healthy' : icClass === 'bad' || ndFCFClass === 'bad' ? 'Stressed' : 'Moderate'}
        </span>
      </div>
      <div className="card-body">
        <p className="section-desc">
          Interest Coverage &gt;10x and Net Debt/FCF &lt;4x indicate a financially healthy balance sheet.
        </p>

        <div className="metrics-grid" style={{ marginBottom: 24 }}>
          <div className="metric-item">
            <div className="metric-label">Interest Coverage</div>
            <div className={`metric-value ${icClass}`}>{fmt.multiple(interestCoverage)}</div>
            <div className="metric-sublabel">Target: &gt;10x</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Net Debt / FCF</div>
            <div className={`metric-value ${ndFCFClass}`}>{fmt.multiple(netDebtFCF)}</div>
            <div className="metric-sublabel">Target: &lt;4x</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Total Debt</div>
            <div className="metric-value">{fmt.money(latest.totalDebt)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Cash &amp; Equivalents</div>
            <div className="metric-value good">{fmt.money(latest.cashAndCashEquivalents)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Net Debt</div>
            <div className={`metric-value ${netDebt < 0 ? 'good' : ''}`}>{fmt.money(netDebt)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Debt / Equity</div>
            <div className={`metric-value ${metricClass(rtTTM.debtEquityRatioTTM, 1, 3, false)}`}>
              {fmt.multiple(rtTTM.debtEquityRatioTTM)}
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Current Ratio</div>
            <div className={`metric-value ${metricClass(kmTTM.currentRatioTTM, 1.5, 1)}`}>
              {fmt.multiple(kmTTM.currentRatioTTM)}
            </div>
            <div className="metric-sublabel">Target: &gt;1.5x</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Book Value/Share</div>
            <div className="metric-value">{fmt.price(kmTTM.bookValuePerShareTTM)}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          Debt &amp; Cash Trend
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={trendData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => fmt.compact(v)} tick={{ fontSize: 10, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [fmt.money(v), n]} />
            <Bar dataKey="Total Debt" fill="#C0392B" radius={[3,3,0,0]} maxBarSize={30} opacity={0.7} />
            <Bar dataKey="Cash" fill="#1B7E4E" radius={[3,3,0,0]} maxBarSize={30} />
            <Bar dataKey="Net Debt" fill="#C9A84C" radius={[3,3,0,0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
