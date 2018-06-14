import React from 'react';
import { Card, Row, Col, Icon, Input } from 'antd';
import $ from "jquery";
import Method from "../../Interface/Method";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Button from '../../Public/Button';

export default function () {
    const style = {
        margin: 12,
    };
    let { floors, areaType } = this.state;
    let changeAreaType = (index, val) => {
        let obj = this.state.floors;
        areaType[index] = val;
        obj[index].areaShow = false;
        obj[index].userDefined = false;
        this.setState({ floors, areaType });
    }
    let getStyle = (item) => {
        return {
            position: "fixed",
            left: (!!item.cardPosition) ? item.cardPosition.x : 0,
            top: (!!item.cardPosition) ? item.cardPosition.y : 0,
            display: item.areaShow ? "block" : "none"
        }
    }
    let userDefined = (index) => {
        let obj = this.state.floors;
        obj[index].userDefined = true;
        this.setState({ floors });
    }
    let close = (index) => {
        let obj = this.state.floors;
        obj[index].areaShow = false;
        obj[index].userDefined = false;
        this.setState({ floors });
    }
    let showCeils = (floor, index) => {
        let { ceils } = this.state;
        floors[index].areaShow = false;
        ceils.map((c) => {
            if (c.floor.floorId == floor.floorId) {
                document.getElementById(c.cid).style.display = "";
            }
        })
        this.setState({ floors })

    }

    let styleObj = {
        display: "none"
    };

    return floors.map(function (floor, index) {
        return (
            <div key={index} className="jBox-container jBox-container-pc jBox-container-white jBox-confirm-normal jBox-space-container"
                style={{ display: floor.areaShow ? "block" : "none" }}>
                <div className="jBox-layout jBox-layout-shadow animated jBox-fadeIn jBox-modal" id="settingSpaceModal" style={{ "width": "100%", "height": "100%" }}>
                    <div className="jBox-title specail">
                        <label className="jBox-title-text">设置空间信息</label>
                        <a className="jBox-close-btn" href="javascript:;" onClick={() => close(index)}>×</a>
                    </div>
                    <div className="jBox-cont">
                        <div className="jBox-intro">
                            <div className="jBox-intro-cont">
                                <div className="space-container">
                                    <a className="btn" onClick={() => { changeAreaType(index, "主卧") }} href="javascript:;">主卧</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "次卧") }} href="javascript:;">次卧</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "厨房") }} href="javascript:;">厨房</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "卫生间") }} href="javascript:;">卫生间</a>

                                    <a className="btn" onClick={() => { changeAreaType(index, "客厅") }} href="javascript:;">客厅</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "餐厅") }} href="javascript:;">餐厅</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "客餐厅") }} href="javascript:;">客餐厅</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "书房") }} href="javascript:;">书房</a>

                                    <a className="btn" onClick={() => { changeAreaType(index, "门厅") }} href="javascript:;">门厅</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "玄关") }} href="javascript:;">玄关</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "儿童房") }} href="javascript:;">儿童房</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "阳台") }} href="javascript:;">阳台</a>

                                    <a className="btn" onClick={() => { changeAreaType(index, "露台") }} href="javascript:;">露台</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "入户花园") }} href="javascript:;">入户花园</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "储物间") }} href="javascript:;">储物间</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "多功能室") }} href="javascript:;">多功能室</a>

                                    <a className="btn" onClick={() => { changeAreaType(index, "影视间") }} href="javascript:;">影视间</a>
                                    <a className="btn" onClick={() => { changeAreaType(index, "步入式衣柜") }} href="javascript:;">步入式衣柜</a>
                                    <a className="btn" onClick={() => {
                                        let inputHtml = `
                                            <label class="form-input radius border gray" style="margin:25px 15px 0; width: auto;">
                                                <input id="input" type="text" placeholder="输入自定义名称" value="" />
                                            </label>
                                        `;
                                        jBox.confirm(inputHtml, {
                                            boxID: "inputModal",
                                            btn: {
                                                array: [
                                                    { text: "取消" },
                                                    {
                                                        text: "确定",
                                                        callback: () => {
                                                            changeAreaType(index, $("#input").val());
                                                        }
                                                    }
                                                ]
                                            },
                                            initFun: () => {
                                                $("#input").keydown((e) => {
                                                    if (e.keyCode === 13) {
                                                        jBox.close("#inputModal", null, () => {
                                                            changeAreaType(index, e.target.value);
                                                        });
                                                    }
                                                });
                                            }
                                        })
                                    }} href="javascript:;">自定义</a>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            // <div key={index} style={getStyle(floor)}>
            //     <Card
            //         style={{ height: 280, width: 380, boxShadow: '4px 4px 5px #888888' }}
            //         title={<p style={{ color: "#000", fontSize: 18 }}>设置空间信息</p>}
            //         extra={<Icon onClick={() => close(index)} style={{ cursor: 'pointer' }} type="close" />}
            //     >


            //         <Row style={{
            //             marginLeft: 8
            //         }}>
            //             <Col span={24}><p style={{ borderTop: '1px solid #CFCFCF', display: 'inline-block', width: '35%' }}></p><span style={{ margin: '0 20px', color: "#CFCFCF" }}>房间类型</span><p style={{ borderTop: '1px solid #CFCFCF', display: 'inline-block', width: '35%' }}></p></Col>
            //         </Row>
            //         <Row style={{ width: "95%", marginLeft: 8 }}>
            //             <Col span={5}><Button value="主卧" onClick={() => { changeAreaType(index, "主卧") }}></Button></Col>
            //             <Col offset={1} span={5}><Button value="次卧" onClick={() => { changeAreaType(index, "次卧") }}>次卧</Button></Col>
            //             <Col offset={1} span={5}><Button value="厨房" onClick={() => { changeAreaType(index, "厨房") }}>厨房</Button></Col>
            //             <Col offset={1} span={5}><Button value="卫生间" onClick={() => { changeAreaType(index, "卫生间") }} >卫生间</Button></Col>
            //         </Row>
            //         <Row style={{ width: "95%", marginLeft: 8 }}>
            //             <Col span={5}><Button value="客厅" onClick={() => { changeAreaType(index, "客厅") }} >客厅</Button></Col>
            //             <Col offset={1} span={5}><Button value="餐厅" onClick={() => { changeAreaType(index, "餐厅") }} >餐厅</Button></Col>
            //             <Col offset={1} span={5}><Button value="客餐厅" onClick={() => { changeAreaType(index, "客餐厅") }} >客餐厅</Button></Col>
            //             <Col offset={1} span={5}><Button value="书房" onClick={() => { changeAreaType(index, "书房") }} >书房</Button></Col>
            //         </Row>
            //         <Row style={{ width: "95%", marginLeft: 8 }}>
            //             <Col span={5}><Button value="门厅" onClick={() => { changeAreaType(index, "门厅") }} >门厅</Button></Col>
            //             <Col offset={1} span={5}><Button value="玄关" onClick={() => { changeAreaType(index, "玄关") }} >玄关</Button></Col>
            //             <Col offset={1} span={5}><Button value="儿童房" onClick={() => { changeAreaType(index, "儿童房") }}>儿童房</Button></Col>
            //             <Col offset={1} span={5}><Button value="阳台" onClick={() => { changeAreaType(index, "阳台") }} >阳台</Button></Col>
            //         </Row>
            //         <Row style={{ width: "95%", marginLeft: 8 }}>
            //             <Col span={5}><Button value="露台" onClick={() => { changeAreaType(index, "露台") }} >露台</Button></Col>
            //             <Col offset={1} span={5}><Button value="入户花园" onClick={() => { changeAreaType(index, "入户花园") }} >入户花园</Button></Col>
            //             <Col offset={1} span={5}><Button value="储物间" onClick={() => { changeAreaType(index, "储物间") }} >储物间</Button></Col>
            //             <Col offset={1} span={5}><Button value="多功能室" onClick={() => { changeAreaType(index, "多功能室") }} >多功能室</Button></Col>
            //         </Row>
            //         <Row style={{ width: "76%", marginLeft: -10 }}>
            //             <Col span={5}><Button value="影视间" onClick={() => { changeAreaType(index, "影视间") }}>影视间</Button></Col>
            //             <Col offset={1} span={5}><Button value="步入式衣柜" onClick={() => { changeAreaType(index, "步入式衣柜") }}>步入式衣柜</Button></Col>
            //             <Col offset={1} span={5}><Button onClick={() => userDefined(index)} value="自定义" ></Button></Col>
            //         </Row>
            //         <Row style={{ display: floor.userDefined ? "block" : "none", width: "95%", marginLeft: -7 }}>
            //             <Col span={16}><Input id={"input" + index} autoFocus maxLength="8" onKeyDown={(e) => {
            //                 if (e.keyCode == 13) {
            //                     changeAreaType(index, e.target.value)
            //                 }

            //             }} defaultValue={floor.areaType} /></Col>
            //             <Col offset={2} span={6}><button onClick={() => changeAreaType(index, document.getElementById("input" + index).value)} style={{ background: '#fff', border: "1px solid #ccc", cursor: "pointer", height: "28px" }}>确认</button></Col>

            //         </Row>
            //         {/* <Row>
            //             <Col  span={24}><p style = {{borderTop:'1px solid #CFCFCF',display:'inline-block',width:'35%'}}></p><span style = {{margin:'0 20px',color:"#CFCFCF"}}>房间设置</span><p style = {{borderTop:'1px solid #CFCFCF',display:'inline-block',width:'35%'}}></p></Col>
            //         </Row>
            //         <Row>
            //             <Col  span={24}><span onClick = {()=>{
            //                 showCeils(floor,index);
            //             }} style = {{color:"#00CCCB",fontSize:16,marginLeft:110}}>隐藏/显示吊顶</span></Col>
            //         </Row> */}
            //     </Card>
            // </div>

        )
    })
}