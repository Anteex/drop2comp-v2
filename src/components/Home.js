import React, { Component } from 'react';
import uniqid from '../helpers/uniqid';
import QRcode from './QRcode';
import { links } from '../config'


export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clientId: null
        }
        this.updateQR = this.updateQR.bind(this);
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

    render() {
        return (
            <div className="container-fluid">
                <button onClick={this.updateQR}>update</button>
                <h1 className="text-center mt-5">
                    It's an easy way to share your files, documents or pictures from your phone to any PC or Mac nearby. USB cable is not required.
                </h1>
                <h3 className="text-center my-4">
                    Just select a file on your phone and tap "share via ...".
                    Then choose <a href={links.download}>our app</a>
                </h3>
                <QRcode clientId={this.state.clientId} />
                <h3 className="text-center my-4">
                    Scan this QR-code and wait for download is complete
                </h3>
            </div>
        )
    }
}