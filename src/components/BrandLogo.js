import React, { Component } from 'react';
import { NavbarBrand } from 'reactstrap';


export default class BrandLogo extends Component {
    render() {
        return (
            <NavbarBrand href="/">
                <img src='/images/logo32cnt.png' alt="logo"/>
                <b>Share2any</b>
            </NavbarBrand>
        )
    }
}
