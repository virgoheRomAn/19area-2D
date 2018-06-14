import triangulation from './Triangulation';
let idCount = 0;
export const generateKey = function () {
  idCount++;
  return `id_${idCount}_${Date.now()}`;
  // return parseInt(Date.now() + Math.random() * 100000000).toString(36);

}


//求两点之间直线距离
export const getDistance = function (p1, p2) {
  let result = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
  return result;
}
export const getRoate = function (p1, p2) {
  let offsetX = (p2.x - p1.x);
  let offsetY = (p2.y - p1.y);
  let k = offsetY / offsetX;  //斜率
  // console.log(offsetX, offsetY, k);
  let t = Math.atan(k) * 180 / Math.PI;//斜率对应的角度

  //修正象限
  (offsetX >= 0 && offsetY >= 0) && (t = t); //0-90°
  (offsetX < 0 && offsetY >= 0) && (t = 180 + t); //90-180°
  (offsetX < 0 && offsetY < 0) && (t = 180 + t); //180-270°
  (offsetX >= 0 && offsetY < 0) && (t = 360 + t); //270-0°
  t = Math.trunc(t * 10) / 10;
  return t;
}
window.getRoate = getRoate;
//根据两个中线点和半径求出其余4个点
export const getPoint = function (p1, p2, r) {
  let offsetX = (p2.x - p1.x);
  let offsetY = (p2.y - p1.y);
  let k = offsetY / offsetX;  //斜率
  // console.log(offsetX, offsetY, k);
  let t = Math.atan(k) * 180 / Math.PI;//斜率对应的角度

  //修正象限
  // console.log(t);
  (offsetX >= 0 && offsetY >= 0) && (t = t); //0-90°
  (offsetX < 0 && offsetY >= 0) && (t = 180 + t); //90-180°
  (offsetX < 0 && offsetY < 0) && (t = 180 + t); //180-270°
  (offsetX >= 0 && offsetY < 0) && (t = 360 + t); //270-0°
  // console.log(t);
  t += 90; //求垂直直线的角度
  // console.log(t, 'd');
  //求直线 与(p1为圆心,r为半径的圆)的交点
  let p11 = {
    x: Math.trunc(p1.x + r * Math.cos(t * Math.PI / 180)),
    y: Math.trunc(p1.y + r * Math.sin(t * Math.PI / 180))
  }
  let p12 = {
    x: Math.trunc(p1.x + r * Math.cos((t + 180) * Math.PI / 180)),
    y: Math.trunc(p1.y + r * Math.sin((t + 180) * Math.PI / 180))
  }

  let p21 = {
    x: Math.trunc(p2.x + r * Math.cos(t * Math.PI / 180)),
    y: Math.trunc(p2.y + r * Math.sin(t * Math.PI / 180))
  }
  let p22 = {
    x: Math.trunc(p2.x + r * Math.cos((t + 180) * Math.PI / 180)),
    y: Math.trunc(p2.y + r * Math.sin((t + 180) * Math.PI / 180))
  }
  //外部定位点,从p1往p2位置旋转
  let offset = r;//点距边的距离
  let p31 = {
    x: Math.trunc(p1.x - (r + offset) * Math.cos(t * Math.PI / 180)),
    y: Math.trunc(p1.y - (r + offset) * Math.sin(t * Math.PI / 180))
  }
  let p32 = {
    x: Math.trunc(p2.x - (r + offset) * Math.cos(t * Math.PI / 180)),
    y: Math.trunc(p2.y - (r + offset) * Math.sin(t * Math.PI / 180))
  }
  let p33 = {
    x: Math.trunc(p2.x + (r + offset) * Math.cos(t * Math.PI / 180)),
    y: Math.trunc(p2.y + (r + offset) * Math.sin(t * Math.PI / 180))
  }
  let p34 = {
    x: Math.trunc(p1.x + (r + offset) * Math.cos(t * Math.PI / 180)),
    y: Math.trunc(p1.y + (r + offset) * Math.sin(t * Math.PI / 180))
  }
  return { p11, p12, p21, p22, p31, p32, p33, p34 };
}

