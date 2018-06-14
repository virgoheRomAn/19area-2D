import React from 'react';
export default function () {
  let { grid } = this.state;
  if (!grid) {
    return "";
  }
  return (
    <g >
      <path
        d={grid.d}
        fill='rgba(0, 0, 0, 0)'
        fillOpacity='1'
        strokeWidth='10'
        stroke='#f5f5f5'
      />
    </g>
  );
}