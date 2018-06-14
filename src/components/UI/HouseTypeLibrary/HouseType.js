import React, { Component } from "react";
import Request from "../../../config/Request";
import $ from "jquery";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

import G from "../../Interface/Global";
import scrollBar from "../../Plugins/scrollBar/ScrollBar";
import Menus from "../../Public/Menus"
import HouseTypeSearch from "./HouseTypeSearch";
import HouseTypeDetauls from "./HouseTypeDetails";
import swiper from "../../Plugins/swiper/swiper";
import Pagination from "../../Public/Paging";

require("../../Plugins/swiper/swiper.css");

export default class HouseType extends Component {
    constructor() {
        super();
        this.state = {
            premiseInfo: {},
            premiseCount: 1,
            houseCount: 1,
            houseList: [],
            slideList: [],
            curPage: 1
        };

        window.EM.on("houseListData", (data,curPage) => {
            $("#houseSearch .house-search-bar").addClass("small fixed");
            $("#houseList").show();
            this.setState({
                premiseInfo: data.configPremisesInfo,
                premiseCount: data.premiseCount,
                houseList: data.publicHouseTypeInfoList,
                houseCount: data.total,
                slideList: !data.configPremisesInfo ? [] : data.configPremisesInfo.imgList,
                curPage: curPage
            });

            swiper("#htSlider", {
                autoplay: 4000,
                pagination: ".swiper-pagination",
                loop: true,
                autoplayDisableOnInteraction: false,
                lazyLoading: true,
                prevButton: '.btn.left',
                nextButton: '.btn.right',
                onlyExternal: true,
                paginationClickable: true
            });

            if ($(".ht-scroll-box").hasClass("ps-container")) {
                scrollBar.update(".ht-scroll-box");
            } else {
                scrollBar.init(".ht-scroll-box");
            }
        });
    }
    render() {
        return (
            <div className="house-type-content">
                <div className="house-type-bar" id="houseSearch">
                    <div className="table-box">
                        <div className="cell">
                            <div className="house-type-box">
                                <h2 className="ht-title">户型搜索</h2>
                                <HouseTypeSearch />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="house-type-list" id="houseList">
                    <a className="ht-back" href="javascript:;" onClick={() => {
                        $("#houseSearch .house-search-bar").removeClass("small fixed");
                        $("#houseList").hide();
                    }}><i className="fb-sprite icon-back"></i>返回</a>
                    <div className="ht-scroll-box-content fb-scroll-bar">
                        {this.state.premiseCount === 1 ?
                            <div className="ht-info clearfix">
                                <div className="ht-slide">{this.state.slideList.length === 0 ?
                                    <label className="ht-slide-none"><img src={require("../Images/houseType-defaults.png")} /></label> :
                                    <div className="swiper-container" id="htSlider">
                                        <div className="swiper-wrapper">{this.state.slideList.map((x, i) => {
                                            return (
                                                <div className="swiper-slide" key={"slide" + i}><img src={x.path} /></div>
                                            )
                                        })}</div>
                                        <div className="swiper-pagination"></div>
                                        <div className="swiper-btn">
                                            <div className="btn left">
                                                <span className="swiper-button-prev swiper-button-white"></span>
                                            </div>
                                            <div className="btn right">
                                                <span className="swiper-button-next swiper-button-white"></span>
                                            </div>
                                        </div>
                                    </div>}
                                </div>
                                <div className="ht-about">
                                    <h2>{this.state.premiseInfo.name}</h2>
                                    <p>{this.state.premiseInfo.introduction}</p>
                                </div>
                            </div>
                            : ""}

                        <div className="ht-list-box">
                            <div className="ht-list-content">
                                <h2>该楼盘共<span>{this.state.houseCount}</span>个户型图</h2>
                                <div className="ht-filtrate">
                                    <Menus />    
                                </div>
                                {this.state.houseCount === 0 ?
                                    <div className="ht-list-none">
                                        <label><img src={require("../Images/search-none-family.png")} /></label>
                                        <span>没有找到匹配的户型，请重新搜索</span>
                                    </div> :
                                    <div className="fb-adaption-list clearfix">
                                        <ul>
                                            {this.state.houseList.map((x, index) => {
                                                return (
                                                    <li key={"list" + index}>
                                                        <a className="show-details" href="javascript:;" onClick={() => {
                                                            $("#houseDetails").show();
                                                            $("#houseList").hide();
                                                            G.houseType.htDetailsSchemeList = true;
                                                            window.EM.emit("htDetails", 1, 6, x.gid, x.schemeCount);
                                                            window.EM.emit("htDetailsImages", "#images");
                                                        }}>
                                                            <div className="content">
                                                                <label className={x.houseTypeImagePath ? "image" : "image default"}><img src={x.houseTypeImagePath || require("../Images/houseType-defaults.png")} /></label>
                                                                <div className="intro">
                                                                    <span className="name">{x.configPremisesName}</span>
                                                                    <span className="area">{x.houseTypeName?x.houseTypeName:"" + " " + x.houseRoom + "室" + x.houseLiving + "厅" + (parseInt(x.floorArea) / 1000000).toFixed(2) + "㎡"}</span>
                                                                    <span className="scheme">该户型有{x.schemeCount}份装修方案</span>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                }
                                {this.state.houseCount === 0 ? "" :
                                    <div className="ht-pageing">
                                        <Pagination id="htPageing" pageSize={8} button={true} current={this.state.curPage} defaultCurrent={1} total={this.state.houseCount} changeCallback={(value, ele) => {
                                            window.EM.emit("htSearchHouseData", value, 8, G.houseType.htCityCode, G.houseType.htParentCityCode, G.houseType.familyData, G.houseType.areaData);
                                        }} />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="house-type-details" id="houseDetails">
                    <HouseTypeDetauls />
                </div>
            </div>
        )
    }

}

