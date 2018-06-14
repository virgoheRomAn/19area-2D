import Utils from './Utils';
import triangulation from './Triangulation';
// console.time("calc");
// 创建复数
function complex(x, y) {
  if (y == null)
    y = 0;
  return { real: x, imag: y };
}
// 复数乘法
function complex_mul(x, y) {
  return complex(
    x.real * y.real - x.imag * y.imag,
    x.real * y.imag + x.imag * y.real
  );
}
// 复数|x|
function complex_scala(x) {
  return Math.sqrt(x.real * x.real + x.imag * x.imag);
}
// 复数求共轭
function complex_mirror(x) {
  return complex(x.real, -x.imag);
}
// 复数除法
function complex_div(x, y) {
  var t = complex_mul(x, complex_mirror(y));
  var n = x.real * x.real + x.imag * x.imag;
  return complex(t.real / n, t.imag / n);
}
// 求向量p逆时针旋转到向量q所需的弧度
function complex_counter_clock(p, q) {
  var t = complex_div(q, p);
  var l = complex_scala(t);
  var degree = Math.acos(t.real / l);
  var ans = t.imag >= 0 ? degree : Math.PI * 2 - degree;
  return ans
}

export const getPoiont = function (adj = tadj) {
  var is_single_point = [];  // 是否是叶子点或孤立点
  var been_start_point = [];  // 是否做过路径的起点
  var used_edge = {};  // 合法的圈已经占用的边向量
  var answer = [];  // 保存最终结果

  // 向量w->v是否可被使用
  function can_use_edge(w, v) {
    if (is_single_point[v])  // v是叶子点或孤立点则不能使用
      return false;
    if (used_edge[w + ',' + v])  // w->v已被占用则不能使用
      return false;
    return true;
  }

  // 找到点v，使得向量w->v与-y轴的夹角最小
  function find_runrise(w) {
    var points = adj[w].next.filter(k => can_use_edge(w, k))
    points.sort(function (a, b) {
      var d1 = complex_counter_clock(complex(0, -1),
        complex(adj[a].x - adj[w].x, adj[a].y - adj[w].y)
      );
      var d2 = complex_counter_clock(complex(0, -1),
        complex(adj[b].x - adj[w].x, adj[b].y - adj[w].y)
      );
      return d1 - d2;
    });
    return points;
  }

  // 找到点t，使得向量v->w到v->t顺时针旋转的角度最小
  function find_closewise_next(w, v, path) {
    var min_degree = 99999;
    var t = null;
    for (var k of adj[v].next) {
      if (!can_use_edge(v, k)) continue;  // 路径可用
      if (path.length <= 2 && k === path[0]) continue;  // 不能刚出发就返回
      if (path.indexOf(k) > 0) continue;  // 路径中的点不能再走
      var degree = complex_counter_clock(
        complex(adj[k].x - adj[v].x, adj[k].y - adj[v].y),
        complex(adj[w].x - adj[v].x, adj[w].y - adj[v].y)
      );
      if (degree < min_degree) {
        t = k; min_degree = degree;
      }
    }
    return t;
  }

  // 判断path代表的圈是否是逆时针旋转的，如果不是则不合法
  // 合法的path路径上向量不能再被其他路径使用
  function update_edge_by_path(path) {
    var path = path.slice(0);
    path.push(path[0]);
    var total_degree = 0;
    var p0 = complex(adj[path[1]].x - adj[path[0]].x, adj[path[1]].y - adj[path[0]].y);
    var p = p0;
    var df = function (degree) { return degree <= Math.PI ? degree : degree - 2 * Math.PI; }
    for (var i = 1; i < path.length - 1; i++) {
      var w = adj[path[i]];
      var v = adj[path[i + 1]];
      var q = complex(v.x - w.x, v.y - w.y);
      total_degree += df(complex_counter_clock(p, q));
      p = q;
    }
    total_degree += df(complex_counter_clock(p, p0));
    if (Math.abs(total_degree - Math.PI * 2) > 0.01)
      return false;
    for (var i = 0; i < path.length - 1; i++) {
      var w = path[i];
      var v = path[i + 1];
      used_edge[w + ',' + v] = 1;
    }
    return true;
  }

  // 标记所有的叶子点和孤立点
  for (var k in adj) {
    if (adj[k].next.length <= 1)
      is_single_point[k] = 1;
  }

  do {
    var w = -1;
    // 找出y坐标最小的点（y坐标一样则x坐标最小）
    for (var k in adj) {
      if (is_single_point[k] || been_start_point[k]) continue;
      if (w === -1) { w = k; continue }
      if (adj[k].y < adj[w].y || (adj[k].y == adj[w].y && adj[k].x < adj[w].x))
        w = k;
    }
    if (w === -1) break
    w = parseInt(w);  // w就是路径的起点
    been_start_point[w] = 1;  // 每个点只能考虑一次，直到所有点被考虑过就跳出循环

    for (var v of find_runrise(w)) {  // 找到w的下一个点v
      var path = [w];  // path保存路径
      path.push(v);
      var z = w;
      while (1) {
        var p = find_closewise_next(z, v, path);  // 找到v的下一个点p
        if (p === path[0]) {  // 如果回到原地则path是一个圈
          if (update_edge_by_path(path))  // 如果圈是逆时针的，就可以加入answer
            answer.push(path);
          break;
        } else if (p == null) {  // 找不到下一个合法点则放弃
          break;
        }
        path.push(p);
        z = v; v = p;
      }
    }
  } while (1);
  return answer;
};

