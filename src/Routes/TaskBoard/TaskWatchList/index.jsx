import React, { useCallback, useEffect, useState } from 'react'
import { generatePayload } from 'redux/common';
import { ReactComponent as Loader } from "assets/media/messageLoader.svg";
import { useSelector } from 'react-redux';
import { removeWatchMessage } from 'redux/actions/chatAction';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import { dispatch } from 'redux/store';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { Badge } from 'react-bootstrap';
import { Virtuoso } from 'react-virtuoso';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import BoardTaskCard from '../TaskBoard/BoardTaskCard';
import watchlistService from 'services/APIs/services/watchlistService';

export default function TaskWatchList() {
    const { removeWatchListId } = useSelector(state => state.task);
    const [state, setState] = useState({
        isCollapsed: true,
        isLoading: false,
        watchlist: [],
        count: 0,
    });

    const getWatchList = useCallback(async ({ countOnly }) => {
        setState(prev => ({ ...prev, isLoading: true }));
        let payload = await generatePayload({
            options: {
                populate: ["watchListInfo"],
                pagination: true,
                limit: 5,
                offset: state.watchlist.length
            }
        });
        if (countOnly) payload['isCountOnly'] = true;
        const data = await watchlistService.list({ payload });
        setState(prev => ({
            ...prev,
            isLoading: false,
            watchlist: !countOnly && data?.data ? [...prev.watchlist, ...data.data] : prev.watchlist,
            count: countOnly ? data.data : prev.count,
            hasMore: state.count > state.watchlist.length
        }));
    }, [state.count, state?.watchlist?.length]);

    const onNextListTasksLoad = useCallback(async () => {
        await getWatchList({ countOnly: false });
    }, [getWatchList]);

    useEffect(() => {
        if (!state.isCollapsed) onNextListTasksLoad();
        else getWatchList({ countOnly: true });
        //eslint-disable-next-line
    }, [state.isCollapsed]);

    useEffect(() => {
        if (removeWatchListId) {
            setState(prev => ({ ...prev, watchlist: prev.watchlist?.filter(task => task.taskId !== removeWatchListId) }));
            dispatch({ type: TASK_CONST.UPDATE_WATCH_LIST, payload: { removeWatchListId: null } });
        }
    }, [removeWatchListId]);

    const removeFromWatchlist = useCallback(async (item, watchListId) => {
        const body = {
            messageId: item.messageId,
            taskId: item.id,
            chatId: item.chatId,
            type: "remove",
        };
        await removeWatchMessage(body, "remove", watchListId);
        setState(prev => ({ ...prev, watchlist: prev.watchlist?.filter(task => task.id !== watchListId) }));
    }, []);

    return (
        <div className={`${classes["roe-box-shadow"]} task-card-item`}>
            <div className='accordion text-color'>
                <div className={`${classes["accordion-item"]} task-card-item`}>
                    <div
                        className="accordion-button collapsed cursor-pointer d-flex justify-content-between"
                        data-bs-toggle="collapse"
                        data-bs-target={`#panelsStayOpen-collapse-task-watchlist`}
                        aria-expanded="false"
                        aria-controls={`panelsStayOpen-collapse-task-watchlist`}
                        onClick={() => setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }))}
                    >
                        <div className={`d-flex ${classes["column-title"]} text-color`}>
                            <div className={`${classes.title}`}>
                                {'Watchlist'}
                            </div>
                        </div>
                        <div className="text-white d-flex align-items-center">
                            {Boolean(state.count) &&
                                <Badge bg="info" pill className='px-2'>
                                    {state.count}
                                </Badge>}
                        </div>
                    </div>
                    <div id={`panelsStayOpen-collapse-task-watchlist`} className={`accordion-collapse collapse `} aria-labelledby={`card-task-watchlist`}>
                        <div className="accordion-body hide-horizonal-scroll" style={{ maxHeight: '50vh', overflow: !state.watchlist?.length ? "hidden" : "scroll" }}>
                            {(!!state.watchlist?.length || state.isLoading) &&
                                <Virtuoso
                                    style={{ height: 500 }}
                                    data={state.watchlist}
                                    endReached={() => state.hasMore && onNextListTasksLoad()}
                                    overscan={200}
                                    itemContent={(index, task) => (
                                        <BoardTaskCard
                                            key={index}
                                            task={task.taskWatchList}
                                            index={index}
                                            Watchlist
                                            removeFromWatchlist={(watchTask) => removeFromWatchlist(watchTask, task.id)}
                                            taskDeleteHandler={() => { }}
                                        />)}
                                    components={{ Footer: () => <>{(state.isLoading) && <Loader height={"80px"} />}</> }}
                                />}
                            {!state.isLoading && !state.watchlist?.length && (
                                <div className="text-center light-text-70 my-2">
                                    <ExclamationTriangle size={20} />
                                    <p className="mb-0">
                                        No task watch available
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
