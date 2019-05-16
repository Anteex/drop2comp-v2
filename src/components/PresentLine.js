import React from 'react'
import Plx from "react-plx"

const parallaxImage = [
  {
    start: "self",
    end: "self",
    endOffset: "70vh",
    easing: "easeOut",
    properties: [
        {
            startValue: 0,
            endValue: 1,
            property: "opacity",
            unit: ""
        },
        {
            startValue: 1,
            endValue: 0,
            property: "grayscale",
            unit: ""
        },
        {
            startValue: -5,
            endValue: 0,
            property: "translateX",
            unit: "vw"
        }
      ]
  }
];

const parallaxText = [
  {
    start: "self",
    end: "self",
    endOffset: "70vh",
    easing: "easeOut",
    properties: [
        {
            startValue: 0,
            endValue: 1,
            property: "opacity",
            unit: ""
        },
        {
            startValue: 10,
            endValue: 0,
            property: "translateX",
            unit: "vw"
        }
      ]
  }
];

export const PresentLine : React.StatelessComponent<{}> = props  => {
    return (
        <div className="row justify-content-center align-items-center py-3 py-lg-5">
            <div className="col-md-3 col-sm-4 col-6">
                <Plx parallaxData={parallaxImage}>
                    <img src={props.src} className="w-100 m-2" alt={props.alt}/>
                </Plx>
            </div>
            <div className="col-xl-6 col-md-8 col-sm-8 col-12">
                <Plx parallaxData={parallaxText}>
                    <p className="h1 text-center text-sm-left pl-2 pl-sm-5 pr-2 pt-3 pt-sm-0">
                        {props.children}
                    </p>
                </Plx>
            </div>
        </div>
    )
}
