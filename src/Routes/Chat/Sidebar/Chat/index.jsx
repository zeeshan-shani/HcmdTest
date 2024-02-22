import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from 'axios';
import moment from 'moment-timezone';
import InfiniteScroll from "react-infinite-scroll-component";
import { dispatch } from "redux/store";
import { useSelector } from "react-redux";
import { moveChatandQMessage, setActiveChat } from "redux/actions/chatAction";
import { CHAT_CONST, LOADER } from "redux/constants/chatConstants";
import { loadUserChatList } from 'redux/actions/chatAction';
import { compareDateTime } from "redux/reducers/chatReducer";

import { format_all, format_ccText, format_patient, generatePayload, textToShow } from "redux/common";
import { CONST } from "utils/constants";
import { ChatListLoader } from "Components/Loaders/Loaders";
import { GroupItemContent, PrivateItemContent } from "Routes/Chat/Sidebar/Chat/ItemContent";
import { getGhostAccess, getSuperAdminAccess } from "utils/permission";
import { CameraVideoFill, CardImage, FileEarmark, MicFill, StarFill } from "react-bootstrap-icons";
import { listenChatActivities } from "utils/wssConnection/Listeners/chatListener";
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { getPrivateChatUser } from "services/helper";
import { useNavigate } from "react-router-dom";
import chatService from "services/APIs/services/chatService";
import messageService from "services/APIs/services/messageService";
import { SearchMessageDropdown } from "./SearchMessageDropdown";
import { listenClockEvents } from "utils/wssConnection/Listeners/ClockListener";

