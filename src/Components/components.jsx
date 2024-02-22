// This is a JavaScript code written in the file components.jsx.
// It includes various components and functions related to notifications and select inputs.

import React, { useMemo } from 'react';
import CreatableSelect from 'react-select/creatable';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import { CONST } from 'utils/constants';
import { VolumeMuteFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { dispatch } from 'redux/store';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import Modal from 'antd/lib/modal';

const { confirm } = Modal;

// MuiTooltip component for displaying tooltips
export const MuiTooltip = (props) => {
    try {
        return (
            <Tooltip
                TransitionComponent={Zoom}
                classes={{ popper: "z-index-2000" }}
                className={props?.className ? props.className : ''}
                {...props}
            >
                {props.children}
            </Tooltip>
        );
    } catch (error) {
        console.error(error);
    }
}

// Notification Badge component for displaying notification badges
export const NotificationBadge = ({ myChatDetails }) => {
    const { user } = useSelector(state => state.user);
    const MAX_COUNT_SHOW = CONST.MAX_MESSAGE_COUNT;

    const badges = useMemo(() => [
        {
            id: "patient",
            title: "Patient mention",
            classname: "bg-dr-patient",
            symbol: '+',
            count: myChatDetails?.hasPatientMentionCount,
            isMute: myChatDetails?.isPatientMentionCountMute,
        },
        {
            id: "user",
            title: "You mentioned",
            classname: "bg-at-the-rate",
            symbol: '@',
            count: myChatDetails?.atTheRateMentionMessageCount,
            isMute: myChatDetails?.atTheRateMentionMessageCountMute,
            onClick: () => dispatch({ type: CHAT_CONST.SET_SEARCH_TAGGED, payload: true })
        },
        {
            id: "user-cc",
            title: "CC mentioned",
            classname: "bg-hashtag",
            symbol: '#',
            count: myChatDetails?.hasMentionMessageCount,
            isMute: myChatDetails?.isMentionMessageCountMute,
        },
        {
            id: "emergency",
            title: "Emergency",
            classname: "bg-emergency",
            symbol: myChatDetails?.isEmergencyNotificationMute && <VolumeMuteFill size={14} fill='#fff' />,
            count: myChatDetails?.emergencyUnreadMessageCount,
            isMute: user?.isEmergencyNotificationMute,
        },
        {
            id: "urgent",
            title: "Urgent",
            classname: "bg-urgent",
            symbol: myChatDetails?.isUrgentNotificationMute && <VolumeMuteFill size={14} fill='#fff' />,
            count: myChatDetails?.urgentUnreadMessageCount,
            isMute: user?.isUrgentNotificationMute,
        },
        {
            id: "routine",
            title: "Routine",
            classname: "bg-routine",
            symbol: myChatDetails?.isRoutineNotificationMute && <VolumeMuteFill size={14} fill='#fff' />,
            count: myChatDetails?.routineUnreadMessageCount,
            isMute: user?.isRoutineNotificationMute,
        },
    ], [
        myChatDetails?.atTheRateMentionMessageCount,
        myChatDetails?.atTheRateMentionMessageCountMute,
        myChatDetails?.emergencyUnreadMessageCount,
        myChatDetails?.hasMentionMessageCount,
        myChatDetails?.hasPatientMentionCount,
        myChatDetails?.isEmergencyNotificationMute,
        myChatDetails?.isMentionMessageCountMute,
        myChatDetails?.isPatientMentionCountMute,
        myChatDetails?.isRoutineNotificationMute,
        myChatDetails?.isUrgentNotificationMute,
        myChatDetails?.routineUnreadMessageCount,
        myChatDetails?.urgentUnreadMessageCount,
        user?.isEmergencyNotificationMute,
        user?.isRoutineNotificationMute,
        user?.isUrgentNotificationMute
    ]);
    try {
        return (
            <div className='d-flex'>
                {badges
                    .filter(item => !item.isMute && !!item.count)
                    .map((item) => {
                        const { id, title = '', classname = '', onClick = () => { }, symbol = '', count = 0 } = item;
                        return (
                            <MuiTooltip title={title} key={id}>
                                <div className={`d-flex align-items-center badge badge-rounded text-white ml-50 position-relative badge-custom ${classname}`} onClick={onClick}>
                                    {count <= MAX_COUNT_SHOW ?
                                        <span>{symbol}{` ${count}`}</span> :
                                        <span>{symbol}{MAX_COUNT_SHOW}<span className="badge-plus">+</span></span>}
                                </div>
                            </MuiTooltip>
                        )
                    })}
            </div>
        );
    } catch (error) {
        console.error(error);
    }
}

// MultiSelectTextInput component for displaying a multi-select input field
export const MultiSelectTextInput = (props) => {
    const components = { DropdownIndicator: props.DropdownIndicator };
    const createOption = (label) => ({ label, value: label });
    const handleChange = (value) => props.setValue(value);
    const handleInputChange = (inputValue, action) => {
        if (action.action !== "input-blur" && action.action !== "menu-close") props.setInputValue(inputValue);
    };
    const handleKeyDown = (event) => {
        if (!props.inputValue) return;
        switch (event.key) {
            case 'Enter':
            case 'Tab':
                if (props.value.map(v => v.label.trim()).includes(props.inputValue.trim())) {
                    props.setInputValue('');
                }
                else {
                    // if (!props.customizedSetter && props.inputValue.trim().indexOf(',') > -1) {
                    //     props.setInputValue('');
                    //     const values = props.inputValue.trim().split(',').filter(iv => !props.value.map(v => v.label.trim()).includes(iv.trim()));
                    //     for (let i = 0; i < values.length; i++) {
                    //         props.setValue((oldValue) => [...oldValue, createOption(values[i].trim())]);
                    //     }
                    // }
                    // else {
                    props.setInputValue('');
                    props.setValue([...props.value, createOption(props.inputValue.trim())]);
                    // }
                }
                event.preventDefault();
                break;
            default: break;
        }
    };
    try {
        return (
            <CreatableSelect
                isMulti
                id={props.id}
                instanceId={props.id}
                className={props.className}
                components={components}
                isClearable
                menuIsOpen={false}
                placeholder={props.placeholder}
                onChange={handleChange}
                inputValue={props.inputValue}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                value={props.value}
                classNamePrefix={props.innerClass}
                onFocus={props.onClick}
                onBlur={props.onBlur}
                blurInputOnSelect={false}
                isDisabled={props?.disabled}
                autoFocus={props?.autoFocus}
                styles={{
                    // ...defaultTagStyles,
                    input: (css) => ({
                        ...css,
                        /* expand the Input Component div */
                        width: "100% !important",
                        // width: "auto !important",
                        /* expand the Input Component child div */
                        "> div": {
                            width: "100%"
                        },
                        /* expand the Input Component input */
                        input: {
                            width: "100% !important",
                            textAlign: "left",
                            minWidth: '170px',
                            zIndex: 1500
                        }
                    })
                }}
            />
        );
    } catch (error) {
        console.error(error);
    }
};

// TakeConfirmation component for displaying a confirmation modal
export const TakeConfirmation = ({
    title,
    content = undefined,
    onDone = () => { },
    onCancel = () => { },
    delay = 500,
    ...props
}) => {
    return confirm({
        title,
        content,
        async onOk() {
            return new Promise((resolve, reject) => {
                try {
                    setTimeout(() => {
                        onDone();
                        resolve(1);
                    }, delay);
                } catch (error) {
                    reject(0);
                }
            });
        },
        onCancel() { onCancel() },
        ...props,
    });
}