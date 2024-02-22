import React from 'react'
import moment from 'moment-timezone'
import { Alarm } from 'react-bootstrap-icons';
import { LogsAccordion } from 'Routes/SuperAdmin/components/AttendanceLogs/LogsAccordion';

export const DayLogs = ({ userDayLogs, userData }) => {
    try {
        if (userDayLogs) {
            const userClockIn = userDayLogs?.logs?.clockin;
            const userClockOut = userDayLogs?.logs?.clockout;
            const userCallStart = userDayLogs?.logs?.callStart;
            const userCallEnd = userDayLogs?.logs?.callEnd;
            const userBreakStart = userDayLogs?.logs?.outForBreak;
            const userBreakEnd = userDayLogs?.logs?.backFromBreak;
            const grossHours = userDayLogs?.grossHours?.userClock?.split(":");
            const taskgrossHours = userDayLogs?.grossHours?.userTaskTime && userDayLogs.grossHours.userTaskTime.split(":");
            return (<>
                <div className="m-0 mb-2 text-color">
                    <p className="m-0 text-capitalize">
                        <span className='font-weight-semibold mr-1'>Username:</span>
                        {userDayLogs?.userInfo?.name}
                    </p>
                    <p className="m-0">
                        <span className='font-weight-semibold mr-1'>Date:</span>
                        {moment(new Date(userDayLogs.date)).format("MM/DD/YY")}</p>
                    {grossHours &&
                        <p className="m-0">
                            <span className='font-weight-semibold mr-1'>Effective Hours:</span>
                            {(grossHours[0] && grossHours[0]) ? `${grossHours[0]}h ${grossHours[1]}m` : '-'}
                        </p>}
                </div>
                <LogsAccordion gross={userDayLogs?.grossHours?.userClock} Start={userClockIn} End={userClockOut} StartTitle={'Clock-In'} EndTitle={'Clock-out'} Title={'User Clock'} id={1} />
                <LogsAccordion gross={userDayLogs?.grossHours?.userCallTime} Start={userCallStart} End={userCallEnd} StartTitle={'Start'} EndTitle={'End'} Title={'Call Logs'} id={3} />
                <LogsAccordion gross={userDayLogs?.grossHours?.userBreakTime} Start={userBreakStart} End={userBreakEnd} StartTitle={'Start'} EndTitle={'End'} Title={'Break Logs'} id={4} />
                <div className='accordion text-color my-1 user-logs-data p-1 card'>
                    <div className={`accordion-item transparent-bg`}>
                        <div
                            className="accordion-button collapsed cursor-pointer d-flex p-2 justify-content-between"
                            data-bs-toggle="collapse"
                            data-bs-target={`#panelsStayOpen-collapse-${9}`}
                            aria-expanded="false"
                            aria-controls={`panelsStayOpen-collapse-${9}`}
                        >
                            <p className='mb-0'><b>{`Task Logs`}</b></p>
                            {(taskgrossHours && !!taskgrossHours.length) && <p className='mb-0'><Alarm className='mr-1' />{taskgrossHours[0]}h {taskgrossHours[1]}m</p>}
                        </div>
                        <div id={`panelsStayOpen-collapse-${9}`} className={`accordion-collapse collapse`} aria-labelledby={`card-${9}`}>
                            {/* show */}
                            <div className="accordion-body">
                                {userDayLogs?.taskLogs && !!userDayLogs.taskLogs.length ?
                                    userDayLogs.taskLogs.map((taskItem, index) => {
                                        return (
                                            <LogsAccordion key={`t-${index}`} collapsed={true} gross={taskItem?.grossTaskHours} Start={taskItem?.taskStatusGroupLogs?.started} End={taskItem?.taskStatusGroupLogs?.ended} StartTitle={'Start'} EndTitle={'End'} Title={taskItem?.taskName} id={`t-${index}`} />
                                        )
                                    })
                                    :
                                    <p className='d-flex justify-content-center mb-0'>No entries found</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>)
        } else {
            return (<div className="text-center align-items-center">
                <p className='light-text-70'>Select data from log table</p>
            </div>)
        }
    } catch (error) {
        console.error(error);
    }
}
