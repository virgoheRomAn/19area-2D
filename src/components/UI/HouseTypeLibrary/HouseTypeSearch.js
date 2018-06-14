import React, { Component } from "react";
import Request from "../../../config/Request";
import $ from "jquery";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading//LoadingData";
import scrollBar from "../../Plugins/scrollBar/ScrollBar";
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
require("./HouseType.less");

export default class HouseTypeSearch extends Component {
    constructor() {
        super();
        this.state = {
            cls: "",
            cityCode: "",
            parentCityCode: "",
            keywords: "",
            cityName: "全国",
            joinHouseData: [],
            provinceListData: [],
            cityListData: []
        }

        /**
         * 加载合作楼盘
         * @author xag
         * 2018.5.11
         */
        let joinLoaded = false;
        window.EM.on("loadJoinHouse", () => {
            if (!joinLoaded) {
                Load.show("加载中...");
                joinLoaded = true;
                Module.getRecommendPremises({
                    callback: (data) => {
                        this.setState({
                            joinHouseData: data.configPremisesRecommendList
                        });
                        Load.hide();
                    }
                });

            }
        });

        /**
         * 加载获取城市
         * @author xag
         * 2018.5.11
         * @param cityCode 城市编码
         * @param type 城市类型
         */
        window.EM.on("loadCityListData", (cityCode, type, callback) => {
            if (!G.houseType.cityLoaded) {
                Load.show("加载中...", "scrollBox", "white small", "city");
                Module.getCityList({
                    parentCode: cityCode,
                    callback: (data) => {
                        Load.hide("scrollBox", "city");
                        switch (type) {
                            case "province":
                                G.houseType.cityLoaded = true;
                                this.setState({
                                    provinceListData: data.configCityList
                                });
                                scrollBar.init("#htCity", false);
                                break;
                            case "city":
                                this.setState({
                                    cityListData: data.configCityList
                                });
                                callback && callback.call();
                                break;
                        }
                    }
                });
            }
        });

        //搜索绑定
        window.EM.on("htSearchHouseData", (cur = 1, page = 8, code, pCode, family = -1, area = -1) => {
            this.searchHouse($("#houseName").val(), cur, page, code, pCode, family, area);
        });

    }

    changeCity(cityName, code, parentCode) {
        this.setState({
            cityName: cityName,
            cityCode: code,
            parentCityCode: parentCode
        });

        G.houseType.htCityCode = code;
        G.houseType.htParentCityCode = parentCode;
        $("#scrollBox").hide();
        G.houseType.cityLoaded = true;
    }
    
    /**
     * 公共户型库列表查询
     * @author xag
     * 2018.5.11
     * @param keywords 搜索关键字
     * @param curPage 当前页码
     * @param pageSize 页数量
     * @param cityCode 城市编码
     * @param parentCityCode 父级城市编码
     * @param areaData 面积
     * @param HouseType 户型
     */
    searchHouse(keywords, curPage = 1, pageSize = 8, cityCode, parentCityCode, HouseType, areaData) {
        Load.show("加载中...");
        Module.getHouseTypeList({
            keywords: encodeURI(keywords),
            curPage: curPage,
            pageSize: pageSize,
            cityCode: cityCode,
            parentCityCode: parentCityCode,
            floorAreaStr: areaData,
            houseRoom: HouseType,
            callback: (data) => {
                Load.hide();
                window.EM.emit("houseListData", data,curPage);
            }
        });
    }

