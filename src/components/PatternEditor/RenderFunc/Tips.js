import React from 'react';
import { Button } from 'antd';
require("./Tips.less");
export const getTipsJSX = function (distanceLines, hashRef) {
    let { mouseType } = this.state;
    if (mouseType === 'move') {
        return (
            <div className="tips">
                <span>按住鼠标左键或者方向盘键移动起铺位置</span>
                <button onClick={(e) => {
                    e.stopPropagation();
                    this.setState({ __record__: true, mouseType: 'scale' });
                }}>退出</button>
            </div>
        )
    }
    if (mouseType === 'rotate') {
        return (
            <div className="tips">
                <span>滚动鼠标滚轮旋转素材</span>
                <button onClick={(e) => {
                    e.stopPropagation();
                    this.setState({ __record__: true, mouseType: 'scale' });
                }}>退出</button>
            </div>
        )
    }
    if (mouseType === 'put') {
        return (
            <div className="tips">
                <span>移动到形状上点击左键放置素材</span>
                <button onClick={(e) => {
                    e.stopPropagation();
                    document.removeEventListener('mousedown', this.handlePutDown);
                    this.setState({ __record__: true, mouseType: 'scale' });
                }}>退出</button>
            </div>
        )
    }
}
export default function () {
    return this.getTipsJSX();
}