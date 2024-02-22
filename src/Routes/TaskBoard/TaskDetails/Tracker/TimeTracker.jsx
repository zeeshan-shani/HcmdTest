import React, { useEffect, useState } from 'react'
import moment from 'moment-timezone';
import { days } from 'Routes/Dashboard/components/Header/ClockTime';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { LogsRowCols } from 'Routes/SuperAdmin/components/AttendanceLogs/LogsAccordion';
import { useQuery } from '@tanstack/react-query';
import taskService from 'services/APIs/services/taskService';

export const TimeTracker = ({ taskDetails, setTracker }) => {
    const { user } = useSelector((state) => state.user);
    const [currSession, setCurrSession] = useState();
    const [currTimer, setTimer] = useState();

    const { data: taskLogs = [] } = useQuery({
        queryKey: ["/task/logs", taskDetails.id],
        queryFn: async () => {
            const data = await taskService.tasklog({ payload: { taskId: taskDetails.id } });
            if (data?.status === 1) return data;
            return;
        },
        keepPreviousData: true,
        staleTime: 10 * 1000,
    });

    useEffect(() => {
        if (taskDetails.clockTime &&
            taskDetails.clockTime.started && taskDetails.clockTime.ended) {
            if (taskDetails.clockTime.started.length !== taskDetails.clockTime.ended.length) {
                const [lastLog] = taskDetails.clockTime.started.reverse();
                setCurrSession(lastLog?.time ? moment(lastLog?.time).utc().format() : null);
                setTracker(true);
            } else {
                setTracker(false);
                setCurrSession();
            }
        }
        //eslint-disable-next-line
    }, [taskDetails?.clockTime]);

    useEffect(() => {
        const update = () => {
            if (taskDetails.clockTime && taskDetails.clockTime.started && taskDetails.clockTime.ended &&
                taskDetails.clockTime.started.length === taskDetails.clockTime.ended.length) {
                const totalTime = [];
                for (let index = 0; index < taskDetails.clockTime.ended.length; index++) {
                    const endedTime = new Date(taskDetails.clockTime.ended[index].time).getTime();
                    const startedTime = new Date(taskDetails.clockTime.started[index].time).getTime();
                    const diff = endedTime - startedTime;
                    totalTime.push(diff);
                }
                const tempTime = totalTime.reduce((total, num) => { return total + num; }, 0);
                setTimer(new Date(tempTime));
            }
        }
        update();
        const interval = setInterval(update, 1000 * 60);

        return () => clearInterval(interval);
    }, [currSession, taskDetails.clockTime]);

    const todayData = taskLogs?.data?.find((item) => moment(item.date).format("MM/DD/YY") === moment().format("MM/DD/YY"));
    const userData = todayData?.users.find(usr => usr.id === user.id);
    const logsData = userData?.logs;
    if (taskDetails && logsData) {
        let taskClockIn = logsData?.filter((item) => item.type === 'started');
        let taskClockOut = logsData?.filter((item) => item.type === 'ended');
        const grossHours = user?.grossHours?.split(":");
        return (<>
            <div className="row justify-content-between m-2 text-color">
                <div className='mr-2'>
                    {/* <div className="d-flex">
                        <h5 className="mb-0 mr-3">
                            {!currSession && '00 : 00 hrs'}
                            {currSession && `${String(hour).padStart(2, "0")} : ${String(minute).padStart(2, "0")}: ${String(second).padStart(2, "0")} hrs`}
                        </h5>
                    </div>
                    <p className=''>{`Current session (${user.clockTime.clockin.length !== user.clockTime.clockout.length ? 'Clocked-In' : 'not in yet'})`}</p> */}
                </div>
                <div className="text-right">
                    <h5 className="mb-0">
                        {!currTimer && '00 : 00 hrs'}
                        {currTimer && `${String(currTimer.getUTCHours()).padStart(2, "0")} : ${String(currTimer.getUTCMinutes()).padStart(2, "0")} hrs`}
                    </h5>
                    <p className='mb-0'>{`Today (${days[new Date().getUTCDay()]} UTC)`}</p>
                </div>
            </div>
            <div className="card-body p-1 text-color">
                {!todayData &&
                    <div className='text-center'>
                        <h6 className='light-text-70'>No Data available for today.</h6>
                    </div>}
                {todayData && <>
                    <div className="card mb-2">
                        <div className="card-filers d-flex">
                            <div className="d-flex max-width-fit mx-1 align-items-center">
                                <p className='my-1'>
                                    <span className='mr-1'>Date: </span>
                                    <span className='mr-1'>{moment(todayData?.date).format('ll')}</span>
                                </p>
                            </div>
                        </div>
                        <div className="card-data">
                            {!logsData.length &&
                                <div className='text-center'>
                                    <h6 className='light-text-70'>No Data available.</h6>
                                </div>}
                            {!!logsData.length &&
                                <div className='user-logs-data h-auto m-1' key={user.id}>
                                    <div className="d-flex p-2">
                                        <div className="user-info d-flex w-100 justify-content-between">
                                            <p className='mb-0'>
                                                <span className='mr-1'>User:</span>
                                                <span>{userData.name}</span>
                                            </p>
                                            {grossHours &&
                                                <p className='mb-0'>
                                                    <span>Time: </span>
                                                    <span>{`${grossHours[0]}h ${grossHours[1]}m`}</span>
                                                </p>}
                                        </div>
                                    </div>
                                    <LogsRowCols start={taskClockIn} end={taskClockOut} startTitle={'Started'} endTitle={'Ended'} className="row mx-0" />
                                </div>
                            }
                        </div>
                    </div>
                </>
                }
            </div>
        </>
        )
    } else {
        return (
            <div className='d-flex justify-content-center'>
                <h6 className='light-text-70'>No data available</h6>
            </div>
        )
    }
}
