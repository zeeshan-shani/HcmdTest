import React from 'react'
import "./skeleton.css";

export const DashboardListLoader = () => {
    const arr = [...new Array(1)].map((a, b) => b)
    return (<>
        {arr.map(item => {
            return (
                <div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 my-1" key={item}>
                    <div className="board card">
                        <div className="text-center">
                            <div className="avatar skeleton"></div>
                            <div className="contacts-info skeleton skeleton-text skeleton-text__body"></div>
                            <div className="contacts-info skeleton skeleton-text skeleton-footer"></div>
                        </div>
                    </div>
                </div>
            );
        })}
    </>)
}

export const ChatListLoader = ({ refsec = null, show = true }) => {
    const arr = [...new Array(5)].map((a, b) => b)
    if (!show) return null;
    return (
        <div className='d-flex flex-column'>
            {/* <ul className="contacts-list" ref={refsec}> */}
            {arr.map(item => {
                return (
                    <li className="contacts-item" key={item}>
                        <div className="contacts-link">
                            <div className="avatar skeleton"></div>
                            <div className="contacts-content">
                                <div className="contacts-info skeleton skeleton-text skeleton-text__body"></div>
                                <div className="contacts-info skeleton skeleton-text skeleton-footer"></div>
                            </div>
                        </div>
                    </li>
                )
            })}
            {/* </ul> */}
        </div>
    )
}