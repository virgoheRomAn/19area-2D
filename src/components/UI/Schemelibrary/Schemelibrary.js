import React, { Component } from 'react';
import $ from "jquery";

import { Card, Avatar } from 'antd';
import scrollBar from "../../Plugins/scrollBar/ScrollBar";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

import SchemeItem from './SchemeItem';
import SchemeRecycle from './SchemeRecycle';
import SchemeHeader from './SchemeHeader';
import SchemeSliderBottom from './SchemeSliderBottom';
import SchemeShare from './SchemeShare';
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
import Pagination from "../../Public/Paging";

export default class Schemelibrary extends Component {
    constructor() {
        super();
        this.state = {
            memberSchemeList: [],
            schemeNum: 0,
            shareGid: 0,
            curPage: 1,
            type: 1,
            hasMerchant: ""
        }
        // //1:全部，2：我的方案；3：公共方案 4:企业方案 5:回收站的方案
        // G.schemeType = 1;
        // //默认-1；1\2\3\4 对应 一室\二室\三室\四室 ,其他对应0
        // G.schemeList.schemeHouseType = -1;
        // //默认-1,50m2以下 传值1;50-80m2传值2;80-100m2传值3;100-130m2传值4;130m2以上传值5
        // G.schemeList.schemeAreaType = -1;
        // //搜索关键字
        // G.schemeList.schemeKeyWords = "";

        /**
         *获取全部方案 
         *@author xag
         * 2018.5.5
         * @param {number} curPage:当前页码
         * @param {number} houseRoom:户型
         * @param {number} floorAreaStr:面积
         * @param {String} keyWords:搜索关键字
         * @param {boolean} hasMerchant:是否显示企业方案
         */
        window.EM.on("getSolutions", (curPage, houseRoom = -1, floorAreaStr = -1, keyWords = "", hasMerchant = false) => {
            Load.show("请稍候...");
            Module.getSchemeList({
                curPage: curPage,
                schemeType: 1,
                pageSize: 8,
                floorAreaStr: floorAreaStr,
                houseRoom: houseRoom,
                keyWords: keyWords,
                callback: (data) => {
                    Load.hide();
                    $("#headerHtml").show();
                    $("#back").hide();
                    if (hasMerchant) {
                        this.state.hasMerchant = hasMerchant;
                    }
                    !!data && this.setState({
                        memberSchemeList: data.memberSchemeList,
                        schemeNum: data.total,
                        type: 1,
                        curPage: curPage
                    });
                }
            });
        });

        /**
         * 获取我的方案
         * @author xag
         * 2018.5.5
         * @param {number} curPage:当前页码
         * @param {number} houseRoom:户型
         * @param {number} floorAreaStr:面积
         */
        window.EM.on("getMineSolutions", (curPage, houseRoom = -1, floorAreaStr = -1) => {
            Load.show("请稍候...");
            Module.getSchemeList({
                curPage: curPage,
                schemeType: 2,
                pageSize: 8,
                floorAreaStr: floorAreaStr,
                houseRoom: houseRoom,
                callback: (data) => {
                    Load.hide();
                    $("#headerHtml").show();
                    $("#back").hide();
                    !!data && this.setState({
                        memberSchemeList: data.memberSchemeList,
                        schemeNum: data.total,
                        type: 2,
                        curPage: curPage
                    });
                }
            });
        });

        /**
         * 获取公共方案
         * @author xag
         * 2018.5.5
         * @param {number} curPage:当前页码
         * @param {number} houseRoom:户型
         * @param {number} floorAreaStr:面积
         */
        window.EM.on("getPublicSolutions", (curPage, houseRoom = -1, floorAreaStr = -1) => {
            Load.show("请稍候...");
            Module.getSchemeList({
                curPage: curPage,
                schemeType: 3,
                pageSize: 8,
                floorAreaStr: floorAreaStr,
                houseRoom: houseRoom,
                callback: (data) => {
                    Load.hide();
                    $("#headerHtml").show();
                    $("#back").hide();
                    !!data && this.setState({
                        memberSchemeList: data.memberSchemeList,
                        schemeNum: data.total,
                        type: 3,
                        curPage: curPage
                    });
                }
            });

        });

        /**
         * 企业方案获取正常数据  
         * @author xag
         * 2018.5.5
         * @param {number} curPage:当前页码
         * @param {number} houseRoom:户型
         * @param {number} floorAreaStr:面积
         */
        window.EM.on("getEnterpriseSolutions", (curPage, houseRoom = -1, floorAreaStr = -1) => {
            Load.show("请稍候...");
            let box = $("#sharCheckBox");
            let isMine = 0;
            if (box.is(':checked')) {
                isMine = 1;//1：我分享的
            }
            Module.getSchemeList({
                curPage: curPage,
                schemeType: 4,
                pageSize: 8,
                floorAreaStr: floorAreaStr,
                houseRoom: houseRoom,
                isMine: isMine,
                callback: (data) => {
                    Load.hide();
                    $("#headerHtml").show();
                    $("#back").hide();
                    !!data && this.setState({
                        memberSchemeList: data.memberSchemeList,
                        schemeNum: data.total,
                        type: 4,
                        curPage: curPage
                    });
                }
            });
        });

        /**
         * 企业方案获取回收站数据
         * @author xag
         * 2018.5.5
         * @param {number} curpage:当前页码
         */
        window.EM.on("getEnterpriseRecycleSolutions", (curPage = 1) => {
            Load.show("请稍候...");
            Module.getSchemeList({
                curPage: curPage,
                pageSize: 8,
                schemeType: 5,
                callback: (data) => {
                    Load.hide();
                    $("#headerHtml").hide();
                    $("#back").show();
                    !!data && this.setState({
                        memberSchemeList: data.recycleSchemeInfoList,
                        schemeNum: data.total,
                        type: 5,
                        curPage: curPage
                    });
                }
            });
        });
    }

