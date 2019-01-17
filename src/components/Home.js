import React, { Component } from 'react';
import uniqid from '../helpers/uniqid';
import QRcode from './QRcode';
import { links } from '../config'
import DialogDownloading from './DialogDownloading'
import DialogFollowLink from './DialogFollowLink'
import DialogMessage from "./DialogMessage";
import * as firebase from 'firebase';


const HIDE = 0;
const SHOW = 1;
const WAIT = 2;
const LOADING = 3;

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clientId: null,
            transfering: false,
            rate: null,
            dialogFollow: false,
            linkfollow: '',
            dialogMessage: false,
            message: ''
        }
        this.setIdle = this.setIdle.bind(this);
        this.testing = this.testing.bind(this);
    }

    componentWillMount() {
        this.setState({
            clientId: this.getUniqId()
        })
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

    testing() {
        this.dialogMessage(SHOW, 'Some message');
    }

    render() {
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
                <div className="text-center py-5">
                    <QRcode clientId={this.state.clientId} />
                </div>
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