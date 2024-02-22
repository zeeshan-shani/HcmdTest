import React from 'react'
import { getImageURL } from 'redux/common';

export const UnreadUsers = (props) => {
    return (<li className="list-group-item py-0">
        <div className="media align-items-center">
            <div className="avatar min-avatar mr-1">
                <img src={getImageURL(props.item?.profilePicture, '50x50')} alt="" />
            </div>
            <div className="media-body">
                <h6 className="text-truncate">
                    <div className="text-reset text-capitalize">{props.item.name}</div>
                </h6>
            </div>
        </div>
    </li>);
}
