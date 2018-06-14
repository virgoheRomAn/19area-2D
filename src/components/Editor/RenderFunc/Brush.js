import React from 'react';
import Utils from '../Utils';
export const getBrushJSX = function () {
  let { brush, mouseType } = this.state;
  if (mouseType != 'brush') {
    return;
  }
  if (brush.length == 0) {
    return null;
  }
  let lines = [];
  let texts = [];
  for (let i = 1; i < brush.length; i++) {
    let pPrev = brush[i - 1];
    let pCurrent = brush[i];
    let d = `M${pPrev.x},${pPrev.y} L${pCurrent.x},${pCurrent.y}`;
    lines.push(
      <path
        id={`brush_${i}`}
        key={i}
        d={d}
        style={{
          stroke: '#f00',
          opacity: 0.3,
          // strokeDasharray: '5 5',
          // strokeWidth: 1,
          strokeWidth: this.WALL_WIDTH
        }}
      />
    );
    let center = {
      x: pCurrent.x + (pPrev.x - pCurrent.x) / 2,
      y: pCurrent.y + (pPrev.y - pCurrent.y) / 2,
    };
    let Text = Math.floor(Utils.getDistance(pCurrent, pPrev));
    let Attr = {
      fill: '#2b2b2b',
      dominantBaseline: "middle",
      fontSize: this.FONT_SIZE
    };
    let box = this.getSvgTextRect(Text, Attr);
    texts.push(
      <text
        x={center.x} y={center.y} r={20}
        key={i}
        {...Attr}
        transform={`translate(${-box.width / 2},0)`}
      >{Text}</text>
    )
  }
  let pLast = brush[brush.length - 1];
  return (
    <g id="brush">
      {lines}
      {texts}
      <circle cx={pLast.x} cy={pLast.y} r={this.WALL_WIDTH_HALF / 1.5} style={{
        fill: '#FFF',
        stroke: 'rgb(99,99,99)',
        strokeWidth: 10,
      }} />
    </g>
  );
}
//画笔
export default function () {
  return this.getBrushJSX();
}