import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const ticker = 'ADANIENT.NS';

// Test fundamentalsTimeSeries - the replacement for broken incomeStatementHistory
try {
  const ts = await yf.fundamentalsTimeSeries(ticker, {
    period1: '2020-01-01',
    period2: '2026-06-21',
    type: 'annual',
    module: 'all'
  });
  console.log('=== fundamentalsTimeSeries ===');
  console.log('Count:', ts.length);
  if (ts.length > 0) {
    console.log('Keys:', Object.keys(ts[0]).filter(k => ts[0][k] !== null));
    console.log('Sample:', JSON.stringify(ts[0], null, 2).substring(0, 1500));
  }
} catch(e) {
  console.error('fundamentalsTimeSeries error:', e.message);
}

// Also test what quoteSummary modules actually return data
try {
  const qs = await yf.quoteSummary(ticker, {
    modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics',
              'incomeStatementHistory', 'balanceSheetHistory', 'cashflowStatementHistory',
              'earningsHistory', 'earningsTrend']
  });
  
  console.log('\n=== quoteSummary modules ===');
  console.log('incomeStatementHistory count:', qs.incomeStatementHistory?.incomeStatementHistory?.length);
  if (qs.incomeStatementHistory?.incomeStatementHistory?.[0]) {
    const inc = qs.incomeStatementHistory.incomeStatementHistory[0];
    const nonNull = Object.entries(inc).filter(([k,v]) => v !== null && v !== undefined && v !== 0);
    console.log('incomeStatement non-null fields:', nonNull.map(([k]) => k));
  }
  
  console.log('balanceSheetHistory count:', qs.balanceSheetHistory?.balanceSheetStatements?.length);
  if (qs.balanceSheetHistory?.balanceSheetStatements?.[0]) {
    const bs = qs.balanceSheetHistory.balanceSheetStatements[0];
    const nonNull = Object.entries(bs).filter(([k,v]) => v !== null && v !== undefined && v !== 0);
    console.log('balanceSheet non-null fields:', nonNull.map(([k]) => k));
  }
  
  console.log('cashflowStatementHistory count:', qs.cashflowStatementHistory?.cashflowStatements?.length);
  
  console.log('\nprice keys:', Object.keys(qs.price || {}));
  console.log('financialData non-null:', Object.entries(qs.financialData || {}).filter(([k,v]) => v !== null && v !== undefined).map(([k]) => k));
  console.log('defaultKeyStatistics non-null:', Object.entries(qs.defaultKeyStatistics || {}).filter(([k,v]) => v !== null && v !== undefined).map(([k]) => k));
  
} catch(e) {
  console.error('quoteSummary error:', e.message);
}
