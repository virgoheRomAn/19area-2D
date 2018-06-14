import React from 'react'
import './Item.less'

import { Tooltip } from 'antd';

export default class Item extends React.Component {
    render() {
        return (
            <div className={"item-component " + (this.props.className || '')}
                 id = {this.props.itemid}
                 onClick={this.props.onClick}
                 onMouseEnter = {this.props.onMouseEnter}
                 onMouseLeave = {this.props.onMouseLeave}
                 style={Object.assign({},
                     {
                         cursor: this.props.onClick ? 'pointer' : '',
                        //  marginRight:"20px",
                         
                         
                     },
                     this.props.style,
                 )}
            >
                {/* <Tooltip title={this.props.title || ''}
                         style={{
                             display: this.props.title ? 'block' : 'none'
                         }}
                         overlayStyle = {{opacity:0.5}}
                >
                    <img style={this.props.imgStyle} src={this.props.img || defaultImg} alt=""/>
                </Tooltip> */}
                {this.props.text ? <span>{this.props.text}</span> : ''}
            </div>
        )
    }
}