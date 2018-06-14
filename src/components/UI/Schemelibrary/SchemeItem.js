import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";
import Request from "../../../config/Request";
import axios from 'axios';

import { Menu, Dropdown, Icon, Card, Avatar } from 'antd';
import Load from "../../Plugins/loading/LoadingData";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Module from "../../Interface/Module";
import Method from "../../Interface/Method";
import SchemeShare from "./SchemeShare";
import G from "../../Interface/Global";

export default class
    SchemeItem extends Component {
    constructor() {
        super();
    }
    /**
     * 弹出共享方案
     * @author xag
     * 2018.5.9
     * @param {number} gid: 方案GID，
     * @param {number} memberType: 会员类型 1.普通会员类型 2.企业会员类型,
     * @param {number} schemeType: 原始方案类型  1.我的方案  2.接收的方案 3.企业方案,
     * 
     */
    showShareContent(gid, memberType, schemeType) {
        Method.jBoxModalShowFun(jBox, "shareCreateModal", {
            title: "共享方案",
            closeType: 3,
            isCustomBtns: true,
            width: "600px",
            content: `<div id="share" className="shareJbox" ></div>`,
            initFun: (opt) => {
                ReactDOM.render(<SchemeShare gid={gid} memberType={memberType} schemeType={schemeType} propsBack={()=>{

                }} />, document.getElementById("share"));
            }
            // okFun: (opt) => {
            //     window.EM.emit("shareEnterpriseSolutions", gid, memberType, schemeType);
            // }
        });
    }
    /**
     * 删除数据 
     * @author xag
     * 2018.5.7
     * @param {number} gid: 方案id
     * @param {number} type: 操作方案库类型,3：企业方案 1：我的方案  
     * @param {number} schemeType: 操作方案类型 1.我创建的方案 3.我接收的方案
     * @param {number} curPage: 操作当前页码
     */
    deleteEnterPrise(gid, type, schemeType, curPage) {
        jBox.confirm("确定要删除吗？", {
            confirmType: 3,
            hasIcon: true,
            icon: {
                iconDir: "V",
                src: require("../Images/enterprise/notice.png"),
                id: "Notice"
            },
            btn: {
                array: [
                    {
                        text: "取消"
                    },
                    {
                        text: "确定",
                        callback: () => {
                            let url = "";
                            jBox.loading("正在删除中...", {
                                boxID: "shareLoad"
                            });
                            Module.recoverOrDeleteMerchantScheme({
                                gid: gid,
                                isDel: 1,
                                type: type,
                                schemeType: schemeType,
                                callback: (data) => {
                                    jBox.remove("#shareLoad", {}, function () {
                                        jBox.success("删除成功！", {
                                            closeFun: function () {
                                                if (gid == G.currentScheme.gid) {
                                                    G.clearCurrentScheme();
                                                    G.isMessage = false;
                                                    G.currentScheme.saveSchemeType = 1;
                                                    G.isSaveType = true;
                                                    G.saveSchemeType = "create";
                                                    //判断是否可以另存为
                                                    window.EM.emit("getSaveType");
                                                    //加载临摹信息
                                                    window.EM.emit("getCopyDraft");
                                                }
                                                //加载方案库
                                                if (type == 3) {
                                                    window.EM.emit("getEnterpriseSolutions", curPage);
                                                } else {
                                                    window.EM.emit("getMineSolutions", curPage);
                                                }
                                            }
                                        })
                                    });
                                }
                            });
                        }
                    }
                ]
            }
        });
    }
    //分享按钮切换
    overImgSrc(id, type) {
        if (type == 1) {
            $("." + id).attr("src", require("../Images/enterprise/shaer_2.png"));
        } else {
            $("#" + id + "2").attr("src", require("../Images/enterprise/delete_2.png"));
        }
    }
    //分享按钮切换
    outImgSrc(id, type) {
        if (type == 1) {
            $("." + id).attr("src", require("../Images/enterprise/shaer_1.png"));
        } else {
            $("#" + id + "2").attr("src", require("../Images/enterprise/delete_1.png"));
        }
    }
    /**
     * 分享到企业库
     *@author xag
     *2018.5.7
     *@param {number} gid 方案id 
     *@param {number} schemeType 方案类型  
     */
    shareEnterPrise(gid, schemeType) {
        jBox.loading("正在分享中...", {
            boxID: "shareLoad"
        });
        Module.shareScheme({
            gid: gid,
            shareMemberInfoLoginName: "",
            schemeType: schemeType,
            memberType: 2,
        });
    }
    //分享、删除按钮显示隐藏
    isShowB(type) {
        var node = $("#" + type);
        node.show();
    }
    isHideB(type) {
        var node = $("#" + type);
        node.hide();
    }
    /**
     * 进入2D改户型
     * @author xag
     * 2018.5.8
     */
    toEdiHoseType(type, gid) {
        window.Native.getBootParams();
        G.sourceType = type;
        Method.build2D(gid, type, (data) => {
            this.isSaveScheme(type, data.memberScheme.hasEditPermission);
            $("a[href='#designBox']").click();
        });
    }
    /**
     * VR搭方案
     * @author xag
     * @param {object} data 当前方案数据
     * 2018.5.29
     */
    buildVR(data, callback) {
        //户型文件名
        let houseFileName = `${G.currentScheme.schemeNo}_House`;
        //模型文件名
        let modelFileName = `${G.currentScheme.schemeNo}_Model`;
        let files = [{
            url: data.schemeHouseTypeDataFile + '?t=' + Date.now(),
            fileName: houseFileName
        }, {
            url: data.schemeModelDataFile + '?t=' + Date.now(),
            fileName: modelFileName
        }];
        Module.downloadFiles({
            files: files,
            callback: (repFiles) => {
                if (!repFiles) {
                    message.error("项目文件不存在");
                    return;
                }
                this.isSaveScheme(G.sourceType, data.hasEditPermission);
                Method.spellingFlower(data, () => {
                    //保存户型文件和临时(用真实的schemeNo)
                    window.Native.saveProject(repFiles[modelFileName].data, modelFileName, () => {
                        window.Native.saveProject(repFiles[houseFileName].data, houseFileName, () => {
                            let { gid, loginToken, memberType } = G.saveMemberInfor;
                            let { schemeNo } = G.currentScheme;
                            G.saveHouseTypeFile = repFiles[houseFileName].data;
                            G.saveModelFile = repFiles[modelFileName].data;
                            window.Native.build3D(gid, loginToken, memberType, schemeNo, G.sourceType, G.currentScheme.gid, window.BootParams['--takePicture']);
                            callback && callback();
                        });
                    });
                });
            }
        });
    }
    /**
     * 初始化进2D参数
     * @param {number} type 方案类型
     * @param {boolean} hasEditPermission 是否有企业方案保存权限 true:有 false：没
     */
    isSaveScheme(type, hasEditPermission) {
        G.currentScheme.saveSchemeType = 2;
        G.isUseTempId = false;
        G.currentScheme.isHasBuildName = true;
        //判断当前方案是否可以保存
        switch (parseInt(type)) {
            case 1:
                G.isSaveType = true;
                G.isMessage = true;
                break;
            case 2:
                G.isSaveType = false;
                G.isMessage = true;
                break;
            case 3:
                G.isSaveType = false;
                G.isMessage = true;
                break;
            case 4:
                G.isSaveType = hasEditPermission;
                G.isMessage = true;
                break;
        }
    }

    render() {
        const familyMenu = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" className="menu-share" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        var schemeType = this.props.projectType == 3 ? 2 : 1;//判断是否是接收的方案
                        this.showShareContent(this.props.projectid, 1, schemeType);
                    }} onMouseOver={() => {
                        this.isShowB(this.props.projectid + "wrap");
                    }}>分享到账户</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="menu-share" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        this.shareEnterPrise(this.props.projectid, this.props.projectType == 1 ? 1 : 2);
                    }} onMouseOver={() => {
                        this.isShowB(this.props.projectid + "wrap");
                    }}>分享到企业库</a>
                </Menu.Item>
            </Menu>
        );
        return (
            <Card bodyStyle={{ padding: 0 }}  >
                <div className="custom-image" style={{
                    marginTop: 0
                }}>
                    <div className="hanzwii-img-wrap" onMouseOut={() => {
                        this.isHideB(this.props.projectid + "wrap");
                    }} onMouseOver={() => {
                        this.isShowB(this.props.projectid + "wrap");
                    }}>
                        <div className="share-author" style={{ display: this.props.isShareFrom }}>
                            来自<span style={{ color: "#00CCCB" }}>{this.props.shareFrom}</span>的分享
                        </div>
                        <div className="enterprise-share" style={{ display: this.props.isShowBnt }} id="shareAndDelete" >
                            <div className="hanzwii-botton-wrap" id={this.props.projectid + "wrap"} >
                                <div style={{ display: G.schemeType == 2 ? "block" : "none" }} className="menu-share">
                                    <Dropdown overlay={familyMenu}>
                                        <div className="img-left">
                                            <img className={this.props.projectid} src={require("../Images/enterprise/shaer_1.png")} onMouseOver={() => {
                                                this.overImgSrc(this.props.projectid, 1);
                                            }} onMouseOut={() => {
                                                this.outImgSrc(this.props.projectid, 1);
                                            }} />
                                        </div>
                                    </Dropdown>
                                </div>
                                <div className="img-left" style={{ display: this.props.isShare }}>
                                    <img className={this.props.projectid} src={require("../Images/enterprise/shaer_1.png")} onClick={() => {
                                        this.showShareContent(this.props.projectid, 1, 3);
                                    }} onMouseOver={() => {
                                        this.overImgSrc(this.props.projectid, 1);
                                    }} onMouseOut={() => {
                                        this.outImgSrc(this.props.projectid, 1);
                                    }} />
                                </div>
                                <div className="img-right" style={{ display: this.props.isDelete }}>
                                    <img id={this.props.projectid + "2"} src={require("../Images/enterprise/delete_1.png")} onClick={() => {
                                        //判断是企业方案还是我的方案
                                        if (G.schemeType == 2) {
                                            this.deleteEnterPrise(this.props.projectid, 1, this.props.projectType == 1 ? 1 : 3, this.props.curPage);
                                        } else {
                                            this.deleteEnterPrise(this.props.projectid, 3, this.props.projectType, this.props.curPage);
                                        }
                                    }} onMouseOver={() => {
                                        this.overImgSrc(this.props.projectid, 2);
                                    }} onMouseOut={() => {
                                        this.outImgSrc(this.props.projectid, 2);
                                    }} />
                                </div>
                            </div>
                        </div>
                        <img alt="example" src={this.props.schemeImageFilePath} />
                        <div className="hanzwii-shade" >
                            <span className="hanzwii-cutleft" onClick={() => {
                                if ((this.props.projectType - 0) === 2) {
                                    window.downLoadHouse = true;
                                }
                                Module.saveDataTransfer({
                                    memberGid: window.BootParams['--memberGid'],
                                    token: window.BootParams['--token'],
                                    type: window.BootParams['--type'],
                                    projectType: this.props.projectType - 0,
                                    projectid: this.props.projectid,
                                    schemeNo: this.props.schemeNo,
                                    callback: () => {
                                        this.toEdiHoseType(parseInt(this.props.projectType), this.props.projectid);
                                    }
                                })
                            }} >2D改户型</span>
                            <span className="hanzwii-cutline" ></span>
                            <span className="hanzwii-cutright" onClick={() => {
                                Load.show("正在加载中,请稍等...");
                                Module.saveDataTransfer({
                                    memberGid: window.BootParams['--memberGid'],
                                    token: window.BootParams['--token'],
                                    type: window.BootParams['--type'],
                                    projectType: this.props.projectType - 0,
                                    projectid: this.props.projectid,
                                    schemeNo: this.props.schemeNo,
                                    callback: () => {
                                        window.Native.getBootParams();
                                        Module.getSchemeDetail({
                                            gid: window.BootParams['--projectid'],
                                            memberGid: window.BootParams['--memberGid'],
                                            token: window.BootParams['--token'],
                                            type: window.BootParams['--projectType'],
                                            callback: (data) => {
                                                G.sourceType = window.BootParams['--projectType'];
                                                Object.assign(G.currentScheme, data.memberScheme);
                                                this.buildVR(data.memberScheme, () => {
                                                    Load.hide();
                                                });
                                            }
                                        });
                                    }
                                });
                            }} >VR搭方案</span>
                        </div>
                    </div>

                </div>
                <div className="hanzwii-card-foot" style={{
                    display: "block",
                    height: 100
                }}>
                    <h3>{this.props.configPremisesName}</h3>
                    <p style={{ height: 21 }}>{this.props.houseTypeName}</p>
                    <p style={{ width: "100%", borderTop: "1px solid #efefef", marginTop: 16, marginLeft: 0 }}></p>
                    <p className="hanzwii-autor" >
                        <Avatar style={{
                            top: 5
                        }} size="small" src={this.props.headImg} />
                        <span className="hanzwii-name" >{this.props.designerName}</span>
                        <span className="hanzwii-time">{this.props.time}</span>
                    </p>
                </div>
            </Card>

        )
    }
}