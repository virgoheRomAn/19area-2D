import React, {Component} from 'react';
import { message } from 'antd';
import classifyPoint   from 'robust-point-in-polygon';
// import './contextmenu.css';
export default function(){
    let { ceils } = this.state;
    return (
        <div id = "ceilContextMenu" style = {{
            position:"fixed",
            display:"none",
            height:229,
            boxShadow: '4px 4px 5px #cccccc'
        }} 
        
         className = "ContextMenu_camera">
            <p
                className = "btnHover"
                id = "doceil"
                onClick = {(e)=>{
                    let points = [];
                    ceils.map((ceil)=>{
                        if(ceil.select){
                            if(ceil.isTiled == false){
                                ceil.beforePoints = [];
                                ceil.points.map((item)=>{
                                    ceil.beforePoints.push(item);
                                });
                                let arr = [];
                                ceil.floor.points.map((item)=>{
                                    arr.push([item.p.x,item.p.y]);
                                });
                                ceil.points.length = 0;
                                ceil.restrictedArea.length = 0;
                                ceil.floor.points.map((item)=>{
                                    ceil.points.push(item.p);
                                    if(JSON.stringify(item.p) == JSON.stringify(item.wall.p1)){
                                        let bool = false;
                                        if(!!item.wall.p11c){
                                            if(classifyPoint(arr,[item.wall.p11c.x,item.wall.p11c.y])!=1){
                                                bool = true;
                                                ceil.restrictedArea.push(item.wall.p11c);
                                            }
                                        }
                                        if(!!item.wall.p12c && !bool){
                                            if(classifyPoint(arr,[item.wall.p12c.x,item.wall.p12c.y])!=1){
                                                ceil.restrictedArea.push(item.wall.p12c);
                                            }
                                        }
                                    }else if(JSON.stringify(item.p) == JSON.stringify(item.wall.p2)){
                                        let bool = false;
                                        if(!!item.wall.p21c){
                                            if(classifyPoint(arr,[item.wall.p21c.x,item.wall.p21c.y])!=1){
                                                bool = true;
                                                ceil.restrictedArea.push(item.wall.p21c);
                                            }
                                        }
                                        if(!!item.wall.p22c && !bool){
                                            if(classifyPoint(arr,[item.wall.p22c.x,item.wall.p22c.y])!=1){
                                                ceil.restrictedArea.push(item.wall.p22c);
                                            }
                                        }
                                    }
                                })
                                
                                ceil.isTiled = true;
                                //全铺后合并
                                ceils.map((c,index)=>{
                                    if(c.floor.floorId == ceil.floor.floorId && c.isTiled == false){
                                        ceil.ceilModel.push(c.ceilModel[0]);
                                        delete ceils[index];
                                    }
                                })
                            }
                        }
                    });
                    ceils = ceils.filter((e)=>{
                        return e != undefined;
                    });
                    document.getElementById("ceilContextMenu").style.display = "none";
                    this.setState({ceils},()=>{
                        window.isChanged = true;
                    });
            }}
            >全铺</p>
            
                <hr style = {{margin:'0px 10px',borderBottom:"none",borderTop:"1px solid #E6E6E6"}} />
            <p
            className = "btnHover"
            onClick = {(e)=>{
                    ceils.map((ceil)=>{
                        if(ceil.select){
                            ceil.points.length = 0;
                            ceil.beforePoints.map((item)=>{
                                ceil.points.push(item);
                            })
                            ceil.isTiled = false;
                        }
                    })
                    document.getElementById("ceilContextMenu").style.display = "none";
                    this.setState({},()=>{
                        window.isChanged = true;
                    });
                }}
            >任意铺</p>
            <hr style = {{margin:'0px 10px',borderBottom:"none",borderTop:"1px solid #E6E6E6"}} />
            <p
            className = "btnHover"
            onClick = {(e)=>{
                    ceils.map((ceil)=>{
                        if(ceil.select){
                            ceil.points.length = 0;
                            ceil.beforePoints.map((item)=>{
                                ceil.points.push(item);
                            })
                            ceil.isTiled = false;
                            ceil.canScale = true;
                        }
                    })
                    document.getElementById("ceilContextMenu").style.display = "none";
                    this.setState({});
                }}
            >缩放</p>
            <hr style = {{margin:'0px 10px',borderBottom:"none",borderTop:"1px solid #E6E6E6"}} />
            <p
            className = "btnHover"
            onClick = {(e)=>{
                    let {walls} = this.state;
                    ceils.map((ceil,index,arr)=>{
                        if(ceil.select){
                            walls.map((w)=>{
                                w.ceilid && w.ceilid.map((cid,index)=>{
                                    if(cid.slice(2) == ceil.cid){
                                        delete w.ceilid[index];
                                    }
                                });
                                w.ceilid && (w.ceilid = w.ceilid.filter((f)=>{
                                    return true;
                                }))
                            })
                            arr.splice(index,1)
                        }
                    })
                    document.getElementById("ceilContextMenu").style.display = "none";
                    this.removeRulerLine();
                    this.setState({},()=>{
                        window.isChanged = true;
                    });
                }}
            >删除</p>
            {/* <hr style = {{margin:'0px 10px'}} />
            <p
                onClick = {(e)=>{
                    
                    window.EM.emit("ceilsHidden");
                    // document.getElementById("ceilContextMenu").style.display = "none";
                    this.removeRulerLine();
                    
                }}
            >隐藏吊顶</p> */}
            <hr style = {{margin:'0px 10px',borderBottom:"none",borderTop:"1px solid #E6E6E6"}} />
            <p
            className = "btnHover"
            onClick = {(e)=>{
                    ceils.map((ceil)=>{
                        if(ceil.select){
                            let obj = this.eventRestore({
                                pageX:ceil.positionPoint.x,
                                pageY:ceil.positionPoint.y
                            })
                            document.getElementById("ceilContextMenu_input").style.display = "block";
                            document.getElementById("ceilContextMenu_input").style.left = obj.pageX + "px";
                            document.getElementById("ceilContextMenu_input").style.top = obj.pageY + "px";
                            
                        }
                    })
                    this.setState({});
                }}
            >厚度</p>
            <p
                id = "ceilContextMenu_input"
                style = {{
                    position:"fixed",
                    background:"#ffffff",
                    width:200,
                    textAlign:"left",
                    paddingLeft:15,
                    height:45,
                    lineHeight:"45px",
                    display:"none",
                    borderRadius:4
                }}
            >吊顶厚度&nbsp;&nbsp; <input defaultValue = {
                ""
            }
            placeholder = {
                ceils.map((ceil)=>{
                    if(ceil.select){
                        return ceil.ply;
                    }
                }).filter((item)=>{
                    return item != undefined;
                })
            }
             style = {{
                height:22,
                width:80,
                borderRadius:4
            }} 
            onChange={()=>{}}
            onKeyDown = {(e)=>{
                if(e.keyCode == 13){
                    if(e.target.value>2000){
                        message.error("厚度不能超过2000");
                        return;
                    }else if(isNaN(e.target.value)){
                        message.error("请输入正确内容");
                        return;
                    }
                    ceils.map((ceil)=>{
                        if(ceil.select){
                            ceil.ply = e.target.value;
                            message.success("设置成功");
                            window.isChanged = true;
                            e.target.value = ""
                            document.getElementById("ceilContextMenu_input").style.display = "none";
                            document.getElementById("ceilContextMenu").style.display = "none";
                        }
                    })
                }
                
            }}
            type = "text" />&nbsp;&nbsp; mm</p>
        <p></p>
        </div>
    )
}