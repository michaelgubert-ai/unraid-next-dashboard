import React from 'react';

export const FogBackground: React.FC = () => {
  return (
    <div className="fog-background-container" aria-hidden="true">
      {/* 1. Exact Antoine Barrès Mountain Fjord Background from CodePen QWbpqwR */}
      <div className="codepen-mountain-bg" />

      {/* 2. Low Fog Elements across water and mountains */}
      <div className="codepen-fog-low codepen-fog-low-left">
        <img src="/fog-low.png" alt="" />
      </div>
      <div className="codepen-fog-low codepen-fog-low-right">
        <img src="/fog-low.png" alt="" />
      </div>

      {/* 3. Moving Clouds Layer (80s seamless loop from CodePen) */}
      <div className="codepen-moving-clouds" />

      {/* 4. Ambient Filter Overlay for Contrast & Legibility */}
      <div className="codepen-ambient-filter" />
    </div>
  );
};
