import React from 'react';
import { message, Modal, Button, Card, Dropdown, Menu, Icon, Select } from 'antd';
import ReactDOM from 'react-dom';
import Utils from './Utils';
import CloseArea from './CloseArea';
import HandleFunc from './HandleFunc';
import RenderFunc from './RenderFunc';
import Panorama from './Panorama';
import Request from '../../config/Request';
import WallComponent from './RenderFunc/WallComponent';
import { svgAsDataUri, svgAsPngUri } from 'save-svg-as-png';
import classifyPoint from 'robust-point-in-polygon';
import PatternEditor from "../PatternEditor";
import $ from "jquery";

import Module from "../Interface/Module";
import Method from "../Interface/Method";
import G from "../Interface/Global";

import jBox from "../Plugins/jBox/jQuery.jBox";
import Load from "../Plugins/loading/LoadingData";

require('./index.less');
require('./rightMenu.css');

export default class Index extends React.Component {
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
        this.state = {
            grid: null,
            AssistLine: [],
            man: {
                x: 2000,
                y: 2000,
            },
            wallHeight: 3000,
            copyDraft: {
                realeDistance: 100,
                fakeDistance: 500,
                width: 200,
                height: 200,
            }, //草稿背景
            project: {},//项目文件备份
            walls: [],//墙
            doors: [],//门
            floors: [],//地板
            furnitures: [],//家具
            brush: [],//画笔
            mouseType: 'scale', //缩放拖动 scale，画线 brush，摆放墙体 put
            putThing: null, //需要放置的物体
            viewBox: null,//svg 视窗
            intersections: [], //交点  测试用
            btnposition: [],
            visible: false,
            areaType: [],
            spainShow: false,
            cameras: [],
            portals: [],
            addPathVisible: true,
            checkPath: [],
            pathLine: [],
            rulerLine: [],
            selectPortal: {
                selectVisible: false,
                position: {
                    x: 0,
                    y: 0
                }
            },
            goToStepTwo: false,
            contextMenuPosition: {
                x: 0,
                y: 0
            },
            contextMenuPortalPosition: {
                x: 0,
                y: 0
            },
            maskingPoint: {
                points: []
            },
            ceils: [],
            handleCeil: null,
            city: []
        };
        //this.state可以在子组件中直接读取
        for (let key in HandleFunc) {
            this[key] = HandleFunc[key].bind(this);
        }
        for (let key in RenderFunc) {
            this[key] = RenderFunc[key].bind(this);
        }
        for (let key in Panorama) {
            this[key] = Panorama[key].bind(this);
        }
        ['handleWindowResize', 'handleKeyDown'].forEach((item) => {
            this[item] = this[item].bind(this);
        })

        window.xwmObj = { "fms": [], "wbs": [], "wms": [] };
        window.THIS = this;
        window.ccs = [];
        window.wcs = [];

        //拼花获取用户信息
        this.props.EM.on("loadMemberInfo", (obj) => {
            this.setState({ memberInfo: obj })
        })
        window.EM.on('clear', () => {
            // if (!window.show3D) {
            //     return;
            // };
            this.setState({
                walls: [], doors: [], intersections: [], furnitures: [], floors: [], copyDraft: {}, ceils: []
            });
            window.invariantFurnitures.length = 0;
            if (window.xwmObj) {
                window.xwmObj.fms = [];
                window.xwmObj.wbs = [];
                window.xwmObj.wms = [];
            }
            window.ccs = [];
            window.wcs = [];
            window.isChanged = false;
            this.contextMenuInvisible();
            this.removeRulerLine();
        });
        window.EM.on('brush', () => {
            this.setState({ mouseType: 'brush', brush: [] });
        });
        window.EM.on('loadCeil', (callback) => {
            this.loadceil(callback);
        });
        window.EM.on('scale', () => {
            this.setState({ mouseType: 'scale', brush: [] });
        });
        window.EM.on('put', (e) => {
            this.handlePutStart(e);
            this.setState({ mouseType: 'put' });
        });
        window.EM.on('saveProject', (e) => {
            this.removeRulerLine();
            this.handleSaveProject(e);
        });
        window.EM.on('loadCityList', (e) => {
            this.loadCity(e);
        });
        //从3d需要直接跳转到拼花时,UserFun.loginSatus触发此事件
        window.EM.on("bootOpenProjectPattren", ({ bind_id, side }) => {
            if (side === 0 || side === 1) {
                //墙
                let wall = this.state.walls.find(x => x.id == bind_id);
                PatternEditor.show({
                    data: {
                        schemeNo: this.state.project.schemeNo,
                        type: 0,
                        wall: wall,
                        wallHeight: this.state.wallHeight,
                        side: side
                    },
                    memberInfo: this.state.memberInfo,
                    callback: (pattern) => {
                        if (!wall.pattern) {
                            wall.pattern = {};
                        }
                        delete pattern.shapes;
                        wall.pattern[side] = pattern;
                        PatternEditor.hide();
                    }
                });
            } else {
                //地板
                let floor = this.state.floors.find(x => x.floorId == bind_id);
                PatternEditor.show({
                    data: {
                        schemeNo: this.state.project.schemeNo,
                        type: 1,
                        floor: floor,
                    },
                    memberInfo: this.state.memberInfo,
                    callback: (pattern) => {
                        delete pattern.shapes;
                        floor.pattern = pattern;
                        PatternEditor.hide();
                    }
                });
            }
        });

        window.EM.on('openProject', (e, callback) => {
            window.ceiling = false;
            this.removeRulerLine();
            this.handleOpenProject(e, (...args) => {
                let { walls, ceils, floors } = this.state;
                //根据相交点把墙拆分
                this.HandleCutWall(this.selectWalls, () => {
                    //根据现有的墙，求出房间 
                    let { walls } = this.state;
                    let pointsArray = CloseArea.getIntersectionPoint(walls);
                    let tfloors = CloseArea.getFloors(walls, pointsArray);

                    //如果他们的area和center一样，则把名称和id还原回去
                    tfloors.forEach((floor) => {
                        let mfloor = floors.find(x => {
                            return (
                                x &&
                                x.area === floor.area &&
                                x.center.x == floor.center.x &&
                                x.center.y == floor.center.y
                            )
                        });
                        if (!!mfloor && mfloor.floorId) {
                            floor.floorId = mfloor.floorId;
                            floor.areaType = mfloor.areaType;
                            floor.pattern = mfloor.pattern;
                        }
                    });
                    tfloors.map((floor) => {
                        let arr = [];
                        floor.points.filter((itemn) => {
                            arr.push([
                                itemn.p.x,
                                itemn.p.y
                            ])
                        })
                        ceils.map((item) => {
                            if (classifyPoint(arr, [item.center.x, item.center.y]) != 1) {
                                item.floor = floor;
                            }
                        })
                    });
                    this.setState({ floors: tfloors, ceils }, () => {
                        this.hanlePatch(pointsArray);
                    });
                });

                callback && callback(...args)
            });
        });

        //进入3D
        window.EM.on("build3D", (e) => {
            this.handleBuild3D(e);
        });

        //临摹图
        window.EM.on("copyDraft", (e) => {
            this.setState({ copyDraft: e });
        });

        //绘制吊顶
        window.EM.on("startCeil", (e, imgPath, obj) => {
            window.ceiling = true;
            this.handleCeilAdjustStart(e, imgPath, obj)
            this.setState({})
        });

        //显示吊顶
        window.EM.on("ceilsShow", () => {
            let { ceils } = this.state;
            this.removeRulerLine();
            ceils.map((c) => {
                c.show = true;
            });
            this.setState({ ceils });
        });

        //隐藏吊顶
        window.EM.on("ceilsHidden", () => {
            let { ceils } = this.state;
            this.removeRulerLine();
            ceils.map((c) => {
                c.show = false;
            });
            this.setState({ ceils });
        });


