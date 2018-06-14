import React from 'react';
import Utils from '../Utils';
import CloseArea from '../CloseArea'
export default function () {
    let { walls, viewBox } = this.state;
    let Inpindex = [];
    let wallsFilter = walls.filter(x => x.selected);

    let handleFn = (e, index) => {
        if (e.target.value == "" || e.target.value < 0 || e.target.value == 0 || isNaN(e.target.value)) {
            return;
        }
        e = e || window.event;
        let wall = wallsFilter[index];
        let angle = Utils.getRoate(wall.p1, wall.p2);
        let p2 = Utils.getLineEndDot(wall.p1, angle, e.target.value);
        wall.p2 = {
            x: Math.floor(p2.x),
            y: Math.floor(p2.y),
        }
        Object.assign(wall, Utils.buildWall(wall.p1, wall.p2, this.WALL_WIDTH));
        //重新调整门相对位置
        wall.doors.forEach((door) => {
            let p = Utils.getLinePercentDot(wall.p1, wall.p2, door.percent);
            let distance = Utils.getDistance(wall.p1, p);
            let vertex = Utils.getNewVertex(wall.p1, p, distance + door.width);
            Object.assign(door, {
                p1: p,
                p2: {
                    x: Math.floor(vertex.x),
                    y: Math.floor(vertex.y),
                }
            });
            door.selected = true;
            Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH));
        });

        this.setState({walls}, () => {
            let { walls } = this.state;
            //根据相交点把墙拆分
            this.HandleCutWall(this.selectWalls,()=>{
                //根据现有的墙，求出房间 
                let {walls} = this.state;
                let pointsArray = CloseArea.getIntersectionPoint(walls);
                let floors = CloseArea.getFloors(walls, pointsArray);
                 //TODO 如果他们的area和center一样，则把名称和id还原回去
                this.setState({ floors }, () => {
                    this.hanlePatch(pointsArray);
                });
            });
        });
        e.target.style.display = "none"
    }
    let inputStylen = (item) => {
        return {
            display: "inline",
            position: "fixed",
            width: 40,
            border: '1px solid #00cccb',
            outline: "none",
            left: ((item.p32.x - item.p31.x) / 2 + item.p31.x - viewBox.x) / viewBox.scaleX - 30,
            top: ((item.p32.y - item.p31.y) / 2 + item.p31.y - viewBox.y) / viewBox.scaleY + 61
        }
    }
    // console.table(wallsFilter);
    return (
        wallsFilter.map((item, index) => {
            return (
                <input
                    key={index}
                    onKeyUp={(e) => {
                        if (e.keyCode == 13) {
                            handleFn(e, index);
                        }
                    }} onBlur={(e) => {
                        handleFn(e, index);
                    }} type="number" style={inputStylen(item)} defaultValue={Math.floor(item.distance)} />
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