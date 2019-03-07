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
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textHome from "../translations/Home.json";
import textToast from "../translations/Toast.json";
import { Helmet } from "react-helmet";
import { HIDE, SHOW, WAIT, LOADING } from "../helpers/const";
import { toast } from 'react-toastify';
import ParallaxImage from './ParallaxImage'
import { PresentLine } from './PresentLine'


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
            upload: {
                maxFileSize: 0,
                remoteAvailable: false,
                remoteMaxSize: 0,
                address: ''
            }
        };

        this.props.addTranslation(textHome);
        this.props.addTranslation(textToast);

        this.setIdle = this.setIdle.bind(this);
        this.abortLocalDownload = this.abortLocalDownload.bind(this);
        this.updateDatabaseListener = this.updateDatabaseListener.bind(this);
        this.continueDownload = this.continueDownload.bind(this);
        this.stopDownload = this.stopDownload.bind(this);
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
        toast(this.props.translate("fileGotten"));
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
        console.log("Close select file window");
        this.dialogGetFile(HIDE);
        this.setState({
            upload: {
                maxFileSize: 0,
                remoteAvailable: false,
                remoteMaxSize: 0,
                address: ''
            }
        });
        firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
            geturl: "cancel"
        });
        console.log("Event (" + this.state.clientId + ") : ok");
        this.updateQR();
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
                this.setIdle();
                this.setState({
                    upload: {
                        maxFileSize: 0,
                        remoteAvailable: false,
                        remoteMaxSize: 0,
                        address: ''
                    }

                });
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
                this.setState({
                    upload: {
                        maxFileSize: snapshot.val().client.getfs,
                        remoteAvailable: snapshot.val().client.remote === "enable",
                        remoteMaxSize: snapshot.val().client.getmax,
                        address: ip
                    }
                });
                console.log("IP: " + this.state.upload.address);
                console.log("MaxFileSize: " + this.state.upload.maxFileSize);
                console.log("MaxRemoteSize: " + this.state.upload.remoteMaxSize);
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
                mlTotal = snapshot.val();
                console.log("Ready to download " + mlTotal + " files remotely");
                this.dialogDownloading(WAIT);
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
                toast(this.props.translate("fileGotten"));
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
            <React.Fragment>
                <div className="container-fluid px-4 mb-5">
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
                    <DialogGetFile isOpen={this.state.dialogGetFile} uploadState={this.state.upload} clientId={this.state.clientId} onSelectFile={this.startUploadFile} onCancelSelect={this.abortSelectFile}/>
                </div>
                <div className="container-fluid no-gutters pt-5">
                    <ParallaxImage src="/images/background_01.jpg" className="pb-5">
                        <p className="display-1"><Translate id="fewSteps"/></p>
                    </ParallaxImage>
                </div>
                <div className="container">
                    <PresentLine src="/images/step1.jpg" alt="Step #1"><Translate id="step1"/></PresentLine>
                    <PresentLine src="/images/step2.jpg" alt="Step #2"><Translate id="step2"/></PresentLine>
                    <PresentLine src="/images/step3.jpg" alt="Step #3"><Translate id="step3"/></PresentLine>
                </div>
                <div className="container-fluid no-gutters">
                    <ParallaxImage src="/images/background_02.jpg" className="pt-5">
                        <a
                            href={links.download}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src="/images/google-play-badge.png" alt="google play badge"/>
                        </a>
                    </ParallaxImage>
                </div>
            </React.Fragment>
        )
    }
}

export default withLocalize(Home);
