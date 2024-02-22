import { useQuery } from '@tanstack/react-query';
import { queryClient } from 'index';
import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { ChatFooter } from 'Routes/Chat/Main/UserChat/footer/ChatFooter'
import { messageRef } from 'Routes/Chat/Main/UserChat/message/ChatMessages'
import { Message } from 'Routes/Chat/Main/UserChat/message/Message'
import messageService from 'services/APIs/services/messageService';
import { sendMessage } from 'utils/wssConnection/Socket';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { getSendToUsers } from 'redux/actions/chatAction';

export default function ThreadContainer({ thread }) {
    const { user } = useSelector(state => state.user);
    const [footerState, setFooterState] = useState({
        messageStatus: false,
        editMessage: null,
        openChild: false
    });

    const { data: children = {}, isFetching } = useQuery({
        queryKey: ["/threadMessage/list", user.id, thread.id],
        queryFn: async () => {
            const data = await messageService.getThreadList({
                payload: {
                    messageId: thread.id,
                    threadType: "child"
                }
            });
            if (data?.status === 1) return data.data;
            return [];
        },
        keepPreviousData: false,
        enabled: footerState.openChild
    });

    const onSendMessage = (data) => {
        let payload = { ...data };
        payload.quotedMessageId = thread.id;
        payload.chatId = thread.userChat.id;
        payload.chatType = thread.userChat.type;
        payload.sendTo = getSendToUsers(user.id, thread.userChat.type, thread.userChat.users);
        sendMessage(payload, (data) => {
            if (data.status === 1 && !!children?.length)
                queryClient.setQueryData(["/threadMessage/list", user.id, thread.id], (prev) => {
                    return {
                        count: prev.count + 1,
                        rows: prev.rows.concat(data.data)
                    }
                })
        })
    }

    return (
        <div className="note message-draft m-2">
            <h5 className='m-2'>{thread.userChat.name}</h5>
            <div className="note-body py-1">
                <Message
                    messageRef={messageRef}
                    item={thread}
                    ReadOnly
                    withDate
                />
                <Button variant='link' onClick={() => setFooterState(prev => ({ ...prev, openChild: !prev.openChild }))}>
                    {footerState.openChild ? 'Hide Threads' : `Show Threads (${thread.replies})`}
                </Button>
            </div>
            {footerState.openChild &&
                <div className="note-footer d-flex flex-column">
                    {isFetching && <Loader height={"80px"} />}
                    {!!children?.rows?.length &&
                        children.rows.map((item, index) => {
                            return (
                                <Message
                                    key={index}
                                    messageRef={messageRef}
                                    item={item}
                                    ReadOnly
                                    withDate
                                />
                            )
                        })}
                </div>}
            <div className='chat-body mt-2' style={{ flexGrow: 0 }}>
                <ChatFooter
                    key={`thread-${thread.id}`}
                    userChatState={footerState}
                    SetUserChatState={setFooterState}
                    onSendMessage={onSendMessage}
                    draftFooter
                    threadFooter
                />
            </div>
        </div>
    )
}
