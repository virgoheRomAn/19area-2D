import React from 'react';
export default function () {
  let { grid, isSavePending } = this.state;
  if (!grid || isSavePending) {
    return <g className="grids" />
  }
  return (
    <g
      className="grids">
      <path
        d={grid.d}
        fill='rgba(0, 0, 0, 0)'
        fillOpacity='1'
        strokeWidth='10'
        stroke='#f5f5f5'
      // stroke='rgba(0, 0, 0, 1)'
      />
    </g>
  );
}