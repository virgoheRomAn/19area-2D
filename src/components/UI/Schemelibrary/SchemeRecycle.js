import React, { Component } from 'react';
import $ from "jquery";

import jBox from "../../Plugins/jBox/jQuery.jBox";
import { Card, Avatar } from 'antd';

import G from '../../Interface/Global';
import Module from "../../Interface/Module";

export default class SchemeItem extends Component {
    constructor() {
        super();

    }
    render() {
        /**
         * 恢复回收站数据
         * @author xag
         * 2018.5.5
         * @param {number} isDel:{0: 恢复 1: 删除}
         * @param {number} gid: 方案id
         */
        function recoveryData(isDel, gid) {
            jBox.loading("数据正在恢复中...", {
                boxID: "shareLoad"
            });
            Module.recoverOrDeleteMerchantScheme({
                isDel: isDel,
                gid: gid,
                type: 3,
                callback: () =>{
                    jBox.remove("#shareLoad", {}, function () {
                        jBox.success("恢复数据成功！", {
                            closeFun: function () {
                                G.schemeType = 5;
                                window.EM.emit("getEnterpriseRecycleSolutions", 1);
                            }
                        })
                    });
                    
                }
            });
        }
        return (
            <Card bodyStyle={{ padding: 0 }}>
                <div className="custom-image" style={{
                    marginTop: 0
                }}>
                    <div className="hanzwii-img-wrap" >
                        <img alt="example" src={this.props.schemeImageFilePath} />
                        <div className="hanzwii-recycle" >
                            <p className="hanzwii-cutleft"  >剩余{this.props.days}天</p>
                            <p className="hanzwii-cutline" onClick={() => {
                                recoveryData(0, this.props.projectid);
                            }}>恢复</p>
                        </div>
                    </div>
                </div>
                <div className="hanzwii-card-foot" style={{
                    display: "block",
                    height: 100
                }}>
                    <h3>{this.props.configPremisesName}</h3>
                    <p style={{ height: 21 }}>{this.props.houseTypeName}</p>
                    <p style={{ width: "100%", borderTop: "1px solid #efefef", marginTop: 16, marginLeft: 0 }}></p>
                    <p className="hanzwii-autor" >
                        <Avatar style={{
                            top: 5
                        }} size="small" src={this.props.headImg} />
                        <span className="hanzwii-name" >{this.props.designerName}</span>
                        <span className="hanzwii-time">{this.props.time}</span>
                    </p>
                </div>
            </Card>

        )
    }
}