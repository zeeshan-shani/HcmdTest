import { List } from '@mui/icons-material'
import Activity from './Activity';
import { generatePayload } from 'redux/common';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import taskActivityService from 'services/APIs/services/taskActivityService';
import { useQuery } from '@tanstack/react-query';

export default function TaskActivity({ taskDetails }) {
    const { activityLogs: taskActivityLogs } = useSelector(state => state.task);

    const { data: activityLogs = [], isFetching } = useQuery({
        queryKey: ["/taskActivity/list", taskDetails.id, taskActivityLogs],
        queryFn: async () => {
            let payload = await generatePayload({
                rest: { taskId: taskDetails.id },
                options: {
                    "sort": [["createdAt", "desc"]],
                    "populate": ["createdByActivity"]
                },
            })
            const data = await taskActivityService.list({ payload });
            if (data?.status === 1) return data.data;
            return;
        },
        keepPreviousData: true,
        staleTime: 10 * 1000,
    });

    return (
        <div className={`card-body`}>
            <div className={`d-flex align-items-center mb-2 `}>
                <h6 className={`card-title mb-0`}>
                    <List /> Activity
                </h6>
                {/* <div className="">
                    <Button variant='outline-secondary' size='sm' onClick={() => setShowActivity(prev => !prev)}>
                        {`${showActivity ? "Hide" : "Show"} Activity`}
                    </Button>
                </div> */}
            </div>
            {isFetching &&
                <div>
                    <Loader height={'80px'} />
                </div>}
            <div style={{ maxHeight: '70vh', overflow: !activityLogs.length ? "auto" : "scroll" }} className="hide-horizonal-scroll">
                {!!activityLogs?.length ?
                    activityLogs.map((item, index) => <Activity item={item} key={index} />)
                    :
                    <div className="text-center light-text-70">
                        <ExclamationTriangle size={20} />
                        <p className="mb-0">
                            No logs entries found
                        </p>
                    </div>}
            </div>
        </div>
    )
}
