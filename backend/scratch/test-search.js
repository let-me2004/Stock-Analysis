import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance();
yf.search('ADANI', {quotesCount: 10, newsCount: 0}).then(r=>console.log(r.quotes)).catch(console.error);
