import React, { useCallback, useMemo, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import moment from 'moment-timezone';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { toastPromise } from 'redux/common';
import ModalReactstrap from 'Components/Modals/Modal';
import { TakeConfirmation } from 'Components/components';
import getTodoForm, { priorityOptions } from './todoForm';
import { CONST } from 'utils/constants';
import { sortObjectsByField } from 'services/helper/default';
// MUI Components
import { DataGridPro } from '@mui/x-data-grid-pro';
import { LinearProgress } from '@mui/material';
import { CheckCircle, TaskAlt } from '@mui/icons-material';
import { MuiDeleteAction, MuiEditAction, MuiLoadingActionButton } from 'Components/MuiDataGrid';
import patientService from 'services/APIs/services/patientService';

export default function TodoList({
    card, patientId, rowData,
    index, setMainState,
    data = []
}) {
    const [state, setState] = useState({
        create: false,
        update: false,
        loading: false,
        text: '',
    });
    const onCancelHandler = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), []);

    const onSubmitHandler = useCallback(async (body, mode, id) => {
        // if (body.assigneeId === user.id) return toast.error("Can't assign to own user, Please select another assignee")s
        if (mode === 'create') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const payload = { ...body, patientId, title: body.title }
                        const data = await patientService.taskCreate({ payload });
                        if (data?.status === 1)
                            setMainState(prev => ({ ...prev, patientData: { ...prev.patientData, patientTasks: [data.data, ...prev.patientData.patientTasks] } }))
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Creating task.', error: 'Could not create task.', success: 'task created.',
                options: { id: "create-todo" }
            });
        }
        else if (mode === 'update') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientService.taskUpdate({ payload: { ...body, id } });
                        setMainState(prev => ({
                            ...prev, patientData: {
                                ...prev.patientData,
                                patientTasks: prev.patientData.patientTasks.map((item) => {
                                    if (item.id === data.data.id) return { ...item, ...data.data }
                                    return item;
                                })
                            }
                        }))
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Updating task.', error: 'Could not update task.', success: 'task updated.',
                options: { id: "update-todo" }
            });
        };
        onCancelHandler();
    }, [onCancelHandler, patientId, setMainState]);

    const onDelete = useCallback(async (id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the todo?',
            onDone: async () => {
                await patientService.taskDelete({ payload: { id } });
                setMainState(prev => ({
                    ...prev, patientData: {
                        ...prev.patientData,
                        patientTasks: prev.patientData.patientTasks.filter((item) => item.id !== id)
                    }
                }))
            }
        })
    }, [setMainState]);

    const columns = useMemo(() => [
        {
            field: "title", headerName: "Task", minWidth: 200,
            renderCell: ({ row }) => <div>{row.title}</div>
        },
        {
            field: "date", headerName: "Date", flex: 1,
            renderCell: ({ row }) => <>{moment(row.createdAt).format("MM/DD/YY")}</>
        },
        {
            field: "assigneeId", headerName: "Assignee", minWidth: 180,
            renderCell: ({ row }) => (<>{row.patientAssignee?.name ? row.patientAssignee?.name : '-'}</>)
        },
        { field: "priority", headerName: "Priority", minWidth: 180, cellClassName: "text-capitalize" },
        {
            field: "dueDate", headerName: "Due date", flex: 1,
            renderCell: ({ row }) => <>{row.dueDate ? moment(row.dueDate).format("MM/DD/YY") : '-'}</>
        },
        { field: "repeat", headerName: "Repeative", minWidth: 180, flex: 1 },
        { field: "status", headerName: "Status", minWidth: 180, flex: 1 },
        {
            field: "actions", headerName: "Actions", minWidth: 180, align: "center", headerAlign: "center",
            renderCell: ({ row }) => <div onClick={e => e.stopPropagation()}>
                <MuiLoadingActionButton tooltip={"Mark as Done"}
                    Icon={CONST.TASK_STATUS[3].value === row.status ? CheckCircle : TaskAlt}
                    color={CONST.TASK_STATUS[3].value === row.status ? "success" : "primary"}
                    onClick={() => onSubmitHandler({ status: CONST.TASK_STATUS[3].value === row.status ? CONST.TASK_STATUS[0].value : CONST.TASK_STATUS[3].value }, "update", row.id)} />
                <MuiEditAction tooltip={"Edit Task"} onClick={() => setState(prev => ({ ...prev, update: row }))} />
                <MuiDeleteAction tooltip={"Delete Task"} onClick={() => onDelete(row.id)} />
            </div>,
        },
    ], [onDelete, onSubmitHandler]);

    // get task data sort
    const TodoData = useMemo(() => sortObjectsByField(data, "createdAt"), [data]);

    return (<>
        <Card className='card p-2 m-1'>
            <div className="d-flex justify-content-between">
                <div
                    className="accordion-button collapsed cursor-pointer"
                    data-bs-toggle="collapse"
                    data-bs-target={`#panelsStayOpen-collapse-${card.id}-${patientId}`}
                    aria-expanded="false"
                    aria-controls={`panelsStayOpen-collapse-${card.id}-${patientId}`}
                >
                    <div className={`${classes.title} font-weight-bold`}>
                        {`${rowData?.firstName ? `${rowData?.firstName} ${rowData?.lastName ? rowData?.lastName : ''} -` : ''} Todo List`}
                    </div>
                </div>
            </div>
            <div id={`panelsStayOpen-collapse-${card.id}-${patientId}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
                <div className="accordion-body">
                    <div className={`my-2 cstm-mui-datagrid ${!TodoData?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
                        <DataGridPro
                            columns={columns}
                            rows={!!TodoData?.length ? TodoData : []}
                            autoHeight
                            density="compact"
                            disableColumnFilter
                            onRowClick={({ row }) => setState(prev => ({ ...prev, update: row }))}
                            components={{
                                LoadingOverlay: LinearProgress,
                                Footer: () => <></>
                            }}
                        />
                    </div>
                    <Button variant="primary" size="sm" onClick={(e) => setState(prev => ({ ...prev, create: true }))}>
                        Add Todo
                    </Button>
                </div>
            </div>
            <div className='d-flex'>
                <CreateEditTodo
                    fieldName='Todo'
                    showModal={state.create || state.update}
                    onSubmit={onSubmitHandler}
                    onCancel={onCancelHandler}
                    mode={(state.create ? 'create' : (state.update && 'update'))}
                    rowData={rowData}
                    updateData={state.update} />
            </div>
        </Card>
    </>)
}

export const CreateEditTodo = ({ showModal, onSubmit, onCancel, mode = 'create', updateData, fieldName = 'field', patientId, rowData }) => {
    let taskJSONForm = useMemo(() => {
        const formData = getTodoForm();
        return formData.map((item) => {
            if (updateData) {
                if (item.name === 'dueDate') item.value = updateData[item.name] ? moment(updateData[item.name]).toDate() : null;
                else if (item.name === 'assigneeId') item.value = updateData.patientAssignee ? [{ label: updateData["patientAssignee"].name, value: updateData["patientAssignee"].id }] : [];
                else if (item.name === 'priority' && updateData.hasOwnProperty("priority")) {
                    const pri = priorityOptions.find(i => i.value === updateData.priority)
                    item.value = pri ? [pri] : [];
                }
                else if (updateData.hasOwnProperty(item.name)) item.value = updateData[item.name];
            }
            return item;
        })
    }, [updateData]);

    const onSubmitHandler = useCallback(async (body) => {
        if (body.hasOwnProperty("assigneeId") && !!body.assigneeId.length) body.assigneeId = body.assigneeId[0]?.value || null;
        else body.assigneeId = null;
        if (body.hasOwnProperty("priority") && !!body.priority.length) body.priority = body.priority[0]?.value || null;
        body.patientName = rowData ? `${rowData.firstName ? `${rowData.firstName}-` : ""}${rowData.lastName ? rowData.lastName : ''}` : undefined
        await onSubmit(body, mode, (mode === 'update' && updateData.id) || patientId)
    }, [mode, onSubmit, patientId, rowData, updateData?.id]);

    return (
        <ModalReactstrap
            header={<>{mode === 'update' ? 'Edit ' + fieldName : 'Create ' + fieldName}</>}
            toggle={onCancel}
            show={showModal}
            size='lg'
            body={
                showModal &&
                <FormGenerator
                    className="m-0"
                    formClassName={"row"}
                    dataFields={taskJSONForm}
                    onSubmit={onSubmitHandler}
                />
            }
        />
    )
}
