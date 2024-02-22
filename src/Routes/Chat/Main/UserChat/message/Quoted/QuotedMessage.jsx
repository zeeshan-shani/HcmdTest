import React from 'react'
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { CONST } from 'utils/constants';
import { useSelector } from 'react-redux';
import { format_all, getBackgroundColorClass, getUserColor } from 'redux/common';
import { getMediaSVG } from 'Routes/Chat/Sidebar/Chat';

export const QuotedMessage = ({ item, moveToOrigin }) => {
    const { user } = useSelector(state => state.user);
    const { quotedMessageDetail: Qmessage } = item;
    if (item.quotedMessageId && item?.quotedMessageDetail) {
        const qMessageClass = "message";
        const sendByClass = `text-capitalize text-truncate font-weight-semibold ${getUserColor(Qmessage.sendBy)}`;
        const Q_format_message = Qmessage.message?.startsWith('\n') ? format_all(Qmessage?.message?.substring(1)) : format_all(Qmessage.message);
        const companyName = Qmessage?.sendByDetail?.companyName ? `- ${Qmessage?.sendByDetail?.companyName}` : '';
        const desgName = Qmessage?.sendByDetail?.companyRoleData?.name ? `- ${Qmessage.sendByDetail.companyRoleData.name}` : '';
        const sendby = `${Qmessage.sendByDetail.name} ${companyName} ${desgName}`;
        const typeMsg = getBackgroundColorClass('q-' + Qmessage.type)
        return (<div className={qMessageClass}>
            {Qmessage.isDeleted
                ?
                <div className="message-content quoted-message text-truncate w-100" style={{ fontSize: user?.fontSize }}>
                    <div className='d-flex align-items-center justify-content-between mb-1_5'>
                        <span className={sendByClass}>
                            {sendby}
                        </span>
                    </div>
                    <span className='deleted-message light-text-70 mr-1 font-weight-normal'>
                        {CONST.TEMPLATE_MSG.DELETE}
                    </span>
                </div>
                :
                <>
                    {!Qmessage.mediaType ?
                        <div className={`message-content quoted-message text-truncate cursor-pointer w-100 qb-${getUserColor(Qmessage.sendBy)}`} style={{ fontSize: user?.fontSize }} onClick={() => moveToOrigin(Qmessage, item.id)}>
                            <div className='d-flex align-items-center justify-content-between mb-1_5'>
                                <span className={sendByClass}>
                                    {sendby}
                                </span>
                                {Qmessage.type !== CONST.MSG_TYPE.ROUTINE &&
                                    <div className={`${classes["status-block"]} m-0`}>
                                        <div title={item.type} className={`${classes["task-status"]} ${typeMsg} msg-badge-text`}>
                                            {Qmessage.type === CONST.MSG_TYPE.URGENT ? 'URG' : 'EMG'}
                                        </div>
                                    </div>}
                            </div>

                            <div className='q-message text-color'>
                                <span className='font-weight-lighter'>
                                    <span dangerouslySetInnerHTML={{ __html: Q_format_message }}>
                                    </span>
                                </span>
                            </div>
                        </div> :
                        <div className="message-content quoted-message message-text m-0 cursor-pointer w-100" style={{ fontSize: user?.fontSize }} onClick={() => moveToOrigin(Qmessage, item.id)}>
                            <div className='d-flex align-items-center justify-content-between mb-1_5'>
                                <span className={sendByClass}>
                                    {sendby}
                                </span>
                            </div>
                            <div className="text-truncate">
                                <span className='mr-1'>{getMediaSVG(Qmessage.mediaType.split("/")[0], user?.fontSize)}</span>
                                <span>{Qmessage.fileName}</span>
                            </div>
                        </div>
                    }
                </>}
        </div>);
    }
}
