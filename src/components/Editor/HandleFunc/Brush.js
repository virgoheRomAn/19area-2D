import Utils from '../Utils';
import CloseArea from '../CloseArea';
//拖动画笔

function removedRender() {
    let el_temp = document.getElementById('brush' + 'temp');
    el_temp && (el_temp.parentNode.removeChild(el_temp));
    let el_brush = document.getElementById('brush');
    el_brush && (el_brush.style.visibility = 'inherit');
}
function redRender(that) {
    let jsx = that.getBrushJSX();
    let el_brush = document.getElementById('brush');
    let el_temp = document.getElementById('brush' + 'temp');
    if (!el_temp) {
        el_temp = that.createSvgTag('g');
        el_temp.setAttribute("id", 'brush' + 'temp');
        that.refs.svg.appendChild(el_temp);

        // debugger;
    }
    el_brush && (el_brush.style.visibility = 'hidden');
    jsx && (el_temp.innerHTML = that.jsx2ele(jsx).innerHTML);
}
export const handleBrushStart = function (e) {
    e = this.eventWarp(e);
    //判断是新点击还是结束之前的点击
    let isNewClick = !(this.pBrushStart && this.pBrushEnd);
    let { walls, brush } = this.state;
    if (e.button == 2) {
        //右键
        if (isNewClick) {
            window.EM.emit("scale");
            window.EM.emit("scaleHead");
        } else {
            // debugger;
            this.handleBrushEnd(e)
        }
        return;
    } else if (e.button == 0) {
        //左键
        if (isNewClick) {
            //新点击
            this.pBrushStart = this.pBrushEnd = {
                x: e.pageX,
                y: e.pageY,
            }
            let p = {
                x: this.pBrushStart.x,
                y: this.pBrushStart.y,
            };
            let pMin = findDistanceMinPoint(p, walls, brush || []);
            if (pMin.distance <= 200) {
                p = {
                    x: pMin.x,
                    y: pMin.y,
                };
            }
            walls.map((wall) => {
                if (Math.abs(p.x - wall.p1.x) <= 220) {
                    p = {
                        x: wall.p1.x,
                        y: p.y
                    }
                }
                if (Math.abs(p.x - wall.p2.x) <= 220) {
                    p = {
                        x: wall.p2.x,
                        y: p.y
                    }
                }
                if (Math.abs(p.y - wall.p1.y) <= 220) {
                    p = {
                        x: p.x,
                        y: wall.p1.y
                    }

                }
                if (Math.abs(p.y - wall.p2.y) <= 220) {
                    p = {
                        x: p.x,
                        y: wall.p2.y
                    }

                }
            })
            let brush = [p, { x: p.x, y: p.y }];
            this.state.brush = brush;

            redRender(this);
            this.reRnderBrushInput();
            document.addEventListener('mousemove', this.handleBrushMove);
            document.addEventListener('mouseup', this.handleBrushEnd);
        } else {
            //去报是按下了画笔，才响应handleBrushEnd的增加节点
            this.BrushStart = true;
        }
    }
}
export const handleBrushMove = function (e) {
    e = this.eventWarp(e);
    this.pBrushEnd = {
        x: e.pageX,
        y: e.pageY
    }
    let { brush, walls } = this.state;
    let AssistLine = [];
    brush.pop();
    let p = {
        x: this.pBrushEnd.x,
        y: this.pBrushEnd.y,
    };
    //与brush的辅助线
    if (brush.length >= 2) {
        let first = brush[0];

        if (Math.abs(p.x - first.x) <= 200) {

            p = {
                x: first.x,
                y: p.y
            }
            AssistLine.push({
                p1: first,
                p2: p,
                roate: 90
            });
        }
        if (Math.abs(p.y - first.y) <= 200) {

            p = {
                x: p.x,
                y: first.y
            }
            AssistLine.push({
                p1: first,
                p2: p,
                roate: 0
            });
        }
    }


    //inline
    p = Utils.getRoatePoint(brush[brush.length - 1], p);
    let roate = Utils.getRoate(brush[brush.length - 1], p);
    if (roate % 90 < 0.01) {
        AssistLine.push({
            p1: brush[brush.length - 1],
            p2: p,
            roate: roate
        });
        if (!!brush && !!window.wall) {
            let jcd = Utils.getIntersectionOfLineAndLine(window.wall, { p1: brush[brush.length - 1], p2: p });
            let distance = Utils.getDistance(p, jcd);
            if (distance <= 200) {
                p = jcd;
            }
        }


    }

    let AssistLineX = [];
    let AssistLineY = [];
    let obj;
    //距离， p, 辅助线
    walls.map((wall) => {
        let { p1, p2 } = wall;
        if (Math.abs(p.x - p1.x) <= 200) {

            p = {
                x: p1.x,
                y: p.y
            }
            obj = {
                p1: p1,
                p2: p,
                roate: 90
            }
            AssistLineX.push({
                p: p,
                AssistLine: obj,
                distance: Math.abs(p.x - p1.x)
            })



        }
        if (Math.abs(p.y - p1.y) <= 200) {

            p = {
                x: p.x,
                y: p1.y
            }
            obj = {
                p1: p1,
                p2: p,
                roate: 0
            }
            AssistLineY.push({
                p: p,
                AssistLine: obj,
                distance: Math.abs(p.y - p1.y)
            })

        }
        if (Math.abs(p.x - p2.x) <= 200) {

            p = {
                x: p2.x,
                y: p.y
            }
            obj = {
                p1: p2,
                p2: p,
                roate: 90
            }
            AssistLineX.push({
                p: p,
                AssistLine: obj,
                distance: Math.abs(p.x - p2.x)
            })




        }
        if (Math.abs(p.y - p2.y) <= 200) {

            p = {
                x: p.x,
                y: p2.y
            }
            // AssistLine.push({
            //     p1: p2,
            //     p2: p,
            //     roate: 0
            // });
            obj = {
                p1: p2,
                p2: p,
                roate: 0
            }
            AssistLineY.push({
                p: p,
                AssistLine: obj,
                distance: Math.abs(p.y - p2.y)
            })
        }
    })
    let compareArrX = [];
    let compareArrY = [];
    if (!!AssistLineY.length) {
        AssistLineY.map((item) => {
            compareArrY.push(item.distance);
        })
        let minY = Math.min(...compareArrY);
        let indexY = compareArrY.indexOf(minY);
        if (indexY != -1) {

            AssistLine.push(AssistLineY[indexY].AssistLine);
            if (AssistLine.length == 1) {
                p = AssistLineY[indexY].p;
            }
        }
    }
    if (!!AssistLineX.length) {
        AssistLineX.map((item) => {
            compareArrX.push(item.distance);
        })
        let minX = Math.min(...compareArrX);
        let indexX = compareArrX.indexOf(minX);
        if (indexX != -1) {
            AssistLine.push(AssistLineX[indexX].AssistLine);
            if (AssistLine.length == 1) {
                p = AssistLineX[indexX].p;
            }
        }
    }

    //斜的墙辅助线
    let pMin = findDistanceMinPoint(p, walls, brush);
    let pAbrushDistance = Utils.getDistance(brush[brush.length - 1], p);
    if (pMin.distance <= 200 && pAbrushDistance >= 200) {
        if (!!window.wall) {
            if (!window.wall.p2) {
                debugger;
            }
            let roate = Utils.getRoate(window.wall.p1, window.wall.p2)
            // let obj = AssistLine[AssistLine.length-1]
            // AssistLine.push(obj);
            // AssistLine.length=0;
            AssistLine.push({
                p1: window.wall.p1,
                p2: window.wall.p2,
                roate: roate
            })
        }

        p = {
            x: pMin.x,
            y: pMin.y,
        };
    }
    let arrnn = [], arrRotate = [];

    //去重
    arrnn = AssistLine.map(item => JSON.stringify(item))
        .filter((item, idx, arry) => idx === arry.indexOf(item))
        .map(item => JSON.parse(item));
    arrnn.map((item, index) => {
        let rotate = item.roate;
        for (let indexr = index; indexr < arrnn.length; indexr++) {
            let itemr = arrnn[indexr]
            if (index != indexr) {
                if (JSON.stringify(itemr.p1) == JSON.stringify(item.p1) || JSON.stringify(itemr.p2) == JSON.stringify(item.p2) || JSON.stringify(itemr.p1) == JSON.stringify(item.p2) || JSON.stringify(itemr.p2) == JSON.stringify(item.p1)) {
                    if (rotate == itemr.roate || (Math.abs(rotate - itemr.roate) == 180)) {
                        arrRotate.push(index)
                    }
                }
            }
        }


    })

    let annn = arrnn.filter((item, index) => {
        return index != arrRotate[0]
    })
    //去相同点
    AssistLine = annn.filter((item) => {
        return JSON.stringify(item.p1) != JSON.stringify(item.p2)
    })


    brush.push(p);
    this.state.brush = brush;
    this.state.AssistLine = AssistLine;
    // console.table(AssistLine);
    redRender(this);
    // debugger;
    this.reRnderAssistLine();
    this.reRnderBrushInput();
    //设置输入框
    let el_brushInput = document.getElementById('brushInput');
    if (!el_brushInput) {
        return
    }
    let p1 = brush[brush.length - 2];
    let p2 = brush[brush.length - 1];

    // let top = ((p1.y - p2.y) / 2 + p2.y - this.state.viewBox.y) / this.state.viewBox.scaleY + 60;
    // 新版开始设计UI
    let top = ((p1.y - p2.y) / 2 + p2.y - this.state.viewBox.y) / this.state.viewBox.scaleY;
    let left = ((p1.x - p2.x) / 2 + p2.x - this.state.viewBox.x) / this.state.viewBox.scaleX - 20;

    el_brushInput.value = parseInt(Utils.getDistance(p1, p2));
    el_brushInput.focus();
    el_brushInput.style.top = top + 'px';
    el_brushInput.style.left = left + 'px';
    el_brushInput.style.display = 'block';
    el_brushInput.removeAttribute('disable');
    el_brushInput.removeAttribute('readonly');
}
export const handleBrushEnd = function (e) {
    let { walls, brush, areaType } = this.state;
    // if(brush.length>2){
    //     var resultArr;
    //     resultArr = brush.filter(function (item, index, self) {
    //         if(index<self.length-1){
    //               return self[index+1].x != item.x || self[index+1].y != item.y;
    //         }else{
    //             return item;
    //         }

    //     });
    //     brush=resultArr;
    // }
    //增加节点
    if (this.BrushStart && e.button != 2) {
        this.BrushStart = false;
        // 在handleScaleMove 你设置的此属性，表示鼠标按下之后拖动过屏幕
        if (this.scaleed >= 5) {
            this.scaleed = 0;
            return;
        }
        let temp = brush[brush.length - 1];
        brush.push({
            x: temp.x,
            y: temp.y,
        });
        this.state.brush = brush;
        redRender(this);
        this.reRnderBrushInput();
        return;
    }
    if (this.pBrushStart && this.pBrushEnd && this.pBrushStart.x === this.pBrushEnd.x && this.pBrushStart.y === this.pBrushEnd.y) {
        // alert('点按拖动');
        // return;
    } else {
        let apoint = brush.pop(); //去掉最后一个无用的点
        // //去重
        brush = brush.map(item => JSON.stringify(item))
            .filter((item, idx, arry) => item != arry[idx + 1])
            .map(item => JSON.parse(item));
        if (JSON.stringify(apoint) == JSON.stringify(brush[0]) && JSON.stringify(apoint) != JSON.stringify(brush[brush.length - 1])) {
            brush.push(apoint)
        }
        for (var i = 1; i < brush.length; i++) {
            let pPrev = brush[i - 1];
            let pCurrent = brush[i];
            let wall = {
                id: Utils.generateKey(),
                p1: Object.assign({}, pPrev),
                p2: Object.assign({}, pCurrent),
                doors: [],
                selected: false,
                changeIndex: 0
            };
            //这里不需要修正坐标误差
            Object.assign(wall, Utils.buildWall(wall.p1, wall.p2, this.WALL_WIDTH));
            walls.push(wall);
        }

        this.pBrushStart = this.pBrushEnd = null;
        document.removeEventListener('mousemove', this.handleBrushMove);
        document.removeEventListener('mouseup', this.handleBrushEnd);
        //根据相交点把墙拆分
        this.HandleCutWall(this.selectWalls,()=>{
            // 根据现有的墙，求出房间 
            let {walls} = this.state;
            let pointsArray = CloseArea.getIntersectionPoint(walls);
            let floors = CloseArea.getFloors(walls, pointsArray);
             //TODO 如果他们的area和center一样，则把名称和id还原回去
            this.setState({ floors, brush: [] }, () => {
                removedRender();
                this.removeBrushInput();
                this.removeAssistLine();
                this.hanlePatch(pointsArray);
                window.isChanged = true;
                if(!!window.BootParams['--takePicture']){
                    window.isChanged = false;
                }
            });
        });
        
        

    }

}
window.wall = null;
//找到最近的一个点并吸附上去
function findDistanceMinPoint(p, walls, brush) {
    let pMin = { x: 0, y: 0, distance: Infinity };
    //吸附到墙
    walls.forEach((wall) => {
        let pp = Utils.getIntersectionOfLineAndDot(wall, p);
        let offset = Utils.iSInside(wall, pp);
        //如果垂线在墙上
        if (offset == 0) {
            let distance = Utils.getDistance(pp, p);
            if (distance < pMin.distance) {
                pMin.x = pp.x;
                pMin.y = pp.y;
                pMin.distance = distance;
                window.wall = wall;
            }
        } else {
            [wall.p1, wall.p2].forEach((pp) => {
                let distance = Utils.getDistance(pp, p);
                if (distance < pMin.distance) {
                    pMin.x = pp.x;
                    pMin.y = pp.y;
                    pMin.distance = distance;
                    window.wall = wall;
                }
            });
        }
    });
    //吸附画笔端点
    (brush || []).forEach((pp) => {
        let distance = Utils.getDistance(pp, p);
        if (distance < pMin.distance) {
            window.wall = null;
            pMin.x = pp.x;
            pMin.y = pp.y;
            pMin.distance = distance;
        }
    });
    if (brush && brush.length != 0) {
        //吸附画笔路径上
        (brush || []).forEach((p1, index) => {
            //最后一个连不成路径
            if (index == (brush || []).length - 1) { return };
            let p2 = (brush || [])[index + 1];
            // debugger
            let pp = Utils.getIntersectionOfLineAndDot({ p1, p2 }, p);
            let offset = Utils.iSInside({ p1, p2 }, pp);
            if (offset == 0) {
                let distance = Utils.getDistance(pp, p);
                if (distance < pMin.distance) {
                    window.wall = null;
                    pMin.x = pp.x;
                    pMin.y = pp.y;
                    pMin.distance = distance;
                }
            }
        });
    }

    return pMin;
}
