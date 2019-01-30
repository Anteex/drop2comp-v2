import React, { Component } from 'react';
import {Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textDialogFollowLink from "../translations/DialogFollowLink.json";


class DialogFollowLink extends Component {

    constructor(props) {
        super(props);
        this.props.addTranslation(textDialogFollowLink);
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
                            <Translate id="text" />
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
                            <Translate id="question" />
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
                        <Translate id="follow" />
                        </a>
                        <Button color="secondary" onClick={this.props.onContinue}><Translate id="continue"/></Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default withLocalize(DialogFollowLink);