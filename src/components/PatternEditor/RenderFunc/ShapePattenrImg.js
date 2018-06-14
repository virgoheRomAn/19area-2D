/**
 * 生成图片的贴花背景，需要随机生成
 * @param {*} shape 
 */
export function buildShapePatternImg(shape) {
    console.time("buildShapePatternImg:" + shape.id);
    let boxRectLines = shape.boxRectLines;
    let shapeWidth = boxRectLines[0].p2.x - boxRectLines[0].p1.x;
    let shapeHeight = boxRectLines[1].p2.y - boxRectLines[1].p1.y;
    let lengthX = Math.ceil(shapeWidth / shape.mask.patchWidth);
    let lengthY = Math.ceil(shapeHeight / shape.mask.patchHeight);
    const MAX = Infinity;//用于限制性能
    if (lengthX > MAX) {
        lengthX = MAX;
    }
    if (lengthY > MAX) {
        lengthY = MAX;
    }
    let maxX = shape.mask.imgWidth - shape.mask.patchWidth;
    let maxY = shape.mask.imgHeight - shape.mask.patchHeight;
    let randomXs = new Array(lengthX).fill(0).map(x => ~~(Math.random() * -maxX));
    let randomYs = new Array(lengthY).fill(0).map(y => ~~(Math.random() * -maxY));
    // shape.mask.randomObject = { shapeWidth, shapeHeight, lengthX, lengthY, maxX, maxY, randomXs, randomYs };
    console.log(shape.id, { shapeWidth, shapeHeight, lengthX, lengthY, maxX, maxY, randomXs, randomYs });
    //截取图片
    let el_img = new Image();
    let el_imgs = [];

    let el_canvas = document.createElement("canvas");
    el_canvas.setAttribute("width", shapeWidth);
    el_canvas.setAttribute("height", shapeHeight);
    let ctx = el_canvas.getContext("2d");

    const SCALE = 0.5;
    let el_canvas_temp = document.createElement("canvas");
    el_canvas_temp.setAttribute("width", shape.mask.patchWidth * SCALE);
    el_canvas_temp.setAttribute("height", shape.mask.patchHeight * SCALE);
    let ctx_temp = el_canvas_temp.getContext("2d");

    el_img.onload = () => {
        let count = 0;
        let count_max = lengthX * lengthY;
        ctx.drawImage(el_img, 0, 0);
        let run = () => {
            if (count >= count_max) {
                //TODO
                console.timeEnd("buildShapePatternImg:" + shape.id);
                return;
            }
            let y = ~~(count / lengthX);
            let x = count % lengthX;
            // console.time("buildShapePatternImg:draw:" + shape.id);
            ctx_temp.drawImage(el_canvas,
                randomXs[x], randomXs[y],
                shape.mask.patchWidth, shape.mask.patchHeight,
                0, 0,
                shape.mask.patchWidth * SCALE, shape.mask.patchHeight * SCALE,
            );
            ctx_temp.drawImage(el_canvas, 0, 0);
            // console.timeEnd("buildShapePatternImg:draw:" + shape.id);
            // console.time("buildShapePatternImg:toBlob:" + shape.id);
            let src = el_canvas_temp.toDataURL();
            if (count == 10) {
                window.open(src);
            }
            // console.timeEnd("buildShapePatternImg:toDataURL:" + shape.id);
            el_img.onload = () => {
                el_imgs.push(el_img);
                count++;
                // console.log("\r\n");
                run();
            }
            el_img.src = src;

            // console.time("buildShapePatternImg:toBlob:" + shape.id);
            // el_canvas_temp.toBlob((blob) => {
            //     console.time("buildShapePatternImg:createObjectURL:" + shape.id);
            //     let src = URL.createObjectURL(blob);
            //     console.timeEnd("buildShapePatternImg:createObjectURL:" + shape.id);
            //     console.timeEnd("buildShapePatternImg:toBlob:" + shape.id);
            //     let el_img = new Image();

            //     console.time("buildShapePatternImg:imgLoad:" + shape.id);
            //     el_img.onload = () => {
            //         el_imgs.push(el_img);
            //         count++;
            //         console.log("\r\n");
            //         run();
            //     }
            //     el_img.src = src;
            //     console.timeEnd("buildShapePatternImg:imgLoad:" + shape.id);
            // });
        };
        run();
    }
    el_img.src = shape.mask.img;
}