import { message } from 'antd';
import Utils from '../../Editor/Utils';
import Load from "../../Plugins/loading/LoadingData"
//摆放物体
export const handlePutStart = function (data) {
    let { viewBox } = this.state;
    this.setState({
        putThing: {
            x: viewBox.x,
            y: viewBox.y,
            height: data.imgHeight,
            width: data.imgWidth,
            data: data,
        }
    }, () => {
        document.addEventListener('mousemove', this.handlePutMove);
        document.addEventListener('mousedown', this.handlePutDown);
    });
}

export const handlePutDown = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e = this.eventWarp(e);
    let { putThing, } = this.state;
    if (e.button == 2) {
        //右键取消
        return;
    } else {
        let { data: { shapes } } = this.state;
        let shape = shapes.find(x => x.isOver);
        if (!shape) {
            message.info("请选择形状");
            return;
        }
        let data = putThing.data;
        if (shape.type == 1) {
            let path = shape.paths.find(x => x.isOver);
            if (!!path) {
                Object.assign(path.mask, {
                    img: data.img,
                    imgWidth: data.imgWidth,
                    imgHeight: data.imgHeight,
                    patchWidth: data.patchWidth,
                    patchHeight: data.patchHeight,
                });
            }
        } else {
            Object.assign(shape.mask, {
                img: data.img,
                imgWidth: data.imgWidth,
                imgHeight: data.imgHeight,
                patchWidth: data.patchWidth,
                patchHeight: data.patchHeight,
            });
            Load.show("请稍候");
            this.cutShapeMaskImg([shape], () => {
                this.setState({});
                Load.hide();
            });
        }
    }
    this.setState({
        putThing: null,
        __record__: true,
        mouseType: 'scale'
    });
    document.removeEventListener('mousemove', this.handlePutMove);
    document.removeEventListener('mousedown', this.handlePutDown);
}
export const handlePutMove = function (e) {
    e = this.eventWarp(e);
    let { putThing } = this.state;
    putThing.x = e.pageX - putThing.width / 2;
    putThing.x = Math.round(putThing.x);
    putThing.y = e.pageY - putThing.height / 2;
    putThing.y = Math.round(putThing.y);

    let putThingRect = {
        p11: { x: putThing.x, y: putThing.y },
        p12: { x: putThing.x, y: putThing.y + putThing.height },
        p21: { x: putThing.x + putThing.width, y: putThing.y },
        p22: { x: putThing.x + putThing.width, y: putThing.y + putThing.height },
    }
    this.setState({ putThing, __record__: false });
}