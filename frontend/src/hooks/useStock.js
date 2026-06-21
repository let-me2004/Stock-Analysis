import { useState, useEffect, useCallback, useRef } from 'react'

const cache = new Map()

export function useStock(ticker) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const fetchStock = useCallback(async (symbol) => {
    if (!symbol) return

    // Return cached immediately
    if (cache.has(symbol)) {
      setData(cache.get(symbol))
      setError(null)
      return
    }

    // Abort previous request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/stock/${encodeURIComponent(symbol)}/full`, {
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }

      const result = await res.json()
      cache.set(symbol, result)
      setData(result)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        setData(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setData(null)
    fetchStock(ticker)
  }, [ticker, fetchStock])

  return { data, loading, error, refetch: () => fetchStock(ticker) }
}

// For fetching peer details
export function usePeerDetails(ticker, peerOverrides) {
  const [peers, setPeers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ticker) return

    setLoading(true)
    const params = peerOverrides ? `?overrides=${encodeURIComponent(peerOverrides)}` : ''
    fetch(`/api/stock/${encodeURIComponent(ticker)}/peers-detail${params}`)
      .then((r) => r.json())
      .then((d) => { setPeers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [ticker, peerOverrides])

  return { peers, loading }
}

// For AI overview
export function useAIOverview(ticker, data) {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(null)

  useEffect(() => {
    if (!ticker || !data || fetchedRef.current === ticker) return

    setLoading(true)
    setOverview(null)
    setError(null)
    fetchedRef.current = ticker

    fetch('/api/ai/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, data }),
    })
      .then((r) => r.json())
      .then((d) => { setOverview(d); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [ticker, data])

  return { overview, loading, error }
}

// For SWOT analysis
export function useSWOT(ticker, data) {
  const [swot, setSWOT] = useState(null)
  const [loading, setLoading] = useState(false)
  const fetchedRef = useRef(null)

  useEffect(() => {
    if (!ticker || !data || fetchedRef.current === ticker) return

    setLoading(true)
    setSWOT(null)
    fetchedRef.current = ticker

    fetch('/api/ai/swot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, data }),
    })
      .then((r) => r.json())
      .then((d) => { setSWOT(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [ticker, data])

  return { swot, loading }
}
