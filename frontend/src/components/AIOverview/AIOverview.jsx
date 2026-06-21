import { useAIOverview } from '../../hooks/useStock'

export default function AIOverview({ ticker, data }) {
  const { overview, loading, error } = useAIOverview(ticker, data)

  if (loading) {
    return (
      <div className="ai-overview">
        <div className="ai-header">
          <div className="ai-label">
            <div className="ai-label-dot" />
            AI Research Overview · Generating...
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'var(--c-gold)' }} />
          Analyzing {ticker} with Groq LLaMA 3.3 70B...
        </div>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="ai-overview">
        <div className="ai-label"><div className="ai-label-dot" />AI Research Overview</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>
          {error || 'AI overview unavailable.'}
        </div>
      </div>
    )
  }

  const convictionColor = { HIGH: '#4AE89A', MEDIUM: '#FFD166', LOW: '#FF7B72' }

  return (
    <div className="ai-overview">
      <div className="ai-header">
        <div className="ai-label">
          <div className="ai-label-dot" />
          AI Research Overview · Powered by Groq LLaMA 3.3 70B
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {overview.conviction && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: convictionColor[overview.conviction] || 'white',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {overview.conviction} CONVICTION
            </span>
          )}
          {overview.verdict && (
            <span className={`verdict-badge ${overview.verdict}`}>{overview.verdict}</span>
          )}
        </div>
      </div>

      {overview.oneliner && (
        <div className="ai-oneliner">"{overview.oneliner}"</div>
      )}

      <div className="ai-grid">
        {overview.bull_case?.length > 0 && (
          <div className="ai-block">
            <div className="ai-block-title">🟢 Bull Case</div>
            <ul className="ai-bullets">
              {overview.bull_case.map((b, i) => (
                <li key={i} className="ai-bullet">{b}</li>
              ))}
            </ul>
          </div>
        )}

        {overview.bear_case?.length > 0 && (
          <div className="ai-block">
            <div className="ai-block-title">🔴 Bear Case</div>
            <ul className="ai-bullets">
              {overview.bear_case.map((b, i) => (
                <li key={i} className="ai-bullet">{b}</li>
              ))}
            </ul>
          </div>
        )}

        {overview.key_metrics_summary && (
          <div className="ai-block">
            <div className="ai-block-title">📊 Financials</div>
            <p>{overview.key_metrics_summary}</p>
          </div>
        )}

        {overview.moat_assessment && (
          <div className="ai-block">
            <div className="ai-block-title">🏰 Moat</div>
            <p>{overview.moat_assessment}</p>
          </div>
        )}

        {overview.valuation_comment && (
          <div className="ai-block">
            <div className="ai-block-title">💰 Valuation</div>
            <p>{overview.valuation_comment}</p>
          </div>
        )}

        {overview.risks?.length > 0 && (
          <div className="ai-block">
            <div className="ai-block-title">⚠️ Key Risks</div>
            <ul className="ai-bullets">
              {overview.risks.map((r, i) => (
                <li key={i} className="ai-bullet">{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, fontSize: 10, color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
        AI-generated analysis. Not investment advice. Always conduct your own due diligence.
      </div>
    </div>
  )
}
