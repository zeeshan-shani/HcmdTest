import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import { SOCKET } from 'utils/constants';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import UserClock from './UserClock';
import UserProfile from './UserProfile';

export default function DashboardHeader() {
    const { user } = useSelector(state => state.user);
    const isClockOut = useMemo(() => {
        return user?.clockTime?.clockin?.length === user?.clockTime?.clockout?.length;
    }, [user?.clockTime?.clockin?.length, user?.clockTime?.clockout?.length]);

    const onClockOut = () => SocketEmiter(SOCKET.REQUEST.CREATE_USER_LOG, { clockout: true });

    return (
        <div className="col-12 my-2">
            <div className="card shadow-none custom-dashboard-card">
                <div className="align-items-center card-header d-flex flex-wrap transparent-bg justify-content-between">
                    <h5 className="card-title mb-0">Dashboard</h5>
                    <div className="heading-elements">
                        <ul className="list-inline mb-0 d-flex">
                            <li>
                                <UserProfile clockOutHandler={onClockOut} isClockOut={!user?.isProvider && isClockOut} />
                            </li>
                        </ul>
                    </div>
                </div>
                <UserClock
                    isClockOut={isClockOut}
                    onClockOut={onClockOut}
                />
            </div>
        </div>
    )
}
