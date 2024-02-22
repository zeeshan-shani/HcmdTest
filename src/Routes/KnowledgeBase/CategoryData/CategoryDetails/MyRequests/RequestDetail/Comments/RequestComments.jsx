import React, { useRef, useState, useCallback } from 'react'
import { SocketEmiter, SocketListener } from 'utils/wssConnection/Socket';
import classes from "Routes/KnowledgeBase/Issues.module.css";
import { IssueCommentDetails } from './IssueCommentDetails';
import { SOCKET } from 'utils/constants';
import { CardChecklist, Plus } from 'react-bootstrap-icons';
import { useMount } from 'react-use';
import { dispatch } from 'redux/store';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';

export const RequestComments = ({ requestData }) => {
    const [addCommentsFlag, setAddComments] = useState(false);
    const textArea = useRef(null);

    useMount(() => {
        SocketListener(SOCKET.RESPONSE.ISSUE_ADD_COMMENT, (data) => {
            if (data.status && data.data && data.data.issueId === requestData.id)
                dispatch({ type: ISSUE_CONST.RES_CREATE_ISSUE_COMMENT, payload: data.data });
        });
    });

    const addNewComment = useCallback(async () => {
        // add new comment
        if (textArea.current.value === "") return;
        SocketEmiter(SOCKET.REQUEST.ISSUE_ADD_COMMENT, { text: textArea.current.value.trim(), issueId: requestData.id });
        textArea.current.value = "";
        setAddComments(!addCommentsFlag);
    }, [addCommentsFlag, requestData.id]);

    const searchComments = requestData?.issueComments;
    return (
        <div className={`${classes['new-issue-request']} bg-card p-2 my-2`}>
            <div className='accordion'>
                <div className={`accordion-item transparent-bg`}>
                    <div className="d-flex justify-content-between">
                        <div
                            className="accordion-button collapsed cursor-pointer d-flex"
                            data-bs-toggle="collapse"
                            data-bs-target={`#panelsStayOpen-collapse-comment`}
                            aria-expanded="false"
                            aria-controls={`panelsStayOpen-collapse-comment`}
                        >
                            <h5 className='mb-1'>
                                <span className='mr-1'>Comments</span>
                            </h5>
                        </div>
                        {requestData && requestData.id && !addCommentsFlag &&
                            <div className={`btn fs-14 ${classes["add-task-block"]} text-color p-0 mr-2`} onClick={() => setAddComments(!addCommentsFlag)}>
                                <Plus size={14} />
                                <span>Add Comment</span>
                            </div>}
                    </div>
                    <div id={`panelsStayOpen-collapse-comment`} className={`accordion-collapse collapse show`} aria-labelledby={`card-comment`}>
                        {/* Comments Starts from here */}
                        <div className="accordion-body">
                            {searchComments &&
                                <div className="comments-wrapper task-comments-wrapper mt-1" style={{ minHeight: addCommentsFlag ? 'auto' : '150px' }}>
                                    {!!searchComments.length &&
                                        searchComments
                                            .map((comment, index) => (<IssueCommentDetails key={index} comment={comment} />))}
                                    {!searchComments.length && (<>
                                        <div className="light-text-70 text-center">
                                            <CardChecklist size={16} />
                                            <span className='ml-1'>
                                                Be the first to add comment
                                            </span>
                                        </div>
                                    </>
                                    )}
                                </div>}
                            {addCommentsFlag && (
                                <div className={`${classes["add-card-input-block"]} form-group`}>
                                    <textarea
                                        ref={textArea}
                                        autoFocus
                                        className={`${classes["add-card-input"]} form-input`}
                                        name="taskTitle"
                                        rows="2"
                                        onKeyPress={(event) => {
                                            if (event.key === "Enter") {
                                                if (!event.shiftKey) {
                                                    event.preventDefault();
                                                    addNewComment();
                                                }
                                            }
                                        }}
                                    ></textarea>
                                    <div className={`${classes.action} mt-2`}>
                                        <button className={`btn btn-primary mr-2 p-4_8`} onClick={addNewComment}>
                                            Add Comment
                                        </button>
                                        <button className={`btn btn-light border p-4_8`} onClick={() => setAddComments(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
