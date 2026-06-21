import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const ticker = 'ADANIENT.NS';

async function getTimeSeries(mod) {
  return yf.fundamentalsTimeSeries(ticker, {
    period1: '2019-01-01',
    period2: '2026-06-21',
    type: 'annual',
    module: mod
  });
}

const [fin, bs, cf] = await Promise.all([
  getTimeSeries('financials'),
  getTimeSeries('balance-sheet'),
  getTimeSeries('cash-flow')
]);

console.log('=== INCOME (financials) ===');
fin.forEach(r => {
  console.log(new Date(r.date).toISOString().split('T')[0], {
    revenue: r.totalRevenue,
    costOfRevenue: r.costOfRevenue,
    grossProfit: r.grossProfit,
    operatingIncome: r.operatingIncome,
    operatingExpense: r.operatingExpense,
    netIncome: r.netIncome,
    ebitda: r.EBITDA,
    dilutedEPS: r.dilutedEPS,
    interestExpense: r.interestExpense,
    sgna: r.sellingGeneralAndAdministration,
  });
});

console.log('\n=== BALANCE SHEET ===');
bs.forEach(r => {
  console.log(new Date(r.date).toISOString().split('T')[0], {
    totalAssets: r.totalAssets,
    totalLiabilities: r.totalLiabilitiesNetMinorityInterest,
    totalEquity: r.stockholdersEquity,
    totalDebt: r.totalDebt,
    cash: r.cashAndCashEquivalents,
    currentAssets: r.currentAssets,
    currentLiabilities: r.currentLiabilities,
    inventory: r.inventory,
    netPPE: r.netPPE,
    longTermDebt: r.longTermDebt,
    retainedEarnings: r.retainedEarnings,
    sharesIssued: r.shareIssued,
  });
});

console.log('\n=== CASH FLOW ===');
cf.forEach(r => {
  console.log(new Date(r.date).toISOString().split('T')[0], {
    operatingCashFlow: r.operatingCashFlow,
    capitalExpenditure: r.capitalExpenditure,
    freeCashFlow: r.freeCashFlow,
    investingCashFlow: r.investingCashFlow,
    financingCashFlow: r.financingCashFlow,
    dividendsPaid: r.cashDividendsPaid,
    depAmort: r.depreciationAndAmortization,
  });
});
