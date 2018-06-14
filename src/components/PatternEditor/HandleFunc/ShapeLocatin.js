import Utils, { getClosetParallelLine, getShapBoxRectLines } from '../../Editor/Utils';

/**
 * 调整形状的位置
 */


/**
 * 就上形状边界距离其他边的距离辅助线
 * onlyTop 只判断顶层
 */
export const calcBoxDistanceLine = function (shape, onlyTop) {
    this.state.distanceLines = [];
    if (!shape) {
        shape = this.shapeLocationOpt.shape;
    }
    let { data: { shapes } } = this.state;
    //限制在父级内
    // let olines = [
    //     ...shape.parent.lines,
    //     ...shape.lines,
    // ];
    let olines = [];
    if (!!onlyTop) {
        olines = shapes.find(x => x.id == 'id_shape_top').lines;
    } else {
        shapes.forEach((shape) => {
            olines = olines.concat(shape.lines);
        });
    }
    let boxRectLines = getShapBoxRectLines(shape);
    shape.showRectLines = true;
    shape.boxRectLines = boxRectLines;
    let distanceLines = [];
    boxRectLines.forEach((line) => {
        distanceLines = distanceLines.concat(getClosetParallelLine(olines, line));
    });

    //排除重复的
    distanceLines = distanceLines.filter((x) => x.line.shape != shape);
    //添加回调
    distanceLines.forEach((distanceLine) => {
        distanceLine.callback = (e, index) => {
            let value = e.target.value;
            let offset = (value - Math.abs(distanceLine.distance)) * (distanceLine.distance >= 1 ? -1 : 1);
            // console.log(value, distanceLine.distance, offset);

            shape.points.forEach((p) => {
                if (distanceLine.line.isHorizontal) {
                    p.x += offset;
                } else {
                    p.y += offset;
                }
            });

            let { data: { shapes } } = this.state;
            let shape_top = shapes.find(x => x.id == 'id_shape_top');
            if (shape.points.findIndex((p) => {
                return !Utils.isInPolygon(p, shape_top.points);
            }) != -1) {
                //如果有一个点不在顶层内，判定为不合法,还原位置
                shape.points.forEach((p) => {
                    if (distanceLine.line.isHorizontal) {
                        p.x -= offset;
                    } else {
                        p.y -= offset;
                    }
                });
                return;
            } else {
                this.calcBoxDistanceLine();
                this.setState({ __record__: true });
            }
        }
    })
    this.state.distanceLines = distanceLines;
}
export const handleShapeLocationStart = function (e, { shape, sindex }) {
    e = this.eventWarp(e);
    this.pShapeStart = this.pShapeEnd = {
        x: e.pageX,
        y: e.pageY,
    }
    let elem_svg = this.refs.svg;

    let cursor = elem_svg.style.cursor;
    elem_svg.style.cursor = 'move';
    let oPoints = shape.points.map((point) => { return { ...point } });
    this.shapeLocationOpt = { shape, sindex, cursor, oPoints };
    this.calcBoxDistanceLine();

    this.setState({ __record__: false });

    document.addEventListener('mousemove', this.handleShapeLocationMove);
    document.addEventListener('mouseup', this.handleShapeLocationEnd);
}
export const handleShapeLocationMove = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e);
    this.pShapeEnd = {
        x: e.pageX,
        y: e.pageY,
    };
    let offset = {
        x: this.pShapeEnd.x - this.pShapeStart.x,
        y: this.pShapeEnd.y - this.pShapeStart.y
    };
    this.pShapeStart = this.pShapeEnd;
    let { shape, sindex } = this.shapeLocationOpt;
    let { mouseType } = this.state;
    if (mouseType === 'move') {
        shape.mask.centerOffset.x += offset.x;
        shape.mask.centerOffset.y += offset.y;
    } else {
        shape.points.forEach((p) => {
            p.x += offset.x;
            p.y += offset.y;
        });
    }
    this.calcBoxDistanceLine();

    let jsx = this.getShapeJSX(shape, sindex, true);
    let el_shape = document.getElementById(shape.id);
    let el_temp = document.getElementById(shape.id + 'temp');
    if (!el_temp) {
        el_temp = this.createSvgTag('g');
        el_temp.classList.add("shape");
        el_temp.classList.add("active");
        el_temp.style.cursor = 'move';
        el_temp.setAttribute("id", shape.id + 'temp');
        el_temp.setAttribute("clip-path", 'url(#id_shape_top_clip_temp)');
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
export const handleShapeLocationEnd = function (e) {
    e.stopPropagation();
    e.preventDefault();
    let { shape, sindex, cursor, oPoints } = this.shapeLocationOpt;
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
    document.removeEventListener('mousemove', this.handleShapeLocationMove);
    document.removeEventListener('mouseup', this.handleShapeLocationEnd);
    let elem_svg = this.refs.svg;
    elem_svg.style.cursor = cursor;
    // shape.boxRectLines = [];
    let { mouseType } = this.state;
    if (mouseType === 'move') {
        //移动模式等点击退出
        this.setState({ __record__: false });
    } else {
        let { data: { shapes } } = this.state;
        let shape_top = shapes.find(x => x.id == 'id_shape_top');
        if (shape.points.findIndex((p) => {
            return !Utils.isInPolygon(p, shape_top.points);
        }) != -1) {
            //如果有一个点不在顶层内，判定为不合法,还原位置
            shape.points = oPoints;
            this.calcBoxDistanceLine();
            this.setState({ __record__: false });
        } else {
            this.setState({ __record__: true });
        }
    }
}