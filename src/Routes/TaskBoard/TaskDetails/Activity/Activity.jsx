import React from 'react'
import moment from 'moment-timezone';
import { getDateLabel, getImageURL } from 'redux/common';
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";

export default function Activity({ item }) {
    return (
        <div className={`${classes["comment-media"]} d-flex flex-row border-0 my-1`}>
            <div className={`${classes.member} mx-1`}>
                <img src={getImageURL(item?.createdByTaskLog?.profilePicture, '50x50')} alt="" />
            </div>
            <div className="w-100 align-items-center mx-1">
                <p className="mb-0 align-items-center">
                    {item?.createdByTaskLog?.name && <span className='mr-1 font-weight-bold'>{item?.createdByTaskLog?.name}</span>}
                    {item?.messageLog}
                </p>
                {item.createdAt &&
                    <small className="align-items-center my-1">
                        {`${getDateLabel(item.createdAt)} ${(moment(item.createdAt).format("hh:mm A"))}`}
                    </small>}
            </div>
        </div>
    )
}
