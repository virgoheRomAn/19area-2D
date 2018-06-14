import { Upload, message, Button, Icon } from 'antd';
import React from 'react';
import Request from "../../../config/Request";

export default class extends React.Component {
    constructor() {
        super();
        this.state = {
            uploading: false,
            fileName: '',
            uploadState: 'done',
            fileUid: '',
        }
    }
    render() {
        return (
            <div style={{
                pointerEvents: this.props.disabled && 'none'
            }}>
                <Upload
                    customRequest={this.upload.bind(this)}
                    onRemove={this.handleRemove.bind(this)}
                    fileList={this.state.fileName && [{
                        uid: this.state.uid || 1,
                        name: this.state.fileName,
                        status: this.uploadState,
                    }]}
                >
                    {!this.state.fileName && (
                        <Button>
                            <Icon type="upload" /> 点击上传文件
                        </Button>
                    )}
                </Upload>
            </div>
        );
    }
    componentWillMount() {
        const { value: { fileName, fileGid: fileUid } = {} } = this.props;
        this.setState({
            fileName,
            fileUid,
        })
    }
    componentWillReceiveProps({ disabled, value: { fileName, fileGid: fileUid } = {} }) {
        this.setState({
            fileName,
            fileUid,
        })
    }
    handleRemove(file) {
        this.props.onChange('');
        this.setState({
            fileName: '',
            fileUid: ''
        })
    }
    upload({ file }) {
        let { onFileTypeCheck = (file, callback) => {
            callback(true)
        } } = this.props;
        onFileTypeCheck(file, (result) => {
            if (result) {
                this.setState({
                    fileName: file.name,
                    uploadState: 'uploading'
                });
                const data = new FormData();
                data.append('file', file, file.name);
                Request.post("/servlet/FileUploadServlet.htm?t=" + this.props.t, data, {
                    headers: {
                        'Content-Type': 'image/jpeg',
                        'Content-Disposition': 'form-data'
                    },
                    timeout: 100000,
                }).then(({ data }) => {
                    this.setState({
                        uploadState: 'done',
                        fileUid: data,
                    });
                    this.props.onChange({ fileName: file.name, fileGid: data });
                })
            }
        })
    }
}
