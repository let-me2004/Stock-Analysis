import fetch from 'node-fetch'

const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function buildPrompt(ticker, data) {
  const p = data.profile?.[0] || {}
  const q = data.quote?.[0] || {}
  const income = data.income?.[0] || {}
  const balance = data.balance?.[0] || {}
  const cf = data.cashflow?.[0] || {}
  const km = data.keyMetricsTTM?.[0] || {}
  const rt = data.ratiosTTM?.[0] || {}

  const pct = (v) => (v != null ? `${(v * 100).toFixed(1)}%` : 'N/A')
  const num = (v) => (v != null ? v.toFixed(2) : 'N/A')

  return `You are a senior equity research analyst at a top-tier investment bank. Analyze ${ticker} (${p.companyName || ticker}) and provide a structured institutional investment overview.

COMPANY DATA:
- Sector: ${p.sector || 'N/A'} | Industry: ${p.industry || 'N/A'}
- Market Cap: $${p.mktCap ? (p.mktCap / 1e9).toFixed(1) + 'B' : 'N/A'}
- Current Price: $${q.price || 'N/A'} | 52W Range: $${q.yearLow || 'N/A'} - $${q.yearHigh || 'N/A'}
- Revenue (TTM): $${income.revenue ? (income.revenue / 1e9).toFixed(1) + 'B' : 'N/A'}
- Gross Margin: ${pct(rt.grossProfitMarginTTM)}
- Operating Margin: ${pct(rt.operatingProfitMarginTTM)}
- Net Margin: ${pct(rt.netProfitMarginTTM)}
- FCF Margin: ${pct(km.freeCashFlowMarginTTM || (km.freeCashFlowPerShareTTM && km.revenuePerShareTTM ? km.freeCashFlowPerShareTTM / km.revenuePerShareTTM : null))}
- ROIC: ${pct(km.roicTTM)}
- P/E (TTM): ${num(rt.peRatioTTM)}
- EV/EBITDA: ${num(rt.enterpriseValueMultipleTTM)}
- Debt/Equity: ${num(rt.debtEquityRatioTTM)}
- Beta: ${num(p.beta)}
- Description: ${p.description?.slice(0, 400) || 'N/A'}

Respond in this exact JSON format:
{
  "verdict": "BUY" | "HOLD" | "SELL",
  "conviction": "HIGH" | "MEDIUM" | "LOW",
  "oneliner": "One crisp sentence investment thesis (max 20 words)",
  "bull_case": ["bullet 1", "bullet 2", "bullet 3"],
  "bear_case": ["bullet 1", "bullet 2"],
  "key_metrics_summary": "2-3 sentence data-driven profitability and growth commentary",
  "moat_assessment": "1-2 sentence competitive moat assessment",
  "valuation_comment": "1-2 sentence valuation commentary vs peers and history",
  "risks": ["risk 1", "risk 2", "risk 3"]
}`
}

export async function generateAIOverview(ticker, data) {
  const prompt = buildPrompt(ticker, data)

  const response = await fetch(GROQ_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an institutional equity research analyst. Always respond with valid JSON only. No markdown, no prose outside the JSON structure.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1200,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error ${response.status}: ${err}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content

  try {
    return JSON.parse(content)
  } catch {
    return { error: 'Failed to parse AI response', raw: content }
  }
}

export async function generateSWOT(ticker, data) {
  const p = data.profile?.[0] || {}
  const rt = data.ratiosTTM?.[0] || {}
  const km = data.keyMetricsTTM?.[0] || {}

  const prompt = `As a senior equity analyst, provide a SWOT analysis for ${ticker} (${p.companyName || ticker}), a ${p.sector} company.
Key financials: Gross Margin ${rt.grossProfitMarginTTM != null ? (rt.grossProfitMarginTTM * 100).toFixed(1) + '%' : 'N/A'}, ROIC ${km.roicTTM != null ? (km.roicTTM * 100).toFixed(1) + '%' : 'N/A'}, P/E ${rt.peRatioTTM?.toFixed(1) || 'N/A'}.
Description: ${p.description?.slice(0, 300) || 'N/A'}

Respond in this exact JSON format only:
{
  "strengths": ["point 1", "point 2", "point 3", "point 4"],
  "weaknesses": ["point 1", "point 2", "point 3"],
  "opportunities": ["point 1", "point 2", "point 3"],
  "threats": ["point 1", "point 2", "point 3"]
}`

  const response = await fetch(GROQ_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an institutional equity analyst. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) throw new Error(`Groq SWOT error ${response.status}`)

  const result = await response.json()
  return JSON.parse(result.choices?.[0]?.message?.content || '{}')
}
