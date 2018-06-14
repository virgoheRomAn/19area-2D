import Utils, { getDistance } from '../../Editor/Utils'
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

  //滚动后重绘
  clearTimeout(this.handleMouseWheelTimer);
  this.handleMouseWheelTimer = setTimeout(() => {
    // console.log("handleMouseWheelTimer");
    this.setState({ __record__: false });
  }, 100);  //时间可调，如果缩放卡顿就调大一点
}
export const handleScaleStart = function (e) {
  // if(window.forbidden){
  //     return ;
  // }

  this.pScaleStart = this.pScaleEnd = { x: e.pageX, y: e.pageY };
  document.addEventListener('mousemove', this.handleScaleMove);
  document.addEventListener('mouseup', this.handleScaleEnd);
  this.scaleed = 0;


  //还原选中状态
  let { data: { shapes }, } = this.state;
  shapes.forEach((shape) => {
    shape.active = false;
    shape.boxRectLines = null;
  });
  let shape = shapes.find(x => x.id == 'id_shape_top');
  shape.active = true;
  let distanceLines = shape.lines.map((line) => {
    return {
      p1: { ...line.p1 },
      p2: { ...line.p2 },
      distance: getDistance(line.p1, line.p2),
      readOnly: true,
      callback: () => { }
    }
  })

  //fixbug 20180517 给距离辅助线时间来触发 onBlur 
  setTimeout(() => {
    this.setState({
      __record__: false,
      distanceLines: distanceLines,
    });
  }, 50)
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

  //拖动后重绘
  clearTimeout(this.handleMouseWheelTimer);
  this.handleMouseWheelTimer = setTimeout(() => {
    // console.log("handleMouseWheelTimer");
    this.setState({ __record__: false });
  }, 100);  //时间可调，如果缩放卡顿就调大一点
}
export const handleScaleEnd = function () {
  this.pScaleStart = this.pScaleEnd = null;
  document.removeEventListener('mousemove', this.handleScaleMove);
  document.removeEventListener('mouseup', this.handleScaleEnd);
  this.scaleed = 0;
  this.setState({ __record__: false });
}