function getIntersectionPoint(walls) {
  // 1:找到所有相等的点
  let pointsObj = {}; //以x_y 为key的map
  walls.forEach((item, wallIndex) => {
    [item.p1, item.p2].forEach((p, pindex) => {
      let px = Math.floor(p.x);
      px -= px % 50;
      let py = Math.floor(p.y);
      px -= py % 50;
      let key = `${px}_${py}`;

      if (!pointsObj[key]) {
        pointsObj[key] = [];
      }
      pointsObj[key].push({
        wallid: item.id,

        wallIndex: wallIndex,
        type: ['p1', 'p2'][pindex]
      });
    });
  });
  // 2:构建输入数据
  let pointsArray = [];
  //转换成数组
  for (var key in pointsObj) {
    let temp = key.split('_');
    let x = parseFloat(temp[0]), y = parseFloat(temp[1]);
    pointsArray.push({
      x: x,
      y: y,
      points: pointsObj[key],
    });
  }
  //找到每个点的连接点
  pointsArray.forEach((item1, index1) => {
    let next = [];
    item1.points.forEach((p1) => {
      pointsArray.forEach((item2, index2) => {
        for (let i = 0; i < item2.points.length; i++) {
          if (item2.points[i].wallid === p1.wallid && item2.points[i].type != p1.type) {
            next.push(index2);
            break;
          }
        }
      });
    });
    item1.next = next;
  })
  // console.table(pointsArray);
  // console.log(JSON.stringify(pointsArray, (key, value) => {
  //   if (key == 'points') {
  //     return null;
  //   }
  //   return value;
  // }, 2));
  return pointsArray
}
function getFloors(walls, pointsArray) {
  console.log('getFloors');
  let floors = getPoiont(pointsArray);
  // 3:输出可以渲染的数据
  // console.table(floors);
  function findWall(index1, index2) {
    for (let i = 0; i < pointsArray[index1].points.length; i++) {
      for (let j = 0; j < pointsArray[index2].points.length; j++) {
        if (pointsArray[index1].points[i].wallid == pointsArray[index2].points[j].wallid) {
          return pointsArray[index1].points[i].wallid;
        }
      }
    }
  }
  floors = floors.map((floor) => {
    let points = [];
    let index1 = floor[0];
    let index2 = floor.pop();
    let onx = pointsArray[index1]["points"][0]["type"];
    points.push({
      p: walls[pointsArray[index1]["points"][0]["wallIndex"]][onx],
      wall: walls.find(x => x.id === findWall(index1, index2))
    });
    while (true) {
      index1 = index2;
      index2 = floor.pop();
      if (index2 === undefined) {
        break;
      }
      let onx = pointsArray[index1]["points"][0]["type"];
      points.push({
        p: walls[pointsArray[index1]["points"][0]["wallIndex"]][onx],
        wall: walls.find(x => x.id === findWall(index1, index2))
      });
    }

    //求中心点
    let center = {
      x: 0, y: 0
    };
    points.forEach((point) => {
      center.x += point.p.x;
      center.y += point.p.y;
    });
    center.x /= points.length;
    center.y /= points.length;

    //求面积
    let pointsArea = [];
    let edges = [];
    let area = 0;
    points.map(function (item, index) {
      pointsArea.push([item.p.x, item.p.y]);
      if (index != points.length - 1) {
        edges.push([index, index + 1])
      } else {
        edges.push([index, 0])
      }

    })
    // console.log(pointsArea);
    // console.log(edges);
    let ciclePoints = triangulation.triangulateMain(pointsArea, edges);
    for (let i = 0; i < ciclePoints.length; i++) {
      let a = Utils.getDistance(points[ciclePoints[i][0]].p, points[ciclePoints[i][1]].p);
      let b = Utils.getDistance(points[ciclePoints[i][1]].p, points[ciclePoints[i][2]].p);
      let c = Utils.getDistance(points[ciclePoints[i][0]].p, points[ciclePoints[i][2]].p);
      let p = (a + b + c) / 2;
      let s = Math.sqrt(p * (p - a) * (p - b) * (p - c));
      area += s;
    }
    // console.log(area);
    // debugger;
    // console.log(Utils.getArea(points))
    // debugger;


    /*for (let i = 1; i < points.length - 1; i++) {
      let a = Utils.getDistance(points[0].p, points[i].p);
      let b = Utils.getDistance(points[i].p, points[i + 1].p);
      let c = Utils.getDistance(points[i + 1].p, points[0].p);
      let p = (a + b + c) / 2;
      let s = Math.sqrt(p * (p - a) * (p - b) * (p - c));
      // console.log(a,b,c,p,s);
      area += s;
      //S=(1/2)*(x1y2+x2y3+x3y1-x1y3-x2y1-x3y2);
      // area += Math.abs(1 / 2 * (points[0].p.x * points[i].p.y + points[i].p.x * points[i + 1].p.y + points[i + 1].p.x * points[0].p.y - points[0].p.x * points[i + 1].p.y - points[i].p.x * points[0].p.y - points[i + 1].p.x * points[i].p.y));
    }
    */
    return {
      points: points,
      center: center,
      area: area,
      areaShow: false,
      areaType: "未命名",
      cardPosition: { x: 0, y: 0 },
      userDefined: false,
      floorId: Math.ceil(Math.random() * 100) + "" + area

    };
  });
  // console.table(floors);
  // console.table(floors.map(x => x.points.map(x => x.wall.id)));
  return floors;

}
export default {
  getIntersectionPoint,
  getFloors
}