//通过矩形中线点，计算其它属性
export const buildWall = function (p1, p2, width) {
  p1.x = Math.round(p1.x);
  p1.y = Math.round(p1.y);
  p2.x = Math.round(p2.x);
  p2.y = Math.round(p2.y);
  let { p11, p12, p21, p22, p31, p32, p33, p34 } = getPoint(p1, p2, width / 2);
  // if(getRoate(p1, p2)%180 == 90){
  //   p1.x = p2.x;
  //   p11.x = p21.x;
  //   p12.x = p22.x;
  //   p11.y = p1.y;
  //   p12.y = p1.y;
  //   p21.y = p2.y;
  //   p22.y = p2.y;
  // }
  // if(getRoate(p1, p2)%180 == 0){
  //   p1.y = p2.y;
  //   p11.y = p21.y;
  //   p12.y = p22.y;
  //   p11.x = p1.x;
  //   p12.x = p1.x;
  //   p21.x = p2.x;
  //   p22.x = p2.x;
  // }
  return {
    p1, p2,
    p11, p12, p21, p22, p31, p32, p33, p34,
    distance: getDistance(p1, p2),
    roate: getRoate(p1, p2),
    p11c: null, p12c: null, p21c: null, p22c: null, moverange: null, mainWall: false, ceilid: []

  };
}
export const buildFurnitures = function (p1, p2, width) {
  p1.x = Math.round(p1.x);
  p1.y = Math.round(p1.y);
  p2.x = Math.round(p2.x);
  p2.y = Math.round(p2.y);
  let { p11, p12, p21, p22, p31, p32, p33, p34 } = getPoint(p1, p2, width / 2);
  return {
    p1, p2, p11, p12, p21, p22, p31, p32, p33, p34
  }
}
//通过矩形中线点，计算其它属性
export const buildDoor = function (door, width) {
  let result = buildWall(door.p1, door.p2, width);
  let points = getPoint(door.p1, door.p2, result.distance);
  let angle = getRoate(door.p1, door.p2);
  result['p13'] = points['p11'];
  result['p14'] = points['p12'];
  result['p23'] = points['p21'];
  result['p24'] = points['p22'];
  let point = getPoint(door.p1, {
    x: (door.p2.x - door.p1.x) / 2 + door.p1.x,
    y: (door.p2.y - door.p1.y) / 2 + door.p1.y
  }, 500);
  result['p41'] = point['p21'];
  result['p42'] = point['p22']

  result["angle"] = angle;
  result["menuL"] = 0;
  result["menuT"] = 0;
  result["showmenu"] = false;

  // console.dir(result)
  return result;
}
//点p在线段line 的延长线上，求点p离线段line的最短距离
export const iSInside = function (line, p) {
  let lengthLine = getDistance(line.p1, line.p2);
  let lengthP1 = getDistance(line.p1, p);
  let lengthP2 = getDistance(line.p2, p);

  let offset = (lengthP1 + lengthP2) - lengthLine;

  //距离计算有可能出现误差
  if (offset < 50) {
    offset = 0;
  }

  if (isNaN(offset)) {
    // debugger;
    // console.warn("warn");
  }

  //如果点在线外，取其较小值
  if (offset != 0) {
    return lengthP1 < lengthP2 ? lengthP1 : lengthP2;
  }
  return offset;
}
//获取点到线段的垂线与线段的交点；
export const getIntersectionOfLineAndDot = function (line1, p) {

  let k1 = (line1.p2.y - line1.p1.y) / (line1.p2.x - line1.p1.x);
  if (Math.abs(k1) == Infinity) { k1 = Infinity }
  let b1 = line1.p1.y - k1 * line1.p1.x;
  let k2 = -1 / k1;
  let b2 = p.y - k2 * p.x;
  let x, y;
  // debugger;
  if (k1 == Infinity && k2 == Infinity) {
    if (line1.p1.x == p1.x) {
      //TODO 斜率位置都相等怎么办
    } else {
      x = line1.p1.x;
      y = k2 * x + b2;
    }
  } else if (k1 == Infinity) {
    x = line1.p1.x;
    y = k2 * x + b2;
  } else if (k2 == Infinity) {
    x = p.x;
    y = k1 * x + b1;
  } else {
    x = (b1 - b2) / (k2 - k1);
    y = k1 * x + b1;
  }
  return { x: Math.round(x), y: Math.round(y) };
}
//求两条直线的交点
export const getIntersectionOfLineAndLine = function (line1, line2) {
  let k1 = (line1.p2.y - line1.p1.y) / (line1.p2.x - line1.p1.x);
  if (Math.abs(k1) == Infinity) { k1 = Infinity }
  let b1 = line1.p1.y - k1 * line1.p1.x;

  let k2 = (line2.p2.y - line2.p1.y) / (line2.p2.x - line2.p1.x);
  if (Math.abs(k2) == Infinity) { k2 = Infinity }
  let b2 = line2.p1.y - k2 * line2.p1.x;
  let x, y;

  if (k1 == 0 && k2 == 0) {
    //TODO 斜率位置都相等怎么办
    if (Math.abs(line1.p1.y - line2.p1.y) < 500) {
      if (Math.abs(line1.p1.x - line2.p1.x) <= 200 || Math.abs(line1.p2.x - line2.p1.x) <= 200) {
        // debugger;
        return { x: line2.p1.x, y: line2.p1.y };
      } else if (Math.abs(line1.p1.x - line2.p2.x) <= 200 || Math.abs(line1.p2.x - line2.p2.x) <= 200) {
        // debugger;
        return { x: line2.p2.x, y: line2.p2.y };
      }
    }
    // debugger;
    return { x: null, y: null };

  } else {
    //其中一个斜率为0并不影响计算交点
  }
  // debugger;
  if (k1 == Infinity && k2 == Infinity) {
    //TODO 斜率位置都相等怎么办
    if (Math.abs(line1.p1.x == line2.p1.x) < 500) {
      if (Math.abs(line1.p1.y - line2.p1.y) <= 200 || Math.abs(line1.p2.y - line2.p1.y) <= 200) {
        return { x: line2.p1.x, y: line2.p1.y };
      } else if (Math.abs(line1.p1.y - line2.p2.y) <= 200 || Math.abs(line1.p2.y - line2.p2.y) <= 200) {
        return { x: line2.p2.x, y: line2.p2.y };
      }
    }
    return { x: null, y: null };

  } else if (k1 == Infinity) {
    x = line1.p1.x;
    y = k2 * x + b2;
  } else if (k2 == Infinity) {
    x = line2.p1.x;
    y = k1 * x + b1;
  } else {
    x = (b1 - b2) / (k2 - k1);
    y = k1 * x + b1;
  }
  // TODO如何表示他们是重合并平行的？
  if (isNaN(x) || isNaN(y)) {
    // debugger;
  }
  return { x: Math.round(x), y: Math.round(y) };
}
//求过圆心直线于圆的交点 circle(o,r)
export const getIntersectionOfCirleAndLine = function (circle, line) {
  //y = kx +b
  let k = line.k;
  let b = line.b;

  //(x+c)^2 + (y+d)^2 = r^2
  let c = -circle.x;
  let d = -circle.y;
  let r = circle.r;

  //解二元一次方程
  let A = 1 + k * k;
  let B = 2 * c + 2 * k * (b + d);
  let C = c * c + (b + d) * (b + d) - r * r;

  let p1 = {};
  p1.x = (-B + Math.sqrt(B * B - 4 * A * C)) / 2 * A;
  p1.y = k * p1.x + b;

  let p2 = {};
  p2.x = (-B - Math.sqrt(B * B - 4 * A * C)) / 2 * A;
  p2.y = k * p2.y + b;

  return { p1, p2 }
}
/**
 * 自动吸附后，求新的顶点的位置
 * A(x1,y1)...B(x2,y2)...C(x,y)
 * 已知点AB和距离|AC|,求C
 * */
