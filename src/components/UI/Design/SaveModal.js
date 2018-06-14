import React from 'react';
import Request from '../../../config/Request';
import $ from "jquery";

import Method from "../../Interface/Method";
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

export default class EditorModal extends React.Component {
    constructor() {
        super();
        this.state = {
            //默认省份
            province: {
                code: "1000000",
                name: "北京"
            },
            //默认城市
            city: {
                code: "1301050",
                name: "北京市"
            },
            //室
            roomList: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            //厅
            hallList: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            //几室
            room: "",
            //几厅
            hall: "",
            //楼盘数据(用于显示列表信息)
            buildingData: [],
            //存储楼盘信息(保存查询的全部数据)
            saveBuildData: [],
            //楼盘名称
            premisesName: "",
            //楼盘Gid
            premisesInfoGid: "",
            //户型名称
            houseTypeName: ""
        }
    }

    componentDidMount() {
        Method.commonFuns();

        //获取当前弹出层的类型
        this.getModalType(() => {
            //先获取一次楼盘信息
            //方案信息只读状态不需要加载楼盘
            if (this.props.readOnly) return false;
            this.getBuildingDataList(this.state.city.code);
        });

        //除了楼盘名称的下拉列表
        $(".fb-select-bar >label:not('.form-input')").click(function () {
            let $list = $(this).parent().find(".list ul");
            if ($list.hasClass("active")) {
                $(this).parent().find(".list ul").removeClass("active");
            } else {
                $(".list ul").removeClass("active");
                $(this).parent().find(".list ul").addClass("active");
            }
        });

        //选择之后关闭下拉列表
        $(document).on("click", ".list a", function () {
            $(this).addClass("active").parent().siblings().find("a").removeClass("active");
            $(this).parents("ul").removeClass("active");
        });

        //点击任意位置关闭下拉
        $(document).on("click", function (e) {
            var evt = e || window.event;
            evt.stopPropagation();
            var $target = $(evt.target);

            if (!$target.hasClass("fb-select-bar") && !$target.parents(".fb-select-bar").hasClass("fb-select-bar")) {
                $(".fb-select-bar").find(".list ul").removeClass("active");
            }
        });
    }

    //保存当前输入信息
    getSaveSchemeData(type, callback) {
        let data = this.state;
        let resultData = {};
        if (data.premisesName === "") {
            jBox.error("楼盘名称不能为空！");
            return false;
        }
        if (data.houseTypeName === "") {
            jBox.error("户型名称不能为空！");
            return false;
        }
        if (data.room === "") {
            jBox.error("请选择几室！");
            return false;
        }
        if (data.hall === "") {
            jBox.error("请选择几厅！");
            return false;
        }
        if (!G.currentScheme.isHasBuildName) {
            jBox.error("楼盘名称不匹配，请重新选择！");
            return false;
        }

        if (type !== "saveAs") {
            Object.assign(G.currentScheme, {
                //方案名称
                schemeName: this.state.premisesName + " " + this.state.houseTypeName,
                //省编码
                provinceCode: this.state.province.code,
                //省名称
                provinceName: this.state.province.name,
                //城市编码
                cityCode: this.state.city.code,
                //城市名称
                cityName: this.state.city.name,
                //楼盘GID
                configPremisesInfoGid: this.state.premisesInfoGid,
                //楼盘名称
                configPremisesName: this.state.premisesName,
                //户型名称
                houseTypeName: this.state.houseTypeName,
                //几室
                houseRoom: this.state.room,
                //几厅
                houseLiving: this.state.hall
            });
            resultData = G.currentScheme;
        } else {
            resultData = {
                //方案名称
                schemeName: this.state.premisesName + " " + this.state.houseTypeName,
                //省编码
                provinceCode: this.state.province.code,
                //省名称
                provinceName: this.state.province.name,
                //城市编码
                cityCode: this.state.city.code,
                //城市名称
                cityName: this.state.city.name,
                //楼盘GID
                configPremisesInfoGid: this.state.premisesInfoGid,
                //楼盘名称
                configPremisesName: this.state.premisesName,
                //户型名称
                houseTypeName: this.state.houseTypeName,
                //几室
                houseRoom: this.state.room,
                //几厅
                houseLiving: this.state.hall
            }
        }

        callback && callback.call(this, resultData);
    }

    //获取当前弹出框的类型
    getModalType(callback) {
        //1：新建，2：读取
        let type = G.currentScheme.saveSchemeType;
        switch (type) {
            case 1:
                callback && callback.call();
                break;
            case 2:
                this.setState({
                    province: {
                        code: G.currentScheme.provinceCode || this.state.province.code,
                        name: G.currentScheme.provinceName || this.state.province.name
                    },
                    city: {
                        code: G.currentScheme.cityCode || this.state.city.code,
                        name: G.currentScheme.cityName || this.state.city.name
                    },
                    room: G.currentScheme.houseRoom,
                    hall: G.currentScheme.houseLiving,
                    premisesName: G.currentScheme.configPremisesName,
                    premisesInfoGid: G.currentScheme.configPremisesInfoGid,
                    houseTypeName: G.currentScheme.houseTypeName
                }, () => {
                    callback && callback.call();
                });
                break;
        }
    }

