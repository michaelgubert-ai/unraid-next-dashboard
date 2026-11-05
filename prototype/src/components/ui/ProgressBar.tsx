import React from 'react';

export interface ProgressBarProps {
  percent: number; // 0 - 100
  variant?: 'accent' | 'healthy' | 'warning' | 'danger' | 'info';
  mode?: 'linear' | 'segmented';
  segmentCount?: number;
  height?: number;
  color?: string;
  gap?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  variant = 'accent',
  mode = 'linear',
  segmentCount = 28,
  height,
  color,
  gap,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  if (mode === 'segmented') {
    const filledSegments = Math.round((clamped / 100) * segmentCount);
    return (
      <div
        className={`segmented-meter ${className}`}
        style={{
          ...(height ? { height: `${height}px` } : {}),
          ...(gap !== undefined ? { gap: `${gap}px` } : {}),
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: segmentCount }).map((_, idx) => {
          const isFilled = idx < filledSegments;
          const segmentStyle: React.CSSProperties | undefined =
            isFilled && color ? { backgroundColor: color } : undefined;
          return (
            <div
              key={idx}
              className={`meter-segment ${
                isFilled ? `filled ${!color && variant !== 'accent' ? `filled-${variant}` : ''}` : ''
              }`}
              style={segmentStyle}
            />
          );
        })}
      </div>
    );
  }

  // Linear mode
  let colorVar = color || 'var(--accent)';
  if (!color) {
    if (variant === 'healthy') colorVar = 'var(--status-healthy)';
    if (variant === 'warning') colorVar = 'var(--status-warning)';
    if (variant === 'danger') colorVar = 'var(--status-danger)';
    if (variant === 'info') colorVar = 'var(--status-info)';
  }

  return (
    <div
      className={`progress-container ${className}`}
      style={height ? { height: `${height}px` } : undefined}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-bar"
        style={{
          width: `${clamped}%`,
          backgroundColor: colorVar,
        }}
      />
    </div>
  );
};

