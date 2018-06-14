import React, { Component } from "react";
import Utils from "../../Editor/Utils";
import Module from "../../Interface/Module";
import Method from "../../Interface/Method";
import G from "../../Interface/Global";
import $ from "jquery";

require("./Header.less");
var userDefault = require('../../../images/headSculpture.png');

export default class Header extends Component {
    constructor() {
        super();
        this.state = {
            memberInfo: {}
        };
        window.EM.on("loadMemberInfo", (obj) => {
            this.setState({ memberInfo: obj });
        })
    }
    componentDidMount() {
        let houseIsLoad = false, modelDataIsLoad = false;
        Method.hoverShowFun();
        Method.tabChangFun({
            changeCallback: function (id) {
                if (id === "#houseTypeBox") {
                    !houseIsLoad && window.EM.emit("loadJoinHouse");
                    houseIsLoad = true;
                    G.currentOperation = 2;
                    return false;
                }
                if (id === "#designBox") {
                    //判断是否可以另存为
                    window.EM.emit("getSaveType");
                    //加载临摹信息
                    window.EM.emit("getCopyDraft");
                    //创建临时ID
                    if(!G.currentScheme.schemeNo) {
                        G.currentScheme.schemeNo=Utils.generateKey();
                        G.isUseTempId = true;
                    }

                    //加载模型数据
                    window.EM.emit('getLeftMenuDate', G.saveModelTypeList, () => {
                        // 加载品牌库模型
                        !modelDataIsLoad && window.EM.emit('getModelDataList', "-1", "-1", 1);
                        modelDataIsLoad = true;
                    });
                    G.currentOperation = 3;
                    //默认第一个菜单选中
                    $(".parent-menu").eq(0).addClass("active");
                    return false;
                }
                if (id === "#schemeBox") {
                    G.currentOperation = 1;
                    if (!!G.schemeList.hasNewScheme) {
                        switch (G.schemeType) {
                            case 1:
                                window.EM.emit("getSolutions", 1, -1, -1);
                                break;
                            case 2:
                                window.EM.emit("getMineSolutions", 1, -1, -1);
                                break;
                            case 4:
                                window.EM.emit("getEnterpriseSolutions", 1, -1, -1);
                                break;
                        }
                        G.schemeList.hasNewScheme = false;
                    }
                }
            }
        });
    }

    render() {
        return (
            <div className="header-bar">
                <div className="header-tab fb-tab-box">
                    <ul className="clearfix tab-nav">
                        <li className="active"><a href="#schemeBox">方案库</a></li>
                        <li><a href="#houseTypeBox">户型库</a></li>
                        <li><a href="#designBox">开始设计</a></li>
                    </ul>
                </div>
                <div className="user-info fn-hover-bar">
                    <a className="user-name" href="javascript:;">
                        <img src={userDefault} />
                        <span>{this.state.memberInfo.loginName ? this.state.memberInfo.loginName.slice(0, 3) + "****" + this.state.memberInfo.loginName.slice(-4) : ""}</span>
                    </a>
                    <div className="user-menu fn-hover-menu">
                        <a href="javascript:;" onClick={() => {
                            window.shell.openExternal("https://member-center.19area.cn/auth/VRPerson.html");
                        }}>个人中心</a>
                        <a href="javascript:;">软件修复</a>
                        <a href="javascript:;" onClick={() => {
                            window.location.reload();
                        }}>注销</a>
                    </div>
                </div>
            </div>
        )
    }
}