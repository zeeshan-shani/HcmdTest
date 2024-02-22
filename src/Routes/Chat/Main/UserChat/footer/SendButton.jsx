import { getBackgroundColorClass } from "redux/common";

export const MessageSendButton = ({
    isEditing = false,
    sendEditMessage = () => { },
    sendMessageHandler,
    disabled = false,
    messageType }) => {
    const onClick = () => {
        if (isEditing) sendEditMessage(messageType);
        else if (!disabled) sendMessageHandler(messageType);
    }

    return (<>
        <div
            className={`btn btn-icon send-icon rounded-circle text-light send-btn-hover ${getBackgroundColorClass(messageType)} ${disabled ? 'disabled' : ''}`}
            onClick={onClick}
        >
            {disabled ? (
                <div className="spinner-border text-secondary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            ) : (<>
                {!isEditing && <svg className="hw-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>}
                {isEditing && <svg className="hw-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>}
            </>)}
        </div>
    </>)
}