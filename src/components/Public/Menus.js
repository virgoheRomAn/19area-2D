import React, { Component } from 'react';
import { Menu, Dropdown, Icon } from 'antd';
import $ from "jquery";

import G from "../Interface/Global";

export default class Menus extends Component {
    render() {
        //户型条件查询方案
        function getTypeScheme(val) {
            G.schemeList.schemeHouseType = val;
            G.schemeType == 1 && window.EM.emit("getSolutions", 1, val, G.schemeList.schemeAreaType);
            G.schemeType == 2 && window.EM.emit("getMineSolutions", 1, val, G.schemeList.schemeAreaType);
            G.schemeType == 3 && window.EM.emit("getPublicSolutions", 1, val, G.schemeList.schemeAreaType);
            G.schemeType == 4 && window.EM.emit("getEnterpriseSolutions", 1, val, G.schemeList.schemeAreaType);
        }
        //面积条件查询方案
        function getAreaScheme(val) {
            G.schemeList.schemeAreaType = val;
            G.schemeType == 1 && window.EM.emit("getSolutions", 1, G.schemeList.schemeHouseType, val);
            G.schemeType == 2 && window.EM.emit("getMineSolutions", 1, G.schemeList.schemeHouseType, val);
            G.schemeType == 3 && window.EM.emit("getPublicSolutions", 1, G.schemeList.schemeHouseType, val);
            G.schemeType == 4 && window.EM.emit("getEnterpriseSolutions", 1, G.schemeList.schemeHouseType, val);
        }
        function changeFamilyData(family) {
            G.houseType.familyData = family;
        }
        function changeAreaData(area) {
            G.houseType.areaData = area;
        }
        //户型查询
        function filtrateFun() {
            window.EM.emit("htSearchHouseData", 1, 8, G.houseType.htCityCode, G.houseType.htParentCityCode, G.houseType.familyData, G.houseType.areaData);
        }
        /**
         * 查询方案和户型列表
         * @author xag
         * 2018.5.15
         * @param {number} value 户型或面积 
         * @param {number} type 1：户型 2：面积
         * @param {String} text 当前条件
         */
        function queryList(value,text,type) {
            if (G.currentOperation === 1) {
                if (type == 1) {
                    document.getElementById(`hanzwii-housetype${G.currentOperation}`).innerText = text;
                    G.schemeList.schemeKeyWords = "";
                    getTypeScheme(value);
                } else {
                    document.getElementById(`hanzwii-area${G.currentOperation}`).innerText = text;
                    getAreaScheme(value);
                }
            } else if (G.currentOperation === 2) {
                if (type == 1) {
                    document.getElementById(`hanzwii-housetype${G.currentOperation}`).innerText = text;
                    changeFamilyData(value);
                    filtrateFun();
                } else {
                    document.getElementById(`hanzwii-area${G.currentOperation}`).innerText = text;
                    changeAreaData(value);
                    filtrateFun();
                }
            }
        }
        const familyMenu = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(-1,"全部",1);
                    }} >全部</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(1,"一室",1);
                    }} >一室</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(2,"二室",1);
                    }} >二室</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(3,"三室",1);
                    }} >三室</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(4,"四室",1);
                    }} >四室</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(5,"其他",1);
                    }} >其他</a>
                </Menu.Item>
            </Menu>
        );
        const areaMenu = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(-1,"全部",2);
                    }} >全部</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(1,"50㎡以下",2);
                    }} >50㎡以下</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(2,"50-80㎡",2);
                    }} >50-80㎡</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                       queryList(3,"80-100㎡",2);
                    }} >80-100㎡</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(4,"100-130㎡",2);
                    }} >100-130㎡</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="javascript:;" onClick={() => {
                        queryList(5,"130㎡以上",2);
                    }} >130㎡以上</a>
                </Menu.Item>
            </Menu>
        );
        return (
            <div>
                <div className="hanzwii-slider hanzwii-silider-left" >
                    <Dropdown overlay={familyMenu}>
                        <a className="ant-dropdown-link" href="#">
                            <span id={`hanzwii-housetype${G.currentOperation}`}>户型</span> <Icon type="down" />
                        </a>
                    </Dropdown>
                </div>
                <div className="hanzwii-slider" >
                    <Dropdown overlay={areaMenu}>
                        <a className="ant-dropdown-link" href="#">
                            <span id={`hanzwii-area${G.currentOperation}`}>面积</span> <Icon type="down" />
                        </a>
                    </Dropdown>
                </div>
            </div>
        )
    }
}