import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const ticker = 'ADANIENT.NS';

// Test fundamentalsTimeSeries with specific financial types
const types = ['annual', 'quarterly'];
for (const type of ['annual']) {
  try {
    const ts = await yf.fundamentalsTimeSeries(ticker, {
      period1: '2020-01-01',
      period2: '2026-06-21',
      type,
      module: 'financials'
    });
    console.log(`=== fundamentalsTimeSeries (${type}, financials) ===`);
    console.log('Count:', ts.length);
    if (ts.length > 0) {
      const allKeys = new Set();
      ts.forEach(row => Object.keys(row).forEach(k => { if (row[k] !== null) allKeys.add(k) }));
      console.log('All non-null keys:', [...allKeys]);
      console.log('Sample row:', JSON.stringify(ts[0], (k,v) => v === null ? undefined : v, 2));
    }
  } catch(e) {
    console.error(`fundamentalsTimeSeries (${type}, financials) error:`, e.message);
  }
}

// Try 'balance_sheet' module
try {
  const ts = await yf.fundamentalsTimeSeries(ticker, {
    period1: '2020-01-01',
    period2: '2026-06-21',
    type: 'annual',
    module: 'balance-sheet'
  });
  console.log('\n=== fundamentalsTimeSeries (annual, balance-sheet) ===');
  console.log('Count:', ts.length);
  if (ts.length > 0) {
    const allKeys = new Set();
    ts.forEach(row => Object.keys(row).forEach(k => { if (row[k] !== null) allKeys.add(k) }));
    console.log('All non-null keys:', [...allKeys]);
  }
} catch(e) {
  console.error('balance-sheet error:', e.message);
}

// Try 'cash-flow' module
try {
  const ts = await yf.fundamentalsTimeSeries(ticker, {
    period1: '2020-01-01',
    period2: '2026-06-21',
    type: 'annual',
    module: 'cash-flow'
  });
  console.log('\n=== fundamentalsTimeSeries (annual, cash-flow) ===');
  console.log('Count:', ts.length);
  if (ts.length > 0) {
    const allKeys = new Set();
    ts.forEach(row => Object.keys(row).forEach(k => { if (row[k] !== null) allKeys.add(k) }));
    console.log('All non-null keys:', [...allKeys]);
  }
} catch(e) {
  console.error('cash-flow error:', e.message);
}
