import React, { Component } from 'react';
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Nav } from 'reactstrap';
import { links } from '../config'
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textGetAppMenu from "../translations/GetAppMenu.json";


class GetAppMenu extends Component {

    constructor(props) {
        super(props);
        this.props.addTranslation(textGetAppMenu);
    }

    render() {
        return (
            <Nav className="ml-auto d-none d-md-block" navbar>
                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav >
                        <Translate id="getApp" />
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem>
                            <a
                                href={links.download}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src="/images/google-play-badge.png" alt="google play badge"/>
                            </a>
                        </DropdownItem>
                        <div className="text-center pt-4">
                            <img src="/images/qr-code-download.png" alt="qr-code for download"/>
                        </div>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </Nav>
        )
    }
}

export default withLocalize(GetAppMenu);