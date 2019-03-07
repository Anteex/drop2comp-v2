import React from 'react'

//noinspection JSAnnotator
export const PresentLine : React.StatelessComponent<{}> = props  => {
    return (
        <div className="row justify-content-center align-items-center py-3 py-lg-5">
            <div className="col-md-3 col-sm-4 col-6">
                <img src={props.src} className="w-100 m-2" alt={props.alt}/>
            </div>
            <div className="col-xl-6 col-md-8 col-sm-8 col-12">
                <p className="h1 text-center text-sm-left pl-2 pl-sm-5 pr-2 pt-3 pt-sm-0">
                    {props.children}
                </p>
            </div>
        </div>
    )
}
