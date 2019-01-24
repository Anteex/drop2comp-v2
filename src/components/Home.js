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


const HIDE = 0;
const SHOW = 1;
const WAIT = 2;
const LOADING = 3;

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clientId: this.getUniqId(),
            transfering: false,
            rate: null,
            dialogFollow: false,
            linkfollow: '',
            dialogMessage: false,
            message: '',
            dialogGetFile: false
        }
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
        this.maxFileSize = 0;
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
        let url = config.localProtocol + '://' + this.address + ":" + config.localPort + "/" + this.state.clientId;
        let reader = new FileReader();
        let context = this;
        reader.onload = function() {
            let xhr = new XMLHttpRequest();
            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable) {
                    let progress = Math.round((e.loaded / e.total) * 100);
                    console.log('Upload is ' + progress + '% done');
                    context.dialogDownloading(LOADING, progress);
                }
            };
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    context.dialogDownloading(HIDE);
                    if (this.status === 200) {
                        console.log("Upload status: OK");
                        console.log("Event (" + context.state.clientId + ") : ok");
                        firebase.database().ref('links/' + context.state.clientId ).remove();
                        context.updateQR();
                    } else {
                        console.log("Upload status: error");
                        context.startRemoteUpload(file);
                    }
                }
            };
            xhr.open("POST", url);
            let boundary = this.state.clientId;
            xhr.setRequestHeader('Content-type', 'multipart/form-data; boundary="' + boundary + '"');
            xhr.setRequestHeader('Cache-Control', 'no-cache');
            let body = "--" + boundary + "\r\n";
            body += "Content-Disposition: form-data; filename='" +  encodeURIComponent(file.name) + "'\r\n"; // unescape РїРѕР·РІРѕР»РёС‚ РѕС‚РїСЂР°РІР»СЏС‚СЊ С„Р°Р№Р»С‹ СЃ СЂСѓСЃСЃРєРѕСЏР·С‹С‡РЅС‹РјРё РёРјРµРЅР°РјРё Р±РµР· РїСЂРѕР±Р»РµРј.
            body += "Content-Length: " + reader.result.length + "\r\n";
            body += "Content-Type: application/octet-stream\r\n\r\n";
            body += reader.result + "\r\n";
            body += "--" + boundary + "--";
            console.log("Data length: " + reader.result.length);

            if (!XMLHttpRequest.prototype.sendAsBinary) {
                XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                    function byteValue(x) {
                        return x.charCodeAt(0) & 0xff;
                    }
                    let ords = Array.prototype.map.call(datastr, byteValue);
                    let ui8a = new Uint8Array(ords);
                    this.send(ui8a.buffer);
                }
            }

            if(xhr.sendAsBinary) {
                xhr.sendAsBinary(body);
            } else {
                xhr.send(body);
            }
        };
        reader.readAsBinaryString(file);
    }

    startRemoteUpload(file) {
        if (this.remoteAvailable) {
            if (file.size < (this.maxFileSize * 1024)) {
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
                this.maxFileSize = snapshot.val().client.getmax;
                console.log("IP: " + this.address);
                console.log("MaxFileSize: " + this.maxFileSize);
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

    render() {
        let browserwarning = "";
        let qrcode = "";
        if (!unCompatibleBrowser()) {
            if (partiallyCompatibleBrowser()) {
                browserwarning = (
                    <Alert color="warning" className="text-center">
                        Your browser is partially compatible with our service. We recommend using <a href="https://chrome.google.com" target="_blank" rel="noopener noreferrer">Google Chrome</a>
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
                        Your browser is not compatible with our service. We recommend using <a href="https://chrome.google.com" target="_blank" rel="noopener noreferrer">Google Chrome</a>
                    </Alert>
                    <div className="text-center py-5">
                        <img src="/images/no-qrcode.png" alt="no qr-code"/>
                    </div>
                </div>
            )
        }
        return (
            <div className="container-fluid">
                <h1 className="text-center mt-5 d-none d-md-block">
                    It's an easy way to share your files, documents or pictures from your phone to any PC or Mac nearby. USB cable is not required.
                </h1>
                <h3 className="text-center my-4">
                    Just select a file on your phone and tap "share via ...".
                    Then choose <a href={links.download}>our app</a>
                </h3>
                {browserwarning}
                {qrcode}
                <h3 className="text-center my-4">
                    Scan this QR-code and wait for download is complete
                </h3>
                <DialogDownloading isOpen={this.state.transfering} rate={this.state.rate} />
                <DialogFollowLink isOpen={this.state.dialogFollow} linkfollow={this.state.linkfollow} onContinue={this.continueDownload} onFollow={this.stopDownload}/>
                <DialogMessage isOpen={this.state.dialogMessage} message={this.state.message} onOkClick={this.setIdle}/>
                <DialogGetFile isOpen={this.state.dialogGetFile} maxFileSize={this.maxFileSize} onSelectFile={this.startUploadFile} onCancelSelect={this.abortSelectFile}/>
            </div>
        )
    }
}