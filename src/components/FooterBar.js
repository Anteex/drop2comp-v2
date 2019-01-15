import React, { Component } from 'react';
import { links } from '../config';


export default class FooterBar extends Component {
    render() {
        const today = new Date();
        return (
            <footer>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-6 col-md-3 pb-5">
                            <h6 className="text-uppercase"><b>&copy;{today.getFullYear()} All rights reserved</b></h6>
                        </div>
                        <div className="col-sm-6 col-md-3"></div>
                        <div className="col-sm-6 col-md-3 pb-5">
                            <h6 className="text-uppercase"><b>Social networks</b></h6>
                            <p className="pt-3">
                                <a href={links.googlePlay} className="footer" target="_blank" rel="noopener noreferrer">
                                    <i className="fa fa-play" aria-hidden="true"></i>
                                    Google Play
                                </a>
                            </p>
                            <p>
                                <a href={links.facebook} className="footer" target="_blank" rel="noopener noreferrer">
                                    <i className="fa fa-facebook-official" aria-hidden="true"></i>
                                    Facebook
                                </a>
                            </p>
                        </div>
                        <div className="col-sm-6 col-md-3 pb-5">
                            <h6 className="text-uppercase"><b>Language</b></h6>
                            <p className="pt-3">
                                <span className="footer" >
                                    EN
                                </span>
                            </p>
                            <p>
                                <span className="footer" >
                                    RU
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }
}