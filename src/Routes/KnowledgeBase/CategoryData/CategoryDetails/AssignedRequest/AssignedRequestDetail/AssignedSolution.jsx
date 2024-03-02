import React, { lazy, useState } from 'react'
import classes from "Routes/KnowledgeBase/Issues.module.css";
import ReactImageVideoLightbox from "react-image-video-lightbox";
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { DeleteIssuesAttachment, ReqUpdateIssue } from 'redux/actions/IssuesAction';
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { CONST, SOCKET } from 'utils/constants';
import { IssueAttachments } from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/MyRequests/RequestDetail/IssueAttachments';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import { dispatch } from 'redux/store';
import { LazyComponent, sanitizeHTMLText } from 'redux/common';
const MyCkEditor = lazy(() => import('Routes/KnowledgeBase/MyCkEditor'));

export const AssignedSolution = ({ requestData }) => {
    const [addSolution, setSolution] = useState(false);
    const [solutionValue, setSolutionValue] = useState(requestData.solution ? requestData.solution.solution : '');
    const onChangeSolution = (val) => setSolutionValue(val);
    const { imageId } = useSelector((state) => state.chat);
    const [isImageShow, setImageShow] = useState(false);
    const [uploading, setUploading] = useState(false);

    const submitNewSolution = () => {
        if (requestData.solution) {
            SocketEmiter(SOCKET.REQUEST.ISSUE_UPDATE_SOLUTION, {
                issueId: requestData.id,
                solution: solutionValue
            })
        }
        else {
            SocketEmiter(SOCKET.REQUEST.ISSUE_ADD_SOLUTION, {
                issueId: requestData.id,
                solution: solutionValue
            })
        }
        setSolution(false);
    };

    const onChangeHandler = async (e) => {
        const files = e.target.files;
        startUpload(files);
    }
    const attchmentDeleteHandler = async (id) => {
        try {
            await DeleteIssuesAttachment({ attachmentId: id });
            dispatch({
                type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: {
                    ...requestData,
                    issuesAttachments: requestData.issuesAttachments.filter((att) => att.id !== id),
                }
            });
            dispatch({
                type: ISSUE_CONST.DELETE_ISSUE_ATTACHMENT, payload: {
                    id: requestData.id,
                    attachmentId: id
                }
            })
        } catch (error) { }
    };

    const startUpload = async (files) => {
        setUploading(true);
        let uploadedFiles = [];
        for (const file of files) {
            const presignedUrl = await onUploadImage(file);
            const FileUrl = await uploadToS3(presignedUrl, file);
            uploadedFiles.push({
                mediaUrl: FileUrl,
                mediaType: `${file.type.split("/").shift()}/${file.name?.split(".").pop()}`,
                fileName: file.name,
            });
        };
        // setAttachments([]);
        ReqUpdateIssue({
            issueId: requestData.id,
            attachments: uploadedFiles,
            type: CONST.ISSUE_ATTACHMENT_TYPE[1].value
        });
        setUploading(false);
    }

    const onAdd = () => {
        setSolution(!addSolution)
    }
    const onEdit = () => {
        setSolution(!addSolution)
    }
    const onCloseImageHandler = () => {
        setImageShow(false);
        dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 });
    }

    if (isImageShow)
        return (<div className="modal modal-lg-fullscreen fade show d-block task-image-gallery" id="imageGallery" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true">
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
            />
        </div>)

    return (
        <div className={`${classes['new-issue-request']} bg-card p-2 my-2`}>
            <div className='accordion'>
                <div className={`accordion-item transparent-bg`}>
                    <div className="d-flex justify-content-between">
                        <div
                            className="accordion-button collapsed cursor-pointer d-flex"
                            data-bs-toggle="collapse"
                            data-bs-target={`#panelsStayOpen-collapse-solution`}
                            aria-expanded="false"
                            aria-controls={`panelsStayOpen-collapse-solution`}
                        >
                            <h5 className='mb-1'>
                                <span className='mr-1'>Solution</span>
                            </h5>
                        </div>
                        {<div className={`btn fs-14 ${classes["add-task-block"]} ${classes["semi-bold-text"]} p-0 mr-2`}>
                            {!addSolution && <>
                                {requestData?.solution?.solution ?
                                    <button className="btn btn-sm btn-primary" onClick={onEdit}>
                                        <span>Edit</span>
                                    </button>
                                    : <button className="btn btn-sm btn-primary" onClick={onAdd}>
                                        <span>Add Solution</span>
                                    </button>}
                            </>}
                        </div>}
                    </div>
                    <div id={`panelsStayOpen-collapse-solution`} className={`accordion-collapse collapse show`} aria-labelledby={`card-comment`}>
                        {/* Comments Starts from here */}
                        <div className="accordion-body">
                            {!addSolution && <>
                                {solutionValue ?
                                    <>
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHTMLText(solutionValue) }}>
                                        </div>
                                        <p className='light-text-70 mb-1'>
                                            Last Edited by
                                            <span className='font-weight-semibold mx-1'>{requestData?.solution?.lastEditedby?.name}</span>
                                        </p>
                                    </> :
                                    <div className='d-flex'>
                                        <p className='light-text-70'>No solution added yet</p>
                                    </div>}
                            </>}
                            {addSolution && (
                                <div className='my-1'>
                                    <LazyComponent>
                                        <MyCkEditor
                                            name={"description"}
                                            value={requestData.solution ? requestData.solution.solution : ''}
                                            onChange={onChangeSolution}
                                            placeHolder={"Enter description of the request"} />
                                    </LazyComponent>
                                    <div className="d-flex mt-2">
                                        <button className="btn btn-primary btn-sm mr-2"
                                            onClick={submitNewSolution}
                                            disabled={solutionValue === requestData?.solution?.solution || !solutionValue}
                                        >
                                            Submit
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => setSolution(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>)}
                            {requestData.issuesAttachments && <>
                                <hr className='issue-break-line mb-1' />
                                <IssueAttachments
                                    editMode={true}
                                    onChangeHandler={onChangeHandler}
                                    attchmentDeleteHandler={attchmentDeleteHandler}
                                    setImageShow={setImageShow}
                                    type={CONST.ISSUE_ATTACHMENT_TYPE[1].value}
                                    requestData={requestData} />
                                {uploading && <div className='d-flex'>
                                    <p className="mr-1">
                                        {'Uploading file...'}
                                    </p>
                                </div>}
                            </>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
