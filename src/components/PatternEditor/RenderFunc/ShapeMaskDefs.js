import React from 'react';
function renderMaskDefs(shape, isTemp) {
    let boxRectLines = shape.boxRectLines;
    let shapWidth = Math.abs(boxRectLines[0].p1.x - boxRectLines[1].p1.x);
    let shapHeight = Math.abs(boxRectLines[0].p1.y - boxRectLines[3].p1.y);
    let gapWidthHalf = Math.floor(shape.mask.gapWidth / 2);
    let patchWidthHalf = Math.floor(shape.mask.patchWidth / 2);
    let patchHeightHalf = Math.floor(shape.mask.patchHeight / 2);
    let offsetG = 250; // 工字铺偏移常量
    // let offsetHeight = patchHeightHalf / Math.sqrt(2) + patchWidthHalf / Math.sqrt(2) - patchHeightHalf;
    let offsetHeight = patchHeightHalf;

    // let { lengthX, lengthY, maxX, maxY, randomXs, randomYs } = shape.mask.randomObject;

    /* 默认平铺 */
    if (shape.mask.type == 0) {
        let patternWidth = shape.mask.patchWidth + shape.mask.gapWidth;
        let patternHeight = shape.mask.patchHeight + shape.mask.gapWidth;
        return (<pattern
            id={shape.id + '_pattern' + (isTemp ? '_temp' : '')}
            x={0} y={0}
            width={patternWidth} height={patternHeight}
            // width={patternWidth * lengthX} height={patternHeight * lengthY}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${boxRectLines[0].p1.x + shape.mask.centerOffset.x},${boxRectLines[0].p1.y + shape.mask.centerOffset.y}) rotate(${shape.mask.rotate},${shapWidth / 2 - shape.mask.centerOffset.x},${shapHeight / 2 - shape.mask.centerOffset.y})`}
        >
            <rect
                x="0" y="0"
                width={patternWidth} height={patternHeight}
                // width={patternWidth * lengthX} height={patternHeight * lengthY}
                fill={shape.mask.gapColor}
            />
            <image x={gapWidthHalf} y={gapWidthHalf}
                crossOrigin=""
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xlinkHref={shape.mask.img}
                preserveAspectRatio="xMinYMin slice"
                width={shape.mask.patchWidth} height={shape.mask.patchHeight}
            />
            {/* {new Array(lengthX * lengthY).fill(0).map((item, index) => {
                let indexY = ~~(index / lengthX), indexX = index % lengthX;
                let startX = patternWidth * indexX, startY = patternHeight * indexY;
                return (
                    <rect
                        key={index}
                        x={startX} y={startY}
                        width={shape.mask.patchWidth} height={shape.mask.patchHeight}
                        fill={`url(#${shape.id + '_randomimg_' + index + (isTemp ? '_temp' : '')})`}
                    />
                )
            })} */}
        </pattern>);
    }
    /* 工字铺 */
    if (shape.mask.type == 1) {
        let patternWidth = shape.mask.patchWidth + shape.mask.gapWidth;
        let patternHeight = shape.mask.patchHeight * 2 + shape.mask.gapWidth * 2;
        return (<pattern
            id={shape.id + '_pattern' + (isTemp ? '_temp' : '')}
            x={0} y={0}
            width={patternWidth} height={patternHeight}
            // width={patternWidth * lengthY} height={patternHeight * lengthY}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${boxRectLines[0].p1.x + shape.mask.centerOffset.x},${boxRectLines[0].p1.y + shape.mask.centerOffset.y}) rotate(${shape.mask.rotate},${shapWidth / 2 - shape.mask.centerOffset.x},${shapHeight / 2 - shape.mask.centerOffset.y})`}
        >
            <rect
                x="0" y="0"
                width={patternWidth} height={patternHeight}
                // width={patternWidth * lengthX } height={patternHeight * lengthY}
                fill={shape.mask.gapColor}
            />
            {new Array(3).fill().map((item, rindex) => {
                let x = 0;
                let y = 0;

                if (rindex == 0) {
                    x += 0
                    y += 0
                } else if (rindex == 1) {
                    x += offsetG - shape.mask.patchWidth - shape.mask.gapWidth;
                    y += shape.mask.patchHeight + shape.mask.gapWidth
                } else {
                    x += offsetG;
                    y += shape.mask.patchHeight + shape.mask.gapWidth
                }
                return (
                    <image
                        key={rindex}
                        crossOrigin=""
                        x={x} y={y}
                        width={shape.mask.patchWidth}
                        height={shape.mask.patchHeight}
                        xlinkHref={shape.mask.img}
                    />
                )
            })}
            {/* {new Array(lengthX * lengthY).fill(0).map((item, index) => {
                let indexY = ~~(index / lengthX), indexX = index % lengthX;
                let startX = patternWidth * indexX, startY = patternHeight * indexY;
                return (
                    <g
                        key={index}
                    >
                        {new Array(3).fill().map((item, rindex) => {
                            let x = startX;
                            let y = startY;

                            if (rindex == 0) {
                                x += 0
                                y += 0
                            } else if (rindex == 1) {
                                x += offsetG - shape.mask.patchWidth - shape.mask.gapWidth;
                                y += shape.mask.patchHeight + shape.mask.gapWidth
                            } else {
                                x += offsetG;
                                y += shape.mask.patchHeight + shape.mask.gapWidth
                            }
                            return (
                                <rect
                                    key={rindex}
                                    x={x} y={y}
                                    width={shape.mask.patchWidth} height={shape.mask.patchHeight}
                                    fill={`url(#${shape.id + '_randomimg_' + index + (isTemp ? '_temp' : '')})`}
                                />
                            )
                        })}
                    </g>
                )
            })} */}

        </pattern>);
    }
    /**人字铺 */
    if (shape.mask.type == 2) {
        return (<pattern
            id={shape.id + '_pattern' + (isTemp ? '_temp' : '')}
            x={0} y={0}
            width={Math.sqrt(2) * shape.mask.patchWidth + shape.mask.gapWidth}
            height={Math.sqrt(2) * shape.mask.patchHeight + shape.mask.gapWidth}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${boxRectLines[0].p1.x + shape.mask.centerOffset.x},${boxRectLines[0].p1.y + shape.mask.centerOffset.y}) rotate(${shape.mask.rotate},${shapWidth / 2 - shape.mask.centerOffset.x},${shapHeight / 2 - shape.mask.centerOffset.y})`}
        >
            <rect
                x="0" y="0"
                width={shape.mask.patchWidth * 4} height={shape.mask.patchHeight * 10 + shape.mask.gapWidth}
                fill={shape.mask.gapColor}
            />

            {new Array(Math.floor((shape.mask.patchWidth / 2 / shape.mask.patchHeight) + 2) * 2 + 3).fill().map((item, index) => {

                let x = 0;
                let y = 0;
                let rot = 0;
                let rotX = 0;
                let rotY = 0;

                if (index < (Math.floor((shape.mask.patchWidth / 2 / shape.mask.patchHeight)) + 2)) {
                    rot = -45;
                    x = 0
                    y = Math.floor((Math.sqrt(2) * shape.mask.patchHeight - shape.mask.patchHeight) + (index * ((Math.sqrt(2) * shape.mask.patchHeight) + shape.mask.gapWidth)));
                    rotX = 0;
                    rotY = Math.floor(Math.sqrt(2) * shape.mask.patchHeight + (index * ((Math.sqrt(2) * shape.mask.patchHeight) + shape.mask.gapWidth)))

                } else if (index >= (Math.floor((shape.mask.patchWidth / 2 / shape.mask.patchHeight)) + 2) && index < (Math.floor((shape.mask.patchWidth / 2 / shape.mask.patchHeight)) + 2) * 2 + 1) {
                    rot = 225
                    x = Math.sqrt(2) * shape.mask.patchWidth + shape.mask.gapWidth / 2
                    y = -shape.mask.patchHeight + (index - (Math.floor((shape.mask.patchWidth / 2 / shape.mask.patchHeight)) + 2)) * (((Math.sqrt(2)) * shape.mask.patchHeight) + shape.mask.gapWidth) - shape.mask.gapWidth / 2
                    rotX = Math.sqrt(2) * shape.mask.patchWidth + shape.mask.gapWidth / 2
                    rotY = (index - (Math.floor((shape.mask.patchWidth / 2 / shape.mask.patchHeight)) + 2)) * (((Math.sqrt(2)) * shape.mask.patchHeight) + shape.mask.gapWidth) - shape.mask.gapWidth / 2

                } else {
                    rot = -45;
                    x = Math.floor(Math.sqrt(2) * (shape.mask.patchWidth - shape.mask.patchHeight) + Math.sqrt(2) * shape.mask.patchHeight) + shape.mask.gapWidth + 1
                    y = Math.floor((Math.sqrt(2) * shape.mask.patchHeight - shape.mask.patchHeight)) + 1
                    rotX = Math.floor(Math.sqrt(2) * (shape.mask.patchWidth - shape.mask.patchHeight) + Math.sqrt(2) * shape.mask.patchHeight) + shape.mask.gapWidth + 1
                    rotY = Math.floor(Math.sqrt(2) * shape.mask.patchHeight) + 1
                }
                return (
                    <image
                        crossOrigin=""
                        key={index}
                        x={x} y={y}
                        width={shape.mask.patchWidth}
                        height={shape.mask.patchHeight}
                        transform={`rotate(${rot},${rotX},${rotY})`}
                        xlinkHref={shape.mask.img}
                    />
                )
            })}

        </pattern>)
    }
}
export default renderMaskDefs;