import React from 'react'
import { useSelector } from 'react-redux';
import { getChatBackgroudClass, getUserColor } from 'redux/common'

export default function PreviewMessage() {
    const { user } = useSelector(state => state.user);
    return (
        <div className="message-container content-visibility-visible">
            <div className='message'>
                <div className="message-wrapper">
                    <div className={`chat-content bg-chat-dark ${getChatBackgroudClass(user?.chatWallpaper)}`} id="messageBody">
                        <div className={`message-content position-relative my-2`} style={{ fontSize: user?.fontSize }}>
                            <div className='message-header-user d-flex align-items-center justify-content-between'>
                                <span className={`text-capitalize text-truncate font-weight-medium cursor-pointer ${getUserColor(user?.id)}`}>
                                    {user?.name}
                                </span>
                            </div>
                            <div className='m-4px'>
                                <div className='d-flex message-text'>
                                    <p className="mb-0 " style={{ fontSize: user?.fontSize }}>
                                        <span className='mr-1 font-weight-semibold' style={{ fontSize: user?.fontSize }}>Subject: </span>
                                        <span className="message-subject" dangerouslySetInnerHTML={{ __html: 'Preview subject text' }} />
                                    </p>
                                </div>
                                <div className={`message-text d-flex`}>
                                    <p className="mb-0" style={{ fontSize: user?.fontSize }}>
                                        <span className="message-task-text" dangerouslySetInnerHTML={{ __html: 'This is preview text for preview message.' }} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
