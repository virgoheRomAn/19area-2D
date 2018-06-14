import Utils from '../Utils';
import classifyPoint   from 'robust-point-in-polygon';
export const handleLineAdjustStart = function (line, e , target ,index1,index2,index) {

  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pStart = this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  //初始化数据
  this.ceilCePoint = {
    "0":{
      x:line.points[0].x,
      y:line.points[0].y
    },
    "1":{
      x:line.points[1].x,
      y:line.points[1].y
    },
    "2":{
      x:line.points[2].x,
      y:line.points[2].y
    },
    "3":{
      x:line.points[3].x,
      y:line.points[3].y
    }
  }
  


  this.selectCeil = line;
  this.target = target;
  this.ceilIndex = index;
  this.index1 = index1;
  this.index2 = index2;

  document.addEventListener('mousemove', this.handleLineAdjustMove);
  document.addEventListener('mouseup', this.handleLineAdjustEnd);
}
export const handleLineAdjustMove = function (e) {
    let {ceils,walls} = this.state;
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  let arr = [];
  let wallid = [];
  this.selectCeil.floor.points.map((item)=>{
    arr.push([
      item.p.x,
      item.p.y
    ])
    wallid.push(item.wall.id);
  })
//   Object.assign(this.selectMan, {
//     x: this.selectMan.x + this.pEnd.x - this.pStart.x,
//     y: this.selectMan.y + this.pEnd.y - this.pStart.y,
//   })
if(this.target == "x"){
    let obj1x = this.ceilCePoint[this.index1].x + this.pEnd.x - this.pStart.x;
    let obj2x = this.ceilCePoint[this.index2].x + this.pEnd.x - this.pStart.x;
    
    
    let boolean = classifyPoint(arr,[obj1x,this.selectCeil.points[this.index1].y])!=1 && classifyPoint(arr,[obj2x,this.selectCeil.points[this.index2].y])!=1;
    // console.log(boolean)
    
    
    if(boolean){
      walls.map((wall)=>{
        if(wall.roate%180==90 && wallid.indexOf(wall.id)>-1){
          let disPoint1 =Utils.getShortestPoint(wall.p1,wall.p2,{x:obj1x,y:this.selectCeil.points[this.index1].y});
          let disPoint2 =Utils.getShortestPoint(wall.p1,wall.p2,{x:obj2x,y:this.selectCeil.points[this.index2].y});

          let disTance1 = Utils.getDistance(disPoint1,{x:obj1x,y:this.selectCeil.points[this.index1].y});
          let disTance2 = Utils.getDistance(disPoint2,{x:obj2x,y:this.selectCeil.points[this.index2].y});
          let bool1 = Utils.judgePointInLine(wall.p1,wall.p2,disPoint1);
          let bool2 = Utils.judgePointInLine(wall.p1,wall.p2,disPoint2);
          if(disTance1 <= disTance2 && bool1 && disTance1<300){
            
            obj1x = disPoint1.x;
            obj2x = disPoint1.x;
            if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) == -1){
              wall.ceilid.push(this.index1 + "" +this.index2 + this.selectCeil.cid);
            }
          }else if(disTance1 >= disTance2 && bool2 && disTance2<300){
            obj1x = disPoint2.x
            obj2x = disPoint2.x;
            if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) == -1){
              wall.ceilid.push(this.index1 + "" +this.index2 + this.selectCeil.cid);
            }
          }
          if(disTance1 <= disTance2 && bool1 && disTance1>300){
            if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) > -1){
              wall.ceilid.splice(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid),1);
            }
          }else if(disTance1 >= disTance2 && bool2 && disTance2>300){
            if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) > -1){
              wall.ceilid.splice(this.index1 + "" +this.index2 + wall.ceilid.indexOf(this.selectCeil.cid),1);
            }
          }
        }
      });
      
      let savex1 = this.selectCeil.points[this.index1].x;
      let savex2 = this.selectCeil.points[this.index2].x;
      this.selectCeil.points[this.index1].x = obj1x;
      this.selectCeil.points[this.index2].x = obj1x;
      let arrPoint = [
        [this.selectCeil.points[0].x,this.selectCeil.points[0].y],
        [this.selectCeil.points[1].x,this.selectCeil.points[1].y],
        [this.selectCeil.points[2].x,this.selectCeil.points[2].y],
        [this.selectCeil.points[3].x,this.selectCeil.points[3].y]
      ]
      let arrp = [];
      this.selectCeil.ceilModel.map((c)=>{
        arrp.push([
          c.point.p11.x,c.point.p11.y
                  ]);
        arrp.push([
          c.point.p12.x,c.point.p12.y
                  ]);
        arrp.push([
          c.point.p21.x,c.point.p21.y
                  ]);
        arrp.push([
          c.point.p22.x,c.point.p22.y
                  ]);
      })
      let insideArrBoolean = this.isInArrayPoint(arrPoint,arrp);
      if(!insideArrBoolean){
        this.selectCeil.points[this.index1].x = savex1;
        this.selectCeil.points[this.index2].x = savex2;
      }
    }
    
}else if(this.target == "y"){
  let obj1y = this.ceilCePoint[this.index1].y + this.pEnd.y - this.pStart.y;
  let obj2y = this.ceilCePoint[this.index2].y + this.pEnd.y - this.pStart.y;
  let boolean = classifyPoint(arr,[this.selectCeil.points[this.index1].x,obj1y])!=1 && classifyPoint(arr,[this.selectCeil.points[this.index2].x,obj2y])!=1;
  
  
  if(boolean){
    walls.map((wall)=>{
      if(wall.roate%180==0 && wallid.indexOf(wall.id)>-1){
        let disPoint1 =Utils.getShortestPoint(wall.p1,wall.p2,{x:this.selectCeil.points[this.index1].x,y:obj1y});
        let disPoint2 =Utils.getShortestPoint(wall.p1,wall.p2,{x:this.selectCeil.points[this.index2].x,y:obj2y});
        let disTance1 = Utils.getDistance(disPoint1,{x:this.selectCeil.points[this.index1].x,y:obj1y});
        let disTance2 = Utils.getDistance(disPoint2,{x:this.selectCeil.points[this.index2].x,y:obj2y});
        let bool1 = Utils.judgePointInLine(wall.p1,wall.p2,disPoint1);
        let bool2 = Utils.judgePointInLine(wall.p1,wall.p2,disPoint2);
        if(disTance1 <= disTance2 && bool1 && disTance1<300){
          obj1y = disPoint1.y;
          obj2y = disPoint1.y;
          if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) == -1){
            wall.ceilid.push(this.index1 + "" +this.index2 + this.selectCeil.cid);
          }
        }else if(disTance1 >= disTance2 && bool2 && disTance2<300){
          obj1y = disPoint2.y;
          obj2y = disPoint2.y;
          if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) == -1){
            wall.ceilid.push(this.index1 + "" +this.index2 + this.selectCeil.cid);
          }
        }
        if(disTance1 <= disTance2 && bool1 && disTance1>300){
          if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) > -1){
            wall.ceilid.splice(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid),1);
          }
        }else if(disTance1 >= disTance2 && bool2 && disTance2>300){
          if(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid) > -1){
            wall.ceilid.splice(wall.ceilid.indexOf(this.index1 + "" +this.index2 + this.selectCeil.cid),1);
          }
        }
      }
    })
      let savey1 = this.selectCeil.points[this.index1].y;
      let savey2 = this.selectCeil.points[this.index2].y;
      this.selectCeil.points[this.index1].y = obj1y;
      this.selectCeil.points[this.index2].y = obj1y;
      let arrPoint = [
        [this.selectCeil.points[0].x,this.selectCeil.points[0].y],
        [this.selectCeil.points[1].x,this.selectCeil.points[1].y],
        [this.selectCeil.points[2].x,this.selectCeil.points[2].y],
        [this.selectCeil.points[3].x,this.selectCeil.points[3].y]
      ];
      let arrp = [];
      this.selectCeil.ceilModel.map((c)=>{
        arrp.push([
          c.point.p11.x,c.point.p11.y
                  ]);
        arrp.push([
          c.point.p12.x,c.point.p12.y
                  ]);
        arrp.push([
          c.point.p21.x,c.point.p21.y
                  ]);
        arrp.push([
          c.point.p22.x,c.point.p22.y
                  ]);
      })
      let insideArrBoolean = this.isInArrayPoint(arrPoint,arrp);
      if(!insideArrBoolean){
        this.selectCeil.points[this.index1].y = savey1;
        this.selectCeil.points[this.index2].y = savey2;
      }
    
  }
    
}else{
  if(this.index1 == 0){
    let obj1x = this.ceilCePoint[this.index1].x + this.pEnd.x - this.pStart.x;
    let obj1y = this.ceilCePoint[this.index1].y + this.pEnd.y - this.pStart.y;
    let obj2y = this.ceilCePoint[1].y + this.pEnd.y - this.pStart.y;
    let obj3x = this.ceilCePoint[3].x + this.pEnd.x - this.pStart.x;
    
    let boolean = classifyPoint(arr,[obj1x,obj1y])!=1 && classifyPoint(arr,[this.selectCeil.points[1].x,obj2y])!=1 && classifyPoint(arr,[obj3x,this.selectCeil.points[3].y])!=1;
    if(boolean){
      let save1x = this.selectCeil.points[this.index1].x;
      let save1y = this.selectCeil.points[this.index1].y;
      let save2y = this.selectCeil.points[1].y;
      let save3x = this.selectCeil.points[3].x;


      this.selectCeil.points[this.index1].y = obj1y;
      this.selectCeil.points[this.index1].x = obj1x;
      this.selectCeil.points[1].y = obj1y;
      this.selectCeil.points[3].x = obj1x;
      let arrPoint = [
        [this.selectCeil.points[0].x,this.selectCeil.points[0].y],
        [this.selectCeil.points[1].x,this.selectCeil.points[1].y],
        [this.selectCeil.points[2].x,this.selectCeil.points[2].y],
        [this.selectCeil.points[3].x,this.selectCeil.points[3].y]
      ];
      let arrp = [];
      this.selectCeil.ceilModel.map((c)=>{
        arrp.push([
          c.point.p11.x,c.point.p11.y
                  ]);
        arrp.push([
          c.point.p12.x,c.point.p12.y
                  ]);
        arrp.push([
          c.point.p21.x,c.point.p21.y
                  ]);
        arrp.push([
          c.point.p22.x,c.point.p22.y
                  ]);
      })
      let insideArrBoolean = this.isInArrayPoint(arrPoint,arrp);
      if(!insideArrBoolean){
        this.selectCeil.points[this.index1].y = save1y;
        this.selectCeil.points[this.index1].x = save1x;
        this.selectCeil.points[1].y = save2y;
        this.selectCeil.points[3].x = save3x;
      }

    }


    
  }else if(this.index1 == 1){
    let obj1x = this.ceilCePoint[this.index1].x + this.pEnd.x - this.pStart.x;
    let obj1y = this.ceilCePoint[this.index1].y + this.pEnd.y - this.pStart.y;
    let obj2y = this.ceilCePoint[0].y + this.pEnd.y - this.pStart.y;
    let obj3x = this.ceilCePoint[2].x + this.pEnd.x - this.pStart.x;
    
    let boolean = classifyPoint(arr,[obj1x,obj1y])!=1 && classifyPoint(arr,[this.selectCeil.points[0].x,obj2y])!=1 && classifyPoint(arr,[obj3x,this.selectCeil.points[2].y])!=1;
    if(boolean){
      let save1x = this.selectCeil.points[this.index1].x;
      let save1y = this.selectCeil.points[this.index1].y;
      let save2y = this.selectCeil.points[0].y;
      let save3x = this.selectCeil.points[2].x;
      this.selectCeil.points[this.index1].y = obj1y;
      this.selectCeil.points[this.index1].x = obj1x;
      this.selectCeil.points[0].y = obj1y;
      this.selectCeil.points[2].x = obj1x;

      let arrPoint = [
        [this.selectCeil.points[0].x,this.selectCeil.points[0].y],
        [this.selectCeil.points[1].x,this.selectCeil.points[1].y],
        [this.selectCeil.points[2].x,this.selectCeil.points[2].y],
        [this.selectCeil.points[3].x,this.selectCeil.points[3].y]
      ];
      let arrp = [];
      this.selectCeil.ceilModel.map((c)=>{
        arrp.push([
          c.point.p11.x,c.point.p11.y
                  ]);
        arrp.push([
          c.point.p12.x,c.point.p12.y
                  ]);
        arrp.push([
          c.point.p21.x,c.point.p21.y
                  ]);
        arrp.push([
          c.point.p22.x,c.point.p22.y
                  ]);
      })
      let insideArrBoolean = this.isInArrayPoint(arrPoint,arrp);
      if(!insideArrBoolean){
        this.selectCeil.points[this.index1].y = save1y;
        this.selectCeil.points[this.index1].x = save1x;
        this.selectCeil.points[0].y = save2y;
        this.selectCeil.points[2].x = save3x;
      }
    }
  }else if(this.index1 == 2){
    

    let obj1x = this.ceilCePoint[this.index1].x + this.pEnd.x - this.pStart.x;
    let obj1y = this.ceilCePoint[this.index1].y + this.pEnd.y - this.pStart.y;
    let obj2y = this.ceilCePoint[3].y + this.pEnd.y - this.pStart.y;
    let obj3x = this.ceilCePoint[1].x + this.pEnd.x - this.pStart.x;
    
    let boolean = classifyPoint(arr,[obj1x,obj1y])!=1 && classifyPoint(arr,[this.selectCeil.points[3].x,obj2y])!=1 && classifyPoint(arr,[obj3x,this.selectCeil.points[1].y])!=1;
    if(boolean){
      let save1x = this.selectCeil.points[this.index1].x;
      let save1y = this.selectCeil.points[this.index1].y;
      let save2y = this.selectCeil.points[3].y;
      let save3x = this.selectCeil.points[1].x;

      this.selectCeil.points[this.index1].y = obj1y;
      this.selectCeil.points[this.index1].x = obj1x;
      this.selectCeil.points[3].y = obj1y;
      this.selectCeil.points[1].x = obj1x;

      let arrPoint = [
        [this.selectCeil.points[0].x,this.selectCeil.points[0].y],
        [this.selectCeil.points[1].x,this.selectCeil.points[1].y],
        [this.selectCeil.points[2].x,this.selectCeil.points[2].y],
        [this.selectCeil.points[3].x,this.selectCeil.points[3].y]
      ];
      let arrp = [];
      this.selectCeil.ceilModel.map((c)=>{
        arrp.push([
          c.point.p11.x,c.point.p11.y
                  ]);
        arrp.push([
          c.point.p12.x,c.point.p12.y
                  ]);
        arrp.push([
          c.point.p21.x,c.point.p21.y
                  ]);
        arrp.push([
          c.point.p22.x,c.point.p22.y
                  ]);
      })
      let insideArrBoolean = this.isInArrayPoint(arrPoint,arrp);
      if(!insideArrBoolean){
        this.selectCeil.points[this.index1].y = save1y;
        this.selectCeil.points[this.index1].x = save1x;
        this.selectCeil.points[3].y = save2y;
        this.selectCeil.points[1].x = save3x;
      }
    }

  }else{
    let obj1x = this.ceilCePoint[this.index1].x + this.pEnd.x - this.pStart.x;
    let obj1y = this.ceilCePoint[this.index1].y + this.pEnd.y - this.pStart.y;
    let obj2y = this.ceilCePoint[2].y + this.pEnd.y - this.pStart.y;
    let obj3x = this.ceilCePoint[0].x + this.pEnd.x - this.pStart.x;
    
    let boolean = classifyPoint(arr,[obj1x,obj1y])!=1 && classifyPoint(arr,[this.selectCeil.points[2].x,obj2y])!=1 && classifyPoint(arr,[obj3x,this.selectCeil.points[0].y])!=1;
    if(boolean){
      let save1x = this.selectCeil.points[this.index1].x;
      let save1y = this.selectCeil.points[this.index1].y;
      let save2y = this.selectCeil.points[2].y;
      let save3x = this.selectCeil.points[0].x;

      this.selectCeil.points[this.index1].y = obj1y;
      this.selectCeil.points[this.index1].x = obj1x;
      this.selectCeil.points[2].y = obj1y;
      this.selectCeil.points[0].x = obj1x;

      let arrPoint = [
        [this.selectCeil.points[0].x,this.selectCeil.points[0].y],
        [this.selectCeil.points[1].x,this.selectCeil.points[1].y],
        [this.selectCeil.points[2].x,this.selectCeil.points[2].y],
        [this.selectCeil.points[3].x,this.selectCeil.points[3].y]
      ];
      let arrp = [];
      this.selectCeil.ceilModel.map((c)=>{
        arrp.push([
          c.point.p11.x,c.point.p11.y
                  ]);
        arrp.push([
          c.point.p12.x,c.point.p12.y
                  ]);
        arrp.push([
          c.point.p21.x,c.point.p21.y
                  ]);
        arrp.push([
          c.point.p22.x,c.point.p22.y
                  ]);
      })
      let insideArrBoolean = this.isInArrayPoint(arrPoint,arrp);
      if(!insideArrBoolean){
        this.selectCeil.points[this.index1].y = save1y;
        this.selectCeil.points[this.index1].x = save1x;
        this.selectCeil.points[2].y = save2y;
        this.selectCeil.points[0].x = save3x;
      }
    }

  }
  
}
  
  // this.pStart = this.pEnd;
  let d = "M";
  this.selectCeil.points.map((point)=>{
      d+=point.x+" "+point.y+" L"
  })
  d = d.slice(0,d.length-2) + " Z";
