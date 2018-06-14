import React from 'react'
import './Header.less'
import Request from '../../../config/Request';
import axios from 'axios';
import Item from '../../Public/Item'
import defaultImg from '../../../images/defaultImg.png'
import { Card, Modal, Input, Row, Col, Pagination, Upload, message, Select, Button, AutoComplete, Checkbox } from 'antd';
import $ from 'jquery';
window.xwmObj = { "fms": [], "wbs": [], "wms": [] };
const Option = Select.Option;
window.provinceData = [];
window.cityData = {};
let loadImg = require("../../../images/loading.gif");
export default class Header extends React.Component {

    constructor() {
        super();
        this.state = {
            //项目属性部分
            projectId: null,
            projectName: '我的项目',
            wallHeight: 3000,
            areaName: "",
            copyModalImageUrl: require('../../../images/houseType.jpg'),
            //项目属性部分

            saveModal: false,
            openModal: false,
            copyModal: false,
            messageModal: false,
            copy2Modal: false,
            canSaveModal: false,
            copy2ModalIconLeftMove: false,
            copy2ModalIconLeftX: 200,
            copy2ModalIconRightX: 300,
            copy2ModalIconY: 20,
            copy2ModalIconRightMove: false,
            copy2ModalRealDistance: 100,
            newModal: false,
            setModal: false,
            marshallingModal: false,
            marshallingModalCurrentPage: 1,
            marshallingModalTotal: 0,
            marshallingModalList: [],
            openModalItems: [],
            openModalTotal: 0,
            openModalCurrentPage: 1,
            disPlayModal: "block",
            disPlay2Modal: "none",

            threeDModal: false,
            threeDModalProgress: 10,
            threeDModalProgressText: '请稍候...',
            memberInfo: {},

            headerHover: false,
            mouseType: 'scale',
            cities: [],
            secondCity: "",
            dataSource: [],
            housesValue: "",
            scenarioName: "",
            houseError: false,
            roomError: false,
            BuildingData: null,
            provinceName: "",
            houseNameArr: []

        };
        ([window.disPlay, window.headIndex, window.h_value] = [null, 0, ""]);
        window.EM.on('bootOpenProject', (project) => {
            let { housesValue, scenarioName, provinceName } = this.state;
            housesValue = window.h_value;
            scenarioName = window.schemeName;
            provinceName = window.provinceName;
            ([window.choseRoom, window.choseHall] = [true, true]);
            this.setState({
                projectId: project.id,
                projectSchemeNo: project.schemeNo,
                projectName: project.name,
                areaName: project.areaName,
                housesValue,
                scenarioName,
                copyModalImageUrl: !!project.copyDraft ? project.copyDraft.imageDataUrl : require('../../../images/houseType.jpg'),
                disPlayModal: !!project.copyDraft ? "none" : "block",
                disPlay2Modal: !!project.copyDraft ? "block" : "none",
                wallHeight: project.wallHeight || 3000
            }, () => {
            });
        });
        // window.EM.on("loadMemberInfo", (obj) => {
        //     this.setState({ memberInfo: obj })
        // })
        window.EM.on('brushHead', () => {
            this.setState({ mouseType: 'brush' });
        });
        window.EM.on('scaleHead', (callback) => {
            this.setState({ mouseType: 'scale' });
        });
        window.EM.on('showSave', () => {

            let { cities } = this.state;
            if (cities.length == 0) {
                if (!!!window.provinceCode) {
                    this.handleProvinceChange(1000000);
                    window.cityCode = 1000050;
                    window.canSerch = true;
                }
            }
            this.setModalVisible('saveModal', true);
        });
        window.EM.on('buildingLocation', () => {
            let { cities } = this.state;
            if (cities.length == 0) {
                if (!!!window.provinceCode) {
                    this.handleProvinceChange(1000000);
                    window.cityCode = 1000050;
                    window.canSerch = true;
                }
            }
        });
        window.isSaved = true;
        /**
         * window.wallHeight:墙的默认高度；
         * window.houseRoom：默认选择几室；
         * window.houseLiving：默认选择几厅；
        */
        ([window.wallHeight, window.isChosed, window.houseRoom, window.houseLiving, window.canSerch] = [3000, false, "室", "厅", false]);
        /**
         * window.provinceName:省份
         * window.cityName：城市
        */
        ([window.choseRoom, window.choseHall, window.provinceCode, window.provinceName, window.cityName] = [false, false, null, "北京", "密云县"]);
        // console.log(remote.app.getVersion());
        window.downCloseSetting = true;
        window.downCloseFacsimile = true;
    }
    loadModal(type, maxTime = 5000) {
        clearInterval(this.threeDModalProgressTimer);
        if (type == "show") {
            let count = 0;
            this.setState({ threeDModal: true });
            this.threeDModalProgressTimer = setInterval(() => {
                count += 100;
                if (count > maxTime) {
                    count = 0;
                }
                this.setState({
                    threeDModalProgress: Math.floor(count / maxTime * 360),
                });
            }, 50);
        } else if (type == 'hide') {
            clearInterval(this.threeDModalProgressTimer);
            this.setState({ threeDModal: false });
        }
    }
    setModalVisible(modalVisible, value) {
        this.setState({ [modalVisible]: value });
    }

    getMarshallingModalList(page = 1) {
        this.setState({
            marshallingModalList: <li style={{ 'justifyContent': 'center' }}><img style={{
                height: 40
            }} src={loadImg} /></li>
        });
        Request.get('/frontAjax/memberQueryMemberModelGroupList.action', {
            params: {
                pageSize: 4,
                curPage: this.state.marshallingModalCurrentPage
            }
        }).then((data) => {
            if (data && data.data && data.data.code === 1000) {
                let { total, memberModelGroupList: list } = data.data;
                this.setState({
                    marshallingModalTotal: total,
                    marshallingModalCurrentPage: page
                });
                if (total === 0) {
                    this.setState({
                        marshallingModalList: <span>没有内容</span>
                    })
                } else {
                    let items = [];

                    function deleteItem(gid, index) {
                        Request.get('/frontAjax/memberDeleteMemberModelGroup.action', {
                            params: {
                                gid
                            }
                        }).then((data) => {
                            if (data && data.data && data.data.code === 1000) {
                                let list = this.state.marshallingModalList;
                                list.splice(index, 1);
                                this.setState({
                                    marshallingModalList: list
                                })
                            }
                        })
                    }

                    list.map((item, i) => {
                        items.push(<li key={i}>{item.groupName} <span><Item
                            img={require('../../../images/delete.jpg')}
                            onClick={deleteItem.bind(this, item.gid, i)} />
                            <Item
                                img={require('../../../images/read.jpg')}
                            /></span></li>)
                    });
                    this.setState({
                        marshallingModalList: items
                    });
                }
            }
        })
    }

    copy2ModalHandleChange(info) {
        if (info.file.status === 'done') {
            // Get this url from response in real world.
        }
        window.copyDraft = true;
        this.getBase64(info.file.originFileObj, (imageUrl) => {
            this.setState({
                copyModalImageUrl: imageUrl,
                copyModalImageFileUrl: info.file.originFileObj.path
            })
        });
        this.setState({
            copyModal: false,
            copy2Modal: true,
            disPlayModal: "none",
            disPlay2Modal: "block"
        })
        // console.log(this.state)
    }

    copy2ModalIconHandleMove(e) {
        let antModalDOM = document.querySelector('.copy2Modal .ant-modal'),
            imgOffsetTop = this.copy2ModalImgDom.offsetTop - 30,
            imgOffsetLeft = this.copy2ModalImgDom.offsetLeft - 30,
            imgOffsetHeight = this.copy2ModalImgDom.offsetHeight - 30,
            imgOffsetWidth = this.copy2ModalImgDom.offsetWidth + 30,
            //15是icon的宽高的一般
            x = e.clientX - antModalDOM.offsetLeft - 15,
            y = e.clientY - antModalDOM.offsetTop - 90;
        //30是icon的宽高
        // console.log(imgOffsetHeight);
        y = y > imgOffsetTop ? y : imgOffsetTop;
        x = x > imgOffsetLeft ? x : imgOffsetLeft;
        x = x - antModalDOM.offsetLeft > imgOffsetWidth ? imgOffsetWidth + antModalDOM.offsetLeft : x;
        y = y > imgOffsetHeight ? imgOffsetHeight : y;
        if (this.state.copy2ModalIconLeftMove) {
            let rx = this.state.copy2ModalIconRightX;
            this.setState({
                copy2ModalIconLeftX: x + 30 > rx ? rx - 30 : x,
                copy2ModalIconY: y
            })
        } else if (this.state.copy2ModalIconRightMove) {
            let lx = this.state.copy2ModalIconLeftX;
            this.setState({
                copy2ModalIconRightX: x - 30 < lx ? lx + 30 : x,
                copy2ModalIconY: y
            })
        }
    }

