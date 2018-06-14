import React from 'react';
export default function () {
  let { man } = this.state;
  return (
    <g
      className="man"
      cursor='move'
      transform={`translate(${man.x-1000},${man.y-1000})`}
      onMouseDown={(e) => {
        this.handleManAdjustStart(man, e);
      }}
    >
      <path
        d={`
          M1000,1000
          L600,200
          M1000,1000
          L1400,200
          A800,800,0,0,0,600,200
        `}
        fill='rgba(0, 0, 0, 0)'
        fillOpacity='1'
        strokeWidth='10'
        stroke='rgb(28, 121, 188)'
      ></path>
      <image x="800" y="870" width="400" height="260" xlinkHref={require('../../../images/man.svg')} />
    </g >
  );
}