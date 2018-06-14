import { Form, Input, Button,message } from 'antd';
import React from 'react';
import AsideList from './common/AsideList';
import ItemsModal from './common/ItemsModal';
import UploadFile from './common/UploadFile';
import './MaterialList.less'

const Search = Input.Search;

class Component extends React.Component {
    constructor() {
        super();
        this.state = {
            myMaterialModalVisible: false,
            upBtnDisabled: false,
            materialName: '',
        };
        this.toggleState = this.toggleState.bind(this);
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const uploadModalItems = [{
            itemProps: {
                label: '素材名称',
            },
            render: ({ getFieldDecorator }) => {
                return getFieldDecorator('materialName', {
                    rules: [{ required: true, message: '请输入素材名称！' }],
                })(
                    <Input />
                )
            }
        }, {
            itemProps: {
                label: '素材文件',
                extra: '(支持png、jpg格式)'
            },
            render: ({ getFieldDecorator }) => {
                return getFieldDecorator('file', {
                    rules: [{ required: true, message: '请选择素材文件！' }],
                })(
                    <UploadFile disabled={this.state.upBtnDisabled} t={18} onFileTypeCheck={(file, callback) => {
                        if (file.type === 'image/jpeg' || file.type === 'image/png') {
                            callback(true)
                        } else {
                            message.error('格式错误！');
                            callback(false)
                        }
                    }} />
                )
            }
        }];

        return (
            <div className={'material-list'}>
                <div className="header">
                    <Button className={'my-material-btn'} type={'primary'} onClick={() => this.toggleState('myMaterialModalVisible')} >
                        管理我的素材
                    </Button>
                </div>
                <div className="select">
                    <Search placeholder={'请输入形状名称'} onSearch={materialName => this.setState({ materialName })} />
                </div>
                <AsideList
                    onSelect={this.props.onSelect}
                    setReloadList={(fn) => this.reloadList = fn}
                    url={'/frontAjax/queryMemberSourceMaterialListAction.action'}
                    materialName={'我的素材'}
                    params={{ materialName: this.state.materialName }}
                />
                <ItemsModal
                    visible={this.state.myMaterialModalVisible}
                    onCancelForm={() => {
                        this.setState({ upBtnDisabled: false });
                    }}
                    onCancel={() => {
                        this.toggleState('myMaterialModalVisible');
                        this.reloadList();
                    }}
                    title={'素材'}
                    url={'/frontAjax/queryMemberSourceMaterialListAction.action'}
                    saveUrl={'/frontAjax/optUpdateMemberSourceMaterialAction.action'}
                    createUrl={'/frontAjax/createMemberSourceMaterialAction.action'}
                    delUrl={'/frontAjax/optDeleteMemberSourceMaterialAction.action'}
                    uploadModalItems={uploadModalItems}
                    formatValues={(values) => {
                        values.materialFileGid = values.file.fileGid;
                        values.materialName = encodeURI(values.materialName);
                        delete values.file;
                        return values;
                    }}
                    formatEditorValues={(values) => {
                        values.file = {};
                        values.file.fileName = values.materialPath.split('/').pop().split('-').pop();
                        values.file.fileGid = values.gid;
                        this.setState({ upBtnDisabled: true });
                        return values;
                    }}
                />
            </div>
        )
    }
    toggleState(state, value = !this.state[state]) {
        this.setState({ [state]: value });
    }
}

export default Form.create()(Component);
