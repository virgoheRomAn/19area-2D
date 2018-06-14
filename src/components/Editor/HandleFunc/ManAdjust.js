import Utils from '../Utils';
export const handleManAdjustStart = function (man, e) {
  e.stopPropagation();
  e.preventDefault();
  this.ele = e.target.parentElement;
  e = this.eventWarp(e);
  this.selectMan = man;
  this.pStart = this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  document.addEventListener('mousemove', this.handleManAdjustMove);
  document.addEventListener('mouseup', this.handleManAdjustEnd);
}
export const handleManAdjustMove = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  Object.assign(this.selectMan, {
    x: this.selectMan.x + this.pEnd.x - this.pStart.x,
    y: this.selectMan.y + this.pEnd.y - this.pStart.y,
  })
  this.pStart = this.pEnd;
  this.ele.setAttribute("transform",`translate(${this.selectMan.x-1000},${this.selectMan.y-1000})`)
 
  
  // this.setState({});
}
export const handleManAdjustEnd = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pStart = this.pEnd = null;
  document.removeEventListener('mousemove', this.handleManAdjustMove);
  document.removeEventListener('mouseup', this.handleManAdjustEnd);
  this.setState({},()=>{
    window.isChanged = true;
    if(!!window.BootParams['--takePicture']){
      window.isChanged = false;
    }
  });
}