import React from 'react';
import Request from '../../../config/Request';
import $ from "jquery";

import Method from "../../Interface/Method";
import Module from "../../Interface/Module";
import G from "../../Interface/Global";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import Load from "../../Plugins/loading/LoadingData";

export default class CopyImage extends React.Component {
    constructor() {
        super();
        this.state = {
            iconLeftMoved: false,
            iconRightMoved: false,
            copyDraftDistance: 100,
            moveData: {
                startX: 0,
                startY: 0,
                top: 0,
                left: 0
            },
            moveY: 0,
            moveLeftX: 0,
            moveRightX: 0,
        }
    }

    componentDidMount() {
        Method.commonFuns();

        this.getCopyDraftData(this.props.type);
    }

    //加载设置临摹的信息
    getCopyDraftData(type, callback) {
        if (type === "write") {
            let imgContainerWidth = this.props.imageContainerWidth - 60;
            let imgWidth = this.imageElement.offsetWidth;

            if (imgWidth > imgContainerWidth) return false;
            let imgRealWidth = imgWidth;

            this.setState({
                moveLeftX: (imgContainerWidth - imgRealWidth) / 2,
                moveRightX: (imgContainerWidth - imgRealWidth) / 2,
            });

            callback && callback.call();
        } else if (type === "read") {

            let { moveCoord, realeDistance } = this.props.project;

            this.setState({
                copyDraftDistance: realeDistance,
                moveY: moveCoord ? moveCoord.moveY || 0 : 0,
                moveLeftX: moveCoord ? moveCoord.moveLeftX || 0 : 0,
                moveRightX: moveCoord ? moveCoord.moveRightX || 0 : 0,
            });

            callback && callback.call();
        }
    }

    //坐标尺
    coordinatometerMoving(e) {
        e.stopPropagation();
        e.preventDefault();

        let img = this.imageElement;
        let clientX = e.pageX, clientY = e.clientY;
        let imgOffsetTop = img.offsetTop, imgOffsetLeft = img.offsetLeft, imgOffsetHeight = img.offsetHeight, imgOffsetWidth = img.offsetWidth;

        let x, y;
        y = clientY - this.state.moveData.startY + this.state.moveData.top;
        x = clientX - this.state.moveData.startX + this.state.moveData.left;

        //限制滑动范围
        y = y > imgOffsetTop ? y : imgOffsetTop;
        y = y > imgOffsetHeight ? imgOffsetHeight : y;

        x = x > imgOffsetLeft ? x : imgOffsetLeft;
        x = x > imgOffsetWidth + imgOffsetLeft ? imgOffsetWidth + imgOffsetLeft : x;

        if (this.state.iconLeftMoved) {
            let rx = this.state.moveRightX;
            this.setState({
                moveLeftX: x > rx ? rx : x,
                moveY: y
            })
        } else if (this.state.iconRightMoved) {
            let lx = this.state.moveLeftX;
            this.setState({
                moveRightX: x < lx ? lx : x,
                moveY: y
            })
        }

    }

    coordinatometerMoveEnd() {
        this.setState({
            iconLeftMoved: false,
            iconRightMoved: false
        }, () => {
            $(document).off("mousemove");
            $(document).off("mouseup");
        });
    }

    render() {
        return (
            <div className="my-copyImages-container">
                <div className="move-container">
                    <label className="image" ref={(ref) => {
                        this.imageContainerElement = ref;
                    }}><img src={this.props.Image.src} ref={(ref) => {
                        this.imageElement = ref;
                    }} /></label>

                    <label className="move-icon-left" style={{
                        top: this.state.moveY - 30,
                        left: this.state.moveLeftX - 21
                    }} onMouseDown={(e) => {
                        this.setState({
                            iconLeftMoved: true,
                            moveData: {
                                startX: e.clientX,
                                startY: e.clientY,
                                top: this.state.moveY,
                                left: this.state.moveLeftX
                            }
                        }, () => {
                            $(document).on("mousemove", this.coordinatometerMoving.bind(this));
                            $(document).on("mouseup", this.coordinatometerMoveEnd.bind(this));
                        });
                    }}>
                        <span>{(this.state.moveRightX - this.state.moveLeftX) < 20 ? "" : "0mm"}</span>
                        <img src={require("../Images/icon/moveIconLeft.png")} />
                    </label>

                    <label className="move-icon-right" style={{
                        top: this.state.moveY - 30,
                        left: this.state.moveRightX
                    }} onMouseDown={(e) => {
                        this.setState({
                            iconRightMoved: true,
                            moveData: {
                                startX: e.clientX,
                                startY: e.clientY,
                                top: this.state.moveY,
                                left: this.state.moveRightX
                            }
                        }, () => {
                            $(document).on("mousemove", this.coordinatometerMoving.bind(this));
                            $(document).on("mouseup", this.coordinatometerMoveEnd.bind(this));
                        });
                    }}>
                        <span style={(this.state.moveRightX - this.state.moveLeftX) < 20 ? { "left": `-${(this.state.moveRightX - this.state.moveLeftX + 70) / 2}px`, "marginLeft": "0" } : {}}>{this.state.moveRightX - this.state.moveLeftX}mm</span>
                        <img src={require("../Images/icon/moveIconRight.png")} />
                    </label>
                </div>
                <div className="modal-box big">
                    <div className="fb-form-list">
                        <div className="item">
                            <label className="title"><em>*</em>输入两点间距离<span>（与效果图一致）</span></label>
                            <div className="content">
                                <label className="form-input radius border gray clean after-text">
                                    <input type="number" placeholder="输入两点间距离(请输入正整数)" value={this.state.copyDraftDistance} onChange={(e) => {
                                        this.setState({ copyDraftDistance: e.target.value });
                                    }} />
                                    <a className="clean-btn" href="javascript:;" onClick={() => {
                                        this.setState({ copyDraftDistance: "" });
                                    }}>×</a>
                                    <em>mm</em>
                                </label>
                            </div>
                        </div>
                        <div className="item btn-box">
                            <label className="title"></label>
                            <div className="content">
                                <a className="cancel" id="jBoxCancel">取消</a>
                                <a className="ensure" id="jBoxSure" onClick={(e) => {
                                    let scale = this.imageElement.height / this.props.Image.height;
                                    let fakeDistance = this.state.moveRightX - this.state.moveLeftX;
                                    let copyDraftDistance = this.state.copyDraftDistance;
                                    if (!fakeDistance) fakeDistance /= scale;

                                    if (parseInt(copyDraftDistance) <= 0) {
                                        jBox.error("请输入正数！");
                                        return false;
                                    }

                                    if (parseInt(fakeDistance) <= 0) {
                                        jBox.error("请移动坐标尺，坐标尺的距离不能为0！");
                                        return false;
                                    }

                                    Method.jBoxModalHideElementFun(jBox, {
                                        id: `#${this.props.ID}`,
                                        removeElement: true
                                    }, () => {

                                        G.currentScheme.copyDraft = {
                                            imageDataUrl: this.props.Image.src,
                                            height: this.props.Image.height,
                                            width: this.props.Image.width,
                                            realeDistance: parseInt(this.state.copyDraftDistance) || 0,
                                            fakeDistance: fakeDistance,
                                            moveCoord: {
                                                moveLeftX: this.state.moveLeftX,
                                                moveRightX: this.state.moveRightX,
                                                moveY: this.state.moveY
                                            }
                                        };
                                        
                                        window.EM.emit("copyDraft", G.currentScheme.copyDraft);

                                        this.props.ensureCallback && this.props.ensureCallback(G.currentScheme.copyDraft);
                                    });
                                }}>确定校准</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}