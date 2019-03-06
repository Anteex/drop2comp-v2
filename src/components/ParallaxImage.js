import React, { Component } from 'react';
import LazyHero from 'react-lazy-hero';

export default class ParallaxImage extends Component {

    render() {
        return (
            <div className={this.props.className}>
                <LazyHero
                    imageSrc={this.props.src}
                    parallaxOffset={0}
                    color="#eee"
                    isFixed={true}
                    minHeight="50vh"
                >
                    {this.props.children}
                </LazyHero>
            </div>
        )
    }
}

