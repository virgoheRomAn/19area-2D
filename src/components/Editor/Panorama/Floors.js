import React from 'react';
export default function () {
  let { floors,areaType, } = this.state;
  let AreaTypeShow = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if(e.button ==2){
      floors.map((floor)=>{
        floor.areaShow = false;
      })
      // let obj = this.state.floors;
      floors[index].areaShow = true;
      floors[index].cardPosition.x = e.pageX;
      floors[index].cardPosition.y = e.pageY;
      this.setState({ floors });
    }
    
  }
  return (
    <g
    >
      {floors.map((floor, index) => {
        let points = floor.points;
        let d = `M${points[0].p.x},${points[0].p.y}\n`;
        points.forEach((point) => {
          d += `L${point.p.x},${point.p.y}\n`;
        });
        d += `L${points[0].p.x},${points[0].p.y}\n`;
        let Text = `${(floor.area / 1000000).toFixed(2)} m²`;
        let Attr = {
          fill: '#2b2b2b',
          dominantBaseline: "middle",
          fontSize: this.FONT_SIZE
        };
        // let box = this.getSvgTextRect(Text, Attr);
        let box = {
          width: this.FONT_SIZE * Text.length
        }
        return <g
          key={index}
        >
          <path
            d={d}
            fillOpacity='1'
            strokeLinejoin='round'
            strokeLinecap='round'
            fill={floor.camera?"#DADADA":"#fff"}
            stroke='#5d5d5d'
            strokeWidth="0"
            style={{ cursor: 'pointer' }}
          
          />
          {/**<circle
            cx={floor.center.x} cy={floor.center.y} r={1}
            fill='red'
            stroke="red"
            strokeWidth='1'
          />**/}
          {/* {console.log(this.FONT_SIZE)} */}
          <text style={{ fontSize: this.FONT_SIZE * 1.6, fontWeight: "700" }}
            x={floor.center.x} y={floor.center.y - 250} r={2}
            {...Attr}
            transform={`translate(${-box.width / 2},0)`}
          >
            {areaType[index]}
          </text>
          <text
            style={{ fontSize: this.FONT_SIZE * 1.5 }}
            x={floor.center.x} y={floor.center.y} r={2}
            {...Attr}
            transform={`translate(${-box.width / 2},0)`}
          >
            {Text}
          </text>
        </g>
      })}
    </g>
  );
}