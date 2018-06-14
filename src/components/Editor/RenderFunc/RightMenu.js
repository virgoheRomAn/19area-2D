import React from 'react';
import { Popconfirm, message, Input } from 'antd'
message.config({
  top: 100,
  duration: 2,
});
export default function () {
    let { doors } = this.state;
    if (!!!doors[0]) {
        return;
    } 
    let inputval="";
    let cancel=(index)=>{
        let doon=this.state.doors;
        doon[index].showmenu=false;
        this.setState({doors:doon});
    }
    // let changeOk=(index,val)=>{

    //     this.setState(itemn);
    // }
    let confirm = (e, index, val) => {
        if (val == "" || val < 0 || isNaN(val)) {
            message.warning("请输入正确内容！");
            return;
        }
        let doon = this.state.doors;
        let valHeight=parseInt(val)+doon[index].modelHeight;
        if(valHeight>window.wallHeight){
            //提示错误
            message.error("不能超过墙的高度！");
            return;
        }
        doon[index].showmenu=false;
        doon[index].h=parseInt(val);
        
        this.setState({doors:doon});
        message.success("设置成功！");
    }
    return doors.map(function (item, index) {

        let styleObj = {
            left: `${item.menuL}px`,
            top: `${item.menuT}px`,
            display: item.showmenu ? "block" : "none"
        }

        return (
            <div style={styleObj} className="rightMenu" key={index}>
                {/* <Popconfirm onCancel={() => {
                    cancel(index)
                }}
                    onConfirm={function(e) {
                        console.log(inputval)
                        confirm(e, index, inputval);
                    }}
                    title={
                        <Input  key={Math.random()} onKeyUp={function (e) {
                            e = e || window.event;
                            inputval = e.target.value;
                            console.log(inputval)
                        }} defaultValue={item.h}></Input>
                    }
                > */}
                   
                    <p><span className="icon_IVS"></span><span>离地</span><input onKeyUp={(e)=>{
                        if(e.keyCode==13){
                            confirm(e, index, e.target.value);
                        }
                    }} key={index} autoFocus defaultValue={item.h} type="text" /></p>
                {/* </Popconfirm> */}
                {/* <p><span className="icon_split"></span>拆分</p>
                <p><span className="icon_delete"></span>删除 Del.</p> */}
            </div>
        )
    })

}