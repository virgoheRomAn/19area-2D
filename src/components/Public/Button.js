import React,{Component} from 'react';
require('./button.css');
export default class Button extends Component{

    render(){
        return (
            <button onClick={this.props.onClick} className="b_btn">{this.props.value}</button>
        )
    }
}