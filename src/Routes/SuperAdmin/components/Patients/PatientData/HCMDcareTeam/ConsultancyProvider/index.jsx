import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactSelect from 'react-select';
import Divider from 'antd/lib/divider'
import { Button } from 'react-bootstrap';
// Mui Components
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';

import { TelephoneFill } from 'react-bootstrap-icons';
import { MuiActionButton, MuiDeleteAction } from 'Components/MuiDataGrid';
import { CONST } from 'utils/constants';
import { getDesignationByKey } from 'services/helper';
import ModalReactstrap from 'Components/Modals/Modal';
import userService from 'services/APIs/services/userService';

export default function ConsultancyProvider({ setMainState, mainState }) {
    const { consultancyProvider = [] } = mainState;
    const [state, setState] = useState({
        create: false, update: false
    });

    const onCancelHandler = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), [])

    const onDelete = useCallback((row) => {
        setMainState(prev => ({
            ...prev, consultancyProvider: prev.consultancyProvider.filter(i => i.id !== row.id)
        }))
    }, [setMainState]);

    const onSubmit = useCallback((data) => {
        setMainState(prev => ({ ...prev, consultancyProvider: [data, ...prev.consultancyProvider] }));
        onCancelHandler();
    }, [setMainState, onCancelHandler]);

    const columns = useMemo(() => [
        {
            field: "name", headerName: "Name", minWidth: 50, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => (<>{row.name ? row.name : '-'}</>)
        },
        {
            field: "speciality", headerName: "Speciality", minWidth: 50, headerAlign: "center", align: 'center',
            renderCell: ({ row }) => (<>{row.speciality ? row.speciality : '-'}</>)
        },
        {
            field: "faxNumber", headerName: "Fax Number", minWidth: 50, headerAlign: "center", align: 'center',
            renderCell: ({ row }) => (<>{row.faxNumber ? row.faxNumber : '-'}</>)
        },
        {
            field: "contactNumber", headerName: "Contact Number", minWidth: 50, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => (<>{row.phone ? row.phone : '-'}</>)
        },
        {
            field: "actions", type: "actions", headerName: "Actions", minWidth: 180,
            getActions: ({ row }) => [
                <MuiActionButton Icon={TelephoneFill} size="small" tooltip={"Call"} />,
                <MuiDeleteAction onClick={() => onDelete(row)} />,
            ],
        },
    ], [onDelete]);

    return (<>
        <Divider className='text-color mt-4' style={{ borderColor: 'grey' }} orientation='left'>Consultancy Provider</Divider>
        <div className={`cstm-mui-datagrid ${!consultancyProvider?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
            <DataGridPro
                rows={consultancyProvider && !!consultancyProvider?.length ? consultancyProvider : []}
                columns={columns}
                autoHeight
                disableColumnFilter
                disableVirtualization
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () => null
                }}
            />
        </div>
        <Button className='mt-1' variant='primary' onClick={() => setState(prev => ({ ...prev, create: true }))} >Add Provider</Button>
        <AddConsultancyProvider
            fieldName='Consultancy Provider'
            showModal={Boolean(state.create || state.update)}
            onSubmit={onSubmit}
            onCancel={onCancelHandler}
            mode={(state.create ? 'create' : (state.update && 'update'))}
            updateData={state.update}
            consultancyProvider={consultancyProvider}
        />
    </>)
}

export const AddConsultancyProvider = ({ showModal, onSubmit, onCancel, mode = 'create', updateData, fieldName = 'field', consultancyProvider }) => {
    const [provider, setProvider] = useState()
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        (async () => {
            if (!showModal) return;
            setLoading(true);
            const desg = await getDesignationByKey(CONST.DESIGNATION_KEY.PROVIDER, "selectable");
            const payload = {
                "query": {
                    "ownProvider": false,
                    "designationId": desg.id || undefined
                },
                "options": {
                    "sort": [["name", "asc"]]
                }
            }
            const data = await userService.list({ payload });
            setOptions(data.data.map(i => ({ id: i.id, value: i, label: i.name })));
            setLoading(false);
        })();
    }, [showModal]);

    const providerOptions = useMemo(() => {
        let optionsArr = options;
        const assignIds = consultancyProvider.map(i => i.id);
        optionsArr = optionsArr.filter(i => !assignIds.includes(i.id));
        return optionsArr;
    }, [options, consultancyProvider]);

    return (
        <ModalReactstrap
            header={<>{mode === 'update' ? 'Edit ' + fieldName : 'Add ' + fieldName}</>}
            toggle={onCancel}
            show={showModal}
            body={
                showModal && <>
                    <div className="form-group">
                        <label htmlFor='addHCMDprovider'>Provider</label>
                        <ReactSelect
                            name={"addHCMDprovider"}
                            value={[provider]}
                            onChange={(item) => setProvider(item)}
                            cacheOptions={[]}
                            autoFocus
                            defaultOptions
                            classNamePrefix="select"
                            placeholder="Select provider"
                            menuPlacement='auto'
                            options={providerOptions}
                            isLoading={loading}
                            className="basic-multi-select issue-multi-select_user-dropdown input-border"
                        />
                    </div>
                    <Button onClick={() => onSubmit(provider.value)} disabled={!provider}>Add</Button>
                </>
            }
        />
    )
}