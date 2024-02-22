import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { setThreadMessage } from 'redux/actions/chatAction';
import { changeTask } from 'redux/actions/modelAction';

import { Archive, ArrowLeft, CodeSquare, Collection, Gear, Journal, ListTask, Star } from 'react-bootstrap-icons';
import { MuiTooltip } from 'Components/components';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import { CHAT_MODELS } from '../Models/models';
import { getGhostAccess } from 'utils/permission';
import ImportantMessage from 'Routes/Chat/Appbar/ImportantMessages';
import TemplateTask from 'Routes/Chat/Appbar/TemplateTask';
import MessageInfo from 'Routes/Chat/Appbar/MessageInfo';
import Notes from 'Routes/Chat/Appbar/Notes';
import ToDo from 'Routes/Chat/Appbar/Todos';
import Settings from 'Routes/Chat/Appbar/Settings';
import ThreadMessage from 'Routes/Chat/Appbar/ThreadView';
import GroupForms from 'Routes/Chat/Appbar/GroupForms';
import ErrorBoundary from 'Components/ErrorBoundry';

export const Appbar = () => {
    const { activeChat, threadMessage, taskList } = useSelector((state) => state.chat);
    const { taskName } = useSelector((state) => state.model);
    const { user } = useSelector((state) => state.user);
    const [innerWidth, setInnerWidth] = useState(0);
    const ghostOn = (getGhostAccess(user) && !activeChat?.users?.includes(user.id));

    useLayoutEffect(() => {
        window.addEventListener("resize", () => setInnerWidth(window.innerWidth));
        setInnerWidth(window.innerWidth);
    }, []);

    const onClosehandler = useCallback(() => {
        changeTask();
        if (threadMessage) setThreadMessage();
        if (!!taskList.data.length)
            dispatch({ type: CHAT_CONST.GET_TASKS_SUCCESS, payload: { data: [] } });
    }, [taskList?.data?.length, threadMessage]);

    const onNotes = useCallback(() => {
        changeTask(CHAT_MODELS.NOTES);
    }, []);
    const onToDo = useCallback(() => {
        changeTask(CHAT_MODELS.TODO);
    }, []);
    const onSettings = useCallback(() => {
        changeTask(CHAT_MODELS.SETTINGS);
    }, []);
    const onArchive = useCallback(() => {
        changeTask(CHAT_MODELS.TEMPLATE_TASKS);
    }, []);
    const onForms = useCallback(() => {
        changeTask(CHAT_MODELS.GROUP_FORMS);
    }, []);
    const onImportant = useCallback(() => {
        changeTask(CHAT_MODELS.IMPORTANT_ITEM);
    }, []);

    const features = useMemo(() => [
        {
            modalName: CHAT_MODELS.NOTES,
            title: "Notes",
            IconComponent: Journal,
            Component: Notes,
            onSelect: onNotes,
            active: taskName === CHAT_MODELS.NOTES
        },
        {
            modalName: CHAT_MODELS.TODO,
            title: "Task list",
            IconComponent: ListTask,
            Component: ToDo,
            onSelect: onToDo,
            active: taskName === CHAT_MODELS.TODO
        },
        {
            enabled: taskName === CHAT_MODELS.THREAD_ITEM,
            modalName: CHAT_MODELS.THREAD_ITEM,
            title: "Threads",
            IconComponent: Collection,
            Component: ThreadMessage,
            onSelect: () => { },
            active: taskName === CHAT_MODELS.THREAD_ITEM
        },
        {
            modalName: CHAT_MODELS.SETTINGS,
            title: "Settings",
            IconComponent: Gear,
            Component: Settings,
            onSelect: onSettings,
            active: taskName === CHAT_MODELS.SETTINGS
        },
        {
            modalName: CHAT_MODELS.IMPORTANT_ITEM,
            title: "Important Messages",
            IconComponent: Star,
            Component: ImportantMessage,
            onSelect: onImportant,
            active: taskName === CHAT_MODELS.IMPORTANT_ITEM
        },
        {
            enabled: !ghostOn,
            modalName: CHAT_MODELS.TEMPLATE_TASKS,
            title: "Template tasks",
            IconComponent: Archive,
            Component: TemplateTask,
            onSelect: onArchive,
            active: taskName === CHAT_MODELS.TEMPLATE_TASKS
        },
        {
            enabled: false,
            modalName: CHAT_MODELS.MESSAGE_INFO,
            title: "Message info",
            Component: MessageInfo,
            active: taskName === CHAT_MODELS.MESSAGE_INFO
        },
        {
            modalName: CHAT_MODELS.GROUP_FORMS,
            title: "Template messages",
            IconComponent: CodeSquare,
            Component: GroupForms,
            onSelect: onForms,
            active: taskName === CHAT_MODELS.GROUP_FORMS
        },
    ], [
        onArchive,
        onForms,
        onImportant,
        onNotes,
        onSettings,
        onToDo,
        ghostOn,
        taskName
    ]);

    const ActiveFeature = useMemo(() => features.find(i => i.active), [features]);

    return (<div className={`appbar ${(!taskName) ? 'appbar-hidden' : 'z-index-1025'}`}>
        {(taskName !== CHAT_MODELS.THREAD_ITEM || innerWidth > 1199) &&
            <div className="appbar-wrapper hide-scrollbar">
                <div className="d-flex justify-content-center border-bottom w-100">
                    <button className="btn btn-secondary btn-icon m-0 btn-minimal btn-sm text-muted d-xl-none" onClick={onClosehandler}>
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <ul className="nav nav-minimal appbar-nav" id="appNavTab" role="tablist">
                    {features
                        .filter(i => !i.hasOwnProperty("enabled") || i.enabled)
                        .map((item, index) => {
                            const { IconComponent, title, modalName, onSelect } = item;
                            return (
                                <li className="nav-item" role="presentation" key={index}>
                                    <MuiTooltip title={title} placement='left'>
                                        <div className={`nav-link ${taskName === modalName ? 'active' : ''}`}
                                            id={"notes-tab-" + modalName}
                                            onClick={onSelect}>
                                            <IconComponent size={20} />
                                        </div>
                                    </MuiTooltip>
                                </li>
                            )
                        })}
                </ul>
            </div>}
        {taskName &&
            <div className="tab-content appnavbar-content appnavbar-content-visible">
                <ErrorBoundary>
                    {ActiveFeature &&
                        <ActiveFeature.Component taskName={taskName} onClosehandler={onClosehandler} />}
                </ErrorBoundary>
            </div>}
    </div>);
}