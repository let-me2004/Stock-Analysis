import YahooFinance from 'yahoo-finance2'
import * as cache from '../cache.js'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

if (process.env.PROXY_URL) {
  try {
    let proxyUrl = process.env.PROXY_URL.trim().replace(/^["']|["']$/g, '')
    const { ProxyAgent } = await import('undici')
    if (!yahooFinance._opts.fetchOptions) {
      yahooFinance._opts.fetchOptions = {}
    }
    yahooFinance._opts.fetchOptions.dispatcher = new ProxyAgent(proxyUrl)
    console.log('Successfully configured yahoo-finance2 proxy')
  } catch (error) {
    console.error('Failed to configure proxy:', error.message)
  }
}

// Helper to fetch fundamentalsTimeSeries for a specific module
async function getTimeSeries(ticker, module) {
  try {
    const end = new Date()
    const start = new Date()
    start.setFullYear(end.getFullYear() - 6)
    return await yahooFinance.fundamentalsTimeSeries(ticker, {
      period1: start.toISOString().split('T')[0],
      period2: end.toISOString().split('T')[0],
      type: 'annual',
      module
    })
  } catch (e) {
    console.error(`YF fundamentalsTimeSeries (${module}) error:`, e.message)
    return []
  }
}

export async function getFullAnalysis(ticker) {
  const cacheKey = `yf_full_${ticker}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  // Fetch quoteSummary for profile, price, TTM ratios, and analyst data
  const qsModules = [
    'summaryProfile', 'price', 'financialData',
    'defaultKeyStatistics', 'summaryDetail',
    'recommendationTrend', 'earningsTrend'
  ]
  
  let summary = {}
  try {
    summary = await yahooFinance.quoteSummary(ticker, { modules: qsModules })
  } catch (e) {
    console.error("YF quoteSummary error:", e)
  }

  // Fetch fundamentalsTimeSeries for complete historical financials
  const [finData, bsData, cfData, hist] = await Promise.all([
    getTimeSeries(ticker, 'financials'),
    getTimeSeries(ticker, 'balance-sheet'),
    getTimeSeries(ticker, 'cash-flow'),
    (async () => {
      try {
        const end = new Date()
        const start = new Date()
        start.setFullYear(end.getFullYear() - 5)
        return await yahooFinance.chart(ticker, { period1: start, period2: end, interval: '1d' })
      } catch (e) {
        console.error("YF chart error:", e)
        return { quotes: [] }
      }
    })()
  ])
  
  const p = summary.summaryProfile || {}
  const pr = summary.price || {}
  const fd = summary.financialData || {}
  const ks = summary.defaultKeyStatistics || {}
  const sd = summary.summaryDetail || {}
  
  // If we couldn't fetch basic price or profile data, the ticker likely doesn't exist
  if (!pr.regularMarketPrice && !p.sector) {
    return { profile: [] }
  }
  
  const profile = [{
    symbol: ticker,
    companyName: pr.shortName || pr.longName || ticker,
    currency: pr.currency || pr.currencySymbol,
    exchangeShortName: pr.exchangeName || pr.exchange,
    sector: p.sector,
    industry: p.industry,
    website: p.website,
    description: p.longBusinessSummary,
    ceo: p.companyOfficers?.[0]?.name,
    fullTimeEmployees: p.fullTimeEmployees,
    address: p.address1,
    city: p.city,
    zip: p.zip,
    mktCap: pr.marketCap,
    beta: ks.beta,
    floatShares: ks.floatShares,
    range: `${sd.fiftyTwoWeekLow || pr.regularMarketDayLow}-${sd.fiftyTwoWeekHigh || pr.regularMarketDayHigh}`
  }]

  const quote = [{
    symbol: ticker,
    name: pr.shortName || pr.longName || ticker,
    price: pr.regularMarketPrice,
    change: pr.regularMarketChange,
    changePercentage: pr.regularMarketChangePercent ? pr.regularMarketChangePercent * 100 : 0,
    yearHigh: sd.fiftyTwoWeekHigh || pr.regularMarketDayHigh,
    yearLow: sd.fiftyTwoWeekLow || pr.regularMarketDayLow,
    marketCap: pr.marketCap,
    volume: pr.regularMarketVolume,
    avgVolume: pr.averageDailyVolume10Day || sd.averageVolume,
    sharesOutstanding: ks.sharesOutstanding,
    priceAvgTarget: fd.targetMeanPrice || fd.targetMedianPrice || null
  }]

  // Map fundamentalsTimeSeries → income statements (filter out rows with no data)
  const incomeMap = finData
    .filter(r => r.totalRevenue || r.netIncome || r.grossProfit)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(r => ({
      date: new Date(r.date).toISOString().split('T')[0],
      revenue: r.totalRevenue,
      costOfRevenue: r.costOfRevenue || r.reconciledCostOfRevenue,
      grossProfit: r.grossProfit,
      operatingExpenses: r.operatingExpense,
      operatingIncome: r.operatingIncome,
      researchAndDevelopmentExpenses: null,
      sellingGeneralAndAdministrativeExpenses: r.sellingGeneralAndAdministration || r.generalAndAdministrativeExpense,
      netIncome: r.netIncome || r.netIncomeCommonStockholders,
      ebitda: r.EBITDA || r.normalizedEBITDA,
      eps: r.dilutedEPS || r.basicEPS,
      epsdiluted: r.dilutedEPS || r.basicEPS,
      interestExpense: r.interestExpense,
      incomeBeforeTax: r.pretaxIncome,
      incomeTaxExpense: r.taxProvision,
      depreciationAndAmortization: r.reconciledDepreciation
    }))

  // Map fundamentalsTimeSeries → balance sheets
  const balanceMap = bsData
    .filter(r => r.totalAssets || r.stockholdersEquity)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(r => ({
      date: new Date(r.date).toISOString().split('T')[0],
      totalAssets: r.totalAssets,
      totalLiabilities: r.totalLiabilitiesNetMinorityInterest,
      totalEquity: r.stockholdersEquity || r.commonStockEquity,
      totalDebt: r.totalDebt,
      cashAndShortTermInvestments: r.cashCashEquivalentsAndShortTermInvestments || r.cashAndCashEquivalents,
      netDebt: r.netDebt,
      currentAssets: r.currentAssets,
      currentLiabilities: r.currentLiabilities,
      inventory: r.inventory,
      longTermDebt: r.longTermDebt,
      retainedEarnings: r.retainedEarnings,
      netPPE: r.netPPE,
      goodwill: r.goodwill,
      intangibleAssets: r.otherIntangibleAssets,
      workingCapital: r.workingCapital,
      sharesOutstanding: r.ordinarySharesNumber || r.shareIssued
    }))

  // Map fundamentalsTimeSeries → cash flow statements
  const cashflowMap = cfData
    .filter(r => r.operatingCashFlow || r.freeCashFlow || r.capitalExpenditure)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(r => ({
      date: new Date(r.date).toISOString().split('T')[0],
      operatingCashFlow: r.operatingCashFlow,
      capitalExpenditure: r.capitalExpenditure,
      freeCashFlow: r.freeCashFlow,
      investingCashFlow: r.investingCashFlow,
      financingCashFlow: r.financingCashFlow,
      dividendsPaid: r.cashDividendsPaid,
      depreciationAndAmortization: r.depreciationAndAmortization,
      stockBasedCompensation: null,
      netChangeInCash: r.changesInCash
    }))

  // Build historical key metrics from fundamentalsTimeSeries data
  const keyMetrics = incomeMap.map((inc, i) => {
    const bs = balanceMap[i] || {}
    const cf = cashflowMap[i] || {}
    const shares = bs.sharesOutstanding || ks.sharesOutstanding || 1
    return {
      date: inc.date,
      revenuePerShareTTM: inc.revenue ? inc.revenue / shares : null,
      netIncomePerShareTTM: inc.netIncome ? inc.netIncome / shares : null,
      operatingCashFlowPerShareTTM: cf.operatingCashFlow ? cf.operatingCashFlow / shares : null,
      freeCashFlowPerShareTTM: cf.freeCashFlow ? cf.freeCashFlow / shares : null,
      bookValuePerShareTTM: bs.totalEquity ? bs.totalEquity / shares : null,
      roicTTM: inc.operatingIncome && (bs.totalEquity && bs.totalDebt) ? inc.operatingIncome / (bs.totalEquity + bs.totalDebt) : null,
      roeTTM: inc.netIncome && bs.totalEquity ? inc.netIncome / bs.totalEquity : null,
      returnOnCapitalEmployedTTM: inc.operatingIncome && bs.totalAssets && bs.currentLiabilities ? inc.operatingIncome / (bs.totalAssets - bs.currentLiabilities) : null,
      currentRatioTTM: bs.currentAssets && bs.currentLiabilities ? bs.currentAssets / bs.currentLiabilities : null,
      debtToEquityRatioTTM: bs.totalDebt && bs.totalEquity ? bs.totalDebt / bs.totalEquity : null,
      grossProfitMarginTTM: inc.grossProfit && inc.revenue ? inc.grossProfit / inc.revenue : null,
      netProfitMarginTTM: inc.netIncome && inc.revenue ? inc.netIncome / inc.revenue : null,
      operatingProfitMarginTTM: inc.operatingIncome && inc.revenue ? inc.operatingIncome / inc.revenue : null,
    }
  })

  // Build historical ratios from fundamentalsTimeSeries data
  // Also compute historical P/E and P/FCF using price history
  const ratios = incomeMap.map((inc, i) => {
    const bs = balanceMap[i] || {}
    const cf = cashflowMap[i] || {}
    const shares = bs.sharesOutstanding || ks.sharesOutstanding || 1

    // Find the stock price closest to the fiscal year-end date
    let yearEndPrice = null
    if (hist.quotes && hist.quotes.length > 0 && inc.date) {
      const targetDate = new Date(inc.date).getTime()
      let closest = hist.quotes[0]
      let minDiff = Infinity
      for (const q of hist.quotes) {
        const diff = Math.abs(new Date(q.date).getTime() - targetDate)
        if (diff < minDiff) { minDiff = diff; closest = q }
      }
      yearEndPrice = closest.close
    }

    // Compute P/E = Price / EPS
    const epsVal = inc.epsdiluted || inc.eps
    const priceEarningsRatio = yearEndPrice && epsVal && epsVal > 0 ? yearEndPrice / epsVal : null

    // Compute P/FCF = Market Cap / FCF
    const fcfPerShare = cf.freeCashFlow ? cf.freeCashFlow / shares : null
    const priceToFreeCashFlowsRatio = yearEndPrice && fcfPerShare && fcfPerShare > 0 ? yearEndPrice / fcfPerShare : null

    return {
      date: inc.date,
      priceEarningsRatio,
      priceToFreeCashFlowsRatio,
      grossProfitMarginTTM: inc.grossProfit && inc.revenue ? inc.grossProfit / inc.revenue : null,
      netProfitMarginTTM: inc.netIncome && inc.revenue ? inc.netIncome / inc.revenue : null,
      operatingProfitMarginTTM: inc.operatingIncome && inc.revenue ? inc.operatingIncome / inc.revenue : null,
      returnOnEquityTTM: inc.netIncome && bs.totalEquity ? inc.netIncome / bs.totalEquity : null,
      returnOnAssetsTTM: inc.netIncome && bs.totalAssets ? inc.netIncome / bs.totalAssets : null,
      debtToEquityRatioTTM: bs.totalDebt && bs.totalEquity ? bs.totalDebt / bs.totalEquity : null,
      currentRatioTTM: bs.currentAssets && bs.currentLiabilities ? bs.currentAssets / bs.currentLiabilities : null,
      dividendPayoutRatioTTM: cf.dividendsPaid && inc.netIncome ? Math.abs(cf.dividendsPaid) / inc.netIncome : null,
      capexToRevenueTTM: cf.capitalExpenditure && inc.revenue ? Math.abs(cf.capitalExpenditure) / inc.revenue : null,
      capexToOperatingCashFlowTTM: cf.capitalExpenditure && cf.operatingCashFlow ? Math.abs(cf.capitalExpenditure) / cf.operatingCashFlow : null,
      freeCashFlowToRevenueTTM: cf.freeCashFlow && inc.revenue ? cf.freeCashFlow / inc.revenue : null,
    }
  })

  const ratiosTTM = [{
    priceToEarningsRatioTTM: ks.trailingPE || ks.forwardPE || (pr.regularMarketPrice / (ks.trailingEps || 1)),
    enterpriseValueMultipleTTM: ks.enterpriseToEbitda,
    dividendYieldTTM: sd.dividendYield || (ks.lastDividendValue ? ks.lastDividendValue / pr.regularMarketPrice : null),
    grossProfitMarginTTM: fd.grossMargins,
    netProfitMarginTTM: fd.profitMargins,
    operatingProfitMarginTTM: fd.operatingMargins,
    debtToEquityRatioTTM: fd.debtToEquity ? fd.debtToEquity / 100 : null,
    priceToBookRatioTTM: ks.priceToBook,
    priceToSalesRatioTTM: ks.enterpriseToRevenue,
    returnOnEquityTTM: fd.returnOnEquity,
    returnOnAssetsTTM: fd.returnOnAssets,
    currentRatioTTM: fd.currentRatio,
    quickRatioTTM: fd.quickRatio,
    priceToFreeCashFlowTTM: fd.freeCashflow ? pr.marketCap / fd.freeCashflow : null,
    priceToFreeCashFlowRatioTTM: fd.freeCashflow ? pr.marketCap / fd.freeCashflow : null,
    priceToFreeCashFlowsTTM: fd.freeCashflow ? pr.marketCap / fd.freeCashflow : null,
    earningsYieldTTM: ks.trailingEps ? ks.trailingEps / pr.regularMarketPrice : null
  }]

  const keyMetricsTTM = [{
    priceToEarningsRatioTTM: ks.trailingPE || ks.forwardPE,
    roicTTM: keyMetrics[0]?.roicTTM || fd.returnOnAssets,
    returnOnCapitalEmployedTTM: keyMetrics[0]?.returnOnCapitalEmployedTTM || fd.returnOnAssets,
    roeTTM: fd.returnOnEquity,
    freeCashFlowPerShareTTM: ks.sharesOutstanding && fd.freeCashflow ? fd.freeCashflow / ks.sharesOutstanding : null,
    bookValuePerShareTTM: ks.bookValue,
    enterpriseValueTTM: ks.enterpriseValue,
    evToSalesTTM: ks.enterpriseToRevenue,
    evToEBITDATTM: ks.enterpriseToEbitda,
    currentRatioTTM: fd.currentRatio,
    capexToRevenueTTM: ratios[0]?.capexToRevenueTTM || null,
    capexToOperatingCashFlowTTM: ratios[0]?.capexToOperatingCashFlowTTM || null,
    revenuePerShareTTM: fd.revenuePerShare
  }]

  const priceHistory = {
    symbol: ticker,
    historical: (hist.quotes || []).map(q => ({
      date: q.date ? new Date(q.date).toISOString().split('T')[0] : '',
      close: q.close
    })).reverse()
  }

  // Build analyst recommendations from recommendationTrend
  const recTrend = summary.recommendationTrend?.trend || []
  const currentRec = recTrend.find(r => r.period === '0m') || recTrend[0] || {}
  const analystRecommendations = (currentRec.strongBuy || currentRec.buy || currentRec.hold || currentRec.sell || currentRec.strongSell)
    ? [{
        strongBuy: currentRec.strongBuy || 0,
        buy: currentRec.buy || 0,
        hold: currentRec.hold || 0,
        sell: currentRec.sell || 0,
        strongSell: currentRec.strongSell || 0
      }]
    : []

  // Build analyst estimates from earningsTrend
  const earningsTrend = summary.earningsTrend?.trend || []
  const analystEstimates = earningsTrend
    .filter(t => t.endDate)
    .map(t => ({
      date: new Date(t.endDate).toISOString().split('T')[0],
      estimatedEpsAvg: t.earningsEstimate?.avg,
      estimatedEpsLow: t.earningsEstimate?.low,
      estimatedEpsHigh: t.earningsEstimate?.high,
      estimatedRevenueAvg: t.revenueEstimate?.avg || null,
      estimatedRevenueLow: t.revenueEstimate?.low || null,
      estimatedRevenueHigh: t.revenueEstimate?.high || null,
      numberAnalysts: t.earningsEstimate?.numberOfAnalysts || t.revenueEstimate?.numberOfAnalysts || 0,
      growth: t.growth
    }))

  const result = {
    profile,
    quote,
    income: incomeMap,
    balance: balanceMap,
    cashflow: cashflowMap,
    keyMetrics,
    ratios,
    keyMetricsTTM,
    ratiosTTM,
    executives: [],
    insiderTrading: [],
    institutionalHolders: [],
    analystEstimates,
    analystRecommendations,
    peers: [],
    priceHistory
  }

  cache.set(cacheKey, result, 15 * 60 * 1000)
  return result
}

export async function getPeers(ticker) {
  return [{ peersList: [] }] // YF doesn't have a direct peers list endpoint equivalent
}

export async function searchTickers(query) {
  try {
    const res = await yahooFinance.search(query, { quotesCount: 8, newsCount: 0 })
    return (res.quotes || [])
      .filter(q => q.isYahooFinance && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF'))
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname,
        exchange: q.exchDisp || q.exchange
      }))
  } catch (err) {
    console.error("YF search error:", err)
    return []
  }
}

export async function getPeerDetails(peerTickers) {
  const results = await Promise.allSettled(
    peerTickers.slice(0, 5).map(async (t) => {
      const full = await getFullAnalysis(t)
      return {
        ticker: t,
        profile: full.profile?.[0] || null,
        ratiosTTM: full.ratiosTTM?.[0] || null,
        keyMetricsTTM: full.keyMetricsTTM?.[0] || null
      }
    })
  )
  return results
    .filter(r => r.status === 'fulfilled' && r.value.profile)
    .map(r => r.value)
}
