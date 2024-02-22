import React, { useEffect } from 'react'
import { useState } from 'react';
import { X } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { getChatBackgroudClass, toastPromise } from 'redux/common';
import { AudioContent } from '../../Main/UserChat/message/Contents/AudioContent';
import { FileContent } from '../../Main/UserChat/message/Contents/FileContent';
import { ImageVideoContent } from '../../Main/UserChat/message/Contents/ImageVideoContent';
import { MessageContent } from '../../Main/UserChat/message/Contents/MessageContent';
import { MessageReader } from './MessageReader';
import messageService from 'services/APIs/services/messageService';

const defaultState = {
    loading: false,
    messageData: null,
    isReadByCollapsed: false,
    isUnreadByCollapsed: false,
}
export default function MessageInfo({ taskName, onClosehandler }) {
    const { user } = useSelector((state) => state.user);
    const { infoMessage } = useSelector((state) => state.chat);
    const [state, setState] = useState(defaultState);
    const { isReadByCollapsed, isUnreadByCollapsed, messageData } = state;

    useEffect(() => {
        (async () => {
            if (infoMessage) {
                await toastPromise({
                    func: async (myResolve, myReject) => {
                        try {
                            const data = await messageService.getRecipient({ payload: { id: infoMessage } });
                            if (data?.status === 1) setState(prev => ({ ...prev, messageData: data.data }));
                            myResolve("OK");
                        } catch (error) {
                            myReject("Error");
                        }
                    }, loading: "Requesting Recipients",
                    success: <b>Successfully Get Recipients</b>,
                    error: <b>Could not load Recipients.</b>,
                    options: { id: "message-info" }
                })
            }
        })();
    }, [infoMessage]);

    if (messageData) {
        try {
            const readByArr = messageData?.messagerecipients?.filter(item => item.isRead === true) || [];
            const unreadByArr = messageData?.messagerecipients?.filter(item => item.isRead === false) || [];
            return (
                <div className="tab-pane h-100 active" id="notes" role="tabpanel" aria-labelledby="notes-tab">
                    <div className="appnavbar-content-wrapper">
                        <div className="appnavbar-scrollable-wrapper">
                            <div className="appnavbar-heading sticky-top">
                                <ul className="nav justify-content-between align-items-center">
                                    <li className="text-center">
                                        <h5 className="text-truncate mb-0">Message info</h5>
                                    </li>
                                    <li className="nav-item list-inline-item close-btn">
                                        <button className='btn-outline-default btn-sm border-0' onClick={() => onClosehandler()}>
                                            <X size={20} />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            {messageData.id !== -1 &&
                                <div className="appnavbar-body">
                                    <div className={`appnavbar-body-title row m-0 ${getChatBackgroudClass(user?.chatWallpaper)}`}>
                                        <div className={`message w-100 m-auto ${messageData.sendBy === user.id ? 'self' : ''}`.trim()}>
                                            <div className="message-wrapper">
                                                {!messageData.mediaType &&
                                                    <MessageContent item={messageData} DisableOpt={true} />}
                                                {(messageData.mediaType && (messageData.mediaType.split("/")[0] === "image" || messageData.mediaType.split("/")[0] === "video")) &&
                                                    <ImageVideoContent item={messageData} DisableOpt={true} />}
                                                {(messageData.mediaType && (messageData.mediaType.split("/")[0] === "application" || messageData.mediaType.split("/")[0] === "text")) &&
                                                    <FileContent item={messageData} DisableOpt={true} />}
                                                {messageData.mediaType && messageData.mediaType.split("/")[0] === "audio" &&
                                                    <AudioContent item={messageData} DisableOpt={true} />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hide-scrollbar flex-fill">
                                        {!!readByArr.length && <div className="chat-info-group">
                                            <div className={`chat-info-group-header ${isReadByCollapsed ? 'collapsed' : ''}`} data-toggle="collapse" role="button" aria-expanded={!isReadByCollapsed} aria-controls="participants-list" onClick={() => setState(prev => ({ ...prev, isReadByCollapsed: !prev.isReadByCollapsed }))}>
                                                <h6 className="m-2">Read By</h6>
                                            </div>
                                            <div className={`chat-info-group-body collapse ${!isReadByCollapsed ? 'show' : ''}`} id="participants-list">
                                                <div className="chat-info-group-content list-item-has-padding">
                                                    <ul className="list-group list-group-flush">
                                                        {readByArr.map((item) => {
                                                            return (<MessageReader item={item} key={item.id} />);
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>}
                                        {!!unreadByArr.length && <div className="chat-info-group">
                                            <div className={`chat-info-group-header ${isUnreadByCollapsed ? 'collapsed' : ''}`} data-toggle="collapse" role="button" aria-expanded={!isUnreadByCollapsed} aria-controls="participants-list" onClick={() => setState(prev => ({ ...prev, isUnreadByCollapsed: !prev.isUnreadByCollapsed }))}>
                                                <h6 className="m-2">Not seen yet</h6>
                                            </div>
                                            <div className={`chat-info-group-body collapse ${!isUnreadByCollapsed ? 'show' : ''}`} id="participants-list">
                                                <div className="chat-info-group-content list-item-has-padding">
                                                    <ul className="list-group list-group-flush">
                                                        {unreadByArr.map((item) => {
                                                            return (<MessageReader item={item} key={item.id} />);
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>}
                                    </div>
                                </div>}
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            console.error(error);
        }
    }
}
