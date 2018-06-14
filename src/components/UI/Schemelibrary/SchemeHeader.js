import React, { Component } from 'react';
import { Input } from 'antd';
import $ from "jquery";

import G from '../../Interface/Global';

require("./SchemeIndex.less");
const Search = Input.Search;

export default class SchemeHeader extends Component {
    constructor() {
        super();
        this.state = {
            curCls: true
        }
    }
    render() {
        function changeData(ele) {
            G.schemeList.schemeHouseType = -1;
            G.schemeList.schemeAreaType = -1;
            document.getElementById("hanzwii-housetype1").innerText = "户型";
            document.getElementById("hanzwii-area1").innerText = "面积";
            $("#" + ele).addClass("hanzwii-active").siblings().removeClass("hanzwii-active");
        }
        return (
            <div className="hanzwii-scheme-header" >
                <div className="hanzwii-scheme-header-content">
                    <span id="all" onClick={() => {
                        G.schemeType = 1;
                        changeData("all");
                        window.EM.emit("getSolutions", 1);
                    }} className="hanzwii-active">全部</span>
                    <span id="mine" onClick={() => {
                        G.schemeType = 2;
                        changeData("mine");
                        window.EM.emit("getMineSolutions", 1);
                    }} className="">我的方案</span>
                    <span id="public" onClick={() => {
                        G.schemeType = 3;
                        changeData("public");
                        window.EM.emit("getPublicSolutions", 1);
                    }} className="">公共方案</span>
                    <span id="enterprise" style={{ display: this.props.hasMerchant ? "" : "none" }} onClick={() => {
                        G.schemeType = 4;
                        changeData("enterprise");
                        window.EM.emit("getEnterpriseSolutions", 1);
                    }}>企业方案</span>
                    <div id="scheme-search">
                        <Search
                            onSearch={(value) => {
                                G.schemeList.schemeKeyWords = value;
                                G.schemeType = 1;
                                window.EM.emit("getSolutions", 1, -1, -1, encodeURI(value));
                                changeData("all");
                            }}
                            style={{ width: 240 }}
                        />
                    </div>

                </div>
            </div>
        )
    }
} 