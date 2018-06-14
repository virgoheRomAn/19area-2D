import React, { Component } from 'react';
import $ from "jquery";


import jBox from "../../Plugins/jBox/jQuery.jBox";
import Module from "../../Interface/Module";
import Method from "../../Interface/Method";

export default class SchemeShare extends React.Component {
    constructor() {
        super();
        this.state = {
            shareGid: 0,
            type: 0,
            schemeType: 0
        }
        // window.EM.once("shareEnterpriseSolutions", (gid, memberType, schemeType) => {
        //     this.shareEnterpriseSolutions(gid, memberType, schemeType);
        // });
    }
    /**
     * 方案库分享给个人
     * @author xag
     * 2018.5.5
     * @param {number} gid: 方案GID，
     * @param {number} schemeType: 原始方案类型  1.我的方案  2.接收的方案 3.企业方案,
     * @param {number} memberType: 会员类型 1.普通会员类型 2.企业会员类型,
     */
    shareEnterpriseSolutions(gid, memberType, schemeType) {
        let code = $("#shareCode").val();
        if (code == "" || code == null || code.length == 0) {
            jBox.error("分享账号不能为空！");
            return;
        }
        if (!(/^1[3|4|5|8|9|7]\d{9}$/.test(code))) {
            jBox.error("账号格式不正确！");
            return;
        }
        jBox.loading("正在分享中...", {
            boxID: "shareLoad"
        });
        Module.shareScheme({
            gid: gid,
            shareMemberInfoLoginName: code,
            schemeType: schemeType,
            memberType: memberType,
            callback: () => {
                //分享成功，关闭弹出框
                Method.jBoxModalHideFun(jBox, "#shareCreateModal", (id) => {
                    $("#shareCode").val("");
                });
            }
        });
    }
    /**
     *分享框隐藏
     */
    hideShareContent() {
        $("#share").hide();
        $(".window-zh").hide();
    }
    render() {
        return (
            <div className="share">
                {/* <p className="main-title">共享方案</p> */}
                <p className="message">将方案共享给：</p>
                <input placeholder="请输入对方账户名" id="shareCode" onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                        this.shareEnterpriseSolutions(this.props.gid, this.props.memberType, this.props.schemeType);
                    }
                }} />
                <div className="btn">
                    <ul>
                        <li><a className="cancel" onClick={() => {
                            Method.jBoxModalHideFun(jBox, "#shareCreateModal", () => {
                                $("#shareCode").val("");
                            });
                        }}>取消</a></li>
                        <li><a className="ensure" onClick={() => {
                            this.shareEnterpriseSolutions(this.props.gid, this.props.memberType, this.props.schemeType);
                        }}>确定</a></li>
                    </ul>
                </div>
            </div>
        )
    }
}