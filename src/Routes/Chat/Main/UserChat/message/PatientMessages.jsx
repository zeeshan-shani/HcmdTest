import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment-timezone";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import { checkAudios } from "redux/actions/chatAction";
import { Message } from './Message'
import { generatePayload, getChatBackgroudClass, getDateLabel, LazyComponent } from "redux/common";
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { ChevronDown } from "react-bootstrap-icons";
import { TASK_CONST } from "redux/constants/taskConstants";
import { dispatch } from "redux/store";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import { MuiActionButton } from "Components/MuiDataGrid";
import { useScroll } from "react-use";
import { CHAT_CONST } from "redux/constants/chatConstants";
import ErrorBoundary from "Components/ErrorBoundry";
import TaskDetails from "Routes/TaskBoard/TaskDetails/TaskDetails";
import mentionUserService from "services/APIs/services/mentionUserService";
import { SocketListener } from "utils/wssConnection/Socket";
import patientService from "services/APIs/services/patientService";
import { CONST } from "utils/constants";
const PopupDataviewer = lazy(() => import("Routes/Chat/Main/UserChat/message/Contents/PopupDataViewer"));

export let isLoading = false;
export let messageRef = [];
export let isMsgLoaded = false;
export let onclickSearch = false;
let isUnreadAvailable = false;
let isRendered = false;
let isUnreadRendered = false;

export const PatientMessages = ({
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
    const { activePatientChat, messageReactions } = useSelector((state) => state.chat); // messages,
    const unreadMessageRef = useRef();
    const chatContentRef = useRef();
    const innerRef = useRef();
    const { y: scrollY } = useScroll(innerRef);

    const [state, setState] = useState({
        childMessageId: null,
        messages: { rows: [], count: 0 }
    });
    const { messages } = state;
    const { messagesList, totalCount } = useMemo(() => ({ messagesList: messages?.rows, totalCount: messages?.count || 0 }), [messages]);
    const [disabled, setDisabled] = useState(false);
    const [chatBodyHeight, setChatBodyHeight] = useState(0);

    useEffect(() => {
        window.addEventListener("resize", () => setChatBodyHeight(chatContentRef.current?.clientHeight));
        setChatBodyHeight(chatContentRef.current?.clientHeight);
    }, [activePatientChat?.id, messageStatus, quoteMessage, chatContentRef.current?.clientHeight, messageReactions]);

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
            // activePatientChat
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
            patientService.markAsRead({
                payload: {
                    patientId: activePatientChat.id,
                    userId: user.id,
                }
            });
        }
        // eslint-disable-next-line
    }, [activePatientChat.id]);

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
        const payload = await generatePayload({
            rest: { patientId: activePatientChat.id },
            options: {
                populate: ["mentionUserMessage"],
                pagination: true,
                limit: CONST.MESSAGE_GET_LIMIT,
                offset: messagesList.length,
                sort: [["createdAt", "DESC"]],
            },
            isCount: true,
        });
        dispatch({ type: CHAT_CONST.CLEAR_PATIENT_NOTIFICATION, payload: { patientId: activePatientChat.id } });
        const data = await mentionUserService.list({ payload });
        if (data?.status === 1) {
            setState(prev => ({
                ...prev, messages: {
                    rows: prev.messages.rows.concat(...data.data.rows),
                    count: data.data.count,
                }
            }))
            SocketListener("PATIENT_MENTION_CHAT", (data) => {
                dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHAT_PATIENTLIST_DATA, payload: [data], initial: true });
                if (data.id === activePatientChat.id && !!data.mentionusers.length)
                    setState(prev => ({
                        ...prev, messages: {
                            rows: [data.mentionusers[0]].concat(prev.messages.rows),
                            count: prev.messages.count + 1,
                        }
                    }))
            });
        }
    }, [activePatientChat, messagesList?.length]);

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
        // const messagesIds = messagesList?.filter((i) => i.frontMsgId).map(i => i.frontMsgId);
        // const isTodayAvailable = newMsgGroupList.some(i => moment(i.date).isSame(moment(), 'day'));
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
                        id="scrollableDiv-patient"
                        className="d-flex overflow-scroll flex-column-reverse hide-scrollbar"
                        style={{ height: chatBodyHeight }}
                        ref={innerRef}
                        onLoad={checkAudios}
                    >
                        <div ref={messagesEndRef}></div>
                        <InfiniteScroll
                            className="d-flex flex-column-reverse overflow-unset"
                            dataLength={messagesList?.length}
                            next={onNextLoad}
                            scrollThreshold={`${chatBodyHeight}px`}
                            inverse={true}
                            pullDownToRefresh={false}
                            hasMore={!disabled}
                            loader={<Loader height={'80px'} />}
                            scrollableTarget="scrollableDiv-patient"
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
                                                        // ReadOnly
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