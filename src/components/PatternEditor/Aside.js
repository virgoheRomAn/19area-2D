import { Menu, Input, message } from 'antd';
import React from 'react';
import MaterialList from './MaterialList';
import MyMaterialList from './MyMaterialList';
import ItemsModal from './common/ItemsModal';
import asideHideIcon from '../../images/aside-hide.png';
import asideShowIcon from '../../images/aside-show.png';
import UploadFile from './common/UploadFile';
import FormModal from './common/FormModal';
import Request from "../../config/Request";
import './Aside.less';
import Utils from '../Editor/Utils';
import Load from "../Plugins/loading/LoadingData";

const SubMenu = Menu.SubMenu;

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHide: true,
            selectedKey: '',
            myShapeModalVisible: false,
            isSaveShapeModalVisible: false,
            upBtnDisabled: false,
            isLoading: true,
            editorData: {},// 加载的墙面或者地面
            floorTypes: [], //地板类型
            wallTypes: [], //墙类型
        };
        this.getDoorType();
        this.toggleState = this.toggleState.bind(this);
        this.handlleMaterialListSelect = this.handlleMaterialListSelect.bind(this);
        this.handleShapeSelect = this.handleShapeSelect.bind(this);
        this.props.EM.on("saveShape", (data) => {
            let { resetFields } = this.form;
            resetFields()
            this.setState({
                saveShapeData: data,
                isSaveShapeModalVisible: true
            })
        });
        this.props.EM.on("loadData", (data) => {
            this.setState({
                editorData: data
            })
        });
    }

    getDoorType() {
        Request.get('frontAjax/startPatchAction.action')
            .then(({ data: { configModelTypeList: list } }) => {
                let floorTypes = [{ gid: -1, typeName: "全部" }], wallTypes = [{ gid: -1, typeName: "全部" }];
                const configModelTypeList = [];
                list.forEach((item) => {
                    if (item.parentGid == 117) {
                        wallTypes.push(item);
                    }
                    if (item.parentGid == 118) {
                        floorTypes.push(item);
                    }
                });
                let brandList = [];
                wallTypes.forEach((type) => {
                    brandList = brandList.concat(type.brandList || []);
                });
                wallTypes.brandList = brandList;
                brandList = [];
                floorTypes.forEach((type) => {
                    brandList = brandList.concat(type.brandList || []);
                });
                floorTypes.brandList = brandList;

                this.setState({ floorTypes, wallTypes });
            })
    }

    handleSaveShape(obj) {
        let { saveShapeData: { shape, imgSrc } } = this.state;
        this.setState({
            saveShapeData: null,
            isSaveShapeModalVisible: false
        });

        //20180518 增加形状json数据的缩略图
        let data = new FormData();
        let file = Native.dataURLtoBlob(imgSrc);
        data.append('file', file, "screenshot.png");

        Request.post("/servlet/FileUploadServlet.htm?t=20", data, {
            headers: { 'Content-Type': 'multipart/form-data;' },
            timeout: 100000,
        }).then((data) => {
            let shapeFileGid = data.data;

            let values = {
                shapeType: 2,
                shapeJson: JSON.stringify({ shape }),
                shapeFileGid: shapeFileGid,
                shapeName: encodeURI(obj.shapeName)
            }
            return Request.get('/frontAjax/createMemberSourceShapeAction.action', {
                params: values
            }).then(({ data: { code } }) => {
                if (code === 1000) {
                    message.success('保存成功');
                } else {
                    message.error('保存失败');
                }
            })
        });
    }
    /**
      * 当需要插入的svg文件。抽离方便调试
      * @param {*} text svg文本内容 
      */
    handleShapeSelectSvg(text) {
        let el_temp = document.createElement("div");
        el_temp.innerHTML = text;
        let ds = Array.from(el_temp.querySelectorAll("path")).map(x => x.getAttribute("d"));
        let paths = ds.map((d) => {
            return {
                d,
                mask: {
                    img: "",
                    imgWidth: 200,
                    imgHeight: 200,
                    centerOffset: {
                        x: 0, y: 0
                    },
                    rotate: 0,
                    gapWidth: 1,
                    // type: 0,// 0默认 1工字铺 2人字铺
                    gapColor: "#e8eae9"
                },
            };
        });
        let bboxs = Array.from(el_temp.querySelectorAll("path")).map(x => x.getBBox());
        let points = [];
        bboxs.forEach((box) => {
            points = points.concat([
                { x: box.x, y: box.y },
                { x: box.x + box.width, y: box.y + box.height },
            ])
        });
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        console.table(points)
        points.forEach((point) => {
            if (point.x < minX) { minX = point.x; }
            if (point.y < minY) { minY = point.y; }
            if (point.x > maxX) { maxX = point.x; }
            if (point.y > maxY) { maxY = point.y; }
        });
        points = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY },
        ]
        console.log(minX, minY, maxX, maxY);
        console.table(points)
        let shape = {
            id: Utils.generateKey(),
            points: points,
            type: 1,
            paths: paths,
            mask: {
                // img: require("../../images/Pattern/2.1.jpg"),
                imgWidth: 300,
                imgHeight: 100,
                centerOffset: {
                    x: 0, y: 0
                },
                rotate: 0,
                gapWidth: 0,
                type: 1,// 0默认 1工字铺 2人字铺
                gapColor: "#e8eae9"
            },
        }
        //根据svg文件里的点，求出外接矩形
        let boxRectLines = Utils.getShapBoxRectLines({
            points
        });
        //替换掉外接矩形
        shape.points = [{ ...boxRectLines[0].p1 }, { ...boxRectLines[1].p1 }, { ...boxRectLines[2].p1 }, { ...boxRectLines[3].p1 }];
        //保留一份原始数据,用于计算缩放比例
        shape.oPoints = [{ ...boxRectLines[0].p1 }, { ...boxRectLines[1].p1 }, { ...boxRectLines[2].p1 }, { ...boxRectLines[3].p1 }];
        // console.table(boxRectLines);
        this.props.EM.emit("appendShape", shape);
        this.setState({ myShapeModalVisible: false });
    }
    handleShapeSelect(selected) {
        // console.log("selected", selected);
        //保存的形状
        if (selected.shapeType == 2) {
            let saveShapeData = JSON.parse(selected.shapeJson);
            let { shape } = saveShapeData;
            Object.assign(shape, {
                id: Utils.generateKey(),
                // type: 0,
            })
            this.props.EM.emit("appendShape", shape);
            this.setState({ myShapeModalVisible: false });

        } else if (selected.shapeType == 1) {
            //上传的形状
            Native.downloadNetworkFile2Text(selected.shapePath, (text) => {
                this.handleShapeSelectSvg(text);
            });
        }
    }

    handlleMaterialListSelect(data) {
        let { modelImgHdPath, imageFilePath, materialPath } = data;
        let { patchPath, materialLength, materialWidth, patchSplitLength, patchSplitWidth } = data;
        let src = patchPath || imageFilePath || materialPath;
        let img = new Image();
        if (materialLength && materialWidth) {
            this.props.EM.emit("putThing", {
                type: 'mask',
                img: src,
                imgWidth: materialWidth,
                imgHeight: materialLength,
                patchWidth: patchSplitWidth || materialWidth,
                patchHeight: patchSplitLength || materialLength
            });
        } else {
            Load.show("请稍候");
            img.onload = () => {
                Load.hide();
                this.props.EM.emit("putThing", {
                    type: 'mask',
                    img: src,
                    imgWidth: img.width,
                    imgHeight: img.height,
                    patchWidth: patchSplitWidth || img.width,
                    patchHeight: patchSplitLength || img.height
                });
            }
            img.src = src;
        }
    }

    render() {
        let { isSaveShapeModalVisible, selectedItem, editorData, floorTypes, wallTypes } = this.state;
        const menus = [{
            title: '形状',
            items: [{
                text: '绘制形状',
                onClick: () => {
                    this.props.EM.emit("createShape");
                    // let text = `<?xml version="1.0" standalone="no"?>
                    //     <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
                    //     "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                    //     <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1">
                    //         <path d="M0,0L300,150L150,1350L300,600L300,750Z"/>
                    //         <path d="M300,0L600,150L450,450L600,600L300,600Z"/>
                    //     </svg>`;
                    // this.handleShapeSelectSvg(text);
                },
            }, {
                text: '我的形状',
                onClick: () => this.toggleState('myShapeModalVisible'),
            }]
        }, {
            title: '素材',
            type: 'menu',
            items: [editorData.type == 1 ? {
                text: '地面素材',
                children: floorTypes.map((type) => {
                    return {
                        key: type.gid,
                        text: type.typeName
                    }
                }),
            } : {
                    text: '墙面素材',
                    children: wallTypes.map((type) => {
                        return {
                            key: type.gid,
                            text: type.typeName
                        }
                    }),
                }/**, {
                text: '我的素材'
            }**/]
        }];
        const uploadModalItems = [{
            itemProps: {
                label: '形状名称',
            },
            render: ({ getFieldDecorator }) => {
                return getFieldDecorator('shapeName', {
                    rules: [{ required: true, message: '请输入形状名称！' }],
                })(
                    <Input />
                    )
            }
        }];

        if (!this.state.upBtnDisabled) {
            uploadModalItems.push({
                itemProps: {
                    label: '形状文件',
                    extra: '(支持svg格式)'
                },
                render: ({ getFieldDecorator }) => {
                    return getFieldDecorator('file', {
                        rules: [{ required: true, message: '请选择形状文件！' }],
                    })(
                        <UploadFile disabled={this.state.upBtnDisabled} t={20} onFileTypeCheck={(file, callback) => {
                            if (file.type !== 'image/svg+xml') {
                                message.error('格式错误！');
                                callback(false)
                                return;
                            }
                            let reader = new FileReader();
                            reader.onload = () => {
                                let el_temp = document.createElement("div");
                                el_temp.innerHTML = reader.result;
                                let ds = Array.from(el_temp.querySelectorAll("path")).map(x => x.getAttribute("d"));
                                if (ds.length == 0) {
                                    message.error("该文件不含有PATH路径信息")
                                    callback(false)
                                } else {
                                    callback(true)
                                }
                            }
                            reader.readAsText(file)
                        }} />
                        )
                }
            });
        }
        return (
            <aside id={'mainAside'}>
                <div className={'menu'}>
                    {menus.map(({ type, title, items = [] }, i) => {
                        if (type === 'menu') {
                            return (
                                <div className={'menu-item'} key={'menu' + i}>
                                    <h4>{title}</h4>
                                    <Menu
                                        key={title}
                                        selectedKeys={[this.state.selectedKey]}
                                        onSelect={(item) => {
                                            let data = [...wallTypes, ...floorTypes].find(x => x.gid == item.key);
                                            this.setState({
                                                selectedKey: item.key,
                                                selectedItem: data,
                                                isHide: false
                                            })
                                        }}
                                    >
                                        {items.map(({ text, onClick, children, daa }, j) => {
                                            if (children) {
                                                return (
                                                    <SubMenu title={text} key={text}>
                                                        {children.map(({ text: text1, key }, k) => {
                                                            return (
                                                                <Menu.Item key={key}>
                                                                    <div onClick={onClick}>
                                                                        {text1}
                                                                    </div>
                                                                </Menu.Item>
                                                            );
                                                        })}
                                                    </SubMenu>
                                                )
                                            } else {
                                                return (
                                                    <Menu.Item key={text}>
                                                        <div onClick={onClick}>
                                                            {text}
                                                        </div>
                                                    </Menu.Item>
                                                )
                                            }
                                        })}
                                    </Menu>
                                </div>
                            )
                        } else {
                            return (
                                <div className={'menu-item'} key={'menu' + i}>
                                    <h4>{title}</h4>
                                    {items.map(({ text, onClick }, j) => {
                                        const key = 'text' + text + j;
                                        return (
                                            <div
                                                key={key}
                                                onClick={onClick}
                                            >
                                                {text}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        }
                    })}
                </div>
                <div className={"content" + (this.state.isHide ? ' isHidden' : '')}>
                    {this.state.selectedKey === '我的素材' ? (
                        <MyMaterialList onSelect={this.handlleMaterialListSelect} />
                    ) : (
                            <MaterialList
                                onSelect={this.handlleMaterialListSelect}
                                url={'/frontAjax/findPatchWorkInfoListAction.action'}
                                params={{
                                    selectedItem,
                                    typeGid: (selectedItem || {}).gid,
                                    parentTypeGid: editorData.type == 1 ? 118 : 117
                                }}
                            />
                        )}
                    <img
                        className="handleIcon"
                        onClick={() => this.toggleState('isHide')}
                        src={this.state.isHide ? asideShowIcon : asideHideIcon}
                    />
                </div>

                <ItemsModal
                    visible={this.state.myShapeModalVisible}
                    onCancelForm={() => {
                        this.setState({ upBtnDisabled: false });
                    }}
                    onCancel={() => {
                        this.toggleState('myShapeModalVisible');
                    }}
                    onSelect={this.handleShapeSelect}
                    title={'形状'}
                    url={'/frontAjax/queryMemberSourceShapeListAction.action'}
                    saveUrl={'/frontAjax/optUpdateMemberSourceShapeAction.action'}
                    createUrl={'/frontAjax/createMemberSourceShapeAction.action'}
                    delUrl={'/frontAjax/optDeleteMemberSourceShapeAction.action'}
                    uploadModalItems={uploadModalItems}
                    formatValues={(values) => {
                        values.shapeType = 1; //上传的svg形状文件
                        if (values.file) {
                            values.shapeFileGid = values.file.fileGid;
                        }
                        values.shapeName = encodeURI(values.shapeName);
                        delete values.file;
                        return values;
                    }}
                    formatEditorValues={(values) => {
                        values.file = {};
                        // values.file.fileName = !values.shapePath ? "" : values.shapePath.split('/').pop().split('-').pop();
                        // values.file.fileGid = values.gid;
                        this.setState({ upBtnDisabled: true });
                        return values;
                    }}
                />
                <FormModal
                    setForm={(form) => {
                        this.form = form
                    }}
                    title={'保存形状'}
                    items={[{
                        itemProps: {
                            label: '形状名称',
                        },
                        render: ({ getFieldDecorator }) => {
                            return getFieldDecorator('shapeName', {
                                rules: [{ required: true, message: '请输入形状名称！' }],
                            })(
                                <Input />
                                )
                        }
                    }]}
                    onOk={(obj) => {
                        this.handleSaveShape(obj);
                    }}
                    visible={isSaveShapeModalVisible}
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
                            isSaveShapeModalVisible: false
                        })
                    }}
                />

            </aside>
        )
    }

    toggleState(state, value = !this.state[state]) {
        this.setState({ [state]: value });
    }
}
