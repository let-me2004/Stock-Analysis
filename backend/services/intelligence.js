import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ── Jina Reader — scrape any URL as clean markdown (zero-config, free) ─────
async function jinaFetch(url) {
  try {
    const { stdout } = await execAsync(
      `curl -s -H "Accept: text/plain" "https://r.jina.ai/${encodeURIComponent(url)}"`,
      { timeout: 15000 }
    )
    return stdout.trim()
  } catch {
    return null
  }
}

// ── Exa semantic search via agent-reach CLI ──────────────────────────────────
async function exaSearch(query, numResults = 5) {
  try {
    const venvPython = process.env.AGENT_REACH_PYTHON ||
      (process.platform === 'win32'
        ? `${process.env.USERPROFILE}\\.agent-reach-venv\\Scripts\\python.exe`
        : `/opt/venv/bin/python`)

    const cmd = `"${venvPython}" -m agent_reach search --query "${query.replace(/"/g, '\\"')}" --num ${numResults} --format json`
    const { stdout } = await execAsync(cmd, { timeout: 20000 })
    return JSON.parse(stdout)
  } catch {
    return []
  }
}

export { getFinancialNews } from './yf.js'

// ── Exa semantic search for stock-related content ───────────────────────────
export async function getExaResults(ticker) {
  const companyName = ticker.replace(/\.NS$|\.BO$|\.L$|\.TO$/, '')
  const query = `${companyName} stock analysis financial results 2024 2025`

  const raw = await exaSearch(query, 6)

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(r => ({
      title: r.title || r.url,
      url: r.url,
      snippet: r.text || r.snippet || '',
      score: r.score || 0,
      publishedAt: r.publishedDate || null,
    }))
  }

  // Fallback: return structured empty result if Exa not yet configured
  return []
}

// ── Reddit via Jina (public Reddit JSON API — no auth needed for public posts) ─
export async function getRedditPosts(ticker) {
  const clean = ticker.replace(/\.NS$|\.BO$|\.L$|\.TO$/, '')
  const subs = ['investing', 'stocks', 'IndiaInvestments', 'wallstreetbets']
  const results = []

  for (const sub of subs.slice(0, 2)) {
    try {
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(clean)}&sort=new&limit=5&restrict_sr=1`
      const { stdout } = await execAsync(
        `curl -s -H "User-Agent: InvegaAnalytics/1.0" "${url}"`,
        { timeout: 10000 }
      )
      const data = JSON.parse(stdout)
      const posts = data?.data?.children || []
      posts.forEach(p => {
        const post = p.data
        results.push({
          sub: `/r/${sub}`,
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          score: post.score,
          comments: post.num_comments,
          sentiment: scoreSentiment(post.title + ' ' + (post.selftext || '')),
          createdAt: new Date(post.created_utc * 1000).toISOString(),
        })
      })
    } catch { /* subreddit may be unavailable */ }
  }

  return results.slice(0, 8)
}

// ── Twitter/X via agent-reach (requires configured cookies) ─────────────────
export async function getTwitterPosts(ticker) {
  try {
    const venvPython = process.env.AGENT_REACH_PYTHON ||
      (process.platform === 'win32'
        ? `${process.env.USERPROFILE}\\.agent-reach-venv\\Scripts\\python.exe`
        : `/opt/venv/bin/python`)

    const clean = ticker.replace(/\.NS$|\.BO$|\.L$|\.TO$/, '')
    const query = `$${clean} OR #${clean} stock -filter:retweets`
    const cmd = `"${venvPython}" -m agent_reach twitter search --query "${query}" --num 10 --format json`
    const { stdout } = await execAsync(cmd, { timeout: 15000 })
    const tweets = JSON.parse(stdout)

    return tweets.map(t => ({
      text: t.text || t.full_text || '',
      user: t.user?.screen_name || t.username || 'unknown',
      likes: t.favorite_count || t.likes || 0,
      retweets: t.retweet_count || t.retweets || 0,
      sentiment: scoreSentiment(t.text || ''),
      url: t.url || `https://twitter.com/i/status/${t.id}`,
      createdAt: t.created_at || new Date().toISOString(),
    }))
  } catch {
    return [] // Twitter not configured — return empty gracefully
  }
}

// ── YouTube analyst videos via yt-dlp ───────────────────────────────────────
export async function getYoutubeVideos(ticker) {
  try {
    const clean = ticker.replace(/\.NS$|\.BO$|\.L$|\.TO$/, '')
    const query = `${clean} stock analysis 2025`
    const cmd = `yt-dlp "ytsearch5:${query}" --print "%(id)s|||%(title)s|||%(channel)s|||%(upload_date)s|||%(duration_string)s|||%(view_count)s" --no-download --no-warnings`
    const { stdout } = await execAsync(cmd, { timeout: 20000 })
    const lines = stdout.trim().split('\n').filter(Boolean)

    return lines.map(line => {
      const [id, title, channel, date, duration, views] = line.split('|||')
      return {
        id,
        title,
        channel,
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
        uploadDate: date ? `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}` : null,
        duration,
        views: parseInt(views) || 0,
      }
    })
  } catch {
    return []
  }
}

// ── Naive sentiment scorer ───────────────────────────────────────────────────
function scoreSentiment(text) {
  const t = text.toLowerCase()
  const pos = ['buy', 'bullish', 'growth', 'beat', 'strong', 'surge', 'up', 'profit', 'gain', 'positive', 'upgrade', 'outperform']
  const neg = ['sell', 'bearish', 'decline', 'miss', 'weak', 'crash', 'down', 'loss', 'negative', 'downgrade', 'underperform', 'cut']
  const posScore = pos.filter(w => t.includes(w)).length
  const negScore = neg.filter(w => t.includes(w)).length
  if (posScore > negScore) return 'positive'
  if (negScore > posScore) return 'negative'
  return 'neutral'
}

// ── Main intelligence aggregator ─────────────────────────────────────────────
export async function getFullIntelligence(ticker) {
  const [news, exa, reddit, twitter, youtube] = await Promise.allSettled([
    getFinancialNews(ticker),
    getExaResults(ticker),
    getRedditPosts(ticker),
    getTwitterPosts(ticker),
    getYoutubeVideos(ticker),
  ])

  return {
    ticker,
    fetchedAt: new Date().toISOString(),
    news: news.status === 'fulfilled' ? news.value : [],
    exa: exa.status === 'fulfilled' ? exa.value : [],
    reddit: reddit.status === 'fulfilled' ? reddit.value : [],
    twitter: twitter.status === 'fulfilled' ? twitter.value : [],
    youtube: youtube.status === 'fulfilled' ? youtube.value : [],
  }
}
