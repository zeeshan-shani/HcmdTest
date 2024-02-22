import React from 'react'
import moment from 'moment-timezone';
import taskService from 'services/APIs/services/taskService';
import { useQuery } from '@tanstack/react-query';
import { LogsRowCols } from 'Routes/SuperAdmin/components/AttendanceLogs/LogsAccordion';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';

export const TaskLogs = ({ taskDetails }) => {
    let taskClockIn = [];
    let taskClockOut = [];
    const { data: taskLogs = [], isFetching } = useQuery({
        queryKey: ["/task/logs", taskDetails.id],
        queryFn: async () => {
            const data = await taskService.tasklog({ payload: { taskId: taskDetails.id } });
            if (data?.status === 1) return data;
            return;
        },
        keepPreviousData: true,
        staleTime: 10 * 1000,
    });
    const logsData = taskLogs;

    return (<>
        <div className="col-sm-12 col-md-12 p-0 text-color">
            <div className="p-1">
                <p className='d-flex justify-content-end mb-0'>
                    <span className='mr-1 font-weight-semibold'>Total Time: </span>
                    {logsData?.grossTotalTaskTime ?
                        <span className='light-text-70'>{logsData?.grossTotalTaskTime}</span> :
                        <span className='light-text-70'>00 : 00</span>}
                </p>
            </div>
            <div className="card-body p-1">
                {isFetching && <div>
                    <Loader height={'80px'} />
                </div>}
                {!!logsData?.data?.length ?
                    logsData.data.map(item => {
                        const usersData = item?.users;
                        return (
                            <div className="card mb-2" key={item.date}>
                                <div className="card-filers d-flex">
                                    <div className="d-flex max-width-fit mx-1 align-items-center">
                                        <p className='my-1'>
                                            <span className='mr-1'>Date: </span>
                                            <span className='mr-1'>{moment(item.date).format("ll")}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="card-data">
                                    {!usersData.length &&
                                        <div className='text-center'>
                                            <p className='m-2'>No Data available.</p>
                                        </div>}
                                    {!!usersData.length &&
                                        usersData.map(user => {
                                            taskClockIn = user?.logs.filter((item) => item.type === 'started');
                                            taskClockOut = user?.logs.filter((item) => item.type === 'ended');
                                            const grossHours = user?.grossHours?.split(":");
                                            return (
                                                <div className='user-logs-data h-auto m-1' key={user.id}>
                                                    <div className="d-flex p-2">
                                                        <div className="user-info d-flex w-100 justify-content-between">
                                                            <p className='mb-0'>
                                                                <span className='mr-1'>User:</span>
                                                                <span className=''>{user.name}</span>
                                                            </p>
                                                            {grossHours &&
                                                                <p className='mb-0'>
                                                                    <span>Time: </span>
                                                                    <span className=''>{`${grossHours[0]}h ${grossHours[1]}m`}</span>
                                                                </p>}
                                                        </div>
                                                    </div>
                                                    <LogsRowCols start={taskClockIn} end={taskClockOut} startTitle={'Started'} endTitle={'Ended'} className="row mx-0" colClass="col-6 mt-10 text-center" />
                                                </div>)
                                        })}
                                </div>
                            </div>
                        )
                    })
                    :
                    <p className='d-flex justify-content-center w-100'>
                        No entries for task logs
                    </p>
                }
            </div>
        </div>
    </>)
}