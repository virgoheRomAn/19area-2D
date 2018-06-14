import React from 'react'
import './listOne.css'

import { Tooltip,Icon } from 'antd';

export default function PathLine(){
        
    
        let {pathLine} = this.state;
        if(!!!pathLine.length){
            return;
        }
        function drawLineArrow(x1,y1,x2,y2){  
            var path;  
            var slopy,cosy,siny;  
            var Par=100.0;  
            var x3,y3;  
            slopy=Math.atan2((y1-y2),(x1-x2));     
            cosy=Math.cos(slopy);     
            siny=Math.sin(slopy);   
             
            path="M"+x1+","+y1+" L"+x2+","+y2;  
                 
            x3=(Number(x1)+Number(x2))/2;  
            y3=(Number(y1)+Number(y2))/2;  
        
        
            path +=" M"+x3+","+y3;  
              
            path +=" L"+(Number(x3)+Number(Par*cosy-(Par/2.0*siny)))+","+(Number(y3)+Number(Par*siny+(Par/2.0*cosy)));  
        
        
            path +=" M"+(Number(x3)+Number(Par*cosy+Par/2.0*siny)+","+ (Number(y3)-Number(Par/2.0*cosy-Par*siny)));  
            path +=" L"+x3+","+y3;  
            return path;
      }  
        return (
            
            pathLine.map((item,index)=>{
                return (
                    <g
                    key = {index}
                    >
                        <path d={drawLineArrow(item.p1.x+150,item.p1.y+150,item.p2.x+150,item.p2.y+150)} fill="white" stroke="red" strokeWidth="20"   />
                        <path d={drawLineArrow(item.p2.x+150,item.p2.y+150,item.p3.x+320,item.p3.y+320)} fill="white" stroke="red" strokeWidth="20"   />
                        
                    </g>
                )
            })
                
                    
              
        )
            
            
        
    
}