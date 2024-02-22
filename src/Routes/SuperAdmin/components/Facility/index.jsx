import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { LinearProgress } from '@mui/material';
import { DataGridPro, } from '@mui/x-data-grid-pro';
import { TakeConfirmation } from 'Components/components';
import { generatePayload, getImageURL, toastPromise, updateState } from 'redux/common';
import moment from 'moment-timezone';
import useDebounce from 'services/hooks/useDebounce';
import { CONST } from 'utils/constants';
import { useQuery } from '@tanstack/react-query';
import { MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import getFacilityForm from './facilityForm';
import { dispatch } from 'redux/store';
import { MODEL_CONST } from 'redux/constants/modelConstants';
import { useSelector } from 'react-redux';
import CreateEditFacility from './CreateEditFacility';
import ModalReactstrap from 'Components/Modals/Modal';
import { getDesignationByKey } from 'services/helper';
import facilityService from 'services/APIs/services/facilityService';
import Input from 'Components/FormBuilder/components/Input';
import { Button } from 'react-bootstrap';
import FacilityRooms from './FacilityRooms';

const defaultSort = [{ field: 'name', sort: 'asc' }]
export default function Facility() {
    const [state, setState] = useState({
        rows: [],
        pageSize: 10,
        page: 1,
        loading: false,
        rowCountState: 0,
        total: 0,
        search: '',
        currSearch: '',
        create: false,
        update: false,
        providerId: null,
        nursePractitionerId: null,
        sortModel: defaultSort,
        facilityRooms: false
    });
    const { userDesignations } = useSelector(state => state.chat);
    const { updateTable } = useSelector(state => state.model);
    const newSearch = useDebounce(state.search, 500);
    const onCancelHandler = useCallback(() => updateState(setState, { create: false, update: false, facilityRooms: false }), []);

    const getData = useCallback(async () => {
        const payload = await generatePayload({
            keys: ['name', 'location'], value: newSearch,
            options: {
                sort: !!state.sortModel?.length ? state.sortModel.map(i => ([i.field, i.sort])) : undefined,
                populate: ["organizationInfo", "facilityProviderInfo", "facilityRooms"],
                limit: state.pageSize,
                page: state.page,
                pagination: true,
            }, isCount: true, currSearch: state.currSearch
        });
        const data = await facilityService.list({ payload });
        setState(prev => ({
            ...prev, currSearch: newSearch,
            page: (state.currSearch !== newSearch) ? 1 : prev.page
        }));
        if (data?.status === 1) {
            data.data.lastUpdated = moment().format();
            return data.data
        };
        return [];
    }, [newSearch, state.page, state.pageSize, state.sortModel, state.currSearch]);

    const { data: facilityList, isFetching, refetch } = useQuery({
        queryKey: ["/facility/list", state.page, state.pageSize, newSearch ? newSearch : undefined, updateTable],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    const onSubmitHandler = useCallback(async (body, mode = state.update ? 'update' : 'create') => {
        if (body.hasOwnProperty('roomNumber') && !!body['roomNumber'].length)
            body['roomNumber'] = body['roomNumber'].map(i => i.value)
        if (body.hasOwnProperty('orgId') && !!body['orgId'].length)
            body['orgId'] = body['orgId'].map(i => i.value)
        if (state.update) {
            body.id = state.update.id;
            const currRooms = state.update.facilityRooms.map(i => i.roomNumber) || [];
            const newRooms = body.roomNumber || [];
            const addedRooms = newRooms?.filter(item => !currRooms.includes(item)) || [];
            const removedRooms = currRooms?.filter(item => !newRooms.includes(item)) || [];
            body.addedRooms = addedRooms;
            body.removedRooms = removedRooms;
            delete body.roomNumber;
        }
        if (body.NP && body.MD) {
            body.facilityProvider = [
                ...body.MD.map(i => ({ ...i, "facilityId": state?.update?.id || undefined, "providerId": i.value })),
                ...body.NP.map(i => ({ ...i, "facilityId": state?.update?.id || undefined, "providerId": i.value })),
                ...body.STAFF.map(i => ({ ...i, "facilityId": state?.update?.id || undefined, "providerId": i.value }))
            ]
            delete body.NP;
            delete body.MD;
            delete body.STAFF;
        }
        toastPromise({
            func: async (resolve, reject) => {
                try {
                    (mode === 'update') ?
                        await facilityService.update({ payload: body }) :
                        await facilityService.create({ payload: body });
                    refetch();
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            }, loading: 'Loading facility.', error: 'Could not load facility.', success: 'facility loaded.'
        });
        onCancelHandler();
    }, [refetch, state.update, onCancelHandler]);

    const onEdit = useCallback((data) => updateState(setState, { update: data }), []);
    const onDelete = useCallback((id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the facility?',
            onDone: async () => {
                const data = await facilityService.delete({ payload: { id } });
                if (data.status === 1) refetch();
            }
        })
    }, [refetch]);

    useEffect(() => {
        (async () => {
            const providerDesignation = await getDesignationByKey(CONST.DESIGNATION_KEY.PROVIDER, "selectable");
            const NursePracDesignation = await getDesignationByKey(CONST.DESIGNATION_KEY.NURSE_PRACTITIONER);
            const RoundsDesignation = await getDesignationByKey(CONST.DESIGNATION_KEY.ROUNDING_SHEET);
            setState(prev => ({
                ...prev,
                nursePractitionerId: NursePracDesignation?.id,
                roundsDesgId: RoundsDesignation?.id,
                providerId: providerDesignation?.id
            }))
        })();
    }, [userDesignations])

    const columns = useMemo(() => [
        {
            field: "name", headerName: "Facility", minWidth: 180, headerAlign: "center", align: 'center', flex: 1, disableSort: true,
            renderCell: ({ row }) => (<>{row.name}</>)
        },
        {
            field: "organization", headerName: "Organization", minWidth: 180, headerAlign: "center", align: 'center', flex: 1, disableSort: true,
            renderCell: ({ row }) => (<>
                <div className='d-flex align-items-center gap-10'>
                    <img src={getImageURL(row.info?.image, '35x35')} alt=""
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch({
                                type: MODEL_CONST.USER_IMAGE_DATA, payload: {
                                    id: row.info?.id,
                                    name: row.info?.name,
                                    image: row.info?.image,
                                    updateType: "organization",
                                    updateTable: "facility",
                                    updateField: "image"
                                }
                            })
                        }}
                    />
                    {row.info?.name ? row.info?.name : '-'}
                </div>
            </>)
        },
        {
            field: "location", headerName: "Location", minWidth: 180, headerAlign: "center", align: 'center', flex: 1, disableSort: true,
            renderCell: ({ row }) => (<>{row.location}</>)
        },
        {
            field: "roomNumber", headerName: "Room no.", headerAlign: "center", align: 'center', flex: 1, disableSort: true,
            renderCell: ({ row }) => (
                <div className='overflow-hidden' onClick={() => setState(prev => ({ ...prev, facilityRooms: row.facilityRooms }))}>
                    {row.facilityRooms?.map((room, index) => (
                        <nobr key={index} className="desg-tag mr-1 px-1">{room.roomNumber}</nobr>
                    ))}
                </div>)
        },
        {
            field: "md", headerName: "HCMD MD", headerAlign: "center", flex: 1, disableSort: true,
            renderCell: ({ row }) => {
                const defaultMD = row.facilityAssigns.filter(i => i.isDefault && i.designationId === state.providerId).map(i => i?.providerInfo);
                const facilityMD = row.facilityAssigns.filter(i => (!i.isDefault && i.designationId === state.providerId));
                return (<div className='d-flex gap-5 flex-wrap p-1 overflow-hidden'>
                    {!!defaultMD.length && defaultMD.map(i => i.name && <nobr className='desg-tag px-1 main-desg-tag'>{i.name}</nobr>)}
                    {facilityMD.map((i, index) => (
                        <nobr key={index} className='desg-tag'>{i.providerInfo.name}</nobr>
                    ))}
                </div>)
            }
        },
        {
            field: "np", headerName: "HCMD NP", headerAlign: "center", flex: 1, disableSort: true,
            renderCell: ({ row }) => {
                const defaultNP = row.facilityAssigns.filter(i => i.isDefault && i.designationId === state.nursePractitionerId).map(i => i?.providerInfo);
                const facilityNP = row.facilityAssigns.filter(i => (!i.isDefault && i.designationId === state.nursePractitionerId));
                return (<div className='d-flex gap-5 flex-wrap p-1 overflow-hidden'>
                    {!!defaultNP?.length && defaultNP.map(i => i.name && <nobr className='desg-tag main-desg-tag'>{i.name}</nobr>)}
                    {facilityNP.map((i, index) => {
                        return <nobr key={index} className='desg-tag'>{i.providerInfo.name}</nobr>
                    })}
                </div>)
            }
        },
        {
            field: "staff", headerName: "HCMD Staff", headerAlign: "center", flex: 1, disableSort: true,
            renderCell: ({ row }) => {
                const facilityRounds = row.facilityAssigns.filter(i => (!i.isDefault && i.designationId === state.roundsDesgId))
                return (<div className='d-flex gap-5 flex-wrap p-1 overflow-hidden'>
                    {facilityRounds.map((i, index) => {
                        return <nobr key={index} className='desg-tag'>{i.providerInfo.name}</nobr>
                    })}
                </div>)
            }
        },
        {
            field: "actions", type: "actions", headerName: "Actions", flex: 1,
            getActions: (params) => [
                <MuiEditAction tooltip='Edit Facility' onClick={() => onEdit(params.row)} />,
                <MuiDeleteAction tooltip='Delete Facility' color='danger' onClick={() => onDelete(params.id)} />,
            ],
        },
    ], [onDelete, onEdit, state.nursePractitionerId, state.providerId, state.roundsDesgId]);

    const formJSON = useMemo(() => {
        const facilityForm = getFacilityForm();
        return facilityForm.map((item) => {
            if (state.update) {
                if (state.update.hasOwnProperty(item.name) && item.name === 'name') item.value = state.update[item.name]
                else if (state.update.hasOwnProperty(item.name) && item.name === 'location') item.value = state.update[item.name]
                else if (item.name === "roomNumber")
                    item.value = state.update["facilityRooms"] && state.update["facilityRooms"].map((i) => ({ label: i.roomNumber, value: i.roomNumber }))
                else if ((item.name === 'np' || item.name === 'md') && state.update.hasOwnProperty('facilityAssigns')) {
                    const user = state.update['facilityAssigns']?.find((i) => i.designation === item.name.toUpperCase())?.providerInfo || null;
                    item.value = user ? [{ label: user.name, value: user.id }] : null
                }
                else if (state.update.hasOwnProperty(item.name) && item.name === 'orgId' && state.update.info)
                    item.value = [{ label: state.update.info.name, value: state.update.info.id }]
            }
            return item;
        })
    }, [state.update]);

    const onSortModelChange = useCallback(async (data) => {
        setState(prev => ({ ...prev, sortModel: data }));
        await refetch();
    }, [refetch]);

    return (<>
        <div className="form-inline d-flex justify-content-between">
            <div className="input-group admin-search m-0">
                <Input
                    name="search_user"
                    value={state.search}
                    type="text"
                    placeholder="Search facility..."
                    handleChange={(e) => updateState(setState, { search: e.target.value })}
                />
            </div>
            <Button onClick={() => setState(prev => ({ ...prev, create: true }))}>
                Add New
            </Button>
        </div>
        <div className={`mt-2 cstm-mui-datagrid ${!facilityList?.rows?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
            <DataGridPro
                rows={facilityList?.rows ? facilityList?.rows : []}
                columns={columns}
                autoHeight
                getRowHeight={() => "auto"}
                sortModel={state.sortModel}
                onSortModelChange={onSortModelChange}
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () =>
                        <MuiDataGridFooter isFetching={isFetching}
                            lastUpdated={facilityList?.lastUpdated}
                            pagination={{ page: state?.page, total: facilityList?.count || 0, pageSize: state?.pageSize }}
                            onPageChange={(e, page) => {
                                updateState(setState, { page: page });
                            }}
                        />
                }}
                disableColumnFilter
            />
        </div>
        <ModalReactstrap
            size='lg'
            show={Boolean(state.create || state.update)}
            toggle={onCancelHandler}
            centered
            header={state.create ? 'Create Facility' : 'Edit Facility'}
            body={<CreateEditFacility
                state={state}
                formJSON={formJSON}
                onSubmitHandler={onSubmitHandler} />}
        />
        <ModalReactstrap
            size='lg'
            show={Boolean(state.facilityRooms)}
            toggle={onCancelHandler}
            centered
            header={'Facility Rooms'}
            body={state.facilityRooms && <FacilityRooms facilityRooms={state.facilityRooms} />}
        />
    </>)
}
