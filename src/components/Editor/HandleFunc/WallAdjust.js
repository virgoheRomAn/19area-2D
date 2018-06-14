import Utils from '../Utils';
import CloseArea from '../CloseArea';
//拖动点调节
export const handleWallAdjustStart = function (e, item, type) {
    let { walls, doors, mouseType } = this.state;
    //如果现在是画笔状态，冒泡
    if (mouseType == 'brush') {
        return;
    }
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e);

    this.selectWalls = [{ wall: item, type: type }];

    //寻找重叠点
    // walls.forEach((wall) => {
    //     if (item.id == wall.id) { return }
    //     if (wall[type].x == wall.x && wall[type].y == wall.y) { this.selectWalls.push({ wall: wall, type: 'p1' }) }
    // });
    //把选择的墙置顶

    this.selectWalls.forEach((item) => {
        let index = walls.findIndex(x => x.id === item.wall.id);
        walls.splice(index, 1);
        walls.push(item.wall);
    });

    //20170811 清空选择，避免拖动卡顿
    walls.forEach((wall) => { wall.selected = false });
    doors.forEach((door) => { door.selected = false });

    this.setState({ walls });
    document.addEventListener('mousemove', this.handleWallAdjustMove);
    document.addEventListener('mouseup', this.handleWallAdjustEnd);


}
export const handleWallAdjustMove = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e);
    if (!this.selectWalls) { return }
    let { walls } = this.state;
    let AssistLine = [];
    // let intersections = [];
    this.selectWalls.forEach((item) => {
        let { wall, type } = item;
        let typeReverse = { p2: 'p1', p1: 'p2' }[type];
        // wall.changeIndex = wall.changeIndex+1;
        Object.assign(wall[type], Utils.getRoatePoint(wall[typeReverse], {
            x: e.pageX,
            y: e.pageY
        }));

        //这里不需要修正坐标误差
        // console.log()
        Object.assign(wall, Utils.buildWall(wall.p1, wall.p2, this.WALL_WIDTH));
        // console.log(wall);

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
            //20170811 不在自动选择门
            // door.selected = true; 
            Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH));
        });
        //如果和其它墙相交，需要做特殊处理(吸附)
        walls.forEach((wall2) => {
            if (wall2.id === wall.id) {
                return;
            }
            //求交点
            let intersection = Utils.getIntersectionOfLineAndLine(
                { p1: wall.p1, p2: wall.p2 },
                { p1: wall2.p1, p2: wall2.p2 }
            );
            if (!intersection.x || !intersection.y) {
                return;
            }
            //求交点到线段的距离
            let offset1 = Utils.iSInside({ p1: wall.p1, p2: wall.p2 }, intersection);
            let offset2 = Utils.iSInside({ p1: wall2.p1, p2: wall2.p2 }, intersection);
            // console.log('offset', offset1, offset2);
            if (offset1 == 0 && offset2 == 0 ) {
                //交点在线段上
                // intersections.push(intersection);
            } else if (offset1 <= 200 && offset2 <= 200) {
                //求相交点与墙点p1 p2的距离
                let distanceP1 = Utils.getDistance(wall2.p1, intersection);
                let distanceP2 = Utils.getDistance(wall2.p2, intersection);
                if (distanceP1 <= 200) {
                    // debugger
                    Object.assign(wall[type],
                        Utils.getNewVertex(
                            wall[typeReverse], wall2['p1'],
                            wall.distance
                        )
                    );
                    Object.assign(intersection, wall2['p1']);
                } else if (distanceP2 <= 200) {
                    // debugger
                    Object.assign(wall[type],
                        Utils.getNewVertex(
                            wall[typeReverse], wall2['p2'],
                            wall.distance
                        )
                    );
                    Object.assign(intersection, wall2['p2']);
                } else {
                    Object.assign(wall[type], { x: intersection.x, y: intersection.y, });
                }
                // intersections.push(intersection);
                Object.assign(wall, Utils.buildWall(wall.p1, wall.p2, this.WALL_WIDTH));
                //重新调整门相对位置
                wall.doors.forEach((door) => {
                    let p = Utils.getLinePercentDot(wall.p1, wall.p2, door.percent);
                    let distance = Utils.getDistance(wall.p1, p);
                    let vertex = Utils.getNewVertex(wall.p1, p, distance + door.width);
                    Object.assign(door, {
                        p1: p,
                        p2: vertex
                    });
                    Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH));
                });
            }
        });
        let jsx = this.getWallJSX(wall, walls.findIndex(x => x === wall));
        let el_wall = document.getElementById(wall.id);
        let el_temp = document.getElementById(wall.id + 'temp');
        if (!el_temp) {
            el_temp = this.createSvgTag('g');
            el_temp.setAttribute("id", wall.id + 'temp');
            el_wall.parentNode.insertBefore(el_temp, el_wall);
            el_wall.style.visibility = 'hidden';
            // debugger;
        }
        // console.log(jsx)
        // console.log(this.jsx2ele(jsx).innerHTML);
        el_temp.innerHTML = this.jsx2ele(jsx).innerHTML;
    })

    //根据相交点把墙拆分
    // this.HandleCutWall(this.selectWalls);
    //根据现有的墙，求出房间 
    // let pointsArray = CloseArea.getIntersectionPoint(walls);
    // let floors = CloseArea.getFloors(walls, pointsArray);


    // this.setState({ floors }, () => {
    //     this.hanlePatch(pointsArray);
    // });

    AssistLine = this.selectWalls.filter((item) => {
        let { wall, type } = item;
        return wall.roate % 90 < 0.01;
    }).map(item => item.wall);
    this.state.AssistLine = AssistLine;
    // this.setState({ walls, AssistLine });
    // this.setState({ walls,floors, AssistLine });
    this.reRnderAssistLine();

}
export const handleWallAdjustEnd = function (e) {
    e.stopPropagation();
    e.preventDefault();
    
    //根据相交点把墙拆分
    this.HandleCutWall(this.selectWalls,()=>{
        let { walls } = this.state;
        let pointsArray = CloseArea.getIntersectionPoint(walls);
        let floors = CloseArea.getFloors(walls, pointsArray);
         //TODO 如果他们的area和center一样，则把名称和id还原回去
        this.setState({ floors, AssistLine: [] }, () => {
            this.hanlePatch(pointsArray);
        });
    });
    //根据现有的墙，求出房间 
    
    this.selectWalls.forEach((item) => {
        let { wall } = item;
        let el_wall = document.getElementById(wall.id);
        if(!!el_wall){
            el_wall.style.visibility = 'inherit';
        }
        let el_temp = document.getElementById(wall.id + 'temp');
        el_temp && (el_temp.parentNode.removeChild(el_temp));
    });
    this.removeAssistLine();
    this.selectWalls = null;
    window.isChanged = true;
    if(!!window.BootParams['--takePicture']){
        window.isChanged = false;
    }
    document.removeEventListener('mousemove', this.handleWallAdjustMove);
    document.removeEventListener('mouseup', this.handleWallAdjustEnd);
}
/**
console.table(
    THIS.state.walls.map((wall) => {
        return {
            x1: wall.p1.x, y1: wall.p1.y,
            x2: wall.p2.x, y2: wall.p2.y
        }
    })
)
 */