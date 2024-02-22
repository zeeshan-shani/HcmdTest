import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import { getTaskDetails } from 'redux/actions/taskAction';
import { format_patient, getStatusColor, messageFormat } from "redux/common";
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { getPrivateChatUser } from 'services/helper';
import { CONST } from 'utils/constants';

export default function DayEvent({ event }) {
    const { user } = useSelector(state => state.user);
    const { chatList } = useSelector(state => state.chat);
    const { activeTaskChat } = useSelector((state) => state.task);

    const chatDetails = chatList.find(chat => chat.id === event.chatId) || (activeTaskChat?.name && { name: activeTaskChat.name });
    if (chatDetails?.type === CONST.CHAT_TYPE.PRIVATE)
        chatDetails.name = getPrivateChatUser(chatDetails)?.name;
    const findStatus = event?.taskStatuses.find(item => item.userId === user.id);
    const taskStatus = event.status || "pending";

    const details = useMemo(() => {
        const format_patient1 = event?.patient && (format_patient(event.patient));
        // const format_cc = event?.patient && (format_patient(event.patient));
        const format_desc = event.description && messageFormat(event?.description);
        return (<>
            {event.subject &&
                <div className='font-weight-bold'>{event.subject}</div>}
            {format_patient1 &&
                <div className='d-flex gap-10'>
                    <div>Patient:</div>
                    <span className="message-patient"
                        dangerouslySetInnerHTML={{ __html: format_patient1 }} />
                </div>}
            {/* {format_cc &&
                <div className='d-flex gap-10'>
                    <div>CC:</div>
                    <span className="message-patient"
                        dangerouslySetInnerHTML={{ __html: format_cc }} />
                </div>} */}
            {format_desc &&
                <div className="message-text text-truncate in-one-line"
                    dangerouslySetInnerHTML={{ __html: format_desc + format_desc + format_desc + format_desc }} />
            }
        </>)
    }, [event?.subject, event?.patient, event?.description]);


    return (
        <div
            onClick={(e) => {
                e.preventDefault();
                getTaskDetails({ taskId: event.id, messageId: event.messageId, isDepartment: event?.isDepartment });
            }}
        >
            {details}
            <div className={`${classes["task-options"]} justify-content-between mt-1 flex-wrap gap-10`}>
                <div className="d-flex">
                    {chatDetails?.name &&
                        <p className="task display-tag my-1">
                            {chatDetails?.name}
                        </p>}
                </div>
                <div className="d-flex" style={{ gap: '.5rem' }}>
                    <div className={`task-status br-6 bg-primary`}>
                        <p className="text-white text-capitalize p-1 mb-0">
                            {event?.isTeam ? 'Team' : 'Single'}
                        </p>
                    </div>
                    {(findStatus || taskStatus) &&
                        <div className={`task-status ${getStatusColor(taskStatus)} br-6`}>
                            <p className="text-white text-capitalize p-1 mb-0">
                                {taskStatus}
                            </p>
                        </div>}
                </div>
            </div>
        </div>
    )
}
