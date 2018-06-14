import renderBrush, { getBrushJSX } from './Brush';
import renderCopyDraft from './CopyDraft';
import renderWalls, { getWallJSX } from './Walls';

import renderFurnitures from './Furnitures';
import renderMan from './Man';
import renderPatternSelect from './PatternSelect';
import renderPatternUnSelect from './PatternUnSelect';

import renderFloors from './Floors';
import renderGrids from './Grids';
import renderInput from './InputVal';
import renderdoorInput from './Doorinput';
import renderBrushInput, { reRnderBrushInput, removeBrushInput } from './BrushInput';
import renderRoomType from './RoomType';
import rightMenu from './RightMenu';
import AssistLine, { reRnderAssistLine, removeAssistLine } from './AssistLine';
import RulerLine, { removeRulerLine, reRnderRulerLine } from './RulerLine';

import renderDoors, { getDoorJSX } from './Doors';
import renderDoor1 from './Door1';
import renderDoor2 from './Door2';
import renderDoor135 from './Door135';
import renderWallContextMenu from './WallContextMenu.js';
import renderFloorContextMenu from './FloorContextMenu.js';

import renderCeils, { getCeils } from './Ceiling';
import renderCeilContextMenu from './CeilContextMenu';
import renderCeilImgContextMenu from './CeilImgContextMenu';
import renderRulerLine from './RulerLine';



export default {
  renderBrush, getBrushJSX,
  renderWalls, getWallJSX,

  renderFurnitures,
  renderCopyDraft,
  renderMan,
  renderPatternSelect,
  renderPatternUnSelect,
  renderFloors,
  renderGrids,
  renderInput,
  renderdoorInput,
  rightMenu,
  AssistLine, reRnderAssistLine, removeAssistLine,
  RulerLine, removeRulerLine, reRnderRulerLine,
  renderDoors, getDoorJSX,
  renderDoor1,
  renderDoor2,
  renderDoor135,

  renderBrushInput, reRnderBrushInput, removeBrushInput,

  renderRoomType,
  renderWallContextMenu,
  renderFloorContextMenu,
  renderCeils, getCeils,
  renderCeilContextMenu,
  renderCeilImgContextMenu,
  renderRulerLine
}