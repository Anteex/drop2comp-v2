import React, { Component } from 'react';
import { Navbar, NavbarToggler, Collapse, NavItem, NavLink, Nav } from 'reactstrap';
import BrandLogo from './BrandLogo';
import GetAppMenu from './GetAppMenu';
import { mainMenu } from '../config';
import { Translate } from "react-localize-redux";
import { withLocalize } from "react-localize-redux";


class NavigationBar extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
        this.menu = mainMenu;
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        const menuItems = this.menu.map((item, key) => {
            return (
                <NavItem key={key} className="pb-3">
                    <div className="row">
                        <div className="col-2 text-center">
                            <span className={item.icon + " fa sidenav-icon"} aria-hidden="true"></span>
                        </div>
                        <div className="col">
                            <NavLink href={"/" + item.path} className="d-inline">
                                <Translate id={"mainMenu." + item.titleId} />
                            </NavLink>
                        </div>
                    </div>
                </NavItem>
            )
        })
        return (
            <Navbar dark expand="md">
                <BrandLogo />
                <NavbarToggler onClick={this.toggle} />
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="pt-5 d-md-none" navbar>
                        {menuItems}
                    </Nav>
                    <GetAppMenu />
                </Collapse>
            </Navbar>
        )
    }
}

export default withLocalize(NavigationBar);