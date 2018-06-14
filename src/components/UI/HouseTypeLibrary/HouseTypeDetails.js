import React, { Component } from "react";
import Request from "../../../config/Request";
import axios from 'axios';
import $ from "jquery";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading//LoadingData";
import G from "../../Interface/Global";
import SchemeItem from '../Schemelibrary/SchemeItem';
import Module from '../../Interface/Module';
import { Pagination } from 'antd';

export default class HouseTypeDetauls extends Component {
    constructor() {
        super();

        this.state = {
            configPremisesName: "",
            houseTypeImagePath: "",
            cityName: "",
            houseType: "",
            houseTypeName: "",
            floorArea: "",
            schemeNumber: 0,
            schemeList: [],
            gid: "",
            houseTypeNo: "",
            houseTypeDataPath: ""
        };

        window.EM.on("htDetailsImages", (ele) => {
            $(ele).height($(ele).width());
            let maxHeight = $(window).height() - 54 - 60 - 47 - 30;
            if ($(ele).height() >= maxHeight) {
                $(ele).width(maxHeight)
                $(ele).height(maxHeight);
            }
        });
        G.houseType.htDetailsSchemeList = false;
        /**
         * 查询户型详情和相关方案列表
         * @author xag
         * 2018-05-08
         * @param curPage: 当前页,
         * @param gid: 户型对应gid,
         */
        window.EM.on("htDetails", (curPage = 1, pageSize = 8, gid, schemeNum) => {
            Load.show("加载中...");
            Module.getHouseTypeDetail({
                curPage: curPage,
                pageSize: pageSize,
                gid: gid,
                callback: (data) => {
                    Load.hide();
                    let publicHouseTypeInfo = data.publicHouseTypeInfo;
                    if (!G.houseType.htDetailsSchemeList) {
                        this.setState({
                            schemeList: data.publicSchemeInfoList
                        });
                    } else {
                        this.setState({
                            configPremisesName: publicHouseTypeInfo.configPremisesName,
                            houseTypeImagePath: publicHouseTypeInfo.houseTypeImagePath,
                            cityName: publicHouseTypeInfo.cityName,
                            houseType: publicHouseTypeInfo.houseType,
                            houseTypeName: publicHouseTypeInfo.houseTypeName ? publicHouseTypeInfo.houseTypeName : "",
                            floorArea: (publicHouseTypeInfo.floorArea / 1000000).toFixed(2),
                            schemeNumber: parseInt(schemeNum),
                            schemeList: data.publicSchemeInfoList,
                            gid: publicHouseTypeInfo.gid,
                            houseTypeNo: publicHouseTypeInfo.houseTypeNo,
                            houseTypeDataPath: publicHouseTypeInfo.houseTypeDataPath
                        });
                    }
                }
            });
        });
    }

    componentDidMount() {
        $(window).resize(function () {
            window.EM.emit("htDetailsImages", "#images");
        });
    }

    render() {
        return (
            <div className="ht-details-box clearfix">
                <a className="ht-back" href="javascript:;" onClick={() => {
                    $("#houseDetails").hide();
                    $("#houseList").show();
                }}><i className="fb-sprite icon-back"></i>返回</a>
                <div className="details-cont">
                    <span className="title">{this.state.configPremisesName}</span>
                    <div className="content">
                        <div className="images">
                            <label id="images"><img src={this.state.houseTypeImagePath} /></label>
                        </div>
                        <div className="intro">
                            <label><span>城市：</span>{this.state.cityName}</label>
                            <label><span>户型：</span>{this.state.houseType}</label>
                            <label><span>户型名称：</span>{this.state.houseTypeName}</label>
                            <label><span>套内面积：</span>{this.state.floorArea}㎡</label>
                            <a href="javascript:;" onClick={() => {
                                Module.saveDataTransfer({
                                    memberGid: window.BootParams['--memberGid'],
                                    token: window.BootParams['--token'],
                                    type: window.BootParams['--type'],
                                    projectType: 1
                                });
                                Load.show("加载中...");
                                let files = [{
                                    url: this.state.houseTypeDataPath + '?t=' + Date.now(),
                                    fileName: "houseTyp"
                                }];
                                Module.downloadFiles({
                                    files: files,
                                    callback: (repFiles) => {
                                        Load.hide();
                                        let houseTypeProject = repFiles["houseTyp"].data;
                                        G.clearCurrentScheme();
                                        //下载户型文件  去装修  进入2D  都相当新建
                                        G.saveSchemeType = "create";
                                        G.isSaveType = true;
                                        //方案信息不展示
                                        G.isMessage = false;
                                        G.currentScheme.saveSchemeType = 1;
                                        G.currentScheme.copyDraft = houseTypeProject.copyDraft;
                                        window.Native.saveProject(houseTypeProject, `${this.state.houseTypeNo}_pHouse`, () => {
                                            window.Native.getProjectAsId(houseTypeProject.id, `${this.state.houseTypeNo}_pHouse`, (project) => {
                                                window.EM.emit("openProject", houseTypeProject, () => {
                                                    $("a[href='#designBox']").click();
                                                    G.houseType.houseTypeGid = this.state.gid;
                                                })
                                            });
                                        });
                                    }
                                });
                            }}>去装修</a>
                        </div>
                    </div>
                </div>
                <div className="detials-list">
                    <div className="ht-scroll-box-content">
                        <h2>该户型有<span>{this.state.schemeNumber}</span>份装修方案</h2>
                        <div className="ht-scheme-list clearfix">
                            {this.state.schemeList.map((x, index) => {
                                var curTime = new Date();
                                var endTime = x.createTimeStamp;
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
                                return (
                                    <SchemeItem key={index} time={time} schemeNo={x.schemeNo} projectid={x.gid} projectType={2} headImg={x.avatar} schemeImageFilePath={x.publicSchemeImagePath} configPremisesName={x.publicSchemeName} houseTypeName={x.houseTypeName ? x.houseTypeName : ""} designerName={x.realName} isShareFrom={"none"} isShowBnt={"none"} />
                                )
                            })}

                            {this.state.schemeNumber === 0 ? "" :
                                <div className="paging">
                                    <Pagination pageSize={6} showQuickJumper defaultCurrent={1} total={this.state.schemeNumber} onChange={(value) => {
                                        G.houseType.htDetailsSchemeList = false;
                                        console.log(this.state.gid);
                                        window.EM.emit("htDetails", value, 6, this.state.gid);
                                    }} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}