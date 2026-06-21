import { useState, useEffect } from 'react'

const STORAGE_KEY = 'equityiq_watchlist'
const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'SPGI']

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_WATCHLIST
    } catch {
      return DEFAULT_WATCHLIST
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
    } catch {}
  }, [watchlist])

  const addTicker = (ticker) => {
    const t = ticker.trim().toUpperCase()
    if (!t || watchlist.includes(t)) return
    setWatchlist((prev) => [...prev, t])
  }

  const removeTicker = (ticker) => {
    setWatchlist((prev) => prev.filter((t) => t !== ticker))
  }

  const moveTicker = (ticker, direction) => {
    const idx = watchlist.indexOf(ticker)
    if (idx === -1) return
    const next = [...watchlist]
    const swap = direction === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setWatchlist(next)
  }

  return { watchlist, addTicker, removeTicker, moveTicker }
}