    render() {
        /**
         * 分页 
         *@param value 页数
         */
        function commitPageInfo(value) {
            G.schemeType == 1 && window.EM.emit("getSolutions", value, G.schemeList.schemeHouseType, G.schemeList.schemeAreaType, encodeURI(G.schemeList.schemeKeyWords));
            G.schemeType == 2 && window.EM.emit("getMineSolutions", value, G.schemeList.schemeHouseType, G.schemeList.schemeAreaType);
            G.schemeType == 3 && window.EM.emit("getPublicSolutions", value, G.schemeList.schemeHouseType, G.schemeList.schemeAreaType);
            G.schemeType == 4 && window.EM.emit("getEnterpriseSolutions", value, G.schemeList.schemeHouseType, G.schemeList.schemeAreaType);
            G.schemeType == 5 && window.EM.emit("getEnterpriseRecycleSolutions", value, G.schemeList.schemeHouseType, G.schemeList.schemeAreaType);
        }
        return (
            <div className="scheme-library-bar" >
                <SchemeHeader hasMerchant={this.state.hasMerchant} />
                <div id="headerHtml">
                    <SchemeSliderBottom />
                </div>

                <div style={{ display: "none" }} id="back">
                    <a className="ht-back" href="javascript:;" onClick={() => {
                        G.schemeType = 4;
                        $(".enterprise-share").show();
                        window.EM.emit("getEnterpriseSolutions", 1);
                    }}><i className="fb-sprite icon-back"></i>返回</a>
                </div>
                {this.state.schemeNum == 0 ?
                    <div className="ht-list-none">
                        <label><img src={require("../Images/search-none-family.png")} /></label>
                        <span>没有找到匹配的方案，请重新搜索</span>
                    </div> :
                    <div className="scheme-content" >
                        <div className="scheme-library-scroll-content" id="schemeLibraryScroll">
                            <div className="scheme-library-cont clearfix">
                                {this.state.memberSchemeList.map((scheme, index) => {
                                    var curTime = new Date();
                                    var endTime = scheme.createTimeStamp;
                                    var time = "0秒前";
                                    var countTime = parseInt((curTime.getTime() - endTime) / 1000);
                                    var d = parseInt(countTime / (60 * 60 * 24));
                                    var h = parseInt(countTime / (60 * 60) % 24);
                                    var m = parseInt(countTime / 60 % 60);
                                    var s = parseInt(countTime % 60);
                                    switch (true) {
                                        case d > 0:
                                            time = d + "天前";
                                            break;
                                        case h > 0:
                                            time = h + "小时前";
                                            break;
                                        case m > 0:
                                            time = m + "分钟前";
                                            break;
                                        case s > 0:
                                            time = s + "秒前";
                                            break;
                                    }
                                    //是否是回收站数据
                                    if (this.state.type != 5) {
                                        //我的方案下分享来的，显示数据来源
                                        let isShareFrom = scheme.shareFrom == null || scheme.shareFrom.length == 0 || this.state.type == 4 ? "none" : "";
                                        //是否显示操作按钮
                                        let isShowBnt = G.schemeType == 4 || G.schemeType == 2 ? "block" : "none";
                                        //3是否可以分享 2是否可以删除 1是否可以编辑  
                                        let [isShare, isDelete, isEdit] = ["none", "none", "none"];
                                        if (this.state.type == 4 && !!scheme.permission) {
                                            for (let i = 0; i < scheme.permission.length; i++) {
                                                if (scheme.permission[i] == "1") {
                                                    isEdit = "";
                                                } else if (scheme.permission[i] == "2") {
                                                    isDelete = "";
                                                } else {
                                                    isShare = "";
                                                }
                                            }
                                        } else if (this.state.type == 2) {
                                            isDelete = "";
                                        }
                                        return (
                                            <SchemeItem key={index} time={time} schemeNo={scheme.schemeNo} projectid={scheme.gid} projectType={scheme.schemeType} headImg={scheme.touXiang} schemeImageFilePath={scheme.schemeImageFilePath} shareFrom={scheme.shareFrom} isShareFrom={isShareFrom}
                                                configPremisesName={scheme.schemeName} houseTypeName={scheme.houseTypeName} designerName={scheme.designerName}
                                                isEdit={isEdit} isDelete={isDelete} isShare={isShare} isShowBnt={isShowBnt} curPage={this.state.curPage} />
                                        )
                                    } else {
                                        return (
                                            <SchemeRecycle key={index} time={time} schemeNo={scheme.schemeNo} projectid={scheme.gid} projectType={scheme.schemeType} headImg={scheme.touXiang} schemeImageFilePath={scheme.schemeImageFilePath} configPremisesName={scheme.schemeName} houseTypeName={scheme.houseTypeName} designerName={scheme.designerName} days={scheme.days} />
                                        )
                                    }
                                })}
                            </div>
                        </div>
                        <div className="page" id="page" style={{ marginTop:this.state.schemeNum < 5 ? "-40px" : "-10px" }}>
                            <Pagination id="schemePage" button={true} pageSize={8} current={this.state.curPage} defaultCurrent={this.state.curPage} total={this.state.schemeNum} changeCallback={(val, ele) => {
                                commitPageInfo(val);
                            }} />
                        </div>
                    </div>
                }
            </div>
        )
    }
}
