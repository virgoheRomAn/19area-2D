import React from 'react';
import Utils, { getRoate, getShapBoxRectLines } from '../../Editor/Utils';
// import { buildShapePatternImg } from './ShapePattenrImg';
require("./Shape.less");
//定义铺砖
function renderPathsDefs(shape, isTemp) {
    let boxRectLines = shape.boxRectLines;
    let shapWidth = Math.abs(boxRectLines[0].p1.x - boxRectLines[1].p1.x);
    let shapHeight = Math.abs(boxRectLines[0].p1.y - boxRectLines[3].p1.y);

    //如果是用户上传的svg
    if (shape.type == 1) {
        return shape.paths.map((path, index) => {
            let mask = path.mask;
            if (!mask.img) {
                return undefined;
            }
            return (
                <pattern
                    key={"paths_" + index}
                    id={`${shape.id}_${index}_paths_pattern` + (isTemp ? '_temp' : '')}
                    x={0} y={0}
                    width={mask.patchWidth} height={mask.patchHeight}
                    patternUnits="userSpaceOnUse"
                // patternTransform={`translate(${boxRectLines[0].p1.x + mask.centerOffset.x},${boxRectLines[0].p1.y + mask.centerOffset.y}) rotate(${mask.rotate},${shapWidth / 2},${shapHeight / 2})`}
                >
                    <image
                        crossOrigin=""
                        x={0} y={0}
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        xlinkHref={mask.img}
                        preserveAspectRatio="xMinYMin slice"
                        width={mask.patchWidth} height={mask.patchHeight}
                    />
                </pattern>
            )
        });
    }
    return undefined;
}
export const getShapeJSX = function (shape, sindex, isTemp) {
    let { data: { shapes }, mouseType, isSavePending, pendingShape } = this.state;
    let points = shape.points;
    let p = points[0];
    let d = `M${p.x},${p.y}\n`;
    let lines = [];

    for (let i = 1; i < points.length; i++) {
        lines.push({ p1: p, p2: points[i] });
        p = points[i];
        d += `L${p.x},${p.y}\n`;
    }
    d += "Z";
    lines.push({ p1: p, p2: points[0], shape });
    shape.d = d;
    shape.lines = lines;
    let boxRectLines = getShapBoxRectLines(shape);
    shape.boxRectLines = boxRectLines;
    if (shape.showRectLines) {
        p = boxRectLines[0].p1;
        let rectd = `M${p.x},${p.y}\n`;
        for (let i = 1; i < boxRectLines.length; i++) {
            p = boxRectLines[i].p1;
            rectd += `L${p.x},${p.y}\n`;
        }
        rectd += "Z";
        shape.rectd = rectd;
    } else {
        shape.rectd = null;
    }

    //如果是用户上传的svg ，需要计算缩放比例
    let pathsScale;
    if (shape.type === 1) {

        //原始的点
        let op1 = shape.oPoints[0];
        let op2 = shape.oPoints[2];
        //原始的x,y距离
        let ox = op2.x - op1.x;
        let oy = op2.y - op1.y;
        //现在的点
        let p1 = shape.points[0];
        let p2 = shape.points[2];
        //现在x,y距离
        let x = p2.x - p1.x;
        let y = p2.y - p1.y;
        //缩放比例
        pathsScale = {
            x: x / ox,
            y: y / oy,
        }
    }
    //如果是绘制的形状，需要随机拼花
    // if (shape.type === 0 && shape.mask.img && !shape.mask.randomObject) {
    //     let shapeWidth = boxRectLines[0].p2.x - boxRectLines[0].p1.x;
    //     let shapeHeight = boxRectLines[1].p2.y - boxRectLines[1].p1.y;
    //     let lengthX = Math.ceil(shapeWidth / shape.mask.patchWidth);
    //     let lengthY = Math.ceil(shapeHeight / shape.mask.patchHeight);
    //     const MAX = 6;//用于限制性能
    //     if (lengthX > MAX) {
    //         lengthX = MAX;
    //     }
    //     if (lengthY > MAX) {
    //         lengthY = MAX;
    //     }
    //     let maxX = shape.mask.imgWidth - shape.mask.patchWidth;
    //     let maxY = shape.mask.imgHeight - shape.mask.patchHeight;
    //     let randomXs = new Array(lengthX).fill(0).map(x => ~~(Math.random() * -maxX));
    //     let randomYs = new Array(lengthY).fill(0).map(y => ~~(Math.random() * -maxY));
    //     shape.mask.randomObject = { shapeWidth, shapeHeight, lengthX, lengthY, maxX, maxY, randomXs, randomYs };
    //     console.log(shape.id, shape.mask.randomObject);

    //     //废弃canvas方案
    //     // buildShapePatternImg(shape);
    // }
    return (
        <g
            className={shape.active ? 'shape active' : 'shape'}
            opacity={(pendingShape && pendingShape.id != shape.id) ? 0 : 1}
            key={shape.id}
            id={shape.id}
            // clipPath={shape.id != ("id_shape_top" + (isTemp ? '_temp' : '')) ? `url(#id_shape_top_clip${(isTemp ? '_temp' : '')})` : ''}
            onMouseOver={() => {
                // console.log('onMouseOver');
                shape.isOver = true;
            }}
            onMouseLeave={() => {
                // console.log('onMouseLeave');
                shape.isOver = false;
            }}
            onMouseDown={(e) => {
                // console.log('onMouseDown', shape.id);
                e.preventDefault();
                e.stopPropagation();
                if (!shape.active) {
                    shapes.forEach((shape) => {
                        shape.active = false;
                        shape.boxRectLines = null;
                    });
                    this.state.distanceLines = [];
                    shape.active = true;
                }
                // this.calcBoxLine(shape);
                if (shape.parent || mouseType == 'move') {
                    this.handleShapeLocationStart(e, { shape, sindex });
                }
                this.setState({ __record__: false });
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleRightMenu(e, shape, sindex);
                let func = (e) => {
                    //TODO 判断是否点击了菜单子项
                    let el_rightMent = document.querySelector(".rightMenu");
                    if (el_rightMent && el_rightMent.contains(e.target)) {
                        return;
                    }
                    this.handleRightMenu();
                    document.removeEventListener("mousedown", func);
                };
                document.addEventListener("click", func);
            }}
        >

            <defs>
                {/* {(shape.mask.img && shape.mask.randomObject) && this.renderMaskRandomImg(shape, isTemp)} */}
                {/* {(shape.mask.img && shape.mask.randomObject) && this.renderMaskDefs(shape, isTemp)} */}
                {(shape.mask.img) && this.renderMaskDefs(shape, isTemp)}
                {(shape.type === 1) && renderPathsDefs(shape, isTemp)}
                {shape.id == "id_shape_top" &&
                    <clipPath id={"id_shape_top_clip" + (isTemp ? '_temp' : '')}>
                        <path
                            d={shape.d}
                            strokeWidth={isSavePending ? undefined : '30'}
                            stroke='#acacac'
                        />
                    </clipPath>
                }
            </defs>

            {shape.type != 1 &&
                <path
                    d={shape.rectd}
                    fillOpacity='0'
                    strokeWidth={isSavePending ? undefined : '10'}
                    stroke='#00FFFE'
                    strokeDasharray="10,5"
                    className="path-rectd"
                />
            }
            {/* 上传的svg形状 */}
            {shape.type === 1 &&
                <g
                    className="paths"
                    transform={`translate(${shape.points[0].x - shape.oPoints[0].x},${shape.points[0].y - shape.oPoints[0].y}) scale(${pathsScale.x},${pathsScale.y})`}
                >
                    {shape.paths.map((path, index) => {
                        return (<path
                            key={index}
                            d={path.d}
                            fillOpacity={path.mask.img ? 1 : 0}
                            fill={path.mask.img ? `url(#${`${shape.id}_${index}_paths_pattern${(isTemp ? '_temp' : '')}`})` : "#e8eae9"}
                            onMouseEnter={() => {
                                // console.log('onMouseOver path', index);
                                shape.isOver = path.isOver = true;
                            }}
                            onMouseOut={() => {
                                // console.log('onMouseLeave path', index);
                                shape.isOver = path.isOver = false;
                            }} />
                        )
                    })}
                </g>
            }
            {(shape.type != 1 || shape.active) &&
                <path
                    d={shape.d}
                    strokeWidth={isSavePending ? undefined : '10'}
                    fillOpacity={shape.type === 1 ? 0 : 1}
                    stroke='#acacac'
                    className="path"
                    pointerEvents={(mouseType == 'put' && shape.type == 1) ? "none" : undefined}
                    fill={shape.type === 1 ? undefined : (shape.mask.img ? `url(#${shape.id + '_pattern' + (isTemp ? '_temp' : '')})` : '#e8eae9')}
                />
            }
            {/* 页面绘制的形状 */}
            <g
                className="lines"
                pointerEvents={mouseType == 'put' ? "none" : undefined}
            >
                {shape.lines.map((line, lindex) => {
                    let rotate = getRoate(line.p1, line.p2);
                    let isHorizontal = rotate == 90 || rotate == 270//是否垂直（树立）

                    line.rotate = rotate;
                    line.isHorizontal = isHorizontal;
                    line.shape = shape;
                    // console.log(rotate);
                    return (
                        <line
                            className="line"
                            key={lindex}
                            x1={line.p1.x} y1={line.p1.y}
                            x2={line.p2.x} y2={line.p2.y}
                            strokeWidth={isSavePending ? undefined : '30'}
                            stroke='#acacac'
                            style={{
                                cursor: isHorizontal ? "ew-resize" : "ns-resize"
                            }}
                            onMouseOver={() => {
                                // console.log('onMouseOver');
                                shape.isOver = true;
                            }}
                            onMouseLeave={() => {
                                // console.log('onMouseLeave');
                                shape.isOver = false;
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                shapes.forEach((shape) => {
                                    shape.active = false;
                                });
                                shape.active = true;

                                // console.log("shape:", sindex, "line:", lindex);
                                if (!!shape.parent) {
                                    this.handleShapeAdjustStart(e, { shape, sindex, lindex, isHorizontal });
                                }
                            }}
                        />
                    )
                })}
            </g>

        </g >
    );
}
export default function (shape, sindex) {
    return this.getShapeJSX(shape, sindex, false);
}