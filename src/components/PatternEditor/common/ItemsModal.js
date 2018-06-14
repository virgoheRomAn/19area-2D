import { Pagination, Spin, message, Modal } from 'antd';
import React from 'react';
import PatternModal from './PatternModal';
import querystring from 'querystring';
import './ItemsModal.less';
import Request from "../../../config/Request";
import FormModal from './FormModal';

const confirm = Modal.confirm;

export default class extends React.Component {
    constructor() {
        super();
        this.state = {
            total: 0,
            page: 1,
            list: [],
            loading: false,
            uploadMaterialModalVisible: false,
        };
        this.isEditor = false;
    }
    render() {
        return (
            <PatternModal
                className={'items-modal'}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                width={'auto'}
            >
                <header>
                    {'管理我的' + this.props.title}
                </header>
                <section>
                    <span className="up-btn">
                        <span></span>
                        <span onClick={() => {
                            this.isEditor = false;
                            this.toggleState('uploadMaterialModalVisible');
                            this.modalForm.resetFields();
                        }}>
                            <span className="icon" type="upload" />
                            上传{this.props.title}
                        </span>
                    </span>
                    <Spin spinning={this.state.loading}>
                        <div className="items">
                            {this.state.list.map((itemData) => {
                                const {
                                    materialName, shapeName = materialName, name = shapeName,
                                    materialPath, shapePath = materialPath, img = shapePath,
                                    gid
                                } = itemData;
                                return (
                                    <div className="item" key={gid} onClick={() => {
                                        this.props.onSelect && this.props.onSelect(itemData);
                                    }}>
                                        <div className="img" style={{
                                            backgroundImage: `url(${img})`
                                        }}>
                                            <div className="actions">
                                                <div className="editor" onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handleEditor(itemData);
                                                    this.isEditor = true;
                                                }}>
                                                    编辑
                                                </div>
                                                <div className="del" onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handleDel(gid)
                                                }}>
                                                    删除
                                                </div>
                                            </div>
                                        </div>
                                        <span className="name">{name}</span>
                                    </div>
                                )
                            })}
                            {!this.state.list.length && !this.state.loading && (
                                <div className={'tip'}>
                                    暂无数据
                                </div>
                            )}
                        </div>
                    </Spin>
                    <FormModal
                        title={'上传' + this.props.title}
                        items={this.props.uploadModalItems}
                        onOk={this.handleSave.bind(this)}
                        visible={this.state.uploadMaterialModalVisible}
                        onCancel={() => {
                            this.toggleState('uploadMaterialModalVisible');
                            this.props.onCancelForm && this.props.onCancelForm();
                            this.isEditor = false;
                        }}
                        setForm={(form) => this.modalForm = form}
                    />
                </section>
                <footer>
                    <Pagination
                        total={this.state.total || 8}
                        current={this.state.page}
                        onChange={this.pageTo.bind(this)}
                        pageSize={8}
                    />
                </footer>
            </PatternModal>
        )
    }
    componentWillMount() {
        this.getData();
    }
    componentWillReceiveProps({ visible }) {
        if (visible && visible !== this.props.visible) {
            this.getData();
        }
    }
    getData(curPage = 1) {
        this.setState({
            page: curPage,
            loading: true,
        });
        Request.get(this.props.url, {
            params: {
                curPage,
                materialName: this.props.materialName,
                pageSize: 8,
            }
        })
            .then(({ data: { sourceMaterialList = [], sourceShapelList = sourceMaterialList, list = sourceShapelList, total } }) => {
                this.setState({
                    list,
                    total,
                    loading: false,
                })
            })
    }
    pageTo(page) {
        this.getData(page);
    }
    toggleState(state, value = !this.state[state]) {
        this.setState({ [state]: value });
    }
    handleSave(values) {
        const { formatValues = () => values } = this.props;
        values = formatValues(values);
        return Request.get(this.isEditor ? this.props.saveUrl : this.props.createUrl, {
            params: values
        })
            .then(({ data: { code } }) => {
                if (code === 1000) {
                    message.success('保存成功');
                    this.props.onCancelForm && this.props.onCancelForm();
                    this.toggleState('uploadMaterialModalVisible');
                    this.getData(1);
                } else {
                    message.error('保存失败');
                }
            })
    }
    handleDel(gid) {
        confirm({
            title: '确定要删除吗？',
            okType: 'danger',
            onOk: () => {
                return Request.get(this.props.delUrl + '?gid=' + gid)
                    .then(({ data: { code } }) => {
                        if (code === 1000) {
                            message.success('删除成功');
                            this.getData(1);
                        } else {
                            message.error('删除失败');
                        }
                    })
            },
        });
    }
    handleEditor(values) {
        const { formatEditorValues = () => values } = this.props;
        values = formatEditorValues(values);
        this.toggleState('uploadMaterialModalVisible');
        this.modalForm.setFieldsValue(values);
    }
}

