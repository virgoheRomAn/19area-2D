import React from 'react';
import Utils, { getRoate } from '../../Editor/Utils'
import { getShapeJSX } from './Shape';
require("./Shapes.less");
export default function () {
  let { data: { shapes }, isSavePending } = this.state;
  if (!shapes) {
    return "";
  }
  let shapeTop = shapes[0];
  return (
    <g
      className="shapes"
    >
      {shapes.filter((shape) => {
        //没有3个点无法组成一个形状
        return shape.points.length >= 3
      }).map((shape, sindex) => {
        return this.renderShape(shape, sindex);
      })}

      <g
        className="exclude"
      >
        {(shapeTop.exclude && !isSavePending) && shapeTop.exclude.map((points, index) => {
          let p = points[0];
          let d = `M${p.x},${p.y}\n`;
          let lines = [];

          for (let i = 1; i < points.length; i++) {
            lines.push({ p1: p, p2: points[i] });
            p = points[i];
            d += `L${p.x},${p.y}\n`;
          }
          d += "Z";
          return (<path key={"exclude-" + index} d={d} />);
        })}
      </g>
    </g>
  );
}