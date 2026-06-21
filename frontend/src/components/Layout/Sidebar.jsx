import { useState } from 'react'
import { useWatchlist } from '../../hooks/useWatchlist'

export default function Sidebar({ currentTicker, onSelectTicker }) {
  const { watchlist, addTicker, removeTicker } = useWatchlist()
  const [showAddForm, setShowAddForm] = useState(false)
  const [inputVal, setInputVal] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    const t = inputVal.trim().toUpperCase()
    if (t) {
      addTicker(t)
      onSelectTicker(t)
      setInputVal('')
      setShowAddForm(false)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Watchlist</div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {watchlist.map((ticker) => (
          <div
            key={ticker}
            className={`watchlist-item ${ticker === currentTicker ? 'active' : ''}`}
            onClick={() => onSelectTicker(ticker)}
            id={`watchlist-${ticker}`}
          >
            <div style={{ flex: 1 }}>
              <div className="watchlist-ticker">{ticker}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeTicker(ticker) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--t-placeholder)', fontSize: 14, padding: '0 2px',
                opacity: 0, transition: 'opacity 0.15s',
              }}
              className="remove-btn"
              title="Remove"
            >×</button>
          </div>
        ))}
      </div>

      {showAddForm ? (
        <form className="sidebar-add-form" onSubmit={handleAdd}>
          <input
            className="sidebar-add-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="TICKER"
            autoFocus
            id="watchlist-add-input"
          />
          <button type="submit" className="btn btn-primary btn-sm">+</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>✕</button>
        </form>
      ) : (
        <button className="sidebar-add-btn" onClick={() => setShowAddForm(true)} id="add-to-watchlist-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add ticker
        </button>
      )}

      <div className="sidebar-footer">
        <div>FMP · Groq AI</div>
        <div style={{ marginTop: 2 }}>250 req/day free</div>
      </div>

      <style>{`
        .watchlist-item:hover .remove-btn { opacity: 1 !important; }
      `}</style>
    </aside>
  )
}
