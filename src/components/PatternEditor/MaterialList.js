import { Form, Input, Button, Select } from 'antd';
import React from 'react';
import AsideList from './common/AsideList';
import './MaterialList.less'
import Request from "../../config/Request";

const Option = Select.Option;

class Component extends React.Component {
    constructor() {
        super();
        this.state = {
            keyWords: '',
            brandGid: '',
            brands: [],
        };
    }
    componentDidMount() {
        this.getBrand(this.props);
    }
    componentWillReceiveProps(nextProps) {
        this.getBrand(nextProps);
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    this.handleSubmit();
                }}
                className={'material-list'}
            >
                <div className="header">
                    {getFieldDecorator('keyWords')(<Input />)}
                    <Button htmlType={'submit'} className={'search-btn'} type={'primary'}>搜索</Button>
                </div>
                <div className="select">
                    {getFieldDecorator('brandGid')(
                        <Select placeholder={'请选择品牌'} allowClear notFoundContent="此分类没有品牌数据">
                            {this.state.brands.map(({ brandName, gid }) => {
                                return (
                                    <Option key={gid} value={gid.toString()}>{brandName}</Option>
                                )
                            })}
                        </Select>
                    )}
                </div>
                <AsideList
                    onSelect={this.props.onSelect}
                    url={this.props.url}
                    params={{
                        typeGid: this.props.params.typeGid,
                        parentTypeGid: this.props.params.parentTypeGid,
                        keyWords: this.state.keyWords,
                        brandGid: this.state.brandGid,
                    }}
                />
            </Form>
        )
    }
    getBrand(props) {
        let { params = {} } = props;
        let { selectedItem = {} } = params;
        let { brandList = [] } = selectedItem;
        this.setState({
            brands: brandList
        });
        // Request.get('frontAjax/memberQueryBrandInfoList.action', {
        //     params: {
        //         curPage: 1,
        //         pageSize: 9999,
        //     }
        // })
        //     .then(({ data: { brandInfoList } }) => {
        //         this.setState({ brands: brandInfoList });
        //     })
    }
    handleSubmit() {
        this.props.form.validateFields((errs, values) => {
            if (!errs) {
                this.setState(values);
            }
        })

    }
}

export default Form.create()(Component);
