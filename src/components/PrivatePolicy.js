import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import overviewText from "../content/privatepolicy.md"
import LoadingBar from './LoadingBar'


export default class PrivatePolicy extends Component {

    constructor(props) {
        super(props)
        this.state = {
            text: null
        }
    }

    componentWillMount() {
        fetch(overviewText)
            .then((response) => response.text())
            .then((text) => {
                this.setState({ text })
            })
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