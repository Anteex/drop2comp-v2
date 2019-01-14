import React, { Component } from 'react';
import { NavbarBrand } from 'reactstrap';


export default class BrandLogo extends Component {
    render() {
        return (
            <NavbarBrand href="/">
                <img src='/logo32cnt.png' alt="logo"/>
                <b>drop2comp</b>
            </NavbarBrand>
        )
    }
}