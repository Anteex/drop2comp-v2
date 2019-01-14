import React, { Component } from 'react';
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Nav } from 'reactstrap';

export default class GetAppMenu extends Component {
    render() {
        return (
            <Nav className="ml-auto" navbar>
                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav >
                        Don't have drop2comp on your phone yet? Try it now!
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.drop2comp&utm_source=drop2comp"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src="/google-play-badge.png" alt="google play badge"/>
                            </a>
                        </DropdownItem>
                        <div className="text-center pt-4">
                            <img src="/qr-code-download.png" alt="qr-code for download"/>
                        </div>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </Nav>
        )
    }
}
