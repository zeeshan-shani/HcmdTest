import React, { useCallback, useMemo } from 'react'
import { CONST } from 'utils/constants';
import { changeProfileStatus } from 'utils/wssConnection/Socket';
import { CircleFill, DashCircleFill, MoonFill, RecordCircleFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';

export const ProfileStatusAvailable = ({ isClockOut, clockOutHandler }) => {
    const { user } = useSelector(state => state.user);

    const onBreak = useCallback(() => {
        changeProfileStatus(CONST.PROFILE.BREAK);
        clockOutHandler();
    }, [clockOutHandler]);

    const onChangeStatus = useCallback((change) => {
        if (user.profileStatus === change) return;
        if ((change === CONST.PROFILE.BREAK || change === CONST.PROFILE.ONCALL) && isClockOut === true) return;
        if (change === CONST.PROFILE.BREAK) onBreak();
        else changeProfileStatus(change);
    }, [isClockOut, user?.profileStatus, onBreak]);

    const statuses = useMemo(() => {
        return [
            {
                id: "online",
                title: "Online",
                fill: "#45a675",
                onClick: () => onChangeStatus(CONST.PROFILE.ONLINE),
                Icon: CircleFill
            },
            {
                id: "budy",
                title: "Busy",
                fill: "#ff337c",
                onClick: () => onChangeStatus(CONST.PROFILE.BUSY),
                Icon: DashCircleFill
            },
            {
                id: "break",
                title: "Break",
                fill: "#fdff00",
                onClick: () => onChangeStatus(CONST.PROFILE.BREAK),
                Icon: CircleFill,
                enabled: !isClockOut
            },
            {
                id: "On-Call",
                title: "On Call",
                fill: "#fdff00",
                onClick: () => onChangeStatus(CONST.PROFILE.ONCALL),
                Icon: CircleFill,
                enabled: !isClockOut
            },
            {
                id: "available",
                title: "Available",
                fill: "#f3a81b",
                onClick: () => onChangeStatus(CONST.PROFILE.AVAILABLE),
                Icon: MoonFill,
            },
            {
                id: "offline",
                title: "Offline",
                fill: "#747f8d",
                onClick: () => onChangeStatus(CONST.PROFILE.OFFLINE),
                Icon: RecordCircleFill,
            },
        ]
    }, [isClockOut, onChangeStatus]);

    return (
        <div className="dropdown">
            <small className="dropdown-toggle text-capitalize cursor-pointer text-color" id="userStatusDropdown" data-bs-toggle="dropdown">{user?.profileStatus}</small>
            <ul className="dropdown-menu m-0" aria-labelledby="userStatusDropdown">
                {statuses
                    .filter(i => !i.hasOwnProperty("enabled") || i.enabled)
                    .map((item) => {
                        const { id, title, fill, Icon = null, onClick = () => { } } = item;
                        return (
                            <li key={id} className="dropdown-item" onClick={onClick}>
                                {Icon && <Icon fill={fill} size={12} className="mr-1" />}
                                <span className="ml-1">{title}</span>
                            </li>
                        )
                    })}
            </ul>
        </div>
    )
}
