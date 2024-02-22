import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import { DOCUMENT, DocumentFile, MEDIA } from '../../../../Models/MediaFiles';
import { onImageGalleryOpen } from '../../message/Message';
import { getMediaFiles } from 'redux/actions/chatAction';
import { getImageURL } from 'redux/common';
import { ArrowRightCircle } from 'react-bootstrap-icons';
import { CONST } from 'utils/constants';
import { dispatch } from 'redux/store';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { CHAT_MODELS } from 'Routes/Chat/Models/models';
import ErrorBoundary from 'Components/ErrorBoundry';
import { defaultUserState } from '../..';

const deafultState = {
    isMediaCollapsed: false,
    isDocCollapsed: false
};
export const PrivateChatInfo = ({
    SetUserChatState
}) => {
    const { user } = useSelector((state) => state.user);
    const { activeChat, mediaFiles, documentFiles } = useSelector((state) => state.chat);
    const [state, setState] = useState(deafultState);
    const { isMediaCollapsed, isDocCollapsed } = state;
    const mediaRef = useRef();
    const openMediaDocsHandler = useCallback(async (type) => {
        changeModel(CHAT_MODELS.MEDIA_FILES);
        dispatch({ type: CHAT_CONST.SET_MEDIA_FILE_TYPE, payload: type });
    }, []);

    const openPdfViewer = useCallback((item) => {
        changeModel(CHAT_MODELS.PDF_VIEWER);
        dispatch({ type: CHAT_CONST.SET_PDF_URL, payload: item.mediaUrl, fileName: item.fileName, id: item.id });
    }, []);

    useEffect(() => {
        setTimeout(() => {
            getMediaFiles(activeChat.id, 'media', '');
            getMediaFiles(activeChat.id, 'document', '');
        }, 1000);
        return () => {
            setState(deafultState);
            dispatch({ type: CHAT_CONST.SET_MEDIA_FILES, payload: [] });
            dispatch({ type: CHAT_CONST.SET_DOCUMENT_FILES, payload: [] });
        }
        //eslint-disable-next-line
    }, [activeChat.id,]);

    const chatUser = useMemo(() => activeChat.chatusers.find(item => item.userId !== user.id)?.user || ((activeChat.users[0] === activeChat.users[1]) ? activeChat.chatusers[0]?.user : null)
        , [activeChat.chatusers, activeChat.users, user.id]);

    return (
        <ErrorBoundary>
            <div className={`chat-info chat-info-visible`}>
                <div className="d-flex h-100 flex-column">
                    <div className="chat-info-header px-2">
                        <div className="container-fluid">
                            <ul className="nav justify-content-between align-items-center">
                                <li className="text-center">
                                    <h5 className="text-truncate mb-0">Profile Details</h5>
                                </li>
                                <li className="nav-item list-inline-item">
                                    <div className="nav-link text-muted px-0" data-chat-info-close="" onClick={() => {
                                        SetUserChatState(prev => ({ ...prev, chatInfoVisible: false, isSearchOpen: defaultUserState.isSearchOpen }))
                                    }}>
                                        <svg className="hw-22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="hide-scrollbar flex-fill">
                        <div className="text-center p-3">
                            <div className="avatar avatar-xl mx-5 mb-3">
                                <img className="avatar-img" src={getImageURL(activeChat.type === CONST.CHAT_TYPE.PRIVATE ? chatUser?.profilePicture : activeChat?.image, '120x120')} alt="" />
                            </div>
                            <h5 className="mb-1">{chatUser.name}</h5>
                            {chatUser?.companyRoleData &&
                                <p className="light-text-70 d-flex align-items-center justify-content-center mb-1">
                                    <span className='desg-tag'>{chatUser.companyRoleData?.name}</span>
                                </p>}
                            {chatUser?.companyName &&
                                <p className="text-color d-flex align-items-center justify-content-center mb-1">
                                    {chatUser.companyName}
                                </p>}
                        </div>
                        <div className="chat-info-group">
                            <div className="chat-info-group-header" data-toggle="collapse"
                                role="button" aria-expanded="true" aria-controls="profile-info">
                                <h6 className="mb-0">User Information</h6>
                                <svg className="hw-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="chat-info-group-body collapse show" id="profile-info">
                                <div className="chat-info-group-content list-item-has-padding">
                                    <ul className="list-group list-group-flush ">
                                        <li className="list-group-item border-0">
                                            <p className="small text-muted mb-0">Phone</p>
                                            {chatUser?.phone ? <p className="mb-0">{chatUser.phone}</p> :
                                                <p className='text-muted mb-0'>{'(Not added yet)'}</p>}
                                        </li>
                                        <li className="list-group-item border-0">
                                            <p className="small text-muted mb-0">Email</p>
                                            {chatUser?.email ? <p className="mb-0">{chatUser.email}</p> :
                                                <p className='text-muted mb-0'>{'(Not added yet)'}</p>}
                                        </li>
                                        <li className="list-group-item border-0">
                                            <p className="small text-muted mb-0">Address</p>
                                            {chatUser?.address ? <p className="mb-0">{chatUser.address}</p> :
                                                <p className='text-muted mb-0'>{'(Not added yet)'}</p>}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="chat-info-group">
                            <div className={`chat-info-group-header ${isMediaCollapsed ? 'collapsed' : ''}`} data-toggle="collapse" href="#shared-media" role="button" aria-expanded={!isMediaCollapsed} aria-controls="shared-media" onClick={() => {
                                setState(prev => ({ ...prev, isMediaCollapsed: !prev.isMediaCollapsed }));
                            }}>
                                <h6 className="mb-0">Last Media</h6>
                                <svg className="hw-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div ref={mediaRef} className={`chat-info-group-body collapse ${!isMediaCollapsed ? 'show' : ''}`} id="shared-media">
                                <div className="chat-info-group-content">
                                    {mediaFiles.length > 0 && <div className="media-wrapper">
                                        {mediaFiles[0] && <div className="media-image">
                                            <div className="cursor-pointer"
                                                onClick={() => onImageGalleryOpen(mediaFiles[0].id)}
                                            >
                                                <img src={getImageURL(mediaFiles[0]?.mediaUrl, '80x80')} className="img-fluid rounded border" alt="" />
                                            </div>
                                        </div>}
                                        {mediaFiles[1] && <div className="media-image">
                                            <div className="cursor-pointer"
                                                onClick={() => onImageGalleryOpen(mediaFiles[1].id)}
                                            >
                                                <img src={getImageURL(mediaFiles[1]?.mediaUrl, '80x80')} className="img-fluid rounded border" alt="" />
                                            </div>
                                        </div>}
                                        {mediaFiles.length >= 3 && <div className="media-image">
                                            <div className="cursor-pointer" onClick={() => openMediaDocsHandler(MEDIA)}>
                                                <ArrowRightCircle className='img-fluid' size={26} />
                                            </div>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div className="chat-info-group">
                            <div className={`chat-info-group-header ${isDocCollapsed ? 'collapsed' : ''}`} data-toggle="collapse" href="#shared-files" role="button" aria-expanded={!isDocCollapsed} aria-controls="shared-files" onClick={() =>
                                setState(prev => ({ ...prev, isDocCollapsed: !prev.isDocCollapsed }))
                            }>
                                <h6 className="mb-0">Documents</h6>
                                <svg className="hw-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <div className={`chat-info-group-body collapse ${!isDocCollapsed ? 'show' : ''}`} id="shared-files">
                                <div className="chat-info-group-content list-item-has-padding">
                                    <ul className="list-group list-group-flush">
                                        {documentFiles[0] && <DocumentFile item={documentFiles[0]} key={0} file={documentFiles[0]} openPdfViewer={openPdfViewer} />}
                                        {documentFiles[1] && <DocumentFile item={documentFiles[1]} key={1} file={documentFiles[1]} openPdfViewer={openPdfViewer} />}
                                        {documentFiles[2] && <DocumentFile item={documentFiles[2]} key={2} file={documentFiles[2]} openPdfViewer={openPdfViewer} />}
                                        {documentFiles.length > 3 && <li className="list-group-item">
                                            <div className="document" onClick={() => openMediaDocsHandler(DOCUMENT)}>
                                                <div className="btn btn-primary btn-icon rounded-circle text-light mr-2">
                                                    <ArrowRightCircle className='img-fluid' size={26} />
                                                </div>
                                                <div className="document-body">
                                                    <p>View More</p>
                                                </div>
                                            </div>
                                        </li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
