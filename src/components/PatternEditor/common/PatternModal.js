import { Modal } from 'antd';
import React from 'react';
import './PatternModal.less';

export default class extends React.Component {
    render() {
        return (
            <Modal
                visible={this.props.visible}
                wrapClassName={'pattern-modal ' + this.props.className}
                width={this.props.width}
                onCancel={this.props.onCancel}
                footer={null}
                maskStyle={{
                    display: 'none',
                }}
            >
                {this.props.children}
            </Modal>
        )
    }
}
