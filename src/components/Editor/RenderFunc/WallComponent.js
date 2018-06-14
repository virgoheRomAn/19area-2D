import React,{Component} from 'react';
import Utils from '../Utils'
import {Map,is } from  'immutable';

export default class WallComponent extends Component {
    constructor(props){
        super(props);
        this.FONT_SIZE = 140;
        this.WALL_WIDTH_HALF = 120;
        
    }
    // shouldComponentUpdate(nextProps,nextState){
    //   // if(nextProps.wall.id == this.props.wall.id && nextProps.wall.distance == this.props.wall.distance){
    //   //   return false;
    //   // }
    //   console.log(nextProps)
    //   console.log(this.props)
    //   const map1 = Map(nextProps)
    //   const map2 = Map(this.props)
    //   console.log(is(map1,map2))
    //   return true;
    // }
    shouldComponentUpdate(nextProps,nextState){
      console.time("shouldComponentUpdate")
      let thisProps = this.props || {};
      let arr = Object.entries(nextProps);
      
      let nextPropsArr = [];
      arr.map((item,index)=>{
          let type = typeof item[1];
          if(type != 'function'){
            nextPropsArr.push(item);
          }
      })
      nextProps = {}
      nextPropsArr.map(function(item,index){
          nextProps[item[0]] = item[1];
      })



      let arrn = Object.entries(thisProps);
      let thisPropsArr = [];
      arrn.map(function(item,index){
          let type = typeof item[1];
          if(type != 'function'){
            thisPropsArr.push(item);

          }
      })
      thisProps = {}
      thisPropsArr.map(function(item,index){
          thisProps[item[0]] = item[1];
      })

        if (Object.keys(thisProps).length !== Object.keys(nextProps).length) {
          return true;
        }
      for(let key in nextProps){
        let type = typeof nextProps[key];
        if(type == 'object'){
          nextProps[key] = Map(nextProps[key]);
        }
      }
      for(let key in thisProps){
        let type = typeof thisProps[key];
        if(type == 'object'){
          thisProps[key] = Map(thisProps[key]);
        }
      }
        for (const key in nextProps) {
          if (!is(thisProps[key], nextProps[key])) {

            return true;
          }
        }
      
      //   for (const key in nextState) {
      //     if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
      //       return true;
      //     }
      //   }
        console.log("没渲染")
        console.timeEnd("shouldComponentUpdate");
        return false;
        
      
    }
    
    
    render(){
      if(!!!this.props.wall){
        return <p/>;
      }
      let wall = this.props.wall;
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
        >
        {console.log("渲染了")}
          <g changeIndex = {this.props.changeIndex}
            key={wall.id}
            id={'wall' + wall.id}
            onMouseDown={(e) => {
              let { mouseType } = this.props.mouseType;
              //如果现在是画笔状态，冒泡
              if (mouseType == 'brush') {
                return;
              }
              e.stopPropagation();
              e.preventDefault();
              wall.selected = !wall.selected;
              //单选
              this.props.changeSelected();
              {/* if (wall.selected) {
                let { walls, doors } = this.state;
                walls.forEach((wall) => { wall.selected = false });
                doors.forEach((door) => { door.selected = false });
                wall.selected = true;
              } */}
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
              fill={wall.selected ? '#a4c8e7' : 'rgba(172, 172, 172, 0.5)'}
              stroke='#5d5d5d'
              cursor={this.props.mouseType == 'brush' ? 'Crosshair' : 'move'}
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
              cursor={this.props.mouseType == 'brush' ? 'Crosshair' : 'move'}
              onMouseDown={(e) => {
                this.props.handleWallAdjustStartP1(e,wall);
              }} />
            <circle
              cx={p2.x} cy={p2.y} r={this.WALL_WIDTH_HALF / 1.5}
              fill='#b7b7b7'
              // stroke="red"
              strokeWidth='10'
              opacity='1'
              cursor={this.props.mouseType == 'brush' ? 'Crosshair' : 'move'}
              onMouseDown={(e) => {
                this.props.handleWallAdjustStartP2(e,wall);
              }} />
          </g>
          {/* {
            (() => {
              let result = this.renderDoors();
              return result;
            })()
          } */}
        </g>
      )
    }
    
}