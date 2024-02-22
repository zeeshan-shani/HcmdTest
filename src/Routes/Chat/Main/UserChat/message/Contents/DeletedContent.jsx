import React from 'react'
import { SOCKET } from 'utils/constants'
import { useSelector } from 'react-redux'
import { getSuperAdminAccess } from 'utils/permission'
import { SocketEmiter } from 'utils/wssConnection/Socket'
import MessageFooter from '../Options/MessageFooter'
import MessageHeader from '../Options/MessageHeader'

export const DeletedContent = ({ item, classes = '', prevMsg, pTime, setInspectUser }) => {
    const { user } = useSelector(state => state.user);
    const onClickShow = () => {
        SocketEmiter(SOCKET.REQUEST.VIEW_DELETED_MESSAGE, { chatId: item.chatId, messageId: item.id });
    }
    const isSA = getSuperAdminAccess(user);
    const deleteMsg = `This ${item.isMessage ? 'Message' : 'Task'} was Deleted`;
    return (
        <div className={`message-content ${classes}`} style={{ fontSize: user?.fontSize }}>
            <MessageHeader item={item} prevMsg={prevMsg} pTime={pTime} setInspectUser={setInspectUser} />
            <p className='deleted-message text-secondary mr-1 font-weight-normal mb-0'>
                {deleteMsg}
                {isSA &&
                    <span className='show-deleted-message ml-1 cursor-pointer font-weight-semibold message-text' onClick={onClickShow} style={{ fontSize: user?.fontSize }}>show</span>}
            </p>
            <MessageFooter item={item} />
        </div>
    )
}
