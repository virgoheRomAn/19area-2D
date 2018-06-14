import React, {Component} from 'react';
import './contextmenu.css'
export default function(){
    let {contextMenuPortalPosition,portals,checkPath,cameras,selectPortal,pathLine} = this.state;
    return (
        <div id = "ContextMenu_portal" style={{left:contextMenuPortalPosition.x,top:contextMenuPortalPosition.y,display:'none',height:56}} className = "ContextMenu_camera">
            <p onClick = {()=>{
                    //todo:删除机位
                    {/* portals.splice(contextMenuPortalPosition.portalIndex, 1);
                    this.setState({});
                    document.getElementById("ContextMenu_portal").style.display = "none"; */}
                    pathLine.length = 0;
                    portals.filter((item, index) => {
                        if (item.selected == true) {
                            portals.splice(index, 1);
                            if(!!checkPath[index]){
                                let cameraIndex = checkPath[index].checkCameraNum;
                                cameras[cameraIndex].pathTrue = false;
                            }
                            checkPath.splice(index, 1);
                            checkPath.map((item,indexc)=>{
                                if(indexc>=index){
                                    item.checkPortalNum = item.checkPortalNum - 1;
                                }
                            })
                            window.deleteBtnD = true;
                            window.deleteIndex = index;
                            window.deleteNumber++;
                            selectPortal.selectVisible = false;

                        }
                    });
                    {/* checkPath.map((item)=>{
                        pathLine.push({
                            p1:item.checkPortal.position,
                            p2:item.checkCamera.position
                        })
                    }); */}
                    document.getElementById("ContextMenu_portal").style.display = "none";
                    this.setState({});

                }}>删除传送门</p>
        </div>
    )
}