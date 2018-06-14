import React, { Component } from 'react';
import { Pagination } from 'antd';
import $ from "jquery";

export default class Pages extends Component {
    componentDidUpdate() {
        // $(`#${this.props.id}  input`).val("");
        // $(`#${this.props.id}  input`).focus();
    }
    render() {
        return (
            <div className="paging-container" id={this.props.id}>
                <Pagination id="ddddd" simple={this.props.simple || false} showQuickJumper={this.props.showQuickJumper || true} showSizeChanger={this.props.showSizeChanger || false}
                    pageSize={this.props.pageSize} defaultCurrent={this.props.defaultCurrent} current={this.props.current} total={this.props.total}
                    onChange={(value) => {
                        this.props.changeCallback && this.props.changeCallback.call(this, value, false);
                    }} />
                {this.props.button ?
                    <a className="btn" href="javascript:;" onClick={() => {
                        let ele = $(`#${this.props.id}  input`);
                        let value = parseInt(ele.val());
                        let max = Math.ceil(this.props.total / this.props.pageSize);
                        value = !!value ? ((value > max) ? Math.ceil(this.props.total / this.props.pageSize) : value) : this.props.current;
                        this.props.changeCallback && this.props.changeCallback.call(this, value, ele);
                    }} >确定</a>
                    : ""
                }
            </div >
        )
    }
}