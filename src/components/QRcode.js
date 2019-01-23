import React, { Component } from 'react';
import QRCodeCanvas from 'qrcode.react';

export default class QRcode extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.clientId !== this.props.clientId) {
            this.props.onUpdate();
        }
        return true
    }

    render() {
        let qrcode = "";
        if (this.props.clientId === undefined) {
            qrcode = "wait";
        } else {
            qrcode = (
                <QRCodeCanvas
                    value={this.props.clientId}
                    size={256}
                    fgColor="#331b72"
                    bgColor="#fff"
                    level="L"
                    renderAs="svg"
                    includeMargin={false}
                />
            )
        }
        return (
            <div>
                {qrcode}
            </div>
        )
    }
}