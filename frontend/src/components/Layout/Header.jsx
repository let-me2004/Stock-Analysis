import { useState, useEffect, useRef } from 'react'

export default function Header({ onSearch, onExport, ticker }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isFocused, setIsFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim() || !isFocused) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, isFocused])

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = query.trim().toUpperCase()
    if (t) {
      onSearch(t)
      setQuery('')
      setIsFocused(false)
    }
  }

  const handleSelect = (symbol) => {
    onSearch(symbol)
    setQuery('')
    setIsFocused(false)
  }

  return (
    <header className="app-header">
      <div className="header-logo">
        <div className="header-logo-icon">EQ</div>
        <div>
          <div className="header-logo-text">EquityIQ</div>
          <div className="header-logo-sub">Institutional Research</div>
        </div>
      </div>

      <div className="header-search-wrap" ref={wrapperRef}>
        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          <input
            id="ticker-search"
            className="header-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search ticker  (e.g. AAPL, RELIANCE.NS, BP.L)"
            autoComplete="off"
            spellCheck={false}
          />
          {isFocused && (query.trim() !== '') && (
            <div className="search-dropdown">
              {isSearching ? (
                <div className="search-dropdown-item" style={{ color: 'var(--t-muted)' }}>Searching...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <div 
                    key={s.symbol} 
                    className="search-dropdown-item"
                    onMouseDown={() => handleSelect(s.symbol)}
                  >
                    <div className="search-dropdown-symbol">{s.symbol}</div>
                    <div className="search-dropdown-name">{s.name}</div>
                    <div className="search-dropdown-exchange">{s.exchange}</div>
                  </div>
                ))
              ) : (
                <div className="search-dropdown-item" style={{ color: 'var(--t-muted)' }}>No tickers found</div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="header-actions">
        {ticker && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
            {ticker}
          </span>
        )}
        <button className="btn btn-outline btn-sm" onClick={onExport} id="export-pdf-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export PDF
        </button>
      </div>
    </header>
  )
}
