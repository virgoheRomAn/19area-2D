import Utils from '../Utils';
//根据起点和方向有点。
const NUMS = {
  'p1left': 1,
  'p1right': 2,
  'p2left': 2,
  'p2right': 1
}
//相交墙的补丁
export const hanlePatch = function (pointsArray) {
  // console.table(pointsArray);
  let { walls } = this.state;
  walls.forEach((wall) => {
    Object.assign(wall, {
      p11c: null,
      p12c: null,
      p21c: null,
      p22c: null,
    });
  })
  pointsArray = pointsArray.filter((item) => {
    if (item.points.length == 1) {
      return false;
    }
    item.points.forEach((point) => {
      point.typeReverse = { p2: 'p1', p1: 'p2' }[point.type];
      point.wall = walls.find(x => x.id === point.wallid);
      point.r = Utils.getRoate(point.wall[point.type], point.wall[point.typeReverse]);
    });
    item.points.sort((a, b) => {
      return a.r - b.r;
    });
    return true;
  });
  // console.table(pointsArray);
  window.DEBUGGER_POINT = [];
  pointsArray.forEach((item) => {
    let loop = [];
    item.points.forEach((point) => {
      loop.push(Object.assign({}, point, { dir: 'right' }));
      loop.push(Object.assign({}, point, { dir: 'left' }));
    })
    // console.table(loop);
    for (let i = 1; i < loop.length; i++) {
      let current = loop[i];
      let next = loop[(i + 1) % loop.length];
      if (current.wall == next.wall) {
        continue;
      }
      let currentNum = NUMS[current.type + current.dir];
      let nextNum = NUMS[next.type + next.dir];
      let intersection = Utils.getIntersectionOfLineAndLine({
        p1: current.wall[current.typeReverse + currentNum],
        p2: current.wall[current.type + currentNum],
      }, {
          p1: next.wall[next.typeReverse + nextNum],
          p2: next.wall[next.type + nextNum]
        }
      );
      if (!intersection.x || !intersection.y) {
        continue;
      }
      current.wall[current.type + currentNum + 'c'] = { x: intersection.x, y: intersection.y };
      next.wall[next.type + nextNum + 'c'] = { x: intersection.x, y: intersection.y };

      // window.DEBUGGER_POINT.push(intersection);
    }
  });
  //选点优化；
  walls.map((wall)=>{
    wall.moverange = Utils.getVerticalDistance(wall.p11c,wall.p12c,wall.p21c,wall.p22c,wall);
    
     
      if(!!wall.p11c){
        if(!Utils.judgePointInOneLine(wall.p11,wall.p21,wall.p11c)){
          if(Utils.getDistance(wall.p1,wall.p11c)>300){
            wall.p11c = wall.p11;
          }
        }
      }
      if(!!wall.p21c){
        if(!Utils.judgePointInOneLine(wall.p11,wall.p21,wall.p21c)){
          if(Utils.getDistance(wall.p2,wall.p21c)>300){
            wall.p21c = wall.p21;
          }
        }
      }
      if(!!wall.p12c){
        if(!Utils.judgePointInOneLine(wall.p12,wall.p22,wall.p12c)){
          if(Utils.getDistance(wall.p1,wall.p12c)>300){
            wall.p12c = wall.p12;
          }
        }
      }
      if(!!wall.p22c){
        if(!Utils.judgePointInOneLine(wall.p12,wall.p22,wall.p22c)){
          if(Utils.getDistance(wall.p2,wall.p22c)>300){
            wall.p22c = wall.p22;
          }
        }
      }
  })
  this.setState({});
}