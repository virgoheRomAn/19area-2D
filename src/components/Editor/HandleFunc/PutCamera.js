import Utils from '../Utils';
import inside from 'point-in-polygon';
export const handleCameraAdjustStart = function (Camera, e) {
  let {floors,cameras} = this.state;
  this.ischange = false;
  // Camera.selected = !Camera.selected;
  let ele = e.target;
  this.floors = floors;
  this.cameras = cameras;
  e.stopPropagation();
  e.preventDefault();
  this.ele = e.target.parentNode;
  e = this.eventWarp(e);
  this.selectCamera = Camera;
  this.pStart = this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  this.setState({});
  document.addEventListener('mousemove', this.handleCameraAdjustMove);
  document.addEventListener('mouseup', this.handleCameraAdjustEnd);
}
export const handleCameraAdjustMove = function (e) {
  this.ischange = true;
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pEnd = {
    x: e.pageX,
    y: e.pageY,
  };
  Object.assign(this.selectCamera, {
      position:{
        x: this.selectCamera.position.x + this.pEnd.x - this.pStart.x,
        y: this.selectCamera.position.y + this.pEnd.y - this.pStart.y,
      }
  })
  
  this.pStart = this.pEnd;
  this.selectCamera.selected = true;
  this.camera_ele = document.getElementById(this.selectCamera.mid);
  this.camera_ele.setAttribute("stroke","blue");
  this.ele.setAttribute("transform",`translate(${this.selectCamera.position.x},${this.selectCamera.position.y})`)
  
  //  this.floors.map((floor,index)=>{
  //   let arr = [];
  //   floor.points.map((item)=>{
  //     arr.push([
  //       item.p.x,
  //       item.p.y
  //     ])
  //   })
    
  //   if(inside([this.selectCamera.position.x,this.selectCamera.position.y],arr) && !floor.camera){
  //     floor.camera = true;
  //   }else if(!inside([this.selectCamera.position.x,this.selectCamera.position.y],arr) && floor.camera){
  //     floor.camera = false;
  //   }
  // })

  // this.setState({},()=>{
    this.floors.map((floor)=>{
      let arr = [];
      floor.points.filter((itemn)=>{
        arr.push([
          itemn.p.x,
          itemn.p.y
        ])
      })
      this.cameras.map((item)=>{
        if(!inside([item.position.x,item.position.y],arr)){
          floor.camera = false;
        }
      })
    })
    this.floors.map((floor,index)=>{
      let arr = [];
      floor.points.filter((itemn)=>{
        arr.push([
          itemn.p.x,
          itemn.p.y
        ])
      })
      this.cameras.map((item)=>{
        if(inside([item.position.x,item.position.y],arr)){
          floor.camera = true;
          item.changeImage = true;
          item.floorIndex = index;
        }
      })
    })

  // });

}
export const handleCameraAdjustEnd = function (e) {
  let { cameras } = this.state;
  if(!this.ischange){
    this.selectCamera.selected = !this.selectCamera.selected
    if (this.selectCamera.selected) {
      
      cameras.forEach((camera) => { camera.selected = false });
      this.selectCamera.selected = true;
    }
  }else{
    cameras.forEach((camera) => { camera.selected = false });
    this.selectCamera.selected = !this.selectCamera.selected
  }
  e.stopPropagation();
  e.preventDefault();
  e = this.eventWarp(e);
  this.pStart = this.pEnd = null;
  document.removeEventListener('mousemove', this.handleCameraAdjustMove);
  document.removeEventListener('mouseup', this.handleCameraAdjustEnd);
  this.setState({cameras});
}
//摆放物体
export const handlePutStartCamera = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e)
    window.forbidden = true;
    this.visibleTwice = false;
    let {cameras,floors} = this.state;
    cameras.push({
        position:{
            x:e.pageX-250,
            y: e.pageY-250,
        } ,
        selected:false,
        mid:cameras.length,
        kid:"c_"+Math.random()+Date.now(),
        cameraTypeVisible:false,
        userDefined:false,
        areaType:"",
        pathTrue:false
    })
    this.setState({})
   document.addEventListener('mousemove', this.handlePutMoveCamera);
}

export const handlePutDownCamera = function (e) {
    e.stopPropagation();
    e.preventDefault();
    //右键取消
    if (e.button == 2) {

    } else {
        document.removeEventListener('mousemove', this.handlePutMoveCamera);
        
        //todo:显示选择房间类型
        if(this.visibleTwice == false){
          let {cameras} = this.state;
          cameras[cameras.length-1].cardPosition = {
            x:e.pageX,
            y:e.pageY
          }
          cameras[cameras.length-1].cameraTypeVisible = true;
          this.visibleTwice = true;
        }
        
        this.setState({});
        
    }
}
export const handlePutMoveCamera = function (e) {
    e = this.eventWarp(e);
    
    let { cameras,floors, } = this.state;
    this.camerasPut = cameras;
    this.floorsPut = floors;
    this.camerasPut[cameras.length-1].position = {
        x:e.pageX-250,
        y:e.pageY-250
    }
    this.floorsPut.map((floor)=>{
        let arr = [];
        floor.points.filter((itemn)=>{
          arr.push([
            itemn.p.x,
            itemn.p.y
          ])
        })
        cameras.map((item)=>{
          if(!inside([item.position.x,item.position.y],arr)){
            floor.camera = false;
          }
        })
    })
    this.floorsPut.map((floor,index)=>{
        let arr = [];
        floor.points.filter((itemn)=>{
          arr.push([
            itemn.p.x,
            itemn.p.y
          ])
        })
        this.camerasPut.map((item)=>{
          if(inside([item.position.x,item.position.y],arr)){
            floor.camera = true;
            item.changeImage = true;
            item.floorIndex = index;
          }
        })
    })
    
     document.getElementById(cameras[cameras.length-1].mid +"1").setAttribute("transform",`translate(${this.camerasPut[cameras.length-1].position.x},${this.camerasPut[cameras.length-1].position.y})`)
}