import React, { useCallback, useMemo, useState } from 'react'
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { toastPromise } from 'redux/common';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { Button, Card } from 'react-bootstrap';
import { MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import getRelativeForm from './relativesForm';
import moment from 'moment-timezone';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { TakeConfirmation } from 'Components/components';
import patientGuradianService from 'services/APIs/services/patientGuradianService';

export default function PatientRelatives({
    card, patientId, rowData,
    index, setMainState, className = '',
    data = []
}) {
    const [state, setState] = useState({
        page: 1,
        total: 0,
        pageSize: 10,
        rowCountState: 0,
        loading: false,
        filters: {
            search: null,
            designation: null,
            status: null,
        },
        create: false,
        update: false
    });
    const onCancelHandler = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), []);

    const onSubmitSuccess = useCallback((data) => {
        if (state.update) {
            setMainState(prev => ({
                ...prev, patientData: {
                    ...prev.patientData,
                    patientGuardians: prev.patientData?.patientGuardians.map((item) => {
                        if (item.id === data.data.id) return { ...item, ...data.data }
                        return item;
                    })
                }
            }))
        } else {
            if (data?.status === 1) setMainState(prev => ({ ...prev, patientData: { ...prev.patientData, patientGuardians: [data.data, ...prev.patientData?.patientGuardians] } }))
        }
    }, [setMainState, state.update]);

    const onDelete = useCallback(async (id) => {
        TakeConfirmation({
            title: "Are you sure to remove the selected relative data?",
            onDone: async () => {
                await patientGuradianService.delete({ payload: { id } });
                setMainState(prev => ({
                    ...prev, patientData: {
                        ...prev.patientData,
                        patientGuardians: prev.patientData?.patientGuardians.filter((item) => item.id !== id)
                    }
                }))
            }
        })
    }, [setMainState]);

    const columns = useMemo(() => [
        {
            field: "actions", type: "actions", headerName: "Actions", flex: 1,
            getActions: (params) => [
                <MuiEditAction onClick={() => setState(prev => ({ ...prev, update: params.row }))} />,
                <MuiDeleteAction onClick={() => onDelete(params.id)} />,
            ],
        },
        // patient name
        { field: "name", headerName: "name", flex: 1, },
        // Relationship of Next of Kin with patient
        { field: "relation", headerName: "Relation", flex: 1, },
        // Contact Number - Next of Kin
        { field: "contactNumber", headerName: "Phone", flex: 1, },
        // Contact Type - Next of Kin
        { field: "typeOfNumber", headerName: "Phone type", flex: 1, },
        // Priority - Next of Kin
        { field: "priority", headerName: "Priority", flex: 1, },
        // Notes - Next of Kin
        { field: "note", headerName: "Notes" },
    ], [onDelete]);

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
                        {`${rowData?.firstName ? `${rowData?.firstName} ${rowData?.lastName ? rowData?.lastName : ''} -` : ''} Next of Kin`}
                    </div>
                </div>
            </div>
            <div id={`panelsStayOpen-collapse-${card.id}-${patientId}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
                <div className="accordion-body">
                    <div className={`my-2 cstm-mui-datagrid ${!data?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
                        <DataGridPro
                            rows={data ? data : []}
                            columns={columns}
                            autoHeight
                            density="compact"
                            disableColumnFilter
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
                        Add Contact
                    </Button>
                </div>
            </div>
            <CreateEditRelative
                fieldName='Relative'
                showModal={Boolean(state.create || state.update)}
                onSubmitSuccess={onSubmitSuccess}
                onCancel={onCancelHandler}
                patientId={patientId}
                mode={(state.create ? 'create' : (state.update && 'update'))}
                updateData={state.update} />
        </Card>
    </>)
}

export const CreateEditRelative = ({ showModal, onSubmitSuccess, onCancel, mode = 'create', updateData, fieldName = 'field', patientId, directSubmit }) => {

    const onSubmitHandler = useCallback(async (body, mode, id) => {
        if (directSubmit) {
            if (mode === "create") body.id = Date.now();
            onSubmitSuccess(body);
            onCancel();
            return;
        }
        if (mode === 'create') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientGuradianService.create({ payload: { patientId, ...body } });
                        onSubmitSuccess(data);
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Creating...', error: 'Could not create.', success: ' created.',
                options: { id: "create-patient" }
            });
        }
        else if (mode === 'update') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientGuradianService.update({ payload: { ...body, id } });
                        onSubmitSuccess(data);
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Updating...', error: 'Could not update.', success: 'Updated.',
                options: { id: "update-patient" }
            });
        };
        onCancel();
    }, [onCancel, patientId, onSubmitSuccess, directSubmit]);

    let taskJSONForm = useMemo(() => {
        const formData = getRelativeForm();
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
            body={
                showModal &&
                <FormGenerator
                    className="m-0"
                    formClassName={"row"}
                    dataFields={taskJSONForm}
                    onSubmit={(data) => onSubmitHandler(data, mode, mode === 'update' && updateData.id)}
                />
            }
        />
    )
}
