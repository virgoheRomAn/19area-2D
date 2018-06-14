import React from 'react';
import {Card,Row,Col,Icon,Input} from 'antd';
import Button from '../../Public/Button';
export default function(){
    const style = {
        margin: 12,
      };
    let {cameras} = this.state;
    let changeAreaType=(index,val)=>{
        let obj = this.state.cameras;
        obj[index].areaType=val;
        obj[index].cameraTypeVisible=false;
        this.setState({cameras},()=>{
            window.forbidden = false;
        });
      }
    let getStyle =(item)=>{
        return {
            position:"fixed",
            left:(!!item.cardPosition)?item.cardPosition.x:0,
            top:(!!item.cardPosition)?item.cardPosition.y:0,
            display:item.cameraTypeVisible?"block":"none"
        }
    }
    let userDefined =(index)=>{
        let obj = this.state.cameras;
        obj[index].userDefined=true;
        this.setState({cameras});
    }
    let close = (index)=>{
        let obj = this.state.cameras;
        obj[index].cameraTypeVisible=false;
        this.setState({cameras});
    }
    // let styleObj={
    //     display:"none"
    // };
    return cameras.map(function(floor,index){
        return (
            <div key={index} style={getStyle(floor)}>
                <Card
                    title="请选择相机名称"
                    style = {{
                        boxShadow: '4px 4px 20px #000000'
                    }}
                    bodyStyle = {{
                        width:320
                        
                    }}
                   
                >
                    <Row>
                        <Col  span={5}><Button value="主卧" onClick={()=>{changeAreaType(index,"主卧")}}></Button></Col>
                        <Col offset={1} span={5}><Button value="次卧" onClick={()=>{changeAreaType(index,"次卧")}}>次卧</Button></Col>
                        <Col offset={1}  span={5}><Button value="厨房" onClick={()=>{changeAreaType(index,"厨房")}}>厨房</Button></Col>
                        <Col offset={1} span={5}><Button value="卫生间" onClick={()=>{changeAreaType(index,"卫生间")}} >卫生间</Button></Col>
                    </Row>
                    <Row>
                        <Col span={5}><Button value="客厅" onClick={()=>{changeAreaType(index,"客厅")}} >客厅</Button></Col>
                        <Col offset={1} span={5}><Button value="餐厅" onClick={()=>{changeAreaType(index,"餐厅")}} >餐厅</Button></Col>
                        <Col offset={1} span={5}><Button value="客餐厅" onClick={()=>{changeAreaType(index,"客餐厅")}} >客餐厅</Button></Col>
                        <Col offset={1} span={5}><Button value="书房" onClick={()=>{changeAreaType(index,"书房")}} >书房</Button></Col>
                    </Row>
                    <Row>
                        <Col span={5}><Button value="门厅" onClick={()=>{changeAreaType(index,"门厅")}} >门厅</Button></Col>
                        <Col offset={1} span={5}><Button value="玄关" onClick={()=>{changeAreaType(index,"玄关")}} >玄关</Button></Col>
                        <Col offset={1} span={5}><Button value="儿童房"  onClick={()=>{changeAreaType(index,"儿童房")}}>儿童房</Button></Col>
                        <Col offset={1} span={5}><Button value="阳台"  onClick={()=>{changeAreaType(index,"阳台")}} >阳台</Button></Col>
                    </Row>
                    <Row>
                        <Col span={5}><Button value="露台"  onClick={()=>{changeAreaType(index,"露台")}} >露台</Button></Col>
                        <Col offset={1} span={5}><Button value="入户花园"  onClick={()=>{changeAreaType(index,"入户花园")}} >入户花园</Button></Col>
                        <Col offset={1} span={5}><Button value="储物间"  onClick={()=>{changeAreaType(index,"储物间")}} >储物间</Button></Col>
                        <Col offset={1} span={5}><Button value="多功能室"  onClick={()=>{changeAreaType(index,"多功能室")}} >多功能室</Button></Col>
                    </Row>
                    <Row>
                        <Col span={5}><Button value="影视间"   onClick={()=>{changeAreaType(index,"影视间")}}>影视间</Button></Col>
                        <Col offset={1} span={6}><Button  value="步入式衣柜"  onClick={()=>{changeAreaType(index,"步入式衣柜")}}>步入式衣柜</Button></Col>
                        <Col offset={1} span={5}><Button onClick={()=>userDefined(index)} value="自定义" ></Button></Col>
                    </Row>
                    <Row style={{display:floor.userDefined?"block":"none"}}>
                        <Col span={16}><Input id={"input"+index} autoFocus maxLength="8" onKeyDown={(e)=>{
                            if(e.keyCode==13){
                                changeAreaType(index,e.target.value)
                            }
                            
                        }} defaultValue={floor.areaType}/></Col>
                        <Col offset={1} span={6}><button onClick={()=>changeAreaType(index,document.getElementById("input"+index).value)} style={{background:'#fff', border:"1px solid #ccc",cursor:"pointer",height:"28px" }}>确认</button></Col>
                        
                    </Row>
                </Card>
            </div>
            
        )
    })
}