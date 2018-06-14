import React from 'react';
import ReactDOM from 'react-dom';
import { InputNumber, Row, Col } from 'antd';
import { EventEmitter } from 'events';
import Editor from './Editor';
import Header from './Header';
import Aside from './Aside';
import Utils, { generateKey } from '../Editor/Utils';
import FormModal from './common/FormModal';
import ColorInput from './common/ColorInput';
require('./index.less');
export class Pattern extends React.Component {
    constructor(props, context) {
        super(props, context);
        let EM = new EventEmitter();
        // window.EM = EM;
        this.state = {
            EM,
            spinning: true,
            visible: false,
        };
        //需要波打线的值
        EM.addListener("need_boundary", (e, data) => {
            let { resetFields } = this.form;
            resetFields()
            console.log('need_boundary');
            this.setState({
                visible: true,
                visibleType: 'boundary',
                visibleData: data
            })
        });
        //需要砖缝的值
        EM.addListener("need_gap", (e, data) => {
            let { resetFields } = this.form;
            resetFields()
            this.setState({
                visible: true,
                visibleType: 'gap',
                visibleData: data
            })
        });
        //保存完成时
        EM.addListener("saved", (pattern) => {
            //TODO
            let { callback } = this.props;
            callback({
                ...pattern,
                shapes: null,
            });
        });
    }
    componentDidMount() {
        this.loadData();
        this.state.EM.emit("loadMemberInfo", this.props.memberInfo || {});
    }
    loadData() {
        //是否debug
        if (localStorage.getItem("pattern-debug") == "true") {
            let data = this.buildMock();
            this.setState({
                spinning: false,
                data: data
            });
            this.state.EM.emit("loadData", data);
        } else {
            let { data } = this.props;
            let shapes;
            let mdataStr;

            //墙
            if (data.type == 0) {
                let pattern;
                let { wall } = data;
                let { p1, p2 } = wall;
                const WALL_HEIGHT_HALF = Math.ceil((data.wallHeight || 3000) / 2);
                const WALL_WIDTH_HAFL = Math.ceil(wall.distance / 2);

                if (!!wall.pattern && wall.pattern[data.side]) {
                    pattern = wall.pattern[data.side];
                    mdataStr = pattern.mdata;
                    let mdata = JSON.parse(mdataStr);
                    shapes = mdata.shapes;
                    shapes.forEach((shape, index) => {
                        if (index != 0) {
                            shape.parent = shapes[0];
                        }
                    });
                } else {
                    let shape;

                    let points = [
                        { x: -WALL_WIDTH_HAFL, y: -WALL_HEIGHT_HALF },
                        { x: WALL_WIDTH_HAFL, y: -WALL_HEIGHT_HALF },
                        { x: WALL_WIDTH_HAFL, y: WALL_HEIGHT_HALF },
                        { x: -WALL_WIDTH_HAFL, y: WALL_HEIGHT_HALF },
                    ];

                    shape = {
                        id: 'id_shape_top',
                        type: 0,
                        points: points,
                        mask: {
                            // img: require("../../images/Pattern/1.jpg"),
                            imgWidth: 200,
                            imgHeight: 200,
                            centerOffset: {
                                x: 0, y: 0
                            },
                            rotate: 0,
                            gapWidth: 1,
                            type: 0,// 0默认 1工字铺 2人字铺
                            gapColor: "#e8eae9"
                        },
                    }
                    shapes = [shape];
                }

                let exclude = wall.doors.map((door, index) => {
                    let { distance, modelHeight } = door;
                    let offset = Math.floor(wall.distance * door.percent);
                    return [
                        { x: -WALL_WIDTH_HAFL + offset, y: -WALL_HEIGHT_HALF + data.wallHeight - modelHeight },
                        { x: -WALL_WIDTH_HAFL + offset + distance, y: -WALL_HEIGHT_HALF + data.wallHeight - modelHeight },
                        { x: -WALL_WIDTH_HAFL + offset + distance, y: -WALL_HEIGHT_HALF + data.wallHeight },
                        { x: -WALL_WIDTH_HAFL + offset, y: -WALL_HEIGHT_HALF + data.wallHeight },
                    ];
                });
                shapes[0].exclude = exclude;//用户point描述的，排除的区域  门窗

                data = {
                    ...pattern,
                    schemeNo: data.schemeNo,
                    type: data.type,
                    bind_id: wall.id,
                    side: data.side,
                    shapes: shapes,
                }
                console.log(data);
                this.setState({
                    spinning: false,
                    data: data
                });
                this.state.EM.emit("loadData", data);
            }
            //地板
            if (data.type == 1) {
                if (data.floor.pattern) {
                    mdataStr = data.floor.pattern.mdata
                    let mdata = JSON.parse(mdataStr);
                    shapes = mdata.shapes;
                    shapes.forEach((shape, index) => {
                        if (index != 0) {
                            shape.parent = shapes[0];
                        }
                    });
                } else {
                    let shape;
                    let points = data.floor.points.map(x => {
                        return { ...x.p };
                    });
                    //20180529 同一直线上的点只保留两端点，为了不出现一条很短的边
                    //循环选取3个点，如果p2在p1和p3的连线上，
                    for (let i = 0; i < points.length; i++) {
                        do {
                            if (points.length < 3) {
                                break;
                            }
                            let next1 = points[(i + 1) % points.length];
                            let next2 = points[(i + 2) % points.length];
                            let distance = Utils.getDistanceOfDotToLine(next1, { p1: points[i], p2: next2 });
                            if (distance.distance <= 50) { //误差50毫米都算在线上
                                points.splice((i + 1) % points.length, 1);
                            } else {
                                break;
                            }
                        } while (true);
                    }
                    //20180515 fixbug 点顺时针排列
                    // Utils.ClockwiseSortPoints(points);
                    // console.table(points);
                    if (points[0].y < points[1].y || (points[0].y == points[1].y && points[0].x >= points[1].x)) {
                        points.reverse();
                        let temp = points.pop();
                        points.splice(0, 0, temp);
                    }
                    // console.table(points);
                    //20180510 修复到中心显示
                    let centerP = points.reduce((prev, item) => {
                        prev.x += item.x;
                        prev.y += item.y;
                        return prev;
                    }, { x: 0, y: 0 });
                    centerP.x = ~~(centerP.x / points.length);
                    centerP.y = ~~(centerP.y / points.length);
                    points.forEach((point) => {
                        point.x -= centerP.x;
                        point.y -= centerP.y;
                    });
                    // console.table(points);
                    shape = {
                        id: 'id_shape_top',
                        type: 0,
                        points: points,
                        mask: {
                            // img: require("../../images/Pattern/1.jpg"),
                            imgWidth: 200,
                            imgHeight: 200,
                            centerOffset: {
                                x: 0, y: 0
                            },
                            rotate: 0,
                            gapWidth: 1,
                            type: 0,// 0默认 1工字铺 2人字铺
                            gapColor: "#e8eae9"
                        },
                    }
                    shapes = [shape];
                }
                data = {
                    ...data.floor.pattern,
                    schemeNo: data.schemeNo,
                    type: data.type,
                    bind_id: data.floor.floorId,
                    shapes: shapes,
                }
                this.setState({
                    spinning: false,
                    data: data
                });
                this.state.EM.emit("loadData", data);
            }
        }
    }
    buildMock() {
        let shapes = [{
            id: 'id_shape_top',
            type: 0,
            points: [
                { x: -1000, y: -500 },
                { x: 500, y: -500 },
                { x: 1000, y: -500 },
                { x: 1000, y: -1000 },
                { x: 1500, y: -1000 },
                { x: 1500, y: 0 },
                { x: 3000, y: 0 },
                { x: 3000, y: 2000 },
                { x: 1500, y: 2000 },
                { x: -1000, y: 2000 }
            ],
            // points: [
            //     { "x": -35, "y": -4350 },
            //     { "x": 3815, "y": -528 },
            //     { "x": 343, "y": 4540 },
            //     { "x": -4123, "y": 340 }
            // ],
            //用户point描述的，排除的区域  门窗
            exclude: [
                [{ x: 800, y: 800 }, { x: 1400, y: 800 }, { x: 1400, y: 1400 }, { x: 800, y: 1400 }],
            ],
            mask: {
                img: require("../../images/Pattern/4.jpg"),
                imgWidth: 4095,
                imgHeight: 2866,
                patchWidth: 3000,
                patchHeight: 1000,
                centerOffset: {
                    x: 0, y: 0
                },
                rotate: 0,
                gapWidth: 10,
                type: 1,// 0默认 1工字铺 2人字铺
                gapColor: "#e8eae9"
            },
        }];

        shapes.push({
            id: Utils.generateKey(),
            parent: shapes[0],
            type: 0,
            points: [
                { x: 250, y: 250 },
                // { x: 3000, y: 2000 },
                // { x: 1000, y: -500 },
                // { x: 1500, y: -500 },
                // { x: 1500, y: 0 },
                { x: 850, y: 250 },
                { x: 850, y: 750 },
                { x: 250, y: 750 }
            ],
            mask: {
                img: require("../../images/Pattern/2.jpg"),
                imgWidth: 1024,
                imgHeight: 1024,
                patchWidth: 300,
                patchHeight: 300,
                centerOffset: {
                    x: 0, y: 0
                },
                rotate: 0,
                gapWidth: 0,
                type: 1,// 0默认 1工字铺 2人字铺
                gapColor: "#e8eae9"
            },
        });
        // shapes.push({
        //     id: Utils.generateKey(),
        //     parent: shapes[0],
        //     type: 0,
        //     points: [
        //         { x: 0, y: 0 },
        //         // { x: 3000, y: 2000 },
        //         // { x: 1000, y: -500 },
        //         // { x: 1500, y: -500 },
        //         // { x: 1500, y: 0 },
        //         { x: 1900, y: 400 },
        //         { x: 1900, y: 1000 },
        //         { x: 1000, y: 1000 }
        //     ],
        //     mask: {
        //         img: require("../../images/Pattern/2.1.jpg"),
        //         imgWidth: 1024,
        //         imgHeight: 342,
        //         patchWidth: 512,
        //         patchHeight: 171,
        //         centerOffset: {
        //             x: 0, y: 0
        //         },
        //         rotate: 0,
        //         gapWidth: 10,
        //         type: 1,// 0默认 1工字铺 2人字铺
        //         gapColor: "#e8eae9"
        //     },
        // });

        return {
            schemeNo: "p_1111" || generateKey(),
            bind_id: 1111,
            type: 1, //1地面 0 墙面
            side: 1,
            shapes: shapes
        }
    }
    //砖缝
    getGap() {
        let { visibleData: { shape } } = this.state;
        return [{
            itemProps: {
                label: '宽度',
            },
            render: ({ getFieldDecorator }) => {
                return (
                    <Row gutter={8}>
                        <Col span={16}>
                            {getFieldDecorator('width', {
                                rules: [{ required: true, message: '请输入宽度！' }],
                                initialValue: shape.mask.gapWidth
                            })(
                                <InputNumber style={{ width: '100%' }} min={0} size="large" />
                            )}
                        </Col>
                        <Col span={8}>
                            mm
                        </Col>
                    </Row>
                )
            }
        }, {
            itemProps: {
                label: '颜色',
            },
            render: ({ getFieldDecorator }) => {
                return (
                    getFieldDecorator('color', {
                        rules: [{ required: true, message: '请选择颜色！' }],
                        initialValue: shape.mask.gapColor
                    })(
                        <ColorInput />
                    )
                )
            }
        }]
    }
    //波打线
    getBoundary() {
        return [{
            itemProps: {
                label: '宽度',
            },
            render: ({ getFieldDecorator }) => {
                return (
                    <Row gutter={8}>
                        <Col span={16}>
                            {getFieldDecorator('distance', {
                                rules: [{ required: true, message: '请输入宽度！' }],
                            })(
                                <InputNumber style={{ width: '100%' }} min={0} size="large" />
                            )}
                        </Col>
                        <Col span={8}>
                            mm
                        </Col>
                    </Row>
                )
            }
        }]
    }
    getFormItems() {
        let { visibleType } = this.state;
        if (visibleType == 'gap') { return this.getGap() }
        if (visibleType == 'boundary') { return this.getBoundary() }
    }
    render() {
        let { data, visible } = this.state;
        let { visibleType } = this.state;
        const FormModalItems = this.getFormItems() || [];
        return (
            <div id={'patternMainComponent'} className="pattern-main-component">
                <Header EM={this.state.EM} />
                <Aside EM={this.state.EM} />
                {data && <Editor data={data} EM={this.state.EM} />}

                <FormModal
                    title={visibleType == 'boundary' ? '添加波打线' : '砖缝'}
                    items={FormModalItems}
                    setForm={(form) => {
                        this.form = form
                    }}
                    onOk={(obj) => {
                        let { data, visibleData: { callback } } = this.state;
                        this.setState({
                            visible: false
                        })
                        callback && callback(obj);
                    }}
                    visible={visible}
                    itemsProps={{
                        labelCol: {
                            sm: { span: 8 },
                        },
                        wrapperCol: {
                            sm: { span: 14 },
                        },
                    }}
                    onCancel={() => {
                        this.setState({
                            visible: false
                        })
                    }}
                />

            </div>
        );
    }
}

let key = generateKey();
const Opt = {
    /**
     * @data 地板或者墙面定点数据 ，如果是wall需要指定是那一面
     */
    show: ({ data, memberInfo, callback }) => {

        let el_mask = document.querySelector(`#${key}`);
        if (!el_mask) {
            el_mask = document.createElement("div");
            el_mask.setAttribute("id", key);
            el_mask.classList.add("patternEditor_mask");
            document.body.appendChild(el_mask);
        }
        ReactDOM.render(<Pattern data={data} memberInfo={memberInfo} callback={callback} />, el_mask);
    },
    hide: () => {
        ReactDOM.unmountComponentAtNode(document.querySelector(`#${key}`));
    }
}
window.Opt = Opt;
export default Opt;
