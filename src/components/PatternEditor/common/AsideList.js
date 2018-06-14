import { Input, Button, Form, Select, Pagination, Popconfirm, InputNumber, Spin } from 'antd';
import React from 'react';
import './AsideList.less';
import Request from "../../../config/Request";

const Option = Select.Option;

class Component extends React.Component {
    constructor() {
        super();
        this.state = {
            total: 0,
            page: 1,
            list: [],
            loading: false,
        };
        this.pageTo = this.pageTo.bind(this);
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        return (
            <div className={'aside-list'}>
                <div className="content">
                    <Spin spinning={this.state.loading}>
                        <div className="items">
                            {this.state.list.map((item, index) => {
                                return (
                                    <div className="item" key={item.gid} onClick={() => {
                                        this.props.onSelect && this.props.onSelect(item);
                                    }}>
                                        <div className="img" style={{
                                            backgroundImage: `url(${item.imageFilePath || item.materialPath})`
                                        }} />
                                        <span>{item.modelNameChs || item.materialName}</span>
                                    </div>
                                )
                            })}
                            {!this.state.list.length && (
                                <div className={'tip'}>
                                    暂无数据
                                </div>
                            )}
                        </div>
                    </Spin>
                </div>
                <div className="pagination">
                    <Pagination
                        size="small"
                        total={this.state.total || 10}
                        current={this.state.page}
                        onChange={this.pageTo}
                    />
                    <Popconfirm
                        overlayClassName={'pageTo'}
                        title={(
                            <div>
                                跳至
                                {getFieldDecorator('to', {
                                    initialValue: this.state.page,
                                })(<InputNumber size="small" min={1} max={Math.ceil(this.state.total / 10)} />)}
                                页
                            </div>
                        )}
                        onConfirm={() => {
                            this.pageTo(getFieldValue('to'));
                        }}
                        okText="确定"
                        placement="topRight"
                    >
                        <span>跳转</span>
                    </Popconfirm>
                </div>
            </div>
        )
    }
    componentWillMount() {
        this.getData();
        const { setReloadList = () => null } = this.props;
        setReloadList(this.getData.bind(this));
    }
    componentWillReceiveProps({ params }) {
        // console.log(params);
        if (JSON.stringify(params || {}) !== JSON.stringify(this.props.params || {})) {
            this.getData(1, params);
        }
    }
    getData(curPage = 1, params = this.props.params || {}) {
        this.setState({
            page: curPage,
            loading: true,
        });
        Object.keys(params).forEach((key) => {
            const value = params[key];
            if (value && typeof value === 'string') {
                params[key] = encodeURI(value)
            }
        });
        this.props.form.setFieldsValue({ to: curPage });
        Request.get(this.props.url, {
            params: {
                curPage,
                pageSize: 10,
                ...params
                // materialName: this.props.materialName
            }
        })
            .then(({ data: { modelInfoList, sourceMaterialList, total } }) => {
                this.setState({
                    list: modelInfoList || sourceMaterialList || [],
                    total,
                    loading: false,
                })

            })
    }
    pageTo(page) {
        this.getData(page);
    }
}

export default Form.create()(Component);
