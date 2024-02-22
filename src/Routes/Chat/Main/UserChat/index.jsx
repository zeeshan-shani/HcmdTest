import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { CHAT_CONST } from 'redux/constants/chatConstants';

import 'Routes/Chat/Main/UserChat/footer/css/TaskMenu.css';
import { ChatMessages } from 'Routes/Chat/Main/UserChat/message/ChatMessages';
import { ChatFooter } from 'Routes/Chat/Main/UserChat/footer/ChatFooter';
import { GroupChatInfo } from 'Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo';
import { PrivateChatInfo } from 'Routes/Chat/Main/UserChat/info/private-chat-info/PrivateChatInfo';
import ChatHeader from 'Routes/Chat/Main/UserChat/header/ChatHeader';
import { useMediaQuery, useTheme } from '@mui/material';
import { OnPasteDialogue } from 'Routes/Chat/Main/UserChat/OnPasteDialogue';
import { changeModel, onSetPasteFiles, pastedFiles } from 'redux/actions/modelAction';
import { filterChatUsers, LazyComponent, updateState } from 'redux/common';
import { ChatSearch } from 'Routes/Chat/Main/UserChat/Search/ChatSearch';
import { getChatUsers, getMediaFiles } from 'redux/actions/chatAction';
import { dispatch } from 'redux/store';
import { CHAT_MODELS } from 'Routes/Chat/Models/models';
import { CONST } from 'utils/constants';
import { getGhostAccess } from 'utils/permission';
import ErrorBoundary from 'Components/ErrorBoundry';
import { listenTaskActivities } from 'utils/wssConnection/Listeners/Tasklistener';
import OnlyAdminFooter from './footer/OnlyAdminFooter';
import { showError } from 'utils/package_config/toast';
import { PatientMessages } from './message/PatientMessages';
import { CategoryMessages } from './message/CategoryMessages';
import { sendMessage } from 'utils/wssConnection/Socket';
const PopupMedia = lazy(() => import('Routes/Chat/Main/UserChat/PopupMedia'));

export const defaultUserState = ({ taggedSearch }) => ({
    chatInfoVisible: false,
    isSearchOpen: {
        search: '',
        type: '',
        isOpen: Boolean(taggedSearch),
        hide: false,
        searchType: true
    },
    messagesList: [],
    customMessage: null,
    quoteMessage: null,
    editMessage: null,
    messageStatus: false,
    bufferMessages: [],
})

