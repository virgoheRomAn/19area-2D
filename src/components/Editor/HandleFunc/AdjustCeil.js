import Utils from '../Utils';
import classifyPoint   from 'robust-point-in-polygon';
import { message} from 'antd';
import $ from "jquery";
export const handleCeilAdjustStart = function (e,imgFilePath,objMsg) {
  document.addEventListener('mouseup', this.handleCeilAdjustEnd,e);
  let {ceils} = this.state; 
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pStart = this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  this.imgFilePath = imgFilePath;
  this.ceilMsg = objMsg;
  ceils.map((ceil)=>{
    ceil.select = false;
  })
  window.EM.emit("ceilsShow");
  let p1 = {
      x:this.pStart.x - 400 - objMsg.modelLength/2,
      y:this.pStart.y
    };
  let p2 = {
      x:this.pStart.x + 400 + objMsg.modelLength/2,
      y:this.pStart.y 
    };
  let obj = Utils.buildWall(p1,p2,objMsg.modelWidth+800);
  let centPoint = Utils.getCenterPoint([obj.p11,
    obj.p21,
    obj.p22,
    obj.p12])
  let ceilModelObj = Utils.buildWall({x:centPoint.x - objMsg.modelLength/2,y:centPoint.y},{x:centPoint.x + objMsg.modelLength/2,y:centPoint.y},objMsg.modelWidth);
  ceils.push({
    "points":[
        obj.p11,
        obj.p21,
        obj.p22,
        obj.p12
    ],
    select:true,
    isTiled:false,
    center:centPoint,
    canScale:false,
    ceilModel:[
      {
        "ceilMsg":this.ceilMsg,
        "imgFilePath":imgFilePath,
        "point":ceilModelObj,
        "centerPoint":Utils.getCenterPoint([ceilModelObj.p11,
          ceilModelObj.p21,
          ceilModelObj.p22,
          ceilModelObj.p12]),
        canScale:false,
        errStyle:false//吊顶模型重合的样式控制
      }
    ],
    positionPoint:centPoint,
    beforePoints:[
        obj.p11,
        obj.p21,
        obj.p22,
        obj.p12
    ],
    ply:400,
    cid:"c_"+Math.ceil(Math.random()*100) + "" + Date.now(),
    wallId:[],
    show:true
    }
  );
  $("#input_checkbox1").prop("checked",true);
  // $("#input_checkbox2").prop("checked",true);
  // $("#input_checkbox3").prop("checked",true);
  $("#ceil_group").css("display","inline");
  // $("#furniture_group").css("display","inline");
  // $(".door").css("display","inline");
  document.addEventListener('mousemove', this.handleCeilAdjustMove);
  
}
export const handleCeilAdjustMove = function (e) {
    let {ceils} = this.state;
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  let p1 = {
    x:this.pEnd.x - 400 - this.ceilMsg.modelLength/2,
    y:this.pEnd.y
  };
  let p2 = {
    x:this.pEnd.x + 400 + this.ceilMsg.modelLength/2,
    y:this.pEnd.y 
  };

  let obj = Utils.buildWall(p1,p2,this.ceilMsg.modelWidth+800);
  let restricted = Utils.buildWall({x:p1.x+50,y:p1.y},{x:p2.x-50,y:p2.y},this.ceilMsg.modelWidth+700);
  let centPoint = Utils.getCenterPoint([obj.p11,
    obj.p21,
    obj.p22,
    obj.p12]);
  let ceilModelObj = Utils.buildWall({x:centPoint.x - this.ceilMsg.modelLength/2,y:centPoint.y},{x:centPoint.x + this.ceilMsg.modelLength/2,y:centPoint.y},this.ceilMsg.modelWidth);
  ceils[ceils.length - 1] = Object.assign(ceils[ceils.length - 1],{
    "points":[
        obj.p11,
        obj.p21,
        obj.p22,
        obj.p12
    ],
    restrictedArea:[
      restricted.p11,
      restricted.p21,
      restricted.p22,
      restricted.p12
    ],
    select:true,
    isTiled:false,
    canScale:false,
    center:centPoint,
    ceilModel:[
      {
        "ceilMsg":this.ceilMsg,
        "imgFilePath":this.imgFilePath,
        "point":ceilModelObj,
        "centerPoint":Utils.getCenterPoint([ceilModelObj.p11,
          ceilModelObj.p21,
          ceilModelObj.p22,
          ceilModelObj.p12]),
          canScale:false,
          errStyle:false
      }
      
    ],
    positionPoint:centPoint,
    beforePoints:[
        obj.p11,
        obj.p21,
        obj.p22,
        obj.p12
    ],
    ply:400,
    show:true
    });
  this.pStart = this.pEnd;
  this.selectCeil = ceils[ceils.length - 1];
  this.ceilIndex = ceils.length - 1;
  let d = "M";
  this.selectCeil.points.map((point)=>{
      d+=point.x+" "+point.y+" L"
  })
  d = d.slice(0,d.length-2) + " Z";
//   this.ele.setAttribute("transform",`translate(${this.selectMan.x-1000},${this.selectMan.y-1000})`)
 
 this.selectCeil.center = Utils.getCenterPoint(this.selectCeil.points);
 document.getElementById("ceilPath" + this.ceilIndex).setAttribute("d",d);
 if(this.selectCeil.canScale){
  document.getElementById("n-resize" + this.ceilIndex).setAttribute("x1",this.selectCeil.points[0].x);
  document.getElementById("n-resize" + this.ceilIndex).setAttribute("y1",this.selectCeil.points[0].y);
  document.getElementById("n-resize" + this.ceilIndex).setAttribute("x2",this.selectCeil.points[1].x);
  document.getElementById("n-resize" + this.ceilIndex).setAttribute("y2",this.selectCeil.points[1].y);
 
  document.getElementById("e-resize" + this.ceilIndex).setAttribute("x1",this.selectCeil.points[1].x);
  document.getElementById("e-resize" + this.ceilIndex).setAttribute("y1",this.selectCeil.points[1].y);
  document.getElementById("e-resize" + this.ceilIndex).setAttribute("x2",this.selectCeil.points[2].x);
  document.getElementById("e-resize" + this.ceilIndex).setAttribute("y2",this.selectCeil.points[2].y);
   
  document.getElementById("s-resize" + this.ceilIndex).setAttribute("x1",this.selectCeil.points[2].x);
  document.getElementById("s-resize" + this.ceilIndex).setAttribute("y1",this.selectCeil.points[2].y);
  document.getElementById("s-resize" + this.ceilIndex).setAttribute("x2",this.selectCeil.points[3].x);
  document.getElementById("s-resize" + this.ceilIndex).setAttribute("y2",this.selectCeil.points[3].y);
   
  document.getElementById("w-resize" + this.ceilIndex).setAttribute("x1",this.selectCeil.points[3].x);
  document.getElementById("w-resize" + this.ceilIndex).setAttribute("y1",this.selectCeil.points[3].y);
  document.getElementById("w-resize" + this.ceilIndex).setAttribute("x2",this.selectCeil.points[0].x);
  document.getElementById("w-resize" + this.ceilIndex).setAttribute("y2",this.selectCeil.points[0].y);
 }
 
  
//   this.setState({});
}
export const handleCeilAdjustEnd = function (e) {
  let {floors,ceils} = this.state;
  if(e.button == 2){
    document.removeEventListener('mousemove', this.handleCeilAdjustMove);
    document.removeEventListener('mouseup', this.handleCeilAdjustEnd);
    ceils.pop();
    this.setState({},()=>{
      document.getElementById("ceilContextMenu").style.display = "none";
      document.getElementById("ceilImgContextMenu").style.display = "none";
    });
    return;
  }
  e.stopPropagation();
  e.preventDefault();
  let _e = e;
  e = this.eventWarp(e);
  let boolean = false;
  
  floors.map((floor)=>{
    let arr = [];
    floor.points.filter((itemn)=>{
      arr.push([
        itemn.p.x,
        itemn.p.y
      ])
    })
    ceils.map((item)=>{
      if(classifyPoint(arr,[item.center.x,item.center.y])!=1){
        boolean = true;
        item.floor = floor;
        /**
         * 吊顶的四个点在地板区域外时，找到离中心点最近的墙，以此距离作为吊顶的二分之一宽高；
         * 判断四个点是否在封闭区域内；
         * 否：-100，继续判断，直到点在封闭区域内为止；
         */ 
        //全铺的不去判断
        if((classifyPoint(arr,[item.points[0].x,item.points[0].y])!=1 && classifyPoint(arr,[item.points[1].x,item.points[1].y])!=1 && classifyPoint(arr,[item.points[2].x,item.points[2].y])!=1 && classifyPoint(arr,[item.points[3].x,item.points[3].y])!=1) || item.isTiled){
// <<<<<<< HEAD
//           // console.log("out")
// =======
//           console.log(1);
// >>>>>>> bugfix
        }else{
          //arr
          let centp = item.center;
          let disTanceP = [];
          let disTance = [];
          let shortPoint;
          let testPoint;
          floor.points.map((f,index,arr)=>{
            // if(Utils.judgePointInOneLine(f.wall.p1,f.wall.p2,Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp))){
              // if(!shortPoint){
              //   shortPoint = Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp);
              // }else{
              //   if(Utils.getDistance(shortPoint,centp)){

              //   }
              // }
              if(index == 0){
                if(Utils.judgePointInOneLine(f.wall.p1,f.wall.p2,Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp))){
                  shortPoint = Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp);
                }
              }else{
                if(!shortPoint){
                  if(Utils.judgePointInOneLine(f.wall.p1,f.wall.p2,Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp))){
                    shortPoint = Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp);
                  }
                }else{
                  if(Utils.judgePointInOneLine(f.wall.p1,f.wall.p2,Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp)) && Utils.getDistance(centp,Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp))<Utils.getDistance(shortPoint,centp)){
                    shortPoint = Utils.getShortestPoint(f.wall.p1,f.wall.p2,centp);
                  }
                }
              }
            // }
          })
// <<<<<<< HEAD
//           let minDistance = Math.min(...disTance);
//           let o1 = Utils.buildWall({x:centp.x - minDistance,y:centp.y},{x:centp.x + minDistance,y:centp.y},2*minDistance);
// =======
          console.log(shortPoint);
          let offsetDistanceX = Math.abs(shortPoint.x - centp.x);
          let offsetDistanceY = Math.abs(shortPoint.y - centp.y);
          if(offsetDistanceX<400){
            offsetDistanceX = 400;
          }
          if(offsetDistanceY<400){
            offsetDistanceY = 400;
          }

          let o1 = Utils.buildWall({x:centp.x -offsetDistanceX,y:centp.y},{x:centp.x + offsetDistanceX,y:centp.y},2*offsetDistanceY);
// >>>>>>> bugfix
          item.points = [
            o1.p11,
            o1.p21,
            o1.p22,
            o1.p12
          ];
          let o2 = Utils.buildWall({x:centp.x - offsetDistanceX+240,y:centp.y},{x:centp.x + offsetDistanceX-240,y:centp.y},2*offsetDistanceY-480);
          item.ceilModel[0].ceilMsg.modelLength = 2*offsetDistanceX-480;
          item.ceilModel[0].ceilMsg.modelWidth = 2*offsetDistanceY-480;
          item.ceilModel[0].point = o2;
          item.beforePoints = [
            o1.p11,
            o1.p21,
            o1.p22,
            o1.p12
          ]
        }
      }
      
    })
  });
  //floorId[]
  //吊顶存在全铺，且在同一个区域内。合并
  // let arrn = [];

  // ceils.map((ceil,index,arr)=>{
  //   if(!!!ceil.floor){
  //     // message.warning("请放在封闭区域内！");
  //     return;
  //   }
  //   arrn.push(ceil.floor.area);
  // });
  // arrn = Array.from(new Set(arrn));
  // let thisCeilArr;
  // arrn.map((item)=>{
  //   let thisIndex;
  //   let ceilArr = ceils.filter((ceil)=>{
  //     if(!!!ceil.floor){
  //       boolean = false;
  //       return;
  //     }
  //     return item == ceil.floor.area;
  //   })
  //   if(ceilArr.length>1){
  //     ceilArr.filter((itemn,index,arr)=>{
  //       if(itemn.isTiled){
  //         thisIndex = index;
  //         ceilArr.map((ceilA,indexA)=>{
  //           if(indexA != index){
  //             arr[index].ceilModel.push(ceilA.ceilModel[0])
  //           }
  //         })
  //       };
  //     })
  //   }
  //   if(thisIndex != undefined){
  //     ceils.map((itemc,indexn)=>{
  //       if(item == itemc.floor.area && indexn != thisIndex){
  //         debugger;
  //         delete ceils[indexn];
  //       }
  //     })
  //   }
  // })
  // ceils = ceils.filter((e)=>{
  //   return e != undefined;
  // })
  //安放中心在某个吊顶区域内，合并
  ceils.map((c,index)=>{
    if(index != ceils.length -1){
      let pointArr = [];
      c.points.map((point)=>{
        pointArr.push([
          point.x,
          point.y
        ])
      })
      if(classifyPoint(pointArr,[this.selectCeil.center.x,this.selectCeil.center.y])!=1){
        c.ceilModel.push(this.selectCeil.ceilModel[0])
        delete ceils[ceils.length - 1];
      }
    }
  })
  ceils = ceils.filter((e)=>{
    return e != undefined;
  })
  if(boolean){
    this.pStart = this.pEnd = null;
    document.removeEventListener('mousemove', this.handleCeilAdjustMove);
    document.removeEventListener('mouseup', this.handleCeilAdjustEnd);
    this.setState({ceils},()=>{
      window.isChanged = true;
    });
  }else{
    message.warn("请放置在封闭区域内");
    return;
  }
}