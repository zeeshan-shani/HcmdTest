import React, { useCallback } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeTask } from 'redux/actions/modelAction';
import { messageRef, pageScroll, ScrolltoOrigin } from '../../Main/UserChat/message/ChatMessages';
import { MessageContent } from '../../Main/UserChat/message/Contents/MessageContent';
import { ImageVideoContent } from '../../Main/UserChat/message/Contents/ImageVideoContent';
import { AudioContent } from '../../Main/UserChat/message/Contents/AudioContent';
import { FileContent } from '../../Main/UserChat/message/Contents/FileContent';
import { getLengthFromLastMessage, getMessages2 } from 'redux/actions/chatAction';
import { CONST } from 'utils/constants';
import { X } from 'react-bootstrap-icons';
import { getChatBackgroudClass, toastPromise } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import importantMessageService from 'services/APIs/services/importantMessageService';
import { useQuery } from '@tanstack/react-query';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Spinner } from 'react-bootstrap';
let isLoading = false;

export default function ImportantMessage() {
    const { messages, activeChat, offset, totalCount, taggedSearch } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.user);

    const getImportantMessage = useCallback(async ({ queryKey }) => {
        const chatId = queryKey[1];
        const data = await importantMessageService.list({ payload: { chatId } });
        if (data?.status === 1) return data.data;
        return [];
    }, []);

    const { data: importantMessageList = [], isFetching } = useQuery({
        queryKey: ["/importantmessage/list", activeChat.id],
        queryFn: getImportantMessage,
        keepPreviousData: false,
    });

    const ReqforQuotedMessage = useCallback(async (count, requestId) => {
        try {
            if (count > 100) {
                await getMessages2({ messageId: requestId, pagitionFlow: "DOWN", includeMessage: true })
                    .then(async (data) => {
                        dispatch({ type: CHAT_CONST.TOTAL_COUNT_DOWN, payload: data.data.count - CONST.MESSAGE_GET_LIMIT });
                        if (data.status === 1) {
                            dispatch({ type: CHAT_CONST.GET_MESSAGES_SUCCESS, payload: data });
                        }
                    });
            }
            else {
                let messageId;
                if (!!messages?.data?.rows?.length) messageId = messages.data.rows[messages.data.rows.length - 1].id;
                const res = (!isLoading) ? await getMessages2({ messageId, taggedSearch, pagitionFlow: "UP", limit: count + 5 }) : { status: -1 };
                if (res.status === 1) {
                    dispatch({ type: CHAT_CONST.SET_OFFSET, payload: offset + count });
                    if (res.data.count !== totalCount) dispatch({ type: CHAT_CONST.SET_COUNT, payload: res.data.count });
                    dispatch({ type: CHAT_CONST.APPEND_MESSAGES, payload: res });
                    return res;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, [offset, totalCount, messages, taggedSearch]);

    const onClickTaskHandler = useCallback(async (task) => {
        if (messageRef[task.id] !== undefined) {
            changeTask();
            pageScroll(messageRef[task.id], { behavior: "smooth" });
            const classes = messageRef[task.id].current.className;
            messageRef[task.id].current.classList += " blink-quote-message ";
            setTimeout(() => messageRef[task.id].current.classList = classes, 2000);
        } else {
            const currMsgId = messages.data.rows.reverse()[0].id;
            await toastPromise({
                func: async (myResolve, myReject) => {
                    try {
                        const res = await getLengthFromLastMessage({
                            chatId: activeChat.id,
                            rquestedMessageId: task.id,
                            currentMessageId: currMsgId,
                        });
                        if (res.data) {
                            await ReqforQuotedMessage(res.data, task.id)
                                .then(async (data) => {
                                    changeTask();
                                    ScrolltoOrigin({ id: task.id });
                                });
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
    }, [ReqforQuotedMessage, activeChat.id, messages.data.rows]);

    return (<div className="tab-pane h-100 active" id="important-message" role="tabpanel" aria-labelledby="important-message-tab">
        <div className="appnavbar-content-wrapper">
            <div className="appnavbar-scrollable-wrapper">
                <div className="appnavbar-heading sticky-top">
                    <div className="nav justify-content-between align-items-center">
                        <h5 className="text-truncate mb-0">Important Message</h5>
                        <MuiActionButton Icon={X} size="small" className="text-color" onClick={() => changeTask()} />
                    </div>
                </div>
                <div className={`appnavbar-body ${getChatBackgroudClass(user?.chatWallpaper)}`}>
                    <div className="note-container">
                        <div className="text-center">
                            {isFetching && <Spinner animation="border" />}
                        </div>
                        {importantMessageList?.map(({ message: item }) => {
                            return (
                                <div key={item.id} data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded={true} aria-controls="collapseExample">
                                    <div className={`message mb-0 pt-2 ${item.sendBy === user.id ? 'self self-thread-m1' : 'thread-m1'}`} key={item.id}>
                                        <div className="message-wrapper">
                                            {!item.mediaType &&
                                                <MessageContent DisableOpt={true} item={item} moveToOrigin={onClickTaskHandler} />}
                                            {(item.mediaType && (item.mediaType.startsWith(CONST.MEDIA_TYPE.IMAGE) || item.mediaType.startsWith(CONST.MEDIA_TYPE.VIDEO))) &&
                                                <ImageVideoContent DisableOpt={true} item={item} moveToOrigin={onClickTaskHandler} />}
                                            {(item.mediaType && (item.mediaType.startsWith(CONST.MEDIA_TYPE.APPLICATION) || item.mediaType.startsWith(CONST.MEDIA_TYPE.TEXT))) &&
                                                <FileContent DisableOpt={true} item={item} moveToOrigin={onClickTaskHandler} />}
                                            {item.mediaType && item.mediaType.startsWith(CONST.MEDIA_TYPE.AUDIO) &&
                                                <AudioContent DisableOpt={true} item={item} moveToOrigin={onClickTaskHandler} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>);
}