    render() {
        //关闭城市窗口
        $(document).on("click", function (evt) {
            evt.stopPropagation();
            var $target = $(evt.target);
            if (!$target.hasClass("ht-select-city") && !$target.parents(".ht-select-city").hasClass("ht-select-city")) {
                $("#scrollBox").hide();
            }
        });

        return (
            <div className={this.props.cls ? "house-search-bar " + this.props.cls : "house-search-bar"}>
                <div className="ht-search-box">
                    <div className="ht-search-cont">
                        <div className="ht-select-city">
                            <label onClick={() => {
                                $("#scrollBox").toggle();
                                window.EM.emit("loadCityListData", "0", "province");
                            }}>
                                <span>{this.state.cityName}</span>
                                <b className="fb-arrow-dir down"></b>
                            </label>
                            <div className="ht-city-container" id="scrollBox">
                                <div className="ht-city-list-box" id="htCity">
                                    {this.state.provinceListData.map((x, index, ary) => {
                                        if (index % 7 === 0) {
                                            return (
                                                <div className="city-col clearfix" key={"province" + index}>
                                                    {ary.map((x, i) => {
                                                        if (i >= index && i < (index + 7)) {
                                                            return (
                                                                <a className="city-name" href="javascript:;" key={"city" + i} id={"city" + i} onClick={() => {
                                                                    $("#city" + i).addClass("active").parents("div.city-col").siblings().find("a").removeClass("active");
                                                                    $("#city" + i).siblings().removeClass("active");
                                                                    if (x.code) {
                                                                        G.houseType.cityLoaded = false;
                                                                        window.EM.emit("loadCityListData", x.code, "city", () => {
                                                                            var html = $("#loadCityData").clone(true).html();
                                                                            var left = $("#city" + i).position().left;
                                                                            var width = $("#city" + i).outerWidth(true);

                                                                            $("#htCity .more-city-list").remove();
                                                                            $("#city" + i).parents(".city-col").append(html).find(".arrow").css("left", left + width - width / 2 - 6);

                                                                            $("#htCity").height("");
                                                                            var height = $("#htCity").height() >= 300 ? 300 : "";
                                                                            $("#htCity").height(height);
                                                                            scrollBar.update("#htCity");


                                                                            $("#city" + i).parents(".city-col").find(".more-city-list a").click((e) => {
                                                                                var $target = $(e.target);
                                                                                var dataJson = JSON.parse("" + $target.attr("data-citydata") + "");
                                                                                $target.addClass("active").siblings().removeClass("active");
                                                                                this.changeCity(dataJson.name, dataJson.code, dataJson.parentCode);
                                                                            });
                                                                        });
                                                                    } else {
                                                                        $("#htCity .more-city-list").remove();
                                                                        $("#htCity").height("");
                                                                        this.changeCity($("#city" + i).text(), "", "");
                                                                    }
                                                                }}>{x.name}</a>
                                                            )
                                                        }
                                                    })}
                                                </div>
                                            )
                                        }
                                    })}
                                </div>

                                <div id="loadCityData" style={{ display: "none" }}>
                                    <div className="more-city-list">
                                        <span className="arrow"><i className="fb-arrow-dir top"><em></em></i></span>
                                        {this.state.cityListData.map((x, i) => {
                                            return (
                                                <a href="javascript:;" className="city-name-code" key={"more" + i} data-citydata={`{ "name": "${x.name}", "code": "${x.code}", "parentCode": "${x.parentCode}" }`} onClick={() => {
                                                    this.changeCity(x.name, x.code, x.parentCode);
                                                }}>{x.name}</a>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <label className="form-input clean big block">
                            <input id="houseName" type="text" placeholder="请输入楼盘名/小区" onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                    var keywords = $("#houseName").val();
                                    this.searchHouse(keywords, 1, 8, this.state.cityCode, this.state.parentCityCode);
                                }
                            }} />
                            <label className="clean-btn" href="javascript:;">&times;</label>
                        </label>
                    </div>
                    <div className="ht-search-btn">
                        <a className="fb-btn big background blue" href="javascript:;" onClick={() => {
                            var keywords = $("#houseName").val();
                            this.searchHouse(keywords, 1, 8, this.state.cityCode, this.state.parentCityCode);
                            G.houseType.familyData = -1;
                            G.houseType.areaData = -1;
                            $("#hanzwii-housetype2").text("户型"); 
                            $("#hanzwii-area2").text("面积");
                        }}>搜索</a>
                    </div>
                </div>
                <div className={!this.props.hasJoinHouse ? "ht-join-house" : "ht-join-house hide"}>
                    <label>合作楼盘：</label>
                    <p className="clearfix" id="joinHouse">
                        {this.state.joinHouseData.map((x, index) => {
                            return (
                                <a href="javascript:;" key={index} onClick={() => {
                                    $("#houseName").val(x.premisesName);
                                    this.searchHouse(x.premisesName, 1, 8, "", "");
                                    $("#hanzwii-housetype2").text("户型"); 
                                    $("#hanzwii-area2").text("面积");
                                }}>{x.premisesName}</a>
                            )
                        })}
                    </p>
                </div>
            </div>
        )
    }
}