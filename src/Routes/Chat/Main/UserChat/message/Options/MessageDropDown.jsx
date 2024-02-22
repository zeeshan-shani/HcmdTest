import React, { useCallback, useMemo, useState } from "react";
import { changeModel, changeTask } from "redux/actions/modelAction";
import { SocketEmiter } from "utils/wssConnection/Socket";
import { handleDownload, toastPromise } from "redux/common";
import { CONST, SOCKET } from "utils/constants";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { dispatch } from "redux/store";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { format_mention } from 'redux/common'
import { useNavigate } from "react-router-dom";
import { showSuccess } from "utils/package_config/toast";
import { addImportantMessage, addWatchMessage, removeImportantMessage, removeWatchMessage, setInfoMessage, setReplyPrivatelyMessage } from "redux/actions/chatAction";
import { ArrowLeft, ArrowLeftRight, ArrowReturnLeft, ArrowReturnRight, ArrowRight, Clipboard, ClockHistory, Diagram2, Download, InfoCircle, Pencil, PlusCircle, Star, StarFill, ThreeDotsVertical, TrashFill } from "react-bootstrap-icons";
import { Dropdown } from "react-bootstrap";
import { useSelector } from "react-redux";
import reminderService from "services/APIs/services/reminderService";

export const MessageDropDown = ({ item, SetUserChatState, isGroupAdmin }) => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);
    const { activeChat } = useSelector(state => state.chat);
    const [reminder, setReminder] = useState();

    const AddToTaskHandler = useCallback(() => {
        const body = {
            name: item.message,
            description: item.message,
            type: item.type,
            chatId: item.chatId,
            messageId: item.id,
        };
        SocketEmiter(SOCKET.REQUEST.ADD_TO_TASK, body);
    }, [item]);

    const QuoteMessageHandler = useCallback(() => SetUserChatState(prev => ({ ...prev, quoteMessage: item })), [SetUserChatState, item]);

    const AddImportantMessageHandler = useCallback(() => addImportantMessage(item, "add"), [item]);

    const RemoveImportantMessageHandler = useCallback(() => removeImportantMessage(item, "remove"), [item]);

    const onClickDeleteMsg = useCallback(() => SocketEmiter(SOCKET.REQUEST.DELETE_CHAT_MESSAGE, { chatId: item.chatId, messageId: item.id }), [item?.chatId, item?.id]);

    const onEditMessageHandler = useCallback(() => SetUserChatState(prev => ({ ...prev, editMessage: item })), [SetUserChatState, item])

    const onClickInfo = useCallback(() => setInfoMessage(item.id), [item?.id]);

    const QuotePrivatelyMessageHandler = useCallback(() => setReplyPrivatelyMessage(item, user, navigate), [item, navigate, user]);

    const onCopyMessage = useCallback(() => showSuccess('Message Copied.'), []);

    const itemText = useMemo(() => {
        return (
            `${item.subject ? 'Subject: ' + item.subject + '\n' : ''}${item.patient ? 'Patient: ' + format_mention(item.patient) + '\n' : ''}${item.ccText ? 'CC: ' + format_mention(item.ccText) + '\n' : ''}${item.message ? ((item.subject || item.subject || item.ccText) ? 'Message: ' : '') + item.message : ''}`
        )
    }, [item]);

    const AddWatchMessageHandler = useCallback(() => addWatchMessage(item, "add"), [item]);

    const RemoveWatchMessageHandler = useCallback(() => {
        const body = {
            messageId: item.id,
            taskId: item.task.id,
            chatId: item.chatId,
            type: "remove"
        }
        removeWatchMessage(body, "remove", item.task.watchList.id)
    }, [item?.chatId, item?.id, item?.task?.id, item?.task?.watchList?.id]);

    const ForwardMessage = useCallback(() => {
        dispatch({ type: CHAT_CONST.SET_FORWARD_MSG, payload: item });
        changeModel(CHAT_MODELS.FORWARD_MSG);
    }, [item]);

    const sendFollowUpTask = useCallback(() => {
        changeModel(CHAT_MODELS.FOLLOWUP_TASK_GROUP);
        dispatch({ type: CHAT_CONST.SET_FORWARD_MSG, payload: { ...item, isFollowupTask: true } });
    }, [item]);

    const setThreadMessage = useCallback(() => {
        if (!item) return;
        dispatch({ type: CHAT_CONST.SET_THREAD_MESSAGE, payload: item });
        changeTask(CHAT_MODELS.THREAD_ITEM);
    }, [item]);

    const options = useMemo(() => [
        {
            id: "add-to-task",
            enabled:
                activeChat.id !== -1 &&
                !item.mediaType &&
                item.isMessage,
            IconComponent: PlusCircle,
            name: "Add to Task",
            className: "text-color",
            onTrigger: AddToTaskHandler
        },
        {
            id: "send-followup",
            enabled: activeChat.id !== -1 && !item.isMessage,
            // && item.task?.status === CONST.TASK_STATUS[3].value,
            IconComponent: ArrowRight,
            name: "Send Followup task",
            className: "text-color",
            onTrigger: sendFollowUpTask
        },
        {
            id: "msg-edit",
            enabled:
                activeChat.id !== -1 &&
                !item.mediaType &&
                item.sendBy === user.id,
            IconComponent: Pencil,
            name: "Edit",
            className: "text-color",
            onTrigger: onEditMessageHandler
        },
        {
            id: "msg-forward",
            enabled: activeChat.id !== -1,
            IconComponent: ArrowReturnRight,
            name: "Forward",
            className: "text-color",
            onTrigger: ForwardMessage
        },
        {
            id: "msg-reply",
            enabled: activeChat.id !== -1,
            IconComponent: ArrowReturnLeft,
            name: "Reply",
            className: "text-color",
            onTrigger: QuoteMessageHandler
        },
        {
            id: "msg-reply-privately",
            enabled:
                activeChat.id !== -1 &&
                item.sendBy !== user.id &&
                activeChat.type === CONST.CHAT_TYPE.GROUP,
            IconComponent: ArrowLeftRight,
            name: "Reply Privately",
            className: "text-color",
            onTrigger: QuotePrivatelyMessageHandler
        },
        {
            id: "remove-imp",
            enabled: Boolean(activeChat.id !== -1 && item.importantMessage),
            IconComponent: Star,
            name: "Remove Important",
            className: "text-color",
            onTrigger: RemoveImportantMessageHandler
        },
        {
            id: "add-imp",
            enabled: Boolean(activeChat.id !== -1 && !item.importantMessage),
            IconComponent: StarFill,
            name: "Add Important",
            className: "text-color",
            onTrigger: AddImportantMessageHandler
        },
        {
            id: "remove-watch",
            enabled: (activeChat.id !== -1 && !item.isMessage && item.task) && item?.task?.watchList,
            IconComponent: Star,
            name: "Remove Watch",
            className: "text-color",
            onTrigger: RemoveWatchMessageHandler
        },
        {
            id: "keep-watch",
            enabled: (activeChat.id !== -1 && !item.isMessage && item.task) && !item?.task?.watchList,
            IconComponent: StarFill,
            name: "Keep Watch",
            className: "text-color",
            onTrigger: AddWatchMessageHandler
        },
        {
            id: "view-threads",
            IconComponent: Diagram2,
            name: "View Threads",
            className: "text-color",
            onTrigger: setThreadMessage
        },
        {
            id: "msg-info",
            IconComponent: InfoCircle,
            name: "Info",
            className: "text-color",
            onTrigger: onClickInfo
        },
        {
            id: "msg-download",
            enabled: Boolean(item.mediaType),
            IconComponent: Download,
            className: "text-info download",
            name: "Download",
            onTrigger: () => handleDownload(item.mediaUrl, item.fileName)
        },
        {
            id: "msg-delete",
            enabled: item.sendBy === user.id || isGroupAdmin,
            IconComponent: TrashFill,
            className: "text-danger",
            name: "Delete",
            onTrigger: onClickDeleteMsg
        },
    ], [
        AddImportantMessageHandler,
        AddToTaskHandler,
        ForwardMessage,
        QuoteMessageHandler,
        QuotePrivatelyMessageHandler,
        RemoveImportantMessageHandler,
        onClickDeleteMsg,
        onClickInfo,
        onEditMessageHandler,
        AddWatchMessageHandler,
        RemoveWatchMessageHandler,
        sendFollowUpTask,
        setThreadMessage,
        activeChat.id,
        activeChat.type,
        isGroupAdmin,
        item.importantMessage,
        item.fileName,
        item.isMessage,
        item.mediaType,
        item.mediaUrl,
        item.sendBy,
        item.task,
        user.id]);

    const setTimers = useCallback(async (timer) => {
        if (item.id && timer.value) {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await reminderService.create({
                            payload: { messageId: item.id, duration: timer.value }
                        });
                        if (data?.status === 1)
                            return resolve(1);
                        return reject(0);
                    } catch (error) {
                        reject(0);
                        console.error(error);
                    }
                },
                loading: "Set reminder for " + timer.label,
                error: "Could not set timer",
                success: "Set reminder for " + timer.label,
            })

        }
    }, [item]);

    return (<>
        <Dropdown>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                <ThreeDotsVertical size={user?.fontSize + 2} />
            </Dropdown.Toggle>
            <Dropdown.Menu as={CustomMenu}>
                {reminder && <>
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            setReminder(false);
                        }}
                        className={`dropdown-item d-flex align-items-center gap-10 text-color text-decoration-none`}
                    >
                        <ArrowLeft size={user?.fontSize} />
                        <span>Back</span>
                    </div>
                    {duration.map(item => {
                        return (
                            <Dropdown.Item
                                key={item.value}
                                eventKey={item.value}
                                onClick={() => setTimers(item)}
                                className={`d-flex align-items-center gap-10 text-color text-decoration-none`}
                            >
                                <span>{item.label}</span>
                            </Dropdown.Item>
                        )
                    })}
                </>}
                {!reminder && <>
                    <CopyToClipboard text={String(itemText)} onClick={onCopyMessage}>
                        <li className="dropdown-item d-flex align-items-center text-color">
                            <Clipboard size={user?.fontSize} className="mr-2" /> Copy
                        </li>
                    </CopyToClipboard>
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            setReminder(true);
                        }}
                        className={`dropdown-item d-flex align-items-center gap-10 text-color`}
                    >
                        <ClockHistory size={user?.fontSize} />
                        <span>Set Reminder</span>
                    </div>
                    {options
                        .filter(i => !i.hasOwnProperty("enabled") || i.enabled)
                        .map(item => {
                            const { IconComponent, name, onTrigger, className = '', id } = item;
                            return (
                                <Dropdown.Item
                                    key={item.id}
                                    eventKey={id}
                                    onClick={onTrigger}
                                    className={`d-flex align-items-center gap-10 ${className} text-decoration-none`}
                                >
                                    <IconComponent size={user?.fontSize} />
                                    <span>{name}</span>
                                </Dropdown.Item>
                            )
                        })}
                </>}
            </Dropdown.Menu>
        </Dropdown>
        {/* <div className="dropdown message-dropdown">
            <button className="btn p-0 text-color" id={`message-dropdown-${item.id}`} data-bs-toggle="dropdown" ref={dropdownRef}>
                <ThreeDotsVertical size={user?.fontSize + 2} />
            </button>
            <ul className="dropdown-menu m-0" aria-labelledby={`message-dropdown-${item.id}`} style={{ fontSize: user?.fontSize }}>
                <CopyToClipboard text={String(itemText)} onClick={onCopyMessage}>
                    <li className="dropdown-item d-flex align-items-center">
                        <Clipboard size={user?.fontSize} className="mr-2" /> Copy
                    </li>
                </CopyToClipboard>
                {options
                    .filter(i => !i.hasOwnProperty("enabled") || i.enabled)
                    .map((item, index) => {
                        const { IconComponent, name, onTrigger, className = '' } = item;
                        return (
                            <li key={index} className={`dropdown-item d-flex align-items-center ${className}`} onClick={onTrigger}>
                                <IconComponent size={user?.fontSize} className="mr-2" />
                                <span>{name}</span>
                            </li>
                        )
                    })}
                <li className="dropdown-item d-flex align-items-center">
                    <div className="p-0 text-color" id={`subdropdown-${item.id}`} data-bs-toggle="dropdown" ref={subMenuRef}>
                        <ClockHistory size={user?.fontSize} className="mr-2" /> Reminder
                    </div>
                    <ul className="dropdown-menu m-0 dropdown-submenu" aria-labelledby={`subdropdown-${item.id}`} style={{ fontSize: user?.fontSize }}>
                        <li className="dropdown-item d-flex align-items-center">
                            10
                        </li>
                        <li className="dropdown-item d-flex align-items-center">
                            50
                        </li>
                    </ul>
                </li>
            </ul>
        </div> */}
    </>)
}

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <button className="btn p-0 text-color" ref={ref} onClick={(e) => {
        e.preventDefault();
        onClick(e);
    }}>
        {children}
    </button>
));


// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
        return (
            <div
                ref={ref}
                style={style}
                className={className}
                aria-labelledby={labeledBy}
                onClick={(e) => e.preventDefault()}
            >
                <ul className="m-0">
                    {children}
                </ul>
            </div>
        );
    },
);

const duration = [
    { label: '10 Minutes', value: 10 },
    { label: '15 Minutes', value: 15 },
    { label: '30 Minutes', value: 30 },
    { label: '1 Hour', value: 60 * 1 },
    { label: '3 Hour', value: 60 * 3 },
]