import {Popover} from 'antd';
import React from 'react';
import { SketchPicker } from 'react-color';
import './ColorInput.less';

export default class extends React.Component {
    constructor() {
        super();
        this.state = {
            color: '#333'
        };
        this.handleChangeComplete = this.handleChangeComplete.bind(this);
    }
    render() {
        return (
            <div className={'color-input ant-input'}>
                <Popover
                    content={<SketchPicker color={this.state.color} onChangeComplete={this.handleChangeComplete}/>}
                    trigger="click"
                    overlayClassName={'color-input-popover'}
                >
                    <div className="show-color-box" style={{backgroundColor: this.state.color}}/>
                </Popover>
            </div>
        )
    }
    componentWillMount() {
        this.setColor();
    }
    componentWillReceiveProps(nextProps) {
        this.setColor(nextProps);
    }
    setColor({value: color} = this.props) {
        this.setState({color});
    }
    handleChangeComplete(color) {
        this.setState({ color: color.hex });
        this.props.onChange(color.hex);
    }
}
