import React, { Component } from 'react';
import { Progress } from 'reactstrap';

export default class LoadingBar extends Component {

    render() {
        return (
            <div>
                <Progress multi className="loadingbar">
                    <Progress bar className="loadingbar-roller"/>
                </Progress>
            </div>
        )
    }
}
