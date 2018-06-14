import React from 'react';
import ReactDOM from 'react-dom';
import Utils from "../../Editor/Utils";
import $ from 'jquery';

import SaveModal from "./SaveModal";
import CopyImage from "./myCopyImageModal";
import SchemeModal from "./mySchemeModal";

import Method from "../../Interface/Method";
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

require('./Design.less');

export default class EditorHeader extends React.Component {
    constructor() {
        super();
        this.state = {
            //保存modal里面的数据
            saveSchemeData: {},
            //modal的ID
            modalID: "",
            //保存类型
            isSaveType: true,
            //另存为类型
            isSaveAsType: true,
            //方案信息
            isMessage: false,
            //城市信息
            cityListAry: [],
            //我的方案列表
            mySchemeListData: {
                list: [],
                total: 0,
                curPage: 1,
            },
            //临摹
            hasCopyDraft: false,
            copyDraft: {},
            //当前方案的类型名称
            schemeTypeText: ""
        };

        //获取保存和另存为的状态
        window.EM.on("getSaveType", () => {
            this.setState({
                isMessage: G.isMessage,
                isSaveType: G.isSaveType,
                isSaveAsType: G.currentScheme.saveSchemeType === 2,
                schemeTypeText: G.sourceType === 2 ? "公共方案" : (G.sourceType === 3 ? "分享给我的方案" : "没有权限的方案")
            });
        });

        //获取临摹信息
        window.EM.on("getCopyDraft", () => {
            this.setState({
                copyDraft: G.currentScheme.copyDraft,
                hasCopyDraft: !!G.currentScheme.copyDraft.imageDataUrl
            });
        });
    }

    //modal子组件返回的数据信息
    savaDataCallback(data) {
        this.state.saveSchemeData = data;
    }

    //调用保存方法
    saveSchemeFun(data) {
        window.EM.emit("saveProject", {
            currentScheme: data,
            callback: (project) => {
                if (G.saveSchemeType === "saveAs") return false;
                //保存之后，可以保存也可以另存为
                G.currentScheme.saveSchemeType = 2;
                //展示方案信息
                G.isMessage = true;
                window.EM.emit("getSaveType");
            },
            eCallback: () => {
                if (G.saveSchemeType === "saveAs") return false;
                //保存失败
                G.currentScheme.saveSchemeType = 1;
                window.EM.emit("getSaveType");
            }
        });
    }

    /**
     * 上传图片，显示缩略图
     * @param {Object} file         file对象，可选参数
     * @param {String} image        图片路径/上传的时候不需要设置/读取的时候需要设置
     * @param {Function} callback 
     */
    showUploadImageThumb(file, image, callback) {
        //上传处理
        if (!!file) {
            Method.showImageThumb(jBox, file, (src) => {
                this.showCopyDraftModal(src, "上传户型图", "write", callback);
            })
        } else {
            //校准
            Load.show("加载图片中...");
            this.showCopyDraftModal(image, "校准尺寸", "read", callback);
        }
    }

    /**
     * 显示校准户型图
     * @param {String} src      图片路径
     * @param {String} title    弹出框标题
     * @param {String} showType 显示模式 "write"/"read"
     * @param {Function} callback 
     */
    showCopyDraftModal(src, title, showType, callback) {
        Method.showLoadImages(src, (image, w, h) => {
            Load.hide();
            //330为 title+footer 的高度
            let top = (h + 330) < (document.documentElement.clientHeight - 100) ? "auto" : "10%";
            let width = 0;
            if (w > 900) {
                width = 900;
            } else if (w < 500) {
                width = 500;
            } else {
                width = w + 100;
            }

            Method.jBoxModalShowFun(jBox, "copyImageModal", {
                isMove: false,
                top: top,
                isCustomBtns: true,
                closeType: 3,
                ID: "copyImageModalContent",
                title: title,
                width: `${width}px`,
                content: "<div class='modal-container' id='modalContainer'></div>",
                initFun: (opt) => {
                    ReactDOM.render(<CopyImage ID={"copyImageModal"} imageContainerWidth={width} Image={image} type={showType} project={G.currentScheme.copyDraft} ensureCallback={(jsonData) => {
                        this.setState({
                            hasCopyDraft: true
                        });

                        callback && callback.call();
                    }} />, document.getElementById("modalContainer"));
                },
                initAfterFun: (opt) => {
                    $("#" + opt.element.id).css("margin-bottom", "45px");
                },
                cancelFun: () => {
                    $("#uploadImage").val("");
                }
            });
        }, (image) => {
            jBox.error("图片上传失败，请重新上传！", {
                closeFun: () => {
                    Load.hide();
                }
            });
        })
    }

