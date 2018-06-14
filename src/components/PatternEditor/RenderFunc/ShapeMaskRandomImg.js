import React from 'react';
function renderMaskRandomImg(shape, isTemp) {
    let { shapeWidth, shapeHeight, lengthX, lengthY, maxX, maxY, randomXs, randomYs } = shape.mask.randomObject;
    let { gapWidth, imgWidth, imgHeight, img, patchWidth, patchHeight } = shape.mask;
    // console.log(imgHeight, gapWidth, imgHeight + gapWidth);
    return new Array(lengthX * lengthY).fill(0).map((item, index) => {
        let y = ~~(index / lengthX);
        let x = index % lengthX;
        let id = shape.id + '_randomimg_' + index + (isTemp ? '_temp' : '');
        return (
            <pattern
                key={id}
                id={id}
                id={shape.id + '_randomimg_' + index + (isTemp ? '_temp' : '')}
                x={0} y={0}
                width={shape.mask.patchWidth} height={shape.mask.patchHeight}
                patternUnits="userSpaceOnUse"
                patternTransform={`translate(${(patchWidth + gapWidth) * x},${(patchHeight + gapWidth) * y})`}
            >
                <image
                    crossOrigin=""
                    x={randomXs[x]}
                    y={randomYs[y]}
                    width={imgWidth}
                    height={imgHeight}
                    xlinkHref={img}
                />
            </pattern>
        )
    })
}

export default renderMaskRandomImg;