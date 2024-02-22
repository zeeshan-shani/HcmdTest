import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import classes from "Routes/TaskBoard/TasksPage.module.css";

import TaskBoard from 'Routes/TaskBoard/TaskBoard/index';
import TaskList from "Routes/TaskBoard/TaskList/index";
import FilterTasks from "Routes/TaskBoard/Filters/FilterTasks";
import TaskDetails from "Routes/TaskBoard/TaskDetails/TaskDetails";
import { ReactComponent as TaskStarted } from "assets/media/heroicons/task-started.svg";
import { ReactComponent as TaskPaused } from "assets/media/heroicons/task-paused.svg";
import { ReactComponent as TaskPending } from "assets/media/heroicons/task-pending.svg";
import { ReactComponent as TaskCompleted } from "assets/media/heroicons/task-completed.svg";

import { CONST, SOCKET } from "utils/constants";
import { ListenNewAssign, listenTaskActivities } from "utils/wssConnection/Listeners/Tasklistener";
import { getFilterTasksData, sendMessage, SocketEmiter } from "utils/wssConnection/Socket";
import { dispatch } from "redux/store";
import { generatePayload, getImageURL } from "redux/common";
import { changeModel } from "redux/actions/modelAction";
import { getSendToUsers, loadUserChatList } from "redux/actions/chatAction";
import { TASK_CONST } from "redux/constants/taskConstants";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import ErrorBoundary from "Components/ErrorBoundry";
import TaskAnalytics from "./TaskAnalytics";
import TaskSubAnalytics from "./TaskSubAnalytics";
import { showError } from "utils/package_config/toast";
import { sortingMethods } from "Routes/Chat/Appbar/Todos";
import useDebounce from "services/hooks/useDebounce";
import { PublishedWithChangesTwoTone } from "@mui/icons-material";
import TaskCalendar from "./TaskCalendar";

const defaultTask = {
    view: CONST.TASK_BOARD_VIEW.CALENDAR
}

