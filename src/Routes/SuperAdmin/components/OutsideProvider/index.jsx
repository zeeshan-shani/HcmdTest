import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment-timezone';

// Redux & Utils
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { getUsersList } from 'redux/actions/chatAction';
import { updateUserAPI } from 'redux/actions/userAction';
import { generatePayload, toastPromise, updateState } from 'redux/common';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { CONST, SOCKET } from 'utils/constants';
import { showError } from 'utils/package_config/toast';

// Material Components
import Description from '@mui/icons-material/Description';
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro/DataGridPro';
import { MuiActionButton, MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';

// Custom Hooks
import useDebounce from 'services/hooks/useDebounce';
import { TakeConfirmation } from 'Components/components';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';

// Routes Components
import getOutsideProviderForm from './userform';
import userService from 'services/APIs/services/userService';
import Input from 'Components/FormBuilder/components/Input';

const defaultState = {
    rows: [],
    pageSize: 10,
    page: 1,
    loading: false,
    rowCountState: 0,
    total: 0,
    search: '',
    currSearch: '',
    designation: null,
    create: false,
    update: false,
    isProvider: true,
    providerType: CONST.PROVIDER_TYPE.CONSULTANCY_PROVIDER,
}
export default function OutsideProvider() {
    const navigate = useNavigate();
    const { roles } = useSelector((state) => state.user);
    const { isDeletedChange } = useSelector(state => state.chat);
    const [state, setState] = useState(defaultState);
    const { isProvider, providerType } = state;

    const newSearch = useDebounce(state.search, 500);
    const roleData = useMemo(() => roles.map((item) => ({ id: item.id, value: item.id, label: item.name })), [roles]);

    // User List API 
    const getData = useCallback(async () => {
        let payload = await generatePayload({
            keys: ["name", "firstName", "lastName"], value: newSearch,
            options: {
                sort: [["name", "ASC"]],
                populate: ["providerInfoAssignfacility"],
                limit: state.pageSize,
                page: state.page,
                pagination: true,
            },
            isCount: true,
            currSearch: state.currSearch
        });
        if (isProvider && providerType) {
            payload.query["ownProvider"] = false;
        }
        const res = await getUsersList(payload);
        setState(prev => ({
            ...prev, currSearch: newSearch,
            page: (state.currSearch !== newSearch) ? 1 : prev.page
        }));
        if (res?.status === 1) {
            res.data.lastUpdated = moment().format();
            return res.data;
        }
        if (res?.status === 0) {
            showError('Something went wrong.');
            return null;
        }
        return [];
    }, [state.page, state.pageSize, newSearch, providerType, isProvider, state.currSearch]);

    const { data: usersList, isFetching, refetch } = useQuery({
        queryKey: ["/users/list", isProvider, providerType, state.page, state.pageSize, newSearch ? newSearch : false, state.designation?.id, state?.status, isDeletedChange],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    // Form will be used while add or updating fields
    const formJSON = useMemo(() => {
        const UserFormData = getOutsideProviderForm(roleData);
        return UserFormData.map((item) => {
            if (state.create && item.name === 'role') item.value = !!roleData.length && [roleData.find(i => i.label === "user")]
            if (state.update) {
                if (state.update.hasOwnProperty(item.name)) {
                    if (item.name === 'role') item.value = [roleData.find(i => i.value === state.update[item.name])]
                    else item.value = state.update[item.name]
                }
                else {
                    if (item.name === 'facilityId' && state.update.facilityAssigns) item.value = state.update.facilityAssigns.map(i => ({ value: i?.facility?.id, label: i?.facility?.name }))
                }
            }
            return item;
        })
    }, [state.update, roleData, state.create]);

    const onDeleteUser = useCallback((usr) => {
        TakeConfirmation({
            title: `Are you sure about to delete ${usr.name}?`,
            // content: "Once user is deleted, It can be reactivated by administrator only.",
            onDone: () => {
                SocketEmiter(SOCKET.REQUEST.DELETE_USER, { userId: usr.id }, (ack) => {
                    refetch();
                });
            }
        });
    }, [refetch]);

    const columns = useMemo(() => [
        {
            field: "name", headerName: "Username", flex: 1,
            renderCell: (params) => (
                <div className='MuiDataGrid-cellContent cursor-pointer'>
                    {params.row.name}
                </div>
            ),
        },
        {
            field: "facility", headerName: "Facility", flex: 1,
            renderCell: ({ row }) => {
                const facilitiesArr = row?.facilityAssigns?.map(i => i?.facility?.name) || [];
                const facilities = facilitiesArr.filter(i => i) || null;
                return (<div className='overflow-hidden d-flex gap-5'>
                    {facilities.map((i, index) => (<div className='desg-tag' key={`${row.id}-${i}-${index}`}>{i}</div>))}
                </div>)
            }
        },
        {
            field: "speciality", headerName: "Speciality", flex: 1,
            renderCell: ({ row }) => (<>{row?.speciality ? row.speciality : null}</>)
        },
        {
            field: "faxNumber", headerName: "Fax Number", flex: 1,
            renderCell: ({ row }) => (<>{row?.faxNumber ? row.faxNumber : null}</>)
        },
        { field: "phone", headerName: "Contact Number", flex: 1 },
        {
            field: "actions", headerName: "Actions", type: "actions", minWidth: 150,
            getActions: ({ row }) => [
                <>{isProvider && <MuiActionButton tooltip='Rouding Sheet' Icon={Description} color="primary" onClick={() => navigate(`/dashboard/rounding-sheet`, {
                    state: { provider: { label: row.name, value: row.id } }
                })} />}</>,
                <MuiEditAction onClick={() => updateState(setState, { update: row })} />,
                <MuiDeleteAction onClick={() => onDeleteUser(row)} />,
            ]
        },
    ], [onDeleteUser, isProvider, navigate,]);

    const filterUserForm = useCallback((obj) => {
        Object.keys(obj).map(item => {
            if (item === 'designation' || item === 'keywords') obj[item] = obj[item].map(o => o.value);
            if (item === 'facilityId') obj[item] = obj[item].map(i => i.value) || null;
            else if (item === 'role' && Array.isArray(obj[item]) && obj[item][0].hasOwnProperty('value')) obj[item] = obj[item][0].value;
            return null;
        });
        return obj;
    }, []);

    const filterUpdateForm = useCallback((obj) => {
        let data = { userId: state.update.id }
        Object.keys(obj).map(item => {
            if (obj[item] !== state.update[item]) data[item] = obj[item];
            return null;
        });
        const currFacility = state.update?.facilityAssigns?.map((item) => item.facilityId) || [];
        const newFacility = obj.facilityId || [];
        const addedFacility = newFacility?.filter(item => !currFacility.includes(item));
        const removedFacility = currFacility?.filter(item => !newFacility.includes(item));
        delete data.facilityId;
        return {
            ...data,
            addedFacility: !!addedFacility.length ? addedFacility : undefined,
            removedFacility: !!removedFacility.length ? removedFacility : undefined,
        };
    }, [state.update]);

    const onCancelNewUser = useCallback(() => updateState(setState, { create: false, update: false }), []);

    const onSubmitUser = useCallback(async (body) => {
        let filteredData = await filterUserForm(body);
        filteredData["outsideProvider"] = true;
        if (state.update) {
            const findUpdates = filterUpdateForm(filteredData);
            await updateUserAPI(findUpdates);
            refetch();
        }
        else {
            toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await userService.create({ payload: filteredData });
                        if (data?.status === 2) showError(data?.message);
                        else if (data?.status === 1) refetch();
                        resolve(data);
                    } catch (error) {
                        reject(error);
                        console.error(error);
                    }
                },
                loading: 'Creating New User', success: <b>Successfully Created User</b>, error: <b>Could not created user</b>,
            });
        }
        onCancelNewUser();
    }, [filterUpdateForm, filterUserForm, state.update, onCancelNewUser, refetch]);

    try {
        return (<>
            <div className="form-inline d-flex justify-content-between">
                <div className="input-group admin-search m-0">
                    <Input
                        name="search_user"
                        value={state.search}
                        type="text"
                        placeholder="Search provider..."
                        handleChange={(e) => updateState(setState, { search: e.target.value })}
                    />
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, create: true }))}>
                    Add Provider
                </Button>
            </div>
            <div className={`mt-2 cstm-mui-datagrid ${isFetching && !usersList?.rows?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
                <DataGridPro
                    columns={columns}
                    rows={usersList?.rows ? usersList.rows : []}
                    loading={isFetching}
                    autoHeight
                    disableColumnFilter
                    components={{
                        LoadingOverlay: LinearProgress,
                        Footer: () =>
                            <MuiDataGridFooter isFetching={isFetching}
                                lastUpdated={usersList?.lastUpdated}
                                pagination={{ page: state?.page, total: usersList?.count || 0, pageSize: state?.pageSize }}
                                onPageChange={(e, page) => {
                                    updateState(setState, { page: page });
                                }}
                            />
                    }}
                />
            </div>
            <ModalReactstrap
                size='lg'
                show={Boolean(state.create || state.update)}
                toggle={onCancelNewUser}
                centered
                header={state.create ? 'Create outside provider' : 'Outside Provider Data'}
                body={<>
                    <FormGenerator
                        className={'m-1 text-color'}
                        formClassName="row"
                        dataFields={formJSON}
                        onSubmit={onSubmitUser}
                    />
                </>}
            />
        </>);
    } catch (error) {
        console.error(error);
    }
}