    //获取指定省份ID下面的城市列表
    getCityData(provinceCode) {
        let cityAry = [];
        this.props.cityListAry.map((item, index) => {
            if (item.parentCode === provinceCode) {
                cityAry.push(item);
            }
        });
        cityAry.map((x, index) => {
            if (index === 0) {
                this.setState({
                    city: {
                        code: x.code,
                        name: x.name
                    }
                });
                this.getBuildingDataList(x.code);
            }
        });
    }

    //通过城市ID获取楼盘信息
    getBuildingDataList(cityCode) {
        Load.show("获取楼盘中...", "createContentModal", "small white", "buildLoad");
        Module.getBuildInfor({
            cityCode: cityCode,
            callback: (data) => {
                Load.hide("createContentModal", "buildLoad");
                if (data.code !== 1000) {
                    jBox.error(`获取楼盘失败，错误代码：${data.code}`);
                    return false;
                }
                this.setState({ buildingData: data.configPremisesInfoList, saveBuildData: data.configPremisesInfoList });
            }
        });
    }

    //获取通过文字模糊筛选的楼盘名称
    getMatcheBuildList(val, callback) {
        let matcheBuild = [];
        this.state.saveBuildData.map(x => {
            if (x.name.indexOf(val) !== -1) {
                matcheBuild.push(x);
            }
        });
        this.setState({
            buildingData: matcheBuild
        }, () => {
            callback && callback.call(this, matcheBuild);
        })
    }

    //查询输入的楼盘名称是否存在
    searchBuildName(val, list) {
        if (list.length === 0) {
            $("#buildList").removeClass("active");
            G.currentScheme.isHasBuildName = false;
        } else {
            $("#buildList").addClass("active");
            for (let i = 0, n = list.length; i < n; i++) {
                let item = list[i];
                if (item.name === val) {
                    G.currentScheme.isHasBuildName = true;
                    return false;
                } else {
                    G.currentScheme.isHasBuildName = false;
                }
            }
        }
    }

