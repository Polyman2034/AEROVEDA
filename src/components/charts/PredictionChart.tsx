import React from 'react';
import { PredictionPoint } from '../../types';

interface PredictionChartProps {
  data: PredictionPoint[];
  currentAqi: number;
  height?: number;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  data,
  currentAqi,
  height = 200,
}) => {
  if (!data || data.length === 0) return null;

  const width = 680;
  const padding = { top: 25, right: 25, bottom: 35, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(340, ...data.map((d) => (d.confidenceInterval ? d.confidenceInterval[1] : d.aqi)));
  const minVal = Math.min(120, ...data.map((d) => (d.confidenceInterval ? d.confidenceInterval[0] : d.aqi)));

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  // Paths
  const linePath = data.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.aqi);
    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, '');

  const upperPoints = data.map((pt, i) => `${getX(i)},${getY(pt.confidenceInterval ? pt.confidenceInterval[1] : pt.aqi * 1.05)}`);
  const lowerPoints = data
    .map((pt, i) => `${getX(i)},${getY(pt.confidenceInterval ? pt.confidenceInterval[0] : pt.aqi * 0.95)}`)
    .reverse();
  const areaPath = `M ${upperPoints[0]} L ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;

  return (
    <div className="w-full select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal grid lines */}
        {[150, 200, 250, 300].map((val) => {
          if (val > maxVal + 20 || val < minVal - 10) return null;
          const y = getY(val);
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f4f4f5"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fontSize="9.5"
                fill="#a1a1aa"
                textAnchor="end"
                className="font-mono tabular-nums font-normal"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Soft Confidence Ribbon */}
        <path d={areaPath} fill="#eff6ff" fillOpacity="0.8" />

        {/* Curve Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {data.map((pt, i) => {
          const x = getX(i);
          const y = getY(pt.aqi);
          const isNow = pt.hoursAhead === 0;

          return (
            <g key={i} className="group">
              <circle
                cx={x}
                cy={y}
                r={isNow ? 4.5 : 3.5}
                fill={isNow ? '#18181b' : '#2563eb'}
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Data label */}
              <text
                x={x}
                y={y - 8}
                fontSize="9.5"
                fontWeight="500"
                fill="#18181b"
                textAnchor="middle"
                className="font-mono tabular-nums"
              >
                {pt.aqi}
              </text>

              {/* Time axis label */}
              <text
                x={x}
                y={height - 12}
                fontSize="9.5"
                fontWeight={isNow ? '600' : '400'}
                fill={isNow ? '#18181b' : '#71717a'}
                textAnchor="middle"
              >
                {pt.timeLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
