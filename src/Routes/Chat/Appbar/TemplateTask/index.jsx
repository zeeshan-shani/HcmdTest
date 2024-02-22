import React, { useState, useEffect, useRef, useCallback } from 'react'
import DatePicker from 'react-datepicker';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeTask } from 'redux/actions/modelAction';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { CONST, SOCKET } from 'utils/constants';
import moment from 'moment-timezone';
import { generatePayload, getDateXDaysAgoEndOf, toastPromise } from 'redux/common';
import useDebounce from 'services/hooks/useDebounce';
import { compareName } from '../../Main/UserChat/info/group-chat-info/GroupChatInfo';
import { Check, X } from 'react-bootstrap-icons';
import { MuiTooltip, TakeConfirmation } from 'Components/components';
import { getSendToUsers } from 'redux/actions/chatAction';
import { CHAT_MODELS } from '../../Models/models';
import { Mention, MentionsInput } from 'react-mentions';
import { menuStyle } from '../../Main/UserChat/footer/css/defaultStyle';
import { getPatientData } from '../../Main/UserChat/footer/ChatFooter';
import { AddTemplateTask } from './AddTemplateTask';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import SendIcon from '@mui/icons-material/Send';
import PreviewIcon from '@mui/icons-material/Preview';
import { TaskSchedule, TemplateTaskDetails } from 'Routes/Chat/Appbar/TemplateTask/TemplateTaskDetails';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { dispatch } from 'redux/store';
import { MuiActionButton, MuiDeleteAction } from 'Components/MuiDataGrid';
import { ToggleSwitch } from 'Routes/Chat/Main/UserChat/footer/TaskType/ToggleSwitch';
import taskTemplateService from 'services/APIs/services/taskTemplateService';
import { showError } from 'utils/package_config/toast';
import { useClickAway } from 'react-use';

