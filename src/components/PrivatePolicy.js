import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import LoadingBar from './LoadingBar'
import { withLocalize } from "react-localize-redux";


class PrivatePolicy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeLanguage !== this.props.activeLanguage) {
            const overviewText = require("../content/privatepolicy_" + nextProps.activeLanguage.code + ".md");
            fetch(overviewText)
                .then((response) => response.text())
                .then((text) => {
                    this.setState({text})
                })
        }
        return true
    }

    render() {
        let content;
        if (this.state.text === null) {
            content = (
                <LoadingBar />
            )
        } else {
            content = (
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <ReactMarkdown className="privatepolicy" source={this.state.text} />
                    </div>
                </div>
            )
        }
        return (
            <div>
                {content}
            </div>
        )
    }
}

export default withLocalize(PrivatePolicy);