import React from 'react';
import Utils from '../Utils';

export const getPortalJSX = function (portal, index,_this,goToStepTwo) {

    return (
        <g  
        key = {index}
        id={portal.mid+1}
        style = {{cursor:'pointer'}}
        transform={`translate(${portal.position.x},${portal.position.y})`}
        onClick = {(e)=>{
            e.stopPropagation();
            // console.log(e.button)
            if(goToStepTwo){
                let {portals} = this.state;
                if(!window.canPortalClick){
                    return;
                }
                if(e.button == 0){
                    portals.map((item)=>{
                        item.selected = false;
                    })
                    portal.selected = true;
                    this.handlePortalAdjustStart(portal,e,index);
                    document.getElementById("selectportal").style.display = "block";
                    
                }else{
                    //右键菜单
                    
                }
            }
            
        }}
        id = {portal.mid+"1"}
        onMouseDown = {(e)=>{
            if(e.button == 2){
                let {contextMenuPortalPosition,portals} = _this.state;
                portals.map((item)=>{
                    item.selected = false;
                })
                portal.selected = true;
                contextMenuPortalPosition = {
                    x:e.pageX,
                    y:e.pageY,
                    portalIndex:index
                }
                document.getElementById("selectportal").style.display = "none";
                _this.setState({contextMenuPortalPosition});
                document.getElementById("ContextMenu_portal").style.display = "block";
            }
        }}
        >
        {/* <rect id={portal.mid}  x="-10" y="-10" height="320" width="320" stroke={portal.selected? "blue":'transparent'} fill="transparent" strokeWidth="15" /> */}
            <image
                id = {portal.mid + 2}
                x={0}
                y={0}
                height="300"
                width="300"
                xlinkHref={portal.putDown?require('../../../images/portal.png'):""}
            />
            <text x="80" y="-50" style={{
              fontSize: 220,
            }} fill="#00CCCB">{index}</text>
        </g>
    );
}
export default function () {
    let { portals,selectPortal,goToStepTwo} = this.state;
    return (
        portals.map((portal, index) => {
            return this.getPortalJSX(portal, index,this,goToStepTwo);
        })
    );
}