        ([window.two2Three, window.invariantFurnitures, window.checkPathArr, window.forbidden, window.deleteBtnD, window.deleteIndex] = [true, [], [], false, false, 0]);
        ([window.deleteNumber, window.show3D, window.canPortalClick, window.canAdsorb, window.ceiling, window.isChanged, window.canSaveObject] = [0, true, true, true, false, false, false]);
    }

    /**
     * 执行方法
     */

    //取消右键显示信息
    contextMenuInvisible() {
        document.getElementById("ceilContextMenu").style.display = "none";
        document.getElementById("ceilImgContextMenu").style.display = "none";
        document.getElementById("wallContextMenu_camera").style.display = "none";
        document.getElementById("floorContextMenu_camera").style.display = "none";
    }

    //进入3D
    handleBuild3D(e) {
        window.two2Three = true;
        let project = this.getProjectSaveObject(e);
        Object.assign(project, {
            name: e.name,
            id: e.id,
            schemeNo: e.schemeNo,
            wallHeight: e.wallHeight,
            areaName: e.areaName
        });
        //定义户型文件数据
        let houseTypeProject = {
            "id": project.id,
            "areaName": project.areaName,
            "copyDraft": project.copyDraft,
            "name": project.name,
            "data": project.data,
            "schemeNo": project.schemeNo,
            "ceils": project.ceils
        };

        //定义模型文件数据
        let modelProject = {
            "items": G.saveModelFile.items,
            "wms": G.saveModelFile.wms,
            "fms": G.saveModelFile.fms,
            "wbs": G.saveModelFile.wbs,
            "wcs": G.saveModelFile.wcs,
            "ccs": G.saveModelFile.ccs,
            "patterns": G.saveModelFile.patterns
        };

        //文件名称
        let houseTypeFileName = `${G.currentScheme.schemeNo}_House`;
        let modelFileName = `${G.currentScheme.schemeNo}_Model`;

        //保存户型文件和临时(用真实的schemeNo)
        let { gid, loginToken, memberType } = G.saveMemberInfor;
        let { schemeNo } = G.currentScheme;
        window.Native.saveProject(modelProject, modelFileName, () => {
            window.Native.saveProject(houseTypeProject, houseTypeFileName, () => {
                if (window.two2Three) {
                    window.Native.build3D(gid, loginToken, memberType, schemeNo, G.sourceType, G.currentScheme.gid, window.BootParams['--takePicture']);
                }
                e.callback && e.callback();
            });
        });
    }

    //删除墙门
    deleteWallODoor() {
        let { walls, doors, furnitures } = this.state;
        walls = walls.filter((wall) => {
            if (wall.selected) {
                wall.doors.forEach((door) => {
                    door.selected = true;
                });
                wall.doors = [];
            } else {
                wall.doors = wall.doors.filter((door) => {
                    return !door.selected;
                });
            }
            return !wall.selected;
        });
        doors = doors.filter((door) => {
            return !door.selected;
        });
        this.setState({ walls, doors, furnitures }, () => {
            //根据相交点把墙拆分
            this.HandleCutWall(this.selectWalls, () => {
                //根据现有的墙，求出房间 
                let { walls } = this.state;
                let pointsArray = CloseArea.getIntersectionPoint(walls);
                let floors = CloseArea.getFloors(walls, pointsArray);
                //TODO 如果他们的area和center一样，则把名称和id还原回去
                this.setState({ floors, visible: false }, () => {
                    this.hanlePatch(pointsArray);
                });
            });
            window.isChanged = true;
            if (!!window.BootParams['--takePicture']) {
                window.isChanged = false;
            }
        });
    }

    //打开项目文件
    handleOpenProject(project, callback) {
        window.invariantFurnitures.length = 0;
        let walls = [], doors = [], furnitures = [], floors = [], man = {}, ceils = [];
        let wallHeight;
        let copyDraft = project.copyDraft ? project.copyDraft : {};
        man = this.state.man;
        window.xwmObj.fms = project.fms;
        window.xwmObj.wbs = project.wbs;
        window.xwmObj.wms = project.wms;

        window.ccs = project.ccs;
        window.wcs = project.wcs;
        if (window.ccs == undefined) {
            window.ccs = [];
        }
        if (window.wcs == undefined) {
            window.wcs = [];
        }

        if (!!project.data) {

            wallHeight = project.data.wallHeight || 3000;
            man = project.data.pStart;
            //墙
            walls = project.data.walls.map((item) => {
                let wall = {
                    id: item.id,
                    p1: item.vector[0],
                    p2: item.vector[1],
                }
                //这里不需要修正坐标误差
                Object.assign(wall, Utils.buildWall(wall.p1, wall.p2, this.WALL_WIDTH));
                wall.doors = item.attachComponments.map((item) => {
                    let door = {
                        modelBaseType: item.type,
                        configModelTypeGid: item.configModelTypeGid,
                        id: item.id,
                        uid: Utils.generateKey(),
                        p1: item.p1,
                        percent: item.percent,
                        p2: item.p2,
                        lr: item.lr,
                        ud: item.ud,
                        width: item.smodelLength,
                        modelWidth: item.modelWidth,
                        modelLength: item.modelLength,
                        modelHeight: item.modelHeight,
                        h: item.h
                    };
                    Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH), { wall: wall });
                    doors.push(door);
                    return door;
                });
                wall.ceilid = item.ceilid;
                return wall;
            });
            //地板
            let pointsArray = CloseArea.getIntersectionPoint(walls);
            floors = CloseArea.getFloors(walls, pointsArray);

            //如果他们的area和center一样，则把名称和id还原回去
            floors.forEach((floor) => {
                let mfloor = project.data.floors.find(x => {
                    return (
                        x &&
                        x.area === floor.area &&
                        x.center.x == floor.center.x &&
                        x.center.y == floor.center.y
                    )
                });
                if (!!mfloor) {
                    floor.floorId = mfloor.id;
                    floor.areaType = mfloor.areaType;
                }
            });
            (project.patterns || []).forEach((pattern) => {
                if (!pattern.texturepath) {
                    return;
                }
                // 墙
                if (pattern.type == 0) {
                    let wall = walls.find(x => x.id == pattern.bind_id);
                    if (!!wall) {
                        if (!wall.pattern) {
                            wall.pattern = {};
                        }
                        wall.pattern[pattern.side] = pattern;
                    }
                }
                // 地板
                if (pattern.type == 1) {
                    let floor = floors.find(x => x.floorId == pattern.bind_id);
                    if (!!floor) {
                        floor.pattern = pattern;
                    }
                }
            });
            delete project.patterns;
            //根据id还原pattern

            // floors = project.data.floors.map((floor) => {
            //     let points = floor.points;
            //     return {
            //         points: points.map((x, index) => ({
            //             p: x,
            //             wall: walls.find(x => x.id === floor.walls[index])
            //         })),
            //         center: floor.center || { x: Infinity, y: Infinity },
            //         area: floor.area,
            //     }
            // });
            //正式js
            //家具
            if (!!project.items && !!project.items.length) {
                window.show3D = false;
                let furnitureGig = [];
                let furnituresArr = [];
                project.items.map((furniture, index) => {
                    furnitureGig.push(furniture.b);
                })
                //去重
                furnitureGig = Array.from(new Set(furnitureGig));
                Request.get("/frontAjax/queryDesignTopImageByModelGidStr.action", {
                    params: {
                        gidStr: furnitureGig.join(",")
                    }

                }).then((res) => {
                    res.data.modelTypeInfoList.map((item, index) => {
                        project.items.map((furniture) => {

                            if (furniture.b == item.modelInfoGid) {
                                furniture.designTopViewImagePath = item.designTopViewImagePath;
                                furniture.selected = false;
                                furniture.fillColor = "#00CCCB";
                                furniture.h = !!furniture.h ? furniture.h : [0, 0, 0];
                                furniture.configModelTypeLevelCode = item.configModelTypeLevelCode;
                                furnituresArr.push(furniture);
                            }
                        })
                    })

                    project.items.map((furniture, index) => {
                        let bool = true;
                        res.data.modelTypeInfoList.filter((item) => {
                            if (furniture.b == item.modelInfoGid) {
                                bool = false;
                            }
                        })
                        if (bool) {
                            window.invariantFurnitures.push(furniture);
                        }

                    })
                    /**
                     * 删除没有宽高或宽高等于-1的模型;
                    */
                    let arrf = furnituresArr.filter((item) => {
                        return !!item.q && (item.q[0] != -1 || item.q[1] != -1 || item.q[2] != -1);
                    })
                    /**
                     * 没有宽高或宽高等于-1的模型保存在arrv
                     */
                    let arrv = furnituresArr.filter((item) => {
                        return !(!!item.q && (item.q[0] != -1 || item.q[1] != -1 || item.q[2] != -1));
                    })
                    arrv.map(item => window.invariantFurnitures.push(item))

                    // console.log(window.invariantFurnitures)
                    furnitures = arrf;

                    furnitures.sort(function (a, b) {
                        return a.g[2] - b.g[2]
                    })
                    furnitures.map((item, index) => {
                        if (item.configModelTypeLevelCode == 1005) {
                            furnitures.splice(index, 1);
                            furnitures.unshift(item);
                        }
                    })
                    furnitures.map((furniture, index) => {
                        furniture.cid = "f_" + Math.random() + index;
                        let obj = Utils.buildFurnitures({
                            x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] - 90) * Math.PI / 180),
                            y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] - 90) * Math.PI / 180)
                        }, {
                                x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] + 90) * Math.PI / 180),
                                y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] + 90) * Math.PI / 180)
                            }, furniture.q[1]);
                        Object.assign(furniture, obj);
                    })
                    this.setState({ furnitures }, () => {
                        window.show3D = true;
                    });
                })
            } else {
                furnitures = [];
            }
            //吊顶
            if (!!project.ceils) {
                ceils = project.ceils.map((item) => {
                    let ceil = {};
                    ceil.show = true;
                    ceil.restrictedArea = item.restrictedArea;
                    ceil.cid = item.cid;
                    ceil.ceilModel = [];
                    ceil.wallId = item.wallId;
                    ceil.ply = item.ply;
                    ceil.select = false;
                    ceil.canScale = false;
                    ceil.isTiled = item.isTiled;
                    ceil.beforePoints = item.beforePoints;
                    ceil.points = item.points;
                    ceil.center = !!item.center ? item.center : Utils.getCenterPoint(item.points);
                    ceil.positionPoint = Utils.getCenterPoint(item.beforePoints);
                    item.ceilMsg.map((i) => {
                        ceil.ceilModel.push({
                            "canScale": false,
                            "ceilMsg": {
                                "id": i.gid,
                                "modelLength": Math.abs(i.points[1].x - i.points[0].x),
                                "modelWidth": Math.abs(i.points[0].y - i.points[3].y)
                            },
                            "centerPoint": Utils.getCenterPoint(i.points),
                            "point": Utils.buildWall({ x: i.points[0].x, y: i.points[3].y + (i.points[0].y - i.points[3].y) / 2 }, { x: i.points[1].x, y: i.points[3].y + (i.points[0].y - i.points[3].y) / 2 }, Math.abs(i.points[0].y - i.points[3].y)),
                            "imgFilePath": i.imgFilePath
                        });
                    })
                    return ceil;
                })


            }

        }
        this.setState({
            walls,
            furnitures,
            doors,
            floors,
            man,
            project,
            wallHeight,
            copyDraft,
            ceils
        }, () => {
            callback && callback();
            window.isChanged = false;
        });
    }

    //上传文件json文件
    getProjectSaveObject(e) {
        let { man, walls, doors, furnitures, floors, copyDraft, viewBox, ceils, } = this.state;
        let project = Object.assign({}, e, {
            date: Date.now(),
            wallHeight: undefined,
            callback: undefined,
            eCallback: undefined
        });
        project.copyDraft = copyDraft;
        let data = {};
        //人
        data.pStart = {
            x: man.x,
            y: man.y
        };
        project.patterns = [];

        //墙
        data.walls = walls.map((wall) => {
            let re = {};
            re.id = wall.id;
            re.ceilid = [];

            //墙面选择进拼花
            if (wall.pattern) {
                //左键
                if (wall.pattern[0] && wall.pattern[0].texturepath) {
                    project.patterns.push(wall.pattern[0]);
                }
                //右键
                if (wall.pattern[1] && wall.pattern[1].texturepath) {
                    project.patterns.push(wall.pattern[1]);
                }
            }
            re.points = [
                //四个点，传6个点时加上p2和p1
                (wall.p11c || wall.p11),
                (wall.p21c || wall.p21),
                // wall.p2,
                (wall.p22c || wall.p22),
                (wall.p12c || wall.p12),
                // wall.p1
            ];
            re.pointsWithoutFix = [
                wall.p11,
                wall.p21,
                wall.p22,
                wall.p12
            ];
            re.vector = [wall.p1, wall.p2];
            re.width = wall.WALL_WIDTH;
            wall.selected = false;
            re['attachComponments'] = wall['doors'].map((door) => {
                door.selected = false;
                return {
                    type: door.modelBaseType,
                    configModelTypeGid: door.configModelTypeGid,
                    id: door.id,
                    p1: door.p1,
                    p2: door.p2,
                    lr: door.lr,
                    ud: door.ud,
                    percent: door.percent,
                    x: door.p1.x + (door.p2.x - door.p1.x) / 2,
                    y: door.p1.y + (door.p2.y - door.p1.y) / 2,
                    r: Utils.getRoate(door.p1, door.p2),
                    smodelLength: door.width,
                    modelWidth: door.modelWidth,
                    modelLength: door.modelLength,
                    modelHeight: door.modelHeight,
                    h: door.h,//离地高度
                }
            });
            ceils = ceils.filter((c) => {
                return !!c.floor;
            })
            ceils.map((c) => {
                if (c.isTiled) {
                    c.floor.points.map((p) => {
                        if (wall.id == p.wall.id) {
                            re.ceilid.push(c.cid);
                        }
                    })
                }

            })
            // if(!!wall.cid)
            if (!!wall.ceilid) {
                wall.ceilid.map((cid) => {
                    if (cid.length < 17) {
                        return;
                    }
                    re.ceilid.push(cid.slice(cid.length - 17));
                });
                re.ceilid = Array.from(new Set(re.ceilid));
            };

            //去重

            return re;
        })
        data.wallHeight = e.wallHeight || 3000;

        //地板
        data.floors = floors.map((floor) => {
            let arr = [];
            floor.points.filter((itemn) => {
                arr.push([
                    itemn.p.x,
                    itemn.p.y
                ])
            });
            //地板选择进拼花
            if (floor.pattern) {
                if (!floor.pattern.texturepath) {
                    return;
                }
                project.patterns.push(floor.pattern);
            }

            let points = floor.points;
            let testArr = Utils.rotateThisRec(floor, 0.4);
            let scaleArr = [];
            //缩放的矩形
            testArr.map((item, index) => {
                // return (classifyPoint(arr,[item.x,item.y]) !=1);
                let boolean = true;
                item.map((item1, index1) => {
                    if (classifyPoint(arr, [item1.x, item1.y]) == 1) {

                        boolean = false;
                    }
                });
                if (boolean) {
                    scaleArr.push(item);
                }
            });
            let scaleArea = [];
            scaleArr.filter((item) => {
                scaleArea.push([item[0], item[1], item[3], item[2]]);
            });
            return {
                id: floor.floorId,
                points: points.map(x => x.p),
                walls: points.map(x => x.wall.id),
                center: floor.center,
                area: floor.area,
                scaleArea: scaleArea
            }
        });
        //正式
        let furnitureArr = [];
        furnitures.map(item => furnitureArr.push(item));
        furnitureArr.map((furniture) => {
            delete (furniture["designTopViewImagePath"]);
            delete (furniture["fillColor"]);
            delete (furniture["selected"]);
            delete (furniture["configModelTypeLevelCode"]);
        })
        window.invariantFurnitures.map(item => furnitureArr.push(item))
        project.items = furnitureArr;

        project.data = data;

        project.fms = window.xwmObj.fms;
        project.wbs = window.xwmObj.wbs;
        project.wms = window.xwmObj.wms;
        project.ceils = [];
        ceils.map((ceil) => {
            let ceilModel = ceil.ceilModel.map((item) => {
                return {
                    gid: item.ceilMsg.id,
                    points: [
                        item.point.p11,
                        item.point.p21,
                        item.point.p22,
                        item.point.p12
                    ],
                    imgFilePath: item.imgFilePath
                }
            })
            project.ceils.push({
                wallId: ceil.wallId,
                cid: ceil.cid,
                ceilMsg: ceilModel,
                points: ceil.points,
                ply: ceil.ply,
                isTiled: ceil.isTiled,
                beforePoints: ceil.beforePoints,
                center: ceil.center,
                restrictedArea: ceil.restrictedArea
            })
        })
        //新增字段
        project.wms = window.xwmObj.wms;
        project.fms = window.xwmObj.fms;
        project.wbs = window.xwmObj.wbs;
        project.wcs = window.wcs;
        project.ccs = window.wcs;

        //保存模型文件
        // G.saveModelFile.ccs = project.ccs;
        // G.saveModelFile.fms = project.fms;
        // G.saveModelFile.items = project.items;
        // G.saveModelFile.wbs = project.wbs;
        // G.saveModelFile.wcs = project.wcs;
        // G.saveModelFile.wms = project.wms;
        G.saveModelFile.patterns = project.patterns;
        return project;

    }

    //加载吊顶
    loadceil(callback) {
        let { ceils } = this.state;
        let goNext = true;
        ceils.map((item) => {
            if (item.ceilModel.length > 1) {
                let arr = [];
                item.ceilModel.map((item1, index, ceilArr) => {
                    arr.length = 0;
                    arr.push([item1.point.p11.x, item1.point.p11.y], [item1.point.p21.x, item1.point.p21.y], [item1.point.p22.x, item1.point.p22.y], [item1.point.p12.x, item1.point.p12.y]);
                    for (let i = 0; i < ceilArr.length; i++) {
                        if (i != index) {
                            if (classifyPoint(arr, [ceilArr[i].point.p11.x, ceilArr[i].point.p11.y]) != 1 || classifyPoint(arr, [ceilArr[i].point.p12.x, ceilArr[i].point.p12.y]) != 1 || classifyPoint(arr, [ceilArr[i].point.p21.x, ceilArr[i].point.p21.y]) != 1 || classifyPoint(arr, [ceilArr[i].point.p22.x, ceilArr[i].point.p22.y]) != 1) {
                                goNext = false;
                                ceilArr[i].errStyle = true;
                                item1.errStyle = true;
                            } else {
                                if (goNext) {
                                    ceilArr[i].errStyle = false;
                                    item1.errStyle = false;
                                }
                            }
                        }
                    }
                })
            }
        });
        if (!goNext) {
            message.warn("吊顶重合，请调整");
            this.setState({});
            window.loadCeil = goNext;
        } else {
            window.loadCeil = true;
            !!callback && callback();
        }
    }

    //保存项目
    handleSaveProject(e, callback) {
        let { walls, ceils, floors, wallHeight } = this.state;
        let eCallback = e.callback;
        let project = this.getProjectSaveObject(e);
        ceils.map((c) => {
            c.show = false;
        })
        this.setState({ ceils }, () => {

            //根据墙求最外围的几个点， 以保证截图截全
            let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
            walls.forEach((wall) => {
                [
                    wall.p1, wall.p2,
                    wall.p11, wall.p11,
                    wall.p21, wall.p22,
                ].forEach((p) => {
                    if (p.x < xMin) { xMin = p.x };
                    if (p.x > xMax) { xMax = p.x };
                    if (p.y < yMin) { yMin = p.y };
                    if (p.y > yMax) { yMax = p.y };
                })
            });
            if ((xMax - xMin) / (yMax - yMin) > (4 / 3)) {
                let mmin = (yMin - ((xMax - xMin) / (4 / 3) - (yMax - yMin)) / 2);
                yMax = (yMax + ((xMax - xMin) / (4 / 3) - (yMax - yMin)) / 2);
                yMin = mmin;
            } else {
                let mmin = (xMin - ((4 / 3) * (yMax - yMin) - (xMax - xMin)) / 2);
                xMax = xMax + ((4 / 3) * (yMax - yMin) - (xMax - xMin)) / 2;
                xMin = mmin;
            }
            //截图上下左右边距
            let cutOffset = 200;

            if (!xMin || !xMax) {
                jBox.error("该画布为空，请绘制！");
                G.currentScheme.schemeName = "";
                G.currentScheme.saveSchemeType = 1;
                return false;
            }

            //上传截图
            try {
                document.querySelector(".man").style.display = 'none';
                document.querySelector(".copy-draft").style.display = 'none';
            } catch (e) {

            }

            Load.show("保存中...");

            svgAsPngUri(this.refs.svg, {
                top: yMin - cutOffset,
                left: xMin - cutOffset,
                height: (yMax - yMin) + 2 * cutOffset,
                width: (xMax - xMin) + 2 * cutOffset,
                selectorRemap: (...args) => {
                    // console.log(...args);
                },
                scale: 0.05
            }, (uri) => {
                try {
                    ceils.map(c => {
                        c.show = true;
                    })
                    this.setState({ ceils })
                    document.querySelector(".man").style.display = '';
                    document.querySelector(".copy-draft").style.display = 'block';
                } catch (error) {

                }

                //方案No赋值
                project.schemeNo = G.currentScheme.schemeNo;

                //另存为保存为自己的
                if (G.saveSchemeType === "saveAs") {
                    G.isUseTempId = true;
                    project.schemeNo = Utils.generateKey();
                }

                //保存类型create/saveAs/update
                let saveSchemeType = G.saveSchemeType;

                /**定义保存所需参数*/
                let saveParams = {
                    /**方案GID*/
                    gid: G.currentScheme.gid,
                    /**另存方案时候原方案GID*/
                    sourceGid: "",
                    /**另存方案时候原方案类型*/
                    sourceType: "",
                    /**方案名称*/
                    schemeName: project.currentScheme.schemeName,
                    /**城市编码*/
                    cityCode: project.currentScheme.cityCode,
                    /**楼盘GID*/
                    configPremisesInfoGid: project.currentScheme.configPremisesInfoGid,
                    /**楼盘名称*/
                    configPremisesName: project.currentScheme.configPremisesName,
                    /**户型名称*/
                    houseTypeName: project.currentScheme.houseTypeName,
                    /**几室*/
                    houseRoom: project.currentScheme.houseRoom,
                    /**几厅*/
                    houseLiving: project.currentScheme.houseLiving,
                    /**地面积*/
                    floorArea: "",
                    /**顶面积*/
                    topArea: "",
                    /**墙面积*/
                    wallArea: "",
                    /**方案展示2D图片*/
                    schemeDesignImageFileGid: "",
                    /**户型库进入2D，传入的户型GID*/
                    houseTypeGid: "",
                    /**户型文件GID*/
                    houseTypeFileGid: "",
                    /**模型文件GID*/
                    modelFileGid: "",
                    /**拼花文件GID*/
                    patternFileGid: ""
                };


                console.log(project.currentScheme);

                //定义户型文件数据
                let houseTypeProject = {
                    "id": project.currentScheme.gid,
                    "areaName": project.currentScheme.houseTypeName,
                    "copyDraft": project.copyDraft,
                    "name": project.currentScheme.schemeName,
                    "data": project.data,
                    "schemeNo": project.schemeNo,
                    "ceils": project.ceils
                };

                //定义模型文件数据
                let modelProject = {
                    "items": project.items,
                    "wms": project.wms,
                    "fms": project.fms,
                    "wbs": project.wbs,
                    "wcs": project.wcs,
                    "ccs": project.ccs,
                    "patterns": project.patterns
                };

                //文件名称
                let houseTypeFileName = `${project.schemeNo}_House`;
                let modelFileName = `${project.schemeNo}_Model`;

                /**接口URL*/
                let url = "";

                //只更新方案信息
                if (G.isMessage && G.isUpdateMessage) {
                    Module.saveMemberScheme({
                        saveType: saveSchemeType,
                        params: saveParams,
                        callback: (data) => {
                            Load.hide("", "", () => {
                                G.isUpdateMessage = false;
                                G.schemeList.hasNewScheme = true;
                                jBox.success("更新方案信息成功！");
                            })
                        },
                        eCallback: (data) => {
                            Load.hide("", "", () => {
                                jBox.error(`更新方案信息失败，错误代码:${data.code}`);
                            });
                        }
                    });
                    return false;
                }

                //上传SVG缩略图
                let data = new FormData();
                let file = Native.dataURLtoBlob(uri);
                data.append('file', file, "screenshot.png");
                Request.post("/servlet/FileUploadServlet.htm?t=9", data, {
                    headers: { 'Content-Type': 'multipart/form-data;' },
                    timeout: 100000,
                }).then((data) => {
                    //2D展示图GID
                    saveParams.schemeDesignImageFileGid = data.data;

                    //保存模型文件(使用临时ID)
                    window.Native.saveProject(modelProject, modelFileName, (project, file) => {
                        let modelFormData = new FormData();
                        let modelFile = new Blob([file], { type: "text/json" });
                        modelFormData.append('modelFile', modelFile, `${modelFileName}.json`);

                        //上传模型文件
                        Request.post("/servlet/FileUploadServlet.htm?t=17", modelFormData, {
                            headers: { 'Content-Type': 'multipart/form-data;' },
                            timeout: 100000,
                        }).then((data) => {
                            //模型文件GID
                            saveParams.modelFileGid = data.data;

                            let floorArea = 0, wallArea = 0;
                            !!floors && floors.map((floor) => {
                                floorArea += floor.area;
                                floor.points.map((point) => {
                                    wallArea += (point.wall.distance * G.currentScheme.wallHeight);
                                })
                            });
                            floorArea = Math.floor(floorArea);
                            wallArea = Math.floor(wallArea);

                            //赋值
                            saveParams.floorArea = G.currentScheme.floorArea || floorArea;
                            saveParams.topArea = G.currentScheme.wallArea || wallArea;
                            saveParams.wallArea = G.currentScheme.wallArea || wallArea;

                            //保存户型文件(使用临时ID)
                            window.Native.saveProject(houseTypeProject, houseTypeFileName, (project, file) => {
                                let houseTypeFormData = new FormData();
                                let houseTypeData = new Blob([file], { type: "text/json" });
                                houseTypeFormData.append('houseFile', houseTypeData, `${houseTypeFileName}.json`);

                                //上传户型文件
                                Request.post("/servlet/FileUploadServlet.htm?t=16", houseTypeFormData, {
                                    headers: { 'Content-Type': 'multipart/form-data;' },
                                    timeout: 100000
                                }).then((data) => {
                                    //户型文件GID
                                    saveParams.houseTypeFileGid = data.data;

                                    //更新需要的gid
                                    saveParams.gid = G.currentScheme.gid;

                                    //另存为需要的原方案的gid和类型type
                                    saveParams.sourceType = G.sourceType;
                                    saveParams.sourceGid = G.currentScheme.gid;

                                    //通过户型去装修需要的户型GID
                                    saveParams.houseTypeGid = G.houseType.houseTypeGid;

                                    //另存时，复制源拼花文件
                                    if (G.saveSchemeType === "saveAs") {
                                        //检测是否含有源文件
                                        window.Native.existDirectory(`${G.currentScheme.schemeNo}_pattern`, `${project.schemeNo}_pattern`, (srcDir, tarDir) => {
                                            if (!srcDir) {
                                                //没有源文件直接保存
                                                saveSchemeMessageFun(false, (project, houseTypeProject) => {
                                                    //保存户型文件和临时(用真实的schemeNo)
                                                    window.Native.saveProject(modelProject, `${project.schemeNo}_Model`, () => {
                                                        window.Native.saveProject(houseTypeProject, `${project.schemeNo}_House`, () => {
                                                            this.setState({ project: project }, () => {
                                                                callback && callback(project);
                                                                eCallback && eCallback(project);
                                                            })
                                                        });
                                                    });
                                                }, (project) => {
                                                    //保存失败
                                                    window.two2Three = false;
                                                    callback && callback(project);
                                                    eCallback && eCallback(project);
                                                });
                                            } else {
                                                //有源文件，拷贝
                                                window.Native.copyFolder(srcDir, tarDir, () => {
                                                    //读取是否含有拼花文件
                                                    window.Native.readZipFiles(project.schemeNo, (file) => {
                                                        if (!!file) {
                                                            let pattern = new FormData();
                                                            let patternData = new Blob([file], { type: "application/zip" });
                                                            pattern.append('patternFile', patternData, `${project.schemeNo}.zip`);
                                                            Request.post("/servlet/FileUploadServlet.htm?t=21", pattern, {
                                                                headers: { 'Content-Type': 'multipart/form-data;' },
                                                                timeout: 100000
                                                            }).then((data) => {
                                                                //拼花文件GID
                                                                saveParams.patternFileGid = data.data;

                                                                //保存
                                                                saveSchemeMessageFun(file, (project, houseTypeProject) => {
                                                                    //保存户型文件和临时(用真实的schemeNo)
                                                                    window.Native.saveProject(modelProject, `${project.schemeNo}_Model`, () => {
                                                                        window.Native.saveProject(houseTypeProject, `${project.schemeNo}_House`, () => {
                                                                            //删除拼花压缩包
                                                                            window.Native.deleteFiles("", project.schemeNo, "zip");
                                                                            this.setState({ project: project }, () => {
                                                                                callback && callback(project);
                                                                                eCallback && eCallback(project);
                                                                            })
                                                                        });
                                                                    });
                                                                }, (project) => {
                                                                    //保存失败
                                                                    window.two2Three = false;
                                                                    callback && callback(project);
                                                                    eCallback && eCallback(project);
                                                                });
                                                            });
                                                        } else {
                                                            //保存
                                                            saveSchemeMessageFun(false, (project, houseTypeProject) => {
                                                                //保存户型文件和临时(用真实的schemeNo)
                                                                window.Native.saveProject(modelProject, `${project.schemeNo}_Model`, () => {
                                                                    window.Native.saveProject(houseTypeProject, `${project.schemeNo}_House`, () => {
                                                                        this.setState({ project: project }, () => {
                                                                            callback && callback(project);
                                                                            eCallback && eCallback(project);
                                                                        })
                                                                    });
                                                                });
                                                            }, (project) => {
                                                                //保存失败
                                                                window.two2Three = false;
                                                                callback && callback(project);
                                                                eCallback && eCallback(project);
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    } else {
                                        //读取是否含有拼花文件
                                        window.Native.readZipFiles(project.schemeNo, (file) => {
                                            if (!!file) {
                                                let pattern = new FormData();
                                                let patternData = new Blob([file], { type: "application/zip" });
                                                pattern.append('patternFile', patternData, `${project.schemeNo}.zip`);
                                                Request.post("/servlet/FileUploadServlet.htm?t=21", pattern, {
                                                    headers: { 'Content-Type': 'multipart/form-data;' },
                                                    timeout: 100000
                                                }).then((data) => {
                                                    //拼花文件GID
                                                    saveParams.patternFileGid = data.data;

                                                    //保存
                                                    saveSchemeMessageFun(file, (project, houseTypeProject) => {
                                                        //保存户型文件和临时(用真实的schemeNo)
                                                        window.Native.saveProject(modelProject, `${project.schemeNo}_Model`, () => {
                                                            window.Native.saveProject(houseTypeProject, `${project.schemeNo}_House`, () => {
                                                                //删除拼花压缩包
                                                                window.Native.deleteFiles("", project.schemeNo, "zip");
                                                                this.setState({ project: project }, () => {
                                                                    callback && callback(project);
                                                                    eCallback && eCallback(project);
                                                                })
                                                            });
                                                        });
                                                    }, (project) => {
                                                        //保存失败
                                                        window.two2Three = false;
                                                        callback && callback(project);
                                                        eCallback && eCallback(project);
                                                    });
                                                });
                                            } else {
                                                //保存
                                                saveSchemeMessageFun(false, (project, houseTypeProject) => {
                                                    //保存户型文件和临时(用真实的schemeNo)
                                                    window.Native.saveProject(modelProject, `${project.schemeNo}_Model`, () => {
                                                        window.Native.saveProject(houseTypeProject, `${project.schemeNo}_House`, () => {
                                                            this.setState({ project: project }, () => {
                                                                callback && callback(project);
                                                                eCallback && eCallback(project);
                                                            })
                                                        });
                                                    });
                                                }, (project) => {
                                                    //保存失败
                                                    window.two2Three = false;
                                                    callback && callback(project);
                                                    eCallback && eCallback(project);
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        });
                    });
                });

                //保存文件的方法
                function saveSchemeMessageFun(hasFile, callback, errorCallback) {
                    //保存方案
                    Module.saveMemberScheme({
                        saveType: saveSchemeType,
                        params: saveParams,
                        callback: (data) => {
                            Load.hide("", "", () => {
                                let resText = "";
                                switch (G.saveSchemeType) {
                                    case "create":
                                        resText = "保存成功！";
                                        break;
                                    case "update":
                                        resText = "更新成功！";
                                        break;
                                    case "saveAs":
                                        resText = "另存成功！";
                                        break;
                                }
                                jBox.success(resText);

                                //创建了新的方案
                                G.schemeList.hasNewScheme = true;

                                //删除临时ID保存的文件
                                if (G.isUseTempId) {
                                    window.Native.removeProjectAsId(houseTypeFileName);
                                    window.Native.removeProjectAsId(modelFileName);
                                    !!hasFile && window.Native.renameProjectPatternBySchemeNo(project.schemeNo, data.schemeNo);
                                }

                                //获取真实id,schemeNo   
                                project.id = data.gid || project.id;
                                project.schemeNo = data.schemeNo || project.schemeNo;

                                //保存之后，临时ID取消
                                G.isUseTempId = false;

                                //另存的方案不保存信息
                                if (G.saveSchemeType !== "saveAs") {
                                    //保存成功之后，修改方案No
                                    G.currentScheme.schemeNo = data.schemeNo || project.schemeNo;
                                    //保存成功之后，赋值源的GID
                                    G.currentScheme.gid = project.id;
                                }

                                //定义户型文件数据
                                Object.assign(houseTypeProject, {
                                    "id": project.id,
                                    "schemeNo": project.schemeNo,
                                });

                                //成功之后执行
                                callback && callback(project, houseTypeProject);
                            });
                        },
                        eCallback: (data) => {
                            Load.hide("", "", () => {
                                jBox.error(`保存失败，错误代码:${data.code}`);
                                //失败之后执行
                                errorCallback && errorCallback(project);
                            });
                        }
                    });
                }
            });
        });
    }

    //创建SVG
    createSvgTag(tag, attr) {
        if (!document.createElementNS) return;//防止IE8报错    
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

    //计算Text标签的高宽
    getSvgTextRect(text = "我爱北京天安门", attr) {
        let ele_getSvgTextRect = document.getElementById('getSvgTextRect');
        if (!ele_getSvgTextRect) {
            ele_getSvgTextRect = document.createElement('div');
            ele_getSvgTextRect.setAttribute('id', 'getSvgTextRect');
            ele_getSvgTextRect.style.visibility = 'hidden';
            ele_getSvgTextRect.style.position = 'absolute';
            ele_getSvgTextRect.style.top = '-100000px';
            ele_getSvgTextRect.style.left = '-100000px';
            document.body.appendChild(ele_getSvgTextRect);
        }
        let ele_svg = this.createSvgTag("svg", {});
        let ele_text = this.createSvgTag("text", attr);
        ele_text.innerHTML = text;
        // ele_svg.appendChild(ele_text);
        // ele_getSvgTextRect.appendChild(ele_svg);
        let box = ele_text.getBBox();
        // console.log(text, box);
        return box;
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

    eventRestore(e) {
        let { viewBox } = this.state;
        // let elem_svg = this.refs.svg;
        // let pageX = viewBox.x + (e.pageX - viewBox.rect.left) * viewBox.scaleX;
        // let pageY = viewBox.y + (e.pageY - viewBox.rect.top) * viewBox.scaleY;
        let pageX = (e.pageX - viewBox.x) / viewBox.scaleX + viewBox.rect.left;
        let pageY = (e.pageY - viewBox.y) / viewBox.scaleY + viewBox.rect.top;
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

    //深拷贝
    deepClone(initalObj) {
        var obj = {};

        obj = JSON.parse(JSON.stringify(initalObj));

        return obj;
    }

    jsx2ele(jsx) {
        let el_temp = document.createElement('div');
        ReactDOM.render(jsx, el_temp);
        return el_temp.children[0];
    }
    componentWillMount() {
    }

    //网格
    buildGrid() {
        let grid = {};
        let d = "";
        const MAX = 20000 * 2;
        let position = -MAX;
        while (position < MAX) {
            d += `M${position}, ${-MAX
                }L${position}, ${MAX}`
            d += `M${-MAX},${position}L${MAX}, ${position}`
            position += this.GRID_STEP;
        }
        grid.d = d;
        this.setState({ grid });
    }

    buildMock() {
        //生成模拟数据
        let walls = new Array(1).fill().map((item, id) => {
            let wall = {};
            wall.id = Utils.generateKey();
            wall.p1 = { x: Math.floor(this.WIDTH * Math.random()), y: Math.floor(this.HEIGHT * Math.random()) };
            wall.p2 = { x: Math.floor(this.WIDTH * Math.random()), y: Math.floor(this.HEIGHT * Math.random()) };
            wall.doors = [];
            wall.selected = false;
            return wall;
        });
        walls.forEach((wall) => {
            Object.assign(wall, Utils.buildWall(wall.p1, wall.p2, this.WALL_WIDTH));
        });
        this.setState({
            walls
        });
    }

    //获取SVG显示窗口
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

    //改变窗口大小
    handleWindowResize() {
        let viewBox = this.getviewBox();
        this.setState({ viewBox });
    }

    //检测按键
    handleKeyDown(e) {
        //排除输入框
        if (e.target.tagName === "INPUT"
            || e.target.tagName === "TEXTAREA") {
            return;
        }
        switch (e.keyCode) {
            case 8:
            case 46:
                let { walls, furnitures, doors, cameras, portals, checkPath, selectPortal, pathLine } = this.state;
                let missFurnitures, missDoors;
                let missARR = walls.filter((wall) => {
                    return wall.selected;
                })
                missDoors = doors.filter((door) => {
                    return door.selected;
                })
                if (!!furnitures) {
                    missFurnitures = furnitures.filter((furniture) => {
                        return furniture.selected;
                    });
                }
                if ((!!!missDoors.length && !!!missARR.length) || (!!!missDoors.length && !!!missARR.length && !!furnitures && !!!missFurnitures.length)) {
                    // cameras.filter((item, index) => {
                    //     if (item.selected == true) {
                    //         cameras.splice(index, 1);
                    //     }
                    // })
                    portals.filter((item, index) => {
                        if (item.selected == true) {
                            portals.splice(index, 1);
                            window.deleteNumber++;
                            if (!!checkPath[index]) {
                                let cameraIndex = checkPath[index].checkCameraNum;
                                cameras[cameraIndex].pathTrue = false;
                            }
                            checkPath.splice(index, 1);
                            checkPath.map((item, indexc) => {
                                if (indexc >= index) {
                                    item.checkPortalNum = item.checkPortalNum - 1;
                                }
                            })
                            selectPortal.selectVisible = false;

                        }
                    })
                    cameras.map((item) => {
                        item.pathTrue = false;
                    })
                    checkPath.map((item, index) => {
                        cameras[item.checkCameraNum].pathTrue = true;
                    })
                    pathLine.length = 0;
                    // checkPath.map((item)=>{
                    //     pathLine.push({
                    //         p1:item.checkPortal.position,
                    //         p2:item.checkCamera.position
                    //     })
                    // });
                    window.forbidden = false;
                    this.setState({})
                    return;
                }
                // this.setState({ visible: true })

                //删除操作
                jBox.confirm("确定删除吗？", {
                    confirmType: 3,
                    hasIcon: true,
                    icon: {
                        iconDir: "V",
                        src: require("../UI/Images/enterprise/notice.png"),
                        id: "Notice"
                    },
                    btn: {
                        array: [
                            { text: "取消" },
                            {
                                text: "确定",
                                callback: () => {
                                    this.deleteWallODoor();
                                }
                            }
                        ]
                    }
                });
                break;
            case 13: if (this.state.visible) {
                this.deleteWallODoor();
                this.setState({ visible: false });
            }
                break;
            case 27:
                let { goToStepTwo, maskingPoint } = this.state;
                if (window.BootParams['--takePicture'] == 1 && goToStepTwo) {
                    maskingPoint.points.length = 0;
                    this.setState({ maskingPoint });
                };
                break;
        }
    }

    componentDidMount() {
        // this.buildMock();
        this.buildGrid();
        let viewBox = this.getviewBox();
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('keydown', this.handleKeyDown);
        this.setState({
            viewBox
        }, () => {
            let elem_svg = this.refs.svg;
            elem_svg.addEventListener('mousewheel', this.handleMouseWheel);
            elem_svg.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            //TODO remove
            // window.EM.emit('put', { height: 50, width: 100, type: 'door' });
            // window.EM.emit('put', { height: 150, width: 100, type: 'furniture' });
        })


        // jBox.bindMove("settingSpaceModal");

        //保存/读取状态
        // setInterval(() => {
        //     let walls = JSON.stringify(this.state.walls);
        //     localStorage.setItem('walls', walls);
        // }, 3000);

        // try {
        //     let walls = JSON.parse(localStorage.getItem('walls') || '[]') || [];
        //     walls = walls.concat(this.state.walls);
        //     this.setState({ walls });
        // } catch (error) {
        // }
    }

    componentWillUumount() {
        let elem_svg = this.refs.svg;
        elem_svg.removeEventListener('mousewheel', this.handleMouseWheel)
        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    renderPutThing() {
        let { putThing, mouseType } = this.state;
        if (mouseType != 'put' || !putThing) { return };
        return (
            <g
                fill='red'
                opacity=' 0.5'
            >
                <rect
                    x={putThing.x}
                    y={putThing.y}
                    height={putThing.height}
                    width={putThing.width}
                />
            </g>
        );
    }

    addPathVisible(boolean) {
        let { addPathVisible } = this.state;
        addPathVisible = boolean;
        this.setState({ addPathVisible });
    }

    deleteCheckPath(index) {
        let { checkPath, cameras, pathLine, portals } = this.state;
        pathLine.length = 0;
        let camerasIndex = checkPath[index].checkCameraNum;
        cameras[camerasIndex].pathTrue = false;
        // portals.splice(checkPath.checkPortalNum,1);
        checkPath.splice(index, 1);
        window.deleteBtnD = true;
        window.deleteIndex = index;
        window.deleteNumber++;
        cameras.map((item) => {
            item.pathTrue = false;
        })
        checkPath.map((item, index) => {
            cameras[item.checkCameraNum].pathTrue = true;
        })
        // checkPath.map((item)=>{
        //     pathLine.push({
        //         p1:item.checkPortal.position,
        //         p2:item.checkCamera.position
        //     })
        // })
        this.setState({});
    }

    addPath(callback) {
        let { checkPath, pathLine, cameras, portals } = this.state;
        checkPath.push({
            'checkCamera1': window.checkPathArr[0],
            'checkPortal': window.checkPathArr[1],
            'checkCamera2': window.checkPathArr[2]
        })
        pathLine.length = 0;
        // pathLine.push({
        //     p1: cameras[window.checkPathArr[0]].position,
        //     p2: portals[window.checkPathArr[1]].position,
        //     p3: cameras[window.checkPathArr[2]].position,

        // })
        this.setState({ checkPath, pathLine });
        callback();
    }

    selectportal(item) {
        let { cameras, checkPath, portals, selectPortal, pathLine, maskingPoint } = this.state;
        let kk = checkPath.filter((item) => {
            return item.checkPortalNum == selectPortal.portalIndex;
        })
        let addDigit = 0;
        if (window.deleteNumber != 0) {
            if (kk.length == 0) {
                addDigit = 0;
                window.deleteBtnD = true;
            } else if (selectPortal.portalIndex > window.deleteIndex) {
                selectPortal.portalIndex = selectPortal.portalIndex - window.deleteNumber
                window.deleteBtnD = false;
                addDigit = window.deleteNumber;
            } else {
                window.deleteBtnD = false;
                addDigit = 0;
            }
        } else {
            window.deleteBtnD = false;
            addDigit = 0;
        }
        if (window.deleteNumber == 0 && kk.length == 0) {
            window.deleteBtnD = true;
        }

        if (window.deleteBtnD) {
            portals[selectPortal.portalIndex].toCamera = cameras[item].mid;
            let arr = checkPath.splice(selectPortal.portalIndex);
            checkPath.push(
                {
                    checkCamera: cameras[item],
                    checkPortal: portals[selectPortal.portalIndex],
                    checkCameraNum: item,
                    checkPortalNum: selectPortal.portalIndex,
                    initialPoint: maskingPoint.initialPoint
                }
            );

            arr.map((item) => {
                checkPath.push(item);
            })
            if (window.deleteNumber > 0) {
                window.deleteNumber--;
            }
            pathLine.length = 0;
            pathLine.push({
                p1: checkPath[checkPath.length - 1].initialPoint.position,
                p2: checkPath[checkPath.length - 1].checkPortal.position,
                p3: checkPath[checkPath.length - 1].checkCamera.position,
            })

        } else {
            portals[selectPortal.portalIndex + addDigit].toCamera = cameras[item].mid;
            // console.log(selectPortal.portalIndex)
            // console.log(checkPath[selectPortal.portalIndex])
            // checkPath[selectPortal.portalIndex] = {
            //     checkCamera: cameras[item],
            //     checkPortal: portals[selectPortal.portalIndex + addDigit],
            //     checkCameraNum: item,
            //     checkPortalNum: selectPortal.portalIndex + addDigit,
            //     initialPoint: maskingPoint.initialPoint
            // };
            checkPath[selectPortal.portalIndex] = Object.assign({}, checkPath[selectPortal.portalIndex], {
                checkCamera: cameras[item],
                checkPortal: portals[selectPortal.portalIndex + addDigit],
                checkCameraNum: item,
                checkPortalNum: selectPortal.portalIndex + addDigit
            })
            pathLine.length = 0;
            pathLine.push({
                p1: checkPath[selectPortal.portalIndex].initialPoint.position,
                p2: checkPath[selectPortal.portalIndex].checkPortal.position,
                p3: checkPath[selectPortal.portalIndex].checkCamera.position,
            })
        }

        selectPortal.selectVisible = false;
        window.forbidden = false;
        cameras[item].pathTrue = true;
        cameras.map((item) => {
            item.pathTrue = false;
        })
        checkPath.map((item, index) => {
            cameras[item.checkCameraNum].pathTrue = true;
        })

        // checkPath.map((item)=>{
        //     pathLine.push({
        //         p1:item.checkPortal.position,
        //         p2:item.checkCamera.position
        //     })
        // })
        this.setState({}, () => {
            document.getElementById("selectportal").style.display = "none";
        });
    }

    isInArrayPoint(pointArrRange, pointArr) {
        let bool = true;
        let breakt = false;
        let bArr = [];
        for (let i = 0; i < pointArr.length; i++) {
            if (classifyPoint(pointArrRange, pointArr[i]) == 1) {

                bool = false;
                breakt = true;
            }
            if (breakt) {
                break;
            }
        }

        return bool;
    }

    save360Obj() {
        let { checkPath, cameras } = this.state;
        let arr = [];
        let arr1 = [];
        let obj = [];
        checkPath.map((item) => {
            arr1.push(item.initialPoint.mid)
        });
        let set = new Set(arr1);
        set = Array.from(set)
        set.map((item) => {
            let arr3 = [];
            let arr4 = [];
            checkPath.filter((obj) => {
                if (obj.initialPoint.mid == item) {
                    arr3.push(obj);
                }
            })

            arr3.map((item) => {
                arr4.push({
                    // "id" : item.checkPortal.mid,
                    "channelName": item.checkCamera.areaTypeShow,
                    "targetCameraId": item.checkCamera.mid,
                    "locationX": item.checkPortal.position.x,
                    "locationY": item.checkPortal.position.y,
                    "rotation": Utils.getRoate({ x: item.initialPoint.position.x, y: item.initialPoint.position.y }, { x: item.checkPortal.position.x, y: item.checkPortal.position.y })

                })
            })
            obj.push({
                "id": arr3[0].initialPoint.mid,
                "cameraName": arr3[0].initialPoint.areaTypeShow,
                "locationX": arr3[0].initialPoint.position.x,
                "locationY": arr3[0].initialPoint.position.y,
                "channels": arr4
            })
        })
        cameras.map((camera) => {
            if (set.indexOf(camera.mid) == -1) {
                obj.push({
                    "id": camera.mid,
                    "cameraName": camera.areaTypeShow,
                    "locationX": camera.position.x,
                    "locationY": camera.position.y,
                    "channels": []
                })
            };
        })

        return obj;
    }

    render() {
        let { intersections, viewBox, mouseType, walls, doors, floors, furnitures, checkPath, cameras, portals, ceils } = this.state;
        let Inpindex = 0;
        let wallSelect = (item) => {
            if (item.selected) {
                let { walls, doors } = this.state;
                walls.forEach((wall) => { wall.selected = false });
                doors.forEach((door) => { door.selected = false });
                furnitures.forEach((furniture) => { furniture.selected = false });
                item.selected = true;
            }
            this.setState({ walls, doors, furnitures })
        };
        let handleWallAdjustStartP1 = (e, item) => {
            this.handleWallAdjustStart(e, item, "p1");
        }
        let handleWallAdjustStartP2 = (e, item) => {
            this.handleWallAdjustStart(e, item, "p2");
        }
        //处理画布的图标显示
        let svg_mousedown_handle;
        let svg_cursor;
        if (mouseType == 'scale') {

            svg_mousedown_handle = this.handleScaleStart;
            svg_cursor = '-webkit-grab';
            if (!!this.pStart) { svg_cursor = '-webkit-grabbing'; }
        }
        if (mouseType == 'brush') {

            svg_mousedown_handle = (e) => {
                this.handleBrushStart(e);
                this.handleScaleStart(e);
            };
            svg_cursor = 'Crosshair';
        }
        if (mouseType == 'put') {
            svg_mousedown_handle = this.handlePutDown;
            svg_cursor = 'all-scroll';
        }
        let showMenu = () => {
            floors.map(function (floor) {
                floor.areaShow = false;
                floor.userDefined = false;
            })
            doors.map((door) => {
                door.showmenu = false;
            })

            this.setState({ floors, doors, })
        }
        return (

            <div className='editor-component' ref='editor'>

                <Modal
                    title="提示"
                    visible={this.state.visible}
                    width="380"
                    style={{ fontSize: 18 }}
                    onOk={() => {
                        this.deleteWallODoor()
                    }

                    }
                    onCancel={() => {
                        this.setState({ visible: false })
                    }}
                    okText="确认"
                    cancelText="取消"
                    wrapClassName="setModal"
                    closable={false}
                >
                    <p style={{ fontSize: 18 }}>确定要删除吗？</p>

                </Modal>
                {this.renderCameraType()}
                {this.renderInput()}
                {this.renderdoorInput(doors, viewBox)}
                {this.renderBrushInput()}
                {this.rightMenu(doors)}
                {this.renderRoomType()}
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
                        version='1.1'
                        xmlns='http://www.w3.org/2000/svg'
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            showMenu();
                            // document.getElementById("wallContextMenu_camera").style.display = "none";
                            // document.getElementById("floorContextMenu_camera").style.display = "none";
                            document.getElementById("ceilContextMenu").style.display = "none";
                            document.getElementById("ceilImgContextMenu").style.display = "none";
                            document.getElementById("wallContextMenu_camera").style.display = "none";
                            document.getElementById("floorContextMenu_camera").style.display = "none";
                            if ($("#header_facsimile").css("display") == "block") {
                                $("#header_facsimile").css("display", "none");
                            }
                            $("#header_setting").removeAttr("style");
                            if (window.BootParams['--takePicture'] == 1) {
                                // console.log(1)
                                document.getElementById("selectportal").style.display = "none";
                                document.getElementById("ContextMenu_portal").style.display = "none";
                                document.getElementById("ContextMenu_camera").style.display = "none";
                                // document.getElementById("cameraType").style.display = "none";
                                cameras.map((item) => {
                                    item.cameraTypeVisible = false;
                                });
                                this.setState({})
                            }
                        }}
                    >
                        <defs>
                            <pattern id="closeAreaPattern" x="0" y="0" patternUnits="userSpaceOnUse" height="1600" width="1600" patternTransform="matrix(1,0,0,1,0,0) translate(-673,-210)">
                                <image x="0" y="0" xlinkHref={require('../../images/closeAreaPattern.png')} width="1600" height="1600" />
                            </pattern>
                        </defs>
                        {this.renderCopyDraft()}
                        {this.renderGrids()}
                        {window.BootParams['--takePicture'] == 1 ? this.renderFloors_360() : this.renderFloors()}
                        {window.BootParams['--takePicture'] == 1 ? this.renderWalls_360() : this.renderWalls()}
                        {/* {this.renderFloors()} */}
                        {/* {this.renderWalls()} */}
                        {this.renderBrush()}
                        {this.renderPutThing()}
                        {window.BootParams['--takePicture'] == 1 ? this.renderFurnitures_360() : <g id="furniture_group">{this.renderFurnitures()}</g>}
                        {/* {this.renderFurnitures()} */}

                        {this.AssistLine()}
                        {window.BootParams['--takePicture'] == 1 && this.renderPathLine()}
                        {window.BootParams['--takePicture'] == 1 && this.renderCamera()}
                        {window.BootParams['--takePicture'] == 1 && this.renderPortal()}
                        {window.BootParams['--takePicture'] == 1 && this.renderMasking()}
                        {window.BootParams['--takePicture'] != 1 && <g id="ceil_group">{this.renderCeils(ceils)}</g>}
                        {/* {this.renderRulerLine()} */}
                        {this.RulerLine()}
                        {this.renderMan()}
                        {this.renderPatternSelect()}
                        {this.renderPatternUnSelect()}
                        {intersections.concat(window.DEBUGGER_POINT || []).map((p, index) => {
                            return (
                                <circle
                                    className='debug-point'
                                    key={index}
                                    cx={p.x} cy={p.y} r={10}
                                    style={{
                                        fill: `rgb(255, 255, 255) `,
                                        stroke: 'green',
                                        strokeWidth: '1',
                                        cursor: 'pointer'
                                    }}
                                />
                            );
                        })}
                    </svg>
                }

                {/* 确定重置按钮 */}
                {window.BootParams['--takePicture'] == 1 &&
                    <div>
                        <div style={{ display: this.state.goToStepTwo ? "none" : "block" }} className="btn_bottom">
                            <button style={{ width: 152 }} onClick={(e) => {
                                //todo:进入第二步
                                let { cameras } = this.state;
                                if (window.forbidden && cameras.length != 0) {
                                    message.warn("请先选择相机名称")
                                    return;
                                }
                                this.handlePutStartCamera(e);


                            }}><img style={{ height: 15, marginRight: 10 }} src={require('../../images/u105.png')} /><span>添加相机机位</span></button>
                            <button style={{ width: 152 }} onClick={() => {
                                //todo:进入第二步

                                let { goToStepTwo, cameras } = this.state;
                                if (cameras.length == 0) {
                                    message.warn("请先安放相机");
                                    return;
                                } else if (window.forbidden) {
                                    message.warn("请先选择相机名称");
                                    return;
                                }
                                goToStepTwo = true;
                                cameras.map((camera) => {
                                    camera.selected = false;
                                })
                                this.setState({ goToStepTwo })

                            }}>下一步</button>
                            {/* <button onClick={() => {
                        window.forbidden = false;
                        let { cameras, floors } = this.state;
                        floors.map((floor) => {
                            floor.camera = false;
                        })
                        cameras.length = 0;
                        this.setState({ cameras, floors });
                    }} style={{ background: "#989898" }}>重置</button> */}
                        </div>
                        {/* 开始拍照 */}
                        <div style={{ display: this.state.goToStepTwo ? "block" : "none" }} className="btn_bottom">
                            <button style={{ padding: "15px 15px", height: 45, width: 140 }} onClick={() => {
                                let { cameras, checkPath, portals, goToStepTwo, pathLine, maskingPoint, selectPortal } = this.state;
                                // cameras.map((item)=>{
                                //     item.pathTrue = false;
                                // })
                                window.forbidden = false;
                                // portals.length = 0;
                                goToStepTwo = false;
                                // checkPath.length = 0;
                                pathLine.length = 0;
                                maskingPoint.points.length = 0
                                selectPortal.selectVisible = false;
                                this.setState({ portals, goToStepTwo })


                            }}>上一步</button>
                            <button style={{
                                height: 45, width: 190, background: cameras.filter((item) => {
                                    return item.pathTrue == false;
                                }).length == 0 || (cameras.length == 1 && portals.length == 0) ? "#00CCCB" : "#ccc"
                            }} onClick={() => {
                                let { cameras, checkPath } = this.state;
                                if (cameras.length != 1 && checkPath.length == 0) {
                                    message.warn("请设置传送点")
                                    return;
                                } else if (window.forbidden) {
                                    message.warn("请先选择传送位置")
                                    return;
                                }
                                if (!!!(cameras.filter((item) => {
                                    return item.pathTrue == false;
                                }).length == 0 || (cameras.length == 1 && portals.length == 0))) {
                                    message.warn("请先选择传送位置")
                                    return;
                                }
                                //todo:发送数据（接口）
                                let { project } = this.state;
                                console.log(this.state.project)
                                window.Native.save360Degree(this.save360Obj());
                                Native.build3D(window.BootParams['--memberGid'], window.BootParams['--token'], window.BootParams['--type'], project.schemeNo, window.BootParams['--projectType'], project.id, window.BootParams['--takePicture']);

                            }}>设置完成，开始拍摄</button><span style={{
                                display: cameras.filter((item) => {
                                    return item.pathTrue == false;
                                }).length == 0 || (cameras.length == 1 && portals.length == 0) ? "none" : "inline", color: "#00CCCB"
                            }}>{cameras.filter((item) => {
                                return item.pathTrue == false;
                            }).length}个机位待您设置传送点</span>

                        </div>
                        <div id="img_btn_right" style={{ position: "fixed", top: 360, right: 20, display: this.state.goToStepTwo ? "block" : "none" }}>
                            <div
                                style={{
                                    position: "absolute",
                                    right: 9,
                                    fontSize: 24,
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    document.getElementById("img_btn_right").style.display = "none";
                                }}
                            >&times;</div>
                            <img src={require('../../images/tipImage.png')} />
                        </div>
                        {/* 漫游路径信息栏 */}
                        {this.renderDetailsCard()}
                        {this.renderSelectPortal()}
                        {this.renderContextMenu()}
                        {this.renderContextMenuPortal()}

                    </div>
                }
                {this.renderWallContextMenu()}
                {this.renderFloorContextMenu()}
                {this.renderCeilContextMenu()}
                {this.renderCeilImgContextMenu()}
            </div>
        );
    }
}