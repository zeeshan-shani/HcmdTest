import React from 'react'
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { MuiTooltip } from 'Components/components';
import { ArrowReturnLeft } from 'react-bootstrap-icons';
import { AudioContent } from 'Routes/Chat/Main/UserChat/message/Contents/AudioContent';
import { FileContent } from 'Routes/Chat/Main/UserChat/message/Contents/FileContent';
import { ImageVideoContent } from 'Routes/Chat/Main/UserChat/message/Contents/ImageVideoContent';
import { MessageContent } from 'Routes/Chat/Main/UserChat/message/Contents/MessageContent';

export default function MessageComp({ parentMsg, bgclass, onQuote, onClickTaskHandler, getParentMessage }) {
    const { user } = useSelector(state => state.user);
    if (parentMsg)
        return (
            <div className={`appnavbar-body-title row m-0 pb-0 ${bgclass}`}>
                <div className="message-divider sticky-top" data-label={moment(parentMsg.createdAt).format('MM/DD/YY')} style={{ fontSize: user?.fontSize - 2 }}>&nbsp;</div>
                <div className={`message ${parentMsg.sendBy === user.id ? 'self' : ''} w-100`}>
                    <div className="message-wrapper">
                        {!parentMsg?.mediaType &&
                            <MessageContent DisableOpt={true} item={parentMsg} />}
                        {(parentMsg.mediaType && (parentMsg.mediaType.split("/")[0] === "image" || parentMsg.mediaType.split("/")[0] === "video")) &&
                            <ImageVideoContent item={parentMsg} DisableOpt={true} />}
                        {(parentMsg.mediaType && (parentMsg.mediaType.split("/")[0] === "application" || parentMsg.mediaType.split("/")[0] === "text")) &&
                            <FileContent item={parentMsg} DisableOpt={true} />}
                        {parentMsg.mediaType && parentMsg.mediaType.split("/")[0] === "audio" &&
                            <AudioContent item={parentMsg} DisableOpt={true} />}
                    </div>
                    {parentMsg?.quotedMessageDetailData && !!parentMsg?.quotedMessageDetailData.length &&
                        <div className="message-options thread text-color">
                            {parentMsg.quotedMessageId && !parentMsg.length &&
                                <div className='show-thread-parent cursor-pointer message-text' onClick={() => {
                                    parentMsg.quotedMessageId = null;
                                    getParentMessage(parentMsg);
                                }} style={{ fontSize: user?.fontSize }}>Show Previous</div>
                            }
                            <div className='show-thread-parent cursor-pointer message-text' onClick={() => { onQuote(parentMsg); }} style={{ fontSize: user?.fontSize }}>Reply</div>
                            <MuiTooltip title={`Move to message`}>
                                <div className="message-date text-capitalize" role="button" onClick={() => onClickTaskHandler(parentMsg)}>
                                    <ArrowReturnLeft size={18} />
                                </div>
                            </MuiTooltip>
                        </div>}
                </div>
            </div>
        )
}
