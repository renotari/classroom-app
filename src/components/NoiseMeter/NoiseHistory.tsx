/**
 * NoiseHistory Component
 * Mini line chart showing noise level history (last 10 minutes)
 */

import React from 'react';

interface NoiseHistoryProps {
  history: Array<{ timestamp: number; level: number }>;
  maxLevel?: number;
  width?: number;
  height?: number;
}

export const NoiseHistory = React.memo(function NoiseHistory({
  history,
  maxLevel = 100,
  width = 400,
  height = 120,
}: NoiseHistoryProps) {
  // Calculate points for SVG path
  const calculatePath = () => {
    if (history.length < 2) {
      return 'M 0,0';
    }

    const points = history
      .filter((point): point is { timestamp: number; level: number } => Boolean(point))
      .map((point, index) => {
        const x = (index / Math.max(1, history.length - 1)) * (width - 40); // Leave padding
        const y = height - (point.level / maxLevel) * (height - 40) - 20; // Bottom padding + top padding
        return { x: x + 20, y }; // Add left padding
      });

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return pathData;
  };

  const getCurrentLevel = () => {
    if (history.length === 0) return 0;
    const lastPoint = history[history.length - 1];
    return lastPoint?.level ?? 0;
  };

  const getAverageLevel = () => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, point) => acc + point.level, 0);
    return Math.round(sum / history.length);
  };

  const getMaxLevel = () => {
    if (history.length === 0) return 0;
    return Math.max(...history.map((point) => point.level));
  };

  const currentLevel = getCurrentLevel();
  const averageLevel = getAverageLevel();
  const maxHistoryLevel = getMaxLevel();

  return (
    <div className="space-y-3 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
      {/* Title */}
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
        Storia Ultimi 10 Minuti
      </h3>

      {/* Chart */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full bg-[var(--bg-secondary)] rounded border border-[var(--border-color)]"
      >
        {/* Grid lines */}
        <line
          x1="20"
          y1={height / 2}
          x2={width - 20}
          y2={height / 2}
          stroke="var(--border-color)"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.3"
        />

        {/* Y-axis */}
        <line
          x1="20"
          y1="10"
          x2="20"
          y2={height - 10}
          stroke="var(--border-color)"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1="20"
          y1={height - 10}
          x2={width - 10}
          y2={height - 10}
          stroke="var(--border-color)"
          strokeWidth="1"
        />

        {/* Line path */}
        <path
          d={calculatePath()}
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth="2"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />

        {/* Area under curve */}
        <defs>
          <linearGradient id="historyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {history.length >= 2 && (
          <path
            d={`${calculatePath()} L ${width - 20},${height - 10} L 20,${height - 10} Z`}
            fill="url(#historyGradient)"
          />
        )}

        {/* Current point marker */}
        {history.length > 0 && (
          <circle
            cx={20 + ((history.length - 1) / Math.max(1, history.length - 1)) * (width - 40)}
            cy={height - (currentLevel / maxLevel) * (height - 40) - 20}
            r="4"
            fill="var(--accent-color)"
            stroke="white"
            strokeWidth="2"
          />
        )}

        {/* Y-axis labels */}
        <text
          x="5"
          y="15"
          textAnchor="end"
          fontSize="10"
          fill="var(--text-secondary)"
          opacity="0.6"
        >
          100
        </text>
        <text
          x="5"
          y={height - 5}
          textAnchor="end"
          fontSize="10"
          fill="var(--text-secondary)"
          opacity="0.6"
        >
          0
        </text>
      </svg>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-[var(--bg-secondary)] rounded p-2">
          <p className="text-xs text-[var(--text-secondary)]">Attuale</p>
          <p className="text-sm font-bold text-[var(--accent-color)]">{Math.round(currentLevel)}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded p-2">
          <p className="text-xs text-[var(--text-secondary)]">Media</p>
          <p className="text-sm font-bold text-[#f59e0b]">{averageLevel}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded p-2">
          <p className="text-xs text-[var(--text-secondary)]">Massimo</p>
          <p className="text-sm font-bold text-[#ef4444]">{Math.round(maxHistoryLevel)}</p>
        </div>
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <div className="flex items-center justify-center h-20 text-[var(--text-secondary)] text-sm">
          Nessun dato disponibile
        </div>
      )}
    </div>
  );
});

NoiseHistory.displayName = 'NoiseHistory';
