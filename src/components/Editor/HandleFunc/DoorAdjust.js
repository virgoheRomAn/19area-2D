import { message } from 'antd';
import Utils from '../Utils';
//拖动点调节
export const handleDoorAdjustStart = function (e, door, type) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
    e = this.eventWarp(e, true);
    door.selected = true;
    //单选
    if (door.selected) {
        let { walls, doors } = this.state;
        walls.forEach((wall) => { wall.selected = false });
        doors.forEach((door) => { door.selected = false });
        door.selected = true;
    }
    // console.log('handleDoorAdjustStart');
    this.selectDoors = [{ door: door, type: type }];
    this.pStart = this.pEnd = {
        x: e.pageX,
        y: e.pageY,
    };
    document.addEventListener('mousemove', this.handleDoorAdjustMove);
    document.addEventListener('mouseup', this.handleDoorAdjustEnd);
    // this.setState({});
}

export const handleDoorAdjustMove = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e, true);
    if (!this.selectDoors) { return }

    this.pEnd = {
        x: e.pageX,
        y: e.pageY,
    };

    this.selectDoors.forEach((item) => {
        let { door, type } = item;
        let typeReverse = { p2: 'p1', p1: 'p2' }[type];
        let wall = door.wall;
        let width = Utils.getDistance(this.pEnd, door[typeReverse]);
        let percent = door.percent;
        // if (width > 2000) {
        //     // message.error("墙不能超过2000mm");
        //     return;
        // }
        if (type == 'p1') {
            //起点是定位点，需要修复位置
            percent -= (width - door.width) / wall.distance;
        }
        let p = Utils.getLinePercentDot(wall.p1, wall.p2, percent);
        let vertex = Utils.getNewVertex(wall.p1, p, Utils.getDistance(wall.p1, p) + width);
        if (type == 'p1') {
            if ((percent <= 0 || percent * wall.distance < (100+wall.moverange.p1l))) {
                // percent = 15 / wall.distance;
                console.log('return up');
                return;
            }
        } else {
            if ((wall.distance - width - percent * wall.distance) < (100+wall.moverange.p2r)) {
                console.log('return down');
                return;
            }
        }
        Object.assign(door, {
            p1: p,
            p2: vertex
        });
        door.width = width;
        door.percent = percent;
        Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH));

        let jsx = this.getDoorJSX(door, door.wall.doors.findIndex(x => x === door));
        let el_door = document.getElementById(door.uid);
        let el_temp = document.getElementById(door.uid + 'temp');
        if (!el_temp) {
            el_temp = this.createSvgTag('g');
            el_temp.setAttribute("id", door.uid + 'temp');
            el_door.parentNode.insertBefore(el_temp, el_door);
            el_door.style.visibility = 'hidden';
            // debugger;
        }
        el_temp.innerHTML = this.jsx2ele(jsx).innerHTML;
    });

    this.pStart = this.pEnd;
    // this.setState({});
}
export const handleDoorAdjustEnd = function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.selectDoors.map((item) => {
        let { door } = item;
        let el_door = document.getElementById(door.uid);
        el_door.style.visibility = 'inherit';
        let el_temp = document.getElementById(door.uid + 'temp');
        el_temp && (el_temp.parentNode.removeChild(el_temp));
    });

    this.pStart = this.pEnd = null;
    document.removeEventListener('mousemove', this.handleDoorAdjustMove);
    document.removeEventListener('mouseup', this.handleDoorAdjustEnd);
    this.setState({});
}
export const handleLORchange = function (e, index, ) {
    e = e || event;
    e.stopPropagation();
    e.preventDefault();
    let inds = this.state.doors;
    inds[index].lr = this.state.doors[index].lr == 0 ? 1 : 0;

    this.setState({ doors: inds })
    // console.log(this.state);

}
export const handleTOBchange = function (e, index) {
    e = e || event;
    e.stopPropagation();
    e.preventDefault();
    let inds = this.state.doors;
    inds[index].ud = this.state.doors[index].ud == 0 ? 1 : 0;
    this.setState({ doors: inds })
    // console.log(this.state);
}
//点击后改变样式
export const handleChangeStyleRec = function (num1, n1) {
    if (num1 == n1) {
        return "#555"
    } else {
        return "#000"
    }
}
export const handleChangeStyleTriangle = function (num1, n1) {
    if (num1 == n1) {
        return "#fff"
    } else {
        return "#000"
    }
}


