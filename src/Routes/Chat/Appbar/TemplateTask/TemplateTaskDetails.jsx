import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import ReactImageVideoLightbox from "react-image-video-lightbox";

import { dispatch } from 'redux/store';
import { format_all, toastPromise } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { changeSubtaskStatus } from 'redux/actions/taskAction';
import { CardChecklist, ClockHistory, Pencil, Save2Fill } from 'react-bootstrap-icons';

import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { TaskLabels } from 'Routes/TaskBoard/TaskDetails/Labels/TaskLabels';
import SubtaskDetails from 'Routes/TaskBoard/TaskDetails/Subtask/SubtaskDetails';
import { AttachmentInput } from 'Routes/TaskBoard/TaskDetails/Attachments/AttachmentInput';
import { TaskAttachment } from 'Routes/TaskBoard/TaskDetails/Attachments/TaskAttachment';
import ModalReactstrap from 'Components/Modals/Modal';
import { repeatOptions, RepeatTemplateFields } from './NewTemplate';
import { TaskMembers } from 'Routes/TaskBoard/TaskDetails/Members/TaskMembers';
import { MuiTooltip } from 'Components/components';
import { IconButton } from '@mui/material';
import taskTemplateService from 'services/APIs/services/taskTemplateService';
import templateAssignuserService from 'services/APIs/services/templateAssignuserService';
import { useClickAway } from 'react-use';
import TaskCategorySelect from 'Routes/TaskBoard/TaskDetails/Labels/TaskCategorySelect';
import taskService from 'services/APIs/services/taskService';

