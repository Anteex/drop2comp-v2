import React, { Component } from 'react'
import { Progress } from 'reactstrap'
import { withLocalize } from "react-localize-redux";
import textUploading from "../translations/Uploading.json";


class Uploading extends Component {

    constructor(props) {
        super(props);
        this.state = {
          show: true
        }

        this.props.addTranslation(textUploading);

        this.handleClose = this.handleClose.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    deleteItem() {
      this.props.handleClose(this.props.itemIndex)
    }

    handleClose() {
      this.setState({
        show: false
      })
      this.props.handleSkip(this.props.itemIndex)
      setTimeout(this.deleteItem, 500)
    }

    render() {
        const progress = ( !this.props.queryItem.waiting
            ? <Progress animated value={this.props.queryItem.rate}>{this.props.queryItem.rate}%</Progress>
            : ""
        );
        const close = ( this.props.queryItem.waiting
            ? (
                    <button className="close text-danger" onClick={this.handleClose}>
                        <i className="fa fa-times"></i>
                    </button>
              )
            : ""
        )
        const columns = ( this.props.queryItem.waiting
            ? "col-md-6"
            : ""
        )
        const fade = ( this.state.show
            ? "fadeIn"
            : "fadeOut"
        )
        const text = ( this.state.show
            ? this.props.queryItem.file.name
            : this.props.translate("skipped")
        )
        const bg = ( this.props.queryItem.skip
            ? "bg-warning"
            : ""
        )
        return (
            <div className={"py-1 col-12 " + columns + " "  + fade + " " + bg}>
                {close}
                <div className="text-truncate">
                    <small>
                        {text}
                    </small>
                </div>
                {progress}
            </div>
        )
    }
}

export default withLocalize(Uploading);
