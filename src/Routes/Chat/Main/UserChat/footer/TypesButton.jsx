import React, { useRef, useState } from 'react'
import { getBackgroundColorClass } from 'redux/common';
import { CONST } from 'utils/constants';
import useLongPress from 'services/hooks/useLongPress';
import { isMobile } from 'react-device-detect';
import { MuiTooltip } from 'Components/components';
import { AnimatePresence, motion } from 'framer-motion';
import moment from 'moment-timezone';
import { useClickAway } from 'react-use';

const MotionUL = motion.ul;

export const TypesButton = ({ setMessageType, setTaskDueDate = () => { }, messageType, isEditing = false }) => {
    const [isMenu, setIsMenu] = useState(false);

    const defaultOptions = {
        shouldPreventDefault: true,
        delay: 400,
    };
    const changeItemHandler = (type) => {
        setMessageType(type);
        setTaskDueDate(prev => {
            if (type === CONST.MSG_TYPE.EMERGENCY) return moment().add(8, "minute").toLocaleString();
            if (type === CONST.MSG_TYPE.URGENT) return moment().add(2, "hour").toLocaleString();
            return moment().add(24, "hour").toLocaleString();
        })
        setIsMenu(false);
    }
    const onLongPress = () => { !isMobile && setIsMenu(true); };

    const onClick = () => {
        if (!isMobile) setIsMenu(true);
        else {
            switch (messageType) {
                case CONST.MSG_TYPE.ROUTINE: changeItemHandler(CONST.MSG_TYPE.EMERGENCY);
                    break;
                case CONST.MSG_TYPE.EMERGENCY: changeItemHandler(CONST.MSG_TYPE.URGENT);
                    break;
                case CONST.MSG_TYPE.URGENT: changeItemHandler(CONST.MSG_TYPE.ROUTINE);
                    break;
                default:
                    changeItemHandler(CONST.MSG_TYPE.ROUTINE);
            }
        }
    }

    const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);
    const dropdownTaskRef = useRef();
    useClickAway(dropdownTaskRef, () => setIsMenu(false))
    return (<>
        <MuiTooltip title={String(messageType).toUpperCase()}>
            <div
                {...longPressEvent}
                className={`btn btn-icon send-icon rounded-circle text-light send-btn-hover  ${isEditing ? 'task-send-button' : 'types-button'} ${getBackgroundColorClass(messageType)}`}
            >
                {messageType === CONST.MSG_TYPE.ROUTINE && <div>R</div>}
                {messageType === CONST.MSG_TYPE.EMERGENCY && <div>E</div>}
                {messageType === CONST.MSG_TYPE.URGENT && <div>U</div>}
            </div>
        </MuiTooltip>
        <AnimatePresence>
            {isMenu && (
                <MotionUL
                    initial={{ opacity: 0, y: "-100%" }}
                    animate={{ opacity: 1, y: "-144%" }}
                    exit={{ opacity: 0, y: "-100%", transition: { duration: "0.15" } }}
                    transition={{ type: "spring", stiffness: "100", duration: "0.05" }}
                    className="user-menu task-menu"
                    ref={dropdownTaskRef}
                >
                    <li className="item routine-bg" onClick={() => changeItemHandler(CONST.MSG_TYPE.ROUTINE)} >Routine</li>
                    <li className="item danger-bg" onClick={() => changeItemHandler(CONST.MSG_TYPE.EMERGENCY)}>Emergency</li>
                    <li className="item warning-bg" onClick={() => changeItemHandler(CONST.MSG_TYPE.URGENT)}>Urgent</li>
                </MotionUL>
            )}
        </AnimatePresence>
    </>
    )
}
