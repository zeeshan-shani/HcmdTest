import React, { useState, useCallback } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { DeleteIssuesAttachment, ReqUpdateIssue } from 'redux/actions/IssuesAction';
import { format_all, sanitizeHTMLText } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import { dispatch } from 'redux/store';
import { CONST } from 'utils/constants';
import ReactImageVideoLightbox from "react-image-video-lightbox";
import moment from 'moment-timezone';

import classes from "Routes/KnowledgeBase/Issues.module.css";
import { RequestComments } from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/MyRequests/RequestDetail/Comments/RequestComments';
import { AssignedSolution } from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/AssignedRequest/AssignedRequestDetail/AssignedSolution';
import { IssueAttachments } from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/MyRequests/RequestDetail/IssueAttachments';

export const AssignedRequestDetail = () => {
    const { assignIssueDetails: requestData } = useSelector((state) => state.issues);
    const [isImageShow, setImageShow] = useState(false);
    const { imageId } = useSelector((state) => state.chat);

    const onCloseImageHandler = useCallback(() => {
        setImageShow(false);
        dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 });
    }, []);

    const onStatusChanged = useCallback((item) => {
        ReqUpdateIssue({ status: item.value, issueId: requestData.id });
        dispatch({
            type: ISSUE_CONST.RES_GET_ASSIGNED_REQUEST_DETAILS,
            payload: { ...requestData, status: item.value }
        });
    }, [requestData]);

    const attchmentDeleteHandler = useCallback(async (id) => {
        try {
            await DeleteIssuesAttachment({ attachmentId: id });
            dispatch({
                type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: {
                    ...requestData,
                    issuesAttachments: requestData.issuesAttachments.filter((att) => att.id !== id),
                }
            });
            dispatch({
                type: ISSUE_CONST.DELETE_ISSUE_ATTACHMENT,
                payload: { id: requestData.id, attachmentId: id }
            })
        } catch (error) { }
    }, [requestData]);

    if (isImageShow)
        return (
            <ReactImageVideoLightbox
                data={requestData.issuesAttachments
                    .filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
                    .map((item) => {
                        const itemType = item.mediaType.split("/").shift();
                        if (itemType === "video")
                            return {
                                ...item,
                                url: item.mediaUrl,
                                type: "video",
                                title: 'video title'
                            }
                        return {
                            ...item,
                            url: item.mediaUrl,
                            type: "photo",
                            altTag: 'Alt Photo'
                        }
                    })}
                startIndex={requestData.issuesAttachments
                    .filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
                    .findIndex((item) => item.id === imageId)}
                showResourceCount={true}
                onCloseCallback={onCloseImageHandler}
            />)
    if (requestData) {
        try {
            const format_subject = format_all(requestData.subject);
            const format_desc = requestData?.description && sanitizeHTMLText(requestData.description, CONST.sanitize_message);
            return (<>
                <div className="issue-request-details text-color">
                    <div className="request-subject">
                        <div className={`${classes['new-issue-request']} bg-card p-2`}>
                            <div className='d-flex'>
                                <h5 className='mb-1'>
                                    <span className='mr-1'>Subject:</span>
                                    <span className='fs-16'>{format_subject}</span>
                                </h5>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <span className='mr-2 fs-13'>
                                        Created By
                                        <span className='light-text-70 ml-1'>{requestData?.user?.name}</span>
                                    </span>
                                    <span className='mx-2 fs-13'>
                                        Created
                                        <span className='light-text-70 ml-1'>{moment(requestData.createdAt).fromNow()}</span>
                                    </span>
                                    <span className='mx-2 fs-13'>
                                        Last Activity
                                        <span className='light-text-70 ml-1'>{moment(requestData.updatedAt).fromNow()}</span>
                                    </span>
                                </div>
                                <div className='mx-1'>
                                    <div className="dropdown">
                                        <button className={`btn btn-info dropdown-toggle text-capitalize task-status-btn`} id="labels" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Status: {requestData?.status}
                                        </button>
                                        <ul className={`dropdown-menu dropdown-menu-right text-light m-0`} aria-labelledby={`labels`}>
                                            {CONST.ISSUE_STATUS.map((item) => {
                                                const status = requestData?.status;
                                                if ((status !== CONST.ISSUE_STATUS[0].value && item.value === CONST.ISSUE_STATUS[0].value) ||
                                                    (status === CONST.ISSUE_STATUS[0].value && item.value === CONST.ISSUE_STATUS[2].value) ||
                                                    (status === CONST.ISSUE_STATUS[1].value && item.value === CONST.ISSUE_STATUS[1].value) ||
                                                    (item.value === status))
                                                    return null;
                                                return (<li key={item.id} className={`dropdown-item cursor-pointer text-capitalize`} onClick={() => onStatusChanged(item)}>
                                                    {item.value}
                                                </li>)
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <hr className='issue-break-line my-1' />
                            <div className='mt-1'>
                                <p className='my-1 font-weight-semibold'>Description:</p>
                                {format_desc ?
                                    <div
                                        className='mx-2'
                                        dangerouslySetInnerHTML={{ __html: format_desc }}
                                    /> :
                                    <p className='light-text-70'>No description added</p>
                                }
                            </div>
                            {requestData.issuesAttachments && !!requestData.issuesAttachments.length && <>
                                <hr className='issue-break-line mb-1' />
                                <IssueAttachments
                                    attchmentDeleteHandler={attchmentDeleteHandler}
                                    setImageShow={setImageShow}
                                    type={CONST.ISSUE_ATTACHMENT_TYPE[0].value}
                                    requestData={requestData} />
                            </>}
                        </div>
                        <AssignedSolution requestData={requestData} />
                        <RequestComments requestData={requestData} />
                    </div>
                </div>
            </>);
        } catch (error) {
            console.error(error);
        }
    }
}
