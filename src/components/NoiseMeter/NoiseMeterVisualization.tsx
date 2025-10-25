/**
 * NoiseMeterVisualization Component
 * Real-time SVG bar chart for noise level visualization
 * Shows current level with color coding (green/yellow/red)
 */

import React from 'react';

interface NoiseMeterVisualizationProps {
  level: number; // 0-100
  noiseLevel: 'green' | 'yellow' | 'red';
  thresholds: {
    green: number;
    yellow: number;
    red: number;
  };
}

export const NoiseMeterVisualization = React.memo(function NoiseMeterVisualization({
  level,
  noiseLevel,
  thresholds,
}: NoiseMeterVisualizationProps) {
  // Get color based on noise level
  const getBarColor = () => {
    switch (noiseLevel) {
      case 'green':
        return '#10b981'; // Emerald green
      case 'yellow':
        return '#f59e0b'; // Amber
      case 'red':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const barColor = getBarColor();
  const percentage = Math.max(0, Math.min(100, level));

  // SVG dimensions
  const svgWidth = 300;
  const svgHeight = 60;
  const barHeight = 40;
  const barY = (svgHeight - barHeight) / 2;
  const barWidth = (percentage / 100) * 250; // Leave padding

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG Bar Chart */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="drop-shadow-sm"
      >
        {/* Background bar outline */}
        <rect
          x="25"
          y={barY}
          width="250"
          height={barHeight}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="2"
          rx="4"
        />

        {/* Filled bar */}
        <rect
          x="25"
          y={barY}
          width={barWidth}
          height={barHeight}
          fill={barColor}
          rx="4"
          style={{
            transition: 'width 0.1s ease-out, fill 0.3s ease-out',
          }}
        />

        {/* Threshold markers */}
        {/* Green threshold */}
        <line
          x1={25 + (thresholds.green / 100) * 250}
          y1={barY - 5}
          x2={25 + (thresholds.green / 100) * 250}
          y2={barY + barHeight + 5}
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="4,4"
          opacity="0.5"
        />

        {/* Yellow threshold */}
        <line
          x1={25 + (thresholds.yellow / 100) * 250}
          y1={barY - 5}
          x2={25 + (thresholds.yellow / 100) * 250}
          y2={barY + barHeight + 5}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4,4"
          opacity="0.5"
        />

        {/* Current level text */}
        <text
          x={svgWidth / 2}
          y={svgHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          fill="white"
          style={{
            pointerEvents: 'none',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          {Math.round(percentage)}
        </text>
      </svg>

      {/* Threshold labels */}
      <div className="flex justify-between w-full px-6 text-xs font-medium">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span className="text-[var(--text-secondary)]">Verde: {thresholds.green}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="text-[var(--text-secondary)]">Giallo: {thresholds.yellow}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className="text-[var(--text-secondary)]">Rosso: {thresholds.red}</span>
        </div>
      </div>

      {/* Scale 0-100 */}
      <div className="flex justify-between w-full px-6 text-xs text-[var(--text-secondary)]">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
});

NoiseMeterVisualization.displayName = 'NoiseMeterVisualization';
