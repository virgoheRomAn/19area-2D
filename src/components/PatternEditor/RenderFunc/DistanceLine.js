import React from 'react';
import Utils, { getRoate } from '../../Editor/Utils'
require("./DistanceLine.less");
//绘制距离辅助线，最小依赖数据 p1,p2 disntance
export const getDistanceLineJSX = function (distanceLines, hashRef) {
    if (this.state.isSavePending) {
        return <g />;
    }
    return (
        <g className="distancelines" ref={hashRef ? "distancelines" : undefined}>
            {distanceLines.map((distanceLine, index) => {
                let { p1, p2 } = distanceLine;
                return (
                    <g
                        key={index}
                        className="distanceline"
                    >
                        <line className="line"
                            x1={p1.x} y1={p1.y}
                            x2={p2.x} y2={p2.y}
                        />
                        <circle className="circle" cx={p1.x} cy={p1.y} r={20} />
                        <circle className="circle" cx={p2.x} cy={p2.y} r={20} />
                    </g>
                )
            })}
        </g>
    )
}
export default function () {
    let { distanceLines } = this.state;
    return this.getDistanceLineJSX(distanceLines, true);
}