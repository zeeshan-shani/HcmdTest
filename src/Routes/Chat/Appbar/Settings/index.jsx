import React, { useCallback, useEffect, useState } from 'react'
import { dispatch } from 'redux/store';
import { X } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { saveNotificationSettings } from 'redux/actions/chatAction';
import { changeTask } from 'redux/actions/modelAction';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { AllowSendMessage } from './AllowSendMessage';
import { MuteSound } from './MuteSound';
import { ChatSettings } from './ChatSettings';

export default function Settings({ taskName }) {
    const { user } = useSelector((state) => state.user);
    const { activeChat } = useSelector((state) => state.chat);
    const userData = activeChat?.chatusers?.find(item => item.userId === user.id);
    const isRoutineNotificationMute = userData?.isRoutineNotificationMute || false;
    const isEmergencyNotificationMute = userData?.isEmergencyNotificationMute || false;
    const isUrgentNotificationMute = userData?.isUrgentNotificationMute || false;
    const isChatImportantChat = userData?.isImportantChat || false;

    const [state, setState] = useState({
        muteAllNotification: isRoutineNotificationMute && isEmergencyNotificationMute && isUrgentNotificationMute,
        routineNotification: isRoutineNotificationMute,
        emergencyNotification: isEmergencyNotificationMute,
        urgentNotification: isUrgentNotificationMute,
        isImportantChat: isChatImportantChat,
        allowSendMessage: !activeChat.allowOnlyAdminMessage,
    });
    const { muteAllNotification, routineNotification, emergencyNotification, urgentNotification, allowSendMessage, isImportantChat } = state;

    const onCloseHandler = () => changeTask();

    const OnChangeMuteAllHandler = useCallback((e) => {
        setState(prev => ({ ...prev, muteAllNotification: e.target.checked }));
        // setMuteAllNotification(e.target.checked);
        if (routineNotification !== e.target.checked) setState(prev => ({ ...prev, routineNotification: e.target.checked }));
        if (emergencyNotification !== e.target.checked) setState(prev => ({ ...prev, emergencyNotification: e.target.checked }));
        if (urgentNotification !== e.target.checked) setState(prev => ({ ...prev, urgentNotification: e.target.checked }));
    }, [emergencyNotification, routineNotification, urgentNotification]);

    useEffect(() => {
        const setData = async () => {
            if (isRoutineNotificationMute !== routineNotification ||
                isEmergencyNotificationMute !== emergencyNotification ||
                isUrgentNotificationMute !== urgentNotification ||
                isChatImportantChat !== isImportantChat) {
                const data = await saveNotificationSettings({
                    chatId: activeChat.id,
                    isImportantChat: isImportantChat,
                    isRoutineNotificationMute: routineNotification,
                    isEmergencyNotificationMute: emergencyNotification,
                    isUrgentNotificationMute: urgentNotification
                });
                if (data.status)
                    dispatch({ type: CHAT_CONST.SET_NOTIFICATION_STATUS, payload: { ...data.data, userId: user.id } });
            }
        }
        setData();
        // eslint-disable-next-line
    }, [activeChat.id, routineNotification, emergencyNotification, urgentNotification, isImportantChat]);

    const onChangeImportant = useCallback((val) => {
        setState(prev => ({ ...prev, isImportantChat: val }));
        if (!val) OnChangeMuteAllHandler({ target: { checked: true } })
    }, [OnChangeMuteAllHandler]);

    return (
        <div className="tab-pane h-100 active" id="quick-settings" role="tabpanel" aria-labelledby="quick-settings-tab">
            <div className="appnavbar-content-wrapper">
                <div className="appnavbar-scrollable-wrapper">
                    <div className="appnavbar-heading sticky-top">
                        <ul className="nav justify-content-between align-items-center">
                            <li className="text-center">
                                <h5 className="text-truncate mb-0">Settings</h5>
                            </li>
                            <li className="nav-item list-inline-item close-btn">
                                <button className='btn-outline-default btn-sm border-0' onClick={onCloseHandler}>
                                    <X size={20} />
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="appnavbar-body">
                        <div className="settings-container p-0">
                            <ChatSettings
                                isImportantChat={isImportantChat}
                                onChangeImportant={onChangeImportant}
                                setState={setState} />
                        </div>
                        <div className="settings-container p-0">
                            <MuteSound
                                OnChangeMuteAllHandler={OnChangeMuteAllHandler}
                                setState={setState}
                                isImportantChat={isImportantChat}
                                routineNotification={routineNotification}
                                emergencyNotification={emergencyNotification}
                                urgentNotification={urgentNotification}
                                muteAllNotification={muteAllNotification} />
                        </div>
                        {userData?.isAdmin &&
                            <div className="settings-container p-0">
                                <AllowSendMessage
                                    allowSendMessage={allowSendMessage}
                                    setState={setState} />
                            </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
