import React, { useCallback, useState, useEffect } from 'react'
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { ReactComponent as Loader } from "assets/media/messageLoader.svg";
import { useSelector } from 'react-redux';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import { generatePayload } from 'redux/common';
import moment from 'moment-timezone';
import { Badge } from 'react-bootstrap';
import { moveChatandQMessage } from 'redux/actions/chatAction';
import { useNavigate } from 'react-router-dom';
import { dispatch } from 'redux/store';
import { TASK_CONST } from 'redux/constants/taskConstants';
import taskService from 'services/APIs/services/taskService';
import { Virtuoso } from 'react-virtuoso';
import BoardTaskCard from '../TaskBoard/BoardTaskCard';

export default function TaskAlertList({ filterObj }) {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);
    const { activeChat, chatList } = useSelector(state => state.chat);
    const { finishedTaskId } = useSelector(state => state.task);
    const [state, setState] = useState({
        isCollapsed: true,
        isLoading: false,
        alertList: [],
        count: 0,
        hasMore: false,
    });
    const { dateFrom, dateTo } = filterObj;

    const getAlertList = useCallback(async ({ countOnly = false, offset }) => {
        // countOnly || 
        if (!dateTo || !dateFrom) return;
        setState(prev => ({ ...prev, isLoading: true }));
        let payload = await generatePayload({
            body: {
                dueDate: {
                    dateFrom: moment(dateFrom).startOf('day').toLocaleString(),
                    dateTo: moment(dateTo).endOf('day').toLocaleString(),
                }
            },
            rest: {
                userId: user.id,
                // dueDate: { lt: moment().endOf("day").format(), },
                status: ["started", "pending"]
            },
            options: {
                sort: [["createdAt", "ASC"]],
                populate: ["taskDetailsInfo"],
                pagination: true,
                limit: 10,
                offset: countOnly ? 0 : offset
            },
        });
        if (countOnly) payload['isCountOnly'] = true;
        else payload['isCount'] = true;
        const data = await taskService.taskList({ payload });
        setState(prev => ({
            ...prev,
            isLoading: false,
            alertList: !countOnly && data?.status === 1 && data?.data?.rows ? [...prev.alertList, ...data.data.rows] : prev.alertList,
            count: countOnly ? data.data : data.data.count,
            hasMore: data.data.count > (!countOnly ? [...prev.alertList, ...data.data.rows].length : prev.alertList.length)
        }));
        if (countOnly && !data.data)
            dispatch({ type: TASK_CONST.UPDATE_TASK_NOTIFICATION, payload: false })
    }, [user.id, dateTo, dateFrom]);

    const onNextListTasksLoad = useCallback(async ({ offset = state.alertList.length }) => {
        await getAlertList({ countOnly: false, offset });
    }, [state.alertList.length, getAlertList]);

    useEffect(() => {
        if (!dateTo || !dateFrom) return;
        setState({
            isLoading: false,
            alertList: [],
            count: 0,
            hasMore: false,
        });
        if (!state.isCollapsed)
            onNextListTasksLoad({ offset: 0 });
        else
            getAlertList({ countOnly: true });
        // eslint-disable-next-line
    }, [state.isCollapsed, dateFrom, dateTo]);

    useEffect(() => {
        if (finishedTaskId) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                count: prev.count,
                alertList: prev.alertList.filter(task => task.id !== finishedTaskId),
            }));
            getAlertList({ countOnly: true });
            dispatch({ type: TASK_CONST.FINISHED_TASK_ID_FOR_ALERTLIST, payload: null });
        }
    }, [finishedTaskId, getAlertList]);

    const routeToChatMessage = useCallback((qMessage) => {
        moveChatandQMessage({ chatList, activeChat, user, qMessage, navigate });
    }, [activeChat, chatList, navigate, user]);

    return (
        <div className={`${classes["roe-box-shadow"]} task-card-item`}>
            <div className='accordion text-color'>
                <div className={`${classes["accordion-item"]} task-card-item`}>
                    <div>
                        <div
                            className="accordion-button collapsed cursor-pointer d-flex justify-content-between"
                            data-bs-toggle="collapse"
                            data-bs-target={`#panelsStayOpen-collapse-task-alertlist`}
                            aria-expanded="false"
                            aria-controls={`panelsStayOpen-collapse-task-alertlist`}
                            onClick={() => setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }))}
                        >
                            <div className={`d-flex ${classes["column-title"]} text-color`}>
                                <div className={`${classes.title}`}>
                                    {'Task Alerts'}
                                </div>
                            </div>
                            <div className="text-white d-flex align-items-center">
                                {Boolean(state.count) &&
                                    <Badge bg="secondary" pill className='px-2 d-flex gap-5'>
                                        {state.count}
                                        <div className="sidebar-notification blinking d-block position-relative"></div>
                                    </Badge>}
                            </div>
                        </div>
                    </div>
                    <div id={`panelsStayOpen-collapse-task-alertlist`} className={`accordion-collapse collapse `} aria-labelledby={`card-task-watchlist`}>
                        {/* // ${!state.isCollapsed ? 'show' : ''} */}
                        <div className="accordion-body hide-scrollbar" style={{ maxHeight: '80vh', minHeight: "200px", overflow: !state.alertList?.length ? "hidden" : "scroll" }}>
                            {(!!state.alertList?.length || state.isLoading) && <>
                                <Virtuoso
                                    style={{ height: 500 }}
                                    data={state.alertList}
                                    endReached={() => state.hasMore && onNextListTasksLoad({})}
                                    overscan={200}
                                    atBottomThreshold={0}
                                    itemContent={(index, task) => (
                                        <BoardTaskCard
                                            key={index}
                                            task={task}
                                            index={index}
                                            routeToChatMessage={routeToChatMessage}
                                        />)}
                                    components={{ Footer: () => <>{(state.isLoading) && <Loader height={"80px"} />}</> }}
                                />
                            </>}
                            {!state.isLoading && !state.alertList?.length && (
                                <div className="text-center light-text-70 my-2">
                                    <ExclamationTriangle size={20} />
                                    <p className="mb-0">
                                        No task alert available
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}