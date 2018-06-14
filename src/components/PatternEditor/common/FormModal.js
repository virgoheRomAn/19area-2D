import {Button, Form, Input} from 'antd';
import React from 'react';
import PatternModal from './PatternModal';
import './FormModal.less';

const FormItem = Form.Item;

class Component extends React.Component {
    constructor() {
        super();
        this.state = {
            okBtnLoading: false,
        };
        this.handleOk = this.handleOk.bind(this);
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        const {items, title, form, itemsProps = {
            labelCol: {
                sm: { span: 8 },
            },
            wrapperCol: {
                sm: { span: 11 },
            },
        }} = this.props;
        return (
            <PatternModal
                className={'form-modal'}
                width={608}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
            >
                <header>{title}</header>
                <Form>
                    {getFieldDecorator('gid')(
                        <Input style={{display: 'none'}}/>
                    )}
                    {items.map(({itemProps = {}, render}, index) => {
                        return (
                            <FormItem
                                {...itemsProps}
                                {...itemProps}
                                key={'item' + index}
                            >
                                {render(form)}
                            </FormItem>
                        )
                    })}
                </Form>
                <footer>
                    <Button onClick={this.props.onCancel}>取消</Button>
                    <Button loading={this.state.okBtnLoading} onClick={this.handleOk} type={'primary'}>确认</Button>
                </footer>
            </PatternModal>
        )
    }
    componentWillMount() {
        const {setForm = () => null, form} = this.props;
        setForm(form);
    }
    handleOk() {
        const {onOk, form: {validateFields}} = this.props;
        validateFields((errs, values) => {
            if (!errs) {
                this.setState({
                    okBtnLoading: true,
                });
                Promise.all([onOk(values)])
                    .then(() => {
                        this.setState({
                            okBtnLoading: false,
                        })
                    })
            }
        })
    }
}

export default Form.create()(Component);
