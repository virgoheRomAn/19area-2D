import React from 'react';
import Utils from '../Utils';
import {message} from 'antd';

export const getCameraJSX = function (camera, index, goToStepTwo) {
    let {floors,maskingPoint} = this.state;
    return (
        <g
            transform={`translate(${camera.position.x},${camera.position.y})`}
            onMouseDown={(e) => {
                e.stopPropagation();
                if (goToStepTwo) {
                    //todo:点击设置传送点，floor颜色，传送点位置判断
                    let arr = [];
                    if(!!!camera.floorIndex && camera.floorIndex != 0){
                        message.warn("不在房间内，无法设置")
                        return;
                    }
                    floors[camera.floorIndex].points.map((item)=>{
                        arr.push(item);
                    })
                    let obj = {
                        x:floors[camera.floorIndex].center.x,
                        y:floors[camera.floorIndex].center.y
                    }
                    maskingPoint = {
                        points:arr,
                        center:obj,
                        initialPoint:camera
                    };
                    let {checkPath,portals} = this.state;
                    if(checkPath.length<portals.length){
                        message.warn("请先选择传送位置");
                        return;
                    }
                    if (window.forbidden) {
                        message.warn("请先选择传送位置");
                        return;
                    }
                    // this.handlePutStartPortal(e);
                    this.setState({maskingPoint},()=>{
                        window.canPortalClick = false;
                    })
                    return;
                }
                if (e.button == 0) {
                    this.handleCameraAdjustStart(camera, e);
                    this.handlePutDownCamera(e);
                } else {
                    if(this.visibleTwice == false){
                        return;
                    }
                    let { contextMenuPosition } = this.state;
                    document.getElementById("ContextMenu_camera").style.display = "block";
                    // window.forbidden = true;
                    contextMenuPosition = {
                        x: e.pageX,
                        y: e.pageY,
                        cameraIndex: index
                    }
                    this.setState({ contextMenuPosition })
                    // document.onclick = (e) => {
                    //     if (e.target != document.getElementById("ContextMenu_camera")) {
                    //         document.getElementById("ContextMenu_camera").style.display = "none";
                    //         // window.forbidden = false;
                    //     }
                    // }
                }
            }}
            id={camera.mid + "1"}
           
            key = {camera.kid}
        >
            <rect id={camera.mid} x="0" y="0" height="500" width="500" stroke={camera.selected ? "#999999" : 'transparent'} fill="transparent" strokeWidth="15" />
            <image
                style={{ display: camera.pathTrue ? "none" : "block" }}
               
                height="500"
                width="500"
                xlinkHref={camera.changeImage ? require('../../../images/putdownCamera.png') : require('../../../images/putdownCamera.png')}
            />
            <image
                style={{ display: camera.pathTrue ? "block" : "none" }}
                height="500"
                width="500"
                xlinkHref={require('../../../images/selectedCamera.png')}
            />
            <rect rx = "40" ry = "40" x={camera.areaTypeShow.length>4?-100-(camera.areaTypeShow.length-4)*220:-100} y="-420" height = "320" width={camera.areaTypeShow.length==0?0:220*camera.areaTypeShow.length+200} fill = "#333333"/>
            <text x={camera.areaTypeShow.length>4?-(camera.areaTypeShow.length-4)*220:0} y="-150" style={{
                fontSize: 220,
                fontWeight: 500
            }} fill="#ffffff">{camera.areaTypeShow}</text>
        </g>
    );
}
export default function () {
    let { cameras, goToStepTwo } = this.state;
    cameras.map((camera)=>{
        let indexn = [];
        let arr = cameras.filter((item,index)=>{
            if(item.areaType == camera.areaType){
                indexn.push(index)
            }
            return item.areaType == camera.areaType;
        })
        indexn.map((item,index)=>{
            if(index != 0){
                cameras[item].areaTypeShow = arr[index].areaType + index;
            }else{
                cameras[item].areaTypeShow = arr[index].areaType;
            }
            
        })
    })
    return (
        cameras.map((camera, index) => {
            return this.getCameraJSX(camera, index, goToStepTwo);
        })
    );
}