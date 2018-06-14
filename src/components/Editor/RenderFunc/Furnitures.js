import React from 'react';
export default function () {
    let { furnitures } = this.state;
    //20170822 暂时不渲染家具
    // return null;
    // if(window.ceiling){
    //     return null;
    // }
    return (
        furnitures.map((furniture,index) => {
            return (
                // <g
                    
                //     transform = {`translate(${furniture.g[0]*10-furniture.q[0]/2}, ${furniture.g[1]*10-furniture.q[1]/2}) rotate(${furniture.h[0]+90}, ${furniture.q[0]/2}, ${furniture.q[1]/2})`}
                //     key={furniture.g[0]+furniture.g[1]+furniture.h[0]}
                    
                // >
                    
                // <circle
                //          cx={furniture.g[0]*10-furniture.q[0]/2}
                //           cy={furniture.g[1]*10-furniture.q[1]/2} 
                //           r="150"  fill={furniture.fillColor} />  
                //     <rect
                //         style={{display:furniture.selected?'block':'none'}}
                //         stroke='#00CCCB'
                //             fill="rgba(0,0,0,0)"
                //             strokeWidth='10'
                //             x={0}
                //             y={0}
                //             width={furniture.q[0]}
                //             height={furniture.q[1]}
                //     />
                //     {!!furniture.designTopViewImagePath &&  <image
                //         x={0}
                //         y={0}
                //         width={furniture.q[0]}
                //         height={furniture.q[1]}
                //         preserveAspectRatio="none"
                //         xlinkHref={furniture.designTopViewImagePath}
                //     />}
                //     <g style={{display:furniture.selected?'block':'none'}}>
                //         {/* <circle
                            
                //             cx={furniture.q[1]/2}
                //              cy={furniture.q[0]/2} 
                //              r={furniture.q[0]>furniture.q[1]?furniture.q[1]/2:furniture.q[0]/2}
                //               stroke="red" fill="rgba(0,0,0,0)" strokeWidth="8" /> */}
                //         {/* <path fill = "#00CCCB" d={`M${furniture.q[0]/2} -650 L${furniture.q[0]/2-400} -500 L${furniture.q[0]/2} -350 Z`}
                //         />
                //         <path fill = "#00CCCB" d={`M${furniture.q[0]/2} -650 L${furniture.q[0]/2+400} -500 L${furniture.q[0]/2} -350 Z`}
                //         /> */}
                //         <circle
                //             style={{
                //                 cursor: 'move'
                                    
                //             }}
                //              onMouseEnter = {(e)=>{
                //                 e.target.setAttribute("fill","blue");
                //             }} 
                //              onMouseLeave = {(e)=>{
                //                 e.target.setAttribute("fill","#00CCCB");
                //             }} 
                //             onMouseDown={(e) => {
                //                 e.stopPropagation();
                //                 e.preventDefault();
                //                 this.handleFurnitureAdjustStart(furniture, e,index,'eCir');
                //             }}
                //          cx={furniture.q[0]/2}
                //           cy={-500} 
                //           r="150"  fill={furniture.fillColor} />
                //     </g>
                //     <line
                //     style={{display:furniture.selected?'block':'none'}}
                //      x1={furniture.q[0]/2}
                //         y1={furniture.q[1]/2} 
                //         x2={furniture.q[0]/2} 
                //         y2={-350}
                //         stroke='#00CCCB'
                //         strokeWidth='20' />
                //     <rect
                //     style={{
                //         cursor: 'move'
                        
                //     }}
                //         onMouseDown={(e) => {
                //             e.stopPropagation();
                //             e.preventDefault();
                //         this.handleFurnitureAdjustStart(furniture, e,index,'eRec');
                //     }}
                //             stroke='transparent'
                //             fill="transparent"
                //             strokeWidth='10'
                //             x={0}
                //             y={0}
                //             width={furniture.q[0]}
                //             height={furniture.q[1]}
                //         ></rect>
                //     <path 
                //         d = {`M${furniture.p1.x} ${furniture.p1.y} L${furniture.p2.x} ${furniture.p2.y}`} 
                //         fill='rgba(0, 0, 0, 0)'
                //         fillOpacity='1'
                //         strokeWidth='10'
                //         stroke='rgb(28, 121, 188)'
                //     />
                        
                // </g >
                // <g>
                //       <circle
                //         cx={furniture.g[0]*10-furniture.q[0]/2}
                //           cy={furniture.g[1]*10-furniture.q[1]/2} 
                //         r="150"  fill={furniture.fillColor} />  
                //     <image
                //         x={furniture.g[0]*10}
                //         y={furniture.g[1]*10}
                //         transform = {`rotate(${furniture.h[0]+90}, ${furniture.g[0]*10-furniture.q[0]/2}, ${furniture.g[1]*10-furniture.q[1]/2})`}
                //         width={furniture.q[0]}
                //         height={furniture.q[1]}
                //         preserveAspectRatio="none"
                //         xlinkHref={furniture.designTopViewImagePath}
                //     />
                //     </g>
                    // <path 
                    //     d = {`M${furniture.g[0]*10-furniture.q[0]/2} ${furniture.g[1]*10-furniture.q[1]/2} L${furniture.g[0]*10-furniture.q[0]/2} ${furniture.g[1]*10-furniture.q[1]/2}`} 
                    //     fill='rgba(0, 0, 0, 0)'
                    //     fillOpacity='1'
                    //     strokeWidth='10'
                    //     stroke='rgb(28, 121, 188)'
                    // />
                    // <g transform = {`rotate(${furniture.h[0]+90}, ${furniture.g[0]*10}, ${furniture.g[1]*10})`}>
                    <g
                        key = {furniture.cid}
                        
                    >
                        {/* <path 
                            d = {`M${furniture.p11.x} ${furniture.p11.y} L${furniture.p12.x} ${furniture.p12.y} L${furniture.p22.x} ${furniture.p22.y} L${furniture.p21.x} ${furniture.p21.y} Z`} 
                            fill='rgba(0, 0, 0, 0)'
                            fillOpacity='1'
                            strokeWidth='10'
                            stroke='rgb(28, 121, 188)'
                        /> */}
                        <g 
                            id = {furniture.cid}
                            onMouseDown = {(e)=>{
                                this.handleFurnitureAdjustStart(furniture, e,index,'eRec');
                            }}
                            transform = {`translate(${furniture.g[0]*10-furniture.q[0]/2}, ${furniture.g[1]*10-furniture.q[1]/2}) rotate(${furniture.h[0]+90}, ${furniture.q[0]/2}, ${furniture.q[1]/2})`}>
                        <image 
                            id = {furniture.cid+'img'}
                            x={0}
                            y={0}
                            
                            width={furniture.q[0]}
                            height={furniture.q[1]}
                            preserveAspectRatio="none"
                            xlinkHref={furniture.designTopViewImagePath}
                        />
                        <g style={{display:furniture.selected?'block':'none'}}>
                         <circle
                             style={{
                                 cursor: 'move'
                                    
                             }}
                              onMouseEnter = {(e)=>{
                                 e.target.setAttribute("fill","blue");
                             }} 
                              onMouseLeave = {(e)=>{
                                 e.target.setAttribute("fill","#00CCCB");
                             }} 
                             onMouseDown={(e) => {
                                 e.stopPropagation();
                                 e.preventDefault();
                                 this.handleFurnitureAdjustStart(furniture, e,index,'eCir');
                            }}
                          cx={furniture.q[0]/2}
                           cy={-500} 
                           r="150"  fill={furniture.fillColor} />
                           <rect
                         style={{display:furniture.selected?'block':'none'}}
                         stroke='#00CCCB'
                             fill="rgba(0,0,0,0)"
                             strokeWidth='10'
                             x={0}
                            y={0}
                             width={furniture.q[0]}
                             height={furniture.q[1]}
                     />
                     
                     <line
                        style={{display:furniture.selected?'block':'none'}}
                        x1={furniture.q[0]/2}
                         y1={furniture.q[1]/2} 
                         x2={furniture.q[0]/2} 
                         y2={-350}
                         stroke='#00CCCB'
                         strokeWidth='20' />
                     </g>
                    </g>
                        
                </g>
                    
            )
        })
    );
}