export const TemplateTaskDetails = ({ task, onCloseHandler }) => {
    const { user } = useSelector((state) => state.user);
    const { imageId, userDesignations, activeChat } = useSelector((state) => state.chat);
    const { templateTaskDetail, taskLabels } = useSelector((state) => state.task);
    const [taskDetails, setTaskDetails] = useState(templateTaskDetail);
    const [searchInput, setSearchInput] = useState("");
    const [isImageShow, setImageShow] = useState(false);
    const [addSubtaskFlag, setAddSubtaskFlag] = useState(false);
    const [labelMenu, setLabelMenu] = useState(false);
    const textArea = useRef(null);
    const labelRef = useRef(null);
    const [isEditMode, setEditMode] = useState(false);
    const [updateInput, setUpdateInput] = useState();

    useClickAway(labelRef, () => setLabelMenu(false));

    const updateLabel = (labelDropdown) => {
        if (!labelDropdown && taskDetails && templateTaskDetail.templateCategories !== taskDetails.templateCategories)
            onTaskDetailsChanged(taskDetails.id, { label: taskDetails.templateCategories.map(i => i.categoryId) });
    }

    const onClose = () => {
        updateLabel(!labelMenu);
        dispatch({ type: TASK_CONST.GET_TEMPLATE_TASK_DETAIL, payload: null });
        onCloseHandler();
    }

    useEffect(() => {
        updateLabel(labelMenu);
        //eslint-disable-next-line
    }, [labelMenu]);

    useEffect(() => {
        if (templateTaskDetail) setTaskDetails(templateTaskDetail);
        // ListenUpdateTemplateTasks();
    }, [templateTaskDetail]);

    const attchmentDeleteHandler = useCallback(async (id) => {
        try {
            await taskService.deleteTemplateAttachment({ payload: { attachmentId: id, isTemplate: true } });
            setTaskDetails((prev) => ({ ...prev, templateAttachments: prev.templateAttachments.filter((att) => att.id !== id), }));
        } catch (error) { }
    }, []);

    const onCloseImageHandler = useCallback(() => {
        setImageShow(false);
        dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 });
    }, []);

    const onTaskDetailsChanged = useCallback(async (taskId, body) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const payload = { id: taskId, ...body };
                    const data = await taskTemplateService.update({ payload });
                    if (data?.status === 1) dispatch({ type: TASK_CONST.UPDATE_TEMPLATE_DATA, payload: data.data });
                    resolve(data);
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            },
            loading: 'Updating template data',
            success: 'Successfully update template',
            error: 'Could not update data',
            options: { id: "task-details" }
        })
    }, []);

    const addNewSubtask = useCallback(async () => {
        if (textArea.current.value.trim()) {
            const data = await taskService.createSubtask({
                payload: {
                    title: textArea.current.value.trim(),
                    taskId: taskDetails.id,
                    isTemplate: true
                }
            });
            if (taskDetails.id)
                dispatch({ type: TASK_CONST.ADD_NEW_SUBTASK, payload: data.data });
            textArea.current.value = "";
            textArea.current.focus();
        }
    }, [taskDetails.id]);

    const closeAddingSubtask = useCallback(() => {
        if (textArea.current.value.trim() === "") setAddSubtaskFlag(!addSubtaskFlag);
    }, [addSubtaskFlag]);

    const subtaskDeleteHander = useCallback(async (id) => {
        const data = await taskService.deleteSubtask({ payload: { subTemplateId: id, isTemplate: true } });
        dispatch({ type: TASK_CONST.DELETE_SUBTASK, payload: data.data });
    }, []);

    const onSaveData = useCallback(() => {
        setEditMode(false);
        onTaskDetailsChanged(taskDetails.id, updateInput)
    }, [taskDetails.id, updateInput, onTaskDetailsChanged]);

    const onTaskMemberUpdate = useCallback(async (payload) => {
        await templateAssignuserService.update({ payload });
    }, []);

    const onEditSubtask = useCallback(async (id, title) => {
        const data = await changeSubtaskStatus({ subTaskId: id, title });
        dispatch({ type: TASK_CONST.UPDATE_TEMPLATE_SUBTASK_DATA, payload: data.data });
    }, []);

    if (isImageShow)
        return (<div className="modal modal-lg-fullscreen fade show d-block task-image-gallery" id="imageGallery" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true">
            <ReactImageVideoLightbox
                data={taskDetails.templateAttachments
                    .filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
                    .map((item) => {
                        const itemType = item.mediaType.split("/").shift();
                        if (itemType === "video")
                            return { ...item, url: item.mediaUrl, type: "video", title: 'video title' }
                        return { ...item, url: item.mediaUrl, type: "photo", altTag: 'Alt Photo' }
                    })}
                startIndex={taskDetails?.templateAttachments
                    .filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
                    .findIndex((item) => item.id === imageId)}
                showResourceCount={true}
                onCloseCallback={onCloseImageHandler}
            />
        </div>)

    try {
        const taskCreatedBy = taskDetails?.userData;
        const taskCreatedAt = taskDetails?.createdAt;
        const searchFilterTasks = taskDetails.subTemplates
            .filter((st) => st.title.toLowerCase().includes(searchInput.toLowerCase()));
        const isCreator = taskDetails.createdBy === user.id;
        return (
            <div
                className={`modal modal-lg-fullscreen fade show d-block`}
                data-toggle="modal"
                id="taskDetasils"
                tabIndex={-1}
                role="dialog"
                aria-labelledby="taskDetasilsLabel"
                aria-modal="true"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom">
                    <div className="modal-content modal-content-task-details text-color">
                        <div className="modal-header">
                            <h5 className="modal-title" id="taskDetasilsLabel">
                                Task Details
                            </h5>
                            <div className={`icons d-flex align-items-center`}>
                                {/* <TaskSchedule
                                    onTaskDetailsChanged={onTaskDetailsChanged}
                                    repeat={taskDetails?.repeat}
                                    endRepeat={taskDetails?.endRepeat}
                                    taskDetails={taskDetails} /> */}
                                <div className="icon">
                                    <AttachmentInput taskId={task.id} isTemplate={true} />
                                </div>
                                <TaskCategorySelect
                                    isTemplate
                                    ref={labelRef}
                                    labelMenu={labelMenu}
                                    taskDetails={taskDetails}
                                    setLabelMenu={setLabelMenu}
                                    setTaskDetails={setTaskDetails}
                                />
                                {/* <div className="icon">
                                    <div title="Add Tags" className="dropdown m-0 show" ref={labelRef}>
                                        <div className="cursor-pointer" onClick={() => setLabelMenu(!labelMenu)}>
                                            <TagFill size={20} />
                                        </div>
                                        {labelMenu &&
                                            <ul className="dropdown-menu dropdown-menu-right text-light m-1 show">
                                                {taskLabels.map((label) => (
                                                    <li key={label.id} className={`dropdown-item text-${label.color} justify-content-between`} onClick={() => { labelSelectHandler(label) }}>
                                                        <span>{label.name}</span>
                                                        {!!taskDetails.label.filter((lab) => Number(lab) === Number(label.id)).length ? (<Check size={16} />) : ("")}
                                                    </li>
                                                ))}
                                            </ul>}
                                    </div>
                                </div> */}
                                {isCreator &&
                                    <div
                                        title={isCreator ? `Edit task` : 'Contact creator for edit task'}
                                        onClick={() => { setEditMode(!isEditMode) }}
                                        className={`icon ${isEditMode ? "text-success" : ""} ${taskDetails.createdBy !== user.id ? 'disabled' : ''}`}
                                    >
                                        <Pencil size={20} />
                                    </div>}
                                {isEditMode &&
                                    (updateInput?.title !== taskDetails.title || updateInput?.patient !== taskDetails.patient || updateInput?.subject !== taskDetails.subject) &&
                                    <div
                                        title={'Save Data'}
                                        onClick={onSaveData}
                                        className={`icon text-success`}
                                    >
                                        <Save2Fill size={20} />
                                    </div>}
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                        </div>
                        <div className="modal-body hide-scrollbar fs-14 p-2">
                            {taskDetails?.createdBy &&
                                <div className="row mb-1">
                                    <div className="col-12">
                                        <div className="mb-0">
                                            <span className='mr-1 font-weight-semibold'>Created by:</span>
                                            {taskCreatedBy &&
                                                <span className="mb-0">
                                                    <span className="light-text">
                                                        {taskCreatedBy.name}
                                                    </span>
                                                    <span className="light-text ml-1">
                                                        {`(on ${moment(taskCreatedAt).format('MM/DD/YYYY')})`}
                                                    </span>
                                                </span>}
                                        </div>
                                    </div>
                                </div>}
                            <div className="row mb-1">
                                {!isEditMode ?
                                    <div className="col-12">
                                        <span className="font-weight-semibold">Subject: </span>
                                        {taskDetails?.subject ?
                                            <span className="light-text-70">
                                                <span dangerouslySetInnerHTML={{ __html: format_all(taskDetails.subject) }}></span>
                                            </span> :
                                            <span className="text-muted">{'Not Mentioned'}</span>
                                        }
                                    </div> :
                                    <div className="col-12 align-items-center d-flex">
                                        <span className="mr-1">Subject: </span>
                                        <input type="text" name="subject" id="subject" placeholder="Enter subject"
                                            defaultValue={taskDetails.subject}
                                            onChange={(e) => setUpdateInput(prev => ({
                                                ...prev, subject: e.target.value
                                            }))}
                                            className={`${classes["form-control"]} form-control p-4_8`} />
                                    </div>}
                            </div>
                            <div className="row mb-1">
                                {!isEditMode ?
                                    <div className="col-12">
                                        <span className="font-weight-semibold">Patient: </span>
                                        {taskDetails?.patient ?
                                            <span className="light-text-70">
                                                <span dangerouslySetInnerHTML={{ __html: format_all(taskDetails.patient) }}></span>
                                            </span> :
                                            <span className="text-muted">{'Not Mentioned'}</span>
                                        }
                                    </div> :
                                    <div className="col-12 align-items-center d-flex">
                                        <span className="mr-1">Patient: </span>
                                        <input type="text" name="patient" id="patient" placeholder="Enter patient"
                                            defaultValue={taskDetails.patient}
                                            onChange={(e) => setUpdateInput(prev => ({
                                                ...prev, patient: e.target.value
                                            }))}
                                            className={`${classes["form-control"]} form-control p-4_8`} />
                                    </div>
                                }
                            </div>
                            <div className="row mb-1">
                                {!isEditMode ?
                                    <div className="col-12">
                                        <span>Description: </span>
                                        <span className="light-text-70">
                                            <span dangerouslySetInnerHTML={{ __html: format_all(taskDetails.description) }}></span>
                                        </span>
                                    </div> :
                                    <div className="col-12 d-flex flex-wrap">
                                        <span className="mr-1">Description: </span>
                                        <textarea
                                            name="message"
                                            autoComplete="off"
                                            className={`form-control`}
                                            id="messageInput"
                                            placeholder="Type Message/Task here..."
                                            defaultValue={taskDetails.description}
                                            onChange={(e) => setUpdateInput(prev => ({
                                                ...prev, description: e.target.value
                                            }))}
                                            autoFocus
                                        />
                                    </div>}
                            </div>
                            <div className="row mt-2">
                                <div className="col-12 col-md-8">
                                    <div className="card mb-2">
                                        <div className={`${classes["subtask-list"]} card-body`}>
                                            <div className={`${classes["subtask-block-header"]} mb-2 d-flex justify-content-between`}>
                                                <h6 className={`card-title mb-0`}>
                                                    <span>
                                                        Sub Tasks
                                                        ({searchFilterTasks.length})
                                                    </span>
                                                </h6>
                                                <div className="d-flex align-items-center form-group mb-0">
                                                    <input type="text" name="search" id="search" placeholder="Search sub task..." onChange={(e) => setSearchInput(e.target.value)}
                                                        className={`${classes["form-control"]} form-control mr-2 p-4_8`} />
                                                </div>
                                            </div>
                                            {searchFilterTasks && <div className={`${classes["subtasks-wrapper"]} card-text`}>
                                                {!!searchFilterTasks.length &&
                                                    searchFilterTasks
                                                        .map((subtask, index) => (
                                                            <SubtaskDetails
                                                                key={subtask.id}
                                                                index={index + 1}
                                                                subtask={subtask}
                                                                isTemplate={true}
                                                                onEditSubtask={onEditSubtask}
                                                                subtaskDeleteHander={subtaskDeleteHander}
                                                            />
                                                        ))}
                                                {!!taskDetails.subTemplates.length &&
                                                    !searchFilterTasks.length && (
                                                        <h6 className="mt-3 text-center">
                                                            No match found.
                                                        </h6>
                                                    )}
                                                {!taskDetails.subTemplates.length && (
                                                    <div className="mt-3 text-center">
                                                        {/* <ListSvg /> */}
                                                        <CardChecklist size={20} />
                                                        <span className="ml-1">There are No subtask attached</span>
                                                    </div>
                                                )}
                                                {!addSubtaskFlag ? (
                                                    <div className={`${classes["add-task-block"]} semi-bold-text`} onClick={() => setAddSubtaskFlag(true)}>
                                                        <span onClick={() => setAddSubtaskFlag(true)}>Add Subtask</span>
                                                    </div>
                                                ) : (
                                                    <div className={classes["add-card-input-block"]}>
                                                        <textarea
                                                            ref={textArea}
                                                            autoFocus
                                                            className={classes["add-card-input"]}
                                                            name="taskTitle"
                                                            rows="2"
                                                            onBlur={closeAddingSubtask}
                                                            onKeyPress={(event) => {
                                                                if (event.key === "Enter") {
                                                                    if (!event.shiftKey) {
                                                                        event.preventDefault();
                                                                        addNewSubtask();
                                                                    }
                                                                }
                                                            }}
                                                        ></textarea>
                                                        <div className={`${classes.action} mt-2 gap-10`}>
                                                            <Button size='sm' onClick={addNewSubtask}>Add Subtask</Button>
                                                            <Button className={`btn-light border`} size="sm" onClick={() => setAddSubtaskFlag(false)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4 text-center">
                                    <div className="row">
                                        {!task.isPublic &&
                                            <TaskMembers taskDetails={{
                                                ...taskDetails,
                                                taskmembers: taskDetails?.taskmembers || taskDetails?.templateAssignUsers,
                                                chatDetails: { id: activeChat.id, chatusers: activeChat.chatusers },
                                                taskStatuses: []
                                            }}
                                                setTaskDetails={setTaskDetails} userDesignations={userDesignations} onUpdate={onTaskMemberUpdate} />}
                                        <TaskLabels
                                            taskDetails={taskDetails}
                                            taskLabels={taskLabels}
                                            isTemplate
                                        />
                                        <TaskAttachment isTemplate={true} taskDetails={taskDetails} setImageShow={setImageShow} attchmentDeleteHandler={attchmentDeleteHandler} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    } catch (error) {
        console.error(error);
    }
}

export const TaskSchedule = ({ taskDetails, onTaskDetailsChanged, repeat = repeatOptions[0].value, endRepeat = null, onSuccess }) => {
    const [state, setState] = useState({
        open: false,
        repeat: repeatOptions.find(i => i.value === repeat)?.value || repeatOptions.find(i => i.value === 'custom')?.value || 0,
        frequency: repeat,
        repeatEnd: endRepeat,
        updating: false
    });

    useEffect(() => {
        setState(prev => ({
            ...prev,
            repeat: repeatOptions.find(i => i.value === taskDetails.repeat)?.value || repeatOptions.find(i => i.value === 'custom')?.value || 0,
            repeatEnd: taskDetails.endRepeat || null,
        }))
    }, [taskDetails.repeat, taskDetails.endRepeat]);

    const onToggle = () => setState(prev => ({ ...prev, open: !prev.open }));
    const onUpdate = async (data) => {
        if (!taskDetails.id) return;
        setState(prev => ({ ...prev, updating: true }));
        let body = { repeat: state.frequency, endRepeat: state.repeatEnd }
        await onTaskDetailsChanged(taskDetails.id, body)
        onSuccess();
        setState(prev => ({ ...prev, updating: false, open: false }));
    };
    return (<>
        <MuiTooltip title={taskDetails?.status === 'started' ? 'Active Schedule' : 'Not Schedule'}>
            <IconButton className={taskDetails?.status === 'started' ? 'text-primary' : ''} aria-label="schedule" onClick={onToggle}>
                <ClockHistory size={18} />
            </IconButton>
        </MuiTooltip>
        <ModalReactstrap
            header={'Task Schedule'}
            show={state.open}
            toggle={onToggle}
            body={<>
                <RepeatTemplateFields state={state} setState={setState} />
                <div className='gap-5'>
                    <Button variant='secondary' onClick={onToggle}>Cancel</Button>
                    <Button variant='primary' disabled={state.loading} onClick={onUpdate}>
                        {!state.loading ? 'Update' : 'Updating...'}</Button>
                </div>
            </>}
        />
    </>)
}