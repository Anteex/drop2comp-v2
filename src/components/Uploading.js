import React, { Component } from 'react'
import { Progress } from 'reactstrap'
import { withLocalize } from "react-localize-redux";
import textUploading from "../translations/Uploading.json";
import UploadingError from "./UploadingError";


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
      this.props.handleDelete(this.props.itemIndex)
      setTimeout(this.deleteItem, 500)
    }

    render() {
        const progress = ( !this.props.queryItem.waiting
            ? <Progress animated value={this.props.queryItem.rate}>{this.props.queryItem.rate}%</Progress>
            : ""
        );
        const close = ( this.props.queryItem.waiting
            ? (
                    <button className="close text-primary" onClick={this.handleClose}>
                        <i className="fa fa-times"></i>
                    </button>
              )
            : ""
        );
        const columns = ( this.props.queryItem.waiting
            ? "col-md-6"
            : ""
        );
        const fade = ( this.state.show
            ? "fadeIn"
            : "fadeOut"
        );
        const text = ( this.state.show
            ? this.props.queryItem.file.name
            : this.props.translate("skipped")
        );
        const uploadingError = ( !!this.props.queryItem.skip
            ? (
                <UploadingError error={this.props.queryItem.skip} itemIndex={this.props.itemIndex} />
            )
            : null
        );
        return (
            <div className={"py-1 col-12 " + columns + " "  + fade }>
                {close}
                <div className="text-truncate">
                    <small>
                        {text}
                        {uploadingError}
                    </small>
                </div>
                {progress}
            </div>
        )
    }
}

export default withLocalize(Uploading);
