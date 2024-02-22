import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeTask } from 'redux/actions/modelAction';

import TaskDetails from 'Routes/TaskBoard/TaskDetails/TaskDetails';
import useDebounce from 'services/hooks/useDebounce';
import { getChatTaskList } from 'Routes/TaskBoard/TaskPage';
import { X } from 'react-bootstrap-icons';
import { TaskBody } from './TaskBody';
import { TodoFilters } from './TaskFilters';
import { ListenNewAssign } from 'utils/wssConnection/Listeners/Tasklistener';
import { CONST } from 'utils/constants';
import { getDateXDaysAgoEndOf, getDateXDaysAgoStartOf } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { dispatch } from 'redux/store';
import { CHAT_MODELS } from 'Routes/Chat/Models/models';
import { receiveNewTask } from 'utils/wssConnection/Socket';
import taskCategoryService from 'services/APIs/services/taskCategoryService';
import { useQuery } from '@tanstack/react-query';

export const sortingMethods = [
    { id: 1, value: "CREATED", label: "Created" },
    { id: 2, value: "ASC", label: "ASC" },
    { id: 3, value: "DESC", label: "DESC" },
];
export default function ToDo({ taskName }) {
    const { taskList, activeChat } = useSelector((state) => state.chat);
    const { taskDetails, activeTaskList, taskCards } = useSelector((state) => state.task);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        category: "",
        dateFrom: getDateXDaysAgoStartOf(7).toLocaleString(),
        dateTo: getDateXDaysAgoEndOf(0).toLocaleString(),
        chatType: activeChat.type,
        filterTask: CONST.FILTER_TASK_TYPE.ASSIGNEE.value,
        sortMethod: sortingMethods[0]
    });
    const newFilters = useDebounce(filters, 500);

    useEffect(() => {
        if (!newFilters.dateFrom || !newFilters.dateTo) return;
        const filters = {
            ...newFilters,
            sortMethod: newFilters.sortMethod.value || sortingMethods[0].value,
            category: newFilters.category ? newFilters.category.id : null
        }
        if (taskName === CHAT_MODELS.TODO) {
            filters.chatId = [activeChat.id];
            receiveNewTask(filters);
            getChatTaskList(activeChat.id, [], filters);
            if (activeChat.id) ListenNewAssign(filters, [], activeChat.id);
        }
    }, [taskName, newFilters, activeChat.id]);

    const filterChange = useCallback((data) => setFilters(prev => ({ ...prev, ...data })), []);

    const onCloseTaskDeatails = useCallback((activeTaskChatId) => {
        if (!newFilters.dateFrom || !newFilters.dateTo) return;
        const filters = {
            ...newFilters,
            sortMethod: newFilters.sortMethod.value || sortingMethods[0].value,
            category: newFilters.category ? newFilters.category.id : null
        }
        getChatTaskList(activeTaskChatId, [], filters);
        dispatch({ type: TASK_CONST.RES_GET_TASK_DETAILS, payload: null });
    }, [newFilters]);

    const onCloseHandler = useCallback(() => {
        changeTask();
        if (!!taskList.data.length) dispatch({ type: CHAT_CONST.GET_TASKS_SUCCESS, payload: { data: [] } });
    }, [taskList.data.length]);

    const { data: taskCategories = [] } = useQuery({
        queryKey: ["/taskCategory/list"],
        queryFn: async () => {
            const data = await taskCategoryService.list({});
            if (data?.status === 1) return data.data
            return [];
        },
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L3,
    });

    return (
        <div className="tab-pane h-100 active" id="todo" role="tabpanel" aria-labelledby="todo-tab">
            <div className="appnavbar-content-wrapper">
                <div className="appnavbar-scrollable-wrapper">
                    <div className="appnavbar-heading sticky-top">
                        <ul className="nav justify-content-between align-items-center">
                            <li className="text-center">
                                <h5 className="text-truncate mb-0">Task List</h5>
                            </li>
                            <li className="nav-item list-inline-item close-btn">
                                <button className='btn-outline-default btn-sm border-0' onClick={onCloseHandler}>
                                    <X size={20} />
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="appnavbar-body">
                        <TodoFilters
                            filters={filters}
                            sortingMethods={sortingMethods}
                            sortMethod={filters.sortMethod}
                            setFilters={setFilters}
                            filterChange={filterChange}
                            taskCategories={taskCategories}
                        />
                        <div className="todo-container">
                            <TaskBody
                                sortMethod={filters.sortMethod}
                                taskCards={taskCards}
                                activeTaskList={activeTaskList}
                                taskCategories={taskCategories}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {(taskDetails && taskName === CHAT_MODELS.TODO) && (<>
                <TaskDetails onClose={() => onCloseTaskDeatails(activeChat.id)} task={taskDetails} />
            </>)}
        </div>);
}