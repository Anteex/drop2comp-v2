import React, { Component } from 'react'
import {Modal, ModalBody, Button, Alert } from 'reactstrap'
import { wellLookedMb } from '../helpers/utils'
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textDialogGetFile from "../translations/DialogGetFile.json";
import Uploading from "./Uploading"


class DialogGetFile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            fileinfo : {
                name : '',
                reqMb: 0,
                avlMb: 0
            },
            queryFiles: []
        };

        this.props.addTranslation(textDialogGetFile);

        this.dropzone = React.createRef();

        this.selectFile = this.selectFile.bind(this);
        this.handleSelectFile = this.handleSelectFile.bind(this);
        this.handleDropFile = this.handleDropFile.bind(this);
        this.handleRemoveItem = this.handleRemoveItem.bind(this);
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

    appendQueryFiles(files){
        let queryFiles = this.state.queryFiles;
        for (let i=0; i < files.length; i++) {
            queryFiles.push({
                file: files[i],
                rate: 0,
                waiting: true
            })
        }
        this.setState({
            queryFiles
        })
    }

    handleSelectFile(evt) {
        this.appendQueryFiles(evt.target.files);
        document.getElementById('inputGetFile').value ="";
    }

    handleDropFile(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this.appendQueryFiles(evt.dataTransfer.files);
    }

    handleRemoveItem(key) {
        let queryFiles = this.state.queryFiles;
        queryFiles.splice(key, 1);
        this.setState({
            queryFiles
        })
    }

    render() {
        const closeBtn = (
            <button className="close" onClick={this.props.onCancelSelect}>
                <i className="fa fa-times"></i>
            </button>
        );
        let warningTooBigSize = "";
        if (this.state.warningTooBigSize) {
            warningTooBigSize = (
                <Alert color="danger" className="mt-3 mb-0">
                    <div className="text-truncate pb-1">
                        <Translate id="noenough" />&nbsp;{this.state.fileinfo.name}
                    </div>
                    <Translate id="required" />&nbsp;{this.state.fileinfo.reqMb}&nbsp;<Translate id="mb"/><br />
                    <Translate id="available" />&nbsp;{this.state.fileinfo.avlMb}&nbsp;<Translate id="mb"/>
                </Alert>
            )
        }
        const uploadingFiles = this.state.queryFiles.map((item, key) => {
            return (
                <Uploading file={item.file} filename={item.file.name} key={key} itemIndex={key} rate={item.rate} waiting={item.waiting} handleClose={this.handleRemoveItem}/>
            )
        });
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
                                <Button color="primary" size="lg" onClick={this.selectFile}><Translate id="selectfile" /></Button>
                                <input type="file" id="inputGetFile" name="files[]" className="d-none" onChange={this.handleSelectFile} multiple/>
                            </div>
                            <div className="note w-100">
                                <h5 className="text-center"><Translate id="dropfile"/></h5>
                            </div>
                        </div>
                        {warningTooBigSize}
                        <div className="row">
                            {uploadingFiles}
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}

export default withLocalize(DialogGetFile);