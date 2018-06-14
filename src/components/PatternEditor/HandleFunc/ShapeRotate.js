import Utils, { generateKey } from '../../Editor/Utils'
export const handleShapeRotateMouseWheel = function (e, shape) {
    let el_pattern = document.querySelector(`#${shape.id}_pattern`);
    let patternTransform = el_pattern.getAttribute("patternTransform");
    patternTransform.match(/rotate\(([-\d]+),/);
    let rotate = parseInt(RegExp.$1);
    rotate += Math.floor(e.deltaY / 100);
    shape.mask.rotate = rotate;
    patternTransform = patternTransform.replace(/rotate\([-\d]+,/, `rotate(${rotate},`);
    // console.log(rotate, patternTransform);
    el_pattern.setAttribute("patternTransform", patternTransform);
}
export const handleShapeRotateEnd = function (e) {
    this.setState({ __record__: true, mouseType: 'scale' });
}