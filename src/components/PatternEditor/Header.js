import React from 'react';
import { Tabs } from 'antd';
import './Header.less';

const TabPane = Tabs.TabPane;

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            memberInfo: {},
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleComplete = this.handleComplete.bind(this);
        this.handleRecordBack = this.handleRecordBack.bind(this);
        this.handleRecordFront = this.handleRecordFront.bind(this);
        this.props.EM.on("loadMemberInfo", (obj) => {
            this.setState({ memberInfo: obj })
        })
    }
    handleSave() {
        //20180509 remove 点完成直接保存
        // this.props.EM.emit("save");
    }
    handleComplete() {
        this.props.EM.emit("save");
    }
    handleRecordBack() {
        this.props.EM.emit("RecordBack");
    }
    handleRecordFront() {
        this.props.EM.emit("RecordFront");
    }
    render() {
        return (
            <header id={'mainHeader'}>
                <Tabs type="card" defaultActiveKey="1">
                    <TabPane tab="拼花工具" key="1">
                        <span onClick={this.handleRecordBack}>撤销</span>
                        <span onClick={this.handleRecordFront}>恢复</span>
                        {/* <span onClick={this.handleSave}>保存</span> */}
                        <span onClick={this.handleComplete}>完成</span>
                    </TabPane>
                </Tabs>
                <div className="user">
                    <div className="icon" />
                    <span>{this.state.memberInfo.loginName ? this.state.memberInfo.loginName.slice(0, 3) + "****" + this.state.memberInfo.loginName.slice(-4) : ""}</span>
                </div>
            </header>
        )
    }
}
