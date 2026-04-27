import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import { RSI, MACD, EMA } from "technicalindicators";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API to fetch market data for multiple symbols (Scanner)
  app.get("/api/scanner", async (req, res) => {
    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT", "DOTUSDT", "LINKUSDT"];
    const { interval = "1h" } = req.query;

    try {
      const results = (await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const response = await axios.get(
              `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=50`
            );
            const closes = response.data.map((d: any) => parseFloat(d[4]));
            const volumes = response.data.map((d: any) => parseFloat(d[5]));
            const currentPrice = closes[closes.length - 1];
            const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;
            
            if (avgVolume < 10) return null;

            const ema20 = EMA.calculate({ values: closes, period: 20 });
            const lastEma = ema20[ema20.length - 1];
            const trend = currentPrice > lastEma ? "UPTREND" : "DOWNTREND";

            return { symbol, currentPrice, trend };
          } catch (e) {
            return null;
          }
        })
      )).filter(r => r !== null);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Scanner failed" });
    }
  });

  app.get("/api/market-data", async (req, res) => {
    const { symbol = "BTCUSDT", interval = "1h", limit = "100" } = req.query;

    try {
      // Fetch K-line (candlestick) data from Binance
      const response = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      const data = response.data.map((d: any) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }));

      const closes = data.map((d: any) => d.close);

      // Calculate Indicators
      const rsi = RSI.calculate({ values: closes, period: 14 });
      const macd = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });
      const ema20 = EMA.calculate({ values: closes, period: 20 });
      const ema50 = EMA.calculate({ values: closes, period: 50 });

      res.json({
        symbol,
        currentPrice: closes[closes.length - 1],
        indicators: {
          rsi: rsi[rsi.length - 1],
          macd: macd[macd.length - 1],
          ema20: ema20[ema20.length - 1],
          ema50: ema50[ema50.length - 1],
        },
        history: data, // Send full history for TA engine
      });
    } catch (error) {
      console.error("Error fetching Binance data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
