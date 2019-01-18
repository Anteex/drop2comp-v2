import React, { Component } from 'react';
import {Modal, ModalBody, ModalFooter, Button } from 'reactstrap';

export default class DialogFollowLink extends Component {

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
                            It seems you have a web link in the transferred text:
                        </p>
                        <p class="text-truncate">
                            <a href={this.props.linkfollow} target="_blank" rel="noopener noreferrer">{this.props.linkfollow}</a>
                        </p>
                        <p>
                            Do you want to follow the link or continue transferring the file?
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary">Follow</Button>
                        <Button color="secondary">Continue</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
