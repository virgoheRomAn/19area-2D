import React from 'react'
import Request from '../../../config/Request';
import $ from "jquery";

import { Pagination } from 'antd';

import Method from "../../Interface/Method";
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

export default class EditorLeft extends React.Component {
    constructor() {
        super();
        this.state = {
            asideVisible: false,
            mouseType: "scale",
            enterList: [0, 0, 0],
            configModalTypeList: [],
            barndList: [],
            parentMenuList: [],
            sonMenuList: [],
            searchMessage: "",

            //分页
            curPage: 1,
            total: 10,

            //模型信息列表
            modelDataList: [],

            //模型详细信息
            modelDetails: {
                img: require("../../../images/new/General.png"),
                name: "暂无",
                price: "￥200元起",
                brand: "美心",
                type: "MEIXIN-BEFAULITY1",
                size: "1000*1000*1000mm",
                specification: "白色欧洲原木"
            }
        }

        //绑定列表菜单数据
        window.EM.on('getLeftMenuDate', (menuProject, callback) => {
            var parentList = [], sonList = [];
            menuProject.map((x) => {
                if (parseInt(x.parentGid) === 0) {
                    parentList.push(x);
                } else {
                    sonList.push(x);
                }
            });
            this.setState({ configModalTypeList: menuProject, parentMenuList: parentList, sonMenuList: sonList }, () => {
                callback && callback.call();
            });
        });

        //绑定公共库数据查询
        window.EM.on('getModelDataList', (parentTypeGid, typeGid, curPage) => {
            this.getModelDataList(parentTypeGid, typeGid, curPage);
        });

        //定义分页查询，选项查询的参数
        ([window.modelTypeVal, window.parentGidVal, window.sonGidVal, window.brandGidVal] = ["brand", "-1", "-1", "-1"]);
    }

    componentDidMount() {
        //Tab切换菜单
        $(".editor-left .tab-nav a").click(function () {
            if (!window.modalLoaded) return false;
            if ($(this).hasClass("active")) return false;
            $(this).addClass("active").parent().siblings().find("a").removeClass("active");
            $(".parent-menu").removeClass("active");
        });
    }

    //获取品牌名称列表
    getBrandList(gid, pGid) {
        this.setState({ barndList: [] });
        this.state.configModalTypeList.map(x => {
            if (gid === "-1") {
                //"-1"表示搜索的全部
                if (pGid === x.gid) {
                    this.setState({ barndList: x.brandList || [] });
                }
            } else {
                //其余表示所有的子分类
                if (gid === x.gid) {
                    this.setState({ barndList: x.brandList || [] });
                }
            }
        });
    }

