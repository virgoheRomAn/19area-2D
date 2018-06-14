import React, {Component} from 'react';
import './contextmenu.css'
export default function(){
    let {contextMenuPosition,cameras,portals,checkPath} = this.state;
    return (
        <div id = "ContextMenu_camera" style={{left:contextMenuPosition.x,top:contextMenuPosition.y,display:'none'}} className = "ContextMenu_camera">
            <p onClick = {()=>{
                    //todo:删除机位
                    let mid = cameras[contextMenuPosition.cameraIndex].mid;
                    let checkArr = [];
                    let portalArr = [];
                    // portals.map((item)=>{
                    //     portalArr.push(item);
                    // })
                    // checkPath.map((item)=>{
                    //     checkArr.push(item);
                    // })
                    checkPath.map((item,index)=>{
                        if(item.checkCameraNum == mid || item.initialPoint.mid == mid){
                            portalArr.push(item.checkPortalNum);
                            checkArr.push(index);
                        }
                    })
                    
                    portalArr.map((item)=>{
                        delete portals[item];
                    })
                    portals = portals.filter((item)=>{
                        return item !=undefined;
                    })
                    checkArr.map((item)=>{
                        delete checkPath[item];
                    })
                    checkPath = checkPath.filter((item)=>{
                        return item !=undefined;
                    })
                    cameras.splice(contextMenuPosition.cameraIndex, 1);
                    cameras.map((item,index)=>{
                        checkPath.filter((path)=>{
                            if(item.mid == path.checkCameraNum){
                                path.checkCameraNum = index;
                            }
                            if(item.mid == path.initialPoint.mid){
                                path.initialPoint.mid = index;
                            }
                        })
                        item.mid = index;
                    });
                    portals.map((item,index)=>{
                        checkPath.filter((path)=>{
                            if(item.mid == path.checkPortalNum){
                                path.checkPortalNum = index;
                            }
                        })
                        item.mid = index;
                    })
                    checkPath.map((item)=>{
                        cameras.filter((camera)=>{
                            cameras 
                        })
                    })
                    cameras.map((camera)=>{
                        camera.pathTrue = false;
                        checkPath.filter((Path)=>{
                            if(camera.mid == Path.checkCamera){
                                camera.pathTrue = true;
                            }
                        })
                    })

                    //todo:删除与此相机有关联的其他信息
                    this.setState({portals,checkPath},()=>{
                        document.getElementById("ContextMenu_camera").style.display = "none";
                        window.forbidden = false;
                    });
                    

                }}>删除机位</p>
                <hr style = {{margin:'0px 10px'}} />
            <p
                onClick = {(e)=>{
                    e.stopPropagation();
                    //todo:设置机位名称
                    cameras[contextMenuPosition.cameraIndex].cardPosition = {
                        x:e.pageX-50,
                        y:e.pageY-50
                    }
                    cameras.map((item)=>{
                        item.cameraTypeVisible = false;
                    })
                    cameras[contextMenuPosition.cameraIndex].cameraTypeVisible = true;
                    this.setState({},()=>{
                        document.getElementById("ContextMenu_camera").style.display = "none";
                    })

                }}
            >设置名称</p>
        </div>
    )
}