import Utils from '../Utils';
import classifyPoint   from 'robust-point-in-polygon';
import { message} from 'antd';
export const handleCeilAdjustModelStart = function (ceil,e,index,indexn) {
  let {ceils,rulerLine} = this.state; 
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.ceil = ceil;
  this.modelIndex = index;
  this.imgIndex = indexn;
  this.pStart = this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  let item = this.ceil.ceilModel[this.imgIndex];
  let wallArr = []; 
  let distancePoint = {
      "point1":{
          x:item.point.p11.x + (item.point.p21.x - item.point.p11.x)/2,
          y:item.point.p11.y
      },
      "point2":{
        x:item.point.p21.x,
        y:item.point.p21.y + (item.point.p22.y - item.point.p21.y)/2
      },
      "point3":{
        x:item.point.p11.x + (item.point.p21.x - item.point.p11.x)/2,
        y:item.point.p12.y
      },
      "point4":{
        x:item.point.p11.x,
        y:item.point.p21.y + (item.point.p22.y - item.point.p21.y)/2
      }
  }
  
  //修复选择吊顶同时选择门的时候报错
  if(this.ceil.floor){
    this.ceil.floor.points.map((p)=>{
        wallArr.push({
            rotate:p.wall.roate,
            p1:p.wall.p1,
            p2:p.wall.p2
        })
    });
  }
  //吊顶距墙的距离；
  function getRulerLine(type,p1,p2,point,rotate){
    let arr = rulerLine.filter((r)=>{
        return r.type == type;
    })
    if(arr.length == 0){
        let color = '#FF7F66';
        if(Utils.getShortestPoint(p1,p2,point).x < (p1.x+(p2.x-p1.x)/2)+40 && Utils.getShortestPoint(p1,p2,point).x > (p1.x+(p2.x-p1.x)/2)-40 && Utils.getShortestPoint(p1,p2,point).y < p1.y+(p2.y-p1.y)/2+40 && Utils.getShortestPoint(p1,p2,point).y > p1.y+(p2.y-p1.y)/2-40){
            color = '#00CCCB'
        }
        rulerLine.push({
            p1:Utils.getShortestPoint(p1,p2,point),
            p2:point,
            distance:parseInt(Utils.getDistance(Utils.getShortestPoint(p1,p2,point),point)),
            rotate:rotate,
            type:type,
            color:color
          })
    }
    rulerLine.map((r,index,arr)=>{
        if(r.type == type){
            if(r.distance>Utils.getDistance(Utils.getShortestPoint(p1,p2,point),point)){
                let color = '#FF7F66';
                if(Utils.getShortestPoint(p1,p2,point).x < (p1.x+(p2.x-p1.x)/2)+20 && Utils.getShortestPoint(p1,p2,point).x > (p1.x+(p2.x-p1.x)/2)-20 && Utils.getShortestPoint(p1,p2,point).y < p1.y+(p2.y-p1.y)/2+20 && Utils.getShortestPoint(p1,p2,point).y > p1.y+(p2.y-p1.y)/2-20){
                    color = '#00CCCB'
                }
                delete arr[index];
                arr[index] = {
                    p1:Utils.getShortestPoint(p1,p2,point),
                    p2:point,
                    distance:parseInt(Utils.getDistance(Utils.getShortestPoint(p1,p2,point),point)),
                    rotate:rotate,
                    type:type,
                    color:color
    
                  }
            }
        }
    })
  }
  rulerLine.length = 0;
  wallArr.map((w)=>{
      if(w.rotate%180 == 0 && w.p1.y > distancePoint.point1.y){
          if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point1)){
            getRulerLine('b',w.p1,w.p2,distancePoint.point1,90)
            
          }
      }
      if(w.rotate%180 == 0 && w.p1.y < distancePoint.point3.y){
        if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point3)){
            getRulerLine('t',w.p1,w.p2,distancePoint.point3,90);
        }
          
      }
      if(w.rotate%180 == 90 && w.p1.x < distancePoint.point4.x){
          if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point4)){
              getRulerLine('l',w.p1,w.p2,distancePoint.point4,0);
          }
      }
      if(w.rotate%180 == 90 && w.p1.x > distancePoint.point2.x){
          if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point2)){
              getRulerLine('r',w.p1,w.p2,distancePoint.point2,0);
          }
      }
  });
  this.reRnderRulerLine();
  this.ceilX = ceil.ceilModel[indexn].centerPoint.x;
  this.ceilY = ceil.ceilModel[indexn].centerPoint.y;
  this.thisCeilMsg = ceil.ceilModel[indexn].ceilMsg;
  this.positionPoint = ceil.positionPoint;
  document.addEventListener('mousemove', this.handleCeilModelAdjustMove);
  document.addEventListener('mouseup', this.handleCeilModelAdjustEnd);
}
export const handleCeilModelAdjustMove = function (e) {
  let {ceils,rulerLine} = this.state;
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  let centx = this.ceilX + this.pEnd.x - this.pStart.x;
  let centy = this.ceilY + this.pEnd.y - this.pStart.y;
  if(this.ceil.isTiled == false){
    if(centx<=this.positionPoint.x - Math.abs((this.ceil.restrictedArea[1].x - this.ceil.restrictedArea[0].x)/2) + this.thisCeilMsg.modelLength/2){
        centx = this.positionPoint.x  + this.thisCeilMsg.modelLength/2 + 1 - Math.abs((this.ceil.restrictedArea[1].x - this.ceil.restrictedArea[0].x)/2);
      }
      if(centx>=this.positionPoint.x + Math.abs((this.ceil.restrictedArea[1].x - this.ceil.restrictedArea[0].x)/2) - this.thisCeilMsg.modelLength/2 ){
        centx = this.positionPoint.x + Math.abs((this.ceil.restrictedArea[1].x - this.ceil.restrictedArea[0].x)/2) - this.thisCeilMsg.modelLength/2 - 1;
      }
      if(centy<= this.positionPoint.y - Math.abs((this.ceil.restrictedArea[0].y - this.ceil.restrictedArea[3].y)/2) + this.thisCeilMsg.modelWidth/2){
        centy = this.positionPoint.y - Math.abs((this.ceil.restrictedArea[0].y - this.ceil.restrictedArea[3].y)/2) + this.thisCeilMsg.modelWidth/2 + 1;
      }
      if(centy>=this.positionPoint.y + Math.abs((this.ceil.restrictedArea[0].y - this.ceil.restrictedArea[3].y)/2) - this.thisCeilMsg.modelWidth/2){
        centy = this.positionPoint.y + Math.abs((this.ceil.restrictedArea[0].y - this.ceil.restrictedArea[3].y)/2) - this.thisCeilMsg.modelWidth/2 - 1;
      }
  }
  let arr = [];
  this.ceil.restrictedArea.map((item)=>{
    arr.push([
        item.x,
        item.y
    ])
  })
  let boolean = (classifyPoint(arr,[centx - this.thisCeilMsg.modelLength/2,centy - this.thisCeilMsg.modelWidth/2])!=1 && classifyPoint(arr,[centx - this.thisCeilMsg.modelLength/2,centy + this.thisCeilMsg.modelWidth/2])!=1 && classifyPoint(arr,[centx + this.thisCeilMsg.modelLength/2,centy - this.thisCeilMsg.modelWidth/2])!=1 && classifyPoint(arr,[centx + this.thisCeilMsg.modelLength/2,centy + this.thisCeilMsg.modelWidth/2])!=1);
  if(boolean){
    let pointsArr11 = [];
    let pointsArr12 = [];
    let pointsArr21 = [];
    let pointsArr22 = [];
    let distanceArr11 = [];
    let distanceArr12 = [];
    let distanceArr21 = [];
    let distanceArr22 = [];
    let obj = Utils.buildWall(
        {
            x:centx - this.thisCeilMsg.modelLength/2,
            y:centy
        },
        {
            x:centx + this.thisCeilMsg.modelLength/2,
            y:centy
        },this.thisCeilMsg.modelWidth
    );
    this.ceil.restrictedArea.map((point,index,arr)=>{
        if(index<arr.length - 1){
            if(Utils.judgePointInLine(point,arr[index+1],Utils.getShortestPoint(point,arr[index+1],obj.p11))){
                pointsArr11.push(Utils.getShortestPoint(point,arr[index+1],obj.p11));
                distanceArr11.push(Utils.getDistance(obj.p11,Utils.getShortestPoint(point,arr[index+1],obj.p11)));
            } 
            if(Utils.judgePointInLine(point,arr[index+1],Utils.getShortestPoint(point,arr[index+1],obj.p12))){
                pointsArr12.push(Utils.getShortestPoint(point,arr[index+1],obj.p12));
                distanceArr12.push(Utils.getDistance(obj.p12,Utils.getShortestPoint(point,arr[index+1],obj.p12)));
            }
            if(Utils.judgePointInLine(point,arr[index+1],Utils.getShortestPoint(point,arr[index+1],obj.p21))){
                pointsArr21.push(Utils.getShortestPoint(point,arr[index+1],obj.p21));
                distanceArr21.push(Utils.getDistance(obj.p21,Utils.getShortestPoint(point,arr[index+1],obj.p21)));
            }
            if(Utils.judgePointInLine(point,arr[index+1],Utils.getShortestPoint(point,arr[index+1],obj.p22))){
                pointsArr22.push(Utils.getShortestPoint(point,arr[index+1],obj.p22));
                distanceArr22.push(Utils.getDistance(obj.p22,Utils.getShortestPoint(point,arr[index+1],obj.p22)));
            }
        }else{
            pointsArr11.push(Utils.getShortestPoint(point,arr[0],obj.p11));
            pointsArr12.push(Utils.getShortestPoint(point,arr[0],obj.p12));
            pointsArr21.push(Utils.getShortestPoint(point,arr[0],obj.p21));
            pointsArr22.push(Utils.getShortestPoint(point,arr[0],obj.p22));
            distanceArr11.push(Utils.getDistance(obj.p11,Utils.getShortestPoint(point,arr[0],obj.p11)));
            distanceArr12.push(Utils.getDistance(obj.p12,Utils.getShortestPoint(point,arr[0],obj.p12)));
            distanceArr21.push(Utils.getDistance(obj.p21,Utils.getShortestPoint(point,arr[0],obj.p21)));
            distanceArr22.push(Utils.getDistance(obj.p22,Utils.getShortestPoint(point,arr[0],obj.p22)));
        }
    })

    let minDistance11 = Math.min(...distanceArr11);
    let minDistance12 = Math.min(...distanceArr12);
    let minDistance21 = Math.min(...distanceArr21);
    let minDistance22 = Math.min(...distanceArr22);

    if(minDistance11 < 150 && minDistance22 > 150){
        let index = distanceArr11.indexOf(minDistance11);
        centx = centx + pointsArr11[index].x - obj.p11.x +2;
        centy = centy + pointsArr11[index].y - obj.p11.y -2;
        obj = Utils.buildWall(
            {
                x:centx - this.thisCeilMsg.modelLength/2,
                y:centy
            },
            {
                x:centx + this.thisCeilMsg.modelLength/2,
                y:centy
            },this.thisCeilMsg.modelWidth
        );
    }
    if(minDistance22 < 150 && minDistance11 > 150){
        let index = distanceArr22.indexOf(minDistance22);
        centx = centx + pointsArr22[index].x - obj.p22.x - 2;
        centy = centy + pointsArr22[index].y - obj.p22.y + 2;
        obj = Utils.buildWall(
            {
                x:centx - this.thisCeilMsg.modelLength/2,
                y:centy
            },
            {
                x:centx + this.thisCeilMsg.modelLength/2,
                y:centy
            },this.thisCeilMsg.modelWidth
        );
    }
    if(minDistance12 < 150 && minDistance21>150){
        let index = distanceArr12.indexOf(minDistance12);
        centx = centx + pointsArr12[index].x - obj.p12.x+2;
        centy = centy + pointsArr12[index].y - obj.p12.y+2;
        obj = Utils.buildWall(
            {
                x:centx - this.thisCeilMsg.modelLength/2,
                y:centy
            },
            {
                x:centx + this.thisCeilMsg.modelLength/2,
                y:centy
            },this.thisCeilMsg.modelWidth
        );
    }
    if(minDistance21 < 150 && minDistance12>150){
        let index = distanceArr21.indexOf(minDistance21);
        centx = centx + pointsArr21[index].x - obj.p21.x - 2;
        centy = centy + pointsArr21[index].y - obj.p21.y-2;
        obj = Utils.buildWall(
            {
                x:centx - this.thisCeilMsg.modelLength/2,
                y:centy
            },
            {
                x:centx + this.thisCeilMsg.modelLength/2,
                y:centy
            },this.thisCeilMsg.modelWidth
        );
    }
    
    
    // let minIndex = distanceArr.indexOf(minDistance);
    // if(minDistance<450 && minIndex != -1){
    //     //todo:200mm内自动吸附
    //     this.ceil.center.x = pointsArr[minIndex].x;
    //     this.ceil.center.y = pointsArr[minIndex].y ;
    // }else{
        this.ceil.center.x = centx;
        this.ceil.center.y = centy;
    // }
    this.ceil.ceilModel[this.imgIndex].centerPoint = {
        x:centx,
        y:centy
    }
    this.ceil.ceilModel[this.imgIndex].point = Utils.buildWall({x:this.ceil.ceilModel[this.imgIndex].centerPoint.x - this.thisCeilMsg.modelLength/2,y:this.ceil.ceilModel[this.imgIndex].centerPoint.y},{x:this.ceil.ceilModel[this.imgIndex].centerPoint.x + this.thisCeilMsg.modelLength/2,y:this.ceil.ceilModel[this.imgIndex].centerPoint.y},this.thisCeilMsg.modelWidth);
    

  }else{
      //todo:判断距离最短的边（200内），吸附

      return;
  }
  let item = this.deepClone(this.ceil.ceilModel[this.imgIndex]);
//   console.log(item);
/**
 * 吊顶辅助线
 */
  let wallArr = []; 
  let distancePoint = {
      "point1":{
          x:item.point.p11.x + (item.point.p21.x - item.point.p11.x)/2,
          y:item.point.p11.y
      },
      "point2":{
        x:item.point.p21.x,
        y:item.point.p21.y + (item.point.p22.y - item.point.p21.y)/2
      },
      "point3":{
        x:item.point.p11.x + (item.point.p21.x - item.point.p11.x)/2,
        y:item.point.p12.y
      },
      "point4":{
        x:item.point.p11.x,
        y:item.point.p21.y + (item.point.p22.y - item.point.p21.y)/2
      }
  }
  //修复选择吊顶同时选择门的时候报错
  if(this.ceil.floor){
    this.ceil.floor.points.map((p)=>{
        wallArr.push({
            rotate:p.wall.roate,
            p1:p.wall.p1,
            p2:p.wall.p2
        })
    });
  }
  function getRulerLine(type,p1,p2,point,rotate){
    let arr = rulerLine.filter((r)=>{
        return r.type == type;
    })
    if(arr.length == 0){
        let color = '#FF7F66';
        if(Utils.getShortestPoint(p1,p2,point).x < (p1.x+(p2.x-p1.x)/2)+20 && Utils.getShortestPoint(p1,p2,point).x > (p1.x+(p2.x-p1.x)/2)-20 && Utils.getShortestPoint(p1,p2,point).y < p1.y+(p2.y-p1.y)/2+20 && Utils.getShortestPoint(p1,p2,point).y > p1.y+(p2.y-p1.y)/2-20){
            color = '#00CCCB'
        }
        rulerLine.push({
            p1:Utils.getShortestPoint(p1,p2,point),
            p2:point,
            distance:parseInt(Utils.getDistance(Utils.getShortestPoint(p1,p2,point),point)),
            rotate:rotate,
            type:type,
            color:color
          })
    }
    rulerLine.map((r,index,arr)=>{
        if(r.type == type){
            if(r.distance>Utils.getDistance(Utils.getShortestPoint(p1,p2,point),point)){
                let color = '#FF7F66';
                if(Utils.getShortestPoint(p1,p2,point).x < (p1.x+(p2.x-p1.x)/2)+20 && Utils.getShortestPoint(p1,p2,point).x > (p1.x+(p2.x-p1.x)/2)-20 && Utils.getShortestPoint(p1,p2,point).y < p1.y+(p2.y-p1.y)/2+20 && Utils.getShortestPoint(p1,p2,point).y > p1.y+(p2.y-p1.y)/2-20){
                    color = '#00CCCB'
                }
                delete arr[index];
                arr[index] = {
                    p1:Utils.getShortestPoint(p1,p2,point),
                    p2:point,
                    distance:parseInt(Utils.getDistance(Utils.getShortestPoint(p1,p2,point),point)),
                    rotate:rotate,
                    type:type,
                    color:color
    
                  }
            }
        }
    })
  }
  rulerLine.length = 0;
  wallArr.map((w)=>{
    
      if(w.rotate%180 == 0 && w.p1.y > distancePoint.point1.y){
          if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point1)){
            
            getRulerLine('b',w.p1,w.p2,distancePoint.point1,90);
            
          }
      };
      if(w.rotate%180 == 0 && w.p1.y < distancePoint.point3.y){
        if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point3)){
           
              getRulerLine('t',w.p1,w.p2,distancePoint.point3,90);
        };
          
      };
      if(w.rotate%180 == 90 && w.p1.x < distancePoint.point4.x){
          if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point4)){
            
              getRulerLine('l',w.p1,w.p2,distancePoint.point4,0);
          };
      };
      if(w.rotate%180 == 90 && w.p1.x > distancePoint.point2.x){
          if(Utils.judgePointInLine(w.p1,w.p2,distancePoint.point2)){
              getRulerLine('r',w.p1,w.p2,distancePoint.point2,0);
          };
      };
  });
  this.reRnderRulerLine();
  

  //左下
  document.getElementById("sw-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p11.x);
  document.getElementById("sw-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p11.y);
  //下中
  document.getElementById("s-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p11.x + (item.point.p21.x - item.point.p11.x)/2);
  document.getElementById("s-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p11.y);
  //右下
  document.getElementById("se-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p21.x);
  document.getElementById("se-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p21.y);
  //左上
  document.getElementById("nw-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p12.x);
  document.getElementById("nw-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p12.y);
  //左中
  document.getElementById("w-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p12.x);
  document.getElementById("w-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p12.y + (item.point.p11.y - item.point.p12.y)/2);
  //右上
  document.getElementById("ne-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p22.x);
  document.getElementById("ne-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p22.y);
  //右中
  document.getElementById("e-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p22.x);
  document.getElementById("e-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p22.y + (item.point.p21.y - item.point.p22.y)/2);
  //上中
  document.getElementById("n-resize" + this.modelIndex + this.imgIndex).setAttribute("x",item.point.p12.x + (item.point.p22.x - item.point.p12.x)/2);
  document.getElementById("n-resize" + this.modelIndex + this.imgIndex).setAttribute("y",item.point.p22.y);


  
  document.getElementById(this.modelIndex + "ceil_image" + this.imgIndex).setAttribute("x",this.ceil.center.x-this.thisCeilMsg.modelLength/2);
  document.getElementById(this.modelIndex + "ceil_image" + this.imgIndex).setAttribute("y",this.ceil.center.y-this.thisCeilMsg.modelWidth/2);
  document.getElementById(this.modelIndex + "ceil_path" + this.imgIndex).style.display = "none";
  
  
//   this.setState({});
}
export const handleCeilModelAdjustEnd = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.removeRulerLine();
  let {ceils} = this.state;
  document.removeEventListener('mousemove', this.handleCeilModelAdjustMove);
  document.removeEventListener('mouseup', this.handleCeilModelAdjustEnd);
  document.getElementById(this.modelIndex + "ceil_path" + this.imgIndex).style.display = "block";
  this.setState({},()=>{
    window.isChanged = true;
    window.EM.emit("loadCeil");
  });
}