import React, { useCallback, useState } from 'react'
import moment from 'moment-timezone';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { getDateLabel, getImageURL } from 'redux/common';
import { SOCKET } from 'utils/constants';
import { useSelector } from 'react-redux';

export const IssueCommentDetails = ({ comment }) => {
    const { user } = useSelector(state => state.user);
    const [isEdit, setEdit] = useState(false);
    const [editedText, setEditText] = useState();

    const onEdit = useCallback(() => {
        setEdit(true);
        setEditText(comment?.text);
    }, [comment?.text]);

    const onDelete = useCallback(() => {
        SocketEmiter(SOCKET.REQUEST.ISSUE_DELETE_COMMENT, { commentId: comment.id, });
    }, [comment.id]);

    const onSave = useCallback(() => {
        setEdit(false);
        SocketEmiter("issues:req-update-comment", { id: comment.id, text: editedText });
    }, [comment.id, editedText]);

    const onCancel = () => setEdit(false);

    return (<>
        <div className={`${classes["comment-media"]} card m-1 d-flex flex-row border-0 transparent-bg p-1`} key={comment.id}>
            <div className={`${classes.member} mr-2 d-flex align-items-center`}>
                <img src={getImageURL(comment.user?.profilePicture, '50x50')} alt="people" />
            </div>
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex">
                        <h6 className="text-capitalize mb-0 mr-2">
                            {comment?.user?.name}
                        </h6>
                        <small>
                            {`${getDateLabel(comment?.createdAt)} at ${(moment(comment?.createdAt).format("hh:mm A"))}`}
                        </small>
                    </div>
                    {!isEdit && comment.user.id === user.id &&
                        <div className="dropdown">
                            <button className="btn nav-link text-muted p-0" id="dropdownCmt" data-bs-toggle="dropdown">
                                <svg className="hw-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                            <ul className="dropdown-menu m-0 py-1" aria-labelledby="dropdownCmt">
                                <li className="dropdown-item p-4_8" onClick={onEdit}>Edit</li>
                                <li className="dropdown-item p-4_8" onClick={onDelete}>Delete</li>
                            </ul>
                        </div>}
                </div>
                {isEdit ? <>
                    <form onSubmit={onSave}>
                        <input type="text"
                            defaultValue={comment?.text}
                            autoFocus
                            className={`form-control bg-grey p-4_8`}
                            onChange={(e) => setEditText(e.target.value)}
                        />
                        <button className="btn btn-primary btn-sm mr-1 mt-1" type="submit" disabled={editedText === comment?.text}>
                            Save
                        </button>
                        <button className="btn btn-secondary btn-sm mt-1" type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    </form>
                </> :
                    <div className="">
                        <p className="mb-0">
                            <span>{comment?.text}</span>
                            {comment?.isEdited && <span><small>{` (edited)`}</small></span>}
                        </p>
                    </div>}
            </div>
        </div>
    </>)
}
