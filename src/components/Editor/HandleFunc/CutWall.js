import Utils from '../Utils';
//拖动画笔
export const HandleCutWall = function (selectWalls,callBack) {
  let { walls } = this.state;
  window.DEBUGGER_POINT = [];
  let result = {}; // 所有有交点的wall,key是wall的id,临时保存下来，因为不能在遍历的时候操作walls
  //删除重叠的墙，避免造成计算错误；
  walls.map((wall1,index1,arr1)=>{
    if(!!!wall1){
      return;
    }
    walls.map((wall2,index2,arr2)=>{
      if (wall1.id === wall2.id) { return; };
      if(Utils.judgePointInOneLine(wall1.p1,wall1.p2,wall2.p1) && Utils.judgePointInOneLine(wall1.p1,wall1.p2,wall2.p2)){
        delete arr2[index2];
      }
    })
  });
  walls = walls.filter((wall)=>{
    return wall != undefined;
  })



  //找到每面墙自己相交的墙和交点
  walls.forEach((wall1) => {
    let points = [];
    // console.log('\nwall1', wall1.id);
    walls.forEach((wall2) => {
      // console.log('wall2', wall2.id);
      //排除与自己相交 
      if (wall1.id === wall2.id) { return; }
      // debugger;
      let p = Utils.getIntersectionOfLineAndLine(wall1, wall2);
      // console.log('wallp', p);
      if (!!p.x && !!p.y || p.y === 0 || p.x === 0) {
        window.DEBUGGER_POINT.push(p);
        let offset1 = Utils.iSInside({ p1: wall1.p1, p2: wall1.p2 }, p);
        let offset2 = Utils.iSInside({ p1: wall2.p1, p2: wall2.p2 }, p);
        // console.log(wall1.p1, wall1.p2, wall2.p1, wall2.p2, offset1, offset2, p);
        //交点要在线段上
        // debugger;
        if (offset1 == 0 && offset2 == 0) {
          //交点要不是顶点，距离误差
          let flag = false;
          [wall1.p1, wall1.p2].forEach((pp) => {
            let distance = Utils.getDistance(pp, p);
            // debugger;
            if (distance <= 100) {
              flag = true;
            }
          });
          if (flag) { return }

          //20170818 水平线的交点的y应相等 
          if (wall1.p1.y == wall1.p2.y) {
            p.y = wall1.p2.y;
          }
          if (wall2.p1.y == wall2.p2.y) {
            p.y = wall2.p2.y;
          }
          //20170818 垂直线的交点的x应相等
          if (wall1.p1.x == wall1.p2.x) {
            p.x = wall1.p2.x;
          }
          if (wall2.p1.x == wall2.p2.x) {
            p.x = wall2.p2.x;
          }
          // debugger
          p.distance = Utils.getDistance(p, wall1.p1); //求出到p1 的距离，用于排序
          points.push(p);
    
        }
      }
    });
    //排除没有交点的
    if (points.length != 0) {
      //p1到p2方向把叫排序
      points.sort((a, b) => {
        return a.distance - b.distance;
      });
      result[wall1.id] = points;
    }
  });
  for (let key in result) {
    let wall = walls.find(x => x.id === key);
    let tempWalls = []; //用于记录根据当前墙新创建了的其它墙
    let points = result[key];
    //每个交点和前一个组成墙
    points.forEach((point, index) => {
      let p2;
      //如果是最后一个交点，那就和原墙的p2组成行墙
      if (index === points.length - 1) {
        p2 = { x: wall.p2.x, y: wall.p2.y };
      } else {
        // p2 = { x: Math.floor(points[index + 1].x), y: points[index + 1].y };
        p2 = { x: points[index + 1].x, y: points[index + 1].y };
      }
      let newWall = {
        id: Utils.generateKey(),
        p1: {
          x: point.x,
          y: point.y,
        },
        p2: p2,
        doors: [],
        selected: false
      };
      Object.assign(newWall, Utils.buildWall(newWall.p1, newWall.p2, this.WALL_WIDTH));
      if (newWall.distance <= 100) {
        //距离小于10的墙排除掉
        return;
      }
      walls.push(newWall);
      tempWalls.push(newWall);
    });
    //20170818 把门重新安放到对应的墙上(以起点计算，不考虑从门中间切断的情况)
    if (tempWalls.length > 0) {
      let doors = wall.doors;
      wall.doors = [];
      tempWalls.splice(0, 0, wall);
      let _points = [{
        distance: 0
      }].concat(points);
      doors.forEach((door) => {
        let distance = wall.distance * door.percent;
        for (let i = _points.length - 1; i >= 0; i--) {
          if (_points[i].distance < distance) {
            let _wall = tempWalls[i];
            door.wall = _wall;
            _wall.doors.push(door);
            door.percent = (distance - _points[i].distance) / _wall.distance;
            break;
          }
        }
      })
    }
    wall.p2 = { x: points[0].x, y: points[0].y };
    Object.assign(wall, Utils.buildWall(wall.p1, wall.p2, this.WALL_WIDTH));

  }

  this.setState({ walls },()=>{
    callBack && callBack();
  });
}