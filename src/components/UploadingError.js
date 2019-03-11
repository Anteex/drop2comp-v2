import React from 'react';
import { Popover, PopoverBody } from 'reactstrap';
import { ERROR_ACCOUNT_FILESIZE_LIMIT, ERROR_MAX_FILE_PER_DAY, ERROR_MAX_REMOTE_SIZE, ERROR_REMOTE_UPLOAD, ERROR_FATAL } from '../helpers/const'
import { withLocalize } from "react-localize-redux";


class UploadingError extends React.Component {

    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            popoverOpen: false
        };
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }



    render() {
        let text = '';
        switch (this.props.error) {
            case ERROR_ACCOUNT_FILESIZE_LIMIT:
                text = this.props.translate("error_account_filesize_limit");
                break;
            case ERROR_MAX_FILE_PER_DAY:
                text = this.props.translate("error_max_file_per_day");
                break;
            case ERROR_MAX_REMOTE_SIZE:
                text = this.props.translate("error_max_remote_size");
                break;
            case ERROR_REMOTE_UPLOAD:
                text = this.props.translate("error_remote_upload");
                break;
            case ERROR_FATAL:
                text = this.props.translate("error_fatal");
                break;
            default:
                text = this.props.translate("error_remote_upload");
        }
        return (
            <React.Fragment>
                <i className="fa fa-exclamation-triangle px-2 pointer text-danger" id={'Popover-' + this.props.itemIndex}></i>
                <Popover placement="top" trigger="click hover focus" isOpen={this.state.popoverOpen} target={'Popover-' + this.props.itemIndex} toggle={this.toggle}>
                    <PopoverBody>{text}</PopoverBody>
                </Popover>
            </React.Fragment>
        );
    }
}

export default withLocalize(UploadingError);
