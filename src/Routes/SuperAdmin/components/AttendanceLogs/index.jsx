import React, { useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { DateLogs } from 'Routes/SuperAdmin/components/AttendanceLogs/DateLogs';
import { DayLogs } from 'Routes/SuperAdmin/components/AttendanceLogs/DayLogs';

export default function UsersAttendanceLogs({ onlyMe = false }) {
    const { user } = useSelector((state) => state.user);
    const [userData, setUserData] = useState({ name: user.name, label: user.name, value: user.id });
    const [userDayLogs, setUserDayLogs] = useState();

    return (
        <div className='row m-0 mt-1'>
            <div className="col-xl-3 col-lg-12 px-1">
                <div className='dashboard-clock-logs p-2 card'>
                    <DayLogs
                        userData={userData} userDayLogs={userDayLogs} setUserDayLogs={setUserDayLogs} />
                </div>
            </div>
            <div className="col-xl-9 col-lg-12 px-1">
                <div className='dashboard-date-logs p-2 card'>
                    <DateLogs
                        userData={userData}
                        onlyMe={onlyMe}
                        setUserData={setUserData}
                        setUserDayLogs={setUserDayLogs}
                    />
                </div>
            </div>
        </div>
    )
}
