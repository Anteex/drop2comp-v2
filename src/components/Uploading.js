import React, { Component } from 'react'
import { Progress } from 'reactstrap'


export default class Uploading extends Component {

    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        this.props.handleClose(this.props.itemIndex)
    }

    render() {
        const progress = ( !this.props.waiting
            ? <Progress animated value={this.props.rate}>{this.props.rate}%</Progress>
            : ""
        );
        const close = ( this.props.waiting
            ? (
                    <button className="close text-danger" onClick={this.handleClose}>
                        <i className="fa fa-times"></i>
                    </button>
              )
            : ""
        )
        const columns = ( this.props.waiting
            ? "col-md-6"
            : ""
        )
        return (
            <div className={"py-1 col-12 " + columns}>
                {close}
                <div className="text-truncate">
                    <small>
                        {this.props.filename}
                    </small>
                </div>
                {progress}
            </div>
        )
    }
}