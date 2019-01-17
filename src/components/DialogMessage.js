import React, { Component } from 'react';
import {Modal, ModalBody, ModalFooter, Button } from 'reactstrap';

export default class DialogMessage extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    toggle={this.toggle}
                    className={this.props.className}
                    centered={true}
                    fade={true}
                >
                    <ModalBody>
                        <p>
                            {this.props.message}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.onOkClick}>OK</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