    //查询模型库（公共库和品牌库）
    getModelDataList(parentTypeGid, typeGid, curPage = 1, brandGid) {
        window.modalLoaded = false;
        let ptGid = window.modelTypeVal === "public" ? parentTypeGid : parentTypeGid === "-1" ? this.state.configModalTypeList[0].gid : parentTypeGid;
        let url = window.modelTypeVal === "public" ? "/frontDesginAjax/desginQueryPublicBaseModelInfoList.action" : "/frontDesginAjax/desginQuerySpreadBaseModelInfoList.action";
        let paramsData = {
            parentTypeGid: ptGid,
            typeGid: typeGid,
            pageSize: 10,
            curPage: curPage,
            keyWords: encodeURI(this.state.searchMessage)
        };

        let brandParams = window.modelTypeVal === "public" ? {} : { brandGid: window.brandGidVal };

        Object.assign(paramsData, brandParams);
        Load.show("加载中...", "listCont", "white small", "modal");
        Request.get(url, {
            params: paramsData
        }).then((data) => {
            if (data.data.code === 1000) {
                window.modalLoaded = true;
                Load.hide("listCont", "modal");
                $("#listScroll").scrollTop(0);
                (!brandGid || brandGid === "-1") && this.getBrandList(typeGid, ptGid);
                let { total, modelInfoList: dataList } = data.data;
                this.setState({ total: total, curPage: curPage, modelDataList: dataList });
            } else {
                jBox.error("请求失败，错误代码：" + data.data.code, {
                    closeFun: function () {
                        window.modalLoaded = true;
                        Load.hide("listCont", "modal");
                    }
                });
                return false;
            }
        });
    }
    render() {
        return (
            <div className="editor-left">
                <div className="container-content">
                    <div className="tab-box">
                        <div className="tab-nav">
                            <ul className="clearfix">
                                <li><a className="active" href="javascript:;" id="link_PPK" onClick={() => {
                                    window.modelTypeVal = "brand";
                                    window.parentGidVal = "-1";
                                    window.sonGidVal = "-1";
                                    window.brandGidVal = "-1";
                                    this.getModelDataList(window.parentGidVal, sonGidVal, 1, window.brandGidVal);
                                    //默认第一个菜单选中
                                    $(".parent-menu").eq(0).addClass("active");
                                }}><i className="e-icon icon-ppk"></i>品牌库</a></li>
                                <li><a className="" href="javascript:;" id="link_GGK" onClick={() => {
                                    window.modelTypeVal = "public";
                                    window.parentGidVal = "-1";
                                    window.sonGidVal = "-1";
                                    this.getModelDataList(window.parentGidVal, sonGidVal, 1);
                                }}><i className="e-icon icon-ggk"></i>公共库</a></li>
                            </ul>
                        </div>
                        <div className="tab-container">
                            <div className="left">
                                <div className="menu">
                                    {this.state.parentMenuList.map((x, index) => {
                                        return (
                                            <div className="parent-menu" key={"pMenu" + index} id={"pMenu" + index}>
                                                <span>{x.typeName}</span>
                                                <div className="son-menu">
                                                    <span id={x.typeCode + "All"} onClick={() => {
                                                        $(".parent-menu").removeClass("active");
                                                        $("#" + x.typeCode + "All").addClass("active").siblings().removeClass("active");
                                                        $("#" + x.typeCode + "All").parents(".parent-menu").addClass("active");
                                                        window.parentGidVal = x.gid;
                                                        window.sonGidVal = "-1";
                                                        window.brandGidVal = "-1";
                                                        this.getModelDataList(window.parentGidVal, window.sonGidVal, 1, window.brandGidVal);
                                                    }}>全部</span>
                                                    {this.state.sonMenuList.map((son, index) => {
                                                        if (son.parentGid === x.gid) {
                                                            return (
                                                                <span key={"sMenu" + index} id={"sMenu" + index} onClick={() => {
                                                                    $(".parent-menu").removeClass("active");
                                                                    $("#sMenu" + index).addClass("active").siblings().removeClass("active");
                                                                    $("#sMenu" + index).parents(".parent-menu").addClass("active");
                                                                    window.parentGidVal = x.gid;
                                                                    window.sonGidVal = son.gid;
                                                                    window.brandGidVal = "-1";
                                                                    this.getModelDataList(window.parentGidVal, window.sonGidVal, 1, window.brandGidVal);
                                                                }}>{son.typeName}</span>
                                                            )
                                                        }
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="right" id="listCont">
                                <div className="search">
                                    <div className="search-content">
                                        <div className="ht-search-cont">
                                            <label className="form-input clean small block">
                                                <input id="searchInput" type="text" placeholder="输入搜索信息" onKeyDown={(e) => {
                                                    if (e.keyCode == 13) {
                                                        $(".parent-menu").removeClass("active");
                                                        window.parentGidVal = "-1";
                                                        window.sonGidVal = "-1";
                                                        window.brandGidVal = "-1";
                                                        this.state.searchMessage = $("#searchInput").val();
                                                        this.getModelDataList(window.parentGidVal, window.sonGidVal, 1, window.brandGidVal);
                                                    }
                                                }} />
                                                <label className="clean-btn" href="javascript:;">&times;</label>
                                            </label>
                                        </div>
                                        <div className="ht-search-btn">
                                            <a className="fb-btn big background blue" href="javascript:;" onClick={() => {
                                                $(".parent-menu").removeClass("active");
                                                window.parentGidVal = "-1";
                                                window.sonGidVal = "-1";
                                                window.brandGidVal = "-1";
                                                this.state.searchMessage = $("#searchInput").val();
                                                this.getModelDataList(window.parentGidVal, window.sonGidVal, 1, window.brandGidVal);
                                            }}>搜索</a>
                                        </div>
                                    </div>
                                </div>
                                <div className={window.modelTypeVal === "public" ? "content" : "content big"}>
                                    <div className="tab-panel">
                                        {window.modelTypeVal === "public" ? "" :
                                            <div className="brand-search">
                                                <select id="brandSelect" onChange={() => {
                                                    window.brandGidVal = $("#brandSelect").val();
                                                    this.getModelDataList(window.parentGidVal, window.sonGidVal, 1, window.brandGidVal);
                                                }}>
                                                    <option value="-1" defaultValue>全部</option>
                                                    {this.state.barndList.map((x, index) => {
                                                        return (
                                                            <option key={"brand" + index} value={x.gid}>{x.brandName}</option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                        }

                                        {this.state.total !== 0 ?
                                            <div className="data-list" id="listScroll">
                                                <ul>
                                                    {this.state.modelDataList.map((x, index) => {
                                                        return (
                                                            <li key={"model" + index} className={"model-list" + index} onClick={(e) => {
                                                                let item = x;
                                                                if (x.modelBaseType !== 4) {
                                                                    window.EM.emit("put", {
                                                                        type: 'door',
                                                                        id: item.gid,
                                                                        name: item.modelNameChs,
                                                                        nameEn: item.modelName,
                                                                        width: item.modelLength,
                                                                        modelWidth: item.modelWidth,
                                                                        modelLength: item.modelLength,
                                                                        modelHeight: item.modelHeight,
                                                                        modelBaseType: item.modelBaseType,
                                                                        configModelTypeGid: item.typeGid,
                                                                        h: item.modelHeightGround || (item.modelBaseType == 2 ? 120 : 0)
                                                                    })
                                                                } else {
                                                                    let imgPath = require('../../../images/ceilImg.png');
                                                                    if (!!item.modelTopImgPath) {
                                                                        imgPath = item.modelTopImgPath;
                                                                    }
                                                                    window.EM.emit("startCeil", e, imgPath, {
                                                                        id: item.gid,
                                                                        name: item.modelNameChs,
                                                                        nameEn: item.modelName,
                                                                        width: 1000,
                                                                        modelWidth: 1000,
                                                                        modelLength: 1000,
                                                                        modelHeight: 1000,
                                                                        modelBaseType: item.modelBaseType,
                                                                        configModelTypeGid: item.typeGid,
                                                                        h: item.modelHeightGround || (item.modelBaseType == 2 ? 120 : 0),
                                                                    });
                                                                }
                                                            }} onMouseEnter={() => {
                                                                this.setState({
                                                                    modelDetails: {
                                                                        img: x.modelImgHdPath ? x.modelImgHdPath : x.imageFilePath,
                                                                        name: x.modelNameChs,
                                                                        price: x.productPrice != -1 && window.modelTypeVal != "public" ? (x.productPrice / 100.0).toFixed(2) : null,
                                                                        unitName: x.productPriceUnitName,
                                                                        brand: x.brandName ? x.brandName : "-",
                                                                        type: x.productModel ? x.productModel : "-",
                                                                        size: x.modelLength ? x.modelLength + "*" + x.modelWidth + "*" + x.modelHeight + "mm" : "-"
                                                                    }
                                                                });
                                                                let height = $(".model-list" + index).outerHeight(true);
                                                                let width = $(".model-list" + index).outerWidth(true);
                                                                let top = $(".model-list" + index).position().top;
                                                                let left = $(".model-list" + index).position().left;
                                                                let modelDivHeight = $("#modelDetail").outerHeight(true);
                                                                var contentDivHeight = $("#listCont .content").outerHeight(true);

                                                                let newTop = (modelDivHeight + top) > contentDivHeight ? contentDivHeight - modelDivHeight - 15 : top + 15;

                                                                $("#modelDetail").css({
                                                                    top: newTop,
                                                                    left: left + width
                                                                }).show();
                                                            }} onMouseLeave={() => {
                                                                $("#modelDetail").hide();
                                                            }}>
                                                                <label className="image">
                                                                    <img src={x.imageFilePath} alt="" />
                                                                    <a className="use-pop" href="javascript:;">点击应用</a>
                                                                </label>
                                                                <label className="intro"><span>{x.modelNameChs}</span></label>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </div>
                                            :
                                            <div className="none-data">
                                                <label><img src={require('../../../images/noModel.png')} /></label>
                                            </div>
                                        }
                                    </div>

                                    <div className="model-detail-intro" id="modelDetail">
                                        <label className="image"><img src={this.state.modelDetails.img} /></label>
                                        <label className="text">{this.state.modelDetails.name}</label>
                                        <label className="price">{this.state.modelDetails.price ? "￥" + this.state.modelDetails.price + "元起/" + this.state.modelDetails.unitName : ""}</label>
                                        <label className="brand"><span>品牌： </span>{this.state.modelDetails.brand}</label>
                                        <label className="type"><span>型号： </span>{this.state.modelDetails.type}</label>
                                        <label className="size"><span>尺寸： </span>{this.state.modelDetails.size}</label>
                                        {/* <label className="specification"><span>规格：</span>{this.state.modelDetails.specification}</label> */}
                                    </div>

                                    <div className="ht-pageing">
                                        {this.state.total === 0 ? "" :
                                            <Pagination pageSize={10} simple current={this.state.curPage} defaultCurrent={1} total={this.state.total} onChange={(value) => {
                                                this.getModelDataList(window.parentGidVal, window.sonGidVal, value, window.brandGidVal);
                                            }} />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a className="handle-btn" onClick={() => {
                        $(".editor-left").toggleClass("active");
                        $(".handle-btn > i").toggleClass("active");
                    }}><i className="e-icon icon-switch"></i></a>
                </div>
            </div>
        )
    }
}