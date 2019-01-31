import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import LoadingBar from './LoadingBar'
import { withLocalize } from "react-localize-redux";
import textPrivatePolicy from "../translations/PrivatePolicy.json";
import { Helmet } from "react-helmet";


class PrivatePolicy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: null,
            title: ''
        }
        this.props.addTranslation(textPrivatePolicy);
    }

    getContent(src) {
      fetch(src)
          .then((response) => response.text(src))
          .then((text) => {
              this.setState({ text })
          })
    }

    componentDidMount() {
      if (!!this.props.activeLanguage) {
        const ppolicyText = require("../content/privatepolicy_" + this.props.activeLanguage.code + ".md");
        this.getContent(ppolicyText)
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeLanguage !== this.props.activeLanguage) {
            const ppolicyText = require("../content/privatepolicy_" + nextProps.activeLanguage.code + ".md");
            this.getContent(ppolicyText)
        }
        if (nextProps.activeLanguage !== this.props.activeLanguage || this.state.title === "") {
            this.setState({
                title: nextProps.translate("title")
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
                <Helmet>
                    <title>{this.state.title}</title>
                </Helmet>
                {content}
            </div>
        )
    }
}

export default withLocalize(PrivatePolicy);
