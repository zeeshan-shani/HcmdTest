import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment-timezone";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import { CONST } from "utils/constants";
import { readAllMessages } from "utils/wssConnection/Socket";
import { checkAudios, getLengthFromLastMessage, getMessages, getMessages2, moveChatandQMessage } from "redux/actions/chatAction";
import { Message } from './Message';
import { BroadcastContent } from "./Contents/BroadcastContent";
import { getChatBackgroudClass, getDateLabel, LazyComponent, toastPromise } from "redux/common";
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { ChevronDoubleDown, ChevronDown, ListNested } from "react-bootstrap-icons";
import TaskDetails from "Routes/TaskBoard/TaskDetails/TaskDetails";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { TASK_CONST } from "redux/constants/taskConstants";
import { dispatch } from "redux/store";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import BufferMessages from "Routes/Chat/Main/UserChat/message/BufferMessages";
import ErrorBoundary from "Components/ErrorBoundry";
import { useNavigate } from "react-router-dom";
import { useDebounce, useIntersection, useScroll } from "react-use";
import { MuiActionButton } from "Components/MuiDataGrid";
import Badge from "antd/lib/badge";
const PopupDataviewer = lazy(() => import("Routes/Chat/Main/UserChat/message/Contents/PopupDataViewer"));

export let isLoading = false;
export let messageRef = [];
export let isMsgLoaded = false;
export let onclickSearch = false;
let isUnreadAvailable = false;
let isRendered = false;
let isUnreadRendered = false;

