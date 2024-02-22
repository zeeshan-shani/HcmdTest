import React, { useCallback, useState } from 'react'
import ReactImageVideoLightbox from "react-image-video-lightbox";
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { DeleteIssuesAttachment } from 'redux/actions/IssuesAction';
import { CONST } from 'utils/constants';
import { dispatch } from 'redux/store';
import { sanitizeHTMLText } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import { IssueAttachments } from './IssueAttachments';
import classes from "Routes/KnowledgeBase/Issues.module.css";

export const RequestSolution = ({ requestData }) => {
    const { imageId } = useSelector((state) => state.chat);
    const solution = requestData.solution ? requestData.solution.solution : null;
    const [isImageShow, setImageShow] = useState(false);

    const onCloseImageHandler = useCallback(() => {
        setImageShow(false);
        dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 });
    }, []);

    const attchmentDeleteHandler = useCallback(async (id) => {
        try {
            await DeleteIssuesAttachment({ attachmentId: id });
            dispatch({
                type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: {
                    ...requestData,
                    issuesAttachments: requestData.issuesAttachments.filter((att) => att.id !== id),
                }
            });
            dispatch({ type: ISSUE_CONST.DELETE_ISSUE_ATTACHMENT, payload: { id: requestData.id, attachmentId: id } })
        } catch (error) { }
    }, [requestData]);

    if (isImageShow)
        return (<div className="modal modal-lg-fullscreen fade show d-block task-image-gallery" id="imageGallery" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true">
            <ReactImageVideoLightbox
                data={requestData.issuesAttachments
                    .filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
                    .map((item) => {
                        const itemType = item.mediaType.split("/").shift();
                        if (itemType === "video")
                            return { ...item, url: item.mediaUrl, type: "video", title: 'video title' }
                        return { ...item, url: item.mediaUrl, type: "photo", altTag: 'Alt Photo' }
                    })}
                startIndex={requestData.issuesAttachments
                    .filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
                    .findIndex((item) => item.id === imageId)}
                showResourceCount={true}
                onCloseCallback={onCloseImageHandler}
            />
        </div>);

    const solution_format = sanitizeHTMLText(solution, CONST.sanitize_message)
    return (
        <div className={`${classes['new-issue-request']} bg-card p-2 mt-2`}>
            <div className=''>
                <h6 className='mb-1'>
                    <span className='mr-1'>Solution:</span>
                </h6>
                <div>
                    <span className='light-text-70'>
                        {solution ? <>
                            <div dangerouslySetInnerHTML={{ __html: solution_format }}>
                            </div>
                            <p className='light-text-70 mb-1'>
                                Last Edited by <span>{requestData?.solution?.lastEditedby?.name}</span>
                            </p>
                        </> : 'No Solution available'
                        }
                    </span>
                </div>
                {requestData.issuesAttachments && !!requestData.issuesAttachments.length && <>
                    <hr className='issue-break-line mb-1' />
                    <IssueAttachments
                        attchmentDeleteHandler={attchmentDeleteHandler}
                        setImageShow={setImageShow}
                        type={CONST.ISSUE_ATTACHMENT_TYPE[1].value}
                        requestData={requestData} />
                </>}
            </div>
        </div>
    )
}
