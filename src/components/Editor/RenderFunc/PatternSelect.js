import React from 'react';
import Utils from '../Utils';
import PatternEditor from "../../PatternEditor";
import G from "../../Interface/Global";
export default function () {
    let { isPatternSelectShow } = this.state;
    if (!isPatternSelectShow) {
        return <g className="pattern-select" ></g>
    }
    let selectWall = this.state.walls.filter(x => x.selected);
    let line = {};
    if (selectWall == 0) {
        return <g className="pattern-select" ></g>
    }
    //求出距离最远的两个点
    let points = [], maxLine = { distance: -Infinity };
    selectWall.forEach((wall) => {
        points.push(wall.p1);
        points.push(wall.p2);
    });
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            let distance = Utils.getDistance(points[i], points[j]);
            if (maxLine.distance < distance) {
                maxLine = { distance, p1: points[i], p2: points[j] };
            }
        }
    }
    // 求出中点
    let centerPoint = Utils.getCenterPoint([maxLine.p1, maxLine.p2]);
    let { p11, p12 } = Utils.getPoint(centerPoint, maxLine.p1, 800);

    let handleClick = (side) => {
        let wall = selectWall[0];
        PatternEditor.show({
            data: {
                schemeNo: G.currentScheme.schemeNo,
                type: 0,
                wall: wall,
                wallHeight: this.state.wallHeight,
                side: side
            },
            memberInfo: this.state.memberInfo,
            callback: (pattern) => {
                if (!wall.pattern) {
                    wall.pattern = {};
                }
                delete pattern.shapes;
                wall.pattern[side] = pattern;
                PatternEditor.hide();
            }
        });
        this.setState({ isPatternSelectShow: false });
    }
    return (
        <g className="pattern-select" >
            <rect
                x={p11.x - 500}
                y={p11.y - 180}
                height={300}
                width={1000}
                fill="#0cb"
                cursor="pointer"
                className="pattern-select-item"
                onClick={() => {
                    handleClick(0);
                }}
            />
            <text
                x={p11.x}
                y={p11.y}
                fontSize={200}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFF"
                pointerEvents="none"
            >开始拼花</text>

            <rect
                x={p12.x - 500}
                y={p12.y - 180}
                height={300}
                width={1000}
                fill="#0cb"
                cursor="pointer"
                className="pattern-select-item"
                onClick={() => {
                    handleClick(1);
                }}
            />
            <text
                x={p12.x}
                y={p12.y}
                fontSize={200}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFF"
                pointerEvents="none"
            >开始拼花</text>
        </g >
    );
}