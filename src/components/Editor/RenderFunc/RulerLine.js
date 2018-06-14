import React from 'react';
import Utils from '../Utils';
import ReactDOM from 'react-dom';
export const removeRulerLine = function () {
  let el_temp = document.getElementById('rulerLine' + 'temp');
  el_temp && (el_temp.parentNode.removeChild(el_temp));
  let el_assistline = document.getElementById('rulerLine');
  el_assistline && (el_assistline.style.visibility = 'hidden');
}
export const reRnderRulerLine = function () {
  let render2 = render.bind(this);
  let jsx = render2();
  let el_assistline = document.getElementById('rulerLine');
  let el_temp = document.getElementById('rulerLine' + 'temp');
  if (!el_temp) {
    el_temp = this.createSvgTag('g', {});
    el_temp.setAttribute("id", 'rulerLine' + 'temp');
    this.refs.svg.appendChild(el_temp);
    // debugger;
  }
  el_assistline && (el_assistline.style.visibility = 'hidden');
  ReactDOM.render(jsx, el_temp);
}
//辅助线
const render = function () {
  let { rulerLine } = this.state;
  return (
    <g
      id="rulerLine"
    >
        {rulerLine.map((r,index)=>{
            return (
                <g key = {index}>
                    <line 
                        key = {index}
                        x1={r.p1.x}
                        y1={r.p1.y} 
                        x2={r.p2.x}
                        y2={r.p2.y}
                        stroke={r.color}
                        strokeWidth='30'
                    />
                    <text 
                            
                            x={r.p1.x + (r.p2.x - r.p1.x)/2} y={r.p1.y+(r.p2.y - r.p1.y)/2} 
                            transform={`rotate(${r.rotate} ${r.p1.x + (r.p2.x - r.p1.x)/2},${r.p1.y+(r.p2.y - r.p1.y)/2})`}
                            fontFamily="Verdana" 
                            fontSize="200">
                        {r.distance}
                    </text>
                </g>
            )
        })}
    </g>
  );
}
export default render;