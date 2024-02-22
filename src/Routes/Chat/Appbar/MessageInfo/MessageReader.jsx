import React from 'react'
import moment from 'moment-timezone';
import { getImageURL } from 'redux/common';

export const MessageReader = ({ item }) => {
    const dateTime = moment(item?.updatedAt).format("MMMM DD, hh:mm A");
    return (
        <li className="list-group-item text-color">
            <div className="media align-items-center">
                <div className="avatar mr-2">
                    <img src={getImageURL(item.user?.profilePicture, '50x50')} alt="" />
                </div>
                <div className="media-body">
                    <h6 className="text-truncate">
                        <div className="text-reset text-capitalize">{item?.user?.name}</div>
                    </h6>
                    <p className="text-muted mb-0">{dateTime}</p>
                </div>
            </div>
        </li>
    )
}
