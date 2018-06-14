import React from 'react';
import Request from '../../../config/Request';
import $ from "jquery";

import Method from "../../Interface/Method";
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

import Pagination from "../../Public/Paging";

export default class SchemeModal extends React.Component {
    constructor() {
        super();
        this.state = {
            mySchemeListData: {
                schemeList: [],
                current: 1,
                total: 0
            },
        }
    }

    //获取我的方案列表
    getMySchemeList(params = { curPage: 1 }, callback) {
        Load.show("获取我的方案中...", "createContentModal", "small white", "mySchemeList");
        Module.getSchemeList({
            schemeType: 2,
            curPage: params.curPage || 1,
            pageSize: 3,
            isMine: true,
            callback: (data) => {
                Load.hide("createContentModal", "mySchemeList");
                this.setState({
                    mySchemeListData: {
                        schemeList: data.memberSchemeList || [],
                        curPage: params.curPage || 1,
                        total: data.total
                    }
                }, () => {
                    callback && callback.call();
                })
            }
        });
    }

    componentDidMount() {
        this.getMySchemeList();
    }

    //进入2D
    enterEditor2D(gid, type) {
        Method.build2D(gid, type, (data) => {
            Method.jBoxModalHideFun(jBox, `#${this.props.id}`, () => {
                //判断当前方案是否可以保存
                G.sourceType = type;
                G.currentScheme.saveSchemeType = 2;
                G.currentScheme.isHasBuildName = true;

                //判断当前方案是否可以保存
                switch (type) {
                    case 1:
                        G.isSaveType = true;
                        G.isMessage = true;
                        break;
                    case 2:
                        G.isSaveType = false;
                        G.isMessage = true;
                        break;
                    case 3:
                        G.isSaveType = false;
                        G.isMessage = true;
                        break;
                    case 4:
                        G.isSaveType = data.memberScheme.hasEditPermission;
                        G.isMessage = true;
                        break;
                }
                //加载临摹信息
                window.EM.emit("getCopyDraft");
                //判断是否可以另存为
                window.EM.emit("getSaveType");
            });
        });
    }

    render() {
        return (
            <div className="my-scheme-container">
                {this.state.mySchemeListData.schemeList.length === 0 ?
                    <div className="box none">
                        <label>
                            <img src={require("../Images/search-none-family.png")} />
                            <span>暂无我的方案，去新建吧！</span>
                        </label>
                    </div> :
                    <div className="box">
                        <div className="my-scheme-list">
                            {this.state.mySchemeListData.schemeList.map((x, index) => {
                                return (
                                    <div key={`myScheme${index}`} className="item">
                                        <a onClick={() => {
                                            this.enterEditor2D(x.gid, parseInt(x.schemeType));
                                        }}>
                                            <label className="image"><img src={x.schemeImageFilePath} /></label>
                                            <label className="intro">
                                                <span>{x.schemeName}</span>
                                                <span>{`${x.houseTypeName} ${x.houseRoom}室${x.houseLiving}厅${(x.floorArea / 1000000).toFixed(2)}㎡`}</span>
                                            </label>
                                        </a>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="paging">
                            <Pagination id={`mySchmePaging`} button={true} pageSize={3} current={this.state.mySchemeListData.curPage} defaultCurrent={this.state.mySchemeListData.curPage} total={this.state.mySchemeListData.total} changeCallback={(val, ele) => {
                                this.getMySchemeList({
                                    curPage: val
                                }, () => {
                                    !!ele && ele.val(val);
                                });

                            }} />
                        </div>
                    </div>
                }
            </div>
        )
    }
}