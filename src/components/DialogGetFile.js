import React, { Component } from 'react'
import {Modal, ModalBody, Button, Alert } from 'reactstrap'
import { wellLookedMb } from '../helpers/utils'

export default class DialogGetFile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            warningMultiple: false,
            warningTooBigSize: false,
            fileinfo : {
                name : '',
                reqMb: 0,
                avlMb: 0
            }
        };
        this.dropzone = React.createRef();
        this.selectFile = this.selectFile.bind(this);
        this.handleSelectFile = this.handleSelectFile.bind(this);
        this.handleDropFile = this.handleDropFile.bind(this);
    }

    componentDidUpdate() {
        if (this.dropzone.current !== null) {
            this.dropzone.current.addEventListener('dragover', this.handleDragOver, false);
            this.dropzone.current.addEventListener('drop', this.handleDropFile, false);
        }
    }

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }


    selectFile() {
        this.setState({
            warningMultiple: false,
            warningTooBigSize: false
        });
        document.getElementById("inputGetFile").click();
    }

    checkFileSize(file) {
        if (file.size > (this.props.maxFileSize * 1024)) {
            this.setState({
                warningTooBigSize: true,
                fileinfo: {
                    name: file.name,
                    reqMb: wellLookedMb(file.size),
                    avlMb: wellLookedMb(this.props.maxFileSize * 1024)
                }
            });
            return false
        } else {
            return true
        }
    }

    handleSelectFile(evt) {
        this.setState({
            warningMultiple: false,
            warningTooBigSize: false
        })
        let file = evt.target.files[0];
        if (!this.checkFileSize(file)) return;
        document.getElementById('inputGetFile').value ="";
        this.props.onSelectFile(file);
    }

    handleDropFile(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if (evt.dataTransfer.files[0].size === 0 || evt.dataTransfer.files.length !== 1) {
            this.setState({
                warningMultiple: true
            });
            return
        } else {
            this.setState({
                warningMultiple: false,
                warningTooBigSize: false
            })
        }
        let file = evt.dataTransfer.files[0];
        if (!this.checkFileSize(file)) return;
        this.props.onSelectFile(file);
    }

    render() {
        const closeBtn = (
            <button className="close" onClick={this.props.onCancelSelect}>
                <i className="fa fa-times"></i>
            </button>
        );
        let warningMultiple = "";
        if (this.state.warningMultiple) {
            warningMultiple = (
                <Alert color="warning" className="mt-3 mb-0">
                    We do not support a multiple files uploading
                </Alert>
            )
        }
        let warningTooBigSize = "";
        if (this.state.warningTooBigSize) {
            warningTooBigSize = (
                <Alert color="danger" className="mt-3 mb-0">
                    <div className="text-truncate pb-1">
                        You have not enough MB to get this file: {this.state.fileinfo.name}
                    </div>
                    required: {this.state.fileinfo.reqMb} Mb<br />
                    available: {this.state.fileinfo.avlMb} Mb
                </Alert>
            )
        }

        return (
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    className={this.props.className}
                    centered={true}
                    fade={true}
                >
                    <ModalBody>
                        <div className="dropzone" ref={this.dropzone}>
                            {closeBtn}
                            <div className="row align-items-center justify-content-center h-100">
                                <Button color="primary" size="lg" onClick={this.selectFile}>Select a file ...</Button>
                                <input type="file" id="inputGetFile" name="files[]" className="d-none" onChange={this.handleSelectFile}/>
                            </div>
                            <div className="note w-100">
                                <h5 className="text-center">or drop a file here ...</h5>
                            </div>
                        </div>
                        {warningMultiple}
                        {warningTooBigSize}
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}
