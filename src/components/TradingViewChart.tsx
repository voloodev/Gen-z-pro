import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickData, UTCTimestamp, CandlestickSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts';
import { PatternDetail } from '../services/taEngine';

interface TradingViewChartProps {
  data: any[];
  projection?: any[];
  patterns: PatternDetail[];
  entry: number;
  sl: number;
  tp1: number;
  timeframe?: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, projection, patterns, entry, sl, tp1, timeframe = '1H' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0B0D' },
        textColor: '#71717a',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.01)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.01)' },
      },
      width: chartContainerRef.current.clientWidth || 800,
      height: 350,
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 12,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        autoScale: true,
        alignLabels: true,
      },
      handleScroll: true,
      handleScale: true,
    });

    // Add Timeframe Watermark (via overlay instead of chart options to avoid TS errors)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#3b82f6',
      downColor: '#0A0B0D',
      borderVisible: true,
      borderColor: '#3b82f6',
      wickUpColor: '#3b82f6',
      wickDownColor: '#ef4444',
      borderUpColor: '#3b82f6',
      borderDownColor: '#ef4444',
    });

    const projectionSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'rgba(59, 130, 246, 0.2)',
      downColor: 'rgba(10, 11, 13, 0.2)',
      borderVisible: true,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      wickUpColor: 'rgba(59, 130, 246, 0.2)',
      wickDownColor: 'rgba(239, 68, 68, 0.2)',
      borderUpColor: 'rgba(59, 130, 246, 0.2)',
      borderDownColor: 'rgba(239, 68, 68, 0.2)',
    });

    const formattedData: CandlestickData[] = data.map(d => ({
      time: (d.time / 1000) as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(formattedData);

    // Current Price Line
    const lastPrice = formattedData[formattedData.length - 1].close;
    candlestickSeries.createPriceLine({
      price: lastPrice,
      color: '#71717a',
      lineWidth: 1,
      lineStyle: 3,
      axisLabelVisible: true,
      title: 'CURRENT PRICE',
    });

    if (projection && projection.length > 0) {
      const formattedProjection: CandlestickData[] = projection.map(d => ({
        time: (d.time / 1000) as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      projectionSeries.setData(formattedProjection);

      createSeriesMarkers(projectionSeries, [{
        time: formattedProjection[0].time,
        position: 'aboveBar',
        color: '#3b82f6',
        shape: 'arrowDown',
        text: 'NEURAL PROJECTION ACTIVE',
        size: 2,
      }]);
    }

    // Add Markers for patterns
    const markers = patterns.map(p => ({
      time: p.timeStart as UTCTimestamp,
      position: p.type === 'arrow' ? (p.color === '#22c55e' ? 'belowBar' : 'aboveBar') : 'aboveBar' as any,
      color: p.color,
      shape: p.type === 'arrow' ? (p.color === '#22c55e' ? 'arrowUp' : 'arrowDown') : 'circle' as any,
      text: p.label,
    }));
    createSeriesMarkers(candlestickSeries, markers);

    // Add Entry, SL, TP lines with enhanced styling
    candlestickSeries.createPriceLine({
      price: entry,
      color: '#3b82f6',
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: 'ENTRY LEVEL',
    });

    candlestickSeries.createPriceLine({
      price: sl,
      color: '#ef4444',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'STOP LOSS (PROTECTION)',
    });

    candlestickSeries.createPriceLine({
      price: tp1,
      color: '#22c55e',
      lineWidth: 2,
      lineStyle: 1,
      axisLabelVisible: true,
      title: 'TARGET 1 (PROFIT)',
    });

    // Draw Patterns with classified labels
    patterns.forEach(p => {
      if (p.type === 'line' && p.price) {
        candlestickSeries.createPriceLine({
          price: p.price,
          color: p.color,
          lineWidth: 1,
          lineStyle: 3,
          axisLabelVisible: true,
          title: p.label,
        });
      } else if (p.type === 'box' && p.priceUpper && p.priceLower) {
        // Upper Bound
        candlestickSeries.createPriceLine({
          price: p.priceUpper,
          color: p.color,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `${p.label} TOP`,
        });
        // Lower Bound
        candlestickSeries.createPriceLine({
          price: p.priceLower,
          color: p.color,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `${p.label} BTM`,
        });
      }
    });

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0].contentRect.width > 0) {
        chart.applyOptions({ width: entries[0].contentRect.width });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, projection, patterns, entry, sl, tp1, timeframe]);

  return (
    <div ref={chartContainerRef} className="w-full h-[350px] relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-white/[0.03] text-7xl font-black italic tracking-tighter">
          GEN-Z PRO {timeframe.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
