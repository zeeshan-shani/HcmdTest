import React, { useEffect, useState } from 'react'
import { getResponseofThread } from 'redux/actions/chatAction';

import { ArrowReturnLeft, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { CONST } from 'utils/constants';
import { MuiTooltip } from 'Components/components';
import moment from 'moment-timezone';
import { AudioContent } from 'Routes/Chat/Main/UserChat/message/Contents/AudioContent';
import { FileContent } from 'Routes/Chat/Main/UserChat/message/Contents/FileContent';
import { ImageVideoContent } from 'Routes/Chat/Main/UserChat/message/Contents/ImageVideoContent';
import { MessageContent } from 'Routes/Chat/Main/UserChat/message/Contents/MessageContent';
import { useSelector } from 'react-redux';

export const Thread = ({ item, level = 0, onQuote, onClickTaskHandler, isTaskView }) => {
    const { user } = useSelector(state => state.user);
    const [show, toggleShow] = useState(false);
    const [resMessages, setResMessages] = useState([]);

    useEffect(() => {
        if (level < CONST.MAX_THREAD_LEVEL && !!item?.quotedMessageDetailData?.length)
            onClickToggle(true);
        //eslint-disable-next-line
    }, []);

    const onClickToggle = async (show) => {
        toggleShow(show);
        if (!show) return;
        const res = await getResponseofThread(item.id);
        if (res.status === 1) setResMessages(res.data.rows);
    }

    return (<>
        <div key={item.id} className={isTaskView ? "py-2" : ""} data-bs-toggle="collapse" data-bs-target={`collapseExample-${item.id}`} aria-expanded="false" aria-controls="collapseExample">
            <div className="message-divider sticky-top mt-1" data-label={moment(item.createdAt).format('MM/DD/YY')} style={{ fontSize: user?.fontSize - 2 }}>&nbsp;</div>
            <div className={`message mb-0 pt-2 ${item.sendBy === user.id ? 'self self-thread-m1' : 'thread-m1'}`} key={item.id}>
                <div className="message-wrapper">
                    {!item.mediaType &&
                        <MessageContent DisableOpt={true} item={item} />}
                    {(item.mediaType && (item.mediaType.split("/")[0] === "image" || item.mediaType.split("/")[0] === "video")) &&
                        <ImageVideoContent item={item} DisableOpt={true} />}
                    {(item.mediaType && (item.mediaType.split("/")[0] === "application" || item.mediaType.split("/")[0] === "text")) &&
                        <FileContent item={item} DisableOpt={true} />}
                    {item.mediaType && item.mediaType.split("/")[0] === "audio" &&
                        <AudioContent item={item} DisableOpt={true} />}
                </div>
                <div className="message-options thread text-color">
                    <MuiTooltip title='Reply to this message'>
                        <div className='show-thread-parent cursor-pointer message-text' onClick={() => { onQuote(item) }} style={{ fontSize: user?.fontSize }}>Reply</div>
                    </MuiTooltip>
                    {item?.quotedMessageDetailData &&
                        <>{!!item.quotedMessageDetailData.length && <div className="message-date">{`${item.quotedMessageDetailData.length} Replies`}</div>}</>}
                    <MuiTooltip title={`Toggle to view replied messages`}>
                        <div className="message-date text-capitalize" role="button" onClick={() => onClickToggle(!show && !!item.quotedMessageDetailData.length)}>
                            {!show ? (!!item.quotedMessageDetailData.length ? <EyeFill size={18} /> : <></>) : <EyeSlashFill size={18} />}
                        </div>
                    </MuiTooltip>
                    <MuiTooltip title={`Move to message`}>
                        <div className="message-date text-capitalize" role="button" onClick={() => onClickTaskHandler(item)}>
                            <ArrowReturnLeft size={18} />
                        </div>
                    </MuiTooltip>
                </div>
            </div>
            {show && <div className="collapse show mx-0" id={`collapseExample-${level}`}>
                <div className={`card card-body todo-container thread-container border-radius-14-wh ${!(level % 2) ? 'thread-bg-1' : 'thread-bg-2'}`}>
                    {resMessages.map((item) => {
                        return (
                            <Thread
                                key={item.id}
                                isTaskView={isTaskView}
                                item={item}
                                level={level + 1}
                                onQuote={onQuote}
                            />)
                    })}
                </div>
            </div>}
        </div></>
    )
}
