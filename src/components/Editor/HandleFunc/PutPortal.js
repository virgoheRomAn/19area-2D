import Utils from '../Utils';
import inside from 'point-in-polygon';
export const handlePortalAdjustStart = function (Portal, e,index) {
  
  let {portals} = this.state;
  this.ischange = false;
  // Camera.selected = !Camera.selected;
  let ele = e.target;
  this.Portals = portals;
  let {selectPortal}  = this.state;
  selectPortal.selectVisible = !Portal.selected;
  selectPortal.position={
    x:e.pageX,
    y:e.pageY
  }
  selectPortal.portalIndex = index;
  e.stopPropagation();
  e.preventDefault();
  this.ele = e.target.parentNode;
  e = this.eventWarp(e);
  this.selectPortal = Portal;
  this.pStart = this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  
  this.setState({selectPortal});
  // document.addEventListener('mousemove', this.handlePortalAdjustMove);
  // document.addEventListener('mouseup', this.handlePortalAdjustEnd);
}
export const handlePortalAdjustMove = function (e) {
  if(window.forbidden){
    return ;
  }
  this.ischange = true;
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  Object.assign(this.selectPortal, {
      position:{
        x: this.selectPortal.position.x + this.pEnd.x - this.pStart.x,
        y: this.selectPortal.position.y + this.pEnd.y - this.pStart.y,
      }
  })
  
  this.pStart = this.pEnd;
  this.selectPortal.selected = true;
  this.Portal_ele = document.getElementById(this.selectPortal.mid);
  this.Portal_ele.setAttribute("stroke","blue");
  this.ele.setAttribute("transform",`translate(${this.selectPortal.position.x},${this.selectPortal.position.y})`);
  document.getElementById("selectportal").style.display = "none";
}
export const handlePortalAdjustEnd = function (e) {
  let { portals } = this.state;
  if(!this.ischange){
    this.selectPortal.selected = !this.selectPortal.selected
    if (this.selectPortal.selected) {
      
        portals.forEach((Portal) => { Portal.selected = false });
      this.selectPortal.selected = true;
    }
  }else{
    portals.forEach((Portal) => { Portal.selected = false });
    this.selectPortal.selected = !this.selectPortal.selected
  }
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pStart = this.pEnd = null;
  document.removeEventListener('mousemove', this.handlePortalAdjustMove);
  document.removeEventListener('mouseup', this.handlePortalAdjustEnd);
  this.setState({});
}


/**
 * 
 * 传送点的生成和摆放 
 */
export const handlePutStartPortal = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e)
  let {portals,selectPortal} = this.state;
  this.visibleTwo = false;
  portals.push({
    position:{
        x: e.pageX-160,
        y: e.pageY-160,
    } ,
    selected:false,
    mid:portals.length
})
  selectPortal.portalIndex = portals.length-1;
  window.forbidden = true;
  this.setState({})
//  document.addEventListener('mousemove', this.handlePutMovePortal);

}

export const handlePutDownPortal = function (e) {
  e.stopPropagation();
  e.preventDefault();
  //右键取消
  if (e.button == 2) {

  } else {
      document.removeEventListener('mousemove', this.handlePutMovePortal);
      if(this.visibleTwo == false){
        let {selectPortal,portals,maskingPoint}  = this.state;
        selectPortal.selectVisible = true;
        selectPortal.position={
          x:e.pageX,
          y:e.pageY
        }
        this.portalPut[portals.length-1].putDown = true;
        this.visibleTwo = true;
        maskingPoint.points.length = 0;
      }
      
      //todo:显示选择房间类型
   
      
      this.setState({});
      
  }
}
export const handlePutMovePortal = function (e) {
  e = this.eventWarp(e);
  
  let { portals,floors, } = this.state;
  this.portalPut = portals;
  this.portalPut[portals.length-1].position = {
      x:e.pageX-160,
      y:e.pageY-160
  }
   document.getElementById(portals[portals.length-1].mid +"1").setAttribute("transform",`translate(${this.portalPut[portals.length-1].position.x},${this.portalPut[portals.length-1].position.y})`)
}