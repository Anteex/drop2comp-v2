import React, { Component } from 'react'
import uniqid from '../helpers/uniqId'
import QRcode from './QRcode'
import { links, firebaseConfig, config } from '../config'
import DialogDownloading from './DialogDownloading'
import DialogFollowLink from './DialogFollowLink'
import DialogMessage from "./DialogMessage"
import DialogGetFile from "./DialogGetFile"
import * as firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'
import { Alert } from 'reactstrap'
import { partiallyCompatibleBrowser, unCompatibleBrowser } from '../helpers/uncompatibleBrowser'
import $ from 'jquery'
import downloadFile from '../helpers/downloadFile'
import axios from 'axios'
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textHome from "../translations/Home.json";
import { Helmet } from "react-helmet";


const HIDE = 0;
const SHOW = 1;
const WAIT = 2;
const LOADING = 3;

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clientId: this.getUniqId(),
            title: '',
            transfering: false,
            rate: null,
            dialogFollow: false,
            linkfollow: '',
            dialogMessage: false,
            message: '',
            dialogGetFile: false,
            maxFileSize: 0
        };

        this.props.addTranslation(textHome);

        this.setIdle = this.setIdle.bind(this);
        this.abortLocalDownload = this.abortLocalDownload.bind(this);
        this.updateDatabaseListener = this.updateDatabaseListener.bind(this);
        this.continueDownload = this.continueDownload.bind(this);
        this.stopDownload = this.stopDownload.bind(this);
        this.startUploadFile = this.startUploadFile.bind(this);
        this.abortLocalUpload = this.abortLocalUpload.bind(this);
        this.startRemoteUpload = this.startRemoteUpload.bind(this);
        this.abortSelectFile = this.abortSelectFile.bind(this);
    }

    componentDidMount() {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.setDatabaseListener();
    }

    componentWillUnmount() {
        this.unsetDatabaseListener();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeLanguage !== this.props.activeLanguage || this.state.title === "") {
          this.setState({
            title: nextProps.translate("title")
          })
        }
        return true
    }

    getUniqId() {
        let id = uniqid();
        console.log("Generate new client ID : " + id);
        return id;
    }

    updateQR() {
        this.unsetDatabaseListener();
        this.setState({
            clientId: this.getUniqId()
        })
    }

    updateDatabaseListener() {
        this.unsetDatabaseListener();
        this.setDatabaseListener();
    }

    setWait() {
        this.setState({
            transfering: true,
            rate: null
        })
    }

    setRate(rate) {
        this.setState({
            transfering: true,
            rate
        })
    }

    setFollow(linkfollow) {
        this.setState({
            dialogFollow: true,
            linkfollow
        })
    }

    setMessage(message) {
        this.setState({
            dialogMessage: true,
            message
        })
    }

    setGetFile() {
        this.setState({
            dialogGetFile: true
        })
    }

    setIdle() {
        this.setState({
            transfering: false,
            rate: null,
            dialogFollow: false,
            dialogMessage: false,
            message: '',
            dialogGetFile: false
        })
    }

    dialogDownloading(status, rate=0) {
        switch (status) {
            case HIDE:
                this.setIdle();
                break;
            case WAIT:
                this.setWait();
                break;
            case LOADING:
                this.setRate(rate)
                break;
            default:
                this.setIdle();
        }
    }

    dialogLinkFollow(status, linkfollow) {
        switch (status) {
            case HIDE:
                this.setIdle();
                break;
            case SHOW:
                this.setFollow(linkfollow)
                break;
            default:
                this.setIdle();
        }
    }

    dialogMessage(status, message) {
        switch (status) {
            case HIDE:
                this.setIdle();
                break;
            case SHOW:
                this.setMessage(message)
                break;
            default:
                this.setIdle();
        }
    }

    dialogGetFile(status) {
        switch (status) {
            case HIDE:
                this.setIdle();
                break;
            case SHOW:
                this.setGetFile();
                break;
            default:
                this.setIdle();
        }
    }

    startLocalDownload(url) {
        downloadFile(url);
        console.log("Event (" + this.state.clientId + ") : ok");
        firebase.database().ref('links/' + this.state.clientId ).remove();
        this.updateQR();
    }

    abortLocalDownload() {
        console.log("Local downloading error");
        clearTimeout(this.timerId);
        this.request.abort();
        console.log("Event (" + this.state.clientId + ") : error");
        firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
            url: "error"
        });
    }

    continueDownload() {
        console.log("Close follow link dialog and continue downloading file");
        this.dialogLinkFollow(HIDE);
        console.log("Event (" + this.state.clientId + ") : continue");
        firebase.database().ref('links/' + this.state.clientId + '/client/link').remove();
    }

    stopDownload() {
        console.log("Close follow link dialog and refresh QR-code");
        this.dialogLinkFollow(HIDE);
        console.log("Event (" + this.state.clientId + ") : break ");
        firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
            url: "break"
        });
        this.updateQR();
    }

    abortSelectFile() {
        console.log("Abort select file");
        this.dialogGetFile(HIDE);
        this.address = '';
        this.remoteAvailable = false;
        this.setState({
            maxFileSize: 0
        });
        firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
            geturl: "cancel"
        });
        this.updateQR();

    }

    startUploadFile(file) {
        this.dialogGetFile(HIDE);
        if (this.address.match( /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ ) !== null) {
            this.dialogDownloading(WAIT);
            let url = config.localProtocol + '://' + this.address + ":" + config.localPort;
            this.timerId = setTimeout(this.abortLocalUpload, config.localTimeOut, file);
            this.request = $.ajax({
                url: url,
                success: () => {
                    console.log("OK");
                    clearTimeout(this.timerId);
                    this.dialogDownloading(HIDE);
                    this.startLocalUpload(file);
                }
            });
        } else {
            this.startRemoteUpload(file);
        }
    }

    abortLocalUpload(file) {
        console.log("Local uploading error");
        clearTimeout(this.timerId);
        this.request.abort();
        this.startRemoteUpload(file);
    }

    startLocalUpload(file) {
        console.log("Upload locally");
        this.dialogDownloading(LOADING, 0);
        console.time("LocalUpload");
        let url = config.localProtocol + '://' + this.address + ":" + config.localPort + "/" + this.state.clientId;
        let context = this;

        let formData = new FormData();
        const blob = new Blob([file], { type: 'application/octet-stream' });
        formData.append('filesize', file.size);
        formData.append('file', blob, file.name);
        console.log("File size: " + file.size);

        axios
          .post(url, formData, {
            onUploadProgress: ProgressEvent => {
              let percent = Math.round(ProgressEvent.loaded / ProgressEvent.total*100);
              context.dialogDownloading(LOADING, percent);
              console.log('Upload is ' + percent + '% done');
            }
          })
          .then(res => {
            context.dialogDownloading(HIDE);
            console.timeEnd("LocalUpload");
            console.log("Upload status: OK");
            console.log("Event (" + context.state.clientId + ") : ok");
            firebase.database().ref('links/' + context.state.clientId ).remove();
            context.updateQR();
          })
          .catch(function (error) {
            context.dialogDownloading(HIDE);
            console.timeEnd("LocalUpload");
            console.log("Upload status: error");
            context.startRemoteUpload(file);
          });
    }

    startRemoteUpload(file) {
        if (this.remoteAvailable) {
            if (file.size < (this.state.maxFileSize * 1024)) {
                console.log("Upload remotely");
                this.dialogDownloading(LOADING, 0);
                let storageRef = firebase.storage().ref();
                let fileRef = storageRef.child('userfiles/' + this.state.clientId + '/' + file.name);
                let metadata = {
                    contentType: 'application/octet-stream',
                };
                let uploadTask = fileRef.put(file, metadata);
                let context = this;
                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                    function(snapshot) {
                        let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        console.log('Upload is ' + progress + '% done');
                        context.dialogDownloading(LOADING, progress);
                    }, function(error) {
                        context.dialogDownloading(HIDE);
                        console.log("Event (" + context.state.clientId + ") : error");
                        firebase.database().ref('links/' + context.state.clientId + '/client' ).set({
                            geturl: "error"
                        });
                        context.updateQR();
                    }, function() {
                        context.dialogDownloading(HIDE);
                        uploadTask.snapshot.ref.getDownloadURL().then(
                            function(downloadURL) {
                                console.log("Event (" + context.state.clientId + ") : restart");
                                firebase.database().ref('links/' + context.state.clientId + '/client' ).set({
                                    geturl: downloadURL
                                });
                                firebase.database().ref('files/' + context.state.clientId).set({
                                    timestamp: Date.now(),
                                    userid: context.state.clientId,
                                    fileref: "/userfiles/" + context.state.clientId + "/" + file.name
                                });
                                context.updateQR();
                            }
                        );
                    });
            } else {
                console.log("Upload remotely abort. File too large for remote transfer.");
                this.dialogDownloading(HIDE);
                this.dialogMessage(SHOW, "File too large for remote transfer");
                console.log("Event (" + this.state.clientId + ") : error");
                firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
                    geturl: "error"
                });
                this.updateQR();
            }
        } else {
            console.log("Upload remotely abort. Maximum file transfers per day limit reached.");
            this.dialogDownloading(HIDE);
            this.dialogMessage(SHOW, "Maximum file transfers per day limit reached");
            console.log("Event (" + this.state.clientId + ") : error");
            firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
                geturl: "error"
            });
            this.updateQR();
        }
    }

    setDatabaseListener() {
        this.linkRef = firebase.database().ref('links/' + this.state.clientId );
        this.linkRef.on("value", (snapshot) => {
            console.log("Event (" + this.state.clientId + ") : processing ... ");

            if (snapshot.val() === null) {
                console.log("Event (" + this.state.clientId + ") : ... STOP (null)");
                return
            }

            let ip = snapshot.val().client.url;

            if (typeof ip === "undefined") {
                console.log("Event (" + this.state.clientId + ") : ... STOP (undefined)");
                return
            }

            if (ip === "error") {
                console.log("Event (" + this.state.clientId + ") : ... STOP (error)");
                return
            }

            if (ip === "break") {
                console.log("Event (" + this.state.clientId + ") : ... STOP (break)");
                return
            }

            if (ip === "cancel") {
                console.log("Cancel.");
                console.log("Event (" + this.state.clientId + ") : ok");
                this.dialogDownloading(HIDE);
                firebase.database().ref('links/' + this.state.clientId ).remove();
                this.updateQR();
                return
            }

            if (ip === "wait") {
                console.log("Waiting ...");
                this.dialogDownloading(WAIT);
                return
            }

            let weblink = snapshot.val().client.link;

            if (typeof weblink !== 'undefined') {
                console.log("Link was found...");
                this.dialogLinkFollow(SHOW, weblink);
                return
            }

            this.fileSize = snapshot.val().client.getfs;

            if (typeof this.fileSize !== 'undefined') {
                console.log("Ready to upload file. Waiting file select ...");
                this.dialogGetFile(SHOW);
                this.address = ip;
                this.remoteAvailable = snapshot.val().client.remote === "enable";
                this.setState({
                    maxFileSize: snapshot.val().client.getmax
                });
                console.log("IP: " + this.address);
                console.log("MaxFileSize: " + this.state.maxFileSize);
                return
            }

            if (ip.match( /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ ) !== null) {
                console.log("Connecting to " + ip + " ...");
                this.dialogDownloading(WAIT);
                let url = config.localProtocol + "://" + ip + ":" + config.localPort + "/";
                this.timerId = setTimeout(this.abortLocalDownload, config.localTimeOut);
                this.request = $.ajax({
                    url,
                    success: () => {
                        console.log("OK");
                        console.log("Download locally");
                        clearTimeout(this.timerId);
                        this.dialogDownloading(HIDE);
                        this.startLocalDownload(url + this.state.clientId);
                    }
                });
            }
            else {
                console.log("Download remotely");
                this.dialogDownloading(HIDE);
                this.startLocalDownload(ip);
            }
        });

        let mlTotal = 0;
        let mlDownloaded = 0;

        this.multilinkRef = firebase.database().ref('multilinks/' + this.state.clientId );
        this.multilinkRef.on("child_added", (snapshot) => {

            if (snapshot.val() === null) return;

            if (snapshot.key === "total") {
                console.log("Ready to download " + mlTotal + " files remotely");
                this.dialogDownloading(SHOW);
                mlTotal = snapshot.val();
                return
            }

            if (snapshot.key === "timestamp") return;

            let adrs = snapshot.val();

            if (adrs === "terminate") {
                console.log("Download terminate");
                console.log("Event (" + this.state.clientId + ") : ok");
                this.dialogDownloading(HIDE);
                mlTotal = 0;
                firebase.database().ref('multilinks/' + this.state.clientId ).remove();
                this.updateQR();
                return
            }

            mlDownloaded +=1;

            if (adrs !== "cancel") {
                console.log("Downloading " + mlDownloaded + " of " + mlTotal);
                downloadFile(adrs);
            } else {
                console.log("Downloading " + mlDownloaded + " cancel");
            }

            if (mlDownloaded === mlTotal && mlTotal > 0) {
                console.log("Download complete");
                console.log("Event (" + this.state.clientId + ") : ok");
                this.dialogDownloading(HIDE);
                mlTotal = 0;
                firebase.database().ref('multilinks/' + this.state.clientId ).remove();
                this.updateQR();
            }
        });

    }

    unsetDatabaseListener() {
        if (typeof this.linkRef !== 'undefined') {
            this.linkRef.off();
        }
        if (typeof this.multilinkRef !== 'undefined') {
            this.multilinkRef.off();
        }
    }

    test() {
        this.dialogGetFile(SHOW);
    }

    render() {
        let browserwarning = "";
        let qrcode = "";
        if (!unCompatibleBrowser()) {
            if (partiallyCompatibleBrowser()) {
                browserwarning = (
                    <Alert color="warning" className="text-center">
                        <Translate id="partiallyCompatible" />&nbsp;<a href="https://chrome.google.com" target="_blank" rel="noopener noreferrer">Google Chrome</a>
                    </Alert>
                )
            }
            qrcode = (
                <div className="text-center py-5">
                    <QRcode clientId={this.state.clientId} onUpdate={this.updateDatabaseListener} />
                </div>
            )
        } else {
            qrcode = (
                <div>
                    <Alert color="danger" className="text-center">
                        <Translate id="notCompatible" />&nbsp;<a href="https://chrome.google.com" target="_blank" rel="noopener noreferrer">Google Chrome</a>
                    </Alert>
                    <div className="text-center py-5">
                        <img src="/images/no-qrcode.png" alt="no qr-code"/>
                    </div>
                </div>
            )
        }
        return (
            <div className="container-fluid">
                <button onClick={this.test.bind(this)}>Test</button>
                <Helmet>
                  <title>{this.state.title}</title>
                </Helmet>
                <h1 className="text-center mt-5 d-none d-md-block">
                    <Translate id="intro1" />
                </h1>
                <h3 className="text-center my-4">
                    <Translate id="intro2" /><br />
                    <Translate id="choose" />&nbsp;
                    <a href={links.download}><Translate id="app" /></a>
                </h3>
                {browserwarning}
                {qrcode}
                <h3 className="text-center my-4">
                    <Translate id="scanwait" />
                </h3>
                <DialogDownloading isOpen={this.state.transfering} rate={this.state.rate} />
                <DialogFollowLink isOpen={this.state.dialogFollow} linkfollow={this.state.linkfollow} onContinue={this.continueDownload} onFollow={this.stopDownload}/>
                <DialogMessage isOpen={this.state.dialogMessage} message={this.state.message} onSecondaryClick={this.setIdle} secondaryButton="OK"/>
                <DialogGetFile isOpen={this.state.dialogGetFile} maxFileSize={this.state.maxFileSize} onSelectFile={this.startUploadFile} onCancelSelect={this.abortSelectFile}/>
            </div>
        )
    }
}

export default withLocalize(Home);
