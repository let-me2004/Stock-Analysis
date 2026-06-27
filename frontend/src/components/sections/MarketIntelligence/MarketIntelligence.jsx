import React, { useState, useEffect } from 'react'
import './MarketIntelligence.css'

// ── Sentiment badge ─────────────────────────────────────────────────────────
function SentimentBadge({ sentiment }) {
  const map = {
    positive: { label: 'Bullish', cls: 'mi-sent-pos' },
    negative: { label: 'Bearish', cls: 'mi-sent-neg' },
    neutral:  { label: 'Neutral', cls: 'mi-sent-neu' },
  }
  const { label, cls } = map[sentiment] || map.neutral
  return <span className={`mi-sent-badge ${cls}`}>{label}</span>
}

// ── Sentiment summary bar ───────────────────────────────────────────────────
function SentimentBar({ posts }) {
  if (!posts.length) return null
  const pos = posts.filter(p => p.sentiment === 'positive').length
  const neg = posts.filter(p => p.sentiment === 'negative').length
  const neu = posts.length - pos - neg
  const pct = v => Math.round((v / posts.length) * 100)
  return (
    <div className="mi-sent-bar-wrap">
      <div className="mi-sent-bar">
        <div className="mi-sent-seg pos" style={{ width: `${pct(pos)}%` }} title={`Bullish ${pct(pos)}%`} />
        <div className="mi-sent-seg neu" style={{ width: `${pct(neu)}%` }} title={`Neutral ${pct(neu)}%`} />
        <div className="mi-sent-seg neg" style={{ width: `${pct(neg)}%` }} title={`Bearish ${pct(neg)}%`} />
      </div>
      <div className="mi-sent-labels">
        <span className="pos">{pct(pos)}% Bullish</span>
        <span className="neu">{pct(neu)}% Neutral</span>
        <span className="neg">{pct(neg)}% Bearish</span>
      </div>
    </div>
  )
}

// ── News card ───────────────────────────────────────────────────────────────
function NewsCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const preview = item.content?.slice(0, 280) || ''
  return (
    <div className="mi-card mi-news-card">
      <div className="mi-card-source">{item.source}</div>
      <div className="mi-card-content">
        {expanded ? item.content : preview}
        {item.content?.length > 280 && (
          <button className="mi-expand-btn" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Show less' : '...read more'}
          </button>
        )}
      </div>
      <a className="mi-card-link" href={item.url} target="_blank" rel="noreferrer">
        Open source ↗
      </a>
    </div>
  )
}

// ── Exa result card ─────────────────────────────────────────────────────────
function ExaCard({ item }) {
  return (
    <div className="mi-card mi-exa-card">
      <div className="mi-card-title">
        <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
      </div>
      {item.snippet && <div className="mi-card-content">{item.snippet.slice(0, 240)}</div>}
      <div className="mi-card-meta">
        <span>{new URL(item.url).hostname.replace('www.', '')}</span>
        {item.publishedAt && <span>{item.publishedAt.slice(0, 10)}</span>}
      </div>
    </div>
  )
}

// ── Reddit post card ────────────────────────────────────────────────────────
function RedditCard({ post }) {
  return (
    <div className="mi-card mi-social-card">
      <div className="mi-card-header">
        <span className="mi-social-source">{post.sub}</span>
        <SentimentBadge sentiment={post.sentiment} />
      </div>
      <a className="mi-card-title" href={post.url} target="_blank" rel="noreferrer">
        {post.title}
      </a>
      <div className="mi-card-meta">
        <span>↑ {post.score?.toLocaleString()}</span>
        <span>{post.comments} comments</span>
        <span>{post.createdAt?.slice(0, 10)}</span>
      </div>
    </div>
  )
}

// ── Twitter card ─────────────────────────────────────────────────────────────
function TwitterCard({ tweet }) {
  return (
    <div className="mi-card mi-social-card">
      <div className="mi-card-header">
        <span className="mi-social-source">@{tweet.user}</span>
        <SentimentBadge sentiment={tweet.sentiment} />
      </div>
      <div className="mi-card-content">{tweet.text}</div>
      <div className="mi-card-meta">
        <span>♥ {tweet.likes?.toLocaleString()}</span>
        <span>↻ {tweet.retweets?.toLocaleString()}</span>
        <a href={tweet.url} target="_blank" rel="noreferrer">View ↗</a>
      </div>
    </div>
  )
}

