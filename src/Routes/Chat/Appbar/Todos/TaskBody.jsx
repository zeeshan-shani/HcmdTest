import React from 'react'
import classes from "Routes/TaskBoard/TasksPage.module.css";

import { useSelector } from 'react-redux';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import { CONST } from 'utils/constants';
import { MuiTooltip } from 'Components/components';
import BoardTaskCard from 'Routes/TaskBoard/TaskBoard/BoardTaskCard';
import { ReactComponent as TaskStarted } from "assets/media/heroicons/task-started.svg";
import { ReactComponent as TaskPaused } from "assets/media/heroicons/task-paused.svg";
import { ReactComponent as TaskPending } from "assets/media/heroicons/task-pending.svg";
import { ReactComponent as TaskCompleted } from "assets/media/heroicons/task-completed.svg";

export const TaskBody = ({
    taskCards,
    activeTaskList,
    taskCategories
}) => {
    const { user } = useSelector(state => state.user);
    const activeTasks = activeTaskList;
    return (
        <div>
            {taskCards.map((card) => {
                const tasks = activeTasks.filter((item) => item.type === card.id);
                let tasksArr = { pending: 0, started: 0, paused: 0, finished: 0, review: 0 }
                tasks?.filter(task => {
                    const status = task?.taskStatuses?.find(item => item.userId === user.id)?.status;
                    if (status) {
                        switch (status) {
                            case CONST.TASK_STATUS[0].value: tasksArr.pending++;
                                break;
                            case CONST.TASK_STATUS[1].value: tasksArr.started++;
                                break;
                            case CONST.TASK_STATUS[2].value: tasksArr.paused++;
                                break;
                            case CONST.TASK_STATUS[3].value: tasksArr.finished++;
                                break;
                            case CONST.TASK_STATUS[4].value: tasksArr.review++;
                                break;
                            default:
                        }
                        return true;
                    }
                    return false;
                })
                return (
                    <React.Fragment key={card.id}>
                        <div className='accordion text-color my-1'>
                            <div className={`${classes["accordion-item"]} task-card-item ${classes["todos"]}`}>
                                <div
                                    className="accordion-button collapsed cursor-pointer d-flex justify-content-between"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#panelsStayOpen-collapse-${card.id}`}
                                    aria-expanded="false"
                                    aria-controls={`panelsStayOpen-collapse-${card.id}`}
                                >
                                    <div className={`${classes.title} d-flex align-items-center`}>
                                        <p className='mb-0'>{card.title}</p>
                                    </div>
                                    <div className={`d-flex ${classes["column-title"]}`}>
                                        <div className={`${classes["header-options"]} ${classes["task-options"]} w-100`}>
                                            <MuiTooltip title='Pending tasks'>
                                                <div className="d-flex align-items-center task-card-svg px-1">
                                                    <div className="svg-wrap">
                                                        <TaskPending />
                                                    </div>
                                                    <p className="mb-0">{tasksArr.pending}</p>
                                                </div>
                                            </MuiTooltip>
                                            <MuiTooltip title='Started tasks'>
                                                <div className="d-flex align-items-center task-card-svg px-1">
                                                    <div className="svg-wrap">
                                                        <TaskStarted />
                                                    </div>
                                                    <p className="mb-0">{tasksArr.started}</p>
                                                </div>
                                            </MuiTooltip>
                                            <MuiTooltip title='Paused tasks'>
                                                <div className="d-flex align-items-center task-card-svg px-1">
                                                    <div className="svg-wrap">
                                                        <TaskPaused />
                                                    </div>
                                                    <p className="mb-0">{tasksArr.paused}</p>
                                                </div>
                                            </MuiTooltip>
                                            <MuiTooltip title='Finished tasks'>
                                                <div className="d-flex align-items-center task-card-svg px-1">
                                                    <div className="svg-wrap">
                                                        <TaskCompleted />
                                                    </div>
                                                    <p className="mb-0">{tasksArr.finished}</p>
                                                </div>
                                            </MuiTooltip>
                                        </div>
                                    </div>
                                </div>

                                <div id={`panelsStayOpen-collapse-${card.id}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
                                    <div className="accordion-body">
                                        <div className={`${classes["board-card-scroll"]}`}>
                                            {!!tasks.length ?
                                                tasks.map((task, index) => (
                                                    <BoardTaskCard
                                                        key={task.id}
                                                        task={task}
                                                        index={index}
                                                        taskDeleteHandler={() => { }}
                                                        taskCategories={taskCategories}
                                                    />
                                                ))
                                                : (<div className="text-center light-text-70">
                                                    <ExclamationTriangle size={20} />
                                                    <p className="mb-0">No task available</p>
                                                </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>)
            })
            }
        </div>
    )
}
