import React, { useCallback, useMemo } from 'react'
import { changeModel, changeTask } from 'redux/actions/modelAction';
import { dispatch } from 'redux/store';
import { ArrowLeftRight, ArrowReturnLeft, ArrowReturnRight, Diagram2, Download, InfoCircle, Pencil, PlusCircle, Star, StarFill, ThreeDots, TrashFill } from "react-bootstrap-icons";
import { handleDownload, updateState } from 'redux/common';
import { CONST, SOCKET } from 'utils/constants';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { addImportantMessage, removeImportantMessage, setInfoMessage, setReplyPrivatelyMessage, setThreadMessage } from 'redux/actions/chatAction';
import { setUserHandler } from 'Routes/Chat/Sidebar/Chat';
import { defaultChatState } from 'Routes/Chat';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { CHAT_MODELS } from 'Routes/Chat/Models/models';
import { useNavigate } from 'react-router-dom';
import { getChatDetails } from 'services/helper';
import { useSelector } from 'react-redux';

export const SearchMessageDropdown = ({ item, setChatState, chatData, activeChatId }) => {
    const { user } = useSelector(state => state.user);
    const navigate = useNavigate();

    // Function for convert message to task
    const AddToTaskHandler = useCallback(() => {
        const body = { name: item.message, description: item.message, type: item.type, chatId: item.chatId, messageId: item.id };
        SocketEmiter(SOCKET.REQUEST.ADD_TO_TASK, body);
    }, [item]);

    // Function for Edit message or task
    const onEditMessageHandler = useCallback(async () => {
        let chat = chatData;
        if (!chatData) chat = await getChatDetails(item.chatId);
        setUserHandler({ chat, activeChatId, userId: user.id, navigate });
        updateState(setChatState, { ...defaultChatState, editMessage: item });
    }, [chatData, activeChatId, user.id, item, setChatState, navigate]);

    // Function for Forward message
    const ForwardMessage = useCallback(() => {
        dispatch({ type: CHAT_CONST.SET_FORWARD_MSG, payload: item });
        changeModel(CHAT_MODELS.FORWARD_MSG);
    }, [item]);

    // Function for Reply about the message in chat
    const QuoteMessageHandler = useCallback(async () => {
        let chat = chatData;
        if (!chatData) chat = await getChatDetails(item.chatId);
        setUserHandler({ chat, activeChatId, userId: user.id, navigate })
        updateState(setChatState, { ...defaultChatState, quoteMessage: item });
    }, [chatData, activeChatId, user.id, item, setChatState, navigate]);

    // Function for Reply privately to the message sender
    const QuotePrivatelyMessageHandler = useCallback(() =>
        setReplyPrivatelyMessage(item, user, navigate), [item, user, navigate]);

    // Function for mark message as important
    const AddImportantMessageHandler = useCallback(() => addImportantMessage(item, "add"), [item]);

    // Function for remove message from important list
    const RemoveImportantMessageHandler = useCallback(() => removeImportantMessage(item, "remove"), [item]);

    // Function for get thread view
    const ShowThreadView = useCallback(async () => {
        let chat = chatData;
        if (!chatData) chat = await getChatDetails(item.chatId);
        setUserHandler({ chat, activeChatId, userId: user.id, navigate })
        setThreadMessage(item);
        changeTask(CHAT_MODELS.THREAD_ITEM);
    }, [item, chatData, activeChatId, user.id, navigate]);

    // Function for get message receipient
    const onClickInfo = useCallback(async () => {
        let chat = chatData;
        if (!chatData) chat = await getChatDetails(item.chatId);
        setUserHandler({ chat, activeChatId, userId: user.id, navigate });
        setInfoMessage(item);
    }, [chatData, activeChatId, user.id, item, navigate]);

    // Function for delete the message
    const onClickDeleteMsg = useCallback(() =>
        SocketEmiter(SOCKET.REQUEST.DELETE_CHAT_MESSAGE,
            { chatId: item.chatId, messageId: item.id }
        ), [item]);

    const options = useMemo(() => [
        {
            enabled: !item.mediaType && item.isMessage,
            IconComponent: PlusCircle,
            name: "Add to Task",
            onTrigger: AddToTaskHandler
        },
        {
            enabled: !item.mediaType && item.sendBy === user.id,
            IconComponent: Pencil,
            name: "Edit",
            onTrigger: onEditMessageHandler
        },
        {
            enabled: item.isMessage,
            IconComponent: ArrowReturnRight,
            name: "Forward",
            onTrigger: ForwardMessage
        },
        {
            IconComponent: ArrowReturnLeft,
            name: "Reply",
            onTrigger: QuoteMessageHandler
        },
        {
            enabled: item.sendBy !== user.id && item.chatDetails.type === CONST.CHAT_TYPE.GROUP,
            IconComponent: ArrowLeftRight,
            name: "Reply Privately",
            onTrigger: QuotePrivatelyMessageHandler
        },
        {
            enabled: item.importantMessage,
            IconComponent: Star,
            name: "Remove Important",
            onTrigger: RemoveImportantMessageHandler
        },
        {
            enabled: !item.importantMessage,
            IconComponent: StarFill,
            name: "Add Important",
            onTrigger: AddImportantMessageHandler
        },
        {
            IconComponent: Diagram2,
            name: "View Threads",
            onTrigger: ShowThreadView
        },
        {
            IconComponent: InfoCircle,
            name: "Info",
            onTrigger: onClickInfo
        },
        {
            enabled: item.mediaType,
            IconComponent: Download,
            className: "text-info download",
            name: "Download",
            onTrigger: () => handleDownload(item.mediaUrl, item.fileName)
        },
        {
            enabled: item.sendBy === user.id,
            IconComponent: TrashFill,
            className: "text-danger",
            name: "Delete",
            onTrigger: onClickDeleteMsg
        },
    ], [item,
        AddImportantMessageHandler,
        AddToTaskHandler,
        ForwardMessage,
        QuoteMessageHandler,
        QuotePrivatelyMessageHandler,
        RemoveImportantMessageHandler,
        ShowThreadView,
        onClickDeleteMsg,
        onClickInfo,
        onEditMessageHandler,
        user.id]);

    return (
        <div className="dropdown message-dropdown cstm-search-dropdown d-flex">
            <button className="btn p-0 text-color" id={`message-dropdown-${item.id}`} data-bs-toggle="dropdown" onClick={(e) => e.stopPropagation()}>
                <ThreeDots size={user?.fontSize + 2} />
            </button>
            <ul className="dropdown-menu m-0" aria-labelledby={`message-dropdown-${item.id}`} style={{ fontSize: user?.fontSize }}>
                {options
                    .filter(i => !i.hasOwnProperty("enabled") || i.enabled)
                    .map((item, index) => {
                        const { IconComponent, onTrigger } = item;
                        return (
                            <li key={index} className={`dropdown-item d-flex align-items-center ${item.className}`} onClick={onTrigger}>
                                <IconComponent size={user?.fontSize} className="mr-2" />
                                <span>{item.name}</span>
                            </li>
                        )
                    })}
            </ul>
        </div>
    )
}