export const ChatMessages = ({
    messagesEndRef,
    userChatState,
    SetUserChatState,
    isPrivateChat,
    setInspectUser,
    SetPopupData,
    popupData,
    ghostOn = false
}) => {
    const navigate = useNavigate();
    const { quoteMessage, messageStatus } = userChatState;
    const ContainerRef = useRef(null);
    const { user } = useSelector((state) => state.user);
    const { taskName, name } = useSelector((state) => state.model);
    const { taskDetails } = useSelector((state) => state.task);
    const {
        activeChat,
        chatList,
        offset,
        totalCount,
        cId,
        lId,
        messageAt,
        messages,
        messageReactions,
        taggedSearch,
    } = useSelector((state) => state.chat);
    const unreadMessageRef = useRef();
    const chatContentRef = useRef();
    const innerRef = useRef(null);
    const { y: scrollY } = useScroll(innerRef);
    const intersection = useIntersection(messagesEndRef, {
        root: null,
        rootMargin: '0px',
        threshold: 1
    });

    const messagesList = useMemo(() => messages.data.rows, [messages]);

    const [state, setState] = useState({
        childMessageId: null,
        bottomLoad: false,
    });
    const [disabled, setDisabled] = useState(false);
    const [chatBodyHeight, setChatBodyHeight] = useState(0);
    const userIndex = activeChat.chatusers.findIndex(item => item.userId === user.id);
    const isAdmin = activeChat?.chatusers[userIndex]?.isAdmin || false;

    useEffect(() => {
        window.addEventListener("resize", () => setChatBodyHeight(chatContentRef.current?.clientHeight));
        setChatBodyHeight(chatContentRef.current?.clientHeight);
    }, [activeChat.id, messageStatus, quoteMessage, chatContentRef.current?.clientHeight, messageReactions]);

    useEffect(() => {
        if (messagesList.length === totalCount) setDisabled(true);
        else if (messagesList.length < totalCount && disabled) setDisabled(false);
        // eslint-disable-next-line
    }, [messagesList, totalCount]);

    useEffect(() => {
        const setNewData = async () => {
            if (!isLoading) {
                isLoading = true;
                let messageId;
                if (!!activeChat?.messages?.length)
                    messageId = activeChat.messages[0].id
                await fetch({ messageId, includeMessage: true });
                isLoading = false;
                isMsgLoaded = true;
            }
            readAllMessages(activeChat.id, user.id);
        }
        setNewData();
        return () => {
            isLoading = false;
            messageRef = [];
            isMsgLoaded = false;
            onclickSearch = false;
            isUnreadAvailable = false;
            isRendered = false;
            isUnreadRendered = false;
        }
        // eslint-disable-next-line
    }, [activeChat.id]);

    const moveScroll = useCallback(() => {
        if (!isRendered && !isUnreadAvailable) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            isRendered = true;
        }
        if (!isUnreadRendered && isUnreadAvailable) {
            unreadMessageRef?.current?.scrollIntoView({ behavior: "auto" });
            isUnreadAvailable = false;
            isUnreadRendered = true;
        }
    }, [messagesEndRef]);

    // // SCROLL TO END OR UNREAD MESSAGE
    useEffect(() => {
        moveScroll();
        //eslint-disable-next-line
    }, [messagesList]);

    useEffect(() => {
        if (cId && lId && cId !== undefined) moveToOrigin({ id: cId }, lId);
        //eslint-disable-next-line
    }, [cId]);

    const fetch = useCallback(async ({ offset = 0, prevMsgList = [], forceOffset = null, messageId, down = false, includeMessage = false }) => {
        if (messageAt) return;
        const unreadCount = activeChat?.totalMessageCount;
        // const unreadCount = activeChat?.totalMessageCount > 100 ? 100 : activeChat?.totalMessageCount;
        dispatch({ type: CHAT_CONST.CLEAR_USER_NOTIFICATION, payload: { chatId: activeChat.id, userId: user.id } });
        if (unreadCount > CONST.MESSAGE_GET_LIMIT) {
            const res = await getMessages({ activeChat, offset: unreadCount, taggedSearch });
            if (res.status === 1) {
                dispatch({ type: CHAT_CONST.SET_OFFSET, payload: unreadCount - CONST.MESSAGE_GET_LIMIT });
                if (res.data.count !== totalCount)
                    dispatch({ type: CHAT_CONST.SET_COUNT, payload: res.data.count });
                dispatch({ type: CHAT_CONST.APPEND_MESSAGES, payload: res });
            }
            activeChat.totalMessageCount = 0;
        } else {
            const res =
                await getMessages2({ messageId, taggedSearch, pagitionFlow: down ? "DOWN" : "UP", includeMessage });
            // await getMessages({ activeChat, offset: forceOffset !== null ? forceOffset : messagesList.length, taggedSearch });
            if (res?.status === 1) {
                dispatch({ type: CHAT_CONST.SET_OFFSET, payload: offset });
                down && dispatch({ type: CHAT_CONST.TOTAL_COUNT_DOWN, payload: res.data.count - CONST.MESSAGE_GET_LIMIT });
                if (res.data.count !== totalCount)
                    dispatch({ type: CHAT_CONST.SET_COUNT, payload: res.data.count });
                dispatch({ type: CHAT_CONST.APPEND_MESSAGES, payload: res, down });
                // setTimeout(() => down && pageScroll(messageRef[messageId]), 500);
                setTimeout(() => down &&
                    innerRef.current.scrollTop < 50 &&
                    messageRef[messageId]?.current?.scrollIntoView(false), 200);
            }
        }
    }, [activeChat, messageAt, totalCount, user.id, taggedSearch]);

    const onClickNext = useCallback(async () => {
        if (!isLoading && !name) {
            isLoading = true;
            let messageId;
            if (!!messagesList.length)
                messageId = messagesList[0].id;
            await fetch({ messageId, down: true });
            isLoading = false;
        }
    }, [name, messagesList, fetch]); // fetch, messagesList,

    // const [, cancel] =
    useDebounce(async () => {
        if (intersection && intersection.intersectionRatio >= 1 && activeChat.totalCountDown > 0 && !state.bottomLoad) {
            setState(prev => ({ ...prev, bottomLoad: true }));
            await onClickNext();
            setState(prev => ({ ...prev, bottomLoad: false }));
        }
    }, 500, [intersection]);

    const scrollToBottom = useCallback(async () => {
        await getMessages2({ pagitionFlow: "UP" })
            .then(async (data) => {
                if (data.status === 1) dispatch({ type: CHAT_CONST.GET_MESSAGES_SUCCESS, payload: data });
                dispatch({ type: CHAT_CONST.TOTAL_COUNT_DOWN, payload: 0 });
            });
    }, []);

    const ReqforQuotedMessage = useCallback(async (count, requestId) => {
        if (count > 100) {
            await getMessages2({ messageId: requestId, pagitionFlow: "DOWN", includeMessage: true })
                .then(async (data) => {
                    if (data.status === 1) {
                        dispatch({ type: CHAT_CONST.TOTAL_COUNT_DOWN, payload: data.data.count - CONST.MESSAGE_GET_LIMIT });
                        ScrolltoOrigin({ id: requestId });
                        dispatch({ type: CHAT_CONST.GET_MESSAGES_SUCCESS, payload: data });
                    }
                });
        }
        else {
            let messageId;
            if (!!messagesList?.length) messageId = messagesList[messagesList.length - 1].id;
            const res =
                (!isLoading) ? await getMessages2({ messageId, taggedSearch, pagitionFlow: "UP", limit: count + 5 }) : { status: -1 };
            if (res.status === 1) {
                dispatch({ type: CHAT_CONST.SET_OFFSET, payload: offset + count });
                if (res.data.count !== totalCount) dispatch({ type: CHAT_CONST.SET_COUNT, payload: res.data.count });
                dispatch({ type: CHAT_CONST.APPEND_MESSAGES, payload: res });
                ScrolltoOrigin({ id: requestId });
                return res;
            }
        }
    }, [offset, totalCount, messagesList, taggedSearch]);

    const moveToOrigin = useCallback(async (qMessage, messageId) => {
        if (qMessage?.chatId === activeChat?.id) {
            if (messageRef[qMessage.id] !== undefined) {
                pageScroll(messageRef[qMessage.id], { behavior: "smooth" });
                const classes = messageRef[qMessage.id].current.className;
                messageRef[qMessage.id].current.classList += " blink-quote-message ";
                setState(prev => ({ ...prev, childMessageId: messageId }))
                setTimeout(() => {
                    if (messageRef[qMessage.id]) messageRef[qMessage.id].current.classList = classes;
                }, 2000);
            } else {
                await toastPromise({
                    func: async (myResolve, myReject) => {
                        try {
                            const res = await getLengthFromLastMessage({
                                chatId: qMessage?.chatId,
                                rquestedMessageId: qMessage.id,
                                currentMessageId: messageId,
                            });
                            if (res.data !== 0) {
                                await ReqforQuotedMessage(res.data, qMessage.id)
                                    .then(async (data) => {
                                        if (data?.status) {
                                            ScrolltoOrigin(qMessage);
                                            setState(prev => ({ ...prev, childMessageId: messageId }))
                                        }
                                    });
                            }
                            myResolve("OK");
                        } catch (error) {
                            myReject("Error");
                        }
                    },
                    loading: "Requesting for Quoted Message",
                    success: <b>Successfully get message</b>,
                    error: <b>Could not get message.</b>,
                    options: { id: "get-message" }
                })
            }
        } else {
            await moveChatandQMessage({ chatList, activeChat, user, qMessage, navigate });
        }
    }, [ReqforQuotedMessage, activeChat, chatList, user, navigate]);

    const checkIsUnread = useCallback((prevMsg, Msg) => {
        try {
            if (Msg && Msg.hasOwnProperty('messagerecipients')) {
                if (Msg.messagerecipients?.isRead === false) {
                    if ((prevMsg === undefined) || (!isUnreadAvailable && CONST.MSG_TYPE.CHAT_LOG.TYPES.includes(prevMsg.type))) {
                        isUnreadAvailable = true;
                        setTimeout(moveScroll, 500);
                        return true;
                    }
                    if (prevMsg.hasOwnProperty('messagerecipients')) {
                        if (prevMsg.messagerecipients.isRead === true) {
                            isUnreadAvailable = true;
                            setTimeout(moveScroll, 500);
                            return true;
                        }
                    }
                    if (!prevMsg.hasOwnProperty('messagerecipients')) {
                        isUnreadAvailable = true;
                        setTimeout(moveScroll, 500);
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error(error);
        }
    }, [moveScroll]);

    const onPopupView = useCallback((item) => {
        SetPopupData(item);
        SetUserChatState(prev => ({ ...prev, quoteMessage: item }))
    }, [SetPopupData, SetUserChatState]);

    const onCloseTaskDeatails = () => dispatch({ type: TASK_CONST.RES_GET_TASK_DETAILS, payload: null });

    const OnClickScrollDown = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const onClickDiv = useCallback(() => {
        if (messageStatus) SetUserChatState(prev => ({ ...prev, messageStatus: false }))
    }, [messageStatus, SetUserChatState]);

    const onNextLoad = useCallback(async () => {
        if (!isLoading && !name) {
            isLoading = true;
            let messageId;
            if (!!messagesList.length)
                messageId = messagesList[messagesList.length - 1].id;
            await fetch({ messageId });
            isLoading = false;
        }
    }, [fetch, messagesList, name]);

    const [newMsgGroupList, messagesIds, isTodayAvailable] = useMemo(() => {
        const messagesList = messages.data.rows;
        const groupMsgList = _.groupBy(messagesList, (item) => moment(item.createdAt).format("MM/DD/YYYY"));
        const newMsgGroupList = Object.entries(groupMsgList).map(([date, data]) => ({ date, data }));
        const messagesIds = messagesList.filter((i) => i.frontMsgId).map(i => i.frontMsgId);
        const isTodayAvailable = newMsgGroupList.some(i => moment(i.date).isSame(moment(), 'day'));
        return [newMsgGroupList, messagesIds, isTodayAvailable];
    }, [messages]);

    const isGroupAdmin = useMemo(() =>
        (activeChat.type === CONST.CHAT_TYPE.GROUP) ?
            activeChat?.chatusers?.find(usr => usr.userId === user.id)?.isAdmin : false
        , [activeChat, user.id]);

    let counter = 0;
    try {
        if (popupData) {
            return (
                <ErrorBoundary>
                    <LazyComponent>
                        <PopupDataviewer popupData={popupData} />
                    </LazyComponent>
                </ErrorBoundary>)
        }
        return (
            <div className={`chat-content bg-chat-dark ${getChatBackgroudClass(user?.chatWallpaper)}`} id="messageBody" ref={chatContentRef} onClick={onClickDiv}>
                {/* bg-${user.chatWallpaper} */}
                <div className="container px-0" ref={ContainerRef}>
                    <div
                        id="scrollableDiv"
                        className="d-flex overflow-scroll flex-column-reverse hide-scrollbar"
                        style={{ height: chatBodyHeight }}
                        ref={innerRef}
                        onLoad={checkAudios}
                    >
                        <div ref={messagesEndRef} className="mb-1">
                            {/* className="mb-1" */}
                            {state.bottomLoad ? <Loader height={'80px'} /> : <hr className="chat-messages" />}
                            {/* <Button size="sm" onClick={() => onClickNext()}>Press to load more</Button> */}
                        </div>
                        {!!userChatState?.bufferMessages.length &&
                            <div className="message-day px-1" id="messageDay" key={-9} name={moment().format('MM/DD/YY')}>
                                {!isTodayAvailable &&
                                    <div className="message-divider sticky-top my-1 p-1" data-label={getDateLabel(moment().format('MM/DD/YY'))} style={{ fontSize: user?.fontSize - 2 }}>&nbsp;</div>}
                                <BufferMessages messages={userChatState?.bufferMessages} SetUserChatState={SetUserChatState} messagesIds={messagesIds} />
                            </div>}
                        <InfiniteScroll
                            className="d-flex flex-column-reverse overflow-unset"
                            dataLength={messagesList.length}
                            next={onNextLoad}
                            scrollThreshold={`${chatBodyHeight}px`}
                            inverse={true}
                            pullDownToRefresh={false}
                            hasMore={!disabled}
                            loader={<Loader height={'80px'} />}
                            scrollableTarget="scrollableDiv"
                        >
                            {!!newMsgGroupList.length &&
                                newMsgGroupList?.map((groupItem, index_1) => {
                                    const dateLabel = getDateLabel(groupItem.date);
                                    return (
                                        <div className="message-day px-1" id="messageDay" key={index_1} name={groupItem.date}>
                                            <div className="message-divider sticky-top" data-label={dateLabel} style={{ fontSize: user?.fontSize - 2 }}>&nbsp;</div>
                                            <div className="d-flex flex-column-reverse">
                                                {groupItem.data.map((item, index_2) => {
                                                    const broadcastContent = activeChat.type === CONST.CHAT_TYPE.GROUP && item.type === CONST.MSG_TYPE.CHAT_LOG.NAME;
                                                    const index = counter;
                                                    counter++;
                                                    if (broadcastContent) {
                                                        return (<React.Fragment key={index_2}>
                                                            <BroadcastContent item={item} />
                                                        </React.Fragment>)
                                                    } else {
                                                        const isunread = checkIsUnread(messagesList[index + 1], messagesList[index], user.id);
                                                        const prevMsg = messagesList[index + 1];
                                                        return (<React.Fragment key={index_2}>
                                                            <div className="content-visibility-auto" />
                                                            <Message
                                                                item={item}
                                                                isUnread={isunread}
                                                                prevMsg={prevMsg}
                                                                SetUserChatState={SetUserChatState}
                                                                unreadMessageRef={unreadMessageRef}
                                                                moveToOrigin={moveToOrigin}
                                                                ReqforQuotedMessage={ReqforQuotedMessage}
                                                                setInspectUser={setInspectUser}
                                                                SetPopupData={SetPopupData}
                                                                messageRef={messageRef}
                                                                onPopupView={onPopupView}
                                                                isAdmin={isAdmin}
                                                                isPrivateChat={isPrivateChat}
                                                                ghostOn={ghostOn}
                                                                // searchKey={isSearchOpen?.search}
                                                                searchKey={null}
                                                                isGroupAdmin={isGroupAdmin}
                                                            />
                                                        </React.Fragment>
                                                        )
                                                    }
                                                })}
                                                <div className="message-container" style={{ contentVisibility: 'auto' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                        </InfiniteScroll>
                    </div>
                    <div className="scroll-bottom d-flex flex-column gap-5" style={{ zIndex: 9 }}>
                        {state.childMessageId &&
                            <MuiActionButton
                                size="small"
                                className="bg-chat-dark text-color"
                                onClick={() => ScrolltoOrigin({ id: state.childMessageId })}
                                Icon={ListNested}
                                tooltip="Recent Child"
                            />}
                        { }
                        {activeChat.totalCountDown > 100 ?
                            <Badge count={activeChat.newMessageCount > 9 ? '9+' : activeChat.newMessageCount} color="green">
                                <MuiActionButton
                                    size="small"
                                    className={"bg-chat-dark text-color"}
                                    Icon={ChevronDoubleDown}
                                    onClick={scrollToBottom}
                                    tooltip="Scroll to Bottom" />
                            </Badge> :
                            (scrollY < -200 &&
                                <MuiActionButton
                                    size="small"
                                    className="bg-chat-dark text-color"
                                    Icon={ChevronDown}
                                    onClick={OnClickScrollDown}
                                    tooltip="Scroll Down" />
                            )}
                    </div>
                </div>
                {(taskDetails && taskName !== CHAT_MODELS.TODO) && (<>
                    <TaskDetails onClose={() => onCloseTaskDeatails(activeChat.id)} task={taskDetails} />
                </>)
                }
            </div>);
    } catch (error) {
        console.error(error);
    }
}

export const pageScroll = (Ref, behavior = {}) => {
    Ref?.current?.scrollIntoView(behavior);
};

export const ScrolltoOrigin = async (qMessage, recursiveCount = 2000) => {
    try {
        if (messageRef[qMessage.id] &&
            messageRef[qMessage.id]?.current &&
            messageRef[qMessage.id]?.current?.className &&
            messageRef[qMessage.id]?.current?.classList
        ) {
            pageScroll(messageRef[qMessage.id], { behavior: "auto" });
            const classes = messageRef[qMessage.id]?.current?.className;
            messageRef[qMessage.id].current.classList += " blink-quote-message ";
            setTimeout(() => { if (messageRef[qMessage.id]?.current) messageRef[qMessage.id].current.classList = classes }, 3000);
        } else {
            setTimeout(() => (recursiveCount) && ScrolltoOrigin(qMessage, recursiveCount - 1), 500);
        }
    } catch (error) {
        console.error(error);
    }
}

export const setJustSearch = (val = false) => onclickSearch = val;