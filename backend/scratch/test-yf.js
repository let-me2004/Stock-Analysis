import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function run() {
  try {
    const res = await yahooFinance.fundamentalsTimeSeries('RELIANCE.NS', {
      type: 'annualIncomeStatementHistory'
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
run();