export const getNewVertex = function (A, B, dAC) {
  let C = {};
  let dAB = getDistance(A, B);
  let ratio = (dAB / dAC);
  //
  if (dAB > dAC) {
    return Object.assign(C, B);
  }
  C = { x: (B.x - A.x + ratio * A.x) / ratio, y: (B.y - A.y + ratio * A.y) / ratio };
  // console.log(getDistance(A, C), dAC);
  return C;
}

//获点到直线的距离
//求出两条直线的斜截式 y=kx+b然后解方程
export const getDistanceOfDotToLine = function (dot, line) {
  let k1 = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);

  if (k1 == 0) {
    //水平线直接取y值
    return { distance: Math.abs(dot.y - line.p1.y) };
  } else if (k1 == Infinity) {
    //垂直线直接取x值
    return { distance: Math.abs(dot.x - line.p1.x) };
  }
  let b1 = line.p1.y - k1 * line.p1.x;
  let k2 = - 1 / k1; // 垂直直线，斜率乘积为-1
  let b2 = dot.y - k2 * dot.x;
  let p = {}; //两条垂直直线的交点
  p.x = (b2 - b1) / (k1 - k2);
  p.y = k2 * p.x + b2;

  let distance = 0;
  let distanceP1 = getDistance(dot, line.p1);
  let distanceP2 = getDistance(dot, line.p2);
  if (iSInside(line, p) != 0) {
    //如果交点不在线内,则点到直线的距离为点到两个端点的最小值
    distance = Math.min(distanceP1, distanceP2)
  } else {
    //点到垂点的距离
    distance = getDistance(p, dot);
  }
  return { distance, p, type: distanceP1 < distanceP2 ? 'p1' : 'p2' };
}

