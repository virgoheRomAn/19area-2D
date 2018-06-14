import React from 'react';
import Utils from '../Utils';
import mPng from '../../../images/method_icon.png'
//门(根据传入的数据画门)

export const getDoorJSX_360 = function (door, doorindex) {
  let { p1, p2, p11, p12, p13, p14, p21, p22, p23, p24, p31, p32, p33, p34, p41, p42, angle, selected } = door;
  let wall = door.wall;

  let { lr, ud } = door; 
  let woodStart, woodMid, woodEnd, upOdown, rx, ry, btnShow;
  // console.dir(door);
  let angel = door.roate;
  if (!!!lr) {
    woodStart = p2;
    woodEnd = p1;
    if (!!!ud) {
      //(0,0)
      woodMid = p14;
      upOdown = 0;

    } else {
      //(0,1)
      woodMid = p13;
      upOdown = 1;
    }
  } else {
    woodStart = p1;
    woodEnd = p2;
    if (!!!ud) {
      //(1,0)
      upOdown = 1;
      woodMid = p24
    } else {
      //(1,1)
      upOdown = 0;
      woodMid = p23
    }
  }
  if (selected) {
    btnShow = {
      display: "block"
    }
  } else {
    btnShow = {
      display: "none"
    }
  }
  //长方形
  let d1 = `
              M${p11.x},${p11.y}
              L${p12.x},${p12.y}
              L${p22.x},${p22.y}
              L${p21.x},${p21.y}
              L${p11.x},${p11.y}
            `;
  //fixme 如果是窗
  if (door.modelBaseType == 2 && door.configModelTypeGid != 135 && door.configModelTypeGid != 141) {
    d1 += `
              M${p1.x + (p11.x - p1.x) / 2},${p1.y + (p11.y - p1.y) / 2}
              L${p2.x + (p21.x - p2.x) / 2},${p2.y + (p21.y - p2.y) / 2}
              M${p1.x - (p11.x - p1.x) / 2},${p1.y - (p11.y - p1.y) / 2}
              L${p2.x - (p21.x - p2.x) / 2},${p2.y - (p21.y - p2.y) / 2}
              `
  }
  if (door.configModelTypeGid == 130) {
    let l1 = { x: p1.x + (p11.x - p1.x) / 2, y: p1.y + (p11.y - p1.y) / 2 };
    let l2 = { x: p1.x - (p11.x - p1.x) / 2, y: p1.y - (p11.y - p1.y) / 2 };

    let r1 = { x: p2.x + (p21.x - p2.x) / 2, y: p2.y + (p21.y - p2.y) / 2 };
    r1 = Utils.getMidOffline({ p1: l1, p2: r1 });
    let r2 = { x: p2.x - (p21.x - p2.x) / 2, y: p2.y - (p21.y - p2.y) / 2 };
    l2 = Utils.getMidOffline({ p1: l2, p2: r2 });
    d1 += `
              M${l1.x},${l1.y}
              L${r1.x},${r1.y}
              M${l2.x},${l2.y}
              L${r2.x},${r2.y}
              `;
  }

  let d2 = `
              M${woodStart.x},${woodStart.y}
              A${door.distance}, ${door.distance}, 0, 0, ${upOdown}, ${woodMid.x}, ${woodMid.y}
              L${woodEnd.x}, ${woodEnd.y}
              `;

  //垭口
  if (door.configModelTypeGid == 138) {
    d2 = `
              `;
  }
  //fixme  不应该在这里计算飘窗  135
  if (door.configModelTypeGid == 135) {
    // debugger;
    if (ud == 1) {
      d2 = '';
      for (let offset = 0; offset <= 300; offset += 100) {
        let p1 = Utils.getNewVertex(door.p21, door.p11, door.distance + offset);
        let p2 = Utils.getNewVertex(door.p11, door.p21, door.distance + offset);
        let points = Utils.getPoint(p1, p2, 700 + offset);
        d2 += `
                  M${p1.x}, ${p1.y}
                  L${points.p11.x}, ${points.p11.y}
                  L${points.p21.x}, ${points.p21.y}
                  L${p2.x}, ${p2.y}
              `;
      }
    } else {
      d2 = '';
      for (let offset = 0; offset <= 300; offset += 100) {
        let p1 = Utils.getNewVertex(door.p22, door.p12, door.distance + offset);
        let p2 = Utils.getNewVertex(door.p12, door.p22, door.distance + offset);
        let points = Utils.getPoint(p1, p2, 700 + offset);
        d2 += `
                  M${p1.x}, ${p1.y}
                  L${points.p12.x}, ${points.p12.y}
                  L${points.p22.x}, ${points.p22.y}
                  L${p2.x}, ${p2.y}
              `;
      }
    }

  }

  //阳台
  if (door.configModelTypeGid == 141) {
    // debugger;
    // ud =1;
    if (ud == 1) {
      d2 = '';
      for (let offset = 0; offset <= 200; offset += 200) {
        let p1 = Utils.getNewVertex(door.p22, door.p12, door.distance + offset);
        let p2 = Utils.getNewVertex(door.p12, door.p22, door.distance + offset);
        let points = Utils.getPoint(p1, p2, 1200 + offset);
        d2 += `
                  M${p1.x}, ${p1.y}
                  L${points.p11.x}, ${points.p11.y}
                  L${points.p21.x}, ${points.p21.y}
                  L${p2.x}, ${p2.y}
              `;
      }
    } else {
      d2 = '';
      for (let offset = 0; offset <= 200; offset += 200) {
        let p1 = Utils.getNewVertex(door.p21, door.p11, door.distance + offset);
        let p2 = Utils.getNewVertex(door.p11, door.p21, door.distance + offset);
        let points = Utils.getPoint(p1, p2, 1200 + offset);
        d2 += `
                  M${p1.x}, ${p1.y}
                  L${points.p12.x}, ${points.p12.y}
                  L${points.p22.x}, ${points.p22.y}
                  L${p2.x}, ${p2.y}
              `;
      }
    }

  }
  //长度标线
  let d3, d4, d5;
  let distanced3, distanced4, distanced5;
  let box3, box4, box5;
  if (door.selected) {
    d3 = `
                M${p34.x}, ${p34.y}
                L${p33.x}, ${p33.y}
              `;
    distanced3 = Math.floor(door.distance);
    box3 = this.getSvgTextRect(distanced3, {
      fontSize: this.FONT_SIZE
    });
    d4 = `
                M${wall.p34.x}, ${wall.p34.y}
                L${p34.x}, ${p34.y}
              `;
    distanced4 = Math.floor(Utils.getDistance(wall.p34, p34));
    box4 = this.getSvgTextRect(distanced4, {
      fontSize: this.FONT_SIZE
    });
    d5 = `
                M${p33.x}, ${p33.y}
                L${wall.p33.x}, ${wall.p33.y}
              `;
    distanced5 = Math.floor(Utils.getDistance(wall.p33, p33));
    box5 = this.getSvgTextRect(distanced5, {
      fontSize: this.FONT_SIZE
    });
  }
  //按钮位置
  if (!!!ud) {
    rx = p41.x - 300;
    ry = p41.y - 150;
  } else {
    rx = p42.x - 300;
    ry = p42.y - 150;
  }

  return (
    <g
      key={door.uid}
      className="door"
      id={door.uid}
      key={door.uid}
    >
      {((door.modelBaseType == 1 || door.configModelTypeGid == 135 || door.configModelTypeGid == 141) && door.configModelTypeGid != 130) &&
        <path d={d2}
          fillOpacity='1'
          strokeWidth='10'
          strokeLinejoin='round'
          strokeLinecap='round'
          fill='rgba(0, 0, 0, 0)'
          stroke='#5d5d5d'
          cursor='move'
        />
      }
      <path d={d1}
        fillOpacity='1'
        strokeWidth='10'
        strokeLinejoin='round'
        strokeLinecap='round'
        fill={door.selected ? '#a4c8e7' : '#FFF'}
        stroke='#5d5d5d'
        cursor='move'
        
      />
      {door.selected &&
        <g>
          <path id={'door-length-' + door.uid} d={d3}
            fillOpacity='1'
            fill='#acacac'
            strokeWidth='10'
            stroke='#acacac' />
          <text transform={`rotate(${-angel} ${(p34.x - p33.x) / 2 + p33.x},${(p34.y - p33.y) / 2 + p33.y})`}
            x={distanced3 / 2 - box3.width / 2}
            dy={this.FONT_SIZE / 2}
            style={{
              fontSize: this.FONT_SIZE
            }}
          >
            <textPath xlinkHref={'#door-length-' + door.uid}>{distanced3}</textPath>
          </text>

          <path id={'door-length-p1' + door.uid} d={d4}
            fillOpacity='1'
            fill='#acacac'
            strokeWidth='10'
            stroke='#acacac' />
          <text
            x={(distanced4 / 2 - box4.width / 2)}
            dy={this.FONT_SIZE / 2}
            style={{
              fontSize: this.FONT_SIZE,
            }}
          >
            <textPath xlinkHref={'#door-length-p1' + door.uid}>{distanced4}</textPath>
          </text>

          <path id={'door-length-p2' + door.uid} d={d5} fillOpacity='1'
            fill='#acacac'
            strokeWidth='10'
            stroke='#acacac' />
          <text
            x={distanced5 / 2 - box5.width / 2}
            dy={this.FONT_SIZE / 2}
            style={{
              fontSize: this.FONT_SIZE,
            }}
          >
            <textPath xlinkHref={'#door-length-p2' + door.uid}>{distanced5}</textPath>
          </text>
        </g>
      }
      <circle
        cx={p1.x} cy={p1.y} r={50}
        fill='#b7b7b7'
        // stroke="red"
        strokeWidth='10'
        opacity='1'
        cursor='move'
        onMouseDown={(e) => {
          this.handleDoorAdjustStart(e, door, 'p1');
        }}
      />
      <circle
        fill='#b7b7b7'
        // stroke="blue"
        strokeWidth='1'
        opacity='1'
        cursor='move'
        cx={p2.x} cy={p2.y} r={50}
        onMouseDown={(e) => {
          this.handleDoorAdjustStart(e, door, 'p2');
        }}
      />
      {!(((door.modelBaseType == 1 || door.configModelTypeGid == 135 || door.configModelTypeGid == 141) && door.configModelTypeGid != 130)) &&
        <g style={btnShow} transform={`translate(${p42.x - 300}, ${p42.y - 150}) rotate(${angle}, 400, 200) `} >
          <g style={{ cursor: "pointer" }}
            onClick={(e) => {
              e = e || window.event;
              e.stopPropagation();
              e.preventDefault();
              menuShow(e, doorindex);

            }}
          >
            <rect rx="60" ry="60" x="200" y="0" height="350" width="350" stroke="#0A0B0C" fill="#fff" strokeWidth="15" />
            <image xlinkHref={mPng} x="255" y="75" height="200" width="200" />
          </g>
        </g>
      }
      {((door.modelBaseType == 1 || door.configModelTypeGid == 135 || door.configModelTypeGid == 141) && door.configModelTypeGid != 130) &&
        <g style={btnShow} transform={`translate(${rx}, ${ry}) rotate(${angle}, 400, 200) `} >
          <g style={{ cursor: "pointer" }}
            onClick={(e) => {
              e = e || window.event;
              e.stopPropagation();
              e.preventDefault();
              menuShow(e, doorindex);

            }}
          >
            <rect rx="60" ry="60" x="-500" y="0" height="400" width="400" stroke="#0A0B0C" fill="#fff" strokeWidth="15" />
            <image xlinkHref={mPng} x="-400" y="100" height="200" width="200" />
          </g>
          <rect rx="60" ry="60" id="svg_8" height="400" width="800" y="0" x="0" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke="#000" fill="#fff" />
          <g style={{ cursor: "pointer" }}
            onClick={(e) => {
              handleLORchange()
            }}
          >
            <rect style={{ cursor: "pointer" }} id="svg_12" height="250" width="100" y="90" x="85" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke={this.handleChangeStyleRec(lr, 0)} fill="#fff" />
            <path stroke={this.handleChangeStyleTriangle(lr, 0)} transform="rotate(45 150.31219482421882,210.3122329711914) " id="svg_29" d="m119.30714,239.85281l0,-59.08116l62.01012,59.08116l-62.01012,0z" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill={this.handleChangeStyleTriangle(lr, 0)} />
            <line stroke="#000" strokeLinecap="null" strokeLinejoin="null" id="svg_23" y2="345" x2="215" y1="75" x1="215" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill="none" />
            <rect stroke={this.handleChangeStyleRec(lr, 1)} id="svg_14" height="250" width="100" y="90" x="255" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill="#fff" />
            <path stroke={this.handleChangeStyleTriangle(lr, 1)} transform="rotate(-135 290.31219482421875,210.31223297119144) " id="svg_35" d="m259.30714,239.85281l0,-59.08116l62.01012,59.08116l-62.01012,0z" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill={this.handleChangeStyleTriangle(lr, 1)} />
            <rect y="90" x="85" height="250" width="260" stroke="#000" fill="#fff" fillOpacity="0" strokeOpacity="0" />
          </g>
          <g
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              handleTOBchange()
            }} >
            <line strokeLinecap="null" strokeLinejoin="null" id="svg_26" y2="215" x2="715" y1="215" x1="425" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke="#000" fill="none" />
            <rect stroke={this.handleChangeStyleRec(ud, 1)} id="svg_32" height="100" width="259.1419" y="255" x="445" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill="#fff" />
            <path stroke={this.handleChangeStyleTriangle(ud, 1)} transform="rotate(-45 580.3121948242187,280.3122329711913) " id="svg_34" d="m549.30714,309.85281l0,-59.08116l62.01012,59.08116l-62.01012,0z" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill={this.handleChangeStyleTriangle(ud, 1)} />
            <rect stroke={this.handleChangeStyleRec(ud, 0)} id="svg_18" height="100" width="250" y="70" x="445" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill="#fff" />
            <path stroke={this.handleChangeStyleTriangle(ud, 0)} transform="rotate(138 579.74010467529304,139.79074478149412) " id="svg_33" d="m548.80693,169.33133l0,-59.08116l61.86636,59.08116l-61.86636,0z" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill={this.handleChangeStyleTriangle(ud, 0)} />
            <rect y="70" x="445" height="250" width="260" stroke="#000" fill="#fff" fillOpacity="0" strokeOpacity="0" />
          </g>
        </g>
      }
    </g>

  );
}
export default function (doorsn) {
  // console.log(doors)
  // let { doors } = this.state;
  return (
    doorsn.map((door, doorindex) => {
      return this.getDoorJSX_360(door,doorindex);
    })
  );
}