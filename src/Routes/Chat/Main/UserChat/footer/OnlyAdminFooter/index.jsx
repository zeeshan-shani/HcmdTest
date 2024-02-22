import React from 'react'
import { useSelector } from 'react-redux';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { ChatMember } from '../../info/group-chat-info/ChatMember';
import { compareName } from '../../info/group-chat-info/GroupChatInfo';

export default function OnlyAdminFooter() {
    return (<>
        <AdminListAccordion />
        <div className="bg__chat-dark d-flex align-items-center justify-content-center" style={{ height: "50px" }}>
            Only
            <div className='mx-1 text-primary cursor-pointer'
                data-bs-toggle="collapse"
                data-bs-target={`#adminToggle`}
                aria-expanded="false"
                aria-controls={`adminToggle`}
            >
                admin
            </div>
            can send messages
        </div>
    </>
    )
}

const AdminListAccordion = () => {
    const { activeChat } = useSelector(state => state.chat);
    return (
        <div className='accordion text-color'>
            <div className={`${classes["accordion-item"]} task-card-item ${classes["todos"]} shadow-none p-0`}>
                <div id={`adminToggle`} className={`accordion-collapse collapse`} aria-labelledby={`card-filter`}>
                    <div className="accordion-body">
                        <div className="appnavbar-body-title d-flex flex-grow-0 py-1">
                            <ul className="list-group list-group-flush w-100">
                                {activeChat.chatusers
                                    .filter(i => i.isAdmin)
                                    .sort(compareName)
                                    .map((item) => {
                                        return (<ChatMember item={item} key={item.userId} isUserAdmin={false} />);
                                    })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}