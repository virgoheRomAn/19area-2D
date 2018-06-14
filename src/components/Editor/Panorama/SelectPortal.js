import React, {Component} from 'react';
import {Select} from 'antd';
import './selectportal.css';
export default function() {
    let {selectPortal,cameras} = this.state;
    return (
        <div id = "selectportal" style = {{display:selectPortal.selectVisible?"block":"none",left:selectPortal.position.x,top:selectPortal.position.y}} className = "selectportal">
            <span>传送至：</span>
            <Select id = "selectportal" style={{ width: 100,}} onSelect={(value)=>{
                        this.selectportal(value);
                    }}>
                    
                    {cameras.map((item,index)=>{
                        return (
                            <Option key = {index} value={`${index}`}>{`${item.areaTypeShow}`}</Option>
                        )
                    })}
            </Select>
        </div>
    )
}