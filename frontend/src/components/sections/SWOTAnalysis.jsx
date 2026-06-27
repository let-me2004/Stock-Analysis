import { useSWOT } from '../../hooks/useStock'

export default function SWOTAnalysis({ ticker, data }) {
  const { swot, loading } = useSWOT(ticker, data)

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="section-number">5</div>
          SWOT Analysis
        </div>
        <span style={{ fontSize: 11, color: 'var(--t-muted)' }}>AI-generated · Groq LLaMA 3.3</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--t-muted)', fontSize: 13 }}>
            <div className="spinner" />
            Generating SWOT analysis...
          </div>
        ) : swot && (swot.strengths || swot.weaknesses) ? (
          <div className="swot-grid">
            {['strengths', 'weaknesses', 'opportunities', 'threats'].map((key) => (
              <div key={key} className={`swot-cell ${key}`}>
                <div className="swot-cell-header">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <ul className="swot-list">
                  {(swot[key] || []).map((item, i) => (
                    <li key={i} className="swot-item">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 40 }}>
            SWOT data unavailable. Try refreshing.
          </div>
        )}
      </div>
    </div>
  )
}
