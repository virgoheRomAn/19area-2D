import React from 'react';
import { Popconfirm, message, Input, Menu, Icon } from 'antd';
import Utils, { generateKey } from '../../Editor/Utils'
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
message.config({
    top: 100,
    duration: 2,
});

require('./RightMenu.less');
export default function () {
    let { rightMenu: { event, isShow, shape }, copyData } = this.state;
    // console.log(event);
    let styleObj = !isShow ? {
        display: "none"
    } : {
            left: `${event.pageX}px`,
            top: `${event.pageY}px`,
            display: "block"
        };
    if (!shape) {
        return (<div style={styleObj} className="rightMenu"></div>);
    }
    return (
        <div style={styleObj} className="rightMenu" onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}>
            <Menu onClick={this.handleRightMenuClick} mode="vertical" theme="dark" >
                {shape.type == 0 && shape.mask.img != undefined &&
                    <Menu.Item key="1"><span className="icon" type="move" />移动素材</Menu.Item>
                }
                {shape.type == 0 && shape.mask.img != undefined &&
                    <Menu.Item key="2"><span className="icon" type="rotate" />旋转素材</Menu.Item>
                }
                {shape.type == 0 && shape.mask.img != undefined &&
                    <SubMenu key="3" title={<span><span className="icon" type="material" /><span>素材铺法</span></span>}>
                        <Menu.Item key="31">默认</Menu.Item>
                        <Menu.Item key="32">工字铺</Menu.Item>
                        <Menu.Item key="33">人字铺</Menu.Item>
                    </SubMenu>
                }
                {(!!shape && shape.id != 'id_shape_top') &&
                    [<SubMenu key="4" title={<span><span className="icon" type="zindex" /><span>形状顺序</span></span>}>
                        <Menu.Item key="41">置于顶层</Menu.Item>
                        <Menu.Item key="42">置于低层</Menu.Item>
                        <Menu.Item key="43">上移一层</Menu.Item>
                        <Menu.Item key="44">下移一层</Menu.Item>
                    </SubMenu>,
                    <Menu.Item key="6"><span className="icon" type="delete" />删除</Menu.Item>,
                    <Menu.Item key="5"><span className="icon" type="copy" />复制</Menu.Item>,
                    ]
                }
                <Menu.Item key="7"><span className="icon" type="save" />保存</Menu.Item>
                {copyData &&
                    <Menu.Item key="51"><span className="icon" type="past" />粘贴</Menu.Item>
                }
                {shape.type == 0 && shape.mask.img != undefined &&
                    < Menu.Item key="8"><span className="icon" type="gap" />砖缝</Menu.Item>
                }
                <Menu.Item key="9"><span className="icon" type="boundary" />波打线</Menu.Item>
            </Menu>
        </div >
    );

}