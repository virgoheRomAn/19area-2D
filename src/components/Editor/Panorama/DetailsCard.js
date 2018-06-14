import React,{Component} from 'react';
import {Icon} from 'antd';
import './detailscard.css';
export default function(){
        let {checkPath,pathLine} = this.state;
        return (
            <div style={{display:this.state.goToStepTwo?"block":"none"}} className="wrap_detail">
                <div className="title_detail">
                    <span>漫游路径</span>
                    {/* <a href="javascript:;">&times;</a> */}
                </div>
                <div className="cont">
                    <img style = {{display:checkPath.length == 0?"inline-block":"none",width:"100%"}} src = {require('../../../images/nomessage.png')} />
                    <p style = {{display:checkPath.length == 0?"none":"block"}}>传送点:<span style = {{width:5,height:10,display:"inline-block"}}></span>起始位置<span style = {{width:5,height:10,display:"inline-block"}}></span><em>&rarr;</em><span style = {{width:5,height:10,display:"inline-block"}}></span>结束位置</p>
                    <div style = {{height:150,overflow:"auto",display:checkPath.length == 0?"none":"block"}}>
                        
                        {checkPath.map((item,index)=>{
                            return (
                                <p
                                    onClick = {()=>{
                                        pathLine.length = 0;
                                        pathLine.push({
                                            p1:item.initialPoint.position,
                                            p2:item.checkPortal.position,
                                            p3:item.checkCamera.position,
                                        })
                                        this.setState({pathLine})
                                    }}
                                 key = {index} className="item">
                                    <label>{item.checkPortalNum+1}:</label>
                                    <span style = {{width:5,height:10,display:"inline-block"}}></span>
                                    <label>{item.initialPoint.areaTypeShow}</label>
                                    <span style = {{width:2,height:10,display:"inline-block"}}></span>
                                    <em>&rarr;</em>
                                    <span style = {{width:2,height:10,display:"inline-block"}}></span>
                                    <label>{item.checkCamera.areaTypeShow}</label>
                                    <a onClick = {(e)=>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        this.deleteCheckPath(index);
                                        }} href="javascript:;"><Icon style = {{color:"#A7A7A7"}} type="delete" /></a>
                                </p>
                            )
                        })} 
                    </div>
                    {/* <p className="item">
                        <label>1号传送门</label>
                        <em>&rarr;</em>
                        <label>2号相机</label>
                        <a href="javascript:;">删除</a>
                    </p>
                    <p className="item">
                        <label>1号传送门</label>
                        <em>&rarr;</em>
                        <label>2号相机</label>
                        <a href="javascript:;">删除</a>
                    </p> */}
                    {/* <div className="ex">
                        <p className="item">
                            <label>选择门</label>
                            <em>&rarr;</em>
                            <label>照相机位</label>
                        </p>
                    </div>
                    <div className="btn">
                        <a href="javascript:;">确定</a>
                    </div> */}
                </div>
            </div>
        )
}