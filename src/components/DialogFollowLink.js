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
                        <p className="text-truncate">
                            <a
                                href={this.props.linkfollow}
                                onClick={this.props.onFollow}
                                target="_blank"
                                rel="noopener noreferrer">
                            {this.props.linkfollow}
                            </a>
                        </p>
                        <p>
                            Do you want to follow the link or continue transferring the file?
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <a
                            className="btn btn-primary"
                            href={this.props.linkfollow}
                            onClick={this.props.onFollow}
                            role="button"
                            target="_blank"
                            rel="noopener noreferrer">
                        Follow
                        </a>
                        <Button color="secondary" onClick={this.props.onContinue}>Continue</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
