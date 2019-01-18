import React, { Component } from 'react';
import {Modal, ModalBody, Progress } from 'reactstrap';

export default class DialogDownloading extends Component {

    render() {
        let progress
        if (this.props.rate) {
            progress = (
                <Progress value={this.props.rate}>{this.props.rate}%</Progress>
            )
        } else {
            progress = (
                <div>
                    <Progress multi>
                        <Progress bar className="indeterminate"/>
                    </Progress>
                </div>
            )
        }
        return (
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    className={this.props.className}
                    centered={true}
                    fade={false}
                >
                    <ModalBody>
                        {progress}
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}
