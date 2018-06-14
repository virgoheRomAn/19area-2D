import React, {Component} from 'react';
import { message } from 'antd';
// import './contextmenu.css';
export default function(){
    let { ceils } = this.state;
    return (
        <div id = "ceilImgContextMenu" style = {{
            position:"fixed",
            display:"none",
            height:45,
            boxShadow: '4px 4px 5px #cccccc'
        }} 
        
         className = "ContextMenu_camera">
            
            <p
                className = "btnHover"
                onClick = {(e)=>{
                    
                    ceils.map((ceil,index,arr)=>{
                        ceil.ceilModel.map((c,index)=>{
                            if(c.canScale){
                                ceil.ceilModel.splice(index,1);
                            }
                        })
                    })
                    document.getElementById("ceilImgContextMenu").style.display = "none";
                    this.removeRulerLine();
                    this.setState({});
                }}
            >删除</p>
        </div>
    )
}