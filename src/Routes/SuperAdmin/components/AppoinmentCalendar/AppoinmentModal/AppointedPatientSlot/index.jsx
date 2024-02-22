import React, { useEffect } from 'react';
import moment from 'moment-timezone';
import BarChartIcon from '@mui/icons-material/BarChart';
import { isMobile } from 'react-device-detect';
import { Button } from 'react-bootstrap';
import { IconButton } from '@mui/material';
import { PencilFill, TrashFill } from 'react-bootstrap-icons';
import { DataGridPro, GridActionsCellItem } from '@mui/x-data-grid-pro';
import { MuiTooltip, TakeConfirmation } from 'Components/components';
import { generatePayload, updateState } from 'redux/common';
import Scheduler from 'Routes/SuperAdmin/components/AppoinmentCalendar/AppoinmentModal/Scheduler';
import patientslotService from 'services/APIs/services/patientslotService';

export default function AppointedPatientSlot({ providerData, event, state, setState }) {
    useEffect(() => {
        getSlotList();
        //eslint-disable-next-line
    }, [])

    const getSlotList = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const payload = await generatePayload({
                rest: { providerSlotId: event?.providerSlotId || event.id },
                options: {
                    populate: ["patientInfo"]
                }
            })
            const data = await patientslotService.list({ payload });
            if (data?.status === 1) {
                setState(prev => ({ ...prev, rows: data.data, loading: false }));
            }
        } catch (error) {
            console.error(error);
        }
    }
    const onEdit = (rowData) => updateState(setState, { update: rowData });
    const onDelete = (dataRow) => {
        TakeConfirmation({
            title: `Are you sure about to delete the ${dataRow.patientInfo.firstName}'s schedule?`,
            onDone: async () => {
                await patientslotService.delete({ payload: { id: dataRow.id } });
                setState(prev => ({ ...prev, rows: prev.rows.filter(item => item.id !== dataRow.id) }));
            }
        })
    }
    const columns = [
        {
            field: "name", flex: 1, headerName: "Patient name", renderCell: (params) => {
                return (<div>{params.row.patientInfo.firstName ? `${params.row.patientInfo.firstName} ${params.row.patientInfo.lastName ? params.row.patientInfo.lastName : ''}` : '-'}</div>)
            }
        },
        {
            field: "start", flex: 1, headerName: "Start", renderCell: (params) => {
                return (<div>{params.row.start ? moment(params.row.start).format('MM/DD/YY hh:mm a') : '-'}</div>)
            }
        },
        {
            field: "end", flex: 1, headerName: "End", renderCell: (params) => {
                return (<div>{params.row.end ? moment(params.row.end).format('MM/DD/YY hh:mm a') : '-'}</div>)
            }
        },
        { field: "appointmentType", headerName: "Visitor", cellClassName: 'text-capitalize' },
        {
            field: "actions", type: "actions", headerName: "Actions",
            getActions: (params) => [
                <MuiTooltip title="Edit Patient">
                    <GridActionsCellItem icon={<PencilFill className="text-primary" />} label="Edit-Patient" onClick={() => onEdit(params.row)} />
                </MuiTooltip>,
                <MuiTooltip title="Delete Patient">
                    <GridActionsCellItem icon={<TrashFill className="text-danger" />} label="Delete-Patient" onClick={() => onDelete(params.row)} />
                </MuiTooltip>,
            ],
        },
    ]
    const onSubmitHandler = () => {
        setState(prev => ({ ...prev, create: false, update: false }));
        getSlotList();
    }
    return (<>
        <div className="d-flex justify-content-between">
            {isMobile &&
                <IconButton onClick={() => setState(prev => ({ ...prev, chart: !prev.chart }))}>
                    <BarChartIcon />
                </IconButton>}
            <Button type="button" size="sm" onClick={() => updateState(setState, { create: true })}>
                Add Patient
            </Button>
        </div>
        <div className={`mt-2 cstm-mui-datagrid ${state.loading || !state.rows.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%' }}>
            <DataGridPro
                loading={state.loading}
                rows={state.rows}
                columns={columns}
                autoHeight
                hideFooter
                density="compact"
                disableColumnFilter
                initialState={{
                    sorting: {
                        sortModel: [{ field: 'start', sort: 'asc' }],
                    },
                }}
            />
        </div>
        {(state.create || state.update) &&
            <Scheduler
                mainState={state}
                setMainState={setState}
                updateData={state.update}
                providerData={providerData}
                event={event}
                AllocatedEvents={state.rows
                    .filter(i => i.id !== state?.update?.id)
                    .map(i => ([i.start, i.end]))}
                mode={state.update ? 'edit' : 'create'}
                onSubmit={onSubmitHandler}
            />}
    </>)
}