//   this.ele.setAttribute("transform",`translate(${this.selectMan.x-1000},${this.selectMan.y-1000})`)
 
 this.selectCeil.center = Utils.getCenterPoint(this.selectCeil.points);
 this.selectCeil.positionPoint = Utils.getCenterPoint(this.selectCeil.points);
 document.getElementById("ceilPath" + this.ceilIndex).setAttribute("d",d)
//左下
document.getElementById("sw-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[0].x);
document.getElementById("sw-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[0].y);
//下中
document.getElementById("s-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[0].x + (this.selectCeil.points[1].x - this.selectCeil.points[0].x)/2);
document.getElementById("s-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[0].y);
//右下
document.getElementById("se-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[1].x);
document.getElementById("se-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[1].y);
//左上
document.getElementById("nw-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[3].x);
document.getElementById("nw-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[3].y);
//左中
document.getElementById("w-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[3].x);
document.getElementById("w-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[3].y + (this.selectCeil.points[0].y - this.selectCeil.points[3].y)/2);
//右上
document.getElementById("ne-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[2].x);
document.getElementById("ne-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[2].y);
//右中
document.getElementById("e-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[2].x);
document.getElementById("e-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[2].y + (this.selectCeil.points[1].y - this.selectCeil.points[2].y)/2);
//上中
document.getElementById("n-resize" + this.ceilIndex).setAttribute("x",this.selectCeil.points[3].x + (this.selectCeil.points[2].x - this.selectCeil.points[3].x)/2);
document.getElementById("n-resize" + this.ceilIndex).setAttribute("y",this.selectCeil.points[2].y);

//图片
// document.getElementById("ceil_image" + this.ceilIndex).setAttribute("x",this.selectCeil.center.x-250);
// document.getElementById("ceil_image" + this.ceilIndex).setAttribute("y",this.selectCeil.center.y-250);
//   this.setState({});
let middlePoint = Utils.getCenterPoint(this.selectCeil.points);

let restricted = Utils.buildWall({x:this.selectCeil.points[0].x+50,y:middlePoint.y},{x:this.selectCeil.points[1].x-50,y:middlePoint.y},Math.abs(this.selectCeil.points[0].y-this.selectCeil.points[3].y)-100);
this.selectCeil.restrictedArea = [
  restricted.p11,
      restricted.p21,
      restricted.p22,
      restricted.p12
]
}
export const handleLineAdjustEnd = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pStart = this.pEnd = null;
  document.removeEventListener('mousemove', this.handleLineAdjustMove);
  document.removeEventListener('mouseup', this.handleLineAdjustEnd);
  this.setState({},()=>{
    window.isChanged = true;
    if(!!window.BootParams['--takePicture']){
      window.isChanged = false;
    }
  });
}