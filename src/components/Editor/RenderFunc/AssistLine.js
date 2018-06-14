import React from 'react';
import Utils from '../Utils';
import ReactDOM from 'react-dom';
export const removeAssistLine = function () {
  let el_temp = document.getElementById('AssistLine' + 'temp');
  el_temp && (el_temp.parentNode.removeChild(el_temp));
  let el_assistline = document.getElementById('AssistLine');
  el_assistline && (el_assistline.style.visibility = 'inherit');
}
export const reRnderAssistLine = function () {
  let render2 = render.bind(this);
  let jsx = render2();
  let el_assistline = document.getElementById('AssistLine');
  let el_temp = document.getElementById('AssistLine' + 'temp');
  if (!el_temp) {
    el_temp = this.createSvgTag('g', {});
    el_temp.setAttribute("id", 'AssistLine' + 'temp');
    this.refs.svg.appendChild(el_temp);
    // debugger;
  }
  el_assistline && (el_assistline.style.visibility = 'hidden');
  ReactDOM.render(jsx, el_temp);
}
//辅助线
const render = function () {
  let { AssistLine } = this.state;
  return (
    <g
      id="AssistLine"
    >
      {AssistLine.map((item, index) => {
        let start = Utils.getLineEndDot(item.p1, item.roate, this.state.viewBox.width);
        let end = Utils.getLineEndDot(item.p2, item.roate + 180, this.state.viewBox.width);
        let dAssist = `
          M${start.x},${start.y}
          L${end.x},${end.y}
          `;
        return (
          <path
            key={index}
            d={dAssist}
            fillOpacity='1'
            fill='#00CCCB'
            strokeWidth='10'
            stroke='#00CCCB'
          ></path>
        )
      })}
    </g>
  );
}
export default render;