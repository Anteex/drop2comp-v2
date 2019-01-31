import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import textPage404 from "../translations/Page404.json";
import { Helmet } from "react-helmet";


class Page404 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: ''
        };
        this.props.addTranslation(textPage404);
        this.handleClick = this.handleClick.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeLanguage !== this.props.activeLanguage || this.state.title === "") {
            this.setState({
                title: nextProps.translate("title")
            })
        }
        return true
    }

    handleClick() {
        this.props.history.push("/")
    }

    render() {
        return (
            <div className="row justify-content-center">
                <Helmet>
                    <title>{this.state.title}</title>
                </Helmet>
                <div className="col-10 pt-5 text-center">
                    <h1 className="display-1 pb-5"><Translate id="notfound" /></h1>
                    <h2><Translate id="message"/></h2>
                    <p>
                        <span className="display-4 clickable" onClick={this.handleClick}><Translate id="findout"/></span>
                    </p>
                </div>
            </div>
        )
    }
}

export default withLocalize(withRouter(Page404));