import React, { useState, useRef, useCallback, useMemo } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { dispatch } from 'redux/store';
import { CONST } from 'utils/constants';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { getChatBackgroudClass, getDateLabel, toastPromise } from 'redux/common';
import { getLengthFromLastMessage, getMessages2 } from 'redux/actions/chatAction';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { showError } from 'utils/package_config/toast';
import { Message } from 'Routes/Chat/Main/UserChat/message/Message';
import { BroadcastContent } from 'Routes/Chat/Main/UserChat/message/Contents/BroadcastContent';
import { isLoading, messageRef, pageScroll } from 'Routes/Chat/Main/UserChat/message/ChatMessages';
import { useDebounce } from 'react-use';

//ScrolltoOrigin
export let messageRefEx = [];
const defaultState = {
    offset: -CONST.GLOBAL_SEARCH_GET_LIMIT,
    isNextAvailable: false,
    AllReceived: true,
    // AllReceived: false,
    loading: false,
    total: 0,
    search: [],
    searchType: true,
}
export const SearchInfoBody = ({
    search = [],
    type = CONST.MSG_TYPE.ROUTINE,
    setInspectUser,
    SetUserChatState,
    isPrivateChat,
    searchType
}) => {
    const { user } = useSelector((state) => state.user);
    const { activeChat, messages, offset, totalCount, taggedSearch } = useSelector((state) => state.chat);
    const [searchMsgList, setSearchMsgList] = useState([]);
    const [state, setState] = useState(defaultState);
    const userData = activeChat.chatusers.find(item => item.userId === user.id);
    const isAdmin = userData?.isAdmin;
    const ContainerRef = useRef(null);
    const innerRef = useRef(null);
    const chatContentRef = useRef(null);

    const callNextGlobalMessages = useCallback(async () => {
        if (!search?.length) return setState(prev => ({ ...prev, loading: false, AllReceived: true }));
        let messageId;
        if (!!searchMsgList?.length) messageId = searchMsgList[searchMsgList.length - 1].id;
        const res = await getMessages2({ search, messageId, type, taggedSearch, filterMethod: searchType ? 'AND' : 'OR' });
        if (res?.status) {
            if ((res?.data?.rows?.length < CONST.GLOBAL_SEARCH_GET_LIMIT))
                setState(prev => ({ ...prev, isNextAvailable: false, AllReceived: true, total: res.data.count, loading: false, search }));
            else
                setState(prev => ({ ...prev, total: res.data.count, search }));
            setSearchMsgList(prev => ([...prev.concat(...res.data.rows)]));
        }
    }, [search, searchMsgList, type, searchType, taggedSearch]);

    useDebounce(() => {
        if (search?.length !== state?.search?.length && (type || searchType)) {
            setSearchMsgList([]);
            setState(prev => ({ ...prev, AllReceived: false, searchType, search }));
            callNextGlobalMessages();
        }
    }, 500, [search, type, searchType]);

    const ReqforQuotedMessage = useCallback(async (count, requestId) => {
        if (count > 100) {
            const data = await getMessages2({ messageId: requestId, pagitionFlow: "DOWN", includeMessage: true })
            if (data.status === 1) {
                dispatch({ type: CHAT_CONST.TOTAL_COUNT_DOWN, payload: data.data.count - CONST.MESSAGE_GET_LIMIT });
                dispatch({ type: CHAT_CONST.GET_MESSAGES_SUCCESS, payload: data });
            }
            return data;
        }
        else {
            let messageId;
            if (!!messages?.data?.rows?.length) messageId = messages.data.rows[messages.data.rows.length - 1].id;
            const res = (!isLoading) ? await getMessages2({ messageId, taggedSearch, pagitionFlow: "UP", limit: count + 5 }) : { status: -1 };
            if (res.status === 1) {
                dispatch({ type: CHAT_CONST.SET_OFFSET, payload: offset + count });
                if (res.data.count !== totalCount)
                    dispatch({ type: CHAT_CONST.SET_COUNT, payload: res.data.count });
                dispatch({ type: CHAT_CONST.APPEND_MESSAGES, payload: res });
                return res;
            }
        }
    }, [offset, totalCount, messages, taggedSearch]);

    const moveToOrigin = useCallback(async (task) => {
        try {
            if (messageRef[task.id] &&
                messageRef[task.id]?.current &&
                messageRef[task.id]?.current?.className &&
                messageRef[task.id]?.current?.classList
            ) {
                pageScroll(messageRef[task.id], { behavior: "smooth" });
                const classes = messageRef[task.id].current.className;
                messageRef[task.id].current.classList += " blink-quote-message ";
                setTimeout(() => messageRef[task.id].current.classList = classes, 2000);
                if (window.innerWidth < 1301)
                    SetUserChatState(prev => ({ ...prev, isSearchOpen: { ...prev.isSearchOpen, hide: true } }));
            } else {
                const currMsgId = messages.data.rows.pop()?.id;
                if (!currMsgId) return showError("Something went wrong.")
                await toastPromise({
                    func: async (myResolve, myReject) => {
                        try {
                            if (currMsgId > task.id) {
                                const res = await getLengthFromLastMessage({
                                    chatId: activeChat.id,
                                    rquestedMessageId: task.id,
                                    currentMessageId: currMsgId,
                                });
                                if (res.data) {
                                    const data = await ReqforQuotedMessage(res.data, task.id)
                                    if (data.status === 1) moveToOrigin({ id: task.id });
                                } else moveToOrigin({ id: task.id });
                            } else {
                                const data = await ReqforQuotedMessage(101, task.id)
                                if (data.status === 1) moveToOrigin({ id: task.id });
                            }
                            myResolve("OK");
                        } catch (error) {
                            myReject("Error");
                        }
                    },
                    loading: "Requesting for Message",
                    success: <b>Successfully get message</b>,
                    error: <b>Could not get message.</b>,
                    options: { id: "get-message" }
                })
            }
        } catch (error) {
            console.error(error);
        }
    }, [ReqforQuotedMessage, SetUserChatState, activeChat?.id, messages?.data]);


    const messageList = useMemo(() => searchMsgList.map((item) => ({
        ...item, createdTime: moment(item.createdAt).format("MM/DD/YYYY")
    })), [searchMsgList]);

    const groupMsgList = useMemo(() => !!messageList.length && _.groupBy(messageList, 'createdTime'), [messageList]);
    const newMsgGroupList = useMemo(() => Object.keys(groupMsgList).map((key) => ({ date: key, data: groupMsgList[key] })), [groupMsgList]);
    let counter = 0;
    // bg-chat-dark ${getChatBackgroudClass(user?.chatWallpaper)}
    return (
        <div className={`chat-content bg-chat-dark ${getChatBackgroudClass(user?.chatWallpaper)} h-100`} id="messageBody-scs" ref={chatContentRef}>
            {/* bg-${user.chatWallpaper} */}
            <div className="container px-0 h-100" ref={ContainerRef}>
                <div
                    id="scrollableDiv-sc"
                    className="d-flex overflow-scroll flex-column-reverse h-100 hide-scrollbar"
                    // style={{ height: chatBodyHeight }}
                    ref={innerRef}
                >
                    {/* <div ref={messagesEndRef}></div> */}
                    <InfiniteScroll
                        className="d-flex flex-column-reverse overflow-unset"
                        dataLength={messageList.length}
                        next={callNextGlobalMessages}
                        scrollThreshold="100px"
                        inverse={true}
                        pullDownToRefresh={false}
                        hasMore={!state.AllReceived}
                        loader={<Loader height={'80px'} />}
                        scrollableTarget="scrollableDiv-sc"
                    >
                        {!!newMsgGroupList.length &&
                            newMsgGroupList?.map((groupItem, index_1) => {
                                const dateLabel = getDateLabel(groupItem.date);
                                return (
                                    <div className="message-day px-1" id="messageDay" key={index_1} name={groupItem.date}>
                                        <div className="message-divider sticky-top my-1 p-1" data-label={dateLabel} style={{ fontSize: user?.fontSize - 2 }}>&nbsp;</div>
                                        <div className="d-flex flex-column-reverse">
                                            {groupItem.data.map((item, index_2) => {
                                                const broadcastContent = activeChat.type === CONST.CHAT_TYPE.GROUP && item.type === CONST.MSG_TYPE.CHAT_LOG.NAME;
                                                const index = counter;
                                                counter++;
                                                if (broadcastContent) {
                                                    return (<React.Fragment key={index_2}>
                                                        <BroadcastContent item={item} />
                                                    </React.Fragment>
                                                    )
                                                } else {
                                                    const isunread = false;
                                                    const prevMsg = messageList[index + 1];
                                                    return (
                                                        <div key={index_2} onClick={() => moveToOrigin(item)}>
                                                            <div className="content-visibility-auto" />
                                                            <Message
                                                                item={item}
                                                                ReadOnly={true}
                                                                isAdmin={isAdmin}
                                                                isUnread={isunread}
                                                                prevMsg={prevMsg}
                                                                SetUserChatState={SetUserChatState}
                                                                unreadMessageRef={null}
                                                                messageRef={messageRefEx}
                                                                setInspectUser={setInspectUser}
                                                                isPrivateChat={isPrivateChat}
                                                                searchKey={search}
                                                                moveToOrigin={moveToOrigin}
                                                                hideReactions
                                                            />
                                                        </div>
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
            </div>
        </div>);
}
