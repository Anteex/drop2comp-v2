import React, { Component } from 'react';
import { Navbar } from 'reactstrap';
import BrandLogo from './BrandLogo';
import GetAppMenu from './GetAppMenu';


export default class NavigationBar extends Component {
    render() {
        return (
            <Navbar dark expand="xs">
                <BrandLogo />
                <GetAppMenu />
            </Navbar>
        )
    }
}