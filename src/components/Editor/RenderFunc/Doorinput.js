import React from 'react';
import { message } from 'antd';
import Utils from '../Utils';
import CloseArea from '../CloseArea'
export default function (doors, viewBox) {
    if (!!!doors) {
        return;
    }
    let doorsFilter = doors.filter(x => x.selected);

    let handleFn = (e, index) => {
        if (e.target.value == "" || e.target.value < 0 || e.target.value == 0 || isNaN(e.target.value)) {
            return;
        }
        let door = doorsFilter[index];
        let wall = door.wall;
        let angle = Utils.getRoate(door.p1, door.p2);
        let width = parseInt(e.target.value);
        // if (width > 2000) {
        //     message.error("墙不能超过2000mm");
        //     return;
        // }
        let p2 = Utils.getLineEndDot(door.p1, angle, e.target.value);

        if ((wall.distance - width - door.percent * wall.distance) < 100) {
            console.log('return down');
            message.error("离墙必须大于100mm");
            return;
        }
        door.p2 = {
            x: Math.floor(p2.x),
            y: Math.floor(p2.y),
        }
        Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH));
        door.width = door.distance;


        this.setState({doors});
        e.target.style.display = "none"
    }
    let inputStylen = (item) => {
        return {
            display: "inline",
            position: "fixed",
            width: 40,
            border: '1px solid #00cccb',
            outline: "none",
            left: ((item.p34.x - item.p33.x) / 2 + item.p33.x - viewBox.x) / viewBox.scaleX - 20,
            top: ((item.p34.y - item.p33.y) / 2 + item.p33.y - viewBox.y) / viewBox.scaleY + 61
        }
    }
    // console.table(wallsFilter);
    return (
        doorsFilter.map((item, index) => {
            return (
                <input
                    key={index}
                    onKeyUp={(e) => {
                        if (e.keyCode == 13) {
                            handleFn(e, index);
                        }
                    }} onBlur={(e) => {
                        handleFn(e, index);
                    }} type="text" style={inputStylen(item)} defaultValue={Math.floor(item.distance)} />
            )
        })
    )
    // return (
    //         <input onKeyUp={(e)=>{
    //             if(e.keyCode==13){
    //                 handleFn(e,index);
    //             }
    //         }} onBlur={(e)=>{
    //                 handleFn(e,index);
    //         }} type="text" style={inputStylen} defaultValue={Math.floor(item.distance)}/>
    // )

}