//获矩形到直线的距离
//矩形4个点到直线距离的最小值（家具吸附部分）
export const getDistanceOfRectToLine = function (rect, line) {
  //FIXME 如果直线与矩形相交，距离应该为0
  let points = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x, y: rect.y + rect.height },
    { x: rect.x + rect.width, y: rect.y + rect.height }
  ]
  let minResult = { distance: Infinity };
  points.forEach((p) => {
    let result = getDistanceOfDotToLine(p, line);
    if (result.distance < minResult.distance) {
      minResult = result;
    }
  });
  return minResult;
}

//获取一条直线上，距离起点一段距离的点
export const getLinePercentDot = function (start, end, percent) {
  return {
    x: start.x + (end.x - start.x) * percent,
    y: start.y + (end.y - start.y) * percent,
  }
};
//根据一点，角度，距离，求另一点的坐标；
export const getLineEndDot = function (start, angle, distance) {
  return {
    x: Math.round(start.x + Math.cos(angle * Math.PI / 180) * distance),
    y: Math.round(start.y + Math.sin(angle * Math.PI / 180) * distance)
  }
};


//判断墙(矩形)是否相交
export const isWallIntersection = function (wall1, wall2) {
  // debugger;
  //求出矩形的4条边
  let wall1lines = [
    [wall1.p11, wall1.p21], [wall1.p21, wall1.p22], [wall1.p22, wall1.p12], [wall1.p12, wall1.p11]
  ];
  let wall2lines = [
    [wall2.p11, wall2.p21], [wall2.p21, wall2.p22], [wall2.p22, wall2.p12], [wall2.p12, wall2.p11]
  ];
  //两两求交点，如果有一条相交(交点在线段上)就表示矩形相交。
  window.DEBUGGER_POINT = [];
  for (let i = 0; i < wall1lines.length; i++) {
    let line1 = {
      p1: wall1lines[i][0],
      p2: wall1lines[i][1]
    };

    for (let j = 0; j < wall2lines.length; j++) {
      let line2 = {
        p1: wall2lines[j][0],
        p2: wall2lines[j][1]
      };
      // debugger
      let p = getIntersectionOfLineAndLine(line1, line2);
      if (!p.x || !p.y) {
        continue;
      }
      let offsetLine1 = iSInside(line1, p);
      let offsetLine2 = iSInside(line2, p);
      // console.log(offsetLine1, offsetLine2);
      //两条线段(的延长线)相交，且交点在线段上
      if (offsetLine1 == 0 && offsetLine2 == 0) {
        // debugger;
        return true;
      }
    }
    // console.log('\n');
  }
  return false;
}

export const getMoveDistance = function (line, p1, p2) {
  // console.log(p1, p2);
  let offsetX = line.p2.x - line.p1.x;
  if (Math.abs(offsetX) <= 0.04) {
    offsetX = 0;
  }
  let offsetY = line.p2.y - line.p1.y;
  if (Math.abs(offsetY) <= 0.04) {
    offsetY = 0;
  }
  let k = offsetY / offsetX;

  let Roate = getRoate(line.p1, line.p2);
  Roate = Math.trunc((Roate + 720) % 360);
  if (Roate == 90 || Roate == 270) {
    k = Infinity
  }
  if (Roate == 0 || Roate == 180 || Roate == 360) {
    k = 0
  }
  // console.log('getMoveDistance', k);
  let b = line.p1.y - k * line.p1.x;
  if (Math.abs(k) == Infinity) {
    if (line.p1.y > line.p2.y) {
      console.log('up');
      return p1.y - p2.y;
    } else {
      console.log('down');
      return p2.y - p1.y;
    }

  } else if (k == 0) {
    if (line.p1.x > line.p2.x) {
      console.log('up');
      return p1.x - p2.x;
    } else {
      console.log('down');
      return p2.x - p1.x;
    }

  } else {

    // debugger;
    p1.y = k * p1.x + b;
    p2.y = k * p2.x + b;
    if (p1.x == p2.x && p1.y == p2.y) {
      return 0;
    }
    // debugger;
    let distance = getDistance(p1, p2);
    let newRoate = getRoate(p1, p2);
    newRoate = Math.trunc((newRoate + 720) % 360);
    if (Roate != newRoate) {
      distance = -distance;
    }
    return distance;
  }
}

