import React, { Component } from 'react';
import {Modal, ModalBody, ModalFooter, Button } from 'reactstrap';

export default class DialogMessage extends Component {

    render() {
        const primary = ( !!this.props.onPrimaryClick
            ? (
              <Button color="primary" onClick={this.props.onPrimaryClick}>{this.props.primaryButton}</Button>
            )
            : null );
        const secondary = ( !!this.props.onSecondaryClick
            ? (
              <Button color="secondary" onClick={this.props.onSecondaryClick}>{this.props.secondaryButton}</Button>
            )
            : null );
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
                        {primary}
                        {secondary}
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
