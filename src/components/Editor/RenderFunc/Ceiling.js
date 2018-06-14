import React from 'react';

export const getCeils= function(ceil,index){
    let d = "M";
    ceil.points.map((point)=>{
        d+=point.x+" "+point.y+" L"
    })
    d = d.slice(0,d.length-2) + " Z";
    return (
        <g  
            style = {{display:ceil.show?"":"none"}}
            id = {ceil.cid}
            key = {ceil.cid}>
            <path 
                onMouseDown = {(e)=>{
                    let {ceils} = this.state;
                    if(e.button == 2){
                        
                        ceils.map((ceil)=>{
                            ceil.select = false;
                            ceil.canScale = false;
                        })
                        ceil.select = true;
                        // let {handleCeil} = this.state;
                        // handleCeil = ceil;
                        // if(ceil.isTiled){
                        //     document.getElementById("doceil").style.display = "none";
                        //     document.getElementById("cancel").style.display = "block";
                        // }else{
                        //     document.getElementById("doceil").style.display = "block";
                        //     document.getElementById("cancel").style.display = "none";
                        // }
                        document.getElementById("ceilContextMenu").style.display = "block";
                        document.getElementById("ceilContextMenu").style.left = e.pageX+"px";
                        document.getElementById("ceilContextMenu").style.top = e.pageY+"px";
                        document.getElementById("ceilContextMenu_input").style.display = "none";
                        this.setState({})
                        return;
                    }
                    ceils.map((ceil)=>{
                        ceil.select = false;
                        ceil.canScale = false;
                    })
                    ceil.select = true;
                    ceil.canScale = true;
                    this.setState({})
                }}
                id={"ceilPath" + index}
                d = {d}
                fill='#EDEDED'
                fillOpacity='.95'
                strokeWidth='30'
                strokeOpacity = ".6"
                stroke='#19CECD'
            />
            {!ceil.isTiled && ceil.select && ceil.canScale && <g>

            {/* 拖动点 */}
            {/* 下 */}
            {/* 左下 */}
            <rect
                id = {"sw-resize" + index}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'xy' ,0,3,index)
                }}
                style = {{
                    cursor:"sw-resize"
                }}
                x={ceil.points[0].x}
                y={ceil.points[0].y} 
                width="100" 
                height="100"
                transform={'translate(-50, -50)'}
                fill="#ffffff" /> 
            {/* 下中 */}
            <rect
                id = {"s-resize"+index}
                style = {{
                    cursor:"s-resize"
                }}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'y' ,0,1,index)
                }}
                x={ceil.points[0].x + (ceil.points[1].x - ceil.points[0].x)/2}
                y={ceil.points[0].y } 
                width="100" 
                height="100"
                transform={'translate(-50, -50)'}
                fill="#ffffff" />
            
            {/* 右下 */}
            <rect
                id = {"se-resize" + index}
                style = {{
                    cursor:"se-resize"
                }}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'xy' ,1,3,index)
                }}
                x={ceil.points[1].x}
                y={ceil.points[1].y}
                width="100" 
                height="100"
                transform={'translate(-50, -50)'} 
                fill="#ffffff" /> 

            {/* 左 */}
            {/* 左上 */}
            <rect
                id = { "nw-resize" + index}
                style = {{
                    cursor:"nw-resize"
                }}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'xy' ,3,3,index)
                }}
                x={ceil.points[3].x}
                y={ceil.points[3].y} 
                width="100" 
                height="100"
                transform={'translate(-50, -50)'}
                fill="#ffffff" /> 
            {/* 左中 */}
            <rect
                id = {"w-resize" + index} 
                style = {{
                    cursor:"w-resize"
                }}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'x' ,0,3,index)
                }}
                x={ceil.points[3].x}
                y={ceil.points[3].y + (ceil.points[0].y - ceil.points[3].y)/2} 
                width="100" 
                height="100"
                transform={'translate(-50, -50)'}
                fill="#ffffff" /> 
            {/* 右上 */}
            <rect
                id = {"ne-resize" + index}
                style = {{
                    cursor:"ne-resize"
                }}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'xy' ,2,3,index)
                }}
                x={ceil.points[2].x}
                y={ceil.points[2].y} 
                width="100" 
                height="100"
                transform={'translate(-50, -50)'}
                fill="#ffffff" /> 
            {/* 右中 */}
            <rect
                id = {"e-resize" + index}
                style = {{
                    cursor:"e-resize"
                }}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'x' ,1,2,index)
                }}
                x={ceil.points[2].x}
                y={ceil.points[2].y + (ceil.points[1].y - ceil.points[2].y)/2} 
                width="100" 
                height="100"
                transform={'translate(-50, -50)'}
                fill="#ffffff" /> 
            {/* 上中 */}
            <rect
                id = {"n-resize" + index}
                style = {{
                    cursor:"n-resize"
                }}
                onMouseDown = {(e)=>{
                    this.handleLineAdjustStart(ceil, e , 'y' ,2,3,index)
                }}
                x={ceil.points[3].x + (ceil.points[2].x - ceil.points[3].x)/2}
                y={ceil.points[2].y} 
                width="100" 
                height="100"
                transform={'translate(-50, -50)'}
                fill="#ffffff" /> 
            
            </g>}
             {ceil.ceilModel.map((item,indexn)=>{
                 let imgd = `M${item.point.p11.x} ${item.point.p11.y} L${item.point.p21.x} ${item.point.p21.y} ${item.point.p22.x} ${item.point.p22.y} ${item.point.p12.x} ${item.point.p12.y} Z`;
                 
                
                 return (
                     <g 
                        key = {index + "" + indexn}
                     >
                         <path 
                            id = {index + "ceil_path" + indexn}
                            d = {imgd}
                            fill='transparent'
                            fillOpacity=''
                            strokeWidth='30'
                            stroke={item.errStyle?'red':'#19CECD'}
                            
                        />
                        
                 
                        <image 
                            id = {index + "ceil_image"+indexn}
                            onMouseDown = {(e)=>{
                                let {ceils} = this.state;
                                e.stopPropagation();
                                ceils.map((ceil)=>{
                                    ceil.ceilModel.map((c)=>{
                                        c.canScale = false;
                                    })
                                })
                                item.canScale = true;
                                let obj = ceil.ceilModel[indexn];
                                ceil.ceilModel.splice(indexn,1);
                                ceil.ceilModel.push(obj);
                                if(e.button == 2){
                                    document.getElementById("ceilImgContextMenu").style.display = "block";
                                    document.getElementById("ceilImgContextMenu").style.left = e.pageX + "px";
                                    document.getElementById("ceilImgContextMenu").style.top = e.pageY + "px";
                                }else{
                                    this.handleCeilAdjustModelStart(ceil,e,index,ceil.ceilModel.length -1);
                                }
                                this.setState({ceils})
                            }}
                            x={item.centerPoint.x - Math.abs(item.point.p12.x - item.point.p22.x)/2}
                            y={item.centerPoint.y - Math.abs(item.point.p11.y - item.point.p12.y)/2}
                            width={Math.abs(item.point.p12.x - item.point.p22.x)}
                            height={Math.abs(item.point.p11.y - item.point.p12.y)}
                            preserveAspectRatio="none"
                            xlinkHref={item.imgFilePath}
                        />
                        {item.canScale && <g id = {index + "ceil_g"+indexn}>

                        {/* 拖动点 */}
                        {/* 下 */}
                        {/* 左下 */}
                        <rect 
                            id = {"sw-resize" + index + indexn}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'xy' ,11,0,index,indexn)
                            }}
                            style = {{
                                cursor:"sw-resize"
                            }}
                            x={item.point.p11.x}
                            y={item.point.p11.y} 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                             fill="#ffffff" /> 
                        {/* 下中 */}
                        <rect
                            id = {"s-resize"+index + indexn}
                            style = {{
                                cursor:"s-resize"
                            }}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'y' ,11,21,index,indexn)
                            }}
                            x={item.point.p11.x + (item.point.p21.x - item.point.p11.x)/2}
                            y={item.point.p11.y } 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                            fill="#ffffff" />
                        
                        {/* 右下 */}
                        <rect
                            id = {"se-resize" + index + indexn}
                            style = {{
                                cursor:"se-resize"
                            }}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'xy' ,21,0,index,indexn)
                            }}
                            x={item.point.p21.x}
                            y={item.point.p21.y} 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                              fill="#ffffff" /> 

                        {/* 左 */}
                        {/* 左上 */}
                        <rect
                            id = { "nw-resize" + index + indexn}
                            style = {{
                                cursor:"nw-resize"
                            }}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'xy' ,12,0,index,indexn)
                            }}
                            x={item.point.p12.x}
                            y={item.point.p12.y} 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                            fill="#ffffff" /> 
                        {/* 左中 */}
                        <rect
                            id = {"w-resize" + index + indexn} 
                            style = {{
                                cursor:"w-resize"
                            }}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'x' ,11,12,index,indexn)
                            }}
                            x={item.point.p12.x}
                            y={item.point.p12.y + (item.point.p11.y - item.point.p12.y)/2} 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                            fill="#ffffff" /> 
                        {/* 右上 */}
                        <rect
                            id = {"ne-resize" + index + indexn}
                            style = {{
                                cursor:"ne-resize"
                            }}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'xy' ,22,0,index,indexn)
                            }}
                            x={item.point.p22.x}
                            y={item.point.p22.y} 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                            fill="#ffffff" /> 
                        {/* 右中 */}
                        <rect
                            id = {"e-resize" + index + indexn}
                            style = {{
                                cursor:"e-resize"
                            }}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'x' ,21,22,index,indexn)
                            }}
                            x={item.point.p22.x}
                            y={item.point.p22.y + (item.point.p21.y - item.point.p22.y)/2} 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                            fill="#ffffff" /> 
                        {/* 上中 */}
                        <rect
                            id = {"n-resize" + index + indexn}
                            style = {{
                                cursor:"n-resize"
                            }}
                            onMouseDown = {(e)=>{
                                this.handleLineImgAdjustStart(ceil, e , 'y' ,12,22,index,indexn)
                            }}
                            x={item.point.p12.x + (item.point.p22.x - item.point.p12.x)/2}
                            y={item.point.p22.y} 
                            width="100" 
                            height="100"
                            transform={'translate(-50, -50)'}
                            fill="#ffffff" /> 
                        
                        </g>}
                    </g>
                 )
             })} 
            
            {/* <circle
                
            cx={ceil.center.x}
            cy={ceil.center.y} 
            r="150"  fill="red" /> */}
            
            
        </g>
    )
}

export default function (ceils) {
    // console.log(doors)
    // let { doors } = this.state;
    return (
        ceils.map((ceil, index) => {
        return this.getCeils(ceil,index);
      })
    );
  }