export const getMidOffline = function (line) {
  return {
    x: line.p1.x + (line.p2.x - line.p1.x) / 2,
    y: line.p1.y + (line.p2.y - line.p1.y) / 2
  }
}

//按角度吸附到水平垂直 0° 90° 180° 270°
function getRoatePoint(p1, p2) {
  let roate = getRoate(p1, p2);
  let mod = roate % 90;
  if (mod === 0) {
    return p2;
  }
  //正负吸附5°
  let flag = false;
  if (mod < 5) {
    roate -= mod;
    flag = true;
    // console.log('roate-r', roate, );
  }
  if (mod > 85) {
    flag = true;
    roate += (90 - mod);
    // console.log('roate-r', roate, );
  }
  if (flag) {
    let distance = getDistance(p1, p2);
    let tempP = getLineEndDot(p1, roate, distance);
    //当线太长时，不在吸附5°，而是当和新点距离小于100的才吸附
    if (getDistance(tempP, p2) < 100) {
      p2 = tempP;
    }
  }
  return p2;
}

//根据一条直线，一个点，求出点距直线的最短距离的交点
export const getShortestPoint = function (point1, point2, p) {
  let a = p.x;
  let b = p.y;
  if (point2.x !== point1.x && point2.y !== point1.y) {
    let K = (point2.y - point1.y) / (point2.x - point1.x);
    let B1 = point1.y - K * point1.x;
    let B2 = p.y + p.x / K;
    return {
      x: Math.trunc((B2 - B1) * K / (K * K + 1)),
      y: Math.trunc((B2 - B1) * K / (K + 1 / K) + B1)
    }
  } else if (point2.x == point1.x) {
    /**
     * x=point1.x;
     * y=p.y
    */
    return {
      x: Math.trunc(point1.x),
      y: Math.trunc(p.y)
    }
  } else {
    return {
      x: Math.trunc(p.x),
      y: Math.trunc(point1.y)
    }
  }


}
//三个点在一条直线上，已知两点坐标和剩余点到其中一点的距离，求该点的坐标；bool(true):表示点两点内部
export const getDoorPutPoint = function (point1, point2, distance, bool) {
  let angle = getRoate(point1, point2);
  if (bool) {
    return {
      x: point2.x - Math.cos(angle * Math.PI / 180) * distance,
      y: point2.y - Math.sin(angle * Math.PI / 180) * distance
    }
  } else {
    return {
      x: point2.x + Math.cos(angle * Math.PI / 180) * distance,
      y: point2.y + Math.sin(angle * Math.PI / 180) * distance
    }
  }

}
//求最小p11c,p12c,p21c,p22c
export const getVerticalDistance = function (p11c, p12c, p21c, p22c, wall) {
  // let angle = getRoate(point1, point2);
  // if (bool) {
  //   return {
  //     x: point2.x - Math.cos(angle * Math.PI / 180) * distance,
  //     y: point2.y - Math.sin(angle * Math.PI / 180) * distance
  //   }
  // } else {
  //   return {
  //     x: point2.x + Math.cos(angle * Math.PI / 180) * distance,
  //     y: point2.y + Math.sin(angle * Math.PI / 180) * distance
  //   }
  // }
  //有p11c和p12c没有p21c和p22c的情况
  if (!!p11c && !!!p21c) {
    if (getDistance(p11c, wall.p21) > getDistance(p12c, wall.p22)) {
      return {
        p1l: getDistance(p12c, wall.p12),
        p2r: 0
      };
    } else {
      return {
        p1l: getDistance(p11c, wall.p11),
        p2r: 0
      };
    }
  }
  if (!!p21c && !!!p11c) {
    if (getDistance(p21c, wall.p11) > getDistance(p22c, wall.p12)) {
      return {
        p1l: 0,
        p2r: getDistance(p22c, wall.p22)
      };
    } else {
      return {
        p1l: 0,
        p2r: getDistance(p21c, wall.p21)
      };
    }
  }
  if (!!!p11c && !!!p21c) {
    return {
      p1l: 0,
      p2r: 0
    };;
  }
  if (!!p11c && !!p12c) {
    let p1l, p2r;
    if (getDistance(p11c, wall.p21) > getDistance(p12c, wall.p22)) {

      p1l = getDistance(p12c, wall.p12)
    } else {
      p1l = getDistance(p11c, wall.p11)
    }
    if (getDistance(p21c, wall.p11) > getDistance(p22c, wall.p12)) {
      p2r = getDistance(p22c, wall.p22)
    } else {
      p2r = getDistance(p21c, wall.p21)
    }
    return {
      p1l: p1l,
      p2r: p2r
    }
  }

}
//一点和一条直线，求点到直线的垂线和直线的交点是否在这条直线线上
export const judgePointInLine = function (p1, p2, point) {
  let shortPoint = getShortestPoint(p1, p2, point);
  if (getDistance(p1, shortPoint) + getDistance(p2, shortPoint) - getDistance(p1, p2) <= 1) {
    return true;
  } else {
    return false;
  }
}
//判断一个点是否在一条线段上
export const judgePointInOneLine = function (p1, p2, point) {
  let distance = getDistance(p1, p2);

  if (Math.abs(getDistance(p1, point) + getDistance(p2, point) - distance) <= 1) {
    return true;
  } else {
    return false;
  }
}

