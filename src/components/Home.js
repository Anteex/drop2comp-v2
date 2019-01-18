import React, { Component } from 'react';
import uniqid from '../helpers/uniqid';
import QRcode from './QRcode';
import { links, firebaseConfig } from '../config'
import DialogDownloading from './DialogDownloading'
import DialogFollowLink from './DialogFollowLink'
import DialogMessage from "./DialogMessage";
import * as firebase from 'firebase';
import { Alert } from 'reactstrap';
import { partiallyCompatibleBrowser, unCompatibleBrowser } from '../helpers/UncompatibleBrowser'
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
            message: ''
        }
        this.setIdle = this.setIdle.bind(this);
        this.abortLocalDownload = this.abortLocalDownload.bind(this);
        this.testing = this.testing.bind(this);
    }

    componentDidMount() {
        firebase.initializeApp(firebaseConfig);
        this.databaseListener();

    }

    componentWillUnmount() {
        if (typeof this.linkRef !== 'undefined') {
            this.linkRef.off();
        }
        if (typeof this.multilinkRef !== 'undefined') {
            this.multilinkRef.off();
        }
    }

    getUniqId() {
        let id = uniqid();
        console.log("Generate new client ID : " + id);
        return id;
    }

    updateQR() {
        this.setState({
            clientId: this.getUniqId()
        })
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

    setIdle() {
        this.setState({
            transfering: false,
            rate: null,
            dialogFollow: false,
            linkfollow: '',
            dialogMessage: false,
            message: ''
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
                //TODO доделать
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
        console.log("Error");
        clearTimeout(this.timerId);
        this.request.abort();
        console.log("Event (" + this.state.clientId + ") : error");
        firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
            url: "error"
        });
    }



    databaseListener() {
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
                this.dialogDownloading(HIDE);
                console.log("Event (" + this.state.clientId + ") : ok");
                firebase.database().ref('links/' + this.state.clientId ).remove();
                this.updateQR();
                return
            }
            if (ip === "wait") {
                this.dialogDownloading(WAIT);
                console.log("Waiting ...");
                return
            }
            let weblink = snapshot.val().client.link;
            if (typeof weblink !== 'undefined') {
                this.dialogLinkFollow(SHOW, weblink)
                console.log("Link was found...");
                return
            }
            this.fileSize = snapshot.val().client.getfs;
            if (typeof this.fileSize !== 'undefined') {
                console.log("Ready to upload file. Waiting file select ...");
                this.dialogGetFile(SHOW);
                this.address = ip;
                this.remoteAvailable = snapshot.val().client.remote === "enable";
                this.maxFileSize = snapshot.val().client.getmax;
                return
            }
            if (ip.match( /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ ) !== null) {
                console.log("Connecting to " + ip + " ...");
                this.dialogDownloading(WAIT);
                let url = "http://" + ip + ":8080/";
                this.timerId = setTimeout(this.abortLocalDownload, 3000);
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
        this.multilinkRef.on("child_added", function(snapshot) {
            if (snapshot.val() === null) return;
            if (snapshot.key === "total") {
                this.dialogDownloading(SHOW);
                mlTotal = snapshot.val();
                console.log("Ready to download " + mlTotal + " files remotely");
                return
            }
            if (snapshot.key === "timestamp") return;
            let adrs = snapshot.val();
            if (adrs === "terminate") {
                console.log("Download terminate");
                this.dialogDownloading(HIDE);
                mlTotal = 0;
                console.log("Event (" + this.state.clientId + ") : ok");
                firebase.database().ref('multilinks/' + this.state.clientId ).remove();
                this.updateQR();
                return
            }
            mlDownloaded +=1;
            if (adrs !== "cancel") {
                this.downloadFile(adrs);
                console.log("Downloading " + mlDownloaded + " of " + mlTotal);
            } else {
                console.log("Downloading " + mlDownloaded + " cancel");
            }
            if (mlDownloaded === mlTotal && mlTotal > 0) {
                console.log("Download complete");
                this.dialogDownloading(HIDE);
                mlTotal = 0;
                console.log("Event (" + this.state.clientId + ") : ok");
                firebase.database().ref('multilinks/' + this.state.clientId ).remove();
                this.updateQR();
            }
        });

    }

    testing() {
        this.dialogMessage(SHOW, 'Some message');
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
                    <QRcode clientId={this.state.clientId} />
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
                <button onClick={this.testing}>Testing</button>
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
                <DialogFollowLink isOpen={this.state.dialogFollow} linkfollow={this.state.linkfollow} />
                <DialogMessage isOpen={this.state.dialogMessage} message={this.state.message} onOkClick={this.setIdle}/>
            </div>
        )
    }
}