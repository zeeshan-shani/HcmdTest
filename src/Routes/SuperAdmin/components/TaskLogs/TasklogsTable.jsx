import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { generatePayload } from 'redux/common';
import TaskDetails from 'Routes/TaskBoard/TaskDetails/TaskDetails';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { dispatch } from 'redux/store';
import TaskBoard from 'Routes/TaskBoard/TaskBoard';
import TaskAnalytics from 'Routes/TaskBoard/TaskAnalytics';
import taskService from 'services/APIs/services/taskService';

export const TasklogsTable = ({ filters, selectChats, groupData, userData, showAnalytics }) => {
    const { taskCards, taskDetails } = useSelector((state) => state.task);
    const [state, setState] = useState({
        rows: [],
        pageSize: 10,
        page: 1,
        loading: false,
        rowCountState: 0,
        total: 0,
        isChat: false
    });

    const chatData = useMemo(() => {
        if (!selectChats && userData) return userData;
        else if (selectChats && groupData) return groupData;
    }, [groupData, selectChats, userData]);

    useEffect(() => {
        if ((filters.createdAt.dateFrom && !filters.createdAt.dateTo) ||
            (filters.dueDate.dateFrom && !filters.dueDate.dateTo)) return;
        getData();
        //eslint-disable-next-line
    }, [selectChats, filters, userData, groupData, state.page, state.pageSize]);

    const getData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        const payload = await generatePayload({
            body: filters,
            keys: ["subject", "description", "patient", "name"], value: filters.search || "",
            options: { populate: ["task-details:dashboard"] }
        });
        if (selectChats) {
            if (!groupData) return setState(prev => ({ ...prev, total: 0, rows: [], isChat: true }));
            payload.query.chatId = groupData.id;
        }
        else payload.query.userId = userData.id;
        const data = await taskService.taskList({ payload });;
        if (data?.status === 1)
            return setState(prev => ({ ...prev, loading: false, rows: data.data, isChat: Boolean(selectChats) }));
        setState(prev => ({ ...prev, loading: false }));
    }, [filters, groupData, selectChats, userData.id])

    // const columns = [
    //     {
    //         field: "name", headerName: "Title", minWidth: 250, flex: 1,
    //         renderCell: (params) => {
    //             const titleText = params.row?.subject ? format_all(params.row.subject) : format_all(`Task: ${params.row?.name}`);
    //             return <span dangerouslySetInnerHTML={{ __html: format_all(titleText) }} />
    //         },
    //     },
    //     {
    //         field: "patient", headerName: "Patient", minWidth: 250, flex: 1,
    //         renderCell: (params) => {
    //             return <span dangerouslySetInnerHTML={{ __html: format_patient(params.row.patient) }} />
    //         },
    //     },
    //     {
    //         field: "status", headerName: `Status (${state.isChat ? 'Chat' : 'User'})`, minWidth: 180,
    //         renderCell: (params) => {
    //             let findStatus, taskStatus;
    //             if (!state.isChat) {
    //                 findStatus = params.row?.taskStatuses?.find(item => item.userId === userData.id);
    //                 taskStatus = findStatus ? findStatus.status : '-';
    //             }
    //             else taskStatus = params.row?.status;
    //             return <div className='text-capitalize'>{taskStatus}</div>
    //         },
    //     },
    //     {
    //         field: "type", headerName: "Type", minWidth: 100,
    //         renderCell: (params) => <div className='text-capitalize'>{params.row?.type}</div>
    //     },
    //     {
    //         field: "createdAt", headerName: "Created on", minWidth: 180,
    //         renderCell: (params) => <div>{moment(params.row?.createdAt).format("MM/DD/YY")}</div>
    //     },
    //     {
    //         field: "dueDate", headerName: "Due Date", minWidth: 180,
    //         renderCell: (params) => <div>{params.row?.dueDate ? moment(params.row.dueDate).format("MM/DD/YY") : '-'}</div>
    //     },
    //     // {
    //     //     field: "completedAt", headerName: "Completed on",
    //     //     renderCell: (params) => <div>{params.row?.completedAt ? moment(params.row.completedAt).format("MM/DD/YY") : '-'}</div>
    //     // },
    // ];

    // const onClickTask = async (task) => getTaskDetails({ taskId: task.id, messageId: task.messageId, isDepartment: task?.isDepartment, chatList });
    const onCloseTaskDeatails = () => dispatch({ type: TASK_CONST.RES_GET_TASK_DETAILS, payload: null });

    return (<>
        {showAnalytics && ((!selectChats && userData?.id) || (selectChats && groupData?.id)) &&
            <TaskAnalytics
                userId={!selectChats && userData?.id}
                chatId={selectChats && groupData?.id}
                label={!selectChats && userData?.id ? `${userData.label}'s Task Analytics` :
                    (selectChats && groupData?.id ? `Task Analytics for ${groupData.name}` : null)}
                showAnalyticsToday={false}
            />}
        {chatData ?
            <TaskBoard
                activeTaskChat={chatData}
                taskCards={taskCards}
                activeTaskList={state?.rows}
                disabledAddDelete
            /> :
            <div className='text-center'>
                Please select chat to get tasks
            </div>
        }
        {/* <div className="row m-0">
            <div className={`my-2 cstm-mui-datagrid ${state.loading || !state.rows?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%' }}>
                <DataGridPro
                    paginationMode="server"
                    loading={state.loading}
                    rows={state?.rows || []}
                    columns={columns}
                    onPageSizeChange={(newPageSize) => updateState(setState, { pageSize: newPageSize })}
                    onPageChange={(newPage) => updateState(setState, { page: newPage + 1 })}
                    rowsPerPageOptions={[10, 20]}
                    rowCount={state.total}
                    pageSize={state.pageSize}
                    pagination
                    autoHeight
                    page={state.page - 1}
                    initialState={{
                        pagination: { page: state.page }
                    }}
                    components={{
                        LoadingOverlay: LinearProgress,
                        Footer: () =>
                            <MuiDataGridFooter
                                isFetching={state.loading}
                                // lastUpdated={usersList?.lastUpdated}
                                pagination={{ page: state?.page, total: state.total || 0, pageSize: state?.pageSize }}
                                onPageChange={(e, page) => {
                                    updateState(setState, { page: page });
                                }}
                            />
                    }}
                    density="compact"
                    // filterMode="server"
                    // onFilterModelChange={onFilterChange}
                    disableColumnFilter
                    onRowClick={(params) => onClickTask(params.row)}
                />
            </div>
        </div> */}
        {taskDetails && (
            <TaskDetails onClose={onCloseTaskDeatails} task={taskDetails} />
        )}
    </>);
}