//判断两点是否在一条直线的同一侧
export const judgeTwoPointInLineIpsilateral = function (p1, p2, line) {
  let k = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
  if (Math.abs(k) == Infinity) {
    if ((p1.x - line.p1.x) * (p2.x - line.p1.x) > 0) {
      return true;
    } else {
      return false
    }
  }
  if (Math.abs(Math.trunc(k)) == 0) {
    if ((p1.y - line.p1.y) * (p2.y - line.p1.y) > 0) {
      return true;
    } else {
      return false;
    }
  }
  if ((p1.y - line.p1.y - k * (p1.x - line.p1.x)) * (p2.y - line.p1.y - k * (p2.x - line.p1.x)) > 0) {
    return true;
  } else {
    return false;
  }
}
//获取四个点的中间点
export const getCenterPoint = function (points) {
  let center = {
    x: 0, y: 0
  };
  points.forEach((point) => {
    center.x += point.x;
    center.y += point.y;
  });
  center.x /= points.length;
  center.y /= points.length;
  return center;
}
//求点围成图形的面积
export const getArea = function (points) {
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

  });
  let ciclePoints = triangulation.triangulateMain(pointsArea, edges);
  for (let i = 0; i < ciclePoints.length; i++) {
    let a = getDistance(points[ciclePoints[i][0]].p, points[ciclePoints[i][1]].p);
    let b = getDistance(points[ciclePoints[i][1]].p, points[ciclePoints[i][2]].p);
    let c = getDistance(points[ciclePoints[i][0]].p, points[ciclePoints[i][2]].p);
    let p = (a + b + c) / 2;
    let s = Math.sqrt(p * (p - a) * (p - b) * (p - c));
    area += s;
  }
  return area;
}
//获取水平竖直墙组成的封闭区域，缩小distance距离后分成了多个四边形的集合；
export const rotateThisRec = function (floor, percent) {
  let horizontalArr = [], verticalArr = [];
  var distance1, distance2;
  floor.points.map((item, index) => {
    if (item.wall.roate % 180 == 0) {
      horizontalArr.push(item);
    } else if (item.wall.roate % 180 == 90) {
      verticalArr.push(item);
    } else {
      horizontalArr = [];
      verticalArr = [];
      return;
    }
  });
  horizontalArr.sort(function (a, b) {
    return a.p.y - b.p.y;
  });
  let zongArr = [];
  horizontalArr.map(function (item1) {
    let obj = [];
    verticalArr.map(function (item2) {
      let point = getRecPoint(item1.wall, item2.wall);
      if (point) {
        obj.push(point);
      }
    });

    obj.sort(function (a, b) {
      return a.x - b.x;
    });
    zongArr.push(obj);
  });
  let c = 0;
  let sibianxing = [];
  let obj = [];
  zongArr.map((item, index, arr) => {
    // debugger;
    item.map((item1, index1, arr1) => {
      if (c == 0) {
        obj = [];
        if (index1 == arr1.length - 1) {
          return;
        }
      }
      if (index < arr.length - 1) {

        arr[index + 1].filter((item2, index2, arr2) => {
          if (Math.abs(item2.x - item1.x) < 2 && item2.y - item1.y > 200) {
            if (c == 1) {
              obj.push(item1, item2);
              sibianxing.push(obj);
              c = 0;
            } else {
              c = 1;
              obj.push(item1, item2);
              if (index1 < arr1.length - 1) {
                arr2.filter((item3, index3, arr3) => {
                  if (Math.abs(item3.x - arr1[index1 + 1].x) < 2 && item3.y - arr1[index1 + 1].y > 50) {
                    obj.push(arr1[index1 + 1], item3);
                    sibianxing.push(obj);
                    c = 0;
                  }
                })
              }
            }
          }
        })
      }

    });
  });
  let testRec = [];
  // debugger;
  sibianxing.map((item) => {
    distance1 = Math.abs(item[0].x - item[2].x) * (1 - percent) / 2;
    distance2 = Math.abs(item[0].y - item[1].y) * (1 - percent) / 2;
    testRec.push(getScaleRectangle(item, distance1, distance2))
  });
  // console.log(sibianxing);
  // console.log(testRec);
  return testRec;
}
//求水平直线和竖直线段的交点；
function getRecPoint(line1, line2) {
  if (((line2.p1.y >= line1.p1.y || line2.p1.y >= line1.p2.y) && (line2.p2.y <= line1.p1.y || line2.p2.y <= line1.p2.y)) || ((line2.p1.y <= line1.p1.y || line2.p1.y <= line1.p2.y) && (line2.p2.y >= line1.p1.y || line2.p2.y >= line1.p2.y))) {
    return { x: line2.p1.x, y: line1.p1.y };
  }
};
//四边形按distance缩小后的点集合；
function getScaleRectangle(arr, distance1, distance2) {
  let testArr = [];
  let p1 = {
    x: arr[0].x + distance1,
    y: arr[0].y + distance2
  };
  let p2 = {
    x: arr[1].x + distance1,
    y: arr[1].y - distance2
  };
  let p3 = {
    x: arr[2].x - distance1,
    y: arr[2].y + distance2,
  };
  let p4 = {
    x: arr[3].x - distance1,
    y: arr[3].y - distance2
  };
  testArr.push(p1, p2, p3, p4);
  return testArr;

}

