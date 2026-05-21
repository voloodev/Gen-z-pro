import axios from 'axios';

export interface KlineHistory {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResult {
  symbol: string;
  currentPrice: number;
  history: KlineHistory[];
}

export interface ScannerCoinResult {
  symbol: string;
  currentPrice: number;
  trend: 'UPTREND' | 'DOWNTREND';
}

/**
 * Fetches market candlestick history, with automatic fallback directly to public Binance API
 * if the internal proxy server `/api/market-data` is not available or errors out.
 */
export async function getMarketData(symbol: string, interval: string = '1h', limit: number = 100): Promise<MarketDataResult> {
  try {
    // Try the local Node/Express proxy API route first
    const response = await axios.get(`/api/market-data?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    
    // Validate if response is HTML (could happen on static routing redirects/GitHub Pages fallbacks)
    if (response.data && typeof response.data === 'string' && response.data.trim().startsWith('<!doctype')) {
      throw new Error('Local API returned HTML fallback page (static hosting detected)');
    }
    
    if (response.data && response.data.history) {
      return {
        symbol: response.data.symbol || symbol,
        currentPrice: response.data.currentPrice,
        history: response.data.history
      };
    }
    throw new Error('Invalid format from local API');
  } catch (error) {
    console.warn(`Local API market data fetch failed for ${symbol}. Falling back to public Binance API directory directly...`, error);
    
    // Direct browser-to-Binance fallback request
    const response = await axios.get(
      `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`
    );
    
    const history: KlineHistory[] = response.data.map((d: any) => ({
      time: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));

    return {
      symbol: symbol.toUpperCase(),
      currentPrice: history[history.length - 1].close,
      history
    };
  }
}

/**
 * Fetches scanner lists, with automatic client-side execution using public Binance endpoints
 * if the internal proxy server `/api/scanner` is not available or errors out.
 */
export async function getScannerData(interval: string = '1h'): Promise<ScannerCoinResult[]> {
  try {
    // Try local node proxy API route first
    const response = await axios.get(`/api/scanner?interval=${interval}`);
    
    // Validate if response is HTML fallback
    if (response.data && typeof response.data === 'string' && response.data.trim().startsWith('<!doctype')) {
      throw new Error('Local API returned HTML fallback page (static hosting detected)');
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error('Invalid format from local API scanner');
  } catch (error) {
    console.warn('Local API scanner lookup failed. Running client-side parallel fetching against Binance directly...', error);
    
    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT", "DOTUSDT", "LINKUSDT"];
    
    const parsedResults = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const response = await axios.get(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=50`
          );
          const closes = response.data.map((d: any) => parseFloat(d[4]));
          const currentPrice = closes[closes.length - 1];
          
          // Determine simple moving trend client-side based on close of candles
          const sum = closes.reduce((acc: number, val: number) => acc + val, 0);
          const simpleMovingAvg = sum / closes.length;
          const trend: 'UPTREND' | 'DOWNTREND' = currentPrice > simpleMovingAvg ? "UPTREND" : "DOWNTREND";
          
          return { symbol, currentPrice, trend } as ScannerCoinResult;
        } catch (e) {
          console.error(`Client-side fallback klines fetch failed for ${symbol}:`, e);
          return null;
        }
      })
    );
    
    return parsedResults.filter((r): r is ScannerCoinResult => r !== null);
  }
}
