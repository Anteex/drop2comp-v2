import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
import LoadingBar from './LoadingBar'
import { withLocalize } from "react-localize-redux";
import textOverview from "../translations/Overview.json";
import { Helmet } from "react-helmet";
import VideoAbout from "./VideoAbout";

class Overview extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: null,
            title: ''
        };
        this.props.addTranslation(textOverview);
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
        const overviewText = require("../content/overview_" + this.props.activeLanguage.code + ".md");
        this.getContent(overviewText)
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeLanguage !== this.props.activeLanguage) {
          const overviewText = require("../content/overview_" + nextProps.activeLanguage.code + ".md");
          this.getContent(overviewText)
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
                <React.Fragment>
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-auto px-md-5 pt-5">
                            <VideoAbout />
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-md-9">
                            <ReactMarkdown className="overview px-3" source={this.state.text} />
                        </div>
                    </div>
                </React.Fragment>
            )
        }
        return (
            <div className="container-fluid">
                <Helmet>
                    <title>{this.state.title}</title>
                </Helmet>
                {content}
            </div>
        )
    }
}

export default withLocalize(Overview);
