import React from 'react';
import Utils from '../Utils';

export const getWallJSX = function (wall, index) {
  let { p1, p2, p11, p12, p21, p22, p31, p32 } = wall;
  let { p11c, p12c, p21c, p22c, p31c, p32c } = wall;//相交的墙的修补点
  //长方形
  let d1 = `
      M${p1.x},${p1.y}
      L${(p11c || p11).x},${(p11c || p11).y}
      L${(p21c || p21).x},${(p21c || p21).y}
      L${p2.x},${p2.y}
      L${(p22c || p22).x},${(p22c || p22).y}
      L${(p12c || p12).x},${(p12c || p12).y}
      L${p1.x},${p1.y}
  `;
  let angel = Utils.getRoate(p1, p2);
  // var pAdjust=null;
  //长度标线
  let d2 = `
      M${p31.x},${p31.y}
      L${p32.x},${p32.y}
  `;
  let distance = Math.floor(wall.distance);
  return (
    <g
      key={wall.id}
      id={wall.id}
    >
      <g
        key={wall.id}
        id={'wall' + wall.id}
        onMouseDown={(e) => {
          let { mouseType } = this.state;
          //如果现在是画笔状态，冒泡
          if (mouseType == 'brush') {

            return;

          }
          e.stopPropagation();
          e.preventDefault();
          if (e.button == 2) {
            wall.selected = true;
            //todo:显示设置承重墙
            document.getElementById("wallContextMenu_camera").style.display = "block";
            document.getElementById("wallContextMenu_camera").style.top = e.clientY + "px";
            document.getElementById("wallContextMenu_camera").style.left = e.clientX + "px";
            if (wall.mainWall) {
              document.getElementById("wallContextMenu_camera_p").innerHTML = "取消承重墙"
            } else {
              document.getElementById("wallContextMenu_camera_p").innerHTML = "设为承重墙"
            }
            let hasPattern = wall.pattern && (wall.pattern[0] || wall.pattern[1]);
            if (!hasPattern) {
              document.getElementById("wallContextMenu_pattern_unselect").classList.add("disable");
            } else {
              document.getElementById("wallContextMenu_pattern_unselect").classList.remove("disable");
            }
            //TODO 判断是否有拼花
          }
          //单选  
          //TODO 20180509 同一水平线的可以多选(多选给拼花)
          let { walls, doors } = this.state;
          walls.forEach((wall) => { wall.selected = false });
          doors.forEach((door) => { door.selected = false });
          wall.selected = true;
          walls.splice(index, 1);
          walls.push(wall)
          wall.selected = true;

          this.setState({});
        }}
      >
        <g transform={`translate(${p31.x - 30},${p31.y - 75}) rotate(${angel + 22} 30,75)`}>
          <line stroke="#5d5d5d" strokeLinecap="undefined" strokeLinejoin="undefined" id="svg_1" y2="150" x2="0" y1="0" x1="60" strokeWidth="10" fill="none" />
          <line strokeLinecap="undefined" strokeLinejoin="undefined" id="svg_2" y2="150" x2="60" y1="0" x1="0" fillOpacity="null" strokeOpacity="null" strokeWidth="10" stroke="#5d5d5d" fill="none" />
        </g>
        <g transform={`translate(${p32.x - 30},${p32.y - 75}) rotate(${angel + 22} 30,75)`}>
          <line stroke="#5d5d5d" strokeLinecap="undefined" strokeLinejoin="undefined" id="svg_1" y2="150" x2="0" y1="0" x1="60" strokeWidth="10" fill="none" />
          <line strokeLinecap="undefined" strokeLinejoin="undefined" id="svg_2" y2="150" x2="60" y1="0" x1="0" fillOpacity="null" strokeOpacity="null" strokeWidth="10" stroke="#5d5d5d" fill="none" />
        </g>
        <path className='' d={d1}
          fillOpacity='1'
          strokeWidth='10'
          strokeLinejoin='round'
          strokeLinecap='round'
          fill={wall.mainWall ? "#666" : wall.selected ? '#00cccb' : 'rgba(172, 172, 172,.5)'}
          // stroke='#00cccb'
          cursor={this.state.mouseType == 'brush' ? 'Crosshair' : 'move'}
        />
        <path id={'wall-length-' + wall.id} d={d2}
          fillOpacity='1'
          fill='#acacac'
          strokeWidth='10'
          stroke='#acacac'
        />
        <text transform={`rotate(${-angel} ${(p32.x - p31.x) / 2 + p31.x},${(p32.y - p31.y) / 2 + p31.y})`}
          className='text'
          x={distance / 2 - ((distance + '').length * this.FONT_SIZE * 1.5) / 3}
          dy={this.FONT_SIZE * 1.5 / 2}
          style={{
            fontSize: this.FONT_SIZE * 1.5
          }}
        >
          <textPath xlinkHref={'#wall-length-' + wall.id}>{distance}</textPath>
        </text>
        <circle
          cx={p1.x} cy={p1.y} r={this.WALL_WIDTH_HALF / 1.5}
          fill='#b7b7b7'
          // stroke="red"
          strokeWidth='10'
          opacity='1'
          cursor={this.state.mouseType == 'brush' ? 'Crosshair' : 'move'}
          onMouseDown={(e) => {
            this.handleWallAdjustStart(e, wall, 'p1');
          }} />
        <circle
          cx={p2.x} cy={p2.y} r={this.WALL_WIDTH_HALF / 1.5}
          fill='#b7b7b7'
          // stroke="red"
          strokeWidth='10'
          opacity='1'
          cursor={this.state.mouseType == 'brush' ? 'Crosshair' : 'move'}
          onMouseDown={(e) => {
            this.handleWallAdjustStart(e, wall, 'p2');
          }} />
      </g>
      {
        (() => {
          let result = this.renderDoors(wall.doors);
          return result;
        })()
      }
    </g>
  );
}
//画墙
export default function () {
  let { walls } = this.state;
  return (
    walls.map((wall, index) => {
      return this.getWallJSX(wall, index);
    })
  );
}