import React, { Component } from 'react';
import QRCodeCanvas from 'qrcode.react';

export default class QRcode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            clientId: this.props.clientId
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.clientId !== undefined) {
            this.setState ({
                clientId: nextProps.clientId
            })
        }
    }

    render() {
        let qrcode = "";
        if (this.state.clientId === undefined) {
            qrcode = "wait";
        } else {
            qrcode = (
                <QRCodeCanvas
                    value={this.state.clientId}
                    size={256}
                    fgColor="#000"
                    bgColor="#fff"
                    level="L"
                    renderAs="svg"
                    includeMargin={false}
                />
            )
        }
        return (
            <div className="text-center p-5">
                {qrcode}
            </div>
        )
    }
}