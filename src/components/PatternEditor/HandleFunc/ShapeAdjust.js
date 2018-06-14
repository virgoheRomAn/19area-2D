import Utils, { getClosetParallelLine } from '../../Editor/Utils';

//计算拖动时的距离辅助线
export const calcDistanceLine = function () {
    let { shape, sindex, lindex, isHorizontal, cursor } = this.shapeAdjustOpt;
    let olines = [];
    let { data: { shapes } } = this.state;
    shapes.forEach((shape) => {
        olines = olines.concat(shape.lines);
    });

    let line = shape.lines[lindex];
    this.state.distanceLines = getClosetParallelLine(olines, line);
    //添加回调
    this.state.distanceLines.forEach((distanceLine) => {
        distanceLine.callback = (e, index) => {
            let value = e.target.value;
            let offset = (value - Math.abs(distanceLine.distance)) * (distanceLine.distance >= 1 ? -1 : 1);
            // console.log(value, distanceLine.distance, offset);
            let lines = shape.lines;


            let precent = offset / Math.abs(distanceLine.distance);
            let patch = Utils.getDistance(lines[lindex].p1, lines[lindex].p2) * precent;
            if (isHorizontal) {
                lines[lindex].p1.x += offset;
                lines[lindex].p2.x += offset;
                //用户上传svg 等比缩放
                if (shape.type === 1) {
                    let shapeIndex = lindex;
                    if (shapeIndex === 3) {
                        patch *= -1;
                    }
                    shapeIndex = 2;
                    lines[shapeIndex].p1.y += patch;
                    lines[shapeIndex].p2.y += patch;
                }

                let shape_top = shapes.find(x => x.id == 'id_shape_top');
                if (shape.points.findIndex((p) => {
                    return !Utils.isInPolygon(p, shape_top.points);
                }) != -1) {
                    //如果有一个点不在顶层内，判定为不合法,还原位置
                    lines[lindex].p1.x -= offset;
                    lines[lindex].p2.x -= offset;
                    //用户上传svg 等比缩放
                    if (shape.type === 1) {
                        let shapeIndex = lindex;
                        if (shapeIndex === 3) {
                            patch *= -1;
                        }
                        shapeIndex = 2;
                        lines[shapeIndex].p1.y -= patch;
                        lines[shapeIndex].p2.y -= patch;
                    }
                    return;
                } else {
                    this.calcDistanceLine();
                    this.setState({ __record__: true });
                }
            } else {
                lines[lindex].p1.y += offset;
                lines[lindex].p2.y += offset;
                //用户上传svg 等比缩放
                if (shape.type === 1) {
                    let shapeIndex = lindex;
                    if (shapeIndex === 0) {
                        patch *= -1;
                    }
                    shapeIndex = 1;
                    lines[shapeIndex].p1.x += patch;
                    lines[shapeIndex].p2.x += patch;
                }

                let shape_top = shapes.find(x => x.id == 'id_shape_top');
                if (shape.points.findIndex((p) => {
                    return !Utils.isInPolygon(p, shape_top.points);
                }) != -1) {
                    //如果有一个点不在顶层内，判定为不合法,还原位置
                    lines[lindex].p1.y -= offset;
                    lines[lindex].p2.y -= offset;
                    //用户上传svg 等比缩放
                    if (shape.type === 1) {
                        let shapeIndex = lindex;
                        if (shapeIndex === 0) {
                            patch *= -1;
                        }
                        shapeIndex = 1;
                        lines[shapeIndex].p1.x -= patch;
                        lines[shapeIndex].p2.x -= patch;
                    }
                    return;
                } else {
                    this.calcDistanceLine();
                    this.setState({ __record__: true });
                }
            }
        }
    })
    // console.table(this.state.distanceLines);
}
//计算点击时的距离辅助线
export const calcBoxLine = function (shape) {
    this.state.distanceLines = shape.lines.map((line) => {
        let distanceLine = {};
        if (line.isHorizontal) {
            distanceLine = {
                p1: { x: line.p1.x - 100, y: line.p1.y },
                p2: { x: line.p2.x - 100, y: line.p2.y },
                distance: line.p1.y - line.p2.y
            }
        } else {
            distanceLine = {
                p1: { x: line.p1.x, y: line.p1.y - 100 },
                p2: { x: line.p2.x, y: line.p2.y - 100 },
                distance: line.p1.x - line.p2x
            }
        }
        return distanceLine;
    });
    //添加回调
    this.state.distanceLines.forEach((distanceLine) => {
        distanceLine.callback = (e, index) => {
            // let value = e.target.value;
            // let offset = (value - Math.abs(distanceLine.distance)) * (distanceLine.distance >= 1 ? -1 : 1);
            // console.log(value, distanceLine.distance, offset);

            // let lines = shape.lines;
            // if (isHorizontal) {
            //     lines[lindex].p1.x += offset;
            //     lines[lindex].p2.x += offset;
            // } else {
            //     lines[lindex].p1.y += offset;
            //     lines[lindex].p2.y += offset;
            // }
            // this.calcBoxLine();
            // this.setState({ __record__: true });
        }
    })
}
//拖动点调节
export const handleShapeAdjustStart = function (e, { shape, sindex, lindex, isHorizontal }) {
    // console.log(shape, sindex, lines, lindex, isHorizontal);
    // e.stopPropagation();
    // e.preventDefault();
    e = this.eventWarp(e);
    this.pShapeStart = this.pShapeEnd = {
        x: e.pageX,
        y: e.pageY,
    }
    let elem_svg = this.refs.svg;

    let cursor = elem_svg.style.cursor;
    elem_svg.style.cursor = isHorizontal ? "ew-resize" : "ns-resize";
    let oPoints = shape.points.map((point) => { return { ...point } });
    this.shapeAdjustOpt = { shape, sindex, lindex, isHorizontal, cursor, oPoints };
    shape.showRectLines = false;
    this.calcDistanceLine();
    this.setState({ __record__: false });

    document.addEventListener('mousemove', this.handleShapeAdjustMove);
    document.addEventListener('mouseup', this.handleShapeAdjustEnd);

}
export const handleShapeAdjustMove = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e);
    this.pShapeEnd = {
        x: e.pageX,
        y: e.pageY,
    };
    let { shape, sindex, lindex, isHorizontal, cursor } = this.shapeAdjustOpt;
    let lines = shape.lines;
    let proto, reverseProto;
    if (isHorizontal) {
        proto = 'x';
        reverseProto = 'y';
    } else {
        proto = 'y';
        reverseProto = 'x';
    }
    let offset = this.pShapeEnd[proto] - this.pShapeStart[proto];
    lines[lindex].p1[proto] += offset;
    lines[lindex].p2[proto] += offset;
    let patch = 0;
    if (shape.type === 1) {
        //用户上传svg 等比缩放
        let nextIndex = (lindex + 1) % 4;
        let precent = offset / Utils.getDistance(lines[nextIndex].p1, lines[nextIndex].p2);
        patch = Utils.getDistance(lines[lindex].p1, lines[lindex].p2) * precent;
        lines[nextIndex].p1[reverseProto] -= patch;
        lines[nextIndex].p2[reverseProto] -= patch;
    }
    this.pShapeStart = this.pShapeEnd;
    this.calcDistanceLine();

    //重绘当前形状
    let jsx = this.getShapeJSX(shape, sindex, true);
    let el_shape = document.getElementById(shape.id);
    let el_temp = document.getElementById(shape.id + 'temp');
    if (!el_temp) {
        el_temp = this.createSvgTag('g');
        el_temp.classList.add("shape");
        el_temp.classList.add("active");
        el_temp.setAttribute("clip-path", 'url(#id_shape_top_clip)');
        el_temp.style.cursor = isHorizontal ? "ew-resize" : "ns-resize";
        el_temp.setAttribute("id", shape.id + 'temp');
        el_shape.parentNode.insertBefore(el_temp, el_shape);
        el_shape.style.visibility = 'hidden';
        // debugger;
    }
    el_temp.innerHTML = this.jsx2ele(jsx).innerHTML;

    //重绘距离辅助线
    jsx = this.getDistanceLineJSX(this.state.distanceLines);
    let el_distancelines = this.refs.distancelines;
    el_temp = document.getElementById('distancelines_temp');
    if (!el_temp) {
        el_temp = this.createSvgTag('g');
        el_temp.classList.add("distancelines");
        el_temp.setAttribute("id", 'distancelines_temp');
        el_distancelines.parentNode.insertBefore(el_temp, el_distancelines);
        el_distancelines.style.visibility = 'hidden';
        // debugger;
    }
    el_temp.innerHTML = this.jsx2ele(jsx).innerHTML;

    //重绘距离辅助线上的距离数字(输入框) 
    jsx = this.getInputValJSX(this.state.distanceLines);
    let el_inputVals = this.refs.inputVals;
    el_temp = document.getElementById('inputVals_temp');
    if (!el_temp) {
        el_temp = document.createElement("div");
        el_temp.classList.add("inputVals");
        el_temp.setAttribute("id", 'inputVals_temp');
        el_inputVals.parentNode.insertBefore(el_temp, el_inputVals);
        el_inputVals.style.visibility = 'hidden';
        // debugger;
    }
    el_temp.innerHTML = this.jsx2ele(jsx, false).innerHTML;

}
export const handleShapeAdjustEnd = function (e) {
    // debugger;
    e.stopPropagation();
    e.preventDefault();
    let { shape, sindex, lindex, isHorizontal, cursor, oPoints } = this.shapeAdjustOpt;

    let el_shape = document.getElementById(shape.id);
    if (!!el_shape) {
        el_shape.style.visibility = 'inherit';
    }

    let el_temp = document.getElementById(shape.id + 'temp');
    el_temp && (el_temp.parentNode.removeChild(el_temp));

    this.refs.distancelines.style.visibility = 'inherit';
    el_temp = document.getElementById('distancelines_temp');
    el_temp && (el_temp.parentNode.removeChild(el_temp));

    this.refs.inputVals.style.visibility = 'inherit';
    el_temp = document.getElementById('inputVals_temp');
    el_temp && (el_temp.parentNode.removeChild(el_temp));

    // this.pShapeStart = this.pShapeEnd = null;
    // this.shapeAdjustOpt = null;
    document.removeEventListener('mousemove', this.handleShapeAdjustMove);
    document.removeEventListener('mouseup', this.handleShapeAdjustEnd);
    let elem_svg = this.refs.svg;
    elem_svg.style.cursor = cursor;

    //判断越界重置
    let { data: { shapes } } = this.state;
    let shape_top = shapes.find(x => x.id == 'id_shape_top');
    if (shape.points.findIndex((p) => {
        return !Utils.isInPolygon(p, shape_top.points);
    }) != -1) {
        //如果有一个点不在顶层内，判定为不合法,还原位置还原位置
        shape.points = oPoints;
        this.calcDistanceLine();
        this.setState({ __record__: false });
    } else {
        this.setState({ __record__: true });
    }

}