export default function UserChat({ chatState }) {
    const { user } = useSelector((state) => state.user);
    const { activeChat, activePatientChat, activeCategoryChat, messages, quoteFileId, popupFileId, taggedSearch } = useSelector((state) => state.chat);
    const [userChatState, SetUserChatState] = useState(defaultUserState({ taggedSearch }));
    const [pasteDiag, SetPasteDiag] = useState(false);
    const [popupData, SetPopupData] = useState(false);
    const [newpastedFiles, SetPastedFiles] = useState([]);
    const messagesEndRef = useRef();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (!!userChatState.bufferMessages.length) {
            const messagesIds = messages?.data?.rows?.filter((i) => i.frontMsgId).map(i => i.frontMsgId);
            SetUserChatState((prev) => ({
                ...prev, bufferMessages: prev.bufferMessages.filter((item) => !messagesIds.includes(item.id))
            }))
        }
        //eslint-disable-next-line
    }, [messages]);

    useEffect(() => {
        if (chatState?.quoteMessage) updateState(SetUserChatState, { quoteMessage: chatState.quoteMessage })
        if (chatState?.editMessage) updateState(SetUserChatState, { editMessage: chatState.editMessage })
    }, [chatState]);

    useEffect(() => {
        if (activeChat?.quoteMessage) updateState(SetUserChatState, { quoteMessage: activeChat?.quoteMessage });
    }, [activeChat?.quoteMessage]);

    useEffect(() => {
        if (quoteFileId) {
            const quoteFile = messages?.data?.rows?.find(item => item.id === quoteFileId)
            quoteFile && updateState(SetUserChatState, { quoteMessage: quoteFile });
            dispatch({ type: CHAT_CONST.SET_QUOTE_MESSAGE, payload: null });
        }
        if (popupFileId) {
            const popupFile = messages?.data?.rows?.find(item => item.id === popupFileId)
            popupFile && SetPopupData(popupFile);
            dispatch({ type: CHAT_CONST.SET_POPUP_FILE, payload: null });
        }
        //eslint-disable-next-line
    }, [quoteFileId, popupFileId]);

    useEffect(() => {
        if (activeChat || activeChat.id === 0)
            listenTaskActivities(activeChat.id);
        if (activeChat && activeChat?.id !== -1) {
            const getChatUsersData = async () => {
                if (activeChat.id) {
                    const res = await getChatUsers(activeChat.id);
                    if (res?.status) dispatch({ type: CHAT_CONST.SET_CHAT_USERS_LIST, payload: filterChatUsers(res?.data) });
                }
            }
            getChatUsersData();
            getMediaFiles(activeChat.id, 'media', '');
        }
        return () => {
            SetUserChatState(defaultUserState({ taggedSearch: false }));
            dispatch({ type: CHAT_CONST.SET_OFFSET, payload: 0 });
            dispatch({ type: CHAT_CONST.GET_MESSAGES_SUCCESS, payload: { data: { count: 0, rows: [] } } });
            SetPopupData(false);
        }
        // eslint-disable-next-line
    }, [activeChat?.id]);

    // history was here (back button)
    const OnPasteEvent = useCallback(e => {
        if (!!e.clipboardData.files.length) {
            onSetPasteFiles(e.clipboardData.files);
            SetPasteDiag(true)
        } else {
            // ('No data found in clipboard');
        }
    }, []);

    const onPasteToMessage = useCallback(() => {
        changeModel(CHAT_MODELS.DROP_ZONE);
        SetPasteDiag(false);
    }, []);

    const onPasteToTask = useCallback(() => {
        SetPasteDiag(false);
        SetPastedFiles(pastedFiles);
    }, []);

    const setInspectUser = useCallback((puserId) => {
        const privateUser = activeChat?.chatusers?.find((item) => item.userId === puserId)?.user;
        privateUser ?
            dispatch({ type: CHAT_CONST.SET_INSPECT_USER, payload: privateUser }) :
            showError("User is not available");
    }, [activeChat?.chatusers]);

    const ghostOn = useMemo(() => (getGhostAccess(user) && !activeChat?.users?.includes(user.id)), [activeChat?.users, user]);
    const isPrivateChat = useMemo(() => activeChat.type === CONST.CHAT_TYPE.PRIVATE, [activeChat.type]);

    const allowSendMessages = useMemo(() => {
        const userData = activeChat.chatusers?.find(item => item.userId === user.id);
        //!activeChat.hasOwnProperty("allowSendMessage") ||
        if (!userData?.isAdmin && activeChat?.allowOnlyAdminMessage) return false;
        return true;
    }, [activeChat.allowOnlyAdminMessage, activeChat.chatusers, user.id]);

    const onSendMessage = useCallback((data) => {
        sendMessage(data);
    }, []);

    try {
        return (
            <div className="chats">
                <ErrorBoundary>
                    <div className="chat-body" onPaste={OnPasteEvent}>
                        <ChatHeader
                            isSearchOpen={userChatState.isSearchOpen}
                            SetUserChatState={SetUserChatState} />
                        {activePatientChat &&
                            <PatientMessages
                                key={activePatientChat?.id}
                                SetPopupData={SetPopupData}
                                messagesEndRef={messagesEndRef}
                                messagesList={messages?.data?.rows}
                                userChatState={userChatState}
                                SetUserChatState={SetUserChatState}
                                setInspectUser={setInspectUser}
                            />}
                        {activeCategoryChat &&
                            <CategoryMessages
                                key={activeCategoryChat?.id}
                                SetPopupData={SetPopupData}
                                messagesEndRef={messagesEndRef}
                                messagesList={messages?.data?.rows}
                                userChatState={userChatState}
                                SetUserChatState={SetUserChatState}
                                setInspectUser={setInspectUser}
                            />}
                        {activeChat?.id !== -1 &&
                            <ChatMessages
                                isPrivateChat={isPrivateChat}
                                SetPopupData={SetPopupData}
                                messagesEndRef={messagesEndRef}
                                messagesList={messages?.data?.rows}
                                userChatState={userChatState}
                                SetUserChatState={SetUserChatState}
                                setInspectUser={setInspectUser}
                                ghostOn={ghostOn}
                            />}
                        {activeChat?.id !== -1 && (!ghostOn && allowSendMessages) ?
                            <ChatFooter
                                messagesEndRef={messagesEndRef}
                                userChatState={userChatState}
                                SetUserChatState={SetUserChatState}
                                pastedFiles={newpastedFiles}
                                onSendMessage={onSendMessage}
                            /> : <>
                                {!allowSendMessages && <OnlyAdminFooter />}
                            </>}
                        <ErrorBoundary>
                            <LazyComponent fallback={<></>}>
                                <PopupMedia
                                    showModal={popupData}
                                    data={popupData}
                                    setQuote={(quote) => updateState(SetUserChatState, { quoteMessage: quote })}
                                    onClose={() => {
                                        SetPopupData(false);
                                        updateState(SetUserChatState, { quoteMessage: null })
                                    }}
                                />
                            </LazyComponent>
                        </ErrorBoundary>
                    </div>
                    {(userChatState?.isSearchOpen?.isOpen) &&
                        <ChatSearch
                            key={activeChat?.id}
                            userChatState={userChatState}
                            SetUserChatState={SetUserChatState}
                            setInspectUser={setInspectUser}
                            isPrivateChat={isPrivateChat}
                        />}
                    {userChatState?.chatInfoVisible && activeChat &&
                        ((ghostOn || activeChat.type === CONST.CHAT_TYPE.GROUP) ?
                            <GroupChatInfo
                                ghostOn={ghostOn}
                                chatInfoVisible={userChatState.chatInfoVisible}
                                SetUserChatState={SetUserChatState}
                            />
                            :
                            activeChat.type === CONST.CHAT_TYPE.PRIVATE &&
                            <PrivateChatInfo
                                chatInfoVisible={userChatState.chatInfoVisible}
                                SetUserChatState={SetUserChatState}
                            />
                        )}
                    <OnPasteDialogue
                        fullScreen={fullScreen}
                        open={pasteDiag}
                        handleClose={() => SetPasteDiag(false)}
                        onMessage={onPasteToMessage}
                        onTask={onPasteToTask}
                    />
                </ErrorBoundary>
            </div>);
    } catch (error) {
        console.error(error);
    }
}