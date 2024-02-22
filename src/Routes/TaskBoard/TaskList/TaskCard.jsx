import React, { useState } from 'react'
import { Draggable } from "react-beautiful-dnd";
import { ReactComponent as TaskStarted } from "assets/media/heroicons/task-started.svg";
import { ReactComponent as TaskPaused } from "assets/media/heroicons/task-paused.svg";
import { ReactComponent as TaskPending } from "assets/media/heroicons/task-pending.svg";
import { ReactComponent as TaskCompleted } from "assets/media/heroicons/task-completed.svg";

import classes from "../TasksPage.module.css";
import ListCard from "./ListCard";
import { CONST } from 'utils/constants';
import { MuiTooltip } from 'Components/components';
import { PublishedWithChangesTwoTone } from '@mui/icons-material';
import { useSelector } from 'react-redux';

export const TaskCard = ({
    card,
    index,
    activeTaskList,
    activeTaskChat,
    addNewTaskHandler,
    taskDeleteHandler,
    userDesignations
}) => {
    const { user } = useSelector(state => state.user);

    const [addCardFlag, setAddCardFlag] = useState(false);
    const tasks = activeTaskList.filter((item) => item.type === card.id);
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
        <Draggable draggableId={card.id.toString()} index={index} type="card" isDragDisabled={true}>
            {(provided) => (
                <div className='accordion text-color' ref={provided.innerRef}>
                    <div className={`${classes["accordion-item"]} task-card-item`}>
                        <div
                            className="accordion-button collapsed cursor-pointer d-flex justify-content-between"
                            data-bs-toggle="collapse"
                            data-bs-target={`#listpanelsStayOpen-collapse-${card.id}`}
                            aria-expanded="false"
                            aria-controls={`listpanelsStayOpen-collapse-${card.id}`}
                        >
                            <div className={`${classes.title}`}>{card.title}</div>
                            <div className={`d-flex ${classes["column-title"]} py-0`}>
                                <div className={`${classes["header-options"]} ${classes["task-options"]} w-100`}>
                                    <MuiTooltip title='Pending tasks'>
                                        <div className="d-flex align-items-center task-card-svg">
                                            <div className="svg-wrap">
                                                <TaskPending />
                                            </div>
                                            <p className="mb-0">{tasksArr.pending}</p>
                                        </div>
                                    </MuiTooltip>
                                    <MuiTooltip title='Started tasks'>
                                        <div className="d-flex align-items-center task-card-svg">
                                            <div className="svg-wrap">
                                                <TaskStarted />
                                            </div>
                                            <p className="mb-0">{tasksArr.started}</p>
                                        </div>
                                    </MuiTooltip>
                                    <MuiTooltip title='Paused tasks'>
                                        <div className="d-flex align-items-center task-card-svg">
                                            <div className="svg-wrap">
                                                <TaskPaused />
                                            </div>
                                            <p className="mb-0">{tasksArr.paused}</p>
                                        </div>
                                    </MuiTooltip>
                                    <MuiTooltip title='Review tasks'>
                                        <div className="d-flex align-items-center task-card-svg">
                                            <div className="svg-wrap">
                                                <PublishedWithChangesTwoTone color="success" />
                                            </div>
                                            <p className="mb-0">{tasksArr.review}</p>
                                        </div>
                                    </MuiTooltip>
                                    <MuiTooltip title='Finished tasks'>
                                        <div className="d-flex align-items-center task-card-svg">
                                            <div className="svg-wrap">
                                                <TaskCompleted />
                                            </div>
                                            <p className="mb-0">{tasksArr.finished}</p>
                                        </div>
                                    </MuiTooltip>
                                </div>
                            </div>
                        </div>
                        <div id={`listpanelsStayOpen-collapse-${card.id}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
                            <div className="accordion-body">
                                {activeTaskChat && activeTaskChat.id !== -1 &&
                                    <div className={`d-flex btn ${classes["add-task-block"]} p-0 m-2 cursor-pointer text-color`} onClick={() => setAddCardFlag(prev => !prev)}>
                                        Add a new Task
                                    </div>}
                                <ListCard
                                    title={card.title}
                                    card={card}
                                    tasks={tasks}
                                    droppableId={card.id}
                                    addNewTaskHandler={addNewTaskHandler}
                                    taskDeleteHandler={taskDeleteHandler}
                                    activeTaskChat={activeTaskChat}
                                    addCardFlag={addCardFlag}
                                    setAddCardFlag={setAddCardFlag}
                                    userDesignations={userDesignations}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    )
}
