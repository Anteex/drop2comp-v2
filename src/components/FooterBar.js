import React, { Component } from 'react';
import { links } from '../config';
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textFooterBar from "../translations/FooterBar.json";
import { Helmet } from "react-helmet";


class FooterBar extends Component {

    constructor(props) {
        super(props);
        this.props.addTranslation(textFooterBar);
        this.setLanguage = this.setLanguage.bind(this);
    }

    setLanguage(lang) {
        this.props.setActiveLanguage(lang);
        localStorage.setItem('lang', lang)
    }

    render() {
        const today = new Date();
        const langList = this.props.languages.map(lang => {
            return (
                <p key={lang.code}>
                    <span className="footer text-uppercase" onClick={() => this.setLanguage(lang.code)}>
                        {lang.code}
                    </span>
                </p>
                )
        });
        let helmet = "";
        if (!!this.props.activeLanguage) {
            helmet = (
                <Helmet>
                    <html lang={this.props.activeLanguage.code} />
                </Helmet>
            )
        }
        return (
            <footer>
                {helmet}
                <div className="container">
                    <div className="row">
                        <div className="col-sm-6 col-md-3 pb-5">
                            <h6 className="text-uppercase"><b>&copy;{today.getFullYear()} <Translate id="rights"/></b></h6>
                        </div>
                        <div className="col-sm-6 col-md-3"></div>
                        <div className="col-sm-6 col-md-3 pb-5">
                            <h6 className="text-uppercase pb-3"><b><Translate id="social"/></b></h6>
                            <p>
                                <a href={links.googlePlay} className="footer" target="_blank" rel="noopener noreferrer">
                                    <i className="fa fa-play" aria-hidden="true"></i>
                                    <Translate id="googleplay"/>
                                </a>
                            </p>
                            <p>
                                <a href={links.facebook} className="footer" target="_blank" rel="noopener noreferrer">
                                    <i className="fa fa-facebook-official" aria-hidden="true"></i>
                                    <Translate id="facebook"/>
                                </a>
                            </p>
                        </div>
                        <div className="col-sm-6 col-md-3 pb-5">
                            <h6 className="text-uppercase pb-3"><b><Translate id="language"/></b></h6>
                            {langList}
                        </div>
                    </div>
                </div>
            </footer>
        )
    }
}

export default withLocalize(FooterBar);
