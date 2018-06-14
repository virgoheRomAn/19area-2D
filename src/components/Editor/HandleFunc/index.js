import { handleWallAdjustStart, handleWallAdjustMove, handleWallAdjustEnd } from './WallAdjust';
import { handleDoorAdjustStart, handleLORchange, handleDoorAdjustMove, handleDoorAdjustEnd, handleTOBchange, handleChangeStyleRec, handleChangeStyleTriangle } from './DoorAdjust';
import { handleDoorMoveStart, handleDoorMoveMove, handleDoorMoveEnd } from './DoorAdjust';
import { handleFurnitureAdjustStart, handleFurnitureAdjustMove, handleFurnitureAdjustEnd,handleFurnitureAdjustRotate } from './FurnitureAdjust';
import { handleManAdjustStart, handleManAdjustMove, handleManAdjustEnd } from './ManAdjust';
import { handleBrushStart, handleBrushMove, handleBrushEnd } from './Brush';
import { handlePutStart, handlePutDown, handlePutMove } from './Put';
import { handleMouseWheel, handleScaleStart, handleScaleMove, handleScaleEnd } from './Scale'
import { HandleCutWall } from './CutWall'
import { hanlePatch } from './Patch'
import { mouseMovePoint } from './PutMouse'
import { handleCameraAdjustStart,handleCameraAdjustMove,handleCameraAdjustEnd,handlePutStartCamera,handlePutDownCamera,handlePutMoveCamera } from './PutCamera'
import { handlePortalAdjustStart,handlePortalAdjustMove,handlePortalAdjustEnd,handlePutStartPortal,handlePutMovePortal,handlePutDownPortal } from './PutPortal'
import { handleLineAdjustStart,handleLineAdjustMove,handleLineAdjustEnd } from './AdjustLine'
import { handleLineImgAdjustStart,handleLineImgAdjustMove,handleLineImgAdjustEnd } from './AdjustImgLine'
import { handleCeilAdjustStart,handleCeilAdjustMove,handleCeilAdjustEnd } from './AdjustCeil'
import { handleCeilAdjustModelStart,handleCeilModelAdjustMove,handleCeilModelAdjustEnd } from './AdjustCeilModel'

export default {
  handleWallAdjustStart, handleWallAdjustMove, handleWallAdjustEnd,
  handleDoorAdjustStart, handleDoorAdjustMove, handleDoorAdjustEnd, handleLORchange,
  handleTOBchange,
  handleDoorMoveStart, handleDoorMoveMove, handleDoorMoveEnd,
  handleFurnitureAdjustStart, handleFurnitureAdjustMove, handleFurnitureAdjustEnd, handleChangeStyleRec, handleChangeStyleTriangle,
  handleManAdjustStart, handleManAdjustMove, handleManAdjustEnd,
  handleBrushStart, handleBrushMove, handleBrushEnd,
  handlePutStart, handlePutDown, handlePutMove,
  handleMouseWheel, handleScaleStart, handleScaleMove, handleScaleEnd,
  HandleCutWall,
  hanlePatch,
  mouseMovePoint,
  handleFurnitureAdjustRotate,
  handleCameraAdjustStart,handleCameraAdjustMove,handleCameraAdjustEnd,
  handlePortalAdjustStart,handlePortalAdjustMove,handlePortalAdjustEnd,
  handlePutStartCamera,handlePutDownCamera,handlePutMoveCamera,
  handlePutStartPortal,handlePutMovePortal,handlePutDownPortal,
  handleLineAdjustStart,handleLineAdjustMove,handleLineAdjustEnd,
  handleCeilAdjustStart,handleCeilAdjustMove,handleCeilAdjustEnd,
  handleCeilAdjustModelStart,handleCeilModelAdjustMove,handleCeilModelAdjustEnd,
  handleLineImgAdjustStart,handleLineImgAdjustMove,handleLineImgAdjustEnd
};