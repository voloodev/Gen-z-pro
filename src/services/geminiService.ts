import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TradingSignal {
  symbol: string;
  action: "LONG" | "SHORT" | "NEUTRAL";
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  leverage: string; // e.g. "10x Cross"
  confidence: number;
  reasoning: string;
  patterns: string[]; // e.g. ["SMC Order Block", "ICT Fair Value Gap"]
  estimatedDays: number;
  winRate: number;
}

export async function getTradingSignal(marketData: any, type: "LIVE" | "LONG_TERM" = "LIVE"): Promise<TradingSignal> {
  const prompt = `Analyze the following market data for ${marketData.symbol} and provide a ${type === "LIVE" ? "high-probability scalping/day-trade" : "high-gain long-term"} signal for Binance Futures.
  
  Current Price: ${marketData.currentPrice}
  RSI (14): ${marketData.indicators.rsi}
  MACD: ${JSON.stringify(marketData.indicators.macd)}
  EMA 20: ${marketData.indicators.ema20}
  EMA 50: ${marketData.indicators.ema50}
  Recent History: ${JSON.stringify(marketData.history)}
  
  CRITICAL ANALYSIS REQUIREMENTS:
  1. Identify Smart Money Concepts (SMC) like Order Blocks, Liquidity Sweeps, or Break of Structure (BOS).
  2. Identify ICT patterns like Fair Value Gaps (FVG) or Optimal Trade Entry (OTE).
  3. ${type === "LONG_TERM" ? "Identify Elliot Wave structures for 200%+ gain potential." : "Identify immediate trend reversals or continuations."}
  
  Return the signal in JSON format with specific TP1, TP2, TP3, and SL levels.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING },
          action: { type: Type.STRING, enum: ["LONG", "SHORT", "NEUTRAL"] },
          entry: { type: Type.NUMBER },
          tp1: { type: Type.NUMBER },
          tp2: { type: Type.NUMBER },
          tp3: { type: Type.NUMBER },
          sl: { type: Type.NUMBER },
          leverage: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedDays: { type: Type.NUMBER },
          winRate: { type: Type.NUMBER },
        },
        required: ["symbol", "action", "entry", "tp1", "tp2", "tp3", "sl", "leverage", "confidence", "reasoning", "patterns", "estimatedDays", "winRate"],
      },
    },
  });

  return JSON.parse(response.text);
}