    render() {
        return (
            <div className="editor-header">
                <div className="container">
                    <div className="menu">
                        <ul>
                            <li>
                                <a onClick={() => {
                                    jBox.confirm("新建方案会清空画布，是否新建方案？", {
                                        confirmType: 3,
                                        hasIcon: true,
                                        icon: {
                                            iconDir: "V",
                                            src: require("../Images/enterprise/notice.png"),
                                            id: "Notice"
                                        },
                                        btn: {
                                            array: [
                                                { text: "取消" },
                                                {
                                                    text: "确定",
                                                    callback: () => {
                                                        G.clearCurrentScheme();
                                                        G.saveSchemeType = "create";
                                                        //状态改成新建
                                                        G.currentScheme.saveSchemeType = 1;
                                                        //新建之后，可以保存，不可以另存
                                                        G.isSaveType = true;
                                                        //方案信息
                                                        G.isMessage = false;
                                                        //新建方案，状态更换为我的方案
                                                        G.sourceType = 1;
                                                        //新建方案之后，清空当前方案信息
                                                        G.currentScheme.schemeNo = Utils.generateKey();
                                                        G.isUseTempId = true;
                                                        this.setState({
                                                            isMessage: false,
                                                            isSaveType: true,
                                                            isSaveAsType: false,
                                                            hasCopyDraft: false
                                                        });
                                                        window.EM.emit('brush');
                                                        window.EM.emit("clear");
                                                    }
                                                }
                                            ]
                                        }
                                    });
                                }}>新建</a>
                            </li>
                            <li>
                                <a onClick={() => {
                                    Method.jBoxModalShowFun(jBox, "openModal", {
                                        ID: "createContentModal",
                                        isCustomBtns: true,
                                        title: "我的方案",
                                        closeType: 3,
                                        content: "",
                                        height: "500px",
                                        initFun: (opt) => {
                                            let ele = opt.popElement.$introCont;
                                            ReactDOM.render(<SchemeModal id={"openModal"} />, ele[0]);
                                        }
                                    });
                                }}>打开</a>
                            </li>
                            <li>
                                <div className="fn-hover-bar setting">
                                    <span>保存</span>
                                    <div className="fn-hover-menu setting-nav save-nav">

                                        <a className={this.state.isSaveType ? "" : "none"} onClick={(e) => {
                                            e.stopPropagation();
                                            if ($(e.target).hasClass("none")) return false;

                                            //通过方案名称判断是否弹出窗口
                                            if (!!G.currentScheme.schemeName) {
                                                //有方案名称
                                                if (G.currentScheme.saveSchemeType === 1) {
                                                    //新建 创建的方案
                                                    G.saveSchemeType = "create";
                                                } else {
                                                    //更新 从已经有的方案进入
                                                    G.saveSchemeType = "update";
                                                }
                                                this.saveSchemeFun(G.currentScheme);
                                                return false;
                                            }

                                            //弹出保存窗口
                                            Method.jBoxModalShowFun(jBox, "saveModal", {
                                                isCustomBtns: true,
                                                ID: "createContentModal",
                                                title: "保存方案",
                                                closeType: 3,
                                                content: "<div class='modal-container' id='modalContainer'></div>",
                                                initFun: (opt) => {
                                                    ReactDOM.render(<SaveModal id={"saveModal"} cityListAry={G.saveCityList} type={"save"} ensureCallback={(data) => {
                                                        this.saveSchemeFun(data);
                                                    }} />, document.getElementById("modalContainer"));
                                                }
                                            });
                                        }}>
                                            保存
                                            {this.state.isSaveType ? "" : <span className={G.sourceType === 2 ? "fb-tips" : "fb-tips big"} onClick={(e) => { e.stopPropagation(); }}>{`${this.state.schemeTypeText}，不能保存`}</span>}
                                        </a>

                                        <a id="saveAsBtn" className={this.state.isSaveAsType ? "" : "none"} onClick={(e) => {
                                            if ($(e.target).hasClass("none")) return false;
                                            //改变保存状态
                                            G.saveSchemeType = "saveAs";
                                            //弹出保存窗口                                            
                                            G.currentScheme.saveSchemeType = 2;
                                            Method.jBoxModalShowFun(jBox, "saveAsModal", {
                                                isCustomBtns: true,
                                                ID: "createContentModal",
                                                title: "另存方案",
                                                closeType: 3,
                                                content: "<div class='modal-container' id='modalContainer'></div>",
                                                initFun: (opt) => {
                                                    ReactDOM.render(<SaveModal id={"saveAsModal"} cityListAry={G.saveCityList} type={"saveAs"} ensureCallback={(data) => {
                                                        this.saveSchemeFun(data);
                                                    }} />, document.getElementById("modalContainer"));
                                                }
                                            });
                                        }}>
                                            另存为
                                            {this.state.isSaveAsType ? "" : <span className="fb-tips" onClick={(e) => { e.stopPropagation(); }}>新建的方案不能另存</span>}
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="fn-hover-bar setting">
                                    <span>设置</span>
                                    <div className="fn-hover-menu setting-nav">
                                        <a href="javascript:;" onClick={() => {
                                            let content = `<div class="modal-box">
                                                <div class="fb-form-list">
                                                    <div class="item">
                                                        <label class="title"><em>*</em>墙体高度：</label>
                                                        <div class="content">
                                                            <label class="form-input radius border gray clean after-text">
                                                                <input type="number" id="wallHeight" placeholder="请输入墙高，默认3000" value=${G.currentScheme.wallHeight || 3000} />
                                                                <a class="clean-btn" href="javascript:;">×</a>
                                                                <em>mm</em>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`;
                                            jBox.confirm(content, {
                                                confirmType: 3,
                                                title: "设置墙高",
                                                boxID: "wallHeightModal",
                                                cls: {
                                                    titleCls: "specail cursor-default"
                                                },
                                                btn: {
                                                    array: [
                                                        { text: "取消" },
                                                        {
                                                            text: "确定",
                                                            callback: () => {
                                                                G.currentScheme.wallHeight = Number($("#wallHeight").val());
                                                            }
                                                        }
                                                    ]
                                                },
                                                initAfterFun: (opt) => {
                                                    Method.commonFuns({
                                                        cleanTextCallback: () => {
                                                            $("#wallHeight").val(0);
                                                        }
                                                    });
                                                    $("#wallHeight").keydown((e) => {
                                                        if (e.keyCode === 13) {
                                                            G.currentScheme.wallHeight = Number($("#wallHeight").val());
                                                            jBox.remove("#wallHeightModal");
                                                        }
                                                    });
                                                }
                                            });
                                        }}>墙体高度</a>
                                        <a className={this.state.isMessage ? "" : "hide"} href="javascript:;" onClick={() => {
                                            //改变保存状态
                                            G.saveSchemeType = "update";
                                            //弹出保存窗口                                            
                                            G.currentScheme.saveSchemeType = 2;
                                            Method.jBoxModalShowFun(jBox, "messageModal", {
                                                isCustomBtns: true,
                                                ID: "createContentModal",
                                                title: "方案信息",
                                                closeType: 3,
                                                content: "<div class='modal-container' id='modalContainer'></div>",
                                                initFun: (opt) => {
                                                    ReactDOM.render(<SaveModal id={"messageModal"} readOnly={!this.state.isSaveType} cityListAry={G.saveCityList} type={"save"} ensureCallback={(data) => {
                                                        this.saveSchemeFun(data);
                                                    }} />, document.getElementById("modalContainer"));
                                                }
                                            });
                                        }}>方案信息</a>
                                        <div className="fn-hover-bar setting-nav-item">
                                            <span>显示/隐藏</span>
                                            <div className="fn-hover-menu setting-nav-item-nav">
                                                <label className="fb-check-box active">
                                                    <em>
                                                        <i className="fb-sprite icon-checked"></i>
                                                        <input id="input_checkbox1" type="checkbox" defaultChecked onClick={(e) => {
                                                            e.stopPropagation();
                                                            if ($("#input_checkbox1").prop("checked")) {
                                                                //todo:选择显示吊顶
                                                                $("#ceil_group").css("display", "inline");
                                                            } else {
                                                                //todo:选择不显示吊顶
                                                                $("#ceil_group").css("display", "none");
                                                            }
                                                        }} />
                                                    </em>
                                                    <span>吊顶</span>
                                                </label>
                                                <label className="fb-check-box active">
                                                    <em>
                                                        <i className="fb-sprite icon-checked"></i>
                                                        <input id="input_checkbox2" type="checkbox" defaultChecked onClick={(e) => {
                                                            e.stopPropagation();
                                                            if ($("#input_checkbox2").prop("checked")) {
                                                                //todo:选择显示家具
                                                                $("#furniture_group").css("display", "inline");
                                                            } else {
                                                                //todo:选择不显示家具
                                                                $("#furniture_group").css("display", "none");
                                                            }
                                                        }} />
                                                    </em>
                                                    <span>家居</span>
                                                </label>
                                                <label className="fb-check-box active">
                                                    <em>
                                                        <i className="fb-sprite icon-checked"></i>
                                                        <input id="input_checkbox3" type="checkbox" defaultChecked onClick={(e) => {
                                                            e.stopPropagation();
                                                            if ($("#input_checkbox3").prop("checked")) {
                                                                //todo:选择显示门窗
                                                                $(".door").css("display", "inline");
                                                            } else {
                                                                //todo:选择不显示门窗
                                                                $(".door").css("display", "none");
                                                            }
                                                        }} />
                                                    </em>
                                                    <span>门窗</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="float-menu">
                        <a className="active">
                            <span>上传户型图</span>
                            <input type="file" id="uploadImage" accept="image/*" onChange={(e) => {
                                let file = e.target.files[0];
                                if (!file) return false;
                                this.showUploadImageThumb(file, null, () => {
                                    $("#uploadImage").val("");
                                })
                            }} /></a>
                        <a className={!!this.state.hasCopyDraft ? "active delete" : "reset none"} href="javascript:;" onClick={(e) => {
                            let $ele = $(e.target);
                            if ($ele.hasClass("none")) return false;
                            if ($ele.hasClass("delete")) {
                                window.EM.emit("copyDraft", {});
                                this.setState({ hasCopyDraft: false }, () => {
                                    $ele.removeClass("none").addClass("active");
                                });
                            } else if ($ele.hasClass("reset")) {
                                window.EM.emit("copyDraft", G.currentScheme.copyDraft);
                                this.setState({ hasCopyDraft: true });
                            }
                        }}>{!!this.state.hasCopyDraft ? "删除背景" : "恢复背景"}</a>
                        <a className={!!this.state.hasCopyDraft ? "active" : "none"} href="javascript:;" id="calibration" onClick={(e) => {
                            if ($(e.target).hasClass("none")) return false;
                            this.showUploadImageThumb(null, G.currentScheme.copyDraft.imageDataUrl, () => {
                                $("#uploadImage").val("");
                            })
                        }}>校准尺寸</a>
                    </div>
                </div>
            </div >
        )
    }
}