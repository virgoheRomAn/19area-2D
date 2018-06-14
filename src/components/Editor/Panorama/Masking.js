import React from 'react';
import './masking.css'
export default function(){
    let {maskingPoint} = this.state;
    if(maskingPoint.points.length == 0){
        return;
    }
    let points = maskingPoint.points;
    let d = `M${points[0].p.x},${points[0].p.y}\n`;
    points.forEach((point) => {
      d += `L${point.p.x},${point.p.y}\n`;
    });
    d += `L${points[0].p.x},${points[0].p.y}\n`;
    return (
        <g>
            <path
                d={d}
                fillOpacity='1'
                strokeLinejoin='round'
                strokeLinecap='round'
                fill={"rgba(0,204,203,.7)"}
                fillOpacity = ".6"
                stroke='#5d5d5d'
                strokeWidth="0"
                id = "masking"
                onMouseDown = {(e)=>{
                    //todo:点击生成传送点
                    {/* this.handlePutDownPortal(e); */}
                    let { portals,floors,selectPortal,maskingPoint } = this.state;
                    selectPortal.position={
                    x:e.pageX,
                    y:e.pageY
                    }
                    this.handlePutStartPortal(e);
                    e = this.eventWarp(e);
                    
                    this.portalPut = portals;
                    this.portalPut[portals.length-1].position = {
                        x:e.pageX-160,
                        y:e.pageY-160
                    }
                    {/* let {selectPortal,maskingPoint}  = this.state; */}
                    selectPortal.selectVisible = true;
                    
                    this.portalPut[portals.length-1].putDown = true;
                    this.visibleTwo = true;
                    maskingPoint.points.length = 0;
                    this.setState({},()=>{
                        window.canPortalClick = true;
                    });
                }}
            />
            <text
                style={{ fontSize: 180, }}
                x={maskingPoint.center.x} y={maskingPoint.center.y} r={2}
                fill = "#fff"
                transform={`translate(${-180*9 / 2},0)`}
            >
                点击此区域生成传送点
            </text>
        </g>
    )
}