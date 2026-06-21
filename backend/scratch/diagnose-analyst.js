import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const ticker = 'ADANIENT.NS';

try {
  const qs = await yf.quoteSummary(ticker, {
    modules: ['recommendationTrend', 'financialData', 'defaultKeyStatistics', 'earningsTrend']
  });
  
  console.log('=== recommendationTrend ===');
  console.log(JSON.stringify(qs.recommendationTrend, null, 2));
  
  console.log('\n=== financialData targets ===');
  const fd = qs.financialData || {};
  console.log('targetHighPrice:', fd.targetHighPrice);
  console.log('targetLowPrice:', fd.targetLowPrice);
  console.log('targetMeanPrice:', fd.targetMeanPrice);
  console.log('targetMedianPrice:', fd.targetMedianPrice);
  console.log('recommendationKey:', fd.recommendationKey);
  console.log('numberOfAnalystOpinions:', fd.numberOfAnalystOpinions);
  
  console.log('\n=== earningsTrend ===');
  console.log(JSON.stringify(qs.earningsTrend, null, 2)?.substring(0, 800));
  
} catch(e) {
  console.error('Error:', e.message);
}
