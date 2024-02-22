import React, { useCallback, useState } from 'react'
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { changeSubtaskStatus } from 'redux/actions/taskAction';
import SubtaskDetails from './SubtaskDetails';
import { ClipboardMinus, EyeFill } from 'react-bootstrap-icons';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { dispatch } from 'redux/store';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import taskService from 'services/APIs/services/taskService';

const addInitFlag = {
    visible: false,
    value: ''
}
export const SubTask = () => {
    const { taskDetails } = useSelector((state) => state.task);
    const [showCompletedSubtasks, setShowCompletedSubtask] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [addSubtask, setAddSubtask] = useState(addInitFlag);

    const addNewSubtask = useCallback(async () => {
        const value = addSubtask?.value;
        if (!value) return;
        setAddSubtask(addInitFlag);
        const data = await taskService.createSubtask({
            payload: {
                title: value.trim(),
                taskId: taskDetails.id,
                chatId: taskDetails.chatId
            }
        });
        if (taskDetails?.id)
            dispatch({ type: TASK_CONST.ADD_NEW_SUBTASK, payload: data.data });
    }, [addSubtask?.value, taskDetails?.chatId, taskDetails?.id]);

    const onEditSubtask = useCallback(async (id, title) => {
        const data = await changeSubtaskStatus({ subTaskId: id, title });
        if (taskDetails?.id)
            dispatch({ type: TASK_CONST.UPDATE_SUBTASK_DATA, payload: data.data });
    }, [taskDetails?.id]);

    const subtaskStatusToggleHandler = useCallback(async (id, currStatus) => {
        const newStatus = (currStatus === "pending") ? "finished" : "pending";
        const data = await changeSubtaskStatus({ status: newStatus, subTaskId: id });
        if (taskDetails?.id)
            dispatch({ type: TASK_CONST.CHANGE_SUBTASK_STATUS, payload: data.data });
    }, [taskDetails?.id]);

    const subtaskDeleteHander = useCallback(async (id) => {
        const data = await taskService.deleteSubtask({ payload: { subTaskId: id } });
        dispatch({ type: TASK_CONST.DELETE_SUBTASK, payload: data.data });
    }, []);

    const inputEvent = useCallback((e) =>
        setAddSubtask(prev => ({ ...prev, value: e.target.value })), []);

    const startAddNew = useCallback(() =>
        setAddSubtask({ visible: true, value: '' })
        , []);

    if (taskDetails && taskDetails.subtasks) {
        const searchFilterTasks = taskDetails.subtasks
            .filter((st) => st.title.toLowerCase().includes(searchInput.toLowerCase()))
            .filter((subtask) => !showCompletedSubtasks ? subtask.status === "pending" : true);

        return (
            <div className={`${classes["subtask-list"]} card-body`}>
                <div className={`${classes["subtask-block-header"]} mb-2 d-flex justify-content-between`}>
                    <h6 className={`card-title mb-0`}>
                        Sub Tasks
                        ({searchFilterTasks.length})
                    </h6>
                    <div className="d-flex align-items-center form-group mb-0">
                        <input type="text" name="search" id="search" placeholder="Search sub task..." onChange={(e) => setSearchInput(e.target.value)}
                            className={`${classes["form-control"]} form-control mr-1 p-4_8`} />
                        <MuiActionButton
                            Icon={EyeFill}
                            size="small"
                            className={`${showCompletedSubtasks ? "text-success" : ""}`}
                            tooltip={showCompletedSubtasks ? "Hide Completed Sub Tasks" : "Show All Sub Tasks"}
                            onClick={() => setShowCompletedSubtask(prev => !prev)}
                        />
                    </div>
                </div>
                {searchFilterTasks &&
                    <div className={`${classes["subtasks-wrapper"]} card-text`}>
                        {!!searchFilterTasks.length &&
                            searchFilterTasks.map((subtask, index) => (
                                <SubtaskDetails
                                    key={subtask.id}
                                    subtask={subtask}
                                    subtaskStatusToggleHandler={subtaskStatusToggleHandler}
                                    onEditSubtask={onEditSubtask}
                                    subtaskDeleteHander={subtaskDeleteHander}
                                />
                            ))}
                        {!!taskDetails.subtasks.length &&
                            !searchFilterTasks.length && (
                                <h6 className="mt-3 text-center">
                                    No match found.
                                </h6>
                            )}
                        {!taskDetails.subtasks.length && (
                            <div className="mt-3 text-center">
                                <ClipboardMinus />
                                <span className="ml-1">There are No subtask attached</span>
                            </div>
                        )}
                        {!addSubtask.visible ? (
                            <div className={`${classes["add-task-block"]} semi-bold-text`}>
                                <span onClick={startAddNew}>Add Subtask</span>
                            </div>
                        ) : (
                            <div className={classes["add-card-input-block"]}>
                                <textarea
                                    className={classes["add-card-input"]}
                                    name="taskTitle"
                                    rows="3"
                                    placeholder='Enter Task detail'
                                    onChange={inputEvent}
                                    autoFocus
                                    onKeyPress={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                            event?.preventDefault();
                                            addNewSubtask();
                                        }
                                    }}
                                ></textarea>
                                <div className={`${classes.action} mt-2 gap-10`}>
                                    <Button size='sm' onClick={addNewSubtask}>
                                        Add Subtask
                                    </Button>
                                    <Button variant='light' size='sm' onClick={() => setAddSubtask(addInitFlag)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>}
            </div>
        )
    }
}