//若点a大于点b,即点a在点b顺时针方向,返回true,否则返回false
function PointCmp(a, b, center) {
  if (a.x >= 0 && b.x < 0)
    return true;
  if (a.x == 0 && b.x == 0)
    return a.y > b.y;
  //向量OA和向量OB的叉积
  let det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
  if (det < 0)
    return true;
  if (det > 0)
    return false;
  //向量OA和向量OB共线，以距离判断大小
  let d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
  let d2 = (b.x - center.x) * (b.x - center.y) + (b.y - center.y) * (b.y - center.y);
  return d1 > d2;
}
/**
 * 顺时针重排所有点
 * @param {*} vPoints 
 * @author http://www.cnblogs.com/dwdxdy/p/3230156.html
 */
export const ClockwiseSortPoints = function (vPoints) {
  debugger;
  //计算重心
  let center = {};
  let x = 0, y = 0;
  for (let i = 0; i < vPoints.length; i++) {
    x += vPoints[i].x;
    y += vPoints[i].y;
  }
  center.x = ~~(x / vPoints.length);
  center.y = ~~(y / vPoints.length);

  //冒泡排序
  for (let i = 0; i < vPoints.length - 1; i++) {
    for (let j = 0; j < vPoints.length - i - 1; j++) {
      if (PointCmp(vPoints[j], vPoints[j + 1], center)) {
        var tmp = vPoints[j];
        vPoints[j] = vPoints[j + 1];
        vPoints[j + 1] = tmp;
      }
      console.table(vPoints)
    }
  }
}
/**
 * 检测点是否在多边形内
 * @param {*} checkPoint 
 * @param {*} polygonPoints 
 * @author https://blog.csdn.net/heyangyi_19940703/article/details/78606471
 */
export const isInPolygon = function (checkPoint, polygonPoints) {
  var counter = 0;
  var i;
  var xinters;
  var p1, p2;
  var pointCount = polygonPoints.length;
  p1 = polygonPoints[0];

  for (i = 1; i <= pointCount; i++) {
    p2 = polygonPoints[i % pointCount];
    if (
      checkPoint['x'] > Math.min(p1['x'], p2['x']) &&
      checkPoint['x'] <= Math.max(p1['x'], p2['x'])
    ) {
      if (checkPoint['y'] <= Math.max(p1['y'], p2['y'])) {
        if (p1['x'] != p2['x']) {
          xinters =
            (checkPoint['x'] - p1['x']) *
            (p2['y'] - p1['y']) /
            (p2['x'] - p1['x']) +
            p1['y'];
          if (p1['y'] == p2['y'] || checkPoint['y'] <= xinters) {
            counter++;
          }
        }
      }
    }
    p1 = p2;
  }
  // console.log("isInPolygon", counter % 2 == 0);
  if (counter % 2 == 0) {
    return false;
  } else {
    return true;
  }
}
/**贴花专用开始 */

