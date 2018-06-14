import React from 'react';
import Utils, { getRoate } from '../../Editor/Utils'
require("./inputVals.less");
//绘制距离辅助线输入框，最小依赖数据 p1,p2 disntance,callback
export const getInputValJSX = function (distanceLines, hashRef) {
    let { viewBox } = this.state;

    let handleFn = (e, index) => {
        console.log(e.target.value);
    }

    return (
        <div className="inputVals" ref={hashRef ? "inputVals" : undefined}>
            {distanceLines.map((distanceLine, index) => {
                let { p1, p2 } = distanceLine;
                let style = {
                    left: ((p1.x - p2.x) / 2 + p2.x - viewBox.x) / viewBox.scaleX,
                    top: ((p1.y - p2.y) / 2 + p2.y - viewBox.y) / viewBox.scaleY + 87
                }
                let distance = Math.abs(~~distanceLine.distance);
                // let distance = ~~distanceLine.distance;
                return (
                    <input
                        key={`${index}_${distance}`}
                        readOnly={distanceLine.readOnly}
                        type="number"
                        onKeyUp={(e) => {
                            if (e.keyCode == 13) {
                                let value = parseInt(e.target.value);
                                if (value < 0) {
                                    return;
                                }
                                distanceLine.callback(e, index);
                            }
                        }} onBlur={(e) => {
                            if (distanceLine.readOnly) return;
                            distanceLine.callback(e, index);
                        }} type="text" min={0} step={1} style={style} defaultValue={distance}
                    />
                )
            })}
        </div>
    )

}

export default function () {
    let { distanceLines } = this.state;
    return this.getInputValJSX(distanceLines, true);
}