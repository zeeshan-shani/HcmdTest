import React, { useState, useEffect, lazy, useCallback } from 'react'
import moment from 'moment-timezone';
import ReactImageVideoLightbox from "react-image-video-lightbox";
import { CONST } from 'utils/constants';
import { Button } from 'react-bootstrap';
import { dispatch } from 'redux/store';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { DeleteIssuesAttachment, ReqUpdateIssue } from 'redux/actions/IssuesAction';
import { format_all, LazyComponent, sanitizeHTMLText } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';

import { TakeConfirmation } from 'Components/components';
import { RequestSolution } from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/MyRequests/RequestDetail/RequestSolution';
import { RequestComments } from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/MyRequests/RequestDetail/Comments/RequestComments';
import { IssueAttachments } from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/MyRequests/RequestDetail/IssueAttachments';
import classes from "Routes/KnowledgeBase/Issues.module.css";
import knowledgebaseService from 'services/APIs/services/knowledgebaseService';
import { UsersDropdown } from 'Routes/SuperAdmin/UsersDropdown';
const MyCkEditor = lazy(() => import('Routes/KnowledgeBase/MyCkEditor'));

export const RequestDetails = () => {
    const { issueDetails: requestData } = useSelector((state) => state.issues);

    const navigate = useNavigate();
    const [isImageShow, setImageShow] = useState(false);
    const { imageId } = useSelector((state) => state.chat);
    const [editMode, setEditMode] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editValue, setEditValue] = useState();
    const [assignMembers, setAssignMem] = useState([]);
    const subCategory = !requestData?.subcategory;

    useEffect(() => {
        const data = requestData?.issuesAssignedUsers?.map(item => ({
            id: item.user.id, value: item.user.id, label: item.user.name
        }))
        setAssignMem(data);
    }, [requestData?.issuesAssignedUsers]);

    const onCloseImageHandler = useCallback(() => {
        setImageShow(false);
        dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 });
    }, [])

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
                type: ISSUE_CONST.DELETE_ISSUE_ATTACHMENT, payload: {
                    id: requestData.id,
                    attachmentId: id
                }
            })
        } catch (error) { }
    }, [requestData]);

    const OnSaveChanges = useCallback(async () => {
        let data = {
            issueId: requestData.id,
            categoryId: requestData.category,
            ...editValue
        }
        if (assignMembers && requestData?.issuesAssignedUsers) {
            const issueMembers = requestData?.issuesAssignedUsers?.map((item) => item.user.id);
            const latestMembers = assignMembers?.map((item) => item.id);
            const addedMember = latestMembers?.filter(item => !issueMembers.includes(item));
            const removedMember = issueMembers?.filter(item => !latestMembers.includes(item));
            data = { ...data, addedMember, removedMember }
        }
        ReqUpdateIssue(data);
        setEditMode(false);
        setEditValue();
    }, [assignMembers, editValue, requestData?.category, requestData?.id, requestData?.issuesAssignedUsers]);

    const onDelete = useCallback((id) => {
        TakeConfirmation({
            title: "Are you sure to delete the information?",
            onDone: async () => {
                await knowledgebaseService.deleteRequest({ payload: { id } });
                dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: null });
                navigate('/knowledge/category/' + requestData?.category);
            }
        })
    }, [requestData?.category, navigate]);

    const onChangeDesc = (val) => setEditValue(prev => ({ ...prev, description: val }));

    const startUpload = useCallback(async (files) => {
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
        ReqUpdateIssue({
            ...editValue,
            issueId: requestData.id,
            attachments: uploadedFiles,
            type: CONST.ISSUE_ATTACHMENT_TYPE[0].value
        });
        setUploading(false);
    }, [editValue, requestData?.id]);

    const onChangeHandler = useCallback(async (e) => {
        const files = e.target.files;
        startUpload(files);
    }, [startUpload]);

    const onStatusChanged = useCallback((item) => {
        ReqUpdateIssue({ status: item.value, issueId: requestData.id });
    }, [requestData?.id]);

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

    if (requestData) {
        try {
            const formatted_description = sanitizeHTMLText(requestData.description, CONST.sanitize_message);
            const format_subject = requestData?.subject && format_all(requestData.subject);
            return (<>
                <div className="issue-request-details text-color">
                    <div className="request-subject">
                        <div className={`${classes['new-issue-request']} bg-card p-2`}>
                            <div className="px-1">
                                {format_subject &&
                                    <div className='d-flex'>
                                        {editMode ?
                                            <div className="align-items-center d-flex form-group m-0 w-100 mb-2 gap-5">
                                                <label className="mb-0">Subject: </label>
                                                <input type="text" name="subject" id="subject" placeholder="Type subject details"
                                                    defaultValue={requestData?.subject}
                                                    onChange={(e) => setEditValue(prev => ({ ...prev, subject: e.target.value }))}
                                                    className={`${classes["form-control"]} form-control p-4_8`} />
                                            </div>
                                            :
                                            <h5 className='mb-1'>
                                                <span className='mr-1'>Subject:</span>
                                                <span dangerouslySetInnerHTML={{ __html: format_subject }}></span>
                                            </h5>
                                        }
                                    </div>}
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <span className='mr-2 fs-13 d-inline-flex flex-nowrap'>
                                            Created
                                            <span className='light-text-70 ml-1'>{moment(requestData.createdAt).fromNow()}</span>
                                        </span>
                                        {subCategory && <>
                                            <span className='mr-2 fs-13 d-inline-flex flex-nowrap'>
                                                Last Activity
                                                <span className='light-text-70 ml-1'>{moment(requestData.updatedAt).fromNow()}</span>
                                            </span>
                                            <span className='mr-2 fs-13 d-inline-flex flex-nowrap'>
                                                Status:
                                                <span className='light-text-70 ml-1 text-capitalize'>{requestData.status}</span>
                                            </span>
                                        </>}
                                    </div>
                                    <div className='mx-1'>
                                        {requestData.status !== CONST.ISSUE_STATUS[1].value ?
                                            (!editMode ?
                                                <div className='d-flex gap-10'>
                                                    <Button className="btn btn-sm btn-info" onClick={() => setEditMode(true)}>
                                                        Edit
                                                    </Button>
                                                    <Button className="btn btn-sm btn-danger" onClick={() => onDelete(requestData.id)}>
                                                        Delete
                                                    </Button>
                                                </div> :
                                                <div className='d-flex gap-10'>
                                                    <Button className="btn btn-sm btn-primary" onClick={OnSaveChanges}>
                                                        Save
                                                    </Button>
                                                    <Button className="btn btn-sm btn-secondary" onClick={() => setEditMode(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>) :
                                            subCategory &&
                                            <button className="btn btn-sm btn-info" onClick={() => onStatusChanged({ value: 'reopen' })}>
                                                Reopen
                                            </button>
                                        }
                                    </div>
                                </div>
                                {subCategory &&
                                    <div className="d-flex">
                                        {!editMode ?
                                            <p className='mb-1'>
                                                <span className='mr-1'>
                                                    Assigned to:
                                                </span>
                                                <span>
                                                    {requestData?.issuesAssignedUsers?.map(user =>
                                                        <span className='mr-1 desg-tag' key={user.id}>
                                                            {user.user.name}
                                                        </span>)}
                                                </span>
                                            </p>
                                            :
                                            <div className='d-flex justify-content-center align-items-center gap-10'>
                                                <label className='mb-0'>Assigned to:</label>
                                                <UsersDropdown
                                                    userData={assignMembers}
                                                    setUserData={setAssignMem}
                                                    classes={''}
                                                    isMulti
                                                    placeholder="Assign User..."
                                                />
                                            </div>
                                        }
                                    </div>}
                            </div>
                            <hr className='issue-break-line my-1' />
                            <div className='mt-1 px-1'>
                                <p className='my-1 font-weight-semibold'>Description:</p>
                                {editMode ?
                                    <LazyComponent>
                                        <MyCkEditor
                                            name={"description"}
                                            value={requestData?.description}
                                            onChange={onChangeDesc}
                                            placeHolder={"Enter description of the request"} />
                                    </LazyComponent>
                                    :
                                    <>{requestData.description ?
                                        <div className='mx-2' dangerouslySetInnerHTML={{ __html: formatted_description }} />
                                        :
                                        <p className='light-text-70'>No description added</p>
                                    }</>}
                            </div>
                            {requestData.issuesAttachments && <>
                                <hr className='issue-break-line mb-1' />
                                <IssueAttachments
                                    editMode={true}
                                    onChangeHandler={onChangeHandler}
                                    attchmentDeleteHandler={attchmentDeleteHandler}
                                    setImageShow={setImageShow}
                                    type={CONST.ISSUE_ATTACHMENT_TYPE[0].value}
                                    requestData={requestData} />
                            </>}
                            {uploading && <div className='d-flex'>
                                <p className="mr-1">
                                    {'Uploading file...'}
                                </p>
                            </div>}
                        </div>
                        {subCategory &&
                            <RequestSolution requestData={requestData} />}
                        <RequestComments requestData={requestData} />
                    </div>
                </div>
            </>);
        } catch (error) {
            console.error(error);
        }
    }
}

