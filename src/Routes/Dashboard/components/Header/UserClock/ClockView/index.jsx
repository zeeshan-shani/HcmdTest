import React, { useCallback, useEffect, useState } from 'react'
import { TelephoneFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { CONST, SOCKET } from 'utils/constants';
import { changeProfileStatus, SocketEmiter } from 'utils/wssConnection/Socket';
import { ClockTime } from '../../ClockTime';

export default function ClockView({ onClockOut, isClockOut }) {
    const { user } = useSelector(state => state.user);
    const [isDisable, setDisableBtn] = useState(true);

    useEffect(() => {
        setTimeout(() => setDisableBtn(false), 2000);
    }, []);

    const clockOutHandler = useCallback(() => {
        onClockOut();
        setDisableBtn(true);
        setTimeout(() => { setDisableBtn(false); }, 2000);
    }, [onClockOut]);

    const clockInHandler = useCallback(async () => {
        SocketEmiter(SOCKET.REQUEST.CREATE_USER_LOG, { clockin: true });
        setDisableBtn(true);
        setTimeout(() => { setDisableBtn(false); }, 2000);
        changeProfileStatus(CONST.PROFILE.ONLINE);
    }, []);

    const reqOnCall = useCallback(() => {
        if (user.profileStatus === CONST.PROFILE.ONCALL) changeProfileStatus(CONST.PROFILE.ONLINE);
        else changeProfileStatus(CONST.PROFILE.ONCALL);
    }, [user.profileStatus]);

    const reqOnBreak = useCallback(() => {
        clockOutHandler();
        changeProfileStatus(CONST.PROFILE.BREAK);
    }, [clockOutHandler]);

    return (
        <div className="col-12 col-lg-6 mt-1">
            <div className="card border-0">
                <div className="card-header d-sm-flex flex-wrap justify-content-between clock-timer border-0">
                    <ClockTime />
                    <div className="heading-elements clock-menu d-flex flex-column flex-grow-1">
                        <ul className="list-inline">
                            <li className="text-center text-sm-right">
                                {isClockOut ?
                                    <button onClick={clockInHandler} className='btn btn-info btn-sm ml-auto d-md-block' disabled={isDisable || user?.profileStatus === CONST.PROFILE.ONCALL} title="Clock-in">Clock-In</button>
                                    :
                                    <button onClick={clockOutHandler} className='btn btn-danger btn-sm ml-auto d-md-block' disabled={isDisable || user?.profileStatus === CONST.PROFILE.ONCALL} title="Clock-out">Clock-out</button>}
                            </li>
                        </ul>
                        {!isClockOut &&
                            <ul className="list-inline mt-auto mb-0 text-center text-sm-right">
                                <button
                                    className={`btn btn-sm mr-1 ${user?.profileStatus !== CONST.PROFILE.ONCALL ? 'btn-info' : 'btn-danger'}`}
                                    onClick={reqOnCall}
                                    title="onCall"
                                    disabled={isDisable}
                                >
                                    {user?.profileStatus === CONST.PROFILE.ONCALL && <TelephoneFill className='mr-1' />}
                                    {user?.profileStatus === CONST.PROFILE.ONCALL ?
                                        'End Call' : 'On Call'}
                                </button>
                                <button
                                    className='btn btn-info btn-sm'
                                    onClick={reqOnBreak}
                                    title="onBreak"
                                    disabled={isDisable || user?.profileStatus === CONST.PROFILE.ONCALL}
                                >On Break</button>
                            </ul>}
                    </div>
                </div>
            </div>
        </div>
    )
}