// ── YouTube video card ───────────────────────────────────────────────────────
function VideoCard({ video }) {
  return (
    <div className="mi-card mi-video-card">
      <a href={video.url} target="_blank" rel="noreferrer" className="mi-video-thumb-wrap">
        <img src={video.thumbnail} alt={video.title} className="mi-video-thumb" loading="lazy" />
        <span className="mi-video-duration">{video.duration}</span>
      </a>
      <div className="mi-video-info">
        <a href={video.url} target="_blank" rel="noreferrer" className="mi-video-title">
          {video.title}
        </a>
        <div className="mi-card-meta">
          <span>{video.channel}</span>
          {video.views > 0 && <span>{(video.views / 1000).toFixed(0)}K views</span>}
          {video.uploadDate && <span>{video.uploadDate}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Tab button ───────────────────────────────────────────────────────────────
function Tab({ id, label, count, active, onClick }) {
  return (
    <button
      className={`mi-tab ${active ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      {label}
      {count != null && <span className="mi-tab-count">{count}</span>}
    </button>
  )
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="mi-skeleton-grid">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mi-skeleton-card">
          <div className="mi-skel-line w60" />
          <div className="mi-skel-line w100" />
          <div className="mi-skel-line w80" />
          <div className="mi-skel-line w40" />
        </div>
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function MarketIntelligence({ ticker }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('news')

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    setData(null)

    fetch(`/api/stock/${ticker}/intelligence`)
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [ticker])

  const allSocial = data ? [...(data.reddit || []), ...(data.twitter || [])] : []

  return (
    <section className="mi-root" id="section-intelligence">
      <div className="mi-header">
        <div>
          <div className="mi-section-label">Market Intelligence</div>
          <h2 className="mi-section-title">News, Social &amp; Analyst Coverage</h2>
        </div>
        {data?._cached && <span className="mi-cached-badge">Cached</span>}
      </div>

      {/* Sentiment bar across all social */}
      {!loading && allSocial.length > 0 && (
        <div className="mi-sentiment-section">
          <div className="mi-subsection-label">Social Sentiment — {allSocial.length} signals</div>
          <SentimentBar posts={allSocial} />
        </div>
      )}

      {/* Tab nav */}
      <div className="mi-tabs">
        <Tab id="news"    label="News"    count={data?.exa?.length || data?.news?.length || null} active={activeTab === 'news'}    onClick={setActiveTab} />
        <Tab id="social"  label="Social"  count={allSocial.length || null}                         active={activeTab === 'social'}  onClick={setActiveTab} />
        <Tab id="youtube" label="Videos"  count={data?.youtube?.length || null}                    active={activeTab === 'youtube'} onClick={setActiveTab} />
      </div>

      {loading && <Skeleton />}
      {error && (
        <div className="mi-error">
          Failed to fetch intelligence data — {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="mi-panel">
          {/* News tab */}
          {activeTab === 'news' && (
            <div className="mi-grid">
              {data.exa?.length > 0
                ? data.exa.map((item, i) => <ExaCard key={i} item={item} />)
                : data.news?.length > 0
                  ? data.news.map((item, i) => <NewsCard key={i} item={item} />)
                  : <div className="mi-empty">No news results found for {ticker}</div>
              }
            </div>
          )}

          {/* Social tab */}
          {activeTab === 'social' && (
            <div className="mi-grid">
              {(data.reddit || []).map((post, i) => <RedditCard key={i} post={post} />)}
              {(data.twitter || []).map((tweet, i) => <TwitterCard key={i} tweet={tweet} />)}
              {allSocial.length === 0 && (
                <div className="mi-empty">
                  No social data — configure Twitter/Reddit via Agent-Reach to enable
                </div>
              )}
            </div>
          )}

          {/* YouTube tab */}
          {activeTab === 'youtube' && (
            <div className="mi-video-grid">
              {data.youtube?.length > 0
                ? data.youtube.map((v, i) => <VideoCard key={i} video={v} />)
                : <div className="mi-empty">No analyst videos found for {ticker}</div>
              }
            </div>
          )}
        </div>
      )}
    </section>
  )
}
