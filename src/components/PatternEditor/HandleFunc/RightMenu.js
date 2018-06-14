import Utils, { generateKey } from '../../Editor/Utils';
import { message } from 'antd';
import { svgAsPngUri } from 'save-svg-as-png';
import Load from "../../Plugins/loading/LoadingData"
message.config({
    top: 100,
    duration: 2,
});
export const handleRightMenu = function (e, shape, sindex) {
    let { rightMenu } = this.state;
    if (!e) {
        rightMenu.isShow = false;
        rightMenu.event = null;
    } else {
        rightMenu.isShow = true;
        e.persist();
        rightMenu.event = e;
        rightMenu.shape = shape;
        rightMenu.sindex = sindex;
    }
    this.setState({ rightMenu, __record__: false })
}
export const handleRightMenuClick = function (e) {
    let { rightMenu } = this.state;
    let { shape, sindex } = rightMenu;
    let { data: { shapes } } = this.state;
    let shapeTemp;

    switch (e.key) {
        //移动素材
        case "1":
            this.setState({
                mouseType: "move",
                __record__: false
            });
            break;
        //旋转素材
        case "2":
            this.setState({
                mouseType: "rotate",
                __record__: false
            });
            break;
        case '31':
        case '32':
        case '33':
            shape.mask.type = {
                "31": 0,
                "32": 1,
                "33": 2,
            }[e.key];
            this.setState({ __record__: true });
            break;
        //砖缝
        case "8":
            this.props.EM.emit("need_gap", e, {
                shape,
                callback: ({ width, color }) => {
                    shape.mask.gapWidth = width;
                    shape.mask.gapColor = color;
                    this.setState({ __record__: true });
                }
            });
            break;
        //波打线
        case "9":
            this.props.EM.emit("need_boundary", e, {
                callback: ({ distance }) => {
                    //当前形状的最短边距离 
                    let minDsitance = Infinity;
                    shape.lines.map((line) => {
                        let distance = Utils.getDistance(line.p1, line.p2);
                        if (minDsitance > distance) {
                            minDsitance = distance;
                        }
                    });
                    if (distance >= minDsitance / 2) {
                        message.error("波打线距离不能小于最短的一面墙的长度的一半");
                        return false;
                    }
                    let parent = shape.parent || shape;
                    shape = this.getShapeSerializable(shape);
                    shape.parent = parent;
                    shape.id = generateKey();
                    shape.mask.img = "";  //波打线复制形状，不复制素材

                    //根据线条方向缩放xy
                    let pointsCopy = JSON.parse(JSON.stringify(shape.points));
                    pointsCopy.forEach((p1_c, index) => {
                        let nextIndex = (index + 1) % pointsCopy.length;
                        let p2_c = pointsCopy[nextIndex];
                        let p1 = shape.points[index], p2 = shape.points[nextIndex];
                        let roate = Utils.getRoate(p1_c, p2_c);
                        if (roate % 90 == 0) {
                            if (p1_c.x < p2_c.x) {
                                p1.y = p1_c.y + distance;
                                p2.y = p2_c.y + distance;
                            } else if (p1_c.x > p2_c.x) {
                                p1.y = p1_c.y - distance;
                                p2.y = p2_c.y - distance;
                            } else if (p1_c.y < p2_c.y) {
                                p1.x = p1_c.x - distance;
                                p2.x = p2_c.x - distance;
                            } else if (p1_c.y > p2_c.y) {
                                p1.x = p1_c.x + distance;
                                p2.x = p2_c.x + distance;
                            }
                        } else {
                            console.warn("波打线未处理")
                        }
                    });

                    shapes.push(shape);
                    shapes.forEach((shape) => {
                        shape.active = false;
                    });
                    shape.active = true;
                    shape.showRectLines = true;
                    this.state.distanceLines = [];
                    this.setState({ __record__: true }, () => {
                        this.calcBoxDistanceLine(shape);
                        this.setState({ __record__: false })
                    });
                }
            });
            break;
        //top
        case '41':
            shapes.splice(sindex, 1);
            shapes.push(shape);
            this.setState({ __record__: true });
            break;
        //bottom
        case '42':
            shapes.splice(sindex, 1);
            shapes.splice(1, 0, shape);
            this.setState({ __record__: true });
            break;
        //up
        case '43':
            shapes.splice(sindex, 1);
            shapes.splice(sindex + 1, 0, shape);
            this.setState({ __record__: true });
            break;
        //down
        case '44':
            shapes.splice(sindex, 1);
            shapes.splice(sindex == 1 ? 1 : sindex - 1, 0, shape);
            this.setState({ __record__: true });
            break;
        //复制
        case '5':
            let parent = shape.parent;
            shape = this.getShapeSerializable(shape);
            shape.parent = parent;
            this.handleCommand('copy', { shape });
            break;
        //粘贴
        case '51':
            shape = this.state.copyData.shape;
            this.handleCommand('paste', { shape });
            break;
        //删除
        case '6':
            this.handleCommand('delete', { sindex });
            break;
        //保存
        case '7':
            Load.show("请稍候...");
            console.time("setState");
            this.setState({ isSavePending: true, pendingShape: shape }, () => {
                console.timeEnd("setState");
                let boxRectLines = shape.boxRectLines;
                let yMin = boxRectLines[0].p1.y, xMin = boxRectLines[0].p1.x, yMax = boxRectLines[1].p2.y, xMax = boxRectLines[1].p2.x;
                let cutOffset = 0;
                let param = {
                    top: yMin - cutOffset,
                    left: xMin - cutOffset,
                    height: (yMax - yMin) + 2 * cutOffset,
                    width: (xMax - xMin) + 2 * cutOffset,
                    scale: .25
                }
                //20180518 增加形状json数据的缩略图
                console.time("svgAsPngUri");
                svgAsPngUri(this.refs.svg, param, (uri) => {
                    console.timeEnd("svgAsPngUri");
                    // window.open(uri);
                    this.setState({ isSavePending: false, pendingShape: null });
                    shape = this.getShapeSerializable(shape);
                    if (shape.type == 0) {
                        shape = {
                            type: shape.type,
                            mask: shape.mask,
                            points: shape.points,
                            mask: shape.mask,
                        }
                    } else if (shape.type == 1) {
                        shape = {
                            type: shape.type,
                            mask: shape.mask,
                            points: shape.points,
                            oPoints: shape.oPoints,
                            mask: shape.mask,
                            paths: paths,
                        }
                    }
                    Load.hide()
                    this.props.EM.emit("saveShape", { shape, imgSrc: uri });
                });
            });
            break;
    }
    this.handleRightMenu(); //不要挪到前面去，因为这里面有个setState
}