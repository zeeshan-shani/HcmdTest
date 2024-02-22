import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { changeTask } from 'redux/actions/modelAction';
import { getResponseofThread, setThreadMessage } from 'redux/actions/chatAction';
import { Thread } from './Thread';
import { X } from 'react-bootstrap-icons';
import { getChatBackgroudClass, toastPromise } from 'redux/common';
import { CONST } from 'utils/constants';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import moment from 'moment-timezone';
import MessageComp from './MessageComp';
import { AudioContent } from 'Routes/Chat/Main/UserChat/message/Contents/AudioContent';
import { FileContent } from 'Routes/Chat/Main/UserChat/message/Contents/FileContent';
import { ImageVideoContent } from 'Routes/Chat/Main/UserChat/message/Contents/ImageVideoContent';
import { MessageContent } from 'Routes/Chat/Main/UserChat/message/Contents/MessageContent';
import { messageRef, pageScroll } from 'Routes/Chat/Main/UserChat/message/ChatMessages';

export default function ThreadMessage() {
    const { threadMessage } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.user);
    const [resMessages, setResMessages] = useState([]);
    const [parentMsg, setParentMsg] = useState([]);

    useEffect(() => {
        if (threadMessage) {
            (async () => {
                await toastPromise({
                    func: async (myResolve, myReject) => {
                        try {
                            const res = await getResponseofThread(threadMessage.id);
                            if (res?.status) setResMessages(res.data.rows);
                            myResolve(res);
                        } catch (error) { myReject("Error"); }
                    },
                    loading: "Requesting Threads...",
                    success: <b>Successfully Received Threads</b>,
                    error: <b>Could not received threads.</b>,
                    options: { id: "get-threads" }
                })
            })();
        }
        return () => {
            setResMessages([]);
            setParentMsg([]);
        }
    }, [threadMessage]);

    const onCloseHandler = () => {
        changeTask();
        setThreadMessage();
        setResMessages([]);
    }
    const onQuote = (item) => {
        dispatch({ type: CHAT_CONST.SET_QUOTE_MESSAGE, payload: item.id });
        onCloseHandler();
    }
    const getParentMessage = async (msg) => {
        const res = await getResponseofThread(msg.id, CONST.THREAD_TYPE.PARENT);
        if (res?.status && !!res.data.rows.length) setParentMsg(prev => [res.data.rows[0], ...prev.reverse()]);
    }

    const onClickTaskHandler = (task) => {
        if (messageRef[task.id] !== undefined) {
            changeTask();
            setThreadMessage();
            pageScroll(messageRef[task.id], { behavior: "smooth" });
            const classes = messageRef[task.id].current.className;
            messageRef[task.id].current.classList += " blink-quote-message ";
            setTimeout(() => {
                messageRef[task.id].current.classList = classes;
            }, 2000);
        } else {
            // console.error(task, " is not in the scope");
        }
    }

    const bgclass = getChatBackgroudClass(user?.chatWallpaper);
    return (
        <div className="tab-pane h-100 w-100 active" id="thradmessage" role="tabpanel" aria-labelledby="thread-tab">
            <div className="appnavbar-content-wrapper">
                <div className="appnavbar-scrollable-wrapper vertical-scrollable hide-scrollbar">
                    <div className="appnavbar-heading sticky-top">
                        <ul className="nav justify-content-between align-items-center">
                            <li className="text-center">
                                <h5 className="text-truncate mb-0">Message Threads</h5>
                            </li>
                            <li className="nav-item list-inline-item close-btn">
                                <button className='btn-outline-default btn-sm border-0' onClick={onCloseHandler}>
                                    <X size={20} />
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className={`appnavbar-body ${bgclass}`}>
                        {parentMsg.map((item, index) => (
                            <MessageComp key={index} parentMsg={item} bgclass={bgclass} onQuote={onQuote} onClickTaskHandler={onClickTaskHandler} getParentMessage={getParentMessage} />
                        ))}
                        {threadMessage &&
                            <div className={`appnavbar-body-title row m-0 ${bgclass}`}>
                                <div className="message-divider sticky-top" data-label={moment(threadMessage.createdAt).format('MM/DD/YY')} style={{ fontSize: user?.fontSize - 2 }}>&nbsp;</div>
                                <div className={`message ${threadMessage.sendBy === user.id ? 'self' : ''} w-100`}>
                                    <div className="message-wrapper">
                                        {!threadMessage?.mediaType &&
                                            <MessageContent DisableOpt={true} item={threadMessage} />}
                                        {(threadMessage.mediaType && (threadMessage.mediaType.split("/")[0] === "image" || threadMessage.mediaType.split("/")[0] === "video")) &&
                                            <ImageVideoContent item={threadMessage} DisableOpt={true} />}
                                        {(threadMessage.mediaType && (threadMessage.mediaType.split("/")[0] === "application" || threadMessage.mediaType.split("/")[0] === "text")) &&
                                            <FileContent item={threadMessage} DisableOpt={true} />}
                                        {threadMessage.mediaType && threadMessage.mediaType.split("/")[0] === "audio" &&
                                            <AudioContent item={threadMessage} DisableOpt={true} />}
                                    </div>
                                    {threadMessage.quotedMessageId && <div className="message-options thread text-color">
                                        {!parentMsg.length && <div className='show-thread-parent cursor-pointer message-text' onClick={() => getParentMessage(threadMessage)} style={{ fontSize: user?.fontSize }}>Show Previous</div>}
                                    </div>}
                                </div>
                            </div>}
                        {threadMessage &&
                            <div className={`appnavbar-body ${bgclass}`}>
                                <div className="mr-auto p-1 text-color">{`Replied Messages: ${resMessages.length}`}</div>
                                <div className="todo-container thread-container">
                                    {resMessages.map((item) => {
                                        return (
                                            <Thread
                                                key={item.id}
                                                item={item}
                                                onClickTaskHandler={onClickTaskHandler}
                                                onQuote={onQuote}
                                            />)
                                    })}
                                </div>
                            </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
