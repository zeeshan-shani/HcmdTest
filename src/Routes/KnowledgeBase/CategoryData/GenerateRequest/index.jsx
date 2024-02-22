import React, { lazy, useCallback, useEffect, useState } from 'react'
import ReactSelect from 'react-select';
import { generatePayload, LazyComponent } from 'redux/common';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { SOCKET } from 'utils/constants';
import { dispatch } from 'redux/store';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';

import classes from 'Routes/KnowledgeBase/Issues.module.css';
import PreviewFile from 'Routes/KnowledgeBase/CategoryData/GenerateRequest/PreviewFile';
import ErrorBoundary from 'Components/ErrorBoundry';
import { UsersDropdown } from 'Routes/SuperAdmin/UsersDropdown';
import labelsubCategoryService from 'services/APIs/services/labelsubCategoryService';
const MyCkEditor = lazy(() => import('Routes/KnowledgeBase/MyCkEditor'));

export default function GenerateRequest() {
    const navigate = useNavigate();
    const { activeCard, subCategories, subCategory } = useSelector(state => state.issues);
    const [reqData, setReqData] = useState({
        subject: null,
        description: null,
        categoryId: activeCard?.id
    });
    const [attachments, setAttachments] = useState([]);
    const [isUploadingMedia, setMediaUpload] = useState(false);
    const [error, setError] = useState();
    const [assignMembers, setAssignMem] = useState([]);
    const [chapter, setChapterName] = useState();

    useEffect(() => {
        (async () => {
            if (activeCard && !subCategories?.length) {
                const payload = await generatePayload({
                    rest: { labelId: activeCard?.id },
                    options: { attributes: ["id", "name", "labelId"] },
                });
                const data = await labelsubCategoryService.list({ payload });
                dispatch({ type: ISSUE_CONST.SET_CARD_SUBCATEGORIES, payload: data.data || [] });
            }
        })();
    }, [subCategories, activeCard]);

    const chapterChange = (data) => setChapterName(data);
    const onChangeDesc = (data) => setReqData((prev) => ({ ...prev, description: data }))

    const onChangeHandler = useCallback(async (e) => {
        const files = e.target.files;
        let selectedFiles = [];
        let index = 1;
        for (const file of files) {
            selectedFiles.push({ file, id: index + file.lastModified });
            index++;
        };
        if (!!selectedFiles.length) {
            if (!!attachments.length) setAttachments((prev) => ([...prev, ...selectedFiles]));
            else setAttachments(selectedFiles);
        }
    }, [attachments.length]);

    const OnClose = useCallback((item) => setAttachments((prev) => [...prev.filter(file => file.id !== item.id)]), []);

    const startUpload = useCallback(async () => {
        let uploadedFiles = [];
        for (const item of attachments) {
            const file = item.file;
            const presignedUrl = await onUploadImage(file);
            const FileUrl = await uploadToS3(presignedUrl, file);
            uploadedFiles.push({
                mediaUrl: FileUrl,
                mediaType: `${file.type.split("/").shift()}/${file.name?.split(".").pop()}`,
                fileName: file.name,
            });
        };
        return uploadedFiles;
    }, [attachments]);

    const OnSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!reqData.subject) {
            setError("Please enter subject of request!");
            return;
        }
        if (subCategory) reqData.subcategoryId = subCategory?.id
        if (chapter) reqData.subcategoryIdForIssue = chapter?.id
        if (!subCategory && assignMembers && !!assignMembers.length) reqData.assignedUsers = assignMembers.map((user) => user.id)
        if (!!attachments.length) {
            setMediaUpload(true);
            const uploadedFiles = await startUpload();
            reqData.attachments = uploadedFiles
            setMediaUpload(false);
        }
        SocketEmiter(SOCKET.REQUEST.CREATE_ISSUE, reqData);
        navigate("/knowledge/category/" + activeCard.id)
        dispatch({ type: ISSUE_CONST.RES_SET_SUB_CATEGORY, payload: null })
    }, [activeCard.id, assignMembers, attachments.length, chapter, reqData, startUpload, subCategory, navigate]);

    try {
        const options = subCategories?.map(item => ({ id: item.id, value: item.id, label: item.name }));
        return (
            <ErrorBoundary>
                <div className='col m-2 p-0 d-inline'>
                    <h4>{`Generate a new request (${activeCard.name})`}</h4>
                    <div className={`${classes['new-issue-request']} p-2 card`}>
                        <div className="request-form">
                            <small className='text-danger'>{error}</small>
                            <div className="form-group">
                                <label htmlFor="subjectInput">Subject</label>
                                <input
                                    type="text"
                                    className="form-control form-control-md"
                                    id="subjectInput"
                                    placeholder="Enter Subject of the Request"
                                    autoComplete='off'
                                    onChange={(e) => setReqData(prev => ({
                                        ...prev, subject: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subjectInput">Description</label>
                                <LazyComponent>
                                    <MyCkEditor
                                        name={"description"}
                                        value={reqData.description}
                                        onChange={onChangeDesc}
                                        placeHolder={"Enter description of the request"} />
                                </LazyComponent>
                            </div>
                            {!subCategory &&
                                <div className="form-group">
                                    <label htmlFor="subjectInput">Chapter name <span className='text-muted'>(optional)</span></label>
                                    <ReactSelect
                                        name="chapter"
                                        options={options}
                                        isClearable
                                        placeholder={'Select chapter'}
                                        onChange={chapterChange}
                                        className="basic-multi-select issue-multi-select_user-dropdown"
                                        classNamePrefix="react-select"
                                    />
                                </div>}
                            {/* <div><p className='mb-1'>Attachments: </p></div> */}
                            <div className="input-group">
                                <div className="form-group my-1">
                                    <label>Attachments</label>
                                    <div className="custom-file">
                                        <input
                                            type="file"
                                            className="custom-file-input"
                                            id="profilePictureInput"
                                            onChange={onChangeHandler}
                                            multiple="multiple"
                                        />
                                        <label className="custom-file-label" htmlFor="profilePictureInput">
                                            Click to add attachments
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {attachments && !!attachments.length &&
                                <div className="preview-attachments">
                                    <div className="files d-flex flex-wrap">
                                        {attachments.map((item, index) =>
                                            <PreviewFile key={index} item={item} OnClose={OnClose} />
                                        )}
                                    </div>
                                </div>}
                            {!subCategory &&
                                <div className='form-group mb-2'>
                                    <label>Assigned to:</label>
                                    <UsersDropdown
                                        userData={assignMembers}
                                        setUserData={setAssignMem}
                                        classes={''}
                                        isMulti
                                        placeholder='Assign User...'
                                    />
                                </div>}
                            <div className="d-flex justify-content-end my-1">
                                <button type='button' className='btn btn-secondary mr-2' onClick={() => {
                                    navigate("/knowledge/category/" + activeCard.id);
                                    dispatch({ type: ISSUE_CONST.RES_SET_SUB_CATEGORY, payload: null })
                                }}>
                                    Cancel
                                </button>
                                {!isUploadingMedia &&
                                    <button type='button' onClick={OnSubmit} className='btn btn-primary'>
                                        Submit
                                    </button>}
                                {isUploadingMedia &&
                                    <button className='btn btn-primary' disabled>
                                        Processing Files...
                                    </button>}
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>);
    } catch (error) {
        console.error(error);
    }
}