let cancelTokenGetGlobalSearch;
const defaultchatlistState = {
    offset: 0,
    limit: CONST.CHAT_GET_LIMIT,
    isNextAvailable: false,
    AllReceived: false
}
const defaultState = {
    offset: 0,
    isNextAvailable: false,
    AllReceived: false,
    loadingMsg: false
}
export default function ChatsContentSidebarList({
    chats = true,
    newGlobal,
    setChatState,
    ghostOn = false,
    searchType,
    advanceSearch,
    chatSidebarState,
    setChatSidebarState
}) {
    const navigate = useNavigate();
    const { user, connected } = useSelector((state) => state.user);
    const { activeChat, chatList, chatListData, loaders, refreshChats, hiddenChats } = useSelector((state) => state.chat);
    const { filterUsers, viewUnread, ghostStateChanged } = chatSidebarState;

    const [state, setState] = useState({ ...defaultState, search: newGlobal, searchType });
    const [chatlistState, setChatlistState] = useState({ ...defaultchatlistState, search: newGlobal });
    const [totalChats, settotalChats] = useState(user?.chatList?.length || 0);
    const [totalMessages, settotalMessages] = useState(0);
    const innerChatsRef = useRef();
    const innermessagesRef = useRef();
    const isSA = useMemo(() => getSuperAdminAccess({ roleData: user?.roleData }), [user?.roleData]);

    const callNextGlobalMessages = useCallback(async () => {
        try {
            if (!newGlobal.length && !Object.keys(advanceSearch.data).length) return;
            let body = {};
            if (!!Object.keys(advanceSearch.data).length) {
                if (advanceSearch.data.chatData) {
                    body.chatId = advanceSearch.data.chatData.id;
                }
                if (advanceSearch.data.patient) {
                    // Use regular expression to match numbers enclosed in <@...> brackets
                    const regex = /<@(\d+)>/g;
                    const matches = [];
                    let match;
                    while ((match = regex.exec(advanceSearch.data.patient)) !== null) matches.push(match[1]);
                    body.patientId = matches;
                }
                if (advanceSearch.data.message) body.search = [...new Set(advanceSearch.data.message)];
                if (advanceSearch.data.date) body.date = advanceSearch.data.date;
                body.filterMethod = advanceSearch.data.searchType ? 'AND' : 'OR';
                body.subject = advanceSearch.data?.subject || undefined
            }
            // dispatch({ type: LOADER.CHATLIST_LOADER, payload: true });
            setState(prev => ({ ...prev, loadingMsg: true }));
            let payload = {
                limit: CONST.GLOBAL_SEARCH_GET_LIMIT,
                offset: state.offset,
                isCount: true,
                filterMethod: searchType ? 'AND' : 'OR',
                search: [...new Set(state.search)],
                ...body
            }
            // if (ghostOn) payload.ghostStatus = ghostOn;
            const data = await getDataMessages(payload);
            if (data?.status === 1) {
                dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHATLIST_DATA, payload: data?.data?.rows });
                settotalMessages(data.data.count);
                if ((data?.data?.rows?.length < CONST.GLOBAL_SEARCH_GET_LIMIT))
                    setState(prev => ({ ...prev, isNextAvailable: false, AllReceived: true, offset: prev.offset + data?.data?.rows?.length, loadingMsg: false }))
                else
                    setState(prev => ({ ...prev, isNextAvailable: true, AllReceived: false, offset: prev.offset + data?.data?.rows.length, loadingMsg: false }))
            } else if (data?.status === 0) setState(prev => ({ ...prev, isNextAvailable: false, AllReceived: true, loadingMsg: false }));
            setState(prev => ({ ...prev, loadingMsg: false }));
            // dispatch({ type: LOADER.CHATLIST_LOADER, payload: false });
        } catch (error) {
            console.error(error);
        }
    }, [searchType, state.offset, state.search, newGlobal.length, advanceSearch.data]);

    const callNextChatList = useCallback(async (args) => {
        try {
            if (!chats || !!Object.keys(advanceSearch.data).length) return;
            dispatch({ type: LOADER.CHATLIST_LOADER, payload: true });
            let payload = await generatePayload({
                options: {
                    pagination: true,
                    limit: chatlistState?.limit,
                    offset: args.hasOwnProperty('offset') ? args.offset : chatlistState.offset,
                    "populate": ["lastMessage", "chatUser"]
                },
                rest: {
                    // includeChatUserDetails: false,
                    filterMethod: 'AND',
                },
                isCount: true
            });
            if (user.hasOwnProperty('ghostUser') && user?.isGhostActive && !hiddenChats) payload.query.ghostStatus = true;
            else payload.query.hiddenChats = hiddenChats;
            // showMentionUnread flag is to display mention unread chats 
            // user.hasOwnProperty('ghostUser') && user?.isGhostActive
            if (user.hasOwnProperty('showMentionUnread') && user?.showMentionUnread) payload.query.atTheRateMentionMessage = true;
            if (newGlobal && !!newGlobal.length) payload.query.search = newGlobal;
            const data = await loadUserChatList(payload);
            if (data?.status === 1) {
                dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHAT_CHATLIST_DATA, payload: data.data.rows });
                settotalChats(data.data.count);
                if ((data?.data?.rows?.length < CONST.CHAT_GET_LIMIT && data?.data?.rows?.length <= totalChats))
                    setChatlistState(prev => ({ ...prev, isNextAvailable: false, AllReceived: true, offset: prev.offset + data?.data?.rows?.length }))
                else setChatlistState(prev => ({ ...prev, isNextAvailable: true, AllReceived: false, offset: prev.offset + data?.data?.rows?.length }))
            } else if (data?.status === 0) setChatlistState(prev => ({ ...prev, isNextAvailable: false, AllReceived: true }))
            dispatch({ type: LOADER.CHATLIST_LOADER, payload: false });
        } catch (error) {
            console.error(error);
        }
    }, [chatlistState?.limit, chatlistState.offset, chats, newGlobal, user, totalChats, hiddenChats, advanceSearch.data]);

    const resetData = useCallback(async () => {
        dispatch({ type: CHAT_CONST.CLEAR_CHAT_LIST_DATA, payload: [] });
        dispatch({ type: CHAT_CONST.RES_SEARCH_CHATLIST_DATA, payload: { data: { messages: [] } } });
        await callNextChatList({ offset: 0 });
        await callNextGlobalMessages();
        const payload = {
            "query": { "unreadMessageMention": true },
            "isCountOnly": true
        }
        const dataCount = await chatService.chatuserList({ payload });
        dispatch({ type: CHAT_CONST.SET_HIDDEN_NOTI_COUNT, payload: Number(dataCount.data) });
    }, [callNextChatList, callNextGlobalMessages]);

    useEffect(() => {
        if ((advanceSearch.data && !!Object.keys(advanceSearch.data).length) || user.hasOwnProperty("showMentionUnread"))
            resetData();
        //eslint-disable-next-line
    }, [advanceSearch?.data, user?.showMentionUnread]);

    useEffect(() => {
        if (chatlistState.offset !== 0 || loaders.chatList) return;
        resetData();
        setChatSidebarState(prev => ({ ...prev, ghostStateChanged: false }));
        //eslint-disable-next-line
    }, [state.search, state.searchType, chatlistState.offset, hiddenChats]);

    // trigger when user back online
    useEffect(() => {
        if (refreshChats && connected) {
            resetData();
            setChatSidebarState(prev => ({ ...prev, ghostStateChanged: false }));
            dispatch({ type: "RECONNECTED_REFRESH_CHATS", payload: false });
        }
    }, [refreshChats, connected, advanceSearch.data, resetData, setChatSidebarState]);

    useEffect(() => {
        if (ghostStateChanged && user.hasOwnProperty('isGhostActive')) {
            setState({ ...defaultState, search: newGlobal, searchType });
            setChatlistState(defaultchatlistState);
        }
    }, [ghostStateChanged, newGlobal, searchType, user]);

    useEffect(() => {
        // Listen Notification for another chat than ActiveChat
        listenChatActivities();
        listenClockEvents();
    }, [activeChat, user]);

    useEffect(() => {
        chatList?.sort(compareDateTime);
        dispatch({ type: CHAT_CONST.CLEAR_USER_NOTIFICATION, payload: { chatId: activeChat.id, userId: user.id } });
    }, [chatList, activeChat.id, user.id]);

    useEffect(() => {
        if (state.search === '' && !!chatListData?.messages?.length)
            dispatch({ type: CHAT_CONST.RES_SEARCH_CHATLIST_DATA, payload: { data: { messages: [] } } });
    }, [state.search, loaders.chatList, chatListData]);

    useEffect(() => {
        // if (!isArrayEquals(state.search, newGlobal)) {
        dispatch({ type: CHAT_CONST.RES_SEARCH_CHATLIST_DATA, payload: { data: { messages: [] } } });
        setState({ ...defaultState, search: newGlobal, searchType });
        setChatlistState({ ...defaultchatlistState });
        // }
        //eslint-disable-next-line
    }, [newGlobal, searchType, hiddenChats]);

    const onNextChatListLoad = useCallback(async () => {
        if (!ghostStateChanged) callNextChatList({ offset: chatList.length });
    }, [callNextChatList, chatList.length, ghostStateChanged]);

    const onNextChatListMessagesLoad = useCallback(async () => callNextGlobalMessages(), [callNextGlobalMessages]);

    try {
        const onClickMessage = (item) => moveChatandQMessage({ chatList, activeChat, user, qMessage: item, navigate });

        return (<>
            <ul className="contacts-list bg__chat-f-dark text-color hide-scrollbar pl-0" id="chatContactTab">
                {loaders.chatList && !chatList.length && <ChatListLoader />}
                {(chats && (advanceSearch.data && !Object.keys(advanceSearch.data).length)) &&
                    <div
                        id="scrollableDiv-chatlist"
                        className="d-flex overflow-scroll flex-column hide-horizonal-scroll"
                        style={{ height: 'auto', maxHeight: '100%' }}
                        ref={innerChatsRef}
                    >
                        <InfiniteScroll
                            className="d-flex flex-column overflow-unset"
                            dataLength={chatList.length}
                            next={onNextChatListLoad}
                            scrollThreshold={`200px`}
                            pullDownToRefresh={false}
                            hasMore={totalChats > chatList.length}
                            loader={<ChatListLoader />}
                            scrollableTarget="scrollableDiv-chatlist"
                        >
                            {chatList?.map((item) => {
                                if (filterUsers === item.type || filterUsers === CONST.CHAT_TYPE.ALL_CHATS) {
                                    if (item.type === CONST.CHAT_TYPE.GROUP) {
                                        const name = item.name;
                                        const ghostOn = (getGhostAccess(user) && !item?.users?.includes(user.id));
                                        const image = ghostOn ? CONST.GHOST_IMAGE : item.image;
                                        const myChatDetails = item.chatusers?.find(x => x.userId === user?.id);
                                        const totalUnread = myChatDetails?.routineUnreadMessageCount + myChatDetails?.emergencyUnreadMessageCount + myChatDetails?.urgentUnreadMessageCount + myChatDetails?.hasMentionMessageCount + myChatDetails?.hasPatientMentionCount;
                                        if (viewUnread && !(totalUnread > 0) && (viewUnread && activeChat.id !== item.id)) return null;
                                        return (
                                            <li className={`contacts-item ${(item.id === activeChat?.id) ? 'active' : ''} ${totalUnread > 0 ? 'unread' : ''}`} key={item.id}>
                                                <div className="contacts-link" onClick={() => setUserHandler({ chat: item, activeChatId: activeChat?.id, userId: user.id, navigate })}>
                                                    <GroupItemContent name={name} image={image} item={item} myChatDetails={myChatDetails} />
                                                </div>
                                            </li>
                                        );
                                    }
                                    else {
                                        const privUser = item.chatusers.find(x => x.userId !== user.id && !x?.isGhostChat)?.user || ((item.users[0] === item.users[1]) ? item.chatusers[0].user : null);
                                        const name = privUser?.name ? (privUser.id === user.id ? `${privUser?.name} (You)` : privUser?.name) : 'Unknown User';
                                        const ghostOn = (getGhostAccess(user) && !item?.users?.includes(user.id));
                                        const profilePicture = ghostOn ? CONST.GHOST_IMAGE : (privUser?.profilePicture ? privUser?.profilePicture : CONST.DEFAULT_USER_IMAGE);
                                        const profileStatus = privUser?.profileStatus ? privUser?.profileStatus : CONST.PROFILE.OFFLINE;
                                        const myChatDetails = item.chatusers?.find(x => x.userId === user.id);
                                        const totalUnread = myChatDetails?.routineUnreadMessageCount + myChatDetails?.emergencyUnreadMessageCount + myChatDetails?.urgentUnreadMessageCount + myChatDetails?.hasMentionMessageCount + myChatDetails?.hasPatientMentionCount;
                                        if (viewUnread && !(totalUnread > 0) && (viewUnread && activeChat.id !== item.id)) return null;
                                        return (
                                            <li className={`contacts-item ${(item.id === activeChat?.id) ? 'active' : ''} ${totalUnread > 0 ? 'unread' : ''}`} key={item.id}>
                                                <div className="contacts-link" onClick={() => setUserHandler({ chat: item, activeChatId: activeChat?.id, userId: user.id, navigate })}>
                                                    <PrivateItemContent isSA={isSA} name={name} profilePicture={profilePicture} profileStatus={profileStatus} item={item} myChatDetails={myChatDetails} />
                                                </div>
                                            </li>
                                        );
                                    }
                                }
                                return null;
                            })}
                        </InfiniteScroll>
                    </div>}
                {((newGlobal && !!newGlobal.length) || (advanceSearch.data && !!Object.keys(advanceSearch.data).length)) && <>
                    <div className="divider">
                        <span className="light-text-70 mx-1">MESSAGES</span>
                    </div>
                    <div
                        id="scrollableDiv-chatlist-messages"
                        className="d-flex overflow-scroll flex-column"
                        style={{ height: 'auto', maxHeight: '100%' }}
                        ref={innermessagesRef}
                    >
                        <InfiniteScroll
                            className="d-flex flex-column overflow-unset"
                            dataLength={chatListData.messages.length}
                            next={onNextChatListMessagesLoad}
                            scrollThreshold={`100px`}
                            pullDownToRefresh={false}
                            hasMore={totalMessages > chatListData?.messages?.length}
                            loader={<ChatListLoader />}
                            scrollableTarget="scrollableDiv-chatlist-messages"
                        >
                            {!!chatListData?.messages?.length ?
                                chatListData.messages.map((item) => {
                                    if (item.chatDetails.type === CONST.CHAT_TYPE.GROUP) {
                                        const { name } = item.chatDetails;
                                        const chatData = chatList.find(chat => chat.id === item.chatId);
                                        return (
                                            <li className="contacts-item" key={item.id + '-m'}>
                                                <div className="contacts-link p-1 pt-3 position-relative">
                                                    <div className="contacts-content px-1">
                                                        <div className="contacts-info">
                                                            <h6 className="chat-name text-truncate username-text mb-0">{name}</h6>
                                                            <div className="chat-time message light-text-70">{moment(item.createdAt).format("MM/DD/YY hh:mm A")}</div>
                                                        </div>
                                                        <div className="contacts-texts text-truncate">
                                                            <h6 className="text-color in-one-line mb-0" dangerouslySetInnerHTML={{ __html: textToShow(`${item?.sendByDetail?.name}: `, newGlobal) }}></h6>
                                                        </div>
                                                        <div className="contacts-texts justify-content-start" onClick={() => { onClickMessage(item) }}>
                                                            {!item?.isDeleted ? <ResultMessage item={item} searchText={newGlobal} /> : <p className='font-weight-normal deleted-message text-color mb-0' style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.DELETE}</p>}
                                                        </div>
                                                    </div>
                                                    {!item?.isDeleted && <SearchMessageDropdown item={item} setChatState={setChatState} chatData={chatData} activeChatId={activeChat?.id} />}
                                                </div>
                                            </li>);
                                    }
                                    else {
                                        const { name } = getPrivateChatUser(item.chatDetails);
                                        const chatData = chatList.find(chat => chat.id === item.chatId);
                                        return (
                                            <li className="contacts-item" key={item.id + '-m'}>
                                                <div className="contacts-link p-1 pt-3 position-relative">
                                                    <div className="contacts-content px-1">
                                                        <div className="contacts-info">
                                                            <h6 className="chat-name text-truncate username-text mb-0">{name}</h6>
                                                            <div className="chat-time message light-text-70">{moment(item.createdAt).format("MM/DD/YY hh:mm A")}</div>
                                                        </div>
                                                        <div className="contacts-texts justify-content-start" onClick={() => { onClickMessage(item) }}>
                                                            {!item?.isDeleted ? <ResultMessage item={item} searchText={newGlobal} /> : <p className='font-weight-normal deleted-message text-color mb-0' style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.DELETE}</p>}
                                                        </div>
                                                    </div>
                                                    {!item?.isDeleted && <SearchMessageDropdown item={item} setChatState={setChatState} chatData={chatData} activeChatId={activeChat?.id} />}
                                                </div>
                                            </li>)
                                    }
                                })
                                :
                                <li className="contacts-item">
                                    <div className="contacts-link p-1">
                                        <div className="contacts-content">
                                            <div className="contacts-texts justify-content-center word-break">
                                                {state.loadingMsg ?
                                                    <Loader height={'80px'} />
                                                    : (!!newGlobal.length) ? `No matches found for "${newGlobal.join(',')}"` :
                                                        "No Results Found"}
                                            </div>
                                        </div>
                                    </div>
                                </li>}
                        </InfiniteScroll>
                    </div>
                </>}
            </ul>
        </>)
    } catch (error) {
        console.error(error);
    }
}