const defaultInput = {
    dueDate: getDateXDaysAgoEndOf(0).toLocaleString(),
    patient: null,
    isTeam: false,
    message: '',
}
const defaultState = {
    templates: [],
    totalCount: 0,
    createTemplate: false,
    templateDetail: null,
    schedule: null
}
export default function TemplateTask({ taskName }) {
    const { user, connected } = useSelector((state) => state.user);
    const { activeChat, userDesignations } = useSelector((state) => state.chat);
    const [state, setState] = useState(defaultState);
    const [filters, setFilters] = useState({ type: null, search: "", isPublic: undefined });
    const [taskData, setTaskData] = useState(defaultInput);
    const [showMembers, setShowMembers] = useState(false);
    const [assignMembers, setAssignMem] = useState([]);
    const [assignDesignation, setAssignDesg] = useState([]);
    const newFilter = useDebounce(filters, 500);
    const memberRef = useRef(null);
    const CustomBtnRef = useRef(null);
    const patientRef = useRef(null);
    const dropdownTaskRef = useRef();

    useClickAway(dropdownTaskRef, () => {
        setShowMembers(false)
    });

    const getTemplateTaskList = useCallback(async ({ type = CONST.MSG_TYPE.ROUTINE, search = '', isPublic = undefined }) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    let payload = await generatePayload({
                        rest: { "chatId": activeChat.id, "showPublicTemplate": true, isPublic },
                        keys: ["title", "subject", "description"],
                        options: {
                            sort: [['createdAt', 'desc']],
                            populate: ["userData", "templateCategory"]
                        },
                        value: search,
                        isCount: true
                    });
                    if (type) payload.query.type = type;
                    const data = await taskTemplateService.list({ payload });
                    if (data?.status === 1)
                        setState(prev => ({ ...prev, templates: data.data.rows, totalCount: data.data.count }));
                    resolve(data);
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            },
            loading: 'Fetching task list...',
            success: 'Successfully get task list.',
            error: 'Could not fetch task list.',
            options: { id: "get-templates" }
        })
    }, [activeChat.id]);

    const onPreview = useCallback(async (template) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    let payload = await generatePayload({
                        rest: { id: template.id },
                        options: {
                            populate: ["subTemplates", "templateAttachments", "TemplateAssignUsers", "userData", "templateCategory"]
                        }
                    });
                    const data = await taskTemplateService.list({ payload });
                    if (data?.status === 1) {
                        setState(prev => ({ ...prev, templateDetail: data.data[0] }));
                        dispatch({ type: TASK_CONST.GET_TEMPLATE_TASK_DETAIL, payload: data.data[0] });
                    }
                    resolve(data);
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            },
            loading: 'Fetching template...',
            success: 'Successfully get template task.',
            error: 'Could not fetch template task.',
            options: { id: "preview-template" }
        })
    }, []);

    const onDelete = useCallback(async (template) => {
        TakeConfirmation({
            title: `Are you sure about deleting the task template?`,
            content: "Template will be permanently deleted.",
            onDone: async () => {
                await taskTemplateService.delete({ payload: { id: template.id } });
                setState(prev => ({ ...prev, templates: prev.templates.filter((task) => task.id !== template.id) }))
            }
        })
    }, []);

    useEffect(() => {
        if (taskName === CHAT_MODELS.TEMPLATE_TASKS) getTemplateTaskList(newFilter);
    }, [newFilter, taskName, getTemplateTaskList]);

    const onCloseHandler = useCallback(() => {
        changeTask();
        setTaskData(defaultInput)
        setAssignMem([]);
        setAssignDesg([]);
        setFilters({ type: null, search: "" })
    }, []);

    const sendTaskToChat = useCallback((task) => {
        if (!connected) return showError("You're offline, Please check your connection and try again", { id: "offline-error" });
        if (!assignMembers.length) {
            CustomBtnRef.current.className.includes("collapsed") && CustomBtnRef.current.click();
            setTimeout(() => { memberRef.current.click(); }, 500);
            return showError('Please assign members');
        }
        const msgObject = {
            chatType: activeChat.type,
            chatId: activeChat.id,
            sendTo: getSendToUsers(user.id, activeChat.type, activeChat.chatusers),
            sendBy: user.id,
            templateId: task.id,
            isMessage: false,
            subject: task.subject,
            type: task.type,
            assignedUsers: assignMembers?.map((mem) => mem.user.id),
            label: task?.label,
            ...taskData,
            message: taskData?.message ? taskData.message + '\n' + task.description : task.description,
        }
        SocketEmiter(SOCKET.MESSAGE, msgObject);
        onCloseHandler();
    }, [activeChat.chatusers, activeChat.id, activeChat.type, assignMembers, connected, onCloseHandler, taskData, user.id]);

    const onChangeTaskType = useCallback((val) => {
        if (val === CONST.TASK_TYPE[2]) setTaskData(prev => ({ ...prev, isTeam: false, isDepartment: true }))
        else if (val === CONST.TASK_TYPE[1]) setTaskData(prev => ({ ...prev, isTeam: true, isDepartment: false }))
        else if (val === CONST.TASK_TYPE[0]) setTaskData(prev => ({ ...prev, isTeam: false, isDepartment: false }))
    }, []);

    const addMemberHandler = useCallback((member) => {
        if (assignMembers.some((mem) => mem.user.id === member.user.id))
            setAssignMem((prev) => (prev.filter((mem) => mem.user.id !== member.user.id)));
        else setAssignMem((prev) => ([member, ...prev]));
    }, [assignMembers]);

    const addDesgMembers = useCallback((desg) => {
        if (assignDesignation.some((item) => item.id === desg.id)) {
            activeChat?.chatusers.forEach(user => {
                if (user?.user?.userDesignations &&
                    user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    assignMembers.some((mem) => mem.user.id === user.user.id))
                    addMemberHandler(user)
            });
            setAssignDesg((prev) => (prev.filter((item) => item.id !== desg.id)))
        } else {
            activeChat?.chatusers.forEach(user => {
                if (user?.user?.userDesignations &&
                    user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    !assignMembers.some((mem) => mem.user.id === user.user.id))
                    addMemberHandler(user)
            });
            setAssignDesg((prev) => ([desg, ...prev]))
        }
    }, [activeChat?.chatusers, addMemberHandler, assignDesignation, assignMembers]);

    const patientChangehandler = useCallback((event, newValue, newPlainTextValue, mentions) => {
        setTaskData((prev) => ({ ...prev, patient: newValue, patientIds: mentions.map((item) => Number(item.id)) }));
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

    const onCloseTaskHandler = useCallback(() => {
        setState(prev => ({ ...prev, templateDetail: null }))
        getTemplateTaskList(newFilter);
    }, [getTemplateTaskList, newFilter]);

    return (<div className="tab-pane h-100 active" id="template-task" role="tabpanel" aria-labelledby="template-task-tab">
        <div className="appnavbar-content-wrapper">
            <div className="appnavbar-scrollable-wrapper">
                <div className="appnavbar-heading sticky-top">
                    <ul className="nav justify-content-between align-items-center">
                        <li className="text-center">
                            <h5 className="text-truncate mb-0">Template Tasks</h5>
                        </li>
                        <li className="nav-item list-inline-item close-btn">
                            <button className='btn-outline-default btn-sm border-0' onClick={onCloseHandler}>
                                <X size={20} />
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="appnavbar-body-title flex-grow-0 py-1 d-flex flex-wrap">
                    <div className='d-flex'>
                        <div className="dropdown mr-2">
                            <button className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown" id="visibilityDropdown" data-bs-toggle="dropdown" type="button">
                                View: {filters?.isPublic !== undefined ? (filters.isPublic ? "Public" : "Private") : "All"}
                            </button>
                            <ul className="dropdown-menu m-0 open-menu-left" style={{ minWidth: '8rem' }} aria-labelledby="visibilityDropdown">
                                <li className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, isPublic: undefined }))}>All</li>
                                <li className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, isPublic: true }))}>Public</li>
                                <li className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, isPublic: false }))}>Private</li>
                            </ul>
                        </div>
                        <div className="dropdown mr-2">
                            <button className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown" id="TodoDropdown" data-bs-toggle="dropdown" type="button">
                                Type: {filters.type ? filters.type : 'All'}
                            </button>
                            <ul className="dropdown-menu m-0 open-menu-left" aria-labelledby="TodoDropdown">
                                <li className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, type: null }))}>All Tasks</li>
                                <li className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, type: CONST.MSG_TYPE.ROUTINE }))}>Routine</li>
                                <li className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, type: CONST.MSG_TYPE.EMERGENCY }))}>Emergency</li>
                                <li className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, type: CONST.MSG_TYPE.URGENT }))}>Urgent</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <input type="text" className="form-control search ansparent-bg" placeholder="Search Task" onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
                    </div>
                </div>
                <div className="appnavbar-body">
                    <div className="note-container">
                        {state.templates?.map((item) => {
                            const hasAccess = item.createdBy === user.id;
                            return (
                                <div className="note" key={item.id}>
                                    <div className="note-body">
                                        <h5 className="note-title m-0">{item.subject}</h5>
                                        <p className="note-description">{item.description}</p>
                                        {item.scheduleTime ? <span className={`badge text-white p-4_8 bg-secondary`}>
                                            {moment(item.scheduleTime).format("MM/DD/YY hh:MM a")}
                                        </span> : null}
                                    </div>
                                    <div className="note-footer p-1 d-flex">
                                        <div className="note-tools badge text-capitalize text-white flex-60 flex-wrap">
                                            {item.templateCategories.map((category) => {
                                                if (category.templateCategoryInfo)
                                                    return (<span className={`badge text-white p-1`} key={category.templateCategoryInfo.id}
                                                        style={{ backgroundColor: category.templateCategoryInfo.colorCode || '#000', margin: "4px 4px", padding: "2px" }}>
                                                        {category.templateCategoryInfo.name}
                                                    </span>)
                                                return null;
                                            })}
                                        </div>
                                        <div className="note-tools">
                                            {!item.isPublic &&
                                                <TaskSchedule
                                                    onSuccess={() => getTemplateTaskList(newFilter)}
                                                    onTaskDetailsChanged={onTaskDetailsChanged}
                                                    repeat={item?.repeat}
                                                    endRepeat={item?.endRepeat}
                                                    taskDetails={item} />}
                                            {(hasAccess || !item.isPublic) &&
                                                <MuiDeleteAction onClick={() => onDelete(item)} />}
                                            <MuiActionButton Icon={PreviewIcon} tooltip='Preview task' onClick={() => onPreview(item)} />
                                            <MuiActionButton Icon={SendIcon} tooltip='Send task' onClick={() => sendTaskToChat(item)} />
                                        </div>
                                    </div>
                                </div>)
                        })}
                    </div>
                </div>
                <div className='accordion text-color'>
                    <div className={`${classes["accordion-item"]} task-card-item ${classes["todos"]} shadow-none p-0`}>
                        <div id={`templatetask-collapse`} className={`accordion-collapse collapse`} aria-labelledby={`card-filter`}>
                            <div className="accordion-body">
                                <div className="appnavbar-body-title d-flex flex-grow-0 py-1">
                                    <div className="text-left">
                                        <div className="dropdown chat-member-dropdown position-relative open-upside" ref={dropdownTaskRef}>
                                            <MuiTooltip title={`${!!assignMembers.length ? `Assigned to: ${assignMembers.map((item) => item.user.name).join(", ")}` : 'Click to assign members'}`}>
                                                <button className="dropdown-toggle btn btn-sm btn-outline-default p-4_8" ref={memberRef}
                                                    onClick={() => setShowMembers(!showMembers)}>
                                                    <span className="fs-13">{`Members (${assignMembers?.length})`}</span>
                                                </button>
                                            </MuiTooltip>
                                            {showMembers && <ul className="dropdown-menu text-light show">
                                                {userDesignations?.map((item) => (
                                                    <li key={'d-' + item.id} className={`dropdown-item cursor-pointer`} onClick={() => addDesgMembers(item)}>
                                                        <div className="d-flex justify-content-between w-100">
                                                            <span>{item.name}</span>
                                                            <span>
                                                                {!!assignDesignation.filter((desg) => desg.id === item.id).length ? (<Check size={16} />) : ("")}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                                <hr className='my-1' />
                                                {activeChat?.chatusers.sort(compareName)
                                                    .map((member) => (
                                                        <li key={member.user.id} className={`dropdown-item cursor-pointer`} onClick={() => addMemberHandler(member)}>
                                                            <div className="d-flex justify-content-between w-100">
                                                                <span>{member.user.name}</span>
                                                                <span>
                                                                    {!!assignMembers.filter((mem) => mem.user.id === member.user.id).length ? (<Check size={16} />) : ("")}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    ))}
                                            </ul>}
                                        </div>
                                    </div>
                                    <div className="ml-1 position-relative cstm-datepicker input-group">
                                        <DatePicker
                                            id="dueDate"
                                            placeholderText="Due Date"
                                            className="form-control flex-grow-1 p-4_8"
                                            selected={taskData?.dueDate ? new Date(taskData.dueDate) : null}
                                            value={taskData?.dueDate ? new Date(taskData.dueDate) : null}
                                            onChange={(date) =>
                                                setTaskData(prev => ({ ...prev, dueDate: date ? moment(date).toLocaleString() : null }))
                                            }
                                            isClearable={true}
                                            dateFormat="MM/dd/yyyy h:mm aa"
                                            autoComplete='off'
                                            showTimeInput
                                            minDate={moment().tz(CONST.TIMEZONE).toDate()}
                                            timeInputLabel="Time:"
                                        />
                                    </div>
                                    <div className="d-flex align-items-center ml-1">
                                        <ToggleSwitch
                                            values={CONST.TASK_TYPE}
                                            OnChange={e => onChangeTaskType(e)}
                                            selected={(taskData?.isDepartment ? CONST.TASK_TYPE[2] :
                                                (taskData?.isTeam ? CONST.TASK_TYPE[1] : CONST.TASK_TYPE[0]))}
                                        />
                                    </div>
                                </div>
                                <div className="appnavbar-body-title d-flex flex-grow-0 input-group py-1">
                                    <div className='form-control emojionearea-form-control w-50 d-flex align-items-center rounded-0 mentions-input transparent-bg' style={{ fontSize: user?.fontSize }}>
                                        <label className="mb-0">Patient:</label>
                                        <MentionsInput
                                            id="patientInput"
                                            name="patient"
                                            autoComplete="off"
                                            placeholder="@"
                                            type="text"
                                            style={menuStyle}
                                            value={taskData?.patient ? taskData.patient : ''}
                                            onChange={patientChangehandler}
                                            className='mentions__ccusers emojionearea-form-control inputField mx-1 flex-100 transparent-bg'
                                            singleLine
                                            inputRef={patientRef}
                                        >
                                            <Mention
                                                type="user"
                                                trigger="@"
                                                markup="<@__id__>(__display__)"
                                                // markup="<#__id__>(@__display__)"
                                                // data={patientData}
                                                data={getPatientData}
                                                displayTransform={(id, display) => { return `@${display} ` }}
                                                className="text-highlight-blue z-index-1"
                                                style={{ zIndex: 1, position: 'inherit' }}
                                            />
                                        </MentionsInput>
                                    </div>
                                </div>
                                <div className="appnavbar-body-title d-flex flex-grow-0 input-group py-1">
                                    <textarea
                                        name="message"
                                        autoComplete="off"
                                        className="form-control emojionearea-form-control message-input font-inherit"
                                        id="messageInput"
                                        rows={1}
                                        placeholder="Type Message/Task here.bnngvngf.."
                                        value={taskData?.message === "\n" ? '' : taskData?.message}
                                        onChange={(e) => setTaskData((prev) => ({ ...prev, message: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="appnavbar-footer d-flex gap-5">
                    <div
                        ref={CustomBtnRef}
                        className="btn btn-secondary accordion-button collapsed w-25"
                        data-bs-toggle="collapse"
                        data-bs-target={`#templatetask-collapse`}
                        aria-expanded="false"
                        aria-controls={`templatetask-collapse`}
                    >
                        Custom
                    </div>
                    <div
                        className="btn btn-primary btn-block"
                        role="button"
                        data-toggle="modal"
                        data-target="#addTemplateTask"
                        onClick={() => {
                            setState(prev => ({ ...prev, createTemplate: true }))
                        }}
                    >New Template Task</div>
                </div>
            </div>
        </div>
        <AddTemplateTask
            activeChatId={activeChat.id}
            showModal={state.createTemplate}
            getTemplateTaskList={() => getTemplateTaskList(newFilter)}
            onClose={() => setState(prev => ({ ...prev, createTemplate: false }))} />
        {!!state.templateDetail && (<>
            <div className="backdrop backdrop-visible task-backdrop" />
            <TemplateTaskDetails task={state.templateDetail} onCloseHandler={onCloseTaskHandler} />
        </>)}
    </div>);
}