import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import { getTaskDetails } from 'redux/actions/taskAction';
import { messageFormat } from "redux/common";
import { getPrivateChatUser } from 'services/helper';
import { CONST } from 'utils/constants';

export default function MonthEvent({ event }) {
    const { chatList } = useSelector(state => state.chat);
    const { activeTaskChat } = useSelector((state) => state.task);

    const chatDetails = chatList.find(chat => chat.id === event.chatId) || (activeTaskChat?.name && { name: activeTaskChat.name });
    if (chatDetails?.type === CONST.CHAT_TYPE.PRIVATE)
        chatDetails.name = getPrivateChatUser(chatDetails)?.name;
    // const findStatus = event?.taskStatuses.find(item => item.userId === user.id);
    // const taskStatus = event.status || "pending";

    const details = useMemo(() => {
        // const format_patient1 = event?.patient && (format_patient(event.patient));
        const format_desc = event.description && messageFormat(event?.description);
        return (<>
            {/* {event.subject &&
                <div className='font-weight-bold'>{event.subject}</div>}
            {format_patient1 &&
                <div className='d-flex gap-10'>
                    <div>Patient:</div>
                    <span className="message-patient"
                        dangerouslySetInnerHTML={{ __html: format_patient1 }} />
                </div>} */}
            {format_desc &&
                <div className="message-text text-truncate in-one-line"
                    dangerouslySetInnerHTML={{ __html: format_desc + format_desc + format_desc + format_desc }} />
            }
        </>)
    }, [event?.description]); // event?.subject, event?.patient,

    return (
        <div onClick={(e) => {
            e.preventDefault();
            // getTaskDetails({ taskId: event.id, messageId: event.messageId, isDepartment: event?.isDepartment });
        }} >
            {details}
        </div>
    )
}