export const ResultMessage = ({ item, searchText }) => {
    const { user } = useSelector(state => state.user);
    // const subjectText = item?.subject && format_all(textToShow(item.subject, searchText));
    const subjectText = item?.subject && textToShow(format_all(item.subject), searchText);
    // const patientText = item?.patient && format_patient(textToShow(item.patient, searchText, true));
    const patientText = item?.patient && textToShow(format_patient(item.patient), searchText);
    // const ccText = item?.ccText && format_ccText(textToShow(item.ccText, searchText, true));
    const ccText = item?.ccText && textToShow(format_ccText(item.ccText), searchText);
    const msgText = textToShow(format_all(item.message), searchText);
    return (
        <div>
            {subjectText &&
                <div className='d-flex message-text'>
                    <p className='message-subject mb-0' dangerouslySetInnerHTML={{
                        __html:
                            "<b className='font-weight-bold mr-1'>Subject: </b>" + subjectText
                    }}>
                    </p>
                </div>}
            {patientText &&
                <div className='d-flex message-text'>
                    <p className='message-patient mb-0' dangerouslySetInnerHTML={{
                        __html:
                            "<b sclassName='font-weight-bold mr-1'>Patient: </b>" + patientText
                    }}>
                    </p>
                </div>}
            {ccText &&
                <div className='d-flex message-patient text-color'>
                    <p className='mb-0' dangerouslySetInnerHTML={{
                        __html:
                            "<b className='font-weight-bold mr-1'>CC: </b>" + ccText
                    }}>
                    </p>
                </div >}
            {msgText &&
                <div className='d-flex message-text white-space-preline'>
                    <p className="mb-0" dangerouslySetInnerHTML={{
                        __html:
                            `<b className='font-weight-bold mr-1'>${!item.isMessage ? 'Task: ' : 'Message: '}</b>` + msgText
                    }}>
                    </p>
                </div>}
            {item.fileName &&
                <div className='d-flex message-text'>
                    <p className="mb-0" dangerouslySetInnerHTML={{
                        __html:
                            `<b className='font-weight-bold mr-1'>File: </b>` + textToShow(item.fileName, searchText)
                    }}>
                    </p>
                </div>}
            <div className='message-footer d-flex align-items-center justify-content-between'>
                <div className="message-date text-capitalize message-info message-text d-flex" style={{ fontSize: user?.fontSize }}>
                    {!item.isDeleted && <>
                        {item?.importantMessage &&
                            <p className="message-star-icon mb-0" style={{ fontSize: user?.fontSize }}><StarFill /></p>}
                        {item?.isEdited &&
                            <p className="message-status font-italic mx-1 mb-0" style={{ fontSize: user?.fontSize }}>Edited</p>}
                    </>}
                </div>
            </div>
        </div>
    )
}
// 
export const setUserHandler = ({ chat, activeChatId, userId, messageAt = 0, navigate }) => {
    if (chat && chat.id !== activeChatId) {
        let name, image;
        if (chat.type === CONST.CHAT_TYPE.GROUP) {
            name = chat?.name ? chat?.name : 'Unknown Group';
            image = chat?.image;
        } else {
            const privUser = chat?.chatusers?.find(x => x.userId !== userId)?.user;
            name = privUser?.name ? privUser?.name : 'Unknown User';
            image = privUser?.image ? privUser?.image : CONST.DEFAULT_USER_IMAGE;
        }
        const meUser = chat?.chatusers?.find((chat) => chat.userId === userId);
        const unreadCount = meUser?.emergencyUnreadMessageCount + meUser?.routineUnreadMessageCount + meUser?.urgentUnreadMessageCount;
        const obj = { ...chat, name, image, totalMessageCount: unreadCount };
        navigate(`/chats/chat/${chat.id}`);
        setActiveChat(obj, messageAt);
    }
};

export const getMediaSVG = (type, size = 18) => {
    switch (type) {
        case CONST.MEDIA_TYPE.IMAGE: return <CardImage size={size} />;
        case CONST.MEDIA_TYPE.VIDEO: return <CameraVideoFill size={size} />;
        case CONST.MEDIA_TYPE.AUDIO: return <MicFill size={size} />;
        default: return <FileEarmark size={size} />;
    }
}

export const getTimeLabel = (DateTime) => {
    if (moment(new Date()).format("MM/DD/YY") === moment(DateTime).format("MM/DD/YY"))
        return `${(moment(DateTime).format("hh:mm A"))}`;
    else return moment(DateTime).format("MM/DD/YY");
}

export const getDataMessages = async (payload) => {
    if (cancelTokenGetGlobalSearch) cancelTokenGetGlobalSearch.cancel("Operation cancel due to new request.");
    cancelTokenGetGlobalSearch = axios.CancelToken.source();
    const config = { cancelToken: cancelTokenGetGlobalSearch.token };
    const data = await messageService.getGlobalMessages({ payload, config });
    return data;
};