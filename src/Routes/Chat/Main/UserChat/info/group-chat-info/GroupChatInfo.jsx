import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { DOCUMENT, DocumentFile, MEDIA } from 'Routes/Chat/Models/MediaFiles';
import { onImageGalleryOpen } from '../../message/Message';
import { ChatMember } from './ChatMember';
import { CONST, SOCKET } from 'utils/constants';
import { getMediaFiles } from 'redux/actions/chatAction';
import { ArrowRightCircle, ArrowRightSquare, PersonDash } from 'react-bootstrap-icons';
import { getImageURL } from 'redux/common';
import { dispatch } from 'redux/store';
import { CHAT_MODELS } from 'Routes/Chat/Models/models';
import { defaultUserState } from '../..';
import ErrorBoundary from 'Components/ErrorBoundry';
import { MuiActionButton, MuiCloseAction } from 'Components/MuiDataGrid';
import { Edit, Link, PersonAdd, PersonPinCircle } from '@mui/icons-material';
import { base } from 'utils/config';
import { showSuccess } from 'utils/package_config/toast';

const defaultState = {
    isUsersCollapsed: false,
    isMediaCollapsed: false,
    isDocCollapsed: false,
    unraedReadTime: false,
    isRequesting: false,
    copied: false
}

export const GroupChatInfo = ({ SetUserChatState, ghostOn }) => {
    const { activeChat, mediaFiles, documentFiles } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.user);
    const [state, setState] = useState(defaultState);
    const isUserAdmin = activeChat.chatusers.find(item => item.user.id === user.id)?.isAdmin;
    const { isUsersCollapsed, isMediaCollapsed, isDocCollapsed } = state;

    const openMediaDocsHandler = useCallback(async (type) => {
        changeModel(CHAT_MODELS.MEDIA_FILES);
        dispatch({ type: CHAT_CONST.SET_MEDIA_FILE_TYPE, payload: type });
    }, []);
    const openPdfViewer = useCallback((item) => {
        changeModel(CHAT_MODELS.PDF_VIEWER);
        dispatch({ type: CHAT_CONST.SET_PDF_URL, payload: item.mediaUrl, fileName: item.fileName, id: item.id });
    }, [])

    useEffect(() => {
        setTimeout(() => {
            getMediaFiles(activeChat.id, 'media', '');
            getMediaFiles(activeChat.id, 'document', '');
        }, 1000);
        return () => {
            setState(defaultState);
            dispatch({ type: CHAT_CONST.SET_MEDIA_FILES, payload: [] });
            dispatch({ type: CHAT_CONST.SET_DOCUMENT_FILES, payload: [] });
        }
        //eslint-disable-next-line
    }, [activeChat.id]);

    const onClickAddUser = useCallback(() => changeModel(CHAT_MODELS.ADD_USER_TO_GROUP), []);
    const onClickgroupInfo = useCallback(() => changeModel(CHAT_MODELS.UPDATE_GROUP_DEATILS), []);
    const onClickLeaveGroup = useCallback(() =>
        SocketEmiter(SOCKET.REQUEST.REMOVE_MEMBER, { chatId: activeChat.id, userId: user.id }), [activeChat.id, user.id]);

    const onCopyGroupLink = useCallback(() => {
        // const groupLink = API_Payload_ENC({ payload: `${activeChat.id}`, prevent: false, string: "" });
        const groupLink = btoa(`chatId=${activeChat.id},userId=${user.id}`);
        const InviteLink = `${base.FURL}/chats/groupInvite/${groupLink}`;
        navigator.clipboard.writeText(InviteLink);
        setState(prev => ({ ...prev, copied: true }));
        setTimeout(() => setState(prev => ({ ...prev, copied: false })), 5000);
        showSuccess("Group Invite link copied successfully")
    }, [activeChat.id, user.id]);

    return (
        <ErrorBoundary>
            <div className={`chat-info chat-info-visible`}>
                <div className="d-flex h-100 flex-column">
                    <div className="chat-info-header px-2">
                        <div className="container-fluid">
                            <ul className="nav justify-content-between align-items-center">
                                <li className="text-center">
                                    <h5 className="text-truncate mb-0">Chat Details</h5>
                                </li>
                                <MuiCloseAction
                                    className="text-color"
                                    onClick={() =>
                                        SetUserChatState(prev => ({
                                            ...prev,
                                            chatInfoVisible: false,
                                            isSearchOpen: defaultUserState.isSearchOpen
                                        }))
                                    }
                                />
                            </ul>
                        </div>
                    </div>
                    <div className="hide-scrollbar flex-fill">
                        <div className="border-bottom text-center p-3">
                            <div className="avatar text-light avatar-xl mx-5 mb-3 position-relative">
                                <img className="avatar-img" src={getImageURL(ghostOn ? CONST.GHOST_IMAGE : activeChat?.image, '120x120')} alt="" />
                            </div>
                            <h5 className="mb-1">{activeChat.type === CONST.CHAT_TYPE.PRIVATE && ghostOn ? 'Ghost Chat' : activeChat.name}</h5>
                            <div className="text-muted d-flex align-items-center justify-content-center mb-1">
                                <PersonPinCircle />
                                <p className='mb-0'>
                                    {`${activeChat.chatusers.length} Participants`}
                                </p>
                            </div>
                            {!ghostOn && <>
                                <div className="d-flex align-items-center justify-content-center gap-10">
                                    {isUserAdmin &&
                                        <MuiActionButton
                                            tooltip="Add Member"
                                            onClick={onClickAddUser}
                                            Icon={PersonAdd}
                                        // className="icon-btn-border"
                                        />}
                                    {isUserAdmin &&
                                        <MuiActionButton
                                            tooltip="Edit Group info"
                                            onClick={onClickgroupInfo}
                                            Icon={Edit}
                                        // className="icon-btn-border"
                                        />}
                                    <MuiActionButton
                                        tooltip="Leave from group"
                                        Icon={PersonDash}
                                        className="text-danger"
                                        onClick={onClickLeaveGroup}
                                    />
                                    {isUserAdmin &&
                                        <MuiActionButton
                                            tooltip="Invite via link"
                                            Icon={Link}
                                            className={state.copied ? "text-success" : "text-muted"}
                                            onClick={onCopyGroupLink}
                                        />}
                                </div>
                            </>}
                            {activeChat?.description &&
                                <div className="chat-description text-left mt-1">
                                    <p className='mb-0 text-color'>Description:
                                        <span className='fs-14 mx-1'>{activeChat?.description}</span>
                                    </p>
                                </div>}
                        </div>
                        <div className="chat-info-group">
                            <div className={`chat-info-group-header ${isUsersCollapsed ? 'collapsed' : ''}`} data-toggle="collapse" role="button" aria-expanded={!isUsersCollapsed} aria-controls="participants-list" onClick={() => setState(prev => ({ ...prev, isUsersCollapsed: !prev.isUsersCollapsed }))}>
                                <h6 className="mb-0">Group Participants</h6>
                                <svg className="hw-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className={`chat-info-group-body collapse ${!isUsersCollapsed ? 'show' : ''}`} id="participants-list">
                                <div className="chat-info-group-content list-item-has-padding">
                                    <ul className="list-group list-group-flush">
                                        {activeChat.chatusers
                                            .sort(compareName)
                                            .map((item) => {
                                                return (<ChatMember item={item} key={item.userId || item.id} isUserAdmin={isUserAdmin} />);
                                            })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="chat-info-group">
                            <div className={`chat-info-group-header ${isMediaCollapsed ? 'collapsed' : ''}`} data-toggle="collapse" role="button" aria-expanded={!isMediaCollapsed} aria-controls="shared-media" onClick={() => setState(prev => ({ ...prev, isMediaCollapsed: !prev.isMediaCollapsed }))}>
                                <h6 className="mb-0">Last Media</h6>
                                <svg className="hw-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className={`chat-info-group-body collapse ${!isMediaCollapsed ? 'show' : ''}`} id="shared-media">
                                <div className="chat-info-group-content">
                                    {mediaFiles?.length > 0 &&
                                        <div className="media-wrapper">
                                            {mediaFiles[0] && <div className="media-image">
                                                <div className="cursor-pointer" onClick={() => onImageGalleryOpen(mediaFiles[0].id)}>
                                                    {mediaFiles[0].mediaType.split("/").shift() === "image" ?
                                                        <img src={getImageURL(mediaFiles[0]?.mediaUrl, '80x80')} className="img-fluid rounded border" alt="" />
                                                        : <video className="img-fluid rounded border">
                                                            <source src={mediaFiles[0].mediaUrl} type="video/mp4" />
                                                            <source src={mediaFiles[0].mediaUrl} type="video/ogg" />
                                                            Your browser does not support the video tag.
                                                        </video>}
                                                </div>
                                            </div>}
                                            {mediaFiles[1] && <div className="media-image">
                                                <div className="cursor-pointer" onClick={() => onImageGalleryOpen(mediaFiles[1].id)}>
                                                    {mediaFiles[1].mediaType.split("/").shift() === "image" ?
                                                        <img src={getImageURL(mediaFiles[1]?.mediaUrl, '80x80')} className="img-fluid rounded border" alt="" />
                                                        : <video className="img-fluid rounded border">
                                                            <source src={mediaFiles[1].mediaUrl} type="video/mp4" />
                                                            <source src={mediaFiles[1].mediaUrl} type="video/ogg" />
                                                            Your browser does not support the video tag.
                                                        </video>}
                                                </div>
                                            </div>}
                                            {mediaFiles.length > 2 && <div className="media-image">
                                                <div className="cursor-pointer" onClick={() => openMediaDocsHandler(MEDIA)}>
                                                    <ArrowRightSquare className='img-fluid' size={26} />
                                                </div>
                                            </div>}
                                        </div>}
                                </div>
                            </div>
                        </div>
                        <div className="chat-info-group">
                            <div className={`chat-info-group-header ${isDocCollapsed ? 'collapsed' : ''}`} data-toggle="collapse" role="button" aria-expanded={!isDocCollapsed} aria-controls="shared-files" onClick={() => setState(prev => ({ ...prev, isDocCollapsed: !prev.isDocCollapsed }))}>
                                <h6 className="mb-0">Documents</h6>
                                <svg className="hw-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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

export const compareByName = (a, b) => {
    if (a?.name && b?.name) {
        if (a.name.trim() > b.name.trim()) return 1;
        if (a.name.trim() < b.name.trim()) return -1;
    }
    return 0;
};
export const compareName = (a, b) => {
    if (a?.user?.name && b?.user?.name) {
        if (a.user.name.toLowerCase() > b.user.name.toLowerCase()) return 1;
        if (a.user.name.toLowerCase() < b.user.name.toLowerCase()) return -1;
    }
    return 0;
};
