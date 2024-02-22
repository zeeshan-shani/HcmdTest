import React, { useCallback } from 'react'
import classes from "Routes/TaskBoard/TasksPage.module.css";
import moment from 'moment-timezone';
import { getBackgroundColorClass, getDueDateObj, getTaskBackgroundColorClass } from 'redux/common';
import { ChatLeft, Check, CheckAll, ClockHistory, StarFill } from 'react-bootstrap-icons';
import { MuiTooltip } from 'Components/components';
import { CONST } from 'utils/constants';
import { dispatch } from 'redux/store';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { CHAT_MODELS } from 'Routes/Chat/Models/models';
import { changeTask } from 'redux/actions/modelAction';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Reply } from '@mui/icons-material';
import { useSelector } from 'react-redux';

export default function MessageFooter({
    item,
    moveToOrigin = false,
    isBufferMsg = false,
    hideReactions,
    SetUserChatState = () => { },
    withDate = false
}) {
    const { user } = useSelector(state => state.user);
    const setReactions = () => dispatch({ type: CHAT_CONST.SET_MESSAGE_REACTIONS, payload: item.messageEmojis });
    let tagStatus = null;
    if (item?.task) tagStatus = String(item.task?.status);
    const dueDateObj = getDueDateObj(item.task?.dueDate, tagStatus) || {};

    const setThreadMessage = useCallback(() => {
        if (!item || withDate) return;
        dispatch({ type: CHAT_CONST.SET_THREAD_MESSAGE, payload: item });
        changeTask(CHAT_MODELS.THREAD_ITEM);
    }, [item, withDate]);

    return (
        <div className='position-relative my-1'>
            <div className='message-footer d-flex align-items-center justify-content-between flex-wrap'>
                <div className={`${classes["status-block"]} m-0`}>
                    {item.task?.dueDate && dueDateObj.visible &&
                        <div className={`task-status ${dueDateObj.color} br-6`}>
                            <p className="text-white text-capitalize px-1 mb-0" style={{ fontSize: user?.fontSize }}>
                                {dueDateObj.isOverDue ? 'Overdue' : `Due ${moment(item.task?.dueDate).format('MM/DD/YY')}`}
                                {/* {moment(item.task?.dueDate).format('MM/DD/YY')} */}
                            </p>
                        </div>}
                    {!item.isDeleted && item.type !== CONST.MSG_TYPE.ROUTINE &&
                        <div title={item?.taskStatus} className={`d-flex align-items-center ${classes["msg-task-status"]} ${getBackgroundColorClass('q-' + item.type)} px-1 h-auto`}>
                            <span className='text-white' style={{ fontSize: user?.fontSize }}>
                                {item.type === CONST.MSG_TYPE.URGENT ? 'URG' : 'EMG'}
                            </span>
                        </div>}
                    {!item?.isDeleted && item?.isMessage === false && tagStatus &&
                        <div title={item?.taskStatus} className={`d-flex align-items-center ${classes["msg-task-status"]} ${getTaskBackgroundColorClass(tagStatus)} px-1 h-auto mx-1`}>
                            <span className='text-white text-capitalize' style={{ fontSize: user?.fontSize }}>{tagStatus}</span>
                        </div>}
                    {!!Number(item?.replies) &&
                        <div className={`d-flex align-items-center mx-1 text-link text-color`} onClick={setThreadMessage}>
                            <span className='text-capitalize' style={{ fontSize: user?.fontSize }}>
                                {item.replies} Reply
                            </span>
                        </div>}
                </div>
                <div className="message-date text-capitalize message-info message-text d-flex" style={{ fontSize: user?.fontSize }}>
                    {!item.isDeleted && <>
                        {!item.isMessage && <>
                            {!!item?.task?.comments?.length &&
                                <MuiTooltip title='Task Comments'>
                                    <div className={`d-flex align-items-center mx-1 ${classes["icon-space"]} board-task-card-svg`}>
                                        <ChatLeft size={user?.fontSize} />
                                        <span className={`${classes["board-count-space"]}`}>
                                            {item.task.comments?.length}
                                        </span>
                                    </div>
                                </MuiTooltip>}
                            {/* <MuiTooltip title='View Task'>
                                <button className="btn btn-sm mx-md-1 btn-secondary p-2_8 line-height-1 cursor-pointer" onClick={() => getTask(item)}>
                                    <EyeFill size={user?.fontSize} />
                                </button>
                            </MuiTooltip> */}
                        </>}
                        {moveToOrigin &&
                            <span className="message-date text-capitalize mx-1" role="button" onClick={() => moveToOrigin(item)}>
                                <svg height={user?.fontSize} width={user?.fontSize} fill='currentColor'><path d="M7.375 14.375 3 10 7.375 5.625 8.438 6.688 5.875 9.25H14.5V7H16V10.75H5.875L8.438 13.312Z" /></svg>
                            </span>}
                        {item?.importantMessage &&
                            <span className="message-star-icon"><StarFill /></span>}
                        {item?.isEdited &&
                            <span className="message-status font-italic mx-1">Edited</span>}
                    </>
                    }
                    <MuiActionButton Icon={Reply} size="small" className="py-0" onClick={() => SetUserChatState(prev => ({ ...prev, quoteMessage: item }))} />
                    <span className='mb-0'>{moment(item.createdAt).format(withDate ? "MM/DD/YY hh:mm A" : "hh:mm A")}</span>
                    {item.sendBy === user.id &&
                        <span className='ml-1'>
                            {isBufferMsg ?
                                <ClockHistory size={user?.fontSize - 1} />
                                :
                                <>{(item?.messageIsRead) ? <CheckAll fill="#34b7f1" size={user?.fontSize + 2} /> : <Check size={user?.fontSize + 2} />}</>}
                        </span>}
                </div>
            </div>
            {!hideReactions && !item.isDeleted && !!item?.messageEmojis?.length &&
                <div className='position-absolute reacted-div d-flex gap-5 px-1 emoji-font' onClick={setReactions}>
                    {item.messageEmojis[0] && <div className='' onClick={setReactions}>{item.messageEmojis[0].emojiCode}</div>}
                    {item.messageEmojis[1] && <div className='' onClick={setReactions}>{item.messageEmojis[1].emojiCode}</div>}
                    {item.messageEmojis.length > 2 && <div className='text-color' onClick={setReactions}>{item.messageEmojis.length}</div>}
                </div>}
            {item?.task?.watchList &&
                <div className='keep-watch-task' />
            }
        </div>
    )
}