//移动调节
export const handleDoorMoveStart = function (wall, door, e) {
    // console.log('handleDoorMoveStart');
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e, true);
    this.selectDoors = [door];
    this.pStart = this.pEnd = {
        x: e.pageX,
        y: e.pageY,
    };
    this.isMoved = false;
    document.addEventListener('mousemove', this.handleDoorMoveMove);
    document.addEventListener('mouseup', this.handleDoorMoveEnd);
    // this.setState({});
}

export const handleDoorMoveMove = function (e) {
    // console.log('handleDoorMoveMove');
    this.isMoved = true;
    e = this.eventWarp(e, true);
    this.pEnd = {
        x: e.pageX,
        y: e.pageY,
    };
    //调整门
    this.selectDoors.map((door) => {
        door.selected = true;
        //单选
        if (door.selected) {
            let { walls, doors } = this.state;
            walls.forEach((wall) => { wall.selected = false });
            doors.forEach((door) => { door.selected = false });
            door.selected = true;
        }
        let wall = door.wall;
        let moveDistance = Utils.getMoveDistance(door, this.pStart, this.pEnd);
        let offsetPercet = moveDistance / wall.distance;
        let percent = door.percent + offsetPercet;
        //两边必须保证至少留出 10个单位
        if (offsetPercet < 0 && (percent <= 0 || percent * wall.distance <= (100+wall.moverange.p1l))) {
            // percent = 15 / wall.distance;
            console.log('return up');
            return;
        }
        let p = Utils.getLinePercentDot(wall.p1, wall.p2, percent);
        let vertex = Utils.getNewVertex(wall.p1, p, Utils.getDistance(wall.p1, p) + door.width);

        if (offsetPercet > 0 && (wall.distance - Utils.getDistance(p, vertex) - percent * wall.distance) <= (100+wall.moverange.p2r)) {
            console.log('return down');
            return;
        }
        door.percent = percent;
        Object.assign(door, {
            p1: p,
            p2: vertex
        });
        Object.assign(door, Utils.buildDoor(door, this.WALL_WIDTH));

        let jsx = this.getDoorJSX(door, door.wall.doors.findIndex(x => x === door));
        let el_door = document.getElementById(door.uid);
        let el_temp = document.getElementById(door.uid + 'temp');
        if (!el_temp) {
            el_temp = this.createSvgTag('g');
            el_temp.setAttribute("id", door.uid + 'temp');
            el_temp.style.pointerEvents
            el_door.parentNode.insertBefore(el_temp, el_door);
            el_door.style.visibility = 'hidden';
            // debugger;
        }
        el_temp.innerHTML = this.jsx2ele(jsx).innerHTML;
    });

    this.pStart = this.pEnd;
    // this.setState({});
}
export const handleDoorMoveEnd = function (e) {
    console.log('handleDoorMoveEnd');
    if (!this.isMoved) {
        this.selectDoors.map((door) => {
            door.selected = !door.selected;
            //单选
            if (door.selected) {
                let { walls, doors } = this.state;
                walls.forEach((wall) => { wall.selected = false });
                doors.forEach((door) => { door.selected = false });
                door.selected = true;
            }
        });
    }

    this.selectDoors.map((door) => {
        let el_door = document.getElementById(door.uid);
        el_door.style.visibility = 'inherit';
        let el_temp = document.getElementById(door.uid + 'temp');
        el_temp && (el_temp.parentNode.removeChild(el_temp));
    });
    this.setState({},()=>{
        window.isChanged = true;
        if(!!window.BootParams['--takePicture']){
            window.isChanged = false;
        }
    });
    document.removeEventListener('mousemove', this.handleDoorMoveMove);
    document.removeEventListener('mouseup', this.handleDoorMoveEnd);
}