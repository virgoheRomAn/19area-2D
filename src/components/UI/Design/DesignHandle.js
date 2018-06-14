import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";

import SaveModal from "./SaveModal";

import Method from "../../Interface/Method";
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

export default class EditorRight extends Component {
    constructor() {
        super();
        this.state = {
            enterList: [0, 0, 0],
            mouseType: "scale",
        }

        //切换成画布
        window.EM.on('brush', () => {
            this.setState({ mouseType: 'brush' });
        });

        //切换成缩放
        window.EM.on('scale', (callback) => {
            this.setState({ mouseType: 'scale', enterList: [0, 1, this] });
        });
    }

    componentDidMount() {
        $("#handle").find("a").click(function () {
            $(this).addClass("active").siblings().removeClass("active");
        });
    }

    build3DEnsure(data) {
        window.EM.emit("saveProject", {
            currentScheme: data,
            callback: (project) => {
                if (G.saveSchemeType === "saveAs") return false;
                //保存之后，可以保存也可以另存为
                G.currentScheme.saveSchemeType = 2;
                //展示方案信息
                G.isMessage = true;
                window.EM.emit("getSaveType");
                //进入3D
                window.EM.emit("build3D", {
                    "id": project.id,
                    "areaName": project.currentScheme.houseTypeName,
                    "copyDraft": project.copyDraft,
                    "name": project.currentScheme.schemeName,
                    "data": project.data,
                    "schemeNo": project.schemeNo,
                    "ceils": project.ceils
                });
            },
            eCallback: () => {
                if (G.saveSchemeType === "saveAs") return false;
                //保存失败
                G.currentScheme.saveSchemeType = 1;
                window.EM.emit("getSaveType");
            }
        });
    }
    render() {
        return (
            <div className="editor-right">
                <div className="container">
                    <span className="title">切换模式</span>
                    <label className="handle clearfix" id="handle">
                        <a className={this.state.mouseType == "scale" ? "active" : ""} href="javascript:;" onClick={() => {
                            if (window.BootParams['--takePicture'] == 1) {
                                return;
                            }
                            window.EM.emit("scale");

                            this.setState({ enterList: [0, 2, this.state.enterList[2]] })
                        }}>
                            <i className="e-icon icon-handle"></i>
                            <em>选择</em>
                        </a>
                        <a className={this.state.mouseType == "brush" ? "active" : ""} href="javascript:;" onClick={() => {
                            if (window.BootParams['--takePicture'] == 1) {
                                return;
                            }
                            this.setState({
                                enterList: [2, 0, this.state.enterList[2]]
                            })
                            window.EM.emit("brush");
                            window.EM.emit("brushHead");
                        }}>
                            <i className="e-icon icon-paint"></i>
                            <em>画墙</em>
                        </a>
                    </label>
                    <label className="btn-3d">
                        <a className="e-btn background green small" href="javascript:;" onClick={() => {
                            //有方案名称直接进入3D
                            if (!!G.currentScheme.schemeName) {
                                Load.show("正在进入3D,请稍等...");
                                window.EM.emit("build3D", {
                                    name: G.currentScheme.schemeName,
                                    id: G.currentScheme.gid,
                                    schemeNo: G.currentScheme.schemeNo,
                                    wallHeight: G.currentScheme.wallHeight,
                                    areaName: G.currentScheme.houseTypeName,
                                    callback: () => {
                                        setTimeout(() => {
                                            Load.hide();
                                        }, 1000);
                                    }
                                });
                                return false;
                            }

                            //没有方案名称 需要先创建新的方案
                            Method.jBoxModalShowFun(jBox, "build3DModal", {
                                isCustomBtns: true,
                                ID: "createContentModal",
                                title: "保存方案",
                                closeType: 3,
                                content: "<div class='modal-container' id='modalContainer'></div>",
                                initFun: (opt) => {
                                    ReactDOM.render(<SaveModal id={"build3DModal"} cityListAry={G.saveCityList} type={"save"} ensureCallback={this.build3DEnsure} />, document.getElementById("modalContainer"));
                                }
                            });

                        }}>去3D设计</a>
                    </label>
                </div>
            </div>
        )
    }
}