    render() {
        // this.props.savaDataCallback(this.state); 
        return (
            <div className={this.props.cls ? `${this.props.cls} modal-box` : "modal-box"} id={this.props.id || "ModalBox"}>
                {this.props.readOnly ?
                    <div className="fb-form-list">
                        <div className="item">
                            <label className="title"><em>*</em>楼盘位置：</label>
                            <div className="content">
                                <label className="read-only">{this.state.province.name}</label>
                                <label className="read-only">{this.state.city.name}</label>
                            </div>
                        </div>
                        <div className="item">
                            <label className="title"><em>*</em>楼盘名称：</label>
                            <div className="content">
                                <label className="read-only">{this.state.premisesName}</label>
                            </div>
                        </div>
                        <div className="item">
                            <label className="title"><em>*</em>户型名称：</label>
                            <div className="content">
                                <label className="read-only">{`${this.state.houseTypeName} ${this.state.room}室 ${this.state.hall}厅`}</label>
                            </div>
                        </div>
                        <div className="item">
                            <label className="title">方案名称：</label>
                            <div className="content">
                                <label className="read-only">{this.state.premisesName + this.state.houseTypeName}</label>
                            </div>
                        </div>
                        <div className="item btn-box">
                            <label className="title"></label>
                            <div className="content">
                                <a className="cancel" id="jBoxCancel">取消</a>
                                <a className="ensure" id="jBoxSure" onClick={() => {
                                    this.getSaveSchemeData(this.props.type, (data) => {
                                        Method.jBoxModalHideFun(jBox, `#${this.props.id}`);
                                    });
                                }}>确定</a>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="fb-form-list">
                        <div className="item zIndex60">
                            <label className="title"><em>*</em>楼盘位置：</label>
                            <div className="content">
                                <label className="fb-select-bar">
                                    <label className={this.state.province.name ? "text" : "text def"}>{this.state.province.name ? this.state.province.name : "请选择省份"}</label>
                                    <b className="fb-arrow-dir down"></b>
                                    <div className="list" style={{ "width": "150px" }}>
                                        <ul className="">
                                            {this.props.cityListAry.map((x, index) => {
                                                if (x.parentCode === "0") {
                                                    return (
                                                        <li key={"Province" + index}><a onClick={(e) => {
                                                            this.getCityData(x.code);
                                                            this.setState({
                                                                premisesName: "",
                                                                province: {
                                                                    code: x.code,
                                                                    name: x.name
                                                                }
                                                            });
                                                        }}>{x.name}</a></li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </div>
                                </label>
                                <label className="fb-select-bar">
                                    <label className={this.state.city.name ? "text" : "text def"}>{this.state.city.name ? this.state.city.name : "请选择市区"}</label>
                                    <b className="fb-arrow-dir down"></b>
                                    <div className="list" style={{ "width": "150px" }}>
                                        <ul className="">
                                            {this.props.cityListAry.map((x, index) => {
                                                if (x.parentCode === this.state.province.code) {
                                                    return (
                                                        <li key={"City" + index}><a onClick={(e) => {
                                                            this.setState({
                                                                premisesName: "",
                                                                city: {
                                                                    code: x.code,
                                                                    name: x.name
                                                                }
                                                            });
                                                            this.getBuildingDataList(x.code);
                                                        }}>{x.name}</a></li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="item zIndex30">
                            <label className="title"><em>*</em>楼盘名称：</label>
                            <div className="content">
                                <div className="fb-select-bar">
                                    <label className="form-input clean" id="buildName">
                                        <input type="text" placeholder="请选择楼盘" value={this.state.premisesName} onChange={(e) => {
                                            let val = $(e.target).val();
                                            this.setState({
                                                premisesName: val
                                            });
                                            this.getMatcheBuildList(val, (list) => {
                                                this.searchBuildName(val, list);
                                            });
                                        }} onFocus={(e) => {
                                            let val = $(e.target).val();
                                            $(".list ul").removeClass("active");
                                            if (!$("#buildList li").length) return false;
                                            $(".list.house ul").addClass("active");
                                            this.getMatcheBuildList(val);
                                        }} />
                                        <a className="clean-btn" href="javascript:;" onClick={() => {
                                            this.setState({
                                                premisesName: ""
                                            });
                                            this.getMatcheBuildList("", (list) => {
                                                this.searchBuildName("", list);
                                            });
                                        }}>×</a>
                                    </label>

                                    <div className="list house" style={{ "width": "310px" }}>
                                        <ul className="" id="buildList">
                                            {this.state.buildingData.map((x, index) => {
                                                return (
                                                    <li key={"Bulid" + index}><a className={x.name === this.state.premisesName ? "active" : ""} onClick={(e) => {
                                                        e.stopPropagation();
                                                        $(".list.house ul").removeClass("active");
                                                        G.currentScheme.isHasBuildName = true;
                                                        this.setState({
                                                            premisesInfoGid: x.gid,
                                                            premisesName: x.name
                                                        });
                                                    }}>{x.name}</a></li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="item zIndex20">
                            <label className="title"><em>*</em>户型名称：</label>
                            <div className="content">
                                <label className="form-input radius border gray clean">
                                    <input type="text" placeholder="例如 '高层B1户型'" value={this.state.houseTypeName} onChange={(e) => {
                                        this.setState({
                                            houseTypeName: $(e.target).val()
                                        });
                                    }} />
                                    <a className="clean-btn" href="javascript:;" onClick={() => {
                                        this.setState({
                                            houseTypeName: ""
                                        });
                                    }}>×</a>
                                </label>
                                <div className="content mt-15">
                                    <label className="fb-select-bar">
                                        <label className={this.state.room ? "text" : "text def"}>{this.state.room ? this.state.room + "室" : "请选择室"}</label>
                                        <b className="fb-arrow-dir down"></b>
                                        <div className="list" style={{ "width": "150px" }}>
                                            <ul className="">
                                                {this.state.roomList.map((x, index) => {
                                                    return (
                                                        <li key={"Room" + index}><a onClick={() => {
                                                            this.setState({
                                                                room: x
                                                            });
                                                        }}>{`${x}室`}</a></li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    </label>
                                    <label className="fb-select-bar">
                                        <label className={this.state.hall ? "text" : "text def"}>{this.state.hall ? this.state.hall + "厅" : "请选择厅"}</label>
                                        <b className="fb-arrow-dir down"></b>
                                        <div className="list" style={{ "width": "150px" }}>
                                            <ul className="">
                                                {this.state.hallList.map((x, index) => {
                                                    return (
                                                        <li key={"Hall" + index}><a onClick={() => {
                                                            this.setState({
                                                                hall: x
                                                            });
                                                        }}>{`${x}厅`}</a></li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <label className="title">方案名称：</label>
                            <div className="content">
                                <label className="form-input radius border gray readonly">
                                    <input type="text" placeholder="方案名称" value={(this.state.premisesName + this.state.houseTypeName) ? this.state.premisesName + " " + this.state.houseTypeName : ""} readOnly />
                                </label>
                            </div>
                        </div>
                        <div className="item btn-box">
                            <label className="title"></label>
                            <div className="content">
                                <a className="cancel" id="jBoxCancel">取消</a>
                                <a className="ensure" id="jBoxSure" onClick={() => {
                                    this.getSaveSchemeData(this.props.type, (data) => {
                                        Method.jBoxModalHideFun(jBox, `#${this.props.id}`, () => {
                                            if (this.props.type === "create") {
                                                window.EM.emit("clear");
                                            }
                                            //方案信息弹窗
                                            if (this.props.id === "messageModal") {
                                                G.isUpdateMessage = true;
                                            }

                                            this.props.ensureCallback(data);
                                        });
                                    });
                                }}>确定</a>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}