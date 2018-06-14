export const mouseMovePoint = function (e) {
    let { walls, mouseType, AssistLine, brush, viewBox } = this.state;
    e = this.eventWarp(e);
    let p = {
        x: e.pageX,
        y: e.pageY
    }
    let AssistLineX = [];
    let AssistLineY = [];
    let AssistLinen = [];
    let obj;
    if (!!walls.length && mouseType == "brush" && brush.length == 0) {
        walls.map((wall) => {

            if (Math.abs(p.x - wall.p1.x) <= 220) {
                p = {
                    x: wall.p1.x,
                    y: p.y
                }
                obj = {
                    p1: wall.p1,
                    p2: p,
                    roate: 90
                }
                AssistLineX.push({
                    AssistLinen: obj,
                    distance: Math.abs(p.x - wall.p1.x),
                }
                )

            }
            if (Math.abs(p.x - wall.p2.x) <= 220) {
                p = {
                    x: wall.p2.x,
                    y: p.y
                }
                obj = {
                    p1: wall.p2,
                    p2: p,
                    roate: 90
                }
                AssistLineX.push({
                    AssistLinen: obj,
                    distance: Math.abs(p.x - wall.p2.x),
                }
                )
            }
            if (Math.abs(p.y - wall.p1.y) <= 220) {
                p = {
                    x: p.x,
                    y: wall.p1.y
                }
                obj = {
                    p1: wall.p1,
                    p2: p,
                    roate: 0
                };
                AssistLineY.push({
                    AssistLinen: obj,
                    distance: Math.abs(p.y - wall.p1.y),
                }
                )
            }
            if (Math.abs(p.y - wall.p2.y) <= 220) {
                p = {
                    x: p.x,
                    y: wall.p2.y,

                }
                obj = {
                    p1: wall.p2,
                    p2: p,
                    roate: 0
                }
                AssistLineY.push({
                    AssistLinen: obj,
                    distance: Math.abs(p.y - wall.p2.y),
                }
                )
            }

        })
        let compareArrX = [];
        let compareArrY = [];

        if (!!AssistLineX.length) {
            AssistLineX.map((item) => {
                compareArrX.push(item.distance);
            });

            let minX = Math.min(...compareArrX);
            let indexX = compareArrX.indexOf(minX);
            if (indexX != -1) {
                AssistLinen.push(AssistLineX[indexX].AssistLinen)
            }
        }
        if (!!AssistLineY.length) {
            AssistLineY.map((item) => {
                compareArrY.push(item.distance);
            });
            let minY = Math.min(...compareArrY);
            let indexY = compareArrY.indexOf(minY);
            if (indexY != -1) {
                AssistLinen.push(AssistLineY[indexY].AssistLinen)
            }
        }

    } else {
        if (!!AssistLine.length) {
            AssistLinen = [];
        }

    }

    // this.setState({ AssistLine: AssistLinen });
    this.state.AssistLine = AssistLinen;
    this.reRnderAssistLine();
}