    getBase64(img, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    //清除方案信息
    clearMessage() {
        window.EM.emit("clear");
        window.imagePath = require('../../../images/threedbg.png');
        window.isChosed = false;
        window.houseRoom = "室";
        window.houseLiving = "厅";
        window.houseTypeName = "";
        this.handleProvinceChange(1000000);
        window.cityCode = 1000050;
        window.canSerch = true;
        //cityName
        window.h_value = "";
        window.choseRoom = false;
        window.choseHall = false;
        this.setState({
            projectId: null,
            projectSchemeNo: null,
            projectName: '我的项目',
            wallHeight: 3000,
            areaName: "",
            //保存的信息归零
            dataSource: [],
            housesValue: "",
            scenarioName: "",
            houseError: false,
            roomError: false,
            BuildingData: null
        }, () => {

        })
    }

    marshallingModalVisible() {
        this.setModalVisible('marshallingModal', true);
        this.getMarshallingModalList();
    }

    openModalVisible() {
        this.setModalVisible('openModal', true);
        this.getOpenModalItems()
    }

    copyModalVisible() {
        this.setModalVisible('copyModal', true);
    }

    newModalVisible() {
        this.setModalVisible('newModal', true);
    }
    componentDidMount() {
        $("#input_checkbox1").prop("checked", true);
        $("#input_checkbox2").prop("checked", true);
        $("#input_checkbox3").prop("checked", true);
    }

    getOpenModalItems(page = 1) {
        this.setState({
            openModalItems: [<span key={1} className="loading"><img style={{
                height: 40
            }} src={loadImg} /></span>]
        });
        let list = [];
        this.state.openModalCurrentPage = page;
        Request.get('/frontAjax/memberQueryMemberSchemeListAction.action', {
            params: {
                pageSize: 3,
                curPage: page
            }
        }).then((data) => {
            if (data && data.data && data.data.code === 1000) {
                let { total, memberSchemeList: list } = data.data;
                this.setState({
                    openModalTotal: total,
                    openModalCurrentPage: page
                });
                if (total === 0) {
                    this.setState({
                        openModalItems: [<span key={1} className="loading">没有更多数据了</span>]
                    })
                } else {
                    let openModalItems = [];
                    // console.log(data);
                    function deleteItem(gid, e) {
                        e.stopPropagation();
                        // debugger;
                        Request.get('/frontAjax/memberDeleteMemberSchemeAction.action' + '?t=' + Date.now(), {
                            params: {
                                schemeType: 1,
                                gid
                            }
                        }).then((data) => {
                            if (data && data.data && data.data.code === 1000) {
                                this.getOpenModalItems()
                            }
                        })
                        try {
                            Native.removeProjectAsId(list[i].id);
                        } catch (error) {
                            this.getOpenModalItems();
                        }
                    }

                    list.map((item, i) => {
                        openModalItems.push(
                            <Card style={{ cursor: "pointer" }}
                                onClick={() => {
                                    this.loadModal('show', 10000);

                                    !!item.schemeImageFilePath ? window.imagePath = item.schemeImageFilePath : window.imagePath = require('../../../images/threedbg.png');

                                    //获取详情列表；
                                    Request.get('/frontAjax/memberQuerySchemeDetailAction.action', {
                                        params: {
                                            gid: item.gid,
                                            memberGid: window.BootParams['--memberGid'],
                                            token: window.BootParams['--token'],
                                            type: 1
                                        }
                                    }).then((resp) => {
                                        if (resp && resp.data && resp.data.code === 1000) {
                                            let item = resp.data.memberScheme;
                                            let houseFileName = `${window.BootParams['--schemeNo']}_House`;
                                            let modelFileName = `${window.BootParams['--schemeNo']}_Model`;

                                            window.Native.getProjectAsId(window.BootParams['--projectid'], houseFileName, (project) => {
                                                let houseProject = project;
                                                window.Native.getProjectAsId(window.BootParams['--projectid'], modelFileName, (project) => {
                                                    if (!project) {
                                                        project = {};
                                                    }
                                                    !!item.schemeImageFilePath ? window.imagePath = item.schemeImageFilePath : window.imagePath = require('../../../images/threedbg.png');
                                                    project.areaName = item.areaName;
                                                    project.id = item.gid;
                                                    project.projectName = item.schemeName;
                                                    project.schemeNo = item.schemeNo;
                                                    project.areaName = item.houseTypeName;
                                                    project.createTimeStr = item.createTimeStr;
                                                    window.provinceCode = item.provinceCode;
                                                    window.cityCode = item.cityCode;
                                                    window.housesGid = item.configPremisesInfoGid;
                                                    window.h_value = window.downLoadHouse ? "" : item.configPremisesName;
                                                    window.houseTypeName = item.houseTypeName;
                                                    (!!item.houseRoom || item.houseRoom == 0) ? window.houseRoom = item.houseRoom + "室" : window.houseRoom = "室";
                                                    (!!item.houseLiving || item.houseLiving == 0) ? window.houseLiving = item.houseLiving + "厅" : window.houseLiving = "厅";
                                                    window.provinceName = item.provinceName;
                                                    window.cityName = item.cityName;
                                                    window.schemeName = item.schemeName;
                                                    window.preceptName = item.schemeName;
                                                    // console.log(window.provinceName);
                                                    // console.log(window.cityName);

                                                    Object.assign(project, houseProject);

                                                    window.EM.emit("bootOpenProject", project);
                                                    window.isChosed = true;
                                                    {/* this.setState({threeDImage:item.schemeImageFilePath}); */ }
                                                    let houseTypeFileNameDown = `${item.schemeNo}_House`;
                                                    let modelFileNameDown = `${item.schemeNo}_Model`;
                                                    Native.getProjectAsId(item.gid, item.schemeNo, (project) => {
                                                        //每次都重新下载项目文件 20170817
                                                        if (true || !!!project) {
                                                            axios.get(item.schemeHouseTypeDataFile + '?t=' + Date.now()).then((resp) => {
                                                                if (!resp.data) {
                                                                    message.error("项目文件不存在");
                                                                    return;
                                                                }

                                                                let houseTypeProject = resp.data;
                                                                project = houseTypeProject;
                                                                project.id = item.gid;
                                                                project.schemeNo = item.schemeNo;


                                                                Native.saveProject(project, houseTypeFileNameDown, () => {
                                                                    axios.get(item.schemeModelDataFile + '?t=' + Date.now()).then((resp) => {
                                                                        if (!resp.data) {
                                                                            message.error("项目文件不存在");
                                                                            return;
                                                                        }
                                                                        Object.assign(project, resp.data, houseTypeProject);
                                                                        !!project.fms ? window.xwmObj.fms = project.fms : window.xwmObj.fms = [];
                                                                        !!project.wbs ? window.xwmObj.wbs = project.wbs : window.xwmObj.wbs = [];
                                                                        !!project.wms ? window.xwmObj.wms = project.wms : window.xwmObj.wms = [];

                                                                        Native.saveProject(resp.data, modelFileNameDown, () => {
                                                                            Native.getProjectAsId(item.gid, houseTypeFileNameDown, (project) => {
                                                                                window.EM.emit('openProject', project, () => {
                                                                                    this.setState({
                                                                                        projectId: project.id,
                                                                                        projectSchemeNo: project.schemeNo,
                                                                                        projectName: project.name,
                                                                                        areaName: project.areaName,
                                                                                        wallHeight: project.data.wallHeight,
                                                                                        copyModalImageUrl: !!project.copyDraft ? project.copyDraft.imageDataUrl : require('../../../images/houseType.jpg'),
                                                                                        disPlayModal: !!project.copyDraft ? "none" : "block",
                                                                                        disPlay2Modal: !!project.copyDraft ? "block" : "none",
                                                                                    });
                                                                                    this.setModalVisible('openModal', false);
                                                                                    this.loadModal('hide');
                                                                                });
                                                                            });
                                                                        }, true);
                                                                    })
                                                                });
                                                            });
                                                        } else {
                                                            project.schemeNo = item.schemeNo;
                                                            window.EM.emit('openProject', project, () => {
                                                                this.setState({
                                                                    projectId: project.id,
                                                                    projectSchemeNo: project.schemeNo,
                                                                    projectName: project.name,
                                                                    areaName: project.areaName,
                                                                    wallHeight: project.data.wallHeight,
                                                                    //增加打开时的临摹图片
                                                                    copyModalImageUrl: !!project.copyDraft ? project.copyDraft.imageDataUrl : require('../../../images/houseType.jpg'),
                                                                    disPlayModal: !!project.copyDraft ? "none" : "block",
                                                                    disPlay2Modal: !!project.copyDraft ? "block" : "none",
                                                                })
                                                                this.setModalVisible('openModal', false);
                                                                this.loadModal('hide');
                                                            });
                                                        }
                                                    })
                                                });
                                            });

                                        }
                                    })
                                }}
                                key={i} bordered={false} style={{ width: '30%', marginTop: -14 }}>
                                <span style={{ position: "absolute", top: 156, left: 24, fontSize: 12 }}>{item.createTimeStr}</span>
                                <span style={{ position: "absolute", top: 136, left: 24, fontSize: 12 }}>{item.schemeName || "未命名"}</span>
                                <div className="img" style={{
                                    'background': `url(${item.schemeDesignImageFilePath || defaultImg}) no-repeat center`,
                                    'backgroundSize': 'contain',
                                    border: '1px solid #ccc',
                                    boxShadow: '0 0 1px rgba(0,0,0,.3)',
                                    cursor: 'pointer',
                                    height: '100px',
                                    // marginTop: 20
                                }}></div>
                                <div style={{ "position": "relative", "height": "40px" }}>
                                    {/* <span style={{ position: "absolute", left: '50%', marginLeft:(!!item.areaName && !!item.areaName.length)? -(12 * item.areaName.length) / 2 + "px": -(12 * 30) / 2 + "px" }} className="text">{item.areaName}</span>  */}
                                    <img style={{ "cursor": "pointer", "position": "absolute", "bottom": "-8px", "right": "-15px" }} src={require('../../../images/deleten.png')} onClick={deleteItem.bind(this, item.gid)} />
                                    {/* <Item
                                        img={require('../../../images/deleten.png')}
                                        imgStyle={{ height: 16, width: 17, position: "absolute", right: 0, bottom: 0 }}
                                        onClick={deleteItem.bind(this, item.gid)}
                                    /> */}
                                </div>
                            </Card>
                        )
                    });
                    this.setState({
                        openModalItems
                    })
                }
            } else {
                this.setState({
                    openModalItems: [<span key={1} className="loading">加载失败</span>]
                })
            }
        })
    }
    threeDModalVisible() {
        this.setModalVisible('threeDModal', true);
        this.setState({
            threeDModalProgress: 0
        });
        let progress = 0,
            that = this,
            timer = setInterval(() => {
                progress++;
                if (progress > 4) {
                    clearInterval(timer);
                    that.setState({
                        threeDModal: false
                    });
                    return
                }
                that.setState({
                    threeDModalProgress: progress * 90
                })
            }, 5000)
    }
    getBuildingMsg() {
        let { dataSource, BuildingData } = this.state;
        Request.get('/frontAjax/queryListLikePremisesName.action', {
            params: {
                memberGid: window.BootParams['--memberGid'],
                token: window.BootParams['--token'],
                cityCode: window.cityCode,
                premisesName: ""
            }
        }).then((resp) => {
            dataSource.length = 0;
            if (resp && resp.data && resp.data.code === 1000) {
                BuildingData = resp.data.configPremisesInfoList;
                resp.data.configPremisesInfoList.map((c) => {
                    dataSource.push(<Option key={c.gid}>{c.name}</Option>);
                })
                this.setState({ dataSource, BuildingData });
            }
        })
    }
    handleProvinceChange(value) {
        //楼盘名称清空，提交时检测
        window.isChosed = false;
        window.provinceData.map((p) => {
            if (p.code == value) {
                window.provinceName = p.name;
            }
        });
        if (!!!window.cityData[value]) {
            return;
        };
        window.cityName = window.cityData[value][0].name;

        this.setState({
            cities: window.cityData[value],
            secondCity: window.cityData[value][0],
            housesValue: !!window.h_value ? window.h_value : ""
        }, () => {
            window.cityCode = window.cityData[value][0].code;
            this.getBuildingMsg();
        });

        // console.log(window.cityData[value]);
        // console.log(cityData);
        // console.log(value); 
    }
    onSecondCityChange(value) {
        let { cities, dataSource } = this.state;
        //楼盘名称清空，提交时检测
        window.isChosed = false;
        if (dataSource.length != 0) {
            dataSource.length = 0;
        }
        window.cityCode = value;
        this.setState({
            secondCity: cities.filter((c) => {
                if (c.code == value) {
                    window.cityName = c.name;
                }
                return c.code == value;

            })[0],
            housesValue: ""
        }, () => {
            window.canSerch = true;
            let { dataSource, housesValue, BuildingData } = this.state;
            window.isChosed = false;
            this.getBuildingMsg();
        });
    }
    handleSearch(value) {
        window.isChosed = false;
        if (!window.canSerch) {
            //提示选择楼盘位置
            message.warn("请选择楼盘位置！");
            this.setState({ housesValue: "" })
            return;
        }
        // if(value.length != 0){
        //     this.setState({housesValue:value});
        //     Request.get('/frontAjax/queryListLikePremisesName.action', {
        //         params: { 
        //             memberGid:window.BootParams['--memberGid'],
        //             token:window.BootParams['--token'],
        //             cityCode:window.cityCode,
        //             premisesName:encodeURI(value)
        //         }
        //     }).then((resp) => {
        //         dataSource.length = 0;
        //         if(resp && resp.data && resp.data.code === 1000){
        //             BuildingData = resp.data.configPremisesInfoList;
        //             resp.data.configPremisesInfoList.map((c)=>{

        //                 dataSource.push(<Option key={c.gid}>{c.cityName}</Option>);
        //             })
        //             this.setState({dataSource,BuildingData});
        //             console.log(BuildingData);
        //         }
        //     })
        // }
        //测试数据
        // window.isChosed = false;
        // this.setState({
        //     dataSource: !value ? [] : [
        //     value,
        //     value + value,
        //     value + value + value,
        //     ],
        //     housesValue:value
        // });
    }
    onSelect(value) {
        let { BuildingData, houseError } = this.state;
        houseError = false;
        BuildingData.map((b) => {
            if (b.gid == value) {
                window.h_value = b.name;
            }
        })
        window.isChosed = true;
        this.setState({ scenarioName: window.h_value + this.state.areaName, housesValue: window.h_value, houseError });

        //todo:收集楼盘gid
        window.housesGid = value;
    }
    choseHouseRoom(value) {
        window.choseRoom = true;

        window.houseRoom = value;
        this.setState({});
        // console.log(window.houseRoom);
    }
    choseHouseLiving(value) {
        window.choseHall = true;
        window.houseLiving = value;
        this.setState({});
        // console.log(window.houseLiving);
    }
    //去首尾空格
    trimStr(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    render() {
        let { cities, dataSource } = this.state;
        let provinceOptions = window.provinceData.map(province => <Option key={province.code}>{province.name}</Option>);
        let cityOptions = cities.map(city => <Option key={city.code}>{city.name}</Option>);
        let hallOptions = [];
        let roomOptions = [];
        for (let i = 0; i < 10; i++) {
            roomOptions.push(
                <Option key={i}>{i + '厅'}</Option>
            )
        }
        for (let i = 0; i < 9; i++) {
            hallOptions.push(
                <Option key={i + 1}>{i + 1 + '室'}</Option>
            )
        }


        return (
            <div className="header-box-design">
                <div className="header-component">
                    <div className="wrap">
                        <div>
                            <Item
                                style={{}}
                                text="新建"
                                onMouseEnter={() => {
                                    window.headIndex = 2;
                                    this.setState({ headerHover: true })
                                }}
                                onMouseLeave={() => {
                                    this.setState({ headerHover: false })
                                }}
                                img={this.state.headerHover && window.headIndex == 2 ? require('../../../images/new1.png') : require('../../../images/new.png')}
                                title="Ctrl+N"
                                onClick={() => {
                                    if (window.BootParams['--takePicture'] == 1) {
                                        return;
                                    }
                                    if (window.isSaved) {
                                        this.setModalVisible('saveModal', true);
                                        return;
                                    }
                                    this.newModalVisible();
                                }}
                            />
                            <Item
                                text="打开"
                                style={{}}
                                onMouseEnter={() => {
                                    window.headIndex = 1;
                                    this.setState({ headerHover: true });
                                }}
                                onMouseLeave={() => {
                                    this.setState({ headerHover: false });
                                }}
                                onClick={() => {
                                    if (window.BootParams['--takePicture'] == 1) {
                                        return;
                                    }
                                    this.openModalVisible();
                                }

                                }
                                title="Ctrl+L"
                                img={this.state.headerHover && window.headIndex == 1 ? require('../../../images/open1.png') : require('../../../images/open.png')}
                            />
                            <Item
                                style={{}}
                                onMouseLeave={() => {
                                    this.setState({ headerHover: false });
                                }}
                                text="临摹"
                                itemid="facsimile"
                                img={this.state.headerHover && window.headIndex == 4 ? require('../../../images/copy1.png') : require('../../../images/copy.png')}
                                onMouseEnter={(e) => {
                                    window.headIndex = 4;
                                    this.setState({ headerHover: true });
                                    if (window.BootParams['--takePicture'] == 1) {
                                        return;
                                    }
                                    $("#header_facsimile").css({
                                        left: $("#facsimile").position().left,
                                        top: $("#facsimile").position().top + $("#facsimile").height(),
                                        display: "block"
                                    });
                                    // this.copyModalVisible();
                                }}
                            />
                            <Item
                                style={{}}
                                text="保存"
                                onMouseEnter={() => {
                                    window.headIndex = 0;
                                    this.setState({ headerHover: true })
                                }}
                                onMouseLeave={() => {
                                    this.setState({ headerHover: false })
                                }}
                                onClick={() => {
                                    if (window.BootParams['--projectType'] == 2 || window.BootParams['--projectType'] == 3) {
                                        window.downLoadHouse = true;
                                    } else {
                                        if (window.saveHouseType || !window.isChosed || !!!window.houseTypeName || !this.state.projectName || !this.state.projectName || !window.choseRoom || !window.choseHall || Number.isNaN(Number.parseInt(window.houseRoom)) || Number.isNaN(Number.parseInt(window.houseLiving))) {
                                            window.downLoadHouse = true;
                                        } else {
                                            window.downLoadHouse = false;
                                        }
                                    }
                                    console.log(window.downLoadHouse);
                                    if (window.downLoadHouse) {
                                        if (window.downLoadHouse) {
                                            window.provinceName = "北京";
                                            window.cityName = "密云县";
                                            window.houseTypeName = "";
                                            window.houseRoom = "室";
                                            window.houseLiving = "厅";
                                            this.state.scenarioName = "";
                                            this.state.housesValue = "";
                                        }
                                        this.setModalVisible('canSaveModal', true);
                                        return;
                                    }

                                    if (this.state.saveModalCallBack) {
                                        this.state.saveModalCallBack();
                                        this.setState({ saveModalCallBack: null });
                                    } else {
                                        this.loadModal('show', 10000);
                                        window.EM.emit("saveProject", {
                                            name: this.state.projectName,
                                            id: this.state.projectId,
                                            schemeNo: this.state.projectSchemeNo,
                                            wallHeight: this.state.wallHeight,
                                            areaName: this.state.areaName,
                                            callback: (project) => {
                                                this.state.projectId = project.id;
                                                this.state.projectSchemeNo = project.schemeNo;
                                                window.isSaved = true;
                                                this.loadModal('hide');
                                            }
                                        });
                                    }
                                }}
                                title="Ctrl+S"
                                img={this.state.headerHover && window.headIndex == 0 ? require('../../../images/save1.png') : require('../../../images/save.png')}
                            />
                            <Item
                                style={{}}
                                onMouseLeave={() => {
                                    this.setState({ headerHover: false })
                                }}
                                text="设置"
                                itemid="setting_item"
                                img={this.state.headerHover && window.headIndex == 7 ? require('../../../images/set1.png') : require('../../../images/set.png')}
                                onMouseEnter={() => {
                                    window.headIndex = 7;
                                    this.setState({ headerHover: true })
                                    if (window.BootParams['--takePicture'] == 1) {
                                        return;
                                    }
                                    $("#header_setting").css({
                                        left: $("#setting_item").position().left,
                                        top: $("#setting_item").position().top + $("#setting_item").height(),
                                        display: "block"
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <Modal
                        title="新建方案"
                        visible={this.state.saveModal}
                        onCancel={() => {
                            this.setModalVisible('saveModal', false);
                            // this.setState({ saveModalCallBack: null });
                        }}
                        width='615px'
                        wrapClassName="saveModal"
                        maskClosable={false}

                    >
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                楼盘位置：
                                <Select size="small" defaultValue={"北京"} value={window.provinceName} style={{ width: 120, marginLeft: 12 }} onChange={(value) => { this.handleProvinceChange(value) }}>
                                    {provinceOptions}
                                </Select>
                                <Select size="small" value={window.cityName} style={{ width: 120 }} onChange={(value) => { this.onSecondCityChange(value) }}>
                                    {cityOptions}
                                </Select>


                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                楼盘名称：<AutoComplete
                                    dataSource={dataSource}
                                    value={this.state.housesValue}
                                    style={{ width: 246, textAlign: 'left', marginLeft: 12, borderRadius: 4, border: this.state.houseError ? '2px solid red' : "none", fontSize: 14 }}
                                    onSelect={this.onSelect.bind(this)}
                                    onSearch={this.handleSearch.bind(this)}
                                    onChange={(value) => {
                                        this.setState({ housesValue: value });
                                    }}
                                    placeholder="请选择楼盘"
                                    filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                                // onBlur = {(value)=>{
                                //     let {housesValue} = this.state;
                                //     if(!window.isChosed){
                                //         this.setState({housesValue:""});
                                //     }
                                // }}
                                />
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                户型名称：<Input style={{ width: 246, textAlign: "left", marginLeft: 12, borderRadius: 4, border: this.state.roomError ? '2px solid red' : "1px solid #CCCCCC" }} size="default" placeholder="例如 ‘高层B1户型’" value={window.houseTypeName}
                                    onChange={(e) => {
                                        let { roomError } = this.state;
                                        if (!!e.target.value) {
                                            roomError = false;
                                        }
                                        this.setState({ areaName: e.target.value, scenarioName: window.h_value + e.target.value, roomError });
                                        window.houseTypeName = this.trimStr(e.target.value);
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 16, fontSize: 16, marginRight: 76 }}></span>
                                <Select size="small" value={window.houseRoom} style={{ width: 120, marginLeft: 12 }} onChange={(value) => { this.choseHouseRoom(value) }}>
                                    {hallOptions}
                                </Select>
                                <Select size="small" value={window.houseLiving} style={{ width: 120 }} onChange={(value) => { this.choseHouseLiving(value) }}>
                                    {roomOptions}
                                </Select>


                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={10}>方案名称：
                                <Input style={{ width: 246, textAlign: "left", marginLeft: 11, border: "1px solid #CCCCCC", borderRadius: 4 }} placeholder="方案名称" value={this.state.scenarioName}
                                    onChange={(e) => {
                                        this.setState({ scenarioName: e.target.value });
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row type="flex" justify="center" style={{ marginTop: 10 }}>
                            <Col offset="2" span={5}><p
                                style={{
                                    backgroundColor: "#00CCCB",
                                    borderRadius: 4, width: 120, height: 35, lineHeight: '35px', marginLeft: -15, textAlign: "center", cursor: "pointer", background: "#999999", color: "#ffffff", fontSize: 16
                                }}
                                onClick={() => {
                                    this.setModalVisible('saveModal', false);
                                    // this.setState({ saveModalCallBack: null });
                                    // this.clearMessage();
                                }}
                            >取消</p></Col>
                            <Col offset="1" span="5">
                                <span className="saveBtn"
                                    style={{
                                        backgroundColor: "#00CCCB",
                                        borderRadius: 4, width: 120, height: 35, lineHeight: '35px', marginLeft: -15
                                    }}
                                    onClick={() => {
                                        window.preceptName = this.trimStr(this.state.scenarioName);
                                        if (!!!window.preceptName) {
                                            window.preceptName = "未命名";
                                        }
                                        if (!window.isChosed) {
                                            message.error("请选择已有楼盘！");
                                            this.setState({ houseError: true });
                                            return;
                                        }
                                        if (!!!window.houseTypeName) {
                                            message.error("请输入户型名称！");
                                            this.setState({ roomError: true });
                                            return;
                                        }
                                        if (!this.state.projectName) {
                                            message.error("输入设计方案名称");
                                            return
                                        }
                                        if (!this.state.areaName) {
                                            message.error("小区、或楼盘名称！");
                                            return
                                        }
                                        if (!window.choseRoom || !window.choseHall || Number.isNaN(Number.parseInt(window.houseRoom)) || Number.isNaN(Number.parseInt(window.houseLiving))) {
                                            message.error("请先选择厅室！");
                                            return
                                        }
                                        //新建的内容；
                                        window.BootParams["--projectType"] = 1;
                                        window.EM.emit("clear");

                                        window.imagePath = require('../../../images/threedbg.png');
                                        this.setState({
                                            projectId: null,
                                            projectSchemeNo: null,
                                            projectName: '我的项目',
                                            wallHeight: 3000
                                        }, () => {

                                        });
                                        window.isSaved = false;
                                        this.setModalVisible('saveModal', false);

                                    }}>确定</span>
                            </Col>
                        </Row>
                    </Modal>
                    <Modal
                        title="方案信息"
                        visible={this.state.messageModal}
                        onCancel={() => {
                            this.setModalVisible('messageModal', false);
                        }}
                        width='615px'
                        wrapClassName="saveModal"
                        maskClosable={false}

                    >
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                楼盘位置：
                                <Select size="small" defaultValue={"北京"} value={window.provinceName} style={{ width: 120, marginLeft: 12 }} onChange={(value) => { this.handleProvinceChange(value) }}>
                                    {provinceOptions}
                                </Select>
                                <Select size="small" value={window.cityName} style={{ width: 120 }} onChange={(value) => { this.onSecondCityChange(value) }}>
                                    {cityOptions}
                                </Select>


                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                楼盘名称：<AutoComplete
                                    dataSource={dataSource}
                                    value={this.state.housesValue}
                                    style={{ width: 246, textAlign: 'left', marginLeft: 12, borderRadius: 4, border: this.state.houseError ? '2px solid red' : "none", fontSize: 14 }}
                                    onSelect={this.onSelect.bind(this)}
                                    onSearch={this.handleSearch.bind(this)}
                                    onChange={(value) => {
                                        this.setState({ housesValue: value });
                                    }}
                                    placeholder="请选择楼盘"
                                    filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                                />
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                户型名称：<Input style={{ width: 246, textAlign: "left", marginLeft: 12, borderRadius: 4, border: this.state.roomError ? '2px solid red' : "1px solid #CCCCCC" }} size="default" placeholder="例如 ‘高层B1户型’" value={window.houseTypeName}
                                    onChange={(e) => {
                                        let { roomError } = this.state;
                                        if (!!e.target.value) {
                                            roomError = false;
                                        }
                                        this.setState({ areaName: e.target.value, scenarioName: window.h_value + e.target.value, roomError });
                                        window.houseTypeName = this.trimStr(e.target.value);
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row type="flex" justify="center">
                            <Col span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 16, fontSize: 16, marginRight: 76 }}></span>
                                <Select size="small" value={window.houseRoom} style={{ width: 120, marginLeft: 12 }} onChange={(value) => { this.choseHouseRoom(value) }}>
                                    {hallOptions}
                                </Select>
                                <Select size="small" value={window.houseLiving} style={{ width: 120 }} onChange={(value) => { this.choseHouseLiving(value) }}>
                                    {roomOptions}
                                </Select>


                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={10}>方案名称：
                                <Input style={{ width: 246, textAlign: "left", marginLeft: 11, border: "1px solid #CCCCCC", borderRadius: 4 }} placeholder="方案名称" value={this.state.scenarioName}
                                    onChange={(e) => {
                                        this.setState({ scenarioName: e.target.value });
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row type="flex" justify="center" style={{ marginTop: 10 }}>
                            <Col offset="2" span={5}><p
                                style={{
                                    backgroundColor: "#00CCCB",
                                    borderRadius: 4, width: 120, height: 35, lineHeight: '35px', marginLeft: -15, textAlign: "center", cursor: "pointer", background: "#999999", color: "#ffffff", fontSize: 16
                                }}
                                onClick={() => {
                                    this.setModalVisible('messageModal', false);
                                }}
                            >取消</p></Col>
                            <Col offset="1" span="5">
                                <span className="saveBtn"
                                    style={{
                                        backgroundColor: "#00CCCB",
                                        borderRadius: 4, width: 120, height: 35, lineHeight: '35px', marginLeft: -15
                                    }}
                                    onClick={() => {
                                        window.preceptName = this.trimStr(this.state.scenarioName);
                                        if (!!!window.preceptName) {
                                            window.preceptName = "未命名";
                                        }
                                        if (!window.isChosed) {
                                            message.error("请选择已有楼盘！");
                                            this.setState({ houseError: true });
                                            return;
                                        }
                                        if (!!!window.houseTypeName) {
                                            message.error("请输入户型名称！");
                                            this.setState({ roomError: true });
                                            return;
                                        }
                                        if (!this.state.projectName) {
                                            message.error("输入设计方案名称");
                                            return
                                        }
                                        if (!this.state.areaName) {
                                            message.error("小区、或楼盘名称！");
                                            return
                                        }
                                        if (!window.choseRoom || !window.choseHall || Number.isNaN(Number.parseInt(window.houseRoom)) || Number.isNaN(Number.parseInt(window.houseLiving))) {
                                            message.error("请先选择厅室！");
                                            return
                                        }
                                        //新建的内容；

                                        this.setModalVisible('messageModal', false);

                                    }}>确定</span>
                            </Col>
                        </Row>
                    </Modal>
                    <Modal
                        title="方案信息"
                        visible={this.state.canSaveModal}
                        onCancel={() => {
                            this.setModalVisible('canSaveModal', false);
                        }}
                        width='615px'
                        wrapClassName="saveModal"
                        maskClosable={false}

                    >
                        {/**
                         * 选择省市
                         * 楼盘位置
                         * 其他信息
                         */ }
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                楼盘位置：
                                <Select size="small" defaultValue={"北京"} value={window.provinceName} style={{ width: 120, marginLeft: 12 }} onChange={(value) => { this.handleProvinceChange(value) }}>
                                    {provinceOptions}
                                </Select>
                                <Select size="small" value={window.cityName} style={{ width: 120 }} onChange={(value) => { this.onSecondCityChange(value) }}>
                                    {cityOptions}
                                </Select>


                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                楼盘名称：<AutoComplete
                                    dataSource={dataSource}
                                    value={this.state.housesValue}
                                    style={{ width: 246, textAlign: 'left', marginLeft: 12, borderRadius: 4, border: this.state.houseError ? '2px solid red' : "none", fontSize: 14 }}
                                    onSelect={this.onSelect.bind(this)}
                                    onSearch={this.handleSearch.bind(this)}
                                    onChange={(value) => {
                                        this.setState({ housesValue: value });
                                    }}
                                    placeholder="请选择楼盘"
                                    filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                                // onBlur = {(value)=>{
                                //     let {housesValue} = this.state;
                                //     if(!window.isChosed){
                                //         this.setState({housesValue:""});
                                //     }
                                // }}
                                />
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 5, fontSize: 16, marginRight: 10 }}>*</span>
                                户型名称：<Input style={{ width: 246, textAlign: "left", marginLeft: 12, borderRadius: 4, border: this.state.roomError ? '2px solid red' : "1px solid #CCCCCC" }} size="default" placeholder="例如 ‘高层B1户型’" value={window.houseTypeName}
                                    onChange={(e) => {
                                        let { roomError } = this.state;
                                        if (!!e.target.value) {
                                            roomError = false;
                                        }
                                        this.setState({ areaName: e.target.value, scenarioName: window.h_value + e.target.value, roomError });
                                        window.houseTypeName = this.trimStr(e.target.value);
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row type="flex" justify="center">
                            <Col span="22" offset={8}>
                                <span style={{ color: 'red', marginLeft: 16, fontSize: 16, marginRight: 76 }}></span>
                                <Select size="small" value={window.houseRoom} style={{ width: 120, marginLeft: 12 }} onChange={(value) => { this.choseHouseRoom(value) }}>
                                    {hallOptions}
                                </Select>
                                <Select size="small" value={window.houseLiving} style={{ width: 120 }} onChange={(value) => { this.choseHouseLiving(value) }}>
                                    {roomOptions}
                                </Select>


                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col style={{
                                fontSize: 14
                            }} span="22" offset={10}>方案名称：
                                <Input style={{ width: 246, textAlign: "left", marginLeft: 11, border: "1px solid #CCCCCC", borderRadius: 4 }} placeholder="方案名称" value={this.state.scenarioName}
                                    onChange={(e) => {
                                        this.setState({ scenarioName: e.target.value });
                                    }}
                                />
                            </Col>
                        </Row>
                        {(window.BootParams['--projectType'] == 2 || window.BootParams['--projectType'] == 3) ?
                            <Row type="flex" justify="center">
                                <Col span="22" offset={8}>
                                    <span style={{ color: 'red', marginLeft: 16, fontSize: 16, marginRight: 89 }}></span>
                                    <Checkbox onChange={(e) => {
                                        window.isSaveAs = e.target.checked;
                                        console.log(window.isSaveAs);
                                    }}>仅保存该户型</Checkbox>
                                </Col>
                            </Row> : ""}

                        <Row type="flex" justify="center" style={{ marginTop: 10 }}>
                            <Col offset="2" span={5}><p
                                style={{
                                    backgroundColor: "#00CCCB",
                                    borderRadius: 4, width: 120, height: 35, lineHeight: '35px', marginLeft: -15, textAlign: "center", cursor: "pointer", background: "#999999", color: "#ffffff", fontSize: 16
                                }}
                                onClick={() => {
                                    this.setModalVisible('canSaveModal', false);
                                }}
                            >取消</p></Col>
                            <Col offset="1" span="5">
                                <span className="saveBtn"
                                    style={{
                                        backgroundColor: "#00CCCB",
                                        borderRadius: 4, width: 120, height: 35, lineHeight: '35px', marginLeft: -15
                                    }}
                                    onClick={() => {
                                        window.preceptName = this.trimStr(this.state.scenarioName);
                                        if (!!!window.preceptName) {
                                            window.preceptName = "未命名";
                                        }
                                        if (!window.isChosed) {
                                            message.error("请选择已有楼盘！");
                                            this.setState({ houseError: true });
                                            return;
                                        }
                                        if (!!!window.houseTypeName) {
                                            message.error("请输入户型名称！");
                                            this.setState({ roomError: true });
                                            return;
                                        }
                                        if (!this.state.projectName) {
                                            message.error("输入设计方案名称");
                                            return
                                        }
                                        if (!this.state.areaName) {
                                            message.error("小区、或楼盘名称！");
                                            return
                                        }
                                        if (!window.choseRoom || !window.choseHall || Number.isNaN(Number.parseInt(window.houseRoom)) || Number.isNaN(Number.parseInt(window.houseLiving))) {
                                            message.error("请先选择厅室！");
                                            return
                                        }
                                        if (window.BootParams['--takePicture'] == 1 || !window.canSaveObject || !window.show3D) {
                                            return;
                                        }
                                        if (this.state.saveModalCallBack) {
                                            this.state.saveModalCallBack();
                                            this.setState({ saveModalCallBack: null });
                                        } else {
                                            window.loadCeil = true;
                                            window.EM.emit("loadCeil");
                                            if (!window.loadCeil) {
                                                this.setModalVisible('saveModal', false);
                                                return;
                                            }
                                            this.loadModal('show', 10000);
                                            window.EM.emit("saveProject", {
                                                name: this.state.projectName,
                                                id: this.state.projectId,
                                                schemeNo: this.state.projectSchemeNo,
                                                wallHeight: this.state.wallHeight,
                                                areaName: this.state.areaName,
                                                callback: (project) => {
                                                    this.state.projectId = project.id;
                                                    this.state.projectSchemeNo = project.schemeNo;
                                                    // message.info("保存成功");
                                                    window.isSaved = true;
                                                    this.setModalVisible('saveModal', false);
                                                    this.loadModal('hide');
                                                    if (cities.length == 0) {
                                                        if (!!!window.provinceCode) {
                                                            this.handleProvinceChange(1000000);
                                                            window.cityCode = 1000050;
                                                            window.canSerch = true;
                                                        }
                                                    }
                                                    this.setModalVisible('newModal', false);
                                                    // console.log('saveBtn', project);
                                                }
                                            });
                                        }
                                        this.setModalVisible('canSaveModal', false);


                                    }}>保存</span>
                            </Col>
                        </Row>
                    </Modal>
                    <Modal
                        title="打开设计方案"
                        visible={this.state.openModal}
                        onCancel={() => this.setModalVisible('openModal', false)}
                        width='650px'
                        wrapClassName="openModal"
                    >
                        <Row type="flex" justify='space-around'>
                            {this.state.openModalItems}
                        </Row>
                        <Row justify="center" type="flex">
                            <Pagination simple
                                total={this.state.openModalTotal}
                                defaultCurrent={1}
                                pageSize={3}
                                current={this.state.openModalCurrentPage}
                                onChange={(value) => this.getOpenModalItems(value)}
                            />
                        </Row>
                    </Modal>
                    <Modal
                        title="模型编组读取"
                        visible={this.state.marshallingModal}
                        onCancel={() => this.setModalVisible('marshallingModal', false)}
                        width='600px'
                    >
                        <ul className="marshallingModalList">
                            {this.state.marshallingModalList}
                        </ul>
                    </Modal>
                    {/* UI临摹下拉框 */}
                    <div id="header_facsimile" className="header_facsimile"
                        onMouseEnter={() => {
                            window.downCloseFacsimile = false;
                        }}
                        onMouseLeave={() => {
                            window.downCloseFacsimile = true;
                            $("#header_facsimile").css({
                                display: ""
                            });
                        }}
                    >
                        <Upload
                            accept="image/*"
                            className="avatar-uploader"
                            name="avatar"
                            showUploadList={false}
                            // beforeUpload={beforeUpload}
                            action=""
                            onChange={this.copy2ModalHandleChange.bind(this)}
                        >
                            <p>打开临摹图</p>
                        </Upload>

                        <p onMouseDown={() => {
                            window.copyDraft == true && this.setState({ copy2Modal: true });
                        }}>校准尺寸</p>
                        <p onMouseDown={() => {
                            window.EM.emit("copyDraft", {})
                            this.setState({
                                copy2Modal: false,
                                copyModal: false,
                                disPlayModal: "block",
                                disPlay2Modal: "none"
                            }, () => {
                                window.copyDraft = false;
                                $("#header_facsimile").css({
                                    display: ""
                                });
                            })
                        }}>清除背景图</p>
                    </div>
                    {/* UI设置下拉选框 */}
                    <div id="header_setting" className="header_setting"
                        onMouseEnter={() => {
                            window.downCloseSetting = false;
                        }}
                        onMouseLeave={(e) => {
                            e.stopPropagation();
                            window.downCloseSetting = true;
                            var displayPsh = $("#header_setting_sh").attr("style");
                            // debugger;
                            if (!!!displayPsh) {
                                // $("#header_setting").css({
                                //     display:""
                                // });
                                // $("#header_setting").removeAttr("style");
                            }
                        }}
                    >
                        <p onMouseDown={() => {
                            this.setModalVisible('setModal', true);
                        }} onMouseEnter={() => {
                            $("#header_setting_sh").css({
                                display: "none"
                            });
                        }}>墙体高度</p>
                        <p onMouseDown={(e) => {
                            console.log(222);
                            this.setModalVisible('messageModal', true);
                        }} onMouseEnter={() => {
                            $("#header_setting_sh").css({
                                display: "none"
                            });
                        }}>方案信息</p>
                        <p id="sh" onMouseEnter={(e) => {
                            $("#header_setting_sh").css({
                                left: $("#setting_item").position().left + 112,
                                top: $("#setting_item").position().top + $("#setting_item").height() + 12,
                                display: "block"
                            });
                            $("#sh").css("color", "#00CCCB");
                        }}>显示/隐藏 <span></span></p>
                    </div>
                    <div id="header_setting_sh" className="header_setting_sh" onMouseLeave={() => {
                        $("#header_setting_sh").css({
                            display: "none"
                        });
                    }}>
                        <p><input id="input_checkbox1" type="checkbox" onClick={(e) => {
                            e.stopPropagation();
                            if ($("#input_checkbox1").prop("checked")) {
                                //todo:选择显示吊顶
                                $("#ceil_group").css("display", "inline");
                            } else {
                                //todo:选择不显示吊顶
                                $("#ceil_group").css("display", "none");
                            }

                        }} />吊顶</p>
                        <p><input id="input_checkbox2" type="checkbox" onClick={(e) => {
                            e.stopPropagation();
                            if ($("#input_checkbox2").prop("checked")) {
                                //todo:选择显示家具
                                $("#furniture_group").css("display", "inline");
                            } else {
                                //todo:选择不显示家具
                                $("#furniture_group").css("display", "none");
                            }
                        }} />家具</p>
                        <p><input id="input_checkbox3" type="checkbox" onClick={(e) => {
                            e.stopPropagation();
                            if ($("#input_checkbox3").prop("checked")) {
                                //todo:选择显示门窗
                                $(".door").css("display", "inline");
                            } else {
                                //todo:选择不显示门窗
                                $(".door").css("display", "none");
                            }
                        }} />门窗</p>
                    </div>

                    <Modal
                        title="户型图临摹"
                        visible={this.state.copyModal}
                        onCancel={() => this.setModalVisible('copyModal', false)}
                        width='810px'
                        wrapClassName="copyModal"
                    >

                        <div className="item" style={{ display: this.state.disPlayModal }}>
                            <div className="img"
                                style={{ 'backgroundImage': `url(${this.state.copyModalImageUrl})` }}
                            />
                            <div className="text">
                                <p>支持PNG、JPG格式</p>
                                <p>最大5MB</p>
                            </div>
                            <Upload
                                className="avatar-uploader"
                                name="avatar"
                                showUploadList={false}
                                // beforeUpload={beforeUpload}
                                action=""
                                onChange={this.copy2ModalHandleChange.bind(this)}
                            >
                                <div className="btn" >选择本地图片</div>
                            </Upload>
                        </div>
                        {/* <div className="item" style={{ display: this.state.disPlay2Modal }}>
                            <div className="img"
                                style={{ 'backgroundImage': `url(${this.state.copyModalImageUrl})`, marginBottom: 0, display: this.state.disPlay, border: '1px solid #ccc', boxShadow: '0 0 1px rgba(0,0,0,.3)' }}
                            />
                            <Upload
                                className="avatar-uploader"
                                name="avatar"
                                showUploadList={false}
                                // beforeUpload={beforeUpload}
                                action=""
                                onChange={this.copy2ModalHandleChange.bind(this)}
                            >
                                <div className="btn">新上传户型图</div>
                            </Upload>
                        </div> */}
                        {/* <div className="item" style={{ position: "relative", display: this.state.disPlay2Modal }}>
                            <div className="img"
                                style={{ 'backgroundImage': `url(${this.state.copyModalImageUrl})`, border: '1px solid #ccc', boxShadow: '0 0 1px rgba(0,0,0,.3)' }}
                            />

                            <span
                                className="moveIcon"
                                onMouseDown={() => this.setState({ copy2ModalIconLeftMove: true })}
                                style={{
                                    left: 12,
                                    top: 16
                                }}
                            ><span>0mm</span></span>
                            <span
                                className="moveIcon"
                                onMouseDown={(e) => {
                                    this.setState({
                                        copy2ModalIconRightMove: true,
                                    })
                                }}
                                style={{
                                    left: 114,
                                    top: 16
                                }}
                            ><span>{this.state.copy2ModalIconRightX - 30 - this.state.copy2ModalIconLeftX}mm</span></span>

                            <div className="btn" onClick={() => this.setState({ copy2Modal: true, copyModal: false })}>校准尺寸</div>
                        </div>
                        <div className="item" style={{ position: "relative", display: this.state.disPlay2Modal }}>
                            <div className="img"
                                style={{ 'backgroundImage': `url(${this.state.copyModalImageUrl})`, border: '1px solid #ccc', boxShadow: '0 0 1px rgba(0,0,0,.3)' }}
                            />
                            <svg style={{ position: "absolute", top: 0, left: 0 }} height="250" width="250">
                                <rect height="14" width="140" y="0" x="0" transform={"translate(85,70)" + " " + "rotate(45)"} fillOpacity="0.75" strokeOpacity="0.75" strokeWidth="1.5" stroke="#F3A99C" fill="#F3A99C" />
                                <rect height="14" width="140" y="0" x="0" transform={"translate(180,80)" + " " + "rotate(135)"} fillOpacity="0.75" strokeOpacity="0.75" strokeWidth="1.5" stroke="#F3A99C" fill="#F3A99C" />
                            </svg>
                            <div className="btn" onClick={() => {
                                window.EM.emit("copyDraft", {})
                                this.setState({
                                    copy2Modal: false,
                                    copyModal: false,
                                    disPlayModal: "block",
                                    disPlay2Modal: "none"
                                })
                            }
                            }>清除户型图背景</div>
                        </div> */}

                        {/*<div className="item">*/}
                        {/*<div className="img"/>*/}
                        {/*<div className="text">*/}
                        {/*<p>扫描二维码上传</p>*/}
                        {/*<p>或分享二维码扫码上传</p>*/}
                        {/*</div>*/}
                        {/*<div className="btn">发送二维码</div>*/}
                        {/*</div>*/}
                    </Modal>
                    <Modal
                        title="校准尺寸"
                        visible={this.state.copy2Modal}
                        onCancel={() => this.setModalVisible('copy2Modal', false)}
                        width='800px'
                        wrapClassName="copy2Modal"
                    >
                        <div
                            className="wrap"
                            onMouseMove={this.copy2ModalIconHandleMove.bind(this)}
                            onMouseUp={() => this.setState({
                                copy2ModalIconLeftMove: false,
                                copy2ModalIconRightMove: false
                            })}
                            ref=""
                        >

                            <div className="warp">
                                <img
                                    src={this.state.copyModalImageUrl}
                                    alt=""
                                    ref={ref => this.copy2ModalImgDom = ref}
                                />
                            </div>
                            <div>
                                <div className="text"><p style={{ fontSize: 14 }}>输入两点间距离</p><p style={{ fontSize: 14 }}>与效果图一致</p></div>
                                <Input
                                    type="number"
                                    style={{ width: '30%', marginRight: '3%', 'textAlign': 'right', color: '#00CCCB' }}
                                    value={this.state.copy2ModalRealDistance}
                                    onChange={(e) => {
                                        this.setState({ copy2ModalRealDistance: e.target.value });
                                    }}
                                    placeholder="图纸距离"
                                />
                                <span style={{ fontSize: 14 }} className="unit">mm</span>
                                <span
                                    className="moveIcon"
                                    onMouseDown={() => this.setState({ copy2ModalIconLeftMove: true })}
                                    style={{
                                        left: this.state.copy2ModalIconLeftX,
                                        top: this.state.copy2ModalIconY
                                    }}
                                ><span>0mm</span></span>
                                <span
                                    className="moveIcon"
                                    onMouseDown={(e) => {
                                        this.setState({
                                            copy2ModalIconRightMove: true,
                                        })
                                    }}
                                    style={{
                                        left: this.state.copy2ModalIconRightX,
                                        top: this.state.copy2ModalIconY
                                    }}
                                ><span>{this.state.copy2ModalIconRightX - 30 - this.state.copy2ModalIconLeftX}mm</span></span>
                                <div className="btn" onClick={() => {
                                    this.setModalVisible('copy2Modal', false);
                                    let showImg = this.copy2ModalImgDom;
                                    let originImg = new Image();
                                    originImg.onload = () => {
                                        let scale = showImg.height / originImg.height;
                                        let fakeDistance = this.state.copy2ModalIconRightX - 30 - this.state.copy2ModalIconLeftX;
                                        fakeDistance /= scale;
                                        window.EM.emit("copyDraft", {
                                            imageFileUrl: this.state.copyModalImageFileUrl, //图片
                                            imageDataUrl: showImg.src,
                                            height: originImg.height,
                                            width: originImg.width,
                                            realeDistance: parseInt(this.state.copy2ModalRealDistance) || 0,
                                            fakeDistance: fakeDistance,
                                        });
                                    }
                                    originImg.src = showImg.src;
                                }}>确认校准</div>
                                <div className="btn" onClick={() => this.setModalVisible('copy2Modal', false)}>取消</div>
                            </div>
                        </div>
                    </Modal>
                    <Modal
                        title="提示"
                        visible={this.state.newModal}
                        cancelText="不保存"
                        closable={false}
                        okText="保存"
                        onCancel={() => {
                            this.clearMessage();

                            this.setModalVisible('newModal', false);
                            this.setModalVisible('saveModal', true);
                        }}
                        // onOk={()=>{
                        //     window.EM.emit("clear");

                        //     window.imagePath = require('../../../images/threedbg.png');
                        //     window.isChosed = false;
                        //     window.houseRoom = "室";
                        //     window.houseLiving = "厅";
                        //     this.handleProvinceChange(1000000);
                        //     window.cityCode = 1000050;
                        //     window.canSerch = true;
                        //     //cityName
                        //     // debugger;
                        //     window.h_value = "";
                        //     window.choseRoom = false;
                        //     window.choseHall = false;
                        //     this.setState({
                        //         projectId: null,
                        //         projectSchemeNo: null,
                        //         projectName: '我的项目',
                        //         wallHeight: 3000,
                        //         areaName: "",
                        //         //保存的信息归零
                        //         dataSource: [],
                        //         housesValue:"",
                        //         scenarioName:"",
                        //         houseError:false,
                        //         roomError:false,
                        //         BuildingData:null
                        //     },()=>{

                        //     })
                        //     this.setModalVisible('newModal', false)
                        // }}
                        onOk={() => {
                            if (window.BootParams['--takePicture'] == 1 || !window.canSaveObject || !window.show3D) {
                                return;
                            }
                            if (this.state.saveModalCallBack) {
                                this.state.saveModalCallBack();
                                this.setState({ saveModalCallBack: null });
                            } else {
                                this.loadModal('show', 10000);
                                window.EM.emit("saveProject", {
                                    name: this.state.projectName,
                                    id: this.state.projectId,
                                    schemeNo: this.state.projectSchemeNo,
                                    wallHeight: this.state.wallHeight,
                                    areaName: this.state.areaName,
                                    callback: (project) => {
                                        this.state.projectId = project.id;
                                        this.state.projectSchemeNo = project.schemeNo;
                                        // message.info("保存成功");
                                        window.isSaved = true;
                                        this.setModalVisible('saveModal', false);
                                        this.loadModal('hide');
                                        if (cities.length == 0) {
                                            if (!!!window.provinceCode) {
                                                this.handleProvinceChange(1000000);
                                                window.cityCode = 1000050;
                                                window.canSerch = true;
                                            }
                                        }
                                        this.clearMessage();
                                        this.setModalVisible('newModal', false);
                                        this.setModalVisible('saveModal', true);
                                        // console.log('saveBtn', project);
                                    }
                                });
                            }

                        }}
                        width='400px'
                        wrapClassName="setModal"
                    // closable={false}
                    >
                        <p style={{ fontSize: 18 }}>当前方案正在编辑中，是否保存？</p>
                        <span onClick={() => {
                            this.setModalVisible('newModal', false);
                        }} className="tipClose">asd</span>
                    </Modal>
                    <Modal
                        title="设置"
                        visible={this.state.setModal}
                        onCancel={() => this.setModalVisible('setModal', false)}
                        onOk={function () {
                            this.setModalVisible('setModal', false)
                        }.bind(this)}
                        width='450px'
                        wrapClassName="setModal"
                    // closable={false}
                    >
                        <span>墙体默认高度</span>
                        <Input
                            type="number"
                            value={this.state.wallHeight}
                            onChange={(e) => {
                                this.setState({ wallHeight: e.target.value });
                                window.wallHeight = e.target.value;
                            }}
                            style={{ width: '40%', marginRight: '3%', border: '1px solid #888' }}
                            placeholder="高度"
                        />
                        <span>mm</span>
                        {/* <div style = {{position:'absolute',bottom:90}}>
                            <button onClick = {()=>{
                                window.EM.emit("ceilsShow");
                                this.setModalVisible('setModal', false)
                            }} style = {{height:35,width:100,border:'none',backgroundColor:"#9CDCE9",borderRadius:4,marginRight:10,cursor:"pointer"}}>显示吊顶</button>
                            <button onClick = {()=>{
                                window.EM.emit("ceilsHidden");
                                this.setModalVisible('setModal', false)
                            }} style = {{height:35,width:100,border:'none',backgroundColor:"#9CDCE9",borderRadius:4,cursor:"pointer"}}>隐藏吊顶</button>
                        </div> */}

                    </Modal>

                    <Modal
                        visible={this.state.threeDModal}
                        wrapClassName="threeDModal"
                        closable={false}
                        width='300px'
                    // onCancel={this.threeDModalVisible.bind(this)}
                    >
                        <div style={{
                            textAlign: "center",
                            lineHeight: "298px"
                        }}>
                            <img style={{
                                height: 50
                            }} src={loadImg} />
                        </div>
                        {/* <div className="circle_process"
                            style={{
                                transform: `rotate(${this.state.threeDModalProgress - 135}deg)`
                            }}
                        > */}
                        {/* <div
                                className="wrapper right"
                                style={{
                                        transform: `rotate(${(this.state.threeDModalProgress < 180 ? this.state.threeDModalProgress : 180) - 135}deg)`,
                                        background:`url("${require('../../../images/loadCicle.png')}")`
                                    }}
                            > */}
                        {/* <div
                                    className="circle rightcircle"
                                    style={{
                                        transform: `rotate(${(this.state.threeDModalProgress < 180 ? this.state.threeDModalProgress : 180) - 135}deg)`,
                                        background:`url("${require('../../../images/loadCicle.png')}")`
                                    }}
                                /> */}
                        {/* </div> */}
                        {/* </div> */}
                        {/* <div className="bg">
                            {this.state.threeDModalProgressText || "请稍候..."}
                        </div> */}
                    </Modal>
                </div>
                <div className="threeD">
                    {/* <img style={{ height: 110, width: 120, marginLeft: 16, marginTop: 16 }} src={window.imagePath} /> */}
                    <a className="e-btn background green small" onClick={() => {
                        // debugger;
                        if (!window.show3D || !window.canSaveObject) {
                            return;
                        }
                        if (window.BootParams['--takePicture'] == 1) {
                            return;
                        }

                        if (window.BootParams['--projectType'] == 2 || window.BootParams['--projectType'] == 3) {
                            window.downLoadHouse = false;
                        } else {
                            if (window.saveHouseType || !window.isChosed || !!!window.houseTypeName || !this.state.projectName || !this.state.projectName || !window.choseRoom || !window.choseHall || Number.isNaN(Number.parseInt(window.houseRoom)) || Number.isNaN(Number.parseInt(window.houseLiving))) {
                                window.downLoadHouse = true;
                            } else {
                                window.downLoadHouse = false;
                            }
                        }
                        console.log(window.downLoadHouse);
                        if (window.downLoadHouse) {
                            if (cities.length == 0) {
                                if (!!!window.provinceCode) {
                                    this.handleProvinceChange(1000000);
                                    window.cityCode = 1000050;
                                    window.canSerch = true;
                                }
                            }
                            if (window.downLoadHouse) {
                                window.provinceName = "北京";
                                window.cityName = "密云县";
                                window.houseTypeName = "";
                                window.houseRoom = "室";
                                window.houseLiving = "厅";
                                window.h_value = "";
                                this.state.scenarioName = "";
                                this.state.housesValue = "";
                            }
                            this.setModalVisible('canSaveModal', true);
                            this.setState({
                                saveModalCallBack: () => {
                                    this.loadModal("show", 10000);
                                    window.EM.emit("build3D", {
                                        name: this.state.projectName,
                                        id: this.state.projectId,
                                        schemeNo: this.state.projectSchemeNo,
                                        wallHeight: this.state.wallHeight,
                                        areaName: this.state.areaName,
                                        callback: () => {
                                            this.loadModal("hide");
                                        }
                                    });
                                }
                            });
                        } else {
                            this.loadModal("show", 10000);
                            window.EM.emit("build3D", {
                                name: this.state.projectName,
                                id: this.state.projectId,
                                schemeNo: this.state.projectSchemeNo,
                                wallHeight: this.state.wallHeight,
                                areaName: this.state.areaName,
                                callback: () => {
                                    this.loadModal("hide");
                                }
                            });
                        }
                    }}>去3D设计</a>
                </div>
            </div>
        )
    }
}