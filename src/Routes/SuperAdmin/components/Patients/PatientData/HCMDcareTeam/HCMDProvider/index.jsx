import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import Divider from 'antd/lib/divider'
import ModalReactstrap from 'Components/Modals/Modal';
import { Button } from 'react-bootstrap';
import { MuiActionButton, MuiDeleteAction } from 'Components/MuiDataGrid';
import { TelephoneFill } from 'react-bootstrap-icons';
import ReactSelect from 'react-select';
import { Switch } from 'antd';
import { abbreviateDesg } from 'services/helper';
import facilityService from 'services/APIs/services/facilityService';

export default function HCMDProvider({ mainState, setMainState }) {
    const { HCMDProvider, HCMDProviderOptions } = mainState;
    const [state, setState] = useState({ create: false, update: false })

    const onCancelHandler = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), [])

    const onDelete = useCallback((row) => {
        setMainState(prev => ({ ...prev, HCMDProvider: prev.HCMDProvider.filter(i => i.id !== row.id) }))
    }, [setMainState]);

    const onSubmit = useCallback((data) => {
        setMainState(prev => ({ ...prev, HCMDProvider: [data, ...prev.HCMDProvider] }));
        onCancelHandler();
    }, [setMainState, onCancelHandler]);

    const columns = useMemo(() => [
        {
            field: "name", headerName: "Name", minWidth: 50, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => {
                const position = abbreviateDesg(row.designation.key);
                return (
                    <div className='d-flex gap-10'>
                        <div>{row.name ? row.name : '-'}</div>
                        {row.designation?.key && position && <div className='desg-tag'>{position}</div>}
                    </div>)
            }
        },
        {
            field: "speciality", headerName: "Speciality", minWidth: 110, headerAlign: "center", align: 'center',
            renderCell: ({ row }) => (<>{row.speciality ? row.speciality : '-'}</>)
        },
        {
            field: "faxNumber", headerName: "Fax Number", minWidth: 110, headerAlign: "center", align: 'center',
            renderCell: ({ row }) => (<>{row.faxNumber ? row.faxNumber : '-'}</>)
        },
        {
            field: "contactNumber", headerName: "Contact Number", minWidth: 110, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => (<>{row.phone ? row.phone : '-'}</>)
        },
        {
            field: "actions", type: "actions", headerName: "Actions",
            getActions: ({ row }) => [
                <MuiActionButton Icon={TelephoneFill} size="small" tooltip={"Call"} />,
                <MuiDeleteAction onClick={() => onDelete(row)} />,
            ],
        },
    ], [onDelete]);

    return (<>
        <Divider className='text-color mt-4' style={{ borderColor: 'grey' }} orientation='left'>HCMD Provider</Divider>
        <div className={`cstm-mui-datagrid ${!HCMDProvider?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
            <DataGridPro
                rows={HCMDProvider && !!HCMDProvider?.length ? HCMDProvider : []}
                columns={columns}
                autoHeight
                disableColumnFilter
                disableVirtualization
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () => <></>
                }}
            />
        </div>
        <Button className='mt-1' variant='primary' onClick={() => setState(prev => ({ ...prev, create: true }))} >Add Provider</Button>
        <AddHCMDProvider
            fieldName='HCMD Provider'
            showModal={Boolean(state.create || state.update)}
            onSubmit={onSubmit}
            onCancel={onCancelHandler}
            mode={(state.create ? 'create' : (state.update && 'update'))}
            updateData={state.update}
            HCMDProvider={HCMDProvider}
            HCMDProviderOptions={HCMDProviderOptions}
            mainState={mainState}
            setMainState={setMainState}
        />
    </>)
}

const desg = ["MD", "NP"];
export const AddHCMDProvider = ({ showModal, onSubmit, onCancel, mode = 'create', fieldName = 'field', HCMDProvider, HCMDProviderOptions, mainState, setMainState }) => {
    const [provider, setProvider] = useState();
    const [selected, setSelected] = useState(desg[0]);

    useEffect(() => {
        (async () => {
            // TODO
            // if (!HCMDProviderOptions && mainState.facility) {
            const facility = mainState.facilityOptions?.find(i => i.id === mainState.facility?.id);
            // const providersOptions = facility?.value?.facilityAssigns || [];
            const payload = {
                "query": { "id": facility?.id },
                "options": { "populate": ["facilityProviderInfo", "organizationInfo"] },
                "findOne": true
            }
            let providersOptions = await facilityService.list({ payload });
            providersOptions = providersOptions.data.facilityAssigns.map((i) => ({
                ...i, designation: i.desiInfo
            }))
            setMainState(prev => ({ ...prev, HCMDProviderOptions: providersOptions }));
            // }
        })();
    }, [mainState.facility?.id, mainState.facilityOptions, setMainState]);

    const selectOptions = useMemo(() => {
        let options = [];
        if (HCMDProviderOptions && !!HCMDProviderOptions.length) {
            const assignIds = HCMDProvider?.map(i => i.id) || [];
            options = HCMDProviderOptions
                .filter(i => !assignIds.includes(i.providerId || i.userId))
                .map(i => ({
                    id: i.providerInfo.id, label: i.providerInfo.name,
                    value: { ...i.providerInfo, designation: i.desiInfo || null }
                }))
                .filter(i => abbreviateDesg(i.value.designation?.key) === selected);
        }
        return options;
    }, [HCMDProvider, HCMDProviderOptions, selected]);

    return (
        <ModalReactstrap
            header={<>{mode === 'update' ? 'Edit ' + fieldName : 'Add ' + fieldName}</>}
            toggle={onCancel}
            show={showModal}
            body={
                showModal && <>
                    <div className="form-group d-flex gap-10 align-items-center mb-1">
                        <label htmlFor='designation' className='mb-0'>Designation: </label>
                        <Switch
                            className='outline-none'
                            style={{ background: "#665fde" }}
                            unCheckedChildren={"NP"}
                            checkedChildren={"MD"}
                            checked={selected === desg[0]}
                            onChange={val => setSelected(prev => prev === desg[0] ? desg[1] : desg[0])}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor='addHCMDprovider'>Provider: </label>
                        <ReactSelect
                            options={selectOptions}
                            className="basic-multi-select issue-multi-select_user-dropdown input-border"
                            classNamePrefix="select"
                            name={"addHCMDprovider"}
                            value={[provider]}
                            onChange={(item) => setProvider(item)}
                            cacheOptions={[]}
                            placeholder="Select provider"
                            menuPlacement='auto'
                            defaultOptions
                            autoFocus
                            isClearable
                        />
                    </div>
                    <Button onClick={() => onSubmit(provider.value)} disabled={!provider}>Add</Button>
                </>
            }
        />
    )
}