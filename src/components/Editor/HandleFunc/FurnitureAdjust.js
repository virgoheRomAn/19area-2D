import Utils from '../Utils';
import React from 'react';
export const handleFurnitureAdjustStart = function (furniture, e, index, ele) {
  e.stopPropagation();
  e.preventDefault();
  if (ele == "eRec") {
    this.ele = e.target.parentElement;
    // this.eleD = this.ele.firstElementChild;

  } else if (ele == "eCir") {
    this.ele = e.target.parentElement.parentElement;
    this.eleP = e.target;
  }
  e = this.eventWarp(e);
  this.furniturePosition = [];
  furniture.g.map((item)=>{
    this.furniturePosition.push(item);
  })
  this.canDrap = furniture.p11;
  let { furnitures } = this.state;
  this.index = index;
  this.selectFurnitures = [furniture];
  this.adsorbing = false;
  this.pStart = this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  this.firstClick = {
    x: e.pageX,
    y: e.pageY
  }
  if (ele == "eRec") {
    document.addEventListener('mousemove', this.handleFurnitureAdjustMove);
  } else if (ele == "eCir") {
    document.addEventListener('mousemove', this.handleFurnitureAdjustRotate);
  }

  document.addEventListener('mouseup', this.handleFurnitureAdjustEnd);
  this.isMoved = false;
  // this.setState({furnitures});
}
export const handleFurnitureAdjustMove = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  let { furnitures } = this.state;
  this.isMoved = true;
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  this.endClick = {
    x: e.pageX,
    y: e.pageY
  }
  // console.log(this.pEnd.x - this.pStart.x)
  this.selectFurnitures.forEach((furniture) => {
    furnitures[this.index].g[0] = (this.furniturePosition[0] * 10 + this.pEnd.x - this.pStart.x) / 10;
    furnitures[this.index].g[1] = (this.furniturePosition[1] * 10 + this.pEnd.y - this.pStart.y) / 10;
    if(!this.adsorbing){
      let obj = Utils.buildFurnitures({
        x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] - 90) * Math.PI / 180),
        y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] - 90) * Math.PI / 180)
      }, {
          x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] + 90) * Math.PI / 180),
          y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] + 90) * Math.PI / 180)
        }, furniture.q[1]);
      Object.assign(furniture, obj);
    }
    let p1,p2;
    if(window.canAdsorb){
      this.state.walls.forEach((wall) => {
        if((wall.p2.y- wall.p1.y)/(wall.p2.x- wall.p1.x) == 0){
          if((this.canDrap.y - wall.p2.y)*(wall.p11.y - wall.p2.y) > 0){
            p1 = wall.p11;p2 = wall.p21;
          }else{
            p1 = wall.p12;p2 = wall.p22;
          }  
  
        }else if(Math.abs((wall.p2.y- wall.p1.y)/(wall.p2.x- wall.p1.x)) == Infinity){
          (this.canDrap.x - wall.p2.x)*(wall.p11.x - wall.p2.x) > 0 ? (p1 = wall.p11,p2 = wall.p21):(p1 = wall.p12,p2 = wall.p22)
        }else{
          ((wall.p1.y-wall.p2.y)/(wall.p1.x-wall.p2.x)*(this.canDrap.x-wall.p2.x)+wall.p2.y-this.canDrap.y)*((wall.p1.y-wall.p2.y)/(wall.p1.x-wall.p2.x)*(wall.p11.x-wall.p2.x)+wall.p2.y-wall.p11.y)>0?(p1 = wall.p11,p2 = wall.p21):(p1 = wall.p12,p2 = wall.p22);
        }
        let obj1 = Utils.getShortestPoint(p1, p2, furniture.p11);
        let obj2 = Utils.getShortestPoint(p1, p2, furniture.p12);
        let obj3 = Utils.getShortestPoint(p1, p2, furniture.p21);
        let obj4 = Utils.getShortestPoint(p1, p2, furniture.p22);
        let distance11 = Utils.getDistance(obj1, furniture.p11);
        let distance12 = Utils.getDistance(obj2, furniture.p12);
        let distance21 = Utils.getDistance(obj3, furniture.p21);
        let distance22 = Utils.getDistance(obj4, furniture.p22);
        let minDistance = Math.min(distance11,distance12,distance21,distance22);
        // console.log(minDistance)
        // console.log(Utils.judgeTwoPointInLineIpsilateral(furniture.p11,furniture.p12,wall))
        let bool11 = distance11 == minDistance && distance11 < 200 && distance11<=distance12 && distance11<=distance21 && Utils.judgePointInLine(p1, p2,obj1) && Utils.judgeTwoPointInLineIpsilateral(furniture.p11,furniture.p12,wall) && Utils.judgeTwoPointInLineIpsilateral(furniture.p11,furniture.p21,wall);
        let bool12 = distance12 == minDistance && distance12 < 200 && distance12<=distance11 && distance12<=distance22 && Utils.judgePointInLine(p1, p2,obj2) && Utils.judgeTwoPointInLineIpsilateral(furniture.p12,furniture.p11,wall) && Utils.judgeTwoPointInLineIpsilateral(furniture.p12,furniture.p22,wall);
        let bool21 = distance21 == minDistance && distance21 < 200 && distance21<=distance22 && distance21<=distance11 && Utils.judgePointInLine(p1, p2,obj3) && Utils.judgeTwoPointInLineIpsilateral(furniture.p21,furniture.p11,wall) && Utils.judgeTwoPointInLineIpsilateral(furniture.p21,furniture.p22,wall);
        let bool22 = distance22 == minDistance && distance22 < 200 && distance22<=distance21 && distance22<=distance12 && Utils.judgePointInLine(p1, p2,obj4) && Utils.judgeTwoPointInLineIpsilateral(furniture.p22,furniture.p12,wall) && Utils.judgeTwoPointInLineIpsilateral(furniture.p22,furniture.p21,wall)
        if (bool11) {
          furnitures[this.index].p1.x = furnitures[this.index].p1.x + obj1.x - furnitures[this.index].p11.x;
          furnitures[this.index].p1.y = furnitures[this.index].p1.y + obj1.y - furnitures[this.index].p11.y;
          furnitures[this.index].p2.x = furnitures[this.index].p2.x + obj1.x - furnitures[this.index].p11.x;
          furnitures[this.index].p2.y = furnitures[this.index].p2.y + obj1.y - furnitures[this.index].p11.y;
          this.canDrap = furniture.p22;
          
          furnitures[this.index].g[0] = furnitures[this.index].g[0] + (obj1.x - furnitures[this.index].p11.x) / 10;
          furnitures[this.index].g[1] = furnitures[this.index].g[1] + (obj1.y - furnitures[this.index].p11.y) / 10;
          let obj = Utils.buildFurnitures({
            x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] - 90) * Math.PI / 180),
            y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] - 90) * Math.PI / 180)
          }, {
              x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] + 90) * Math.PI / 180),
              y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] + 90) * Math.PI / 180)
            }, furniture.q[1]);
          Object.assign(furniture, obj);
          window.ddpoint = (
            <g>
              <line
                x1={furnitures[this.index].g[0] * 10 - furnitures[this.index].q[0] / 2}
                y1={furnitures[this.index].g[1] * 10 - furnitures[this.index].q[1] / 2}
                x2={obj1.x}
                y2={obj1.y}
                stroke='#00CCCB'
                strokeWidth='20' />
              <line
                x1={furnitures[this.index].p1.x}
                y1={furnitures[this.index].p1.y}
                x2={furnitures[this.index].p11.x}
                y2={furnitures[this.index].p11.y}
                stroke='red'
                strokeWidth='20' />
            </g>
          );
          return;
        }
        if (bool12) {
          
          furnitures[this.index].p1.x = furnitures[this.index].p1.x + obj2.x - furnitures[this.index].p12.x;
          furnitures[this.index].p1.y = furnitures[this.index].p1.y + obj2.y - furnitures[this.index].p12.y;
          furnitures[this.index].p2.x = furnitures[this.index].p2.x + obj2.x - furnitures[this.index].p12.x;
          furnitures[this.index].p2.y = furnitures[this.index].p2.y + obj2.y - furnitures[this.index].p12.y;
          this.canDrap = furniture.p21;
          
          furnitures[this.index].g[0] = furnitures[this.index].g[0] + (obj2.x - furnitures[this.index].p12.x) / 10;
          furnitures[this.index].g[1] = furnitures[this.index].g[1] + (obj2.y - furnitures[this.index].p12.y) / 10;
          
          let obj = Utils.buildFurnitures({
            x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] - 90) * Math.PI / 180),
            y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] - 90) * Math.PI / 180)
          }, {
              x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] + 90) * Math.PI / 180),
              y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] + 90) * Math.PI / 180)
            }, furniture.q[1]);
          Object.assign(furniture, obj);
          window.ddpoint = (
            <g>
              <line
                x1={furnitures[this.index].g[0] * 10 - furnitures[this.index].q[0] / 2}
                y1={furnitures[this.index].g[1] * 10 - furnitures[this.index].q[1] / 2}
                x2={obj2.x}
                y2={obj2.y}
                stroke='#00CCCB'
                strokeWidth='20' />
              <line
                x1={furnitures[this.index].p1.x}
                y1={furnitures[this.index].p1.y}
                x2={furnitures[this.index].p11.x}
                y2={furnitures[this.index].p11.y}
                stroke='red'
                strokeWidth='20' />
            </g>
          );
          return;
        }
        if (bool21) {
          
          furnitures[this.index].p1.x = furnitures[this.index].p1.x + obj3.x - furnitures[this.index].p21.x;
          furnitures[this.index].p1.y = furnitures[this.index].p1.y + obj3.y - furnitures[this.index].p21.y;
          furnitures[this.index].p2.x = furnitures[this.index].p2.x + obj3.x - furnitures[this.index].p21.x;
          furnitures[this.index].p2.y = furnitures[this.index].p2.y + obj3.y - furnitures[this.index].p21.y;
          this.canDrap = furniture.p12;
          
          furnitures[this.index].g[0] = furnitures[this.index].g[0] + (obj3.x - furnitures[this.index].p21.x) / 10;
          furnitures[this.index].g[1] = furnitures[this.index].g[1] + (obj3.y - furnitures[this.index].p21.y) / 10;
          let obj = Utils.buildFurnitures({
            x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] - 90) * Math.PI / 180),
            y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] - 90) * Math.PI / 180)
          }, {
              x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] + 90) * Math.PI / 180),
              y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] + 90) * Math.PI / 180)
            }, furniture.q[1]);
          Object.assign(furniture, obj);
          window.ddpoint = (
            <g>
              <line
                x1={furnitures[this.index].g[0] * 10 - furnitures[this.index].q[0] / 2}
                y1={furnitures[this.index].g[1] * 10 - furnitures[this.index].q[1] / 2}
                x2={obj3.x}
                y2={obj3.y}
                stroke='#00CCCB'
                strokeWidth='20' />
              <line
                x1={furnitures[this.index].p1.x}
                y1={furnitures[this.index].p1.y}
                x2={furnitures[this.index].p11.x}
                y2={furnitures[this.index].p11.y}
                stroke='red'
                strokeWidth='20' />
            </g>
          );
          return;
        }
        if (bool22) {
          
          furnitures[this.index].p1.x = furnitures[this.index].p1.x + obj4.x - furnitures[this.index].p22.x;
          furnitures[this.index].p1.y = furnitures[this.index].p1.y + obj4.y - furnitures[this.index].p22.y;
          furnitures[this.index].p2.x = furnitures[this.index].p2.x + obj4.x - furnitures[this.index].p22.x;
          furnitures[this.index].p2.y = furnitures[this.index].p2.y + obj4.y - furnitures[this.index].p22.y;
          this.canDrap = furniture.p11;
          furnitures[this.index].g[0] = furnitures[this.index].g[0] + (obj4.x - furnitures[this.index].p22.x) / 10;
          furnitures[this.index].g[1] = furnitures[this.index].g[1] + (obj4.y - furnitures[this.index].p22.y) / 10;
  
          let obj = Utils.buildFurnitures({
            x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] - 90) * Math.PI / 180),
            y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] - 90) * Math.PI / 180)
          }, {
              x: furniture.g[0] * 10 + furniture.q[0] / 2 * Math.cos((furniture.h[0] + 90) * Math.PI / 180),
              y: furniture.g[1] * 10 + furniture.q[0] / 2 * Math.sin((furniture.h[0] + 90) * Math.PI / 180)
            }, furniture.q[1]);
          Object.assign(furniture, obj);
          window.ddpoint = (
            <g>
              <line
                x1={furnitures[this.index].g[0] * 10 - furnitures[this.index].q[0] / 2}
                y1={furnitures[this.index].g[1] * 10 - furnitures[this.index].q[1] / 2}
                x2={obj4.x}
                y2={obj4.y}
                stroke='#00CCCB'
                strokeWidth='20' />
              <line
                x1={furnitures[this.index].p1.x}
                y1={furnitures[this.index].p1.y}
                x2={furnitures[this.index].p11.x}
                y2={furnitures[this.index].p11.y}
                stroke='red'
                strokeWidth='20' />
            </g>
          );
          return;
        }
        if(bool11 || bool12 || bool21 || bool22){
          this.adsorbing = true;
        }else{
          this.adsorbing = false;
        }
      })
    }
    

  });
  // this.pStart = this.pEnd;
  // this.ele.setAttribute('transform',`translate(${furnitures[this.index].g[0]*10-furnitures[this.index].q[0]/2}, ${furnitures[this.index].g[1]*10-furnitures[this.index].q[1]/2}) rotate(${furnitures[this.index].h[0]+90}, ${furnitures[this.index].q[0]/2}, ${furnitures[this.index].q[1]/2})`)

  document.getElementById(this.selectFurnitures[0].cid).setAttribute('transform', `translate(${furnitures[this.index].g[0] * 10 - furnitures[this.index].q[0] / 2}, ${furnitures[this.index].g[1] * 10 - furnitures[this.index].q[1] / 2}) rotate(${furnitures[this.index].h[0] + 90}, ${furnitures[this.index].q[0] / 2}, ${furnitures[this.index].q[1] / 2})`);


  // this.setState({furnitures});
}
export const handleFurnitureAdjustRotate = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  let { furnitures } = this.state;
  this.isMoved = true;
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  this.selectFurnitures.forEach((furniture) => {
    // furnitures[this.index] = Object.assign(furniture, {
    //   r:Utils.getRoate({x:furniture.x*10+500,y:furniture.y*10+500},this.pEnd)+90,
    //   fillColor:"blue"
    // })
    furnitures[this.index].h[0] = Utils.getRoate({ x: furniture.g[0] * 10, y: furniture.g[1] * 10 }, this.pEnd)
    furnitures[this.index].fillColor = "blue"
  });
  if (furnitures[this.index].h[0] > 85 && furnitures[this.index].h[0] < 95) {
    furnitures[this.index].h[0] = 90;
    this.state.AssistLine = [{
      p1: {
        x: furnitures[this.index].g[0] * 10,
        y: furnitures[this.index].g[1] * 10
      },
      p2: {
        x: furnitures[this.index].g[0] * 10,
        y: furnitures[this.index].g[1] * 10 - 800
      },
      roate: 90
    }]
    this.reRnderAssistLine();
  }
  if ((furnitures[this.index].h[0] > 355 && furnitures[this.index].h[0] < 360) || (furnitures[this.index].h[0] > 0 && furnitures[this.index].h[0] < 5)) {
    furnitures[this.index].h[0] = 0;
    this.state.AssistLine = [{
      p1: {
        x: furnitures[this.index].g[0] * 10,
        y: furnitures[this.index].g[1] * 10
      },
      p2: {
        x: furnitures[this.index].g[0] * 10 - 800,
        y: furnitures[this.index].g[1] * 10
      },
      roate: 0
    }]
    this.reRnderAssistLine();
  }
  if ((furnitures[this.index].h[0] > 175 && furnitures[this.index].h[0] < 185)) {
    furnitures[this.index].h[0] = 180;
    this.state.AssistLine = [{
      p1: {
        x: furnitures[this.index].g[0] * 10,
        y: furnitures[this.index].g[1] * 10
      },
      p2: {
        x: furnitures[this.index].g[0] * 10 - 800,
        y: furnitures[this.index].g[1] * 10
      },
      roate: 180
    }]
    this.reRnderAssistLine();
  }
  if ((furnitures[this.index].h[0] > 265 && furnitures[this.index].h[0] < 275)) {
    furnitures[this.index].h[0] = 270;
    this.state.AssistLine = [{
      p1: {
        x: furnitures[this.index].g[0] * 10,
        y: furnitures[this.index].g[1] * 10
      },
      p2: {
        x: furnitures[this.index].g[0] * 10,
        y: furnitures[this.index].g[1] * 10 - 800
      },
      roate: 270
    }]
    this.reRnderAssistLine();
  }
  this.pStart = this.pEnd;
  this.eleP.setAttribute("fill", "blue")
  this.ele.setAttribute('transform', `translate(${furnitures[this.index].g[0] * 10 - furnitures[this.index].q[0] / 2}, ${furnitures[this.index].g[1] * 10 - furnitures[this.index].q[1] / 2}) rotate(${furnitures[this.index].h[0] + 90}, ${furnitures[this.index].q[0] / 2}, ${furnitures[this.index].q[1] / 2})`);
  // this.setState({furnitures});
}
export const handleFurnitureAdjustEnd = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  let { furnitures } = this.state;
  if (!this.isMoved) {
    let noMove;
    this.selectFurnitures.forEach((furniture) => {
      noMove = !furniture.selected;
      // noMove?this.eleD.style.display='block':this.eleD.style.display='none';
    });
    furnitures.map((furniture) => {
      furniture.selected = false;
    });
    this.selectFurnitures.forEach((furniture) => {
      furniture.selected = noMove;
      // let obj = Utils.buildFurnitures({
      //       x:furniture.g[0]*10+furniture.q[0]/2*Math.cos((furniture.h[0]-90)*Math.PI/180),
      //       y:furniture.g[1]*10+furniture.q[0]/2*Math.sin((furniture.h[0]-90)*Math.PI/180)
      //   },{
      //       x:furniture.g[0]*10+furniture.q[0]/2*Math.cos((furniture.h[0]+90)*Math.PI/180),
      //       y:furniture.g[1]*10+furniture.q[0]/2*Math.sin((furniture.h[0]+90)*Math.PI/180)
      //   },furniture.q[1]);
      //   Object.assign(furniture,obj);
    });


  }
  if (this.isMoved) {
    this.selectFurnitures.forEach((furniture) => {
      furniture.fillColor = "#00CCCB";
      //   let obj = Utils.buildFurnitures({
      //       x:furniture.g[0]*10+furniture.q[0]/2*Math.cos((furniture.h[0]-90)*Math.PI/180),
      //       y:furniture.g[1]*10+furniture.q[0]/2*Math.sin((furniture.h[0]-90)*Math.PI/180)
      //     },
      //     {
      //       x:furniture.g[0]*10+furniture.q[0]/2*Math.cos((furniture.h[0]+90)*Math.PI/180),
      //       y:furniture.g[1]*10+furniture.q[0]/2*Math.sin((furniture.h[0]+90)*Math.PI/180)
      //     },furniture.q[1]
      //   )
      let obj = Utils.buildFurnitures(furniture.p1,
        furniture.p2, furniture.q[1]
      )
      Object.assign(furniture, obj);

    });
  }
  this.pStart = this.pEnd = null;
  document.removeEventListener('mousemove', this.handleFurnitureAdjustMove);
  document.removeEventListener('mousemove', this.handleFurnitureAdjustRotate);
  document.removeEventListener('mouseup', this.handleFurnitureAdjustEnd);
  this.setState({ furnitures },()=>{
    window.isChanged = true;
    if(!!window.BootParams['--takePicture']){
      window.isChanged = false;
    }
  });
}