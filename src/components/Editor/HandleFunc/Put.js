import { message } from 'antd';
import Utils from '../Utils';
import $ from "jquery";
//摆放物体
export const handlePutStart = function (e) {
    let { viewBox } = this.state;
    this.setState({
        putThing: Object.assign({}, e, {
            x: viewBox.x,
            y: viewBox.y,
            height: this.WALL_WIDTH
        })
    }, () => {
        document.addEventListener('mousemove', this.handlePutMove);
        $("#input_checkbox3").prop("checked",true);
        $(".door").css("display","inline");
    });

}

export const handlePutDown = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e)
    let { walls, doors, furnitures } = this.state;
    // let { wall, p, type } = this.minResult || {};



    let { putThing,wallHeight } = this.state;
    //右键取消
    if (e.button == 2) {

    } else {
        //放下
        // debugger;
        // if(putThing.modelHeight>wallHeight){
        //     putThing.modelHeight = wallHeight
        // }
        switch (putThing.type) {
            //门
            case 'door':
                let wall = walls.filter(x => x.selected);
                let comparePoint,compareDistance=[],minArr=[],doorIndex;
                wall.map(function(item,index){
                    let comparePoint=Utils.getShortestPoint(item.p1,item.p2,{x:e.pageX,y:e.pageY});
                    // console.log(comparePoint);
                    let distance=Utils.getDistance({x:e.pageX,y:e.pageY},comparePoint);
                        compareDistance.push(distance);
                })
                let minN=Math.min(...compareDistance);
                compareDistance.map((item,index)=>{
                    if(item==minN){
                        minArr.push(index);
                    }
                })
                minArr.map((item)=>{
                    let comparePoint=Utils.getShortestPoint(wall[item].p1,wall[item].p2,{x:e.pageX,y:e.pageY});
                    if(comparePoint.x>=Math.min(wall[item].p1.x,wall[item].p2.x) && comparePoint.x<=Math.max(wall[item].p1.x,wall[item].p2.x) && comparePoint.y>=Math.min(wall[item].p1.y,wall[item].p2.y) &&  comparePoint.y<=Math.max(wall[item].p1.y,wall[item].p2.y)){
                        doorIndex= item;
                    }
                })
                // let doorIndex=compareDistance.indexOf(Math.min.apply(this, compareDistance));
                // console.log(this.state)
                // console.log(doorIndex)
                // console.log(compareDistance)
                walls.forEach(x => x.selected = false);

                if (!wall) { message.error('请选择一面墙'); return; };

                //修复选择墙体的时候报错
                if (!wall.length) { message.warn('请放置在封闭区域内'); return; }

                if (wall[doorIndex].distance-wall[doorIndex].moverange.p2r-wall[doorIndex].moverange.p1l-200 < putThing.width) {
                    putThing.width = wall[doorIndex].distance-200-wall[doorIndex].moverange.p2r-wall[doorIndex].moverange.p1l;
                    message.info("门比墙长，修复接近墙的长度");
                }
                
                let p, vertex,centPoint,LORpoint,distance,percent;
                
                // let distance = wall.distance / 2 - putThing.width / 2;
                
                centPoint=Utils.getShortestPoint(wall[doorIndex].p1,wall[doorIndex].p2,{x:e.pageX,y:e.pageY});
                let p1Distance=Utils.getDistance(wall[doorIndex].p1,centPoint);
                let p2Distance=Utils.getDistance(wall[doorIndex].p2,centPoint);
                let getPOvertex=function(){
                    let pn = Utils.getDoorPutPoint(wall[doorIndex].p1,centPoint,putThing.width/2,true);
                    distance=Utils.getDistance(wall[doorIndex].p1,pn);
                    percent = distance / wall[doorIndex].distance;
                    p = Utils.getLinePercentDot(wall[doorIndex].p1, wall[doorIndex].p2, percent);
                    
                    // vertex = Utils.getNewVertex(wall.p1, p, distance + putThing.width);
                    vertex = Utils.getDoorPutPoint(wall[doorIndex].p1,centPoint,putThing.width/2,false)
                }
                if(p1Distance>p2Distance){
                    if(p2Distance<(putThing.width/2+wall[doorIndex].moverange.p2r)){
                        distance=wall[doorIndex].distance-putThing.width-wall[doorIndex].moverange.p2r-100;
                        percent=distance / wall[doorIndex].distance;
                        let lpercent = (wall[doorIndex].distance-wall[doorIndex].moverange.p2r-100)/wall[doorIndex].distance;
                        p = Utils.getLinePercentDot(wall[doorIndex].p1, wall[doorIndex].p2, percent);
                        // vertex = { x: wall[doorIndex].p2.x, y: wall[doorIndex].p2.y };
                        vertex = Utils.getLinePercentDot(wall[doorIndex].p1, wall[doorIndex].p2, lpercent);
                    }else{
                        getPOvertex();
                    }
                }else{
                    if(p1Distance<(putThing.width/2+wall[doorIndex].moverange.p1l)){
                        // percent=0.0025;
                        // distance=wall[doorIndex].distance*percent;
                        distance=100+wall[doorIndex].moverange.p1l;
                        percent = distance/wall[doorIndex].distance;
                        p = Utils.getLinePercentDot(wall[doorIndex].p1, wall[doorIndex].p2, percent);
                        // vertex=Utils.getDoorPutPoint(wall.p1,centPoint,putThing.width/2,false)
                        vertex = Utils.getNewVertex(wall[doorIndex].p1, p, distance + putThing.width);
                    }else{
                        getPOvertex();
                    }
                }

                
                // if (percent == 0) {
                //     p = { x: wall.p1.x, y: wall.p1.y };
                //     vertex = { x: wall.p2.x, y: wall.p2.y };
                // } else {
                //     p = Utils.getLinePercentDot(wall.p1, wall.p2, percent);
                    
                //     // vertex = Utils.getNewVertex(wall.p1, p, distance + putThing.width);
                //     vertex = Utils.getDoorPutPoint(wall.p1,centPoint,putThing.width/2,false)
                // }
                let door = Object.assign(putThing, {
                    uid: Utils.generateKey(),
                    percent: percent,
                    width: putThing.width,
                    height: wall[doorIndex].height,
                    p1: p,
                    p2: vertex,
                    lr: 0,
                    ud: 0
                })
                Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH));
                door.wall = wall[doorIndex];
                wall[doorIndex].doors.push(door);
                doors.push(door);
                break;
            case 'furniture':
                furnitures.push({
                    id: Utils.generateKey(),
                    x: e.pageX - putThing.width / 2,
                    y: e.pageY - putThing.height / 2,
                    height: putThing.height,
                    width: putThing.width,
                });

        }
    }

    this.setState({ putThing: null, walls, doors, },()=>{
        window.isChanged = true;
        if(!!window.BootParams['--takePicture']){
            window.isChanged = false;
        }
    });
    window.EM.emit("scale");
    window.EM.emit("scaleHead");
    document.removeEventListener('mousemove', this.handlePutMove);
}
export const handlePutMove = function (e) {
    e = this.eventWarp(e);
    let { putThing, walls } = this.state;
    putThing.x = e.pageX - putThing.width / 2;
    putThing.x =  Math.round(putThing.x);
    putThing.y = e.pageY - putThing.height / 2;
    putThing.y =  Math.round(putThing.y);
 
    let putThingRect = {
        p11: { x: putThing.x, y: putThing.y },
        p12: { x: putThing.x, y: putThing.y + putThing.height },
        p21: { x: putThing.x + putThing.width, y: putThing.y },
        p22: { x: putThing.x + putThing.width, y: putThing.y + putThing.height },
    }
    walls.forEach((wall, index) => {
        wall.selected = false;
        if (Utils.isWallIntersection(wall, putThingRect)) {
            wall.selected = true;
        }
    });
    this.setState({ putThing, walls });
}