//获取线段的中点
export const getLineCenter = function (line) {

}
//求平行线(只有水平或者垂直的line)
export const getParallelLine = function (olines, oline) {
  let lines = [];
  let center = { x: oline.p1.x + (oline.p2.x - oline.p1.x) / 2, y: oline.p1.y + (oline.p2.y - oline.p1.y) / 2 }
  olines.forEach((line) => {
    //目前只有垂直和水平线段
    if (line.isHorizontal == oline.isHorizontal) {
      let distance = line.isHorizontal ? (line.p1.x - oline.p1.x) : (line.p1.y - oline.p1.y);
      if (distance == 0) {
        return;
      }
      // 必须和oline的中点相交
      let intersection = Object.assign({}, center);
      if (line.isHorizontal) {
        intersection.x += distance;
      } else {
        intersection.y += distance;
      }
      if (iSInside(line, intersection)) {
        return;
      }
      lines.push({ line, distance });
    }
  });
  return lines;
}
//求一条线段两边最近的平行线段
export const getClosetParallelLine = function (olines, oline) {
  let parallelLines = getParallelLine(olines, oline);
  let minLeft = { distance: -Infinity }, minRight = { distance: Infinity };
  parallelLines.forEach((parallelLine) => {
    if (parallelLine.distance < 0) {
      //left
      if (parallelLine.distance > minLeft.distance) {
        minLeft = parallelLine;
      }
    } else {
      //right
      if (parallelLine.distance < minRight.distance) {
        minRight = parallelLine;
      }
    }
  })
  // console.table(parallelLines);
  let distanceLines = [];
  if (minLeft.distance != -Infinity) {
    let distanceLine = Object.assign({}, minLeft, {
      p1: { x: oline.p1.x + (oline.p2.x - oline.p1.x) / 2, y: oline.p1.y + (oline.p2.y - oline.p1.y) / 2 } //选择的线段的中点
    });
    let p2 = Object.assign({}, distanceLine.p1);
    oline.isHorizontal ? (p2.x += distanceLine.distance) : (p2.y += distanceLine.distance);
    distanceLine.p2 = p2;
    distanceLines.push(distanceLine);
  }
  if (minRight.distance != Infinity) {
    let distanceLine = Object.assign({}, minRight, {
      p1: { x: oline.p1.x + (oline.p2.x - oline.p1.x) / 2, y: oline.p1.y + (oline.p2.y - oline.p1.y) / 2 } //选择的线段的中点
    });
    let p2 = Object.assign({}, distanceLine.p1);
    oline.isHorizontal ? (p2.x += distanceLine.distance) : (p2.y += distanceLine.distance);
    distanceLine.p2 = p2;
    distanceLines.push(distanceLine);
  }
  return distanceLines;
};

//获取一个Shape 的 BoxRect 矩形的四边
export const getShapBoxRectLines = function (shape) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  shape.points.forEach((point) => {
    if (point.x < minX) { minX = point.x; }
    if (point.y < minY) { minY = point.y; }
    if (point.x > maxX) { maxX = point.x; }
    if (point.y > maxY) { maxY = point.y; }
  });
  let points = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ]
  return points.map((point, index) => {
    let nextIndex = index + 1;
    //最后一个特殊对待
    if (index === 3) {
      nextIndex = 0;
    }
    let line = { p1: { ...point }, p2: { ...points[nextIndex] } }
    let roate = getRoate(line.p1, line.p2);
    let isHorizontal = roate == 90 || roate == 270//是否垂直（树立）

    line.roate = roate;
    line.isHorizontal = isHorizontal;
    line.shape = shape;
    return line
  });
}
/**贴花专用结束 */

export default {
  generateKey,
  getPoint,
  getRoate,
  getDistance,
  getIntersectionOfLineAndDot,
  getIntersectionOfLineAndLine,
  getIntersectionOfCirleAndLine,
  iSInside,
  buildWall,
  buildDoor,
  getNewVertex,
  getDistanceOfDotToLine,
  getMoveDistance,
  getDistanceOfRectToLine,
  getLinePercentDot,
  isWallIntersection,
  getLineEndDot,
  getMidOffline,
  getRoatePoint,
  getShortestPoint,
  getVerticalDistance,
  getDoorPutPoint,
  buildFurnitures,
  judgePointInLine,
  judgeTwoPointInLineIpsilateral,
  getCenterPoint,
  judgePointInOneLine,
  getArea,
  rotateThisRec,
  getLineCenter,
  ClockwiseSortPoints,
  isInPolygon,
  getParallelLine,
  getClosetParallelLine,
  getShapBoxRectLines
}