import React, { useCallback, useMemo, useState } from 'react'
import Divider from 'antd/lib/divider'
import { DataGridPro } from '@mui/x-data-grid-pro';
import { Button } from 'react-bootstrap';
import { CreateEditRelative } from '../../DetailPanel/PatientRelatives';
import { MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';

export default function NextofKin({ mainState, setMainState }) {
    const { nextOfKin = {} } = mainState;
    const [kinState, kinSetState] = useState({ create: false, update: false });

    const columns = useMemo(() => [
        {
            field: "name", headerName: "Contact Name", minWidth: 50, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => <>{row.name ? row.name : '-'}</>
        },
        {
            field: "relation", headerName: "Relation", minWidth: 50, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => <>{row.relation ? row.relation : '-'}</>
        },
        {
            field: "contactNumber", headerName: "Contact", minWidth: 50, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => <>{row.contactNumber ? row.contactNumber : '-'}</>
        },
        {
            field: "typeOfNumber", headerName: "Contact Type", minWidth: 50, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => <>{row.typeOfNumber ? row.typeOfNumber : '-'}</>
        },
        {
            field: "actions", type: "actions", headerName: "Actions",
            getActions: (params) => [
                <MuiEditAction onClick={() => kinSetState(prev => ({ ...prev, update: params.row }))} />,
                <MuiDeleteAction onClick={() => setMainState(prev => ({
                    ...prev,
                    nextOfKin: prev.nextOfKin.filter(i => i.id !== params.id)
                }))} />,
            ],
        },
    ], [setMainState]);

    const onCancelHandler = useCallback(() => kinSetState(prev => ({ ...prev, create: false, update: false })), []);

    const onSubmitSuccess = useCallback((data) => {
        if (kinState.update) {
            setMainState(prev => ({
                ...prev,
                nextOfKin: prev.nextOfKin.map((item) => {
                    if (item.id === data.id) return { ...item, ...data }
                    return item;
                })
            }))
        } else {
            setMainState(prev => ({ ...prev, nextOfKin: [...prev.nextOfKin, data] }))
        }
    }, [kinState.update, setMainState]);

    return (<>
        <Divider className='text-color mt-4' style={{ borderColor: 'grey' }} orientation='left'>Next of Kin</Divider>
        <div className={`cstm-mui-datagrid ${!nextOfKin?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
            <DataGridPro
                rows={nextOfKin && !!nextOfKin.length ? nextOfKin : []}
                columns={columns}
                autoHeight
                disableColumnFilter
                disableVirtualization
                components={{
                    // LoadingOverlay: LinearProgress,
                    Footer: () => <></>
                }}
            />
        </div>
        <Button className='mt-1' variant='primary' onClick={() => kinSetState(prev => ({ ...prev, create: true }))}>Add Relative</Button>
        <CreateEditRelative
            fieldName='Relative'
            showModal={Boolean(kinState.create || kinState.update)}
            onSubmitSuccess={onSubmitSuccess}
            onCancel={onCancelHandler}
            mode={(kinState.create ? 'create' : (kinState.update && 'update'))}
            updateData={kinState.update}
            directSubmit={true}
        />
    </>)
}
