import Utils, { generateKey } from '../../Editor/Utils'
//快捷键
export const handleHotKey = function (e) {
    // e.stopPropagation();
    // e.preventDefault();
    // console.log('handleHotKey');
    //如果是从input触发的事件  不响应
    if (e.target.nodeName.toLowerCase() === 'input') {
        return;
    }
    //富文本编辑框 不响应
    if (e.target.contentEditable === 'true') {
        return;
    }

    let { data: { shapes } } = this.state;
    let sindex = shapes.findIndex(x => x.active);
    let shape = shapes[sindex];
    let keyCode = e.keyCode;
    //control 或者 command 按下
    if (e.ctrlKey == true || e.metaKey == true) {
        switch (keyCode) {
            case 65: //A
                // this.handleSelectItems(instanceState.selectedPage.items);
                break;
            case 67: //C
                if (!shape) { return };
                this.handleCommand('copy', { shape });
                break;
            case 86: //V
                //20180518 copy 直接就生成，不需要再点粘贴
                // shape = this.state.copyData.shape;
                // if (!shape) { return };
                // this.handleCommand('paste', { shape });
                break;
            case 90: //Z
                if (e.shiftKey == true) {
                    this.handleRecordFront();
                } else {
                    this.handleRecordBack();
                }
                break;
            case 89: //Y
                this.handleRecordFront();
                break;
        }
    } else {
        switch (keyCode) {
            case 46:
            case 8: //delete
                if (sindex == -1) { return };
                this.handleCommand('delete', { sindex });
                break;
            case 38:
                this.handleCommand('keyUp', e);
                break;
            case 40:
                this.handleCommand('keyDown', e);
                break;
            case 37:
                this.handleCommand('keyLeft', e);
                break;
            case 39:
                this.handleCommand('keyRight', e);
                break;
        }
    }
}
function moveShapeMaskOffset(shape, offsetX, offsetY) {
    shape.mask.centerOffset.x += offsetX;
    shape.mask.centerOffset.y += offsetY;
}
function moveShapeOffset(shape, offsetX, offsetY) {
    shape.points.forEach(point => {
        point.x += offsetX;
        point.y += offsetY;
    });
    //TODO 限制不能移出top层
}
//为了定义数据方便 独立一个方法
function muveShape(shape, cmd) {

}
export const handleCommand = function (cmd, data) {
    let { data: { shapes } } = this.state;
    let { shape, sindex } = data;
    if (!shape) {
        shape = shapes.find(x => x.active) || {};
    }
    let { parent } = shape;

    let offsetX = 0;
    let offsetY = 0;
    let MOVE_OFFSET = 100;
    let { mouseType } = this.state;

    switch (cmd) {
        case 'keyUp':
        case 'keyDown':
        case 'keyLeft':
        case 'keyRight':
            if (!shape.id) {
                return;
            }
            switch (cmd) {
                case 'keyUp': offsetY = -MOVE_OFFSET; break;
                case 'keyDown': offsetY = MOVE_OFFSET; break;
                case 'keyLeft': offsetX = -MOVE_OFFSET; break;
                case 'keyRight': offsetX = MOVE_OFFSET; break;
            }
            if (mouseType == 'scale') {
                moveShapeOffset(shape, offsetX, offsetY);
            }
            if (mouseType == 'move') {
                moveShapeMaskOffset(shape, offsetX, offsetY);
            }
            this.calcBoxDistanceLine(shape);
            this.setState({ __record__: true });
            break;
        case 'copy':
            if (!shape.parent) {
                return;
            }
            shape = this.getShapeSerializable(shape);
            shape.parent = parent;
            // this.setState({
            //     copyData: {
            //         shape,
            //     },
            //     __record__: false,
            // });
            shape.id = generateKey();
            shape.points.forEach((p) => {
                p.x += 100;
                p.y += 100;
            });
            shapes.push(shape);
            shapes.forEach((shape) => {
                shape.active = false;
            });
            shape.active = true;
            shape.showRectLines = true;
            this.setState({
                distanceLines: [],
                __record__: true
            }, () => {
                this.calcBoxDistanceLine(shape);
                this.setState({ __record__: false })
            });
            break;
        case 'paste':
            //20180518 copy 直接就生成，不需要再点粘贴
            // shape.points.forEach((p) => {
            //     p.x += 100;
            //     p.y += 100;
            // });
            // shape = this.getShapeSerializable(shape);
            // shape.parent = parent;
            // shape.id = generateKey();
            // shapes.push(shape);
            // shapes.forEach((shape) => {
            //     shape.active = false;
            // });
            // shape.active = true;
            // shape.showRectLines = true;
            // this.setState({
            //     distanceLines: [],
            //     __record__: true
            // }, () => {
            //     this.calcBoxDistanceLine(shape);
            //     this.setState({ __record__: false })
            // });
            break;
        case 'delete':
            if (!shape.parent) {
                return;
            }
            shapes.splice(sindex, 1);
            this.setState({ __record__: true, distanceLines: [] });
            break;
    }
}