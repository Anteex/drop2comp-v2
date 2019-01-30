import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
import LoadingBar from './LoadingBar'
import { withLocalize } from "react-localize-redux";


class Overview extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: null
        }
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
                    <div className="col-md-9">
                        <ReactMarkdown className="overview" source={this.state.text} />
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

export default withLocalize(Overview);
