import React from 'react'
import { Message } from './Message'

export const bufferMessagesRef = [];
export default function BufferMessages({ messages, SetUserChatState, messagesIds }) {
    try {
        return (<>
            {messages
                .filter((item) => !messagesIds.includes(item.id))
                .map((item) => {
                    return (<React.Fragment key={item.id}>
                        <Message
                            item={item}
                            isPrivateChat={true}
                            isUnread={false}
                            ReadOnly={true}
                            SetUserChatState={SetUserChatState}
                            isBufferMsg={true}
                            messageRef={bufferMessagesRef}
                        />
                        <div className="message-container" style={{ contentVisibility: 'auto' }} />
                    </React.Fragment>)
                })}
        </>);
    } catch (error) {
        console.error(error);
    }
}
