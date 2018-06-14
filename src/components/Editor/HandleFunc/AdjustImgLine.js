import Utils from '../Utils';
import classifyPoint   from 'robust-point-in-polygon';
export const handleLineImgAdjustStart = function (line, e , target ,index1,index2,index,imgIndex) {
    this.removeRulerLine();
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e);
    this.pStart = this.pEnd = {
      x: e.pageX,
      y: e.pageY,
    };
    this.selectCeil = line;
    this.target = target;
    this.ceilIndex = index;
    this.index1 = index1;
    this.index2 = index2;
    this.imgIndex = imgIndex;
    this.canst1X = 
  document.addEventListener('mousemove', this.handleLineImgAdjustMove);
  document.addEventListener('mouseup', this.handleLineImgAdjustEnd);
}
export const handleLineImgAdjustMove = function (e) {
    let {ceils} = this.state;
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e);
    this.pEnd = {
      x: e.pageX,
      y: e.pageY,
    };
  if(this.target == "x"){
    let arr = [];
    this.selectCeil.restrictedArea.map((item)=>{
      arr.push([
        item.x,
        item.y
      ])
    })
    let point1x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
    let point1y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y;
    let point2x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].x + this.pEnd.x - this.pStart.x;
    let point2y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].y;
    let booleanInLine = false;
    if(classifyPoint(arr,[point1x,point1y])!=1 && classifyPoint(arr,[point2x,point2y])!=1){
      booleanInLine = true;
    }
    if(booleanInLine){
      this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
      this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].x + this.pEnd.x - this.pStart.x;
    }
  }else if(this.target == "y"){
    let arr = [];
    this.selectCeil.restrictedArea.map((item)=>{
      arr.push([
        item.x,
        item.y
      ])
    })
    let point1x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x;
    let point1y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
    let point2x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].x;
    let point2y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].y + this.pEnd.y - this.pStart.y;
    let booleanInLine = false;
    if(classifyPoint(arr,[point1x,point1y])!=1 && classifyPoint(arr,[point2x,point2y])!=1){
      booleanInLine = true;
    }
    if(booleanInLine){
      this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
      this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index2}`].y + this.pEnd.y - this.pStart.y;
    }
      
  }else{
    if(this.index1 == 11){
      let arr = [];
      this.selectCeil.restrictedArea.map((item)=>{
        arr.push([
          item.x,
          item.y
        ])
      });
      let point1x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
      let point1y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
      let point2x = this.selectCeil.ceilModel[this.imgIndex].point[`p12`].x + this.pEnd.x - this.pStart.x;
      let point2y = this.selectCeil.ceilModel[this.imgIndex].point[`p12`].y;
      let point3x = this.selectCeil.ceilModel[this.imgIndex].point[`p21`].x;
      let point3y = this.selectCeil.ceilModel[this.imgIndex].point[`p21`].y + this.pEnd.y - this.pStart.y;
      if(classifyPoint(arr,[point1x,point1y])!=1 && classifyPoint(arr,[point2x,point2y])!=1 && classifyPoint(arr,[point3x,point3y])!=1){
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
        this.selectCeil.ceilModel[this.imgIndex].point[`p12`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p12`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p21`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p21`].y + this.pEnd.y - this.pStart.y;
      }
    
    }else if(this.index1 == 21){
      let arr = [];
      this.selectCeil.restrictedArea.map((item)=>{
        arr.push([
          item.x,
          item.y
        ])
      });
      let point1x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
      let point1y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
      let point2x = this.selectCeil.ceilModel[this.imgIndex].point[`p22`].x + this.pEnd.x - this.pStart.x;
      let point2y = this.selectCeil.ceilModel[this.imgIndex].point[`p22`].y;
      let point3x = this.selectCeil.ceilModel[this.imgIndex].point[`p11`].x;
      let point3y = this.selectCeil.ceilModel[this.imgIndex].point[`p11`].y + this.pEnd.y - this.pStart.y;
      if(classifyPoint(arr,[point1x,point1y])!=1 && classifyPoint(arr,[point2x,point2y])!=1 && classifyPoint(arr,[point3x,point3y])!=1){
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
        this.selectCeil.ceilModel[this.imgIndex].point[`p22`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p22`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p11`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p11`].y + this.pEnd.y - this.pStart.y;
      }
        
    }else if(this.index1 == 12){
      let arr = [];
      this.selectCeil.restrictedArea.map((item)=>{
        arr.push([
          item.x,
          item.y
        ])
      })
      let point1x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
      let point1y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
      let point2x = this.selectCeil.ceilModel[this.imgIndex].point[`p11`].x + this.pEnd.x - this.pStart.x;
      let point2y = this.selectCeil.ceilModel[this.imgIndex].point[`p11`].y;
      let point3x = this.selectCeil.ceilModel[this.imgIndex].point[`p22`].x;
      let point3y = this.selectCeil.ceilModel[this.imgIndex].point[`p22`].y + this.pEnd.y - this.pStart.y;
      if(classifyPoint(arr,[point1x,point1y])!=1 && classifyPoint(arr,[point2x,point2y])!=1 && classifyPoint(arr,[point3x,point3y])!=1){
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
        this.selectCeil.ceilModel[this.imgIndex].point[`p11`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p11`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p22`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p22`].y + this.pEnd.y - this.pStart.y;
      }
    }else{
      let arr = [];
      this.selectCeil.restrictedArea.map((item)=>{
        arr.push([
          item.x,
          item.y
        ])
      });
      let point1x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
      let point1y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
      let point2x = this.selectCeil.ceilModel[this.imgIndex].point[`p21`].x + this.pEnd.x - this.pStart.x;
      let point2y = this.selectCeil.ceilModel[this.imgIndex].point[`p21`].y;
      let point3x = this.selectCeil.ceilModel[this.imgIndex].point[`p12`].x;
      let point3y = this.selectCeil.ceilModel[this.imgIndex].point[`p12`].y + this.pEnd.y - this.pStart.y;
      if(classifyPoint(arr,[point1x,point1y])!=1 && classifyPoint(arr,[point2x,point2y])!=1 && classifyPoint(arr,[point3x,point3y])!=1){
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p${this.index1}`].y + this.pEnd.y - this.pStart.y;
        this.selectCeil.ceilModel[this.imgIndex].point[`p21`].x = this.selectCeil.ceilModel[this.imgIndex].point[`p21`].x + this.pEnd.x - this.pStart.x;
        this.selectCeil.ceilModel[this.imgIndex].point[`p12`].y = this.selectCeil.ceilModel[this.imgIndex].point[`p12`].y + this.pEnd.y - this.pStart.y;
      }
        
    }
    
  }
    this.selectCeil.ceilModel[this.imgIndex].centerPoint = Utils.getCenterPoint([this.selectCeil.ceilModel[this.imgIndex].point[`p11`],this.selectCeil.ceilModel[this.imgIndex].point[`p22`],this.selectCeil.ceilModel[this.imgIndex].point[`p21`],this.selectCeil.ceilModel[this.imgIndex].point[`p12`]])
    this.selectCeil.ceilModel[this.imgIndex].ceilMsg.modelLength = Math.abs(this.selectCeil.ceilModel[this.imgIndex].point[`p22`].x - this.selectCeil.ceilModel[this.imgIndex].point[`p12`].x);
    this.selectCeil.ceilModel[this.imgIndex].ceilMsg.modelWidth = Math.abs(this.selectCeil.ceilModel[this.imgIndex].point[`p22`].y - this.selectCeil.ceilModel[this.imgIndex].point[`p21`].y);
    let item = this.deepClone(this.selectCeil.ceilModel[this.imgIndex]);
    this.pStart = this.pEnd;
    let imgd = `M${item.point.p11.x} ${item.point.p11.y} L${item.point.p21.x} ${item.point.p21.y} ${item.point.p22.x} ${item.point.p22.y} ${item.point.p12.x} ${item.point.p12.y} Z`;
    document.getElementById(this.ceilIndex + "ceil_path" + this.imgIndex).setAttribute("d",imgd)
 
  //左下
  document.getElementById("sw-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p11.x);
  document.getElementById("sw-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p11.y);
  //下中
  document.getElementById("s-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p11.x + (item.point.p21.x - item.point.p11.x)/2);
  document.getElementById("s-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p11.y);
  //右下
  document.getElementById("se-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p21.x);
  document.getElementById("se-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p21.y);
  //左上
  document.getElementById("nw-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p12.x);
  document.getElementById("nw-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p12.y);
  //左中
  document.getElementById("w-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p12.x);
  document.getElementById("w-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p12.y + (item.point.p11.y - item.point.p12.y)/2);
  //右上
  document.getElementById("ne-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p22.x);
  document.getElementById("ne-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p22.y);
  //右中
  document.getElementById("e-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p22.x);
  document.getElementById("e-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p22.y + (item.point.p21.y - item.point.p22.y)/2);
  //上中
  document.getElementById("n-resize" + this.ceilIndex + this.imgIndex).setAttribute("x",item.point.p12.x + (item.point.p22.x - item.point.p12.x)/2);
  document.getElementById("n-resize" + this.ceilIndex + this.imgIndex).setAttribute("y",item.point.p22.y);

  document.getElementById(this.ceilIndex + "ceil_image"+this.imgIndex).setAttribute("x",item.centerPoint.x - Math.abs(item.point.p12.x - item.point.p22.x)/2);
  document.getElementById(this.ceilIndex + "ceil_image"+this.imgIndex).setAttribute("y",item.centerPoint.y - Math.abs(item.point.p11.y - item.point.p12.y)/2);
  document.getElementById(this.ceilIndex + "ceil_image"+this.imgIndex).setAttribute("width",Math.abs(item.point.p12.x - item.point.p22.x));
  document.getElementById(this.ceilIndex + "ceil_image"+this.imgIndex).setAttribute("height",Math.abs(item.point.p11.y - item.point.p12.y));
}
export const handleLineImgAdjustEnd = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pStart = this.pEnd = null;
  document.removeEventListener('mousemove', this.handleLineImgAdjustMove);
  document.removeEventListener('mouseup', this.handleLineImgAdjustEnd);
  this.setState({},()=>{
    window.isChanged = true;
    window.EM.emit("loadCeil");
  });
}