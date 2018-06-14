import React from 'react';
export default function () {
    let { furnitures } = this.state;
    //20170822 暂时不渲染家具
    // return null;
    
    return (
        furnitures.map((furniture,index) => {
            return (
                <g
                    
                    transform = {`translate(${furniture.g[0]*10-furniture.q[0]/2}, ${furniture.g[1]*10-furniture.q[1]/2}) rotate(${furniture.h[0]+90}, ${furniture.q[0]/2}, ${furniture.q[1]/2})`}
                    key={furniture.g[0]+furniture.g[1]+furniture.h[0]}
                    
                >
                    
                        
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
                    
                    {!!furniture.designTopViewImagePath &&  <image
                        x={0}
                        y={0}
                        width={furniture.q[0]}
                        height={furniture.q[1]}
                        preserveAspectRatio="none"
                        xlinkHref={furniture.designTopViewImagePath}
                    />}
                    <g style={{display:furniture.selected?'block':'none'}}>
                        {/* <circle
                            
                            cx={furniture.q[1]/2}
                             cy={furniture.q[0]/2} 
                             r={furniture.q[0]>furniture.q[1]?furniture.q[1]/2:furniture.q[0]/2}
                              stroke="red" fill="rgba(0,0,0,0)" strokeWidth="8" /> */}
                        {/* <path fill = "#00CCCB" d={`M${furniture.q[0]/2} -650 L${furniture.q[0]/2-400} -500 L${furniture.q[0]/2} -350 Z`}
                        />
                        <path fill = "#00CCCB" d={`M${furniture.q[0]/2} -650 L${furniture.q[0]/2+400} -500 L${furniture.q[0]/2} -350 Z`}
                        /> */}
                        <circle
                            style={{
                                cursor: 'move'
                                    
                            }}
                         cx={furniture.q[0]/2}
                          cy={-500} 
                          r="150"  fill={furniture.fillColor} />
                    </g>
                    <line
                    style={{display:furniture.selected?'block':'none'}}
                     x1={furniture.q[0]/2}
                        y1={furniture.q[1]/2} 
                        x2={furniture.q[0]/2} 
                        y2={-350}
                        stroke='#00CCCB'
                        strokeWidth='20' />
                    <rect
                    style={{
                        cursor: 'move'
                        
                    }}
                        
                            stroke='transparent'
                            fill="transparent"
                            strokeWidth='10'
                            x={0}
                            y={0}
                            width={furniture.q[0]}
                            height={furniture.q[1]}
                        ></rect>
                        
                </g >
            )
        })
    );
}