import React from 'react';
import ReactDOM from 'react-dom';
import { message } from 'antd';
import Utils from '../Utils';

export const removeBrushInput = function () {
  let el_temp = document.getElementById('brushInput' + 'temp');
  el_temp && (el_temp.parentNode.removeChild(el_temp));
}
export const reRnderBrushInput = function () {
  let render2 = render.bind(this);
  let jsx = render2();
  let el_input = document.getElementById('brushInput');
  if (!el_input) {
    return;
  }
  let el_temp = document.getElementById('brushInput' + 'temp');
  if (!el_temp) {
    el_temp = document.createElement('div');
    el_temp.setAttribute("id", 'brushInput' + 'temp');
    el_input.parentNode.insertBefore(el_temp, el_input);
    el_input.style.visibility = 'hidden';
    // debugger;
  }
  ReactDOM.render(jsx, el_temp);
}
const render = function () {
  let { brush } = this.state;
  if (brush.length < 2) {
    return;
  }
  let p1 = brush[brush.length - 2];
  let p2 = brush[brush.length - 1];

  let inputStylen = (item) => {
    return {
      display: "inline",
      position: "fixed",
      width: 40,
      border: '1px solid #00cccb',
      outline: "none",
    }
  }
  return (
    <input id="brushInput" type="text" style={inputStylen()}
      // value={
      //   parseInt(Utils.getDistance(p1, p2))
      // }
      onKeyDown={(e) => {
        // e.stopPropagation();
        if (e.keyCode == 13) {
          brush.pop();
          let distance = parseInt(e.target.value);
          let roate = Utils.getRoate(p1, p2);
          let p = Utils.getLineEndDot(p1, roate, distance);
          brush.push({
            x: p.x,
            y: p.y,
          });
          brush.push({
            x: p.x,
            y: p.y,
          });
          this.setState({});
          e.target.value = "0";
          e.target.style.display = 'none';
          e.target.setAttribute('disable', 'disable');
          e.target.setAttribute('readonly', 'readonly');
        }
      }}
    />
  );
}
export default render;