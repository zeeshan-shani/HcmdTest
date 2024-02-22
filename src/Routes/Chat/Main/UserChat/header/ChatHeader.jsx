import React, { useCallback } from 'react'
import { useSelector } from "react-redux";
import { changeTask } from 'redux/actions/modelAction';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { Archive, ArrowLeft, ChatRightText, Gear, InfoCircle, Journal, ListTask, Search, Star, ThreeDotsVertical } from 'react-bootstrap-icons';
import { MuiTooltip } from 'Components/components';
import { getImageURL, getProfileStatus } from 'redux/common';
import moment from 'moment-timezone';
import { CONST } from 'utils/constants';
import { defaultUserState } from 'Routes/Chat/Main/UserChat';
import { dispatch } from 'redux/store';
import { CHAT_MODELS } from 'Routes/Chat/Models/models';
import { getGhostAccess } from 'utils/permission';
import { useNavigate } from 'react-router-dom';
import { showError } from 'utils/package_config/toast';
import { getPatientName } from 'Components/Modals/PatientInfoModal';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Badge } from 'react-bootstrap';

export default function ChatHeader({
    isSearchOpen,
    SetUserChatState,
}) {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const { activeChat, activeCategoryChat, activePatientChat } = useSelector((state) => state.chat);

    const onCloseActiveChat = useCallback(() => {
        if (activePatientChat) dispatch({ type: CHAT_CONST.SET_ACTIVE_PATIENT_CHAT, payload: null })
        if (activeCategoryChat) dispatch({ type: CHAT_CONST.SET_ACTIVE_CATEGORY_CHAT, payload: null })

        navigate(CONST.APP_ROUTES.CHAT);
        dispatch({ type: CHAT_CONST.DELETE_ACTIVE_CHAT })
    }, [activePatientChat, activeCategoryChat, navigate]);

    const onTaskClickHandler = useCallback(() => () => changeTask(CHAT_MODELS.TODO), []);

    const onNotesClickHandler = useCallback(() => changeTask(CHAT_MODELS.NOTES), []);

    const onArchive = useCallback(() => changeTask(CHAT_MODELS.TEMPLATE_TASKS), []);

    const onMessageTemplate = useCallback(() => changeTask(CHAT_MODELS.GROUP_FORMS), []);

    const OnClickImportant = useCallback(() => {
        changeTask(CHAT_MODELS.IMPORTANT_ITEM);
    }, []);

    const setInspectUser = useCallback(() => {
        if (activeChat.type === CONST.CHAT_TYPE.PRIVATE) {
            const privUsrId = activeChat.users.find(item => item !== user.id);
            const privateUser = activeChat?.chatusers?.find((item) => item.userId === privUsrId)?.user;
            privateUser ?
                dispatch({ type: CHAT_CONST.SET_INSPECT_USER, payload: privateUser }) :
                showError("User is not available")
        }
    }, [activeChat?.chatusers, activeChat.type, activeChat.users, user.id]);

    const setInspectPatient = useCallback(() => {
        activePatientChat &&
            dispatch({ type: CHAT_CONST.SET_INSPECT_PATIENT, payload: activePatientChat })
    }, [activePatientChat]);

    const OnClickSetting = () => changeTask("settings");

    const ClickOnViewInfo = useCallback(() =>
        SetUserChatState(prev => ({
            ...prev,
            chatInfoVisible: !prev.chatInfoVisible,
            isSearchOpen: defaultUserState.isSearchOpen
        })), [SetUserChatState]);

    const OnClickSearch = useCallback(() => {
        // setJustSearch(true);
        if (isSearchOpen?.hide)
            return SetUserChatState(prev => ({
                ...prev,
                isSearchOpen: { ...prev.isSearchOpen, hide: false }
            }));
        if (isSearchOpen?.isOpen)
            return SetUserChatState(prev => ({
                ...prev,
                isSearchOpen: defaultUserState.isSearchOpen
            }))
        SetUserChatState(prev => ({
            ...prev, isSearchOpen: {
                ...prev.isSearchOpen,
                isOpen: !prev.isSearchOpen?.isOpen,
                chatInfoVisible: false
            }
        }))
    }, [SetUserChatState, isSearchOpen?.hide, isSearchOpen?.isOpen]);

    if (activeChat && activeChat?.id !== -1) {
        try {
            let chatheader = { profileStatus: '', profilePicture: '', header: '', subheader: '' }
            const ghostOn = (getGhostAccess(user) && !activeChat?.users.includes(user.id));
            if (activeChat.type === CONST.CHAT_TYPE.PRIVATE) {
                const privUsrId = activeChat.users.find(item => item !== user.id) || ((activeChat.users[0] === activeChat.users[1]) ? activeChat.chatusers[0].user.id : null);
                const privateUser = activeChat?.chatusers?.find(item => item.userId === privUsrId)?.user;
                chatheader.profilePicture = privateUser?.profilePicture || '';
                if (!ghostOn) chatheader.profileStatus = getProfileStatus(privateUser?.profileStatus ? privateUser.profileStatus : CONST.PROFILE.OFFLINE);
                chatheader.header = (privateUser?.id === user?.id ? `${privateUser?.name} (You)` : privateUser?.name) || 'Unknown user';
                if (privateUser?.profileStatus === CONST.PROFILE.OFFLINE && privateUser?.lastSeen)
                    chatheader.subheader = `last seen ${moment(privateUser?.lastSeen).fromNow()}`;
                else chatheader.subheader = privateUser?.profileStatus;
            } else if (activeChat.type === CONST.CHAT_TYPE.GROUP) {
                chatheader.subheader = `${activeChat.chatusers.length} Participants`;
                chatheader.profilePicture = activeChat?.image || '';
                chatheader.header = activeChat.name || 'Unknown group';
            }
            if (ghostOn) {
                chatheader.profilePicture = CONST.GHOST_IMAGE || '';
                if (activeChat.type === CONST.CHAT_TYPE.PRIVATE) {
                    chatheader.header = activeChat.chatusers.filter(item => !item?.isGhostChat).map((usr) => usr?.user?.name).join(' & ')
                    chatheader.subheader = 'You are ghost';
                }
            }
            return (
                <div className="chat-header bg__chat-dark">
                    <button className="btn btn-secondary btn-icon btn-minimal btn-sm  d-xl-none" type="button" onClick={onCloseActiveChat}>
                        <ArrowLeft size={20} />
                    </button>
                    <MuiTooltip title={activeChat.type === CONST.CHAT_TYPE.PRIVATE ? 'Click to view info' : ''}>
                        <div className={`media chat-name align-items-center text-truncate ${activeChat.type === CONST.CHAT_TYPE.PRIVATE ? 'cursor-pointer' : ''}`} onClick={setInspectUser}>
                            <div className={`avatar d-none d-sm-inline-block mr-3 ${chatheader.profileStatus}`}>
                                <img src={getImageURL(chatheader.profilePicture, '50x50')} alt="" />
                            </div>
                            <div className="media-body align-self-center light-text-70">
                                <h6 className="text-truncate mb-0 username-text">
                                    {chatheader.header}
                                </h6>
                                <small className="">{chatheader.subheader}</small>
                            </div>
                        </div>
                    </MuiTooltip>

                    {/* <!-- Chat Options --> */}
                    <ul className="nav flex-nowrap">
                        <li className="nav-item list-inline-item mx-1">
                            {/* d-none d-md-block */}
                            <MuiTooltip title="Search">
                                <div className="nav-link btn-svg px-1" onClick={OnClickSearch}>
                                    <Search />
                                </div>
                            </MuiTooltip>
                        </li>
                        <li className="nav-item list-inline-item d-none d-md-block mx-1">
                            <MuiTooltip title="Info">
                                <div className="nav-link btn-svg px-1" onClick={ClickOnViewInfo}>
                                    <InfoCircle />
                                </div>
                            </MuiTooltip>
                        </li>
                        <li className="nav-item list-inline-item d-none chat-header-opt-item mr-0">
                            <div className="dropdown">
                                <div className="btn nav-link light-text-70 px-0" id="chatOptions" data-bs-toggle="dropdown">
                                    <ThreeDotsVertical size={user?.fontSize} />
                                </div>
                                <ul className="dropdown-menu dropdown-menu-right m-0" aria-labelledby="chatOptions" style={{ fontSize: user?.fontSize }}>
                                    <li className="dropdown-item align-items-center d-md-none" onClick={ClickOnViewInfo}>
                                        <InfoCircle size={user?.fontSize} className="mr-2" />
                                        <span>View Info</span>
                                    </li>
                                    {/* <li className="dropdown-item align-items-center d-md-none" onClick={OnClickSearch}>
                                        <Search size={user?.fontSize} className="mr-2" />
                                        <span>Search</span>
                                    </li> */}
                                    <li className="dropdown-item align-items-center d-flex" onClick={onMessageTemplate}>
                                        <ChatRightText size={user?.fontSize} className="mr-2" />
                                        <span>Message Template</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={OnClickImportant}>
                                        <Star size={user?.fontSize} className="mr-2" />
                                        <span>Important</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={onTaskClickHandler}>
                                        <ListTask size={user?.fontSize} className="mr-2" />
                                        <span>Tasks</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={onNotesClickHandler}>
                                        <Journal size={user?.fontSize} className="mr-2" />
                                        <span>All Notes</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={onArchive}>
                                        <Archive size={user?.fontSize} className="mr-2" />
                                        <span>Templates</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={OnClickSetting}>
                                        <Gear size={user?.fontSize} className="mr-2" />
                                        <span>Settings</span>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>);
        } catch (error) {
            console.error(error);
        }
    }
    else if (activePatientChat) {
        return (
            <div className="chat-header bg__chat-dark">
                <button className="btn btn-secondary btn-icon btn-minimal btn-sm d-xl-none" type="button" onClick={onCloseActiveChat}>
                    <ArrowLeft size={20} />
                </button>
                <MuiTooltip title={'Click to view info'}>
                    <div className={`media chat-name align-items-center text-truncate ${activeChat.type === CONST.CHAT_TYPE.PRIVATE ? 'cursor-pointer' : ''}`} onClick={setInspectPatient}>
                        <div className={`avatar d-none d-sm-inline-block mr-3 ${activePatientChat.profileStatus}`}>
                            <img src={getImageURL(activePatientChat.profilePicture, '50x50')} alt="" />
                        </div>
                        <div className="media-body align-self-center light-text-70">
                            <h6 className="text-truncate mb-0 username-text">
                                {getPatientName(activePatientChat.lastName, activePatientChat.firstName, activePatientChat.middleName)}
                            </h6>
                            {/* <small className="">{activePatientChat.subheader}</small> */}
                            <Badge bg='info' className='text-white px-1'>Patient</Badge>
                        </div>
                    </div>
                </MuiTooltip>

                {/* <!-- Chat Options --> */}
                {activeChat?.id !== -1 &&
                    <ul className="nav flex-nowrap align-items-center gap-5">
                        <li className="nav-item list-inline-item d-none d-md-block">
                            <MuiActionButton size='small' color='default' tooltip='Search' Icon={Search} onClick={OnClickSearch} />
                        </li>
                        <li className="nav-item list-inline-item d-none d-md-block">
                            <MuiActionButton size='small' color='default' tooltip='Info' Icon={InfoCircle} onClick={ClickOnViewInfo} />
                        </li>
                        <li className="nav-item list-inline-item d-none chat-header-opt-item">
                            <div className="dropdown">
                                <div className="btn nav-link light-text-70" id="chatOptions" data-bs-toggle="dropdown">
                                    <ThreeDotsVertical size={user?.fontSize} />
                                </div>
                                <ul className="dropdown-menu dropdown-menu-right m-0" aria-labelledby="chatOptions" style={{ fontSize: user?.fontSize }}>
                                    <li className="dropdown-item align-items-center d-md-none" onClick={ClickOnViewInfo}>
                                        <InfoCircle size={user?.fontSize} className="mr-2" />
                                        <span>View Info</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-md-none" onClick={OnClickSearch}>
                                        <Search size={user?.fontSize} className="mr-2" />
                                        <span>Search</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={onMessageTemplate}>
                                        <ChatRightText size={user?.fontSize} className="mr-2" />
                                        <span>Message Template</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={OnClickImportant}>
                                        <Star size={user?.fontSize} className="mr-2" />
                                        <span>Important</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={onTaskClickHandler}>
                                        <ListTask size={user?.fontSize} className="mr-2" />
                                        <span>Tasks</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={onNotesClickHandler}>
                                        <Journal size={user?.fontSize} className="mr-2" />
                                        <span>All Notes</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={onArchive}>
                                        <Archive size={user?.fontSize} className="mr-2" />
                                        <span>Templates</span>
                                    </li>
                                    <li className="dropdown-item align-items-center d-flex" onClick={OnClickSetting}>
                                        <Gear size={user?.fontSize} className="mr-2" />
                                        <span>Settings</span>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>}
            </div>);
    }
    else if (activeCategoryChat) {
        return (
            <div className="chat-header bg__chat-dark">
                <button className="btn btn-secondary btn-icon btn-minimal btn-sm d-xl-none" type="button" onClick={onCloseActiveChat}>
                    <ArrowLeft size={20} />
                </button>
                <div className={`media chat-name align-items-center text-truncate gap-10`}>
                    <div className='color-circle mr-1' style={activeCategoryChat.colorCode ?
                        { background: activeCategoryChat.colorCode } : {}} />
                    <div className="media-body align-self-center light-text-70">
                        <h6 className="text-truncate mb-0 username-text">
                            {activeCategoryChat.name}
                        </h6>
                        <Badge bg='info' className='text-white px-1'>Category</Badge>
                    </div>
                </div>
            </div>);
    }
}