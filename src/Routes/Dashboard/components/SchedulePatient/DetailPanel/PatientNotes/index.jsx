import React, { useCallback, useMemo, useState } from 'react'
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import moment from 'moment-timezone';
import { Button, Card } from 'react-bootstrap';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import getNotesForm from './notesForm';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { toastPromise } from 'redux/common';
import { sortObjectsByField } from 'services/helper/default';
import { TakeConfirmation } from 'Components/components';
import patientService from 'services/APIs/services/patientService';

export default function PatientNotes({
    card, patientId, rowData,
    index, setMainState, className = '',
    data = []
}) {
    const [state, setState] = useState({
        create: false,
        update: false
    })

    const onCancelHandler = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), []);

    const onSubmitHandler = useCallback(async (body, mode, id) => {
        if (mode === 'create') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientService.noteCreate({ payload: { patientId, ...body } });
                        if (data?.status === 1) setMainState(prev => ({ ...prev, patientData: { ...prev.patientData, patientNotes: [data.data, ...prev.patientData?.patientNotes] } }))
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Creating note.', error: 'Could not create note.', success: 'note created.',
                options: { id: "create-notes" }
            });
        }
        else if (mode === 'update') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientService.noteUpdate({ payload: { ...body, id } });
                        setMainState(prev => ({
                            ...prev, patientData: {
                                ...prev.patientData,
                                patientNotes: prev.patientData?.patientNotes.map((item) => {
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
                }, loading: 'Updating note.', error: 'Could not update note.', success: 'note updated.',
                options: { id: "update-notes" }
            });
        };
        onCancelHandler();
    }, [onCancelHandler, patientId, setMainState]);

    const onDelete = useCallback(async (id) => {
        TakeConfirmation({
            title: "Are you sure to delete the selected note?",
            onDone: async () => {
                await patientService.noteDelete({ payload: { id } });
                setMainState(prev => ({
                    ...prev, patientData: {
                        ...prev.patientData,
                        patientNotes: prev.patientData?.patientNotes.filter((item) => item.id !== id)
                    }
                }));
            }
        })
    }, [setMainState]);

    const columns = useMemo(() => [
        {
            field: "actions", headerName: "Actions", type: "actions", minWidth: 180,
            getActions: (params) => [
                <MuiEditAction onClick={() => setState(prev => ({ ...prev, update: params.row }))} />,
                <MuiDeleteAction onClick={() => onDelete(params.id)} />,
            ],
        },
        {
            field: "date", headerName: "Date", minWidth: 180, flex: 0,
            renderCell: (params) => (
                <>{moment().format("MM/DD/YY")}</>
            ),
        },
        {
            field: "notes", headerName: "Notes", minWidth: 200, flex: 1,
            renderCell: (params) => (
                <div className='line-clamp line-clamp-3 my-2'>{params.row.note}</div>
            ),
        },
    ], [onDelete]);

    // get task data sort
    const NotesData = useMemo(() => sortObjectsByField(data, "createdAt"), [data]);

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
                        {`${rowData?.firstName ? `${rowData?.firstName} ${rowData?.lastName ? rowData?.lastName : ''} -` : ''}  Notes`}
                    </div>
                </div>

            </div>
            <div id={`panelsStayOpen-collapse-${card.id}-${patientId}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
                <div className="accordion-body">
                    <div className={`my-2 cstm-mui-datagrid ${!NotesData?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
                        <DataGridPro
                            columns={columns}
                            rows={NotesData ? NotesData : []}
                            autoHeight
                            density="compact"
                            disableColumnFilter
                            getRowHeight={() => "auto"}
                            onRowClick={({ row }) => setState(prev => ({ ...prev, update: row }))}
                            components={{
                                LoadingOverlay: LinearProgress,
                                Footer: () => (<></>)
                            }}
                        />
                    </div>
                    <Button variant="primary" size="sm" onClick={(e) => {
                        setState(prev => ({ ...prev, create: true }));
                    }}>
                        Add Notes
                    </Button>
                </div>
            </div>
            <div className='d-flex'>
                <CreateEditNotes
                    fieldName='Notes'
                    showModal={Boolean(state.create || state.update)}
                    onSubmit={onSubmitHandler}
                    onCancel={onCancelHandler}
                    mode={(state.create ? 'create' : (state.update && 'update'))}
                    updateData={state.update} />
            </div>
        </Card>
    </>)
}

export const CreateEditNotes = ({ showModal, onSubmit, onCancel, mode = 'create', updateData, fieldName = 'field', patientId }) => {
    let taskJSONForm = useMemo(() => {
        const formData = getNotesForm();
        return formData.map((item) => {
            if (updateData) {
                if (item.name === 'dueDate') item.value = moment(updateData[item.name]).toDate();
                else if (updateData.hasOwnProperty(item.name)) item.value = updateData[item.name];
            }
            return item;
        })
    }, [updateData]);

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
                    onSubmit={(data) => onSubmit(data, mode, (mode === 'update' && updateData.id) || patientId)}
                />
            }
        />
    )
}
