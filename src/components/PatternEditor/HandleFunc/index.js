import { handleMouseWheel, handleScaleStart, handleScaleMove, handleScaleEnd } from './Scale'
import { handleShapeAdjustStart, handleShapeAdjustMove, handleShapeAdjustEnd, calcDistanceLine, calcBoxLine } from './ShapeAdjust'
import { handleShapeLocationStart, handleShapeLocationMove, handleShapeLocationEnd, calcBoxDistanceLine } from './ShapeLocatin'
import { handleShapeRotateMouseWheel, handleShapeRotateEnd } from './ShapeRotate'
import { handleRecord, handleRecordBack, handleRecordFront, handleReset } from './History'
import { handleRightMenu, handleRightMenuClick } from './RightMenu'
import { handleHotKey, handleCommand } from './HotKey'
import { handlePutStart, handlePutDown, handlePutMove } from './Put'

export default {
  handleMouseWheel, handleScaleStart, handleScaleMove, handleScaleEnd,
  handleShapeAdjustStart, handleShapeAdjustMove, handleShapeAdjustEnd, calcDistanceLine, calcBoxLine,
  handleShapeLocationStart, handleShapeLocationMove, handleShapeLocationEnd, calcBoxDistanceLine,
  handleShapeRotateMouseWheel, handleShapeRotateEnd,
  handleRecord, handleRecordBack, handleRecordFront, handleReset,
  handleRightMenu, handleRightMenuClick,
  handleHotKey, handleCommand,
  handlePutStart, handlePutDown, handlePutMove
};