export default function TaskPage() {
    const { user, connected } = useSelector((state) => state.user);
    const { chatList, userDesignations } = useSelector((state) => state.chat);
    const { activeTaskChat, activeTaskList, taskCards, taskDetails, filterTaskData } = useSelector((state) => state.task);

    const [state, setState] = useState(defaultTask);
    const [filterObj, setFilterObj] = useState({
        chatId: (activeTaskChat && activeTaskChat.id !== -1) ? [activeTaskChat.id] : chatList.map((chat) => chat.id),
        search: "",
        category: null,
        status: filterTaskData.status,
        dateFrom: filterTaskData.dateFrom,
        dateTo: filterTaskData.dateTo,
        filterTask: CONST.FILTER_TASK_TYPE.ASSIGNEE.value,
        chatType: activeTaskChat?.type ?? null,
        sortMethod: sortingMethods[0]
    });
    const newFilters = useDebounce(filterObj, 500);

    // get chatist
    useEffect(() => {
        (async () => {
            if (!chatList.length) {
                const payload = await generatePayload({
                    // rest: { includeChatUserDetails: false },
                    options: {
                        populate: ["chatUser"],
                        attributes: {
                            data: CONST.ATTRIBUTES.CHATS,
                            exclude: ['description', 'routineHour', 'routineMinute', 'emergencyHour', 'emergencyMinute', 'urgentHour', 'urgentMinute', 'allowOnlyAdminMessage',]
                        }
                    },
                    isCount: true
                });
                await loadUserChatList(payload);
            }
        })();
        return () => dispatch({ type: TASK_CONST.RES_GET_TASKLIST, payload: [] });
        //eslint-disable-next-line
    }, []);

    // Listen new task for assignee
    useEffect(() => {
        if (!newFilters.dateFrom || !newFilters.dateTo) return;
        if (activeTaskChat) {
            const filters = {
                ...newFilters,
                category: newFilters.category ? newFilters.category.id : null,
                sortMethod: newFilters.sortMethod.value || sortingMethods[0].value,
            }
            ListenNewAssign(filters, chatList, activeTaskChat.id);
        }
    }, [newFilters, activeTaskChat, chatList])

    // Task activity Listener
    useEffect(() => {
        if (activeTaskChat && activeTaskChat.id !== -1) {
            const filters = {
                ...filterObj,
                sortMethod: filterObj.sortMethod.value || sortingMethods[0].value,
                category: filterObj.category ? filterObj.category.id : null
            }
            getChatTaskList(activeTaskChat.id, chatList, filters);
            listenTaskActivities(activeTaskChat.id);
        } else if (activeTaskChat && activeTaskChat.id === -1) listenTaskActivities(0);
        //eslint-disable-next-line
    }, [activeTaskChat]);

    useEffect(() => setFilterObj(prev => ({ ...prev, ...filterTaskData })), [filterTaskData]);

    const onCloseTaskDetails = useCallback(() => {
        if (!newFilters.dateFrom || !newFilters.dateTo) return;
        const filters = {
            ...filterObj,
            sortMethod: filterObj.sortMethod.value || sortingMethods[0].value,
            category: filterObj.category ? filterObj.category.id : null
        }
        getChatTaskList(activeTaskChat.id, chatList, filters);
        dispatch({ type: TASK_CONST.RES_GET_TASK_DETAILS, payload: null });
    }, [activeTaskChat?.id, chatList, filterObj, newFilters.dateFrom, newFilters.dateTo]);
    // }, []);

    const addNewTaskHandler = useCallback((data, cb) => {
        if (!connected) return showError("You're offline, Please check your connection and try again", { id: "offline-error" });
        const msgObject = {
            chatType: activeTaskChat.type,
            chatId: activeTaskChat.id,
            message: data.name,
            type: data.type,
            sendTo: getSendToUsers(user.id, activeTaskChat.type, activeTaskChat.chatusers),
            sendBy: user.id,
            patient: data.patient,
            subject: data.subject,
            isMessage: false,
            dueDate: data.dueDate,
            assignedUsers: data.assignMembers
            // mediaType: null,
            // mediaUrl: null,
            // quotedMessageId: null,
            // fileName: null,
            // ccText: null,
            // ccMentions: [],
            // bccText: null,
            // bccMentions: [],
        }
        sendMessage(msgObject);
        cb();
    }, [activeTaskChat?.chatusers, activeTaskChat?.id, activeTaskChat?.type, connected, user.id]);

    const taskDeleteHandler = useCallback((chatId, taskId, messageId = null) =>
        SocketEmiter(SOCKET.REQUEST.DELETE_TASK, { chatId, taskId, messageId }), []);

    return (
        <ErrorBoundary>
            {chatList && !!chatList.length ?
                <div className={`task-page w-100 ${classes["page-layout"]} hide-horizonal-scroll`}>
                    <FilterTasks
                        filterObj={filterObj}
                        setFilterObj={setFilterObj}
                        state={state}
                        setState={setState}
                    />
                    <TaskAnalytics
                        userId={user.id}
                        filterObj={filterObj}
                        label="Task Analytics"
                    />
                    <TaskSubAnalytics
                        filterObj={filterObj}
                    />
                    {state.view === CONST.TASK_BOARD_VIEW.BOARD &&
                        <TaskBoard
                            activeTaskChat={activeTaskChat}
                            taskCards={taskCards}
                            activeTaskList={activeTaskList}
                            addNewTaskHandler={addNewTaskHandler}
                            taskDeleteHandler={taskDeleteHandler}
                            userDesignations={userDesignations}
                            newFilters={newFilters}
                        />}
                    {state.view === CONST.TASK_BOARD_VIEW.LIST &&
                        <TaskList
                            activeTaskChat={activeTaskChat}
                            taskCards={taskCards}
                            activeTaskList={activeTaskList}
                            addNewTaskHandler={addNewTaskHandler}
                            taskDeleteHandler={taskDeleteHandler}
                            userDesignations={userDesignations}
                        />}
                    {state.view === CONST.TASK_BOARD_VIEW.CALENDAR &&
                        <TaskCalendar
                            activeTaskChat={activeTaskChat}
                            taskCards={taskCards}
                            activeTaskList={activeTaskList}
                            addNewTaskHandler={addNewTaskHandler}
                            taskDeleteHandler={taskDeleteHandler}
                            userDesignations={userDesignations}
                        />}
                </div>
                : <div className="chats">
                    <div className="d-flex flex-column justify-content-center text-center vh-100 w-100 m-auto">
                        <div className="container">
                            <div className="avatar avatar-lg mb-2">
                                <img className="avatar-img" src={getImageURL(user?.profilePicture, '120x120')} alt="" />
                            </div>
                            <h5 className='username-text'>Welcome, {user?.name}!</h5>
                            <p className="text-muted">Please create chat to Start creating task.</p>
                            <Link to={CONST.APP_ROUTES.CHAT}>
                                <button className="btn btn-outline-primary no-box-shadow" onClick={() => changeModel(CHAT_MODELS.NEW_CHAT)}>
                                    Start a conversation
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>}
            {taskDetails && activeTaskChat && ( // taskDetails.chatDetails &&
                <TaskDetails onClose={() => onCloseTaskDetails(activeTaskChat.id)} task={taskDetails} />
            )}
        </ErrorBoundary>);
}

export const getChatTaskList = (activeTaskChatId, chatList, filterObj) => {
    getFilterTasksData({
        chatId: (activeTaskChatId === -1) ? chatList.map((chat) => chat.id) : [activeTaskChatId],
        ...filterObj
    });
}

export const getTaskStatusSvg = (status) => {
    switch (status) {
        case CONST.TASK_STATUS[0].value: return <TaskPending />
        case CONST.TASK_STATUS[1].value: return <TaskStarted />
        case CONST.TASK_STATUS[2].value: return <TaskPaused />
        case CONST.TASK_STATUS[3].value: return <TaskCompleted />
        case CONST.TASK_STATUS[4].value: return <PublishedWithChangesTwoTone color="success" />
        default: return <></>;
    }
}
