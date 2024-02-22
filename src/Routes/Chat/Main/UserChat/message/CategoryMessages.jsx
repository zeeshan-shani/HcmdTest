import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment-timezone";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import { CONST } from "utils/constants";
import { checkAudios } from "redux/actions/chatAction";
import { Message } from './Message'
import { generatePayload, getChatBackgroudClass, getDateLabel, LazyComponent } from "redux/common";
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { ChevronDown } from "react-bootstrap-icons";
import TaskDetails from "Routes/TaskBoard/TaskDetails/TaskDetails";
import { TASK_CONST } from "redux/constants/taskConstants";
import { dispatch } from "redux/store";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import ErrorBoundary from "Components/ErrorBoundry";
import categoryMessageService from "services/APIs/services/categoryMessageService";
import { MuiActionButton } from "Components/MuiDataGrid";
import { useScroll } from "react-use";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { SocketListener } from "utils/wssConnection/Socket";
const PopupDataviewer = lazy(() => import("Routes/Chat/Main/UserChat/message/Contents/PopupDataViewer"));

export let isLoading = false;
export let messageRef = [];
export let isMsgLoaded = false;
export let onclickSearch = false;
let isUnreadAvailable = false;
let isRendered = false;
let isUnreadRendered = false;

export const CategoryMessages = ({
    messagesEndRef,
    userChatState,
    SetUserChatState,
    setInspectUser,
    SetPopupData,
    popupData,
}) => {
    const { quoteMessage, messageStatus } = userChatState;
    const ContainerRef = useRef(null);
    const { user } = useSelector((state) => state.user);
    const { taskName, name } = useSelector((state) => state.model);
    const { taskDetails } = useSelector((state) => state.task);
    const { activeCategoryChat, messageReactions } = useSelector((state) => state.chat); // messages,
    const unreadMessageRef = useRef();
    const chatContentRef = useRef();
    const innerRef = useRef();
    const { y: scrollY } = useScroll(innerRef);

    const [state, setState] = useState({
        childMessageId: null,
        messages: { rows: [], count: 0 }
    });
    const { messages } = state;
    const totalCount = messages?.data?.count || 0;
    const messagesList = useMemo(() => messages?.rows, [messages]);

    const [disabled, setDisabled] = useState(false);
    const [chatBodyHeight, setChatBodyHeight] = useState(0);
    // const userIndex = activeChat.chatusers.findIndex(item => item.userId === user.id);
    // const isAdmin = activeChat?.chatusers[userIndex]?.isAdmin || false;

    useEffect(() => {
        window.addEventListener("resize", () => setChatBodyHeight(chatContentRef.current?.clientHeight));
        setChatBodyHeight(chatContentRef.current?.clientHeight);
    }, [activeCategoryChat?.id, messageStatus, quoteMessage, chatContentRef.current?.clientHeight, messageReactions]);

    useEffect(() => {
        if (messagesList?.length === totalCount) setDisabled(true);
        else if (messagesList?.length < totalCount && disabled) setDisabled(false);
        // eslint-disable-next-line
    }, [messagesList, totalCount]);

    useEffect(() => {
        const setNewData = async () => {
            if (!isLoading) {
                isLoading = true;
                await fetch(0, []);
                isLoading = false;
                isMsgLoaded = true;
            }
            // activeCategoryChat
            // readAllMessages(activeChat.id, user.id);
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
    }, [activeCategoryChat.id]);

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

    // useEffect(() => {
    //     if (cId && lId && cId !== undefined) moveToOrigin({ id: cId }, lId);
    //     //eslint-disable-next-line
    // }, [cId]);

    const fetch = useCallback(async () => {
        // if (messageAt) return;
        // const unreadCount = activeChat?.totalMessageCount;
        // const unreadCount = 0; // activeCategoryChat
        const payload = await generatePayload({
            rest: { categoryId: activeCategoryChat.id },
            options: {
                populate: ["mentionCategoryMessage"],
                pagination: true,
                limit: CONST.MESSAGE_GET_LIMIT,
                offset: messagesList.length,
                sort: [["message", "createdAt", "DESC"]]
            },
            isCount: true,
        })
        const data = await categoryMessageService.list({ payload });
        dispatch({ type: CHAT_CONST.CLEAR_CATEGORY_NOTIFICATION, payload: { categoryId: activeCategoryChat.id } });
        if (data?.status === 1) {
            setState(prev => ({
                ...prev, messages: {
                    rows: [...state.messages.rows.concat(...data.data.rows)],
                    count: data.data.count,
                }
            }))
            SocketListener("CATEGORY_MENTION_CHAT", (data) => {
                if (!Object.keys(data).length) return;
                let bodyData = { ...data.categoryChatInfo, categoryChats: [{ unreadMentionCount: data.unreadMentionCount }] }
                dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHAT_CATEGORYLIST_DATA, payload: [bodyData], initial: true });
                if (bodyData.id === activeCategoryChat.id && !!bodyData?.messageTaskCategories.length)
                    setState(prev => ({
                        ...prev,
                        messages: {
                            rows: [bodyData.messageTaskCategories[0]].concat(prev.messages.rows),
                            count: prev.messages.count + 1,
                        }
                    }))
            });
            // dispatch({ type: CHAT_CONST.SET_OFFSET, payload: offset });
            // dispatch({ type: CHAT_CONST.APPEND_MESSAGES, payload: data });
        }
    }, [activeCategoryChat, messagesList?.length, state?.messages?.rows]);

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
            await fetch();
            isLoading = false;
        }
    }, [fetch, name]);

    const [newMsgGroupList] = useMemo(() => {
        const groupMsgList = _.groupBy(messagesList, (item) => moment(item.message.createdAt).format("MM/DD/YYYY"));
        const newMsgGroupList = Object.entries(groupMsgList).map(([date, data]) => ({ date, data }));
        return [newMsgGroupList,]; //messagesIds, isTodayAvailable
    }, [messagesList]);

    // const isGroupAdmin = useMemo(() =>
    //     (activeChat.type === CONST.CHAT_TYPE.GROUP) ?
    //         activeChat?.chatusers?.find(usr => usr.userId === user.id)?.isAdmin : false
    //     , [activeChat, user.id]);

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
                        <div ref={messagesEndRef}></div>
                        {/* {!!userChatState?.bufferMessages.length &&
                            <div className="message-day px-1" id="messageDay" key={-9} name={moment().format('MM/DD/YY')}>
                                {!isTodayAvailable &&
                                    <div className="message-divider sticky-top my-1 p-1" data-label={getDateLabel(moment().format('MM/DD/YY'))} style={{ fontSize: user?.fontSize - 2 }}>&nbsp;</div>}
                                <BufferMessages messages={userChatState?.bufferMessages} SetUserChatState={SetUserChatState} messagesIds={messagesIds} />
                            </div>} */}
                        <InfiniteScroll
                            className="d-flex flex-column-reverse overflow-unset"
                            dataLength={messagesList?.length}
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
                                                    const index = counter;
                                                    counter++;
                                                    const prevMsg = messagesList[index + 1];
                                                    return (<React.Fragment key={index_2}>
                                                        <div className="content-visibility-auto" />
                                                        <Message
                                                            item={item.message}
                                                            prevMsg={prevMsg}
                                                            SetUserChatState={SetUserChatState}
                                                            unreadMessageRef={unreadMessageRef}
                                                            setInspectUser={setInspectUser}
                                                            SetPopupData={SetPopupData}
                                                            messageRef={messageRef}
                                                            onPopupView={onPopupView}
                                                            searchKey={null}
                                                            ReadOnly
                                                        />
                                                    </React.Fragment>
                                                    )
                                                })}
                                                <div className="message-container" style={{ contentVisibility: 'auto' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                        </InfiniteScroll>
                    </div>
                    <div className="scroll-bottom d-flex flex-column gap-5" style={{ zIndex: 9 }}>
                        {/* {state.childMessageId &&
                            <MuiActionButton
                                size="small"
                                className="bg-chat-dark text-color"
                                onClick={() => ScrolltoOrigin({ id: state.childMessageId })}
                                Icon={ListNested}
                                tooltip="Recent Child"
                            />} */}
                        {scrollY < -200 &&
                            <MuiActionButton
                                size="small"
                                className="bg-chat-dark text-color"
                                Icon={ChevronDown}
                                onClick={OnClickScrollDown}
                                tooltip="Scroll to Bottom" />}
                    </div>
                </div>
                {(taskDetails && taskName !== CHAT_MODELS.TODO) && (<>
                    <TaskDetails onClose={onCloseTaskDeatails} task={taskDetails} />
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
            setTimeout(() => {
                messageRef[qMessage.id].current.classList = classes;
            }, 3000);
        } else {
            setTimeout(() => {
                if (recursiveCount) ScrolltoOrigin(qMessage, recursiveCount - 1);
            }, 500);
        }
    } catch (error) {
        console.error(error);
    }
}

export const setJustSearch = (val = false) => onclickSearch = val;