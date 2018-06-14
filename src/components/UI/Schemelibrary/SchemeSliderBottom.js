import React, { Component } from 'react';
import $ from "jquery";

import Load from "../../Plugins/loading/LoadingData";

import Menus from '../../Public/Menus';
import Module from '../../Interface/Module'
import G from '../../Interface/Global';

export default class SchemeSliderBottom extends Component {
    render() {
        return (
            <div id="hanzwii-silider-botton">
                <Menus />
                <div style={{
                    display: G.schemeType == 4 ? "block" : "none"
                }}>
                    <div className="hanzwii-share" >
                        <label className="fb-check-box" >
                            <em>
                                <i className="fb-sprite icon-checked"></i>
                                <input type="checkbox" id="sharCheckBox" onClick={() => {
                                    G.schemeType = 4;
                                    window.EM.emit("getEnterpriseSolutions", 1);
                                }} />
                            </em>
                            <span>我管理的</span>
                        </label>
                    </div>
                    <div className="hanzwii-right">
                        <div className="hanzwii-add" >
                            <a href="#"> <label className="fb-check-box fl" onClick={() => {
                                window.projectGid = -1;
                                Load.show("加载中...");
                                Module.saveDataTransfer({
                                    memberGid: window.BootParams['--memberGid'],
                                    token: window.BootParams['--token'],
                                    type: window.BootParams['--type'],
                                    projectType: 4,
                                    callback: () => {
                                        Load.hide();
                                        window.Native.getBootParams();
                                        window.EM.emit("clear");

                                        G.currentScheme.schemeName = "";
                                        G.currentScheme.saveSchemeType = 1;
                                        G.isSaveType = true;
                                        G.isMessage = false;
                                        G.sourceType = window.BootParams['--projectType'];

                                        $("a[href='#designBox']").click();
                                    }
                                });
                            }}>
                                <em>
                                    <img src={require("../Images/enterprise_add.png")} />
                                </em>
                                <span>新建企业方案</span>
                            </label></a>
                        </div>
                        <div className="hanzwii-delete" onClick={() => {
                            G.schemeType = 5;
                            window.EM.emit("getEnterpriseRecycleSolutions", 1, this.props.gid);
                        }}>
                            <a href="#"><label className="fb-check-box fl">
                                <em>
                                    <img src={require("../Images/enterprise_del.png")} />
                                </em>
                                <span>回收站</span>
                            </label></a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}