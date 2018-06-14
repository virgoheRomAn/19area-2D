import React from 'react'
import './listOne.css'

import { Tooltip,Icon } from 'antd';

export default class ListOne extends React.Component {
    render() {
        return (
            <div>
                <p className="common_list">{this.props.camera1}号相机--></p>
                <p className="common_list">{this.props.portal}号传送门--></p>
                <p className="common_list">{this.props.camera2}号相机</p>
                <Icon
                    onClick = {this.props.delete}
                 type="delete" />
            </div>
        )
    }
}