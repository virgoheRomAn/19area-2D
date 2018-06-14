
import React from 'react';
import ReactDOM from 'react-dom';
import Request from "../../config/Request";
import HandleFunc from './HandleFunc';
import RenderFunc from './RenderFunc';
import Utils, { getIntersectionOfLineAndDot, iSInside } from '../Editor/Utils';
import { svgAsPngUri } from 'save-svg-as-png';
import Load from "../Plugins/loading/LoadingData"
import { message } from 'antd';
require('./Editor.less');
export default class extends React.Component {
    constructor(props, context) {
        super(props, context);
        //常量开始
        this.HEIGHT = 4000;
        this.WIDTH = 4000;
        this.WALL_WIDTH = 240; //墙体厚度
        this.WALL_WIDTH_HALF = this.WALL_WIDTH / 2;
        this.FONT_SIZE = 140;
        this.GRID_STEP = 400;//网格大小
        this.GRID_STEP_ALIGN = 400;//吸附大小
        //结束开始
        //绑定各种拆封方法开始
        for (let key in HandleFunc) {
            this[key] = HandleFunc[key].bind(this);
        }
        for (let key in RenderFunc) {
            this[key] = RenderFunc[key].bind(this);
        }
        //绑定各种拆封方法结束
        this.state = {
            viewBox: null,//svg 视窗
            mouseType: 'scale', //缩放拖动 scale 贴花旋转 rotate  贴花 move 放置 put
            grid: null,
            data: [], //用于渲染的图形{shapes:Array<{points:Array<{x,y}>}>}
            putThing: {},//放置物体  贴花
            history: [],
            historyIndex: 0,
            distanceLines: [],//距离辅助线
            copyData: null, //拷贝的对象
            rightMenu: {
                isShow: false,
                event: null
            },
            isSavePending: false, //保存中。。。
        }
        //劫持setState,在需要记录历史的时候记录
        let setStateTmp = this.setState;
        this.setState = (partialState = {}, callback) => {
            if (partialState['__record__'] == true) {
                // console.log('__record__');
                setStateTmp.call(this, partialState, () => {
                    this.handleRecord();
                    if (!!callback) callback();
                });
            } else {
                setStateTmp.call(this, partialState, callback);
            }
        }

        //TODO remove debug
        window.EDITOR = this;
        this.props.EM.on('RecordBack', () => {
            this.handleRecordBack();
        });
        this.props.EM.on('RecordFront', () => {
            this.handleRecordFront();
        });
        this.props.EM.on("createShape", () => {
            let { data: { shapes } } = this.state;
            shapes.forEach((shape) => {
                shape.active = false;
            });
            let shape = {
                id: Utils.generateKey(),
                parent: shapes[0],
                active: true,
                showRectLines: true,
                type: 0,
                points: [
                    { x: 0, y: 0 },
                    { x: 1000, y: 0 },
                    { x: 1000, y: 1000 },
                    { x: 0, y: 1000 }
                ],
                mask: {
                    // img: require("../../images/Pattern/2.1.jpg"),
                    patchWidth: 200,
                    patchHeight: 200,
                    imgWidth: 200,
                    imgHeight: 200,
                    centerOffset: {
                        x: 0, y: 0
                    },
                    rotate: 0,
                    gapWidth: 0,
                    type: 0,// 0默认 1工字铺 2人字铺
                    gapColor: "#e8eae9"
                }
            }
            shapes.push(shape);

            this.setState({
                distanceLines: [],
                __record__: true
            }, () => {
                this.calcBoxDistanceLine(shape);
                this.setState({ __record__: false })
            });
        });
        this.props.EM.on("appendShape", (shape) => {
            let { data: { shapes } } = this.state;
            shape.parent = shapes[0];
            shapes.push(shape);
            this.setState({ __record__: true });
        });
        this.props.EM.on('complete', () => {
            // let { data } = this.state;
            // this.props.EM.emit("saved", data);
        })
        this.props.EM.on("putThing", (data) => {
            this.setState({ mouseType: 'put' });
            this.handlePutStart(data);
        });
        this.props.EM.on("save", (data) => {
            this.handleSave(data);
        });
    }
    /**
     * 按实际大小裁剪素材
     */
    cutShapeMaskImg(shapes, callback) {
        //TODO remove debug
        setTimeout(() => {
            callback();
        }, 1000);
        return;

        let count = 0;
        let run = () => {
            if (count >= shapes.length) {
                callback();
                return
            }
            let shape = shapes[count];
            let { imgWidth, imgHeight, patchWidth, patchHeight } = shape.mask;
            let el_img = new Image();
            el_img.crossOrigin = "*";
            console.time(count);
            el_img.onload = () => {
                let el_cavnas = document.createElement("canvas");
                el_cavnas.setAttribute("height", patchHeight);
                el_cavnas.setAttribute("width", patchWidth);
                let ctx = el_cavnas.getContext("2d");
                ctx.drawImage(el_img, 0, 0);
                // shape.mask.img = el_cavnas.toDataURL();
                el_cavnas.toBlob((blob) => {
                    let src = window.URL.createObjectURL(blob);
                    shape.mask.img = src;
                    console.timeEnd(count);
                    count++;
                    run();
                });
            }
            el_img.src = shape.mask.img;
        }
        run();
    }
    handleSave(data) {
        Load.show("保存中...");
        this.setState({ isSavePending: true }, () => {
            //延时以防止页面卡顿
            setTimeout(() => {
                let { data } = this.state;
                console.log(data);
                let { shapes, type, bind_id, side, schemeNo } = data;
                let shape = shapes.find(x => x.id === 'id_shape_top');
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

                let fileName = bind_id;
                if (type == 0) {
                    fileName += "_" + side;
                }

                //存一份svg到服务器
                let el_temp = document.createElement("div");
                el_temp.innerHTML = this.refs.svg.outerHTML;
                let el_svg = el_temp.childNodes[0];
                // //去掉网格
                //20180511 改为在render里面判断 isSavePending
                // let el_grids = el_svg.querySelector(".grids");
                // el_grids.parentNode.removeChild(el_grids);

                //设置viewBox
                let viewBox = `${param.left} ${param.top} ${param.width} ${param.height}`;
                el_svg.setAttribute('viewBox', viewBox);
                el_svg.setAttribute('data-param', encodeURIComponent(JSON.stringify(param)));
                el_svg.setAttribute("width", param.width);
                el_svg.setAttribute("height", param.height);
                el_svg.style.maxHeight = "90%";
                // el_svg.style.border = "1px solid red";

                let svgText = el_temp.innerHTML;
                // svgAsPngUri(el_svg, param, (uri) => {
                //     window.open(uri);
                // })
                //存一份png到本地
                svgAsPngUri(this.refs.svg, param, (uri) => {
                    // window.open(uri);
                    // let data = new FormData();
                    // // uri = uri.replace("image/svg+xml", "image/png");
                    let file = Native.dataURLtoBlob(uri);
                    Native.savePatternImgAndSvg({
                        file: file,
                        svgText: svgText,
                        schemeNo: schemeNo,
                        fileName: fileName,
                        callback: (url) => {
                            data.texturepath = url;
                            data.texturepathremote = ""; //TODO 存到远程服务器
                            let mdata = {
                                shapes: shapes.map((shape) => {
                                    return this.getShapeSerializable(shape);
                                })
                            };
                            data.mdata = JSON.stringify(mdata) //TODO 元数据
                            // console.log(data.mdata);
                            this.setState({ isSavePending: false }, () => {
                                Load.hide();
                            });
                            this.props.EM.emit("saved", data);
                            // message.success("ba")
                        }
                    });

                });
            }, 300);
        });
    }
    /**
     * 转换成可以序列化的对象
     * @param {*} shape 
     */
    getShapeSerializable(shape) {
        return shape = {
            id: shape.id,
            parent: (shape.parent || {}).id,
            points: shape.points.map(x => { return { ...x } }),
            oPoints: (shape.oPoints || []).map(x => { return { ...x } }),
            type: shape.type,
            paths: (shape.paths || []).map(x => { return { ...x } }), //当type =1 ，用户上传svg形状
            exclude: (shape.exclude || []).map(x => x.map(y => { return { ...y } })), //顶层形状，排除门窗
            mask: { ...shape.mask }
        }
    }
    /**
     * 通过可以序列化的对象，还原成可以是使用的引用对象
     * @param {*} shape 
     */
    getShapeOfSerializable(shape) {

    }
    //重新计算pageX pageY
    //isNotMod  时候取整 自动吸附  true 表示不吸附
    eventWarp(e, isNotMod) {
        let { viewBox } = this.state;
        // let elem_svg = this.refs.svg;
        let pageX = viewBox.x + (e.pageX - viewBox.rect.left) * viewBox.scaleX;
        let pageY = viewBox.y + (e.pageY - viewBox.rect.top) * viewBox.scaleY;
        // if (!isNotMod) {
        //     pageX = Math.floor(pageX);
        //     let modX = pageX % this.GRID_STEP_ALIGN;
        //     if (Math.abs(modX) < 100) {
        //         pageX -= modX;
        //     }
        //     pageY = Math.floor(pageY);
        //     let modY = pageY % this.GRID_STEP_ALIGN;
        //     if (Math.abs(modY) < 100) {
        //         pageY -= modY;
        //     }
        // }
        return Object.assign({}, e, {
            pageX: Math.round(pageX),
            pageY: Math.round(pageY),
        });
    }
    getviewBox() {
        let elem = ReactDOM.findDOMNode(this);
        let rect = elem.getBoundingClientRect();
        let { viewBox } = this.state;
        if (!!viewBox) {
            //窗口大小改变，重新计算viewBox
            Object.assign(viewBox, {
                rect: rect,
                height: rect.height * viewBox.scaleX,
                width: rect.width * viewBox.scaleY
            })
        } else {
            viewBox = {
                scaleX: 1,
                scaleY: 1,
                rect: rect,
                x: -(rect.width / 2 - this.WIDTH / 2),
                y: -(rect.height / 2 - this.HEIGHT / 2),
                height: rect.height,
                width: rect.width
            }
            let scaleX = viewBox.scaleX || 1;
            let scaleY = viewBox.scaleY || 1;
            let offset = 13;
            scaleX += offset;
            // if (scaleX <= 0.02 || scaleX >= 3) {
            //   return;
            // }
            scaleY += offset;
            // if (scaleY <= 0.02 || scaleY >= 3) {
            //   return;
            // }

            //缩放
            viewBox.scaleX = scaleX;
            viewBox.scaleY = scaleY;
            viewBox.height = rect.height * scaleY;
            viewBox.width = rect.width * scaleX;

            //还原x,y
            let reP = { x: rect.width / 2, y: rect.height / 2 } //相对位置
            viewBox.x -= reP.x * offset;
            viewBox.y -= reP.y * offset;
        }
        return viewBox;
    }
    buildGrid() {
        // return //暂时不显示网格
        let grid = {};
        let d = "";
        const MAX = 20000 * 2;
        let position = -MAX;
        while (position <= MAX) {
            d += `M${position}, ${-MAX
                }L${position}, ${MAX}`
            d += `M${-MAX},${position}L${MAX}, ${position}`
            position += this.GRID_STEP;
        }

        grid.d = d;
        this.setState({ grid });
    }
    createSvgTag(tag, attr) {
        var ele_tag = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var key in attr) {
            switch (key) {
                case 'xlink:href'://文本路径添加属性特有  
                    ele_tag.setAttributeNS('http://www.w3.org/1999/xlink', key, attr[key]);
                    break;
                default:
                    ele_tag.setAttribute(key, attr[key]);
            }
        }
        return ele_tag;
    }
    jsx2ele(jsx, isSvg = true) {
        let el_temp;
        if (!isSvg) {
            el_temp = document.createElement('div');
        } else {
            el_temp = this.createSvgTag('svg', {});
        }
        ReactDOM.render(jsx, el_temp);
        return el_temp.children[0];
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener("keydown", this.handleHotKey);
    }
    componentWillMount() {
        let { data } = this.props;
        //20180529 按实际大小裁剪素材
        this.cutShapeMaskImg(data.shapes, () => {
            this.setState({});
        });
    }
    componentDidMount() {
        // this.buildMock();
        this.buildGrid();
        let { data } = this.props;
        this.setState({
            data: data,
            __record__: true,
        });
        let viewBox = this.getviewBox();
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener("keydown", this.handleHotKey);
        this.setState({
            viewBox
        }, () => {
            let elem_svg = this.refs.svg;
            elem_svg.addEventListener('mousewheel', (e) => {
                let { mouseType } = this.state;
                if (mouseType == 'scale' || mouseType == 'put') {
                    this.handleMouseWheel(e);
                }
                if (mouseType == 'rotate') {
                    let { rightMenu: { shape } } = this.state;
                    this.handleShapeRotateMouseWheel(e, shape);
                }
            });
            // elem_svg.addEventListener('contextmenu', (e) => {
            //     this.handleRightMenu(e);
            //     e.preventDefault();
            //     e.stopPropagation();
            // });
        })
    }
    renderPutThing() {
        let { putThing, mouseType } = this.state;
        if (mouseType != 'put' || !putThing) { return };
        return (
            <g
                fill='red'
                opacity=' 0.5'
                pointerEvents="none"
            >
                <rect
                    x={putThing.x}
                    y={putThing.y}
                    height={1000}
                    width={1000}
                />
            </g>
        );
    }
    render() {
        let { viewBox, mouseType } = this.state;

        let svg_mousedown_handle;
        let svg_cursor;
        if (mouseType == 'scale') {
            svg_mousedown_handle = this.handleScaleStart;
            svg_cursor = '-webkit-grab';
            if (!!this.pScaleStart) { svg_cursor = '-webkit-grabbing'; }
        }
        if (mouseType == 'put') {
            // svg_mousedown_handle = this.handlePutDown;
            svg_cursor = 'all-scroll';
        }
        if (mouseType == 'rotate') {
            // svg_mousedown_handle = this.handleShapeRotateEnd;
        }
        if (mouseType == 'move') {
            // svg_mousedown_handle = this.handleShapeRotateEnd;
        }

        return (
            <div
                className='pattern-editor-component'
                ref='editor'
            >
                {this.rightMenu()}
                {this.renderInputVal()}
                {this.renderTips()}
                {!!viewBox &&
                    <svg
                        id="svg_index"
                        onMouseMove={
                            this.mouseMovePoint
                        }
                        onMouseDown={
                            svg_mousedown_handle
                        }
                        ref='svg'
                        style={{
                            cursor: svg_cursor,
                            background: "#fff"
                        }}
                        height={this.HEIGHT + 0.5}
                        width={this.WIDTH + 0.5}
                        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                        // viewBox="0 0 1000 800"
                        version='1.1'
                        xmlns='http://www.w3.org/2000/svg'
                        onClick={(e) => {

                        }}
                    >
                        {this.renderGrids()}
                        {this.renderShapes()}
                        {this.renderDistanceLine()}
                        {this.renderPutThing()}
                    </svg>
                }
            </div>
        );
    }
}