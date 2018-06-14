import React from 'react';
export default function () {
  let { copyDraft } = this.state;
  if (JSON.stringify(copyDraft) == "{}") return "";
  let scale = copyDraft.realeDistance / copyDraft.fakeDistance;
  let width = copyDraft.width * scale;
  let height = copyDraft.height * scale;
  let x = (this.WIDTH - width) / 2;
  let y = (this.HEIGHT - height) / 2;
  return (
    <g className="copy-draft">
      <image x={x} y={y} width={width} height={height} xlinkHref={copyDraft.imageDataUrl} opacity="0.5" />
    </g>

  );
}