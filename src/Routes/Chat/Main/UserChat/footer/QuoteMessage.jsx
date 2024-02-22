import React from 'react'
import MessageHeader from '../message/Options/MessageHeader';
import { format_all, getBackgroundColorClass } from 'redux/common';
import { X } from 'react-bootstrap-icons';
import { getMediaSVG } from 'Routes/Chat/Sidebar/Chat';
import { CONST } from 'utils/constants';
import { useSelector } from 'react-redux';

export const QuoteMessage = ({ quoteMessage, onCloseQuoteHandler }) => {
    const { user } = useSelector(state => state.user);
    if (quoteMessage) {
        try {
            const msgText = quoteMessage.message?.startsWith('\n') ? format_all(quoteMessage?.message?.substring(1)) : format_all(quoteMessage.message);
            return (
                <div className="quote-message align-items-center">
                    <div className="message overflow-hidden">
                        <div className="message-wrapper">
                            <div className={`message-content ${getBackgroundColorClass(quoteMessage.type)} ${!quoteMessage?.isMessage ? 'border-white' : ''}`} style={{ fontSize: user?.fontSize }}>
                                {user.id !== quoteMessage.sendBy &&
                                    <MessageHeader forceView={true} item={quoteMessage} mType={true} />}
                                {!quoteMessage.mediaType ? <>
                                    <div className={`message-text`}>
                                        {(quoteMessage.subject || quoteMessage.patient) && (!quoteMessage.message?.startsWith('\n')) &&
                                            <span className='font-weight-semibold'>
                                                {`${quoteMessage.isMessage ? 'Message: ' : 'Task: '}`}
                                            </span>}
                                        <span dangerouslySetInnerHTML={{ __html: format_all(msgText) }}></span>
                                    </div>
                                </>
                                    : <>
                                        <div className="contacts-texts d-flex m-0 text-color">
                                            {quoteMessage.mediaType.startsWith(CONST.MEDIA_TYPE.IMAGE) && getMediaSVG(CONST.MEDIA_TYPE.IMAGE)}
                                            {quoteMessage.mediaType.startsWith(CONST.MEDIA_TYPE.VIDEO) && getMediaSVG(CONST.MEDIA_TYPE.VIDEO)}
                                            {quoteMessage.mediaType.startsWith(CONST.MEDIA_TYPE.AUDIO) && getMediaSVG(CONST.MEDIA_TYPE.AUDIO)}
                                            {quoteMessage.mediaType.startsWith(CONST.MEDIA_TYPE.APPLICATION) && getMediaSVG(CONST.MEDIA_TYPE.APPLICATION)}
                                            <p className="text-truncate text-color mb-0 ml-1">{quoteMessage.fileName}</p>
                                        </div>
                                    </>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onCloseQuoteHandler} className='btn btn-outline btn-sm'>
                        <X size={20} />
                    </button>
                </div>
            )

        } catch (error) {
            console.error(error);
        }
    }
}