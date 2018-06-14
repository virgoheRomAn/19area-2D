import Utils from '../Utils';
//画布缩放拖动
export const handleMouseWheel = function (e) {
  let { viewBox } = this.state;
  let { rect } = viewBox;
  let scaleX = viewBox.scaleX || 1;
  let scaleY = viewBox.scaleY || 1;
  let offset = e.deltaY / 100;
  scaleX += offset;
  if (scaleX <= 0.2 || scaleX >= 30) {
    return;
  }
  scaleY += offset;
  if (scaleY <= 0.2 || scaleY >= 30) {
    return;
  }

  //缩放
  viewBox.scaleX = scaleX;
  viewBox.scaleY = scaleY;
  viewBox.height = rect.height * scaleY;
  viewBox.width = rect.width * scaleX;

  //还原x,y
  let reP = { x: e.pageX - rect.left, y: e.pageY - rect.top } //相对位置
  viewBox.x -= reP.x * offset;
  viewBox.y -= reP.y * offset;

  // console.log(viewBox);
  this.refs.svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)
  // this.setState({
  //   viewBox: viewBox
  // });
}
export const handleScaleStart = function (e) {
  // if(window.forbidden){
  //     return ;
  // }
  
  this.pScaleStart = this.pScaleEnd = { x: e.pageX, y: e.pageY };
  document.addEventListener('mousemove', this.handleScaleMove);
  document.addEventListener('mouseup', this.handleScaleEnd);
  this.scaleed = 0;
  // this.setState({});
}
export const handleScaleMove = function (e) {
  this.pScaleEnd = { x: e.pageX, y: e.pageY };
  let { viewBox } = this.state;
  viewBox.x -= (this.pScaleEnd.x - this.pScaleStart.x) * viewBox.scaleX;
  viewBox.y -= (this.pScaleEnd.y - this.pScaleStart.y) * viewBox.scaleY;
  this.pScaleStart = this.pScaleEnd;
  // this.setState({ viewBox });
  this.refs.svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)
  this.scaleed = this.scaleed + 1; //给handleBrushEnd用，如果拖动过屏幕 画笔不能把当前点计算在内
}
export const handleScaleEnd = function () {
  this.pScaleStart = this.pScaleEnd = null;
  document.removeEventListener('mousemove', this.handleScaleMove);
  document.removeEventListener('mouseup', this.handleScaleEnd);
  this.scaleed = 0;
  // this.setState({});
}