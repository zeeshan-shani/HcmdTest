import React from 'react'
import moment from 'moment-timezone'
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { CONST } from 'utils/constants'
import { useSelector } from 'react-redux';
import { getGhostAccess } from 'utils/permission';
import { getBackgroundColorClass, getUserColor } from 'redux/common'

export default function MessageHeader({ item, prevMsg, pTime, forceView = false, mType = false, setInspectUser = () => { } }) {
    const { user } = useSelector(state => state.user);
    try {
        if ((prevMsg?.sendBy !== item.sendBy || forceView || (getGhostAccess(user)) ||
            prevMsg.type === CONST.MSG_TYPE.CHAT_LOG.NAME ||
            (Math.abs(new Date(pTime).getMinutes() - new Date(item.createdAt).getMinutes()) > 10) ||
            (pTime && moment(item.createdAt).format("MM/DD/YY") !== moment(pTime).format("MM/DD/YY")))) {
            const companyName = item?.sendByDetail?.companyName ? ` - ${item?.sendByDetail?.companyName}` : '';
            const desgName = item?.sendByDetail?.companyRoleData?.name ? ` - ${item.sendByDetail.companyRoleData.name}` : '';
            const chatname = item?.userChat?.name;
            const sendby = `${item.sendByDetail?.name}${companyName}${desgName}`;
            return (
                <div className='d-block text-color'>
                    <div className='message-header-user d-flex align-items-center justify-content-between'>
                        {item.sendBy !== user.id &&
                            <div className={`text-capitalize text-truncate font-weight-medium cursor-pointer ${item.sendBy !== user.id ? getUserColor(item.sendBy) : 'text-highlight-blue'}`} onClick={() => setInspectUser(item?.sendByDetail?.id)}>
                                {sendby}
                            </div>}
                        {mType && !item.isDeleted && item.type !== CONST.MSG_TYPE.ROUTINE &&
                            <div className={`${classes["status-block"]}`}>
                                <div title={item.type} className={`${classes["task-status"]} ${getBackgroundColorClass(item.type)}`} />
                            </div>}
                    </div>
                    {chatname && <div className='font-italic'>
                        {`From ${chatname}`}
                    </div>}
                </div >)
        }
    } catch (error) {
        console.error(error);
    }
}