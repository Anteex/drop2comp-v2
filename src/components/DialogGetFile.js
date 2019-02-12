import React, { Component } from 'react'
import { Modal, ModalBody, Button, Alert, Collapse } from 'reactstrap'
import { wellLookedMb, bytesToRoundKB } from '../helpers/utils'
import { processUpload } from '../helpers/upload'
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textDialogGetFile from "../translations/DialogGetFile.json";
import Uploading from "./Uploading"
import DialogMessage from "./DialogMessage"
import md5 from 'crypto-js/md5'


const HIDE = 0;
const SHOW = 1;

class DialogGetFile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            warningTooBigSize: false,
            filesInfo : {
                reqMb: 0,
                avlMb: 0
            },
            queryFiles: [],
            dialogQuestion: false,
            questionText: ''
        };

        this.props.addTranslation(textDialogGetFile);

        this.dropzone = React.createRef();

        this.selectFile = this.selectFile.bind(this);
        this.handleSelectFile = this.handleSelectFile.bind(this);
        this.handleDropFile = this.handleDropFile.bind(this);
        this.removeFromQueryFiles = this.removeFromQueryFiles.bind(this);
        this.handleDeletingItem = this.handleDeletingItem.bind(this);
        this.onCancelSelect = this.onCancelSelect.bind(this);
        this.onYesClick = this.onYesClick.bind(this);
        this.onNoClick = this.onNoClick.bind(this);
        this.checkFilesSize = this.checkFilesSize.bind(this);
    }

    componentDidUpdate() {
        if (this.dropzone.current !== null) {
            this.dropzone.current.addEventListener('dragover', this.handleDragOver, false);
            this.dropzone.current.addEventListener('drop', this.handleDropFile, false);
        }
        this.processQueryFiles();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.queryFiles.length !== this.state.queryFiles.length) {
            this.checkFilesSize(nextState.queryFiles);
            if (nextState.queryFiles.length > 0) {
                this.processQueryFiles()
            }
        }
        return true
    }

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }

    selectFile() {
        document.getElementById("inputGetFile").click();
    }

    checkFilesSize(queryFiles) {
        const currentFileSize = queryFiles.reduce((sum, item) => {
          return sum + bytesToRoundKB(item.file.size)
        }, 0);
        console.log("Current files size: " + currentFileSize + ". Maximum: " + this.props.uploadState.maxFileSize);
        if (currentFileSize > this.props.uploadState.maxFileSize) {
            this.setState({
                warningTooBigSize: true,
                filesInfo: {
                    reqMb: wellLookedMb(currentFileSize * 1024),
                    avlMb: wellLookedMb(this.props.uploadState.maxFileSize * 1024)
                }
            });
        } else {
            this.setState({
                warningTooBigSize: false
            })
        }
    }

    appendToQueryFiles(files){
        let queryFiles = [...this.state.queryFiles];
        for (let i=0; i < files.length; i++) {
            queryFiles.push({
                file: files[i],
                rate: 0,
                waiting: true,
                skip: false,
                deleting: false
            })
        }
        this.setState({
            queryFiles
        });
    }

    removeFromQueryFiles(key) {
        let queryFiles = [...this.state.queryFiles];
        queryFiles.splice(key, 1);
        this.setState({
            queryFiles
        })
    }

    setSkipInQueryFiles(key) {
        if (!this.state.queryFiles[key].skip && !this.state.queryFiles[key].deleting) {
            let queryFiles = [...this.state.queryFiles];
            queryFiles[key].skip = true;
            this.setState({
                queryFiles
            })
        }
    }

    setRateInQueryFiles(key, rate) {
        let queryFiles = [...this.state.queryFiles];
        queryFiles[key].waiting = false;
        queryFiles[key].rate = rate;
        this.setState({
            queryFiles
        })
    }

    processQueryFiles() {
        if (this.state.queryFiles.length > 0) {
            const setRate = (rate) => {
                this.setRateInQueryFiles(i, rate)
            }

            let i = 0;
            while (i < this.state.queryFiles.length && this.state.queryFiles[i].file.size > this.props.uploadState.maxFileSize * 1024) {
                this.setSkipInQueryFiles(i);
                i++
            }
            if (i < this.state.queryFiles.length && this.state.queryFiles[i].waiting && !this.state.queryFiles[i].skip && !this.state.queryFiles[i].deleting) {
                setRate(0);
                processUpload(this.state.queryFiles[i].file, setRate, this.props.uploadState, this.props.clientId)
                    .then( result => {
                        this.removeFromQueryFiles(i);
                    })
                    .catch( error => {
                        this.setSkipInQueryFiles(i)
                    })
            }
        }
    }


    handleSelectFile(evt) {
        this.appendToQueryFiles(evt.target.files);
        document.getElementById('inputGetFile').value ="";
    }

    handleDropFile(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this.appendToQueryFiles(evt.dataTransfer.files);
    }

    handleDeletingItem(key) {
      let queryFiles = [...this.state.queryFiles];
      queryFiles[key].deleting = true;
      this.setState({
        queryFiles
      })
    }

    showDialog(text) {
      this.setState({
        dialogQuestion: true,
        questionText: text
      })
    }

    hideDialog() {
      this.setState({
        dialogQuestion: false,
        questionText: ''
      })
    }

    questionDialog(status, message='') {
      switch (status) {
          case HIDE:
              this.hideDialog();
              break;
          case SHOW:
              this.showDialog(message);
              break;
          default:
              this.hideDialog();
      }
    }

    onCancelSelect() {
      if (this.state.queryFiles.length > 0) {
        this.questionDialog(SHOW, this.props.translate("questionText", { count: 5 }));
      } else {
        this.onYesClick();
      }
    }

    onYesClick() {
      this.questionDialog(HIDE);
      this.setState({
        queryFiles: []
      });
      this.props.onCancelSelect();
    }

    onNoClick() {
      this.questionDialog(HIDE);
    }

    render() {
        const closeBtn = (
            <button className="close" onClick={this.onCancelSelect}>
                <i className="fa fa-times"></i>
            </button>
        );
        const warningTooBigSize = (
            <Collapse isOpen={this.state.warningTooBigSize}>
                <Alert color="danger" className="mt-2 mb-2">
                    <div className="text-truncate pb-1">
                        <Translate id="noenough" />
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <Translate id="required" />&nbsp;{this.state.filesInfo.reqMb}&nbsp;<Translate id="mb"/><br />
                        </div>
                        <div className="col-6">
                            <Translate id="available" />&nbsp;{this.state.filesInfo.avlMb}&nbsp;<Translate id="mb"/>
                        </div>
                    </div>
                </Alert>
            </Collapse>
        )
        const uploadingFiles = this.state.queryFiles.map((item, key) => {
            return (
                <Uploading queryItem={item} key={md5(item.file.name).toString()} itemIndex={key} handleClose={this.removeFromQueryFiles} handleDelete={this.handleDeletingItem}/>
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
                <DialogMessage isOpen={this.state.dialogQuestion} message={this.state.questionText} onPrimaryClick={this.onYesClick} primaryButton="Yes" onSecondaryClick={this.onNoClick} secondaryButton="No"/>
            </div>
        )
    }
}

export default withLocalize(DialogGetFile);
