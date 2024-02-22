import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import ReactSelect from 'react-select';
import moment from 'moment-timezone';

// Redux & Utils
import { dispatch } from 'redux/store';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { getUsersList } from 'redux/actions/chatAction';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { updateUserAPI } from 'redux/actions/userAction';
import { generatePayload, toastPromise, updateState } from 'redux/common';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { CONST, SOCKET } from 'utils/constants';
import { getSuperAdminAccess } from 'utils/permission';
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
import { ToggleSwitch } from 'Routes/SuperAdmin/components/Users/role/ToggleSwitch';
import getUserFormdata from 'Routes/SuperAdmin/components/Users/userform';
import { getDesignationByKey } from 'services/helper';
import { FilterToggleSwitch } from './statusFilter/ToggleSwitch';
import userService from 'services/APIs/services/userService';
import companyRoleService from 'services/APIs/services/companyRoleService';
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
    isProvider: false,
    providerType: null,
    emailExist: false,
    status: "active"
}
export default function UsersTable() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user, roles } = useSelector((state) => state.user);
    const { userDesignations, isDeletedChange } = useSelector((state) => state.chat);
    const [state, setState] = useState(defaultState);
    const { isProvider, providerType } = state;
    const [companyRoles, setCompanyRoles] = useState([]);

    useEffect(() => {
        if (userDesignations)
            setState(prev => {
                const providerData = pathname.includes("provider") ?
                    getDesignationByKey(CONST.DESIGNATION_KEY.PROVIDER, "selectable") : null;
                return { ...prev, ...defaultState, designation: providerData, isProvider: Boolean(providerData), providerType: CONST.PROVIDER_TYPE.HCMD_PROVIDER }
            })
    }, [pathname, userDesignations]);

    useEffect(() => {
        (async () => {
            const payload = {
                "isCount": true,
                "findOne": false
            }
            const data = await companyRoleService.list({ payload });
            if (data?.status === 1)
                setCompanyRoles(data.data.rows.map(i => ({ id: i.id, label: i.name, value: i.id })) || []);
        })();
    }, []);

    const newSearch = useDebounce(state.search, 500);
    const isSA = useMemo(() => getSuperAdminAccess({ roleData: user?.roleData }), [user?.roleData]);
    const roleData = useMemo(() => roles.map((item) => ({ id: item.id, value: item.id, label: item.name })), [roles]);

    // User List API 
    const getData = useCallback(async (data) => {
        if (pathname.includes("provider") && providerType && !state?.designation) return;

        let payload = await generatePayload({
            rest: { designationId: state?.designation?.id, status: state?.status },
            keys: ["name", "firstName", "lastName", "email", "companyName"], value: newSearch,
            options: {
                sort: [["name", "ASC"]],
                populate: ["designations", "users:own", "companyRoleData"],
                limit: state.pageSize,
                page: state.page,
                pagination: true,
            }, isCount: true,
            currSearch: state.currSearch
        });
        if (pathname.includes("provider") && providerType) {
            // payload.options.populate.push("providerInfoAssignfacility");
            // payload.query["ownProvider"] = true;
        } else {
            payload.options.populate.push("roleData");
        }
        const res = await getUsersList(payload);
        setState(prev => ({ ...prev, currSearch: newSearch, page: (state.currSearch !== newSearch) ? 1 : prev.page }));
        if (res?.status === 1) {
            res.data.lastUpdated = moment().format();
            return res.data;
        }
        if (res?.status === 0) {
            showError('Something went wrong.');
            return null;
        }
        return [];
    }, [state?.designation, state.page, state.pageSize, newSearch, pathname, providerType, state.status, state.currSearch]);

    const { data: usersList, isFetching, refetch } = useQuery({
        queryKey: ["/users/list", isProvider, providerType, state.page, state.pageSize, newSearch ? newSearch : undefined, state.designation?.id, state?.status, isDeletedChange],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L0,
    });

    // Form will be used while add or updating fields
    const formJSON = useMemo(() => {
        const UserFormData = getUserFormdata({ roleData, isProvider, providerType, companyRoles });
        return UserFormData.map((item) => {
            if (state.create && item.name === 'role') item.value = !!roleData.length && [roleData.find(i => i.label === "user")]
            if (state.create && isProvider && item.name === 'designation') item.value = [state.designation]
            // if (state.create && !isProvider && item.name === 'faxNumber') return null

            else if (state.update) {

                if (state.update.hasOwnProperty(item.name)) {
                    if (item.name === 'keywords') item.value = state.update[item.name]?.map((i, ind) => ({ id: ind, value: i, label: i })) || []
                    else if (item.name === 'role') item.value = [roleData.find(i => i.value === state.update[item.name])]
                    else if (item.name === 'mainDesignation')
                        item.value = state.update.companyRoleData ? [{ id: state.update.companyRoleData.id, value: state.update.companyRoleData.id, label: state.update.companyRoleData.name }] : [];
                    else item.value = state.update[item.name]
                }
                else {
                    if (item.name === 'confirmPassword') item.value = state.update['password']
                    else if (item.name === 'designation')
                        item.value = state.update['userDesignations'].filter(i => i.designationId && i.designation).map(i => ({ id: i.designationId, value: i.designationId, label: i.designation?.name }))
                    else if (item.name === 'facilityId' && state.update.facilityAssigns) item.value = state.update.facilityAssigns.map(i => ({ value: i?.facility?.id, label: i?.facility?.name }))
                }
                if (item.name === 'password' || item.name === 'confirmPassword') {
                    item.value = "";
                    if (item.name === 'password')
                        item.validations = [
                            { type: 'test', params: ['Perfect', "Password length should be at least 8 characters", function (pswd) { return pswd && !!pswd.length ? pswd.length > 7 : true }] }
                        ]
                    else if (item.name === 'confirmPassword')
                        item.validations = [{
                            type: 'test', params: ['Perfect', "Confirm Passwords does not match", function (a, b) {
                                if (b.parent?.password) return b.parent?.password === a
                                return true;
                            }]
                        }]
                }
            }
            if (item.name === 'designation') item.options = userDesignations?.map(desg => ({ id: desg.id, label: desg.name, value: desg.id }))
            return item;
        })
    }, [state.create, state.update, userDesignations, roleData, isProvider, state.designation, providerType, companyRoles]);

    const OnChangeAccActive = useCallback((usr) => {
        TakeConfirmation({
            title: `Are you sure about changing the status of ${usr.name}'s account?`,
            onDone: async () => {
                SocketEmiter(SOCKET.REQUEST.DEACTIVATE_ACCOUNT, { userId: usr.id, status: !usr.isActive }, (ack) => {
                    refetch();
                });
            },
        });
    }, [refetch]);

    const OnChangeUserRole = useCallback((userId, roleName) => {
        const roleData = roles?.find(role => role.name === roleName);
        if (roleData) {
            TakeConfirmation({
                title: <p className='mb-0'>Are you sure about changing the user role to <b>{roleName}</b>?</p>,
                onDone: () => {
                    SocketEmiter(SOCKET.REQUEST.CHANGE_USER_ROLE, { userId, role: roleData }, (ack) => {
                        refetch();
                    });
                },
            });
        }
    }, [roles, refetch]);

    const OnChangeUserFilterChange = useCallback((status) => {
        setState(prev => ({ ...prev, status: status }))
        // refetch({ data: 123 })
    }, []);

    const onDeleteUser = useCallback((usr) => {
        TakeConfirmation({
            title: `Are you sure about to delete ${usr.name}'s account?`,
            content: "Once user is deleted, It can be reactivated by administrator only.",
            onDone: () => {
                SocketEmiter(SOCKET.REQUEST.DELETE_USER, { userId: usr.id }, (ack) => {
                    refetch();
                });
            }
        });
    }, [refetch]);

    const setInspectUser = useCallback((usr) => {
        usr ? dispatch({ type: CHAT_CONST.SET_INSPECT_USER, payload: usr }) : showError("User is not available");
    }, []);

    const onChangeghostMode = useCallback((usr) => {
        if (getSuperAdminAccess(usr)) {
            TakeConfirmation({
                title: `Are you sure about to turning ghost mode ${!usr?.ghostUser ? 'on' : 'off'} for ${usr.name}'s account?`,
                content: !usr?.ghostUser ? null : `Once ghost mode turned ${!usr?.ghostUser ? 'on' : 'off'}, all notification of ghost user will be deleted.`,
                onDone: async () => {
                    await updateUserAPI({ userId: usr.id, ghostUser: !usr.ghostUser });
                    refetch();
                }
            });
        }
    }, [refetch]);

    const columns = useMemo(() => [
        {
            field: "name", headerName: "Username", minWidth: 120, flex: 1,
            renderCell: (params) => (
                <div className='MuiDataGrid-cellContent cursor-pointer' onClick={() => setInspectUser(params.row)}>
                    {params.row.name}
                </div>
            ),
        },
        { field: "companyName", headerName: "Comapany", minWidth: 120 },
        { field: "email", headerName: "Email", minWidth: 150, flex: 1 },
        {
            field: "userDesignations", headerName: "Designation", minWidth: 150, flex: 1, hide: isProvider,
            renderCell: (params) => (<>
                {params.row?.companyRoleData && <nobr className={`desg-tag mr-1 px-1 main-desg-tag`}>
                    {params.row.companyRoleData.name}</nobr>}
                {params.row?.userDesignations?.map((desg) => (
                    <nobr key={desg?.designationId} className="desg-tag mr-1 px-1">
                        {desg?.designation?.name}
                    </nobr>
                ))}
            </>
            ),
        },
        {
            field: "speciality", headerName: "Speciality", minWidth: 150, hide: !isProvider,
            renderCell: ({ row }) => (<>{row?.speciality ? row.speciality : null}</>)
        },
        {
            field: "faxNumber", headerName: "Fax Number", minWidth: 100, hide: !isProvider,
            renderCell: ({ row }) => (<>{row?.faxNumber ? row.faxNumber : null}</>)
        },
        { field: "phone", headerName: "Number", minWidth: 100, hide: !isProvider },
        {
            field: "isActive", headerName: "Active",
            minWidth: 100, headerAlign: 'center', align: 'center',
            hide: ((isProvider && providerType !== CONST.PROVIDER_TYPE.HCMD_PROVIDER) || (state.status === CONST.USER_STATUS[2].value)),
            renderCell: (params) => {
                if (!params.row.id || !params.row.hasOwnProperty('isActive')) return;
                return (
                    <div className="custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" id={`quickActiveSwitch-${params.row.id}`} checked={params.row.isActive} onChange={() => OnChangeAccActive(params.row)} />
                        <label className="custom-control-label" htmlFor={`quickActiveSwitch-${params.row.id}`}>&nbsp;</label>
                    </div>
                )
            },
        },
        {
            field: "roleData", headerName: "Role", minWidth: 180,
            headerAlign: 'center', align: 'center', hide: !isSA || isProvider,
            renderCell: (params) => {
                return (
                    <div className="d-flex justify-content-center">
                        {state.status === CONST.USER_STATUS[0].value
                            ?
                            <ToggleSwitch
                                values={roles?.map(role => role.name)}
                                OnChange={OnChangeUserRole}
                                userId={params.row.id}
                                selected={params.row.roleData?.name} />
                            :
                            <span className='text-capitalize'>{params.row.roleData?.name}</span>
                        }
                    </div>
                )
            }
        },
        {
            field: "ghostMode", headerName: "Ghost Mode", minWidth: 100, headerAlign: 'center', align: 'center',
            hide: !isSA || isProvider || state.status !== CONST.USER_STATUS[0].value,
            renderCell: (params) => {
                if (params.row.roleData?.name === CONST.USER_TYPE.SA)
                    return (
                        <div className="custom-control custom-switch">
                            <input type="checkbox" className="custom-control-input" id={`ghostModeSwitch-${params.row.id}`} checked={params?.row?.ghostUser} onChange={() => onChangeghostMode(params.row)} />
                            <label className="custom-control-label" htmlFor={`ghostModeSwitch-${params.row.id}`}>&nbsp;</label>
                        </div>
                    )
            },
        },
        {
            field: "keyword", headerName: "Keywords", minWidth: 150, hide: (!isSA || isProvider || state.status !== CONST.USER_STATUS[0].value),
            renderCell: (params) => {
                if (params.row?.roleData?.name === CONST.USER_TYPE.SA)
                    return (<>
                        {params.row?.keywords?.map((keywrd) => (
                            <nobr key={keywrd} className="desg-tag mr-1 px-1">
                                {keywrd}
                            </nobr>
                        ))}
                    </>)
            },
        },
        {
            field: "actions", headerName: "Actions", type: "actions", minWidth: 150, hide: (state.status === CONST.USER_STATUS[2].value),
            getActions: ({ row }) => [
                <>{isProvider && <MuiActionButton tooltip='Rouding Sheet' Icon={Description} color="primary" onClick={() => navigate(`/dashboard/rounding-sheet`, {
                    state: { provider: { label: row.name, value: row.id } }
                })} />}</>,
                <MuiEditAction onClick={() => updateState(setState, { update: row })} />,
                <>{isSA && <MuiDeleteAction onClick={() => onDeleteUser(row)} />}</>,
            ]
        },
    ], [OnChangeAccActive, OnChangeUserRole, onChangeghostMode, onDeleteUser, setInspectUser,
        roles, isProvider, isSA, navigate, providerType, state.status]);

    const onCancelNewUser = useCallback(() => updateState(setState, { create: false, update: false }), []);

    const handleAPIResponse = useCallback(async (data, body) => {
        if (data.status === 3) {
            await TakeConfirmation({
                title: "Account with the same email id found inactive",
                content: "Would you like to recover it? Data will be updated once you recover it.",
                onDone: async () => {
                    const data = await userService.create({ payload: { ...body, restore: true } });
                    if (data?.status === 3)
                        return handleAPIResponse(data);
                    else if (data?.status === 2)
                        return showError(data.message);
                    else if (data?.status === 1) {
                        refetch();
                        onCancelNewUser();
                    }
                },
                onCancel: () => { }
            });
        }
        return <b>{data?.message ? data.message : "Successfully Created User"}</b>
    }, [onCancelNewUser, refetch]);

    const filterUserForm = useCallback((obj) => {
        Object.keys(obj).map(item => {
            if (item === 'designation' || item === 'keywords' || item === 'facilityId') obj[item] = obj[item].map(o => o.value) || null;
            else if (item === 'mainDesignation') obj[item] = (obj[item][0] && obj[item][0].value) || null;
            else if (item === 'role' && Array.isArray(obj[item]) && obj[item][0].hasOwnProperty('value')) obj[item] = obj[item][0].value;
            return null;
        });
        return obj;
    }, []);

    const filterUpdateForm = useCallback(async (obj) => {
        let data = { userId: state.update.id }
        Object.keys(obj).map(item => {
            if (obj[item] !== state.update[item]) data[item] = obj[item];
            return null;
        });
        const currFacility = state.update?.facilityAssigns?.map((item) => item.facilityId) || [];
        const newFacility = obj.facilityId || [];
        const addedFacility = newFacility?.filter(item => !currFacility.includes(item));
        const removedFacility = currFacility?.filter(item => !newFacility.includes(item));
        const currDesg = state.update?.userDesignations?.map((item) => item.designationId) || [];
        const newDesg = obj.designation || [];
        const addedDesignation = newDesg?.filter(item => !currDesg.includes(item)) || [];
        const removedDesignation = currDesg?.filter(item => !newDesg.includes(item)) || [];
        delete data.designation;
        delete data.confirmPassword;
        delete data.facilityId;
        return {
            ...data,
            addedDesignation: !!addedDesignation.length ? addedDesignation : undefined,
            removedDesignation: !!removedDesignation.length ? removedDesignation : undefined,
            addedFacility: !!addedFacility.length ? addedFacility : undefined,
            removedFacility: !!removedFacility.length ? removedFacility : undefined,
        };
    }, [state.update]);

    const onSubmitUser = useCallback(async (body) => {
        const filteredData = await filterUserForm(body);

        if (state.update) {
            const findUpdates = await filterUpdateForm(filteredData);
            await updateUserAPI(findUpdates, onCancelNewUser);
            refetch();
        }
        else {
            toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await userService.create({ payload: filteredData });
                        if (data?.status === 2) return reject(data?.message);
                        else if (data?.status === 3) {
                            await handleAPIResponse(data, body);
                            return resolve("Confirmation needed");
                        }
                        else if (data?.status === 1) {
                            SocketEmiter("req-add-designation-member", {
                                userId: data.user.id || null,
                                designationIds: data.user.userDesignations.map((i) => i.designationId) || []
                            });
                            refetch();
                            onCancelNewUser();
                            resolve(0);
                        }
                    } catch (error) {
                        reject(0);
                        console.error(error);
                    }
                },
                loading: 'Creating New User', success: (msg) => <b>{msg ? msg : 'Successfully Created User'}</b>,
                error: (err) => <b>{err ? err : 'Could not created user'}</b>
            });
        }
    }, [filterUpdateForm, filterUserForm, state.update, onCancelNewUser, refetch, handleAPIResponse]);

    try {
        return (<>
            <div className="form-inline d-flex justify-content-between">
                <div className='d-flex flex-wrap gap-10'>
                    <Input
                        name="search_user"
                        value={state.search}
                        type="text"
                        placeholder="Search User, Company..."
                        handleChange={(e) => updateState(setState, { search: e.target.value })}
                    />
                    {!isProvider &&
                        <ReactSelect
                            isClearable
                            name="designation"
                            options={(userDesignations && !!userDesignations.length) ?
                                userDesignations?.map((item) => ({ id: item.id, value: item.id, label: item.name }))
                                : []}
                            placeholder="Designation..."
                            value={state.designation}
                            isDisabled={isProvider}
                            components={{ DropdownIndicator: undefined }}
                            onChange={(data) => updateState(setState, { designation: data })}
                            className="basic-multi-select issue-multi-select_user-dropdown min-width-160"
                            classNamePrefix="react-select"
                        />}
                    <FilterToggleSwitch
                        values={CONST.USER_STATUS?.map(status => status.value)}
                        OnChange={OnChangeUserFilterChange}
                        selected={state.status}
                    />
                </div>
                <Button variant='primary' onClick={() => updateState(setState, { create: true })}>
                    {isProvider ? "Add Provider" : "Add User"}
                </Button>
            </div>
            <div className={`mt-2 cstm-mui-datagrid ${!usersList?.rows?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
                <DataGridPro
                    columns={columns}
                    rows={usersList?.rows ? usersList.rows : []}
                    autoHeight
                    density="compact"
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
                header={state.create ? 'Create New User' : 'User Data'}
                body={<>
                    <FormGenerator
                        className={'m-1 text-color'}
                        formClassName="row"
                        dataFields={formJSON}
                        onSubmit={onSubmitUser}
                        resetOnSubmit={false}
                    />
                </>}
            />
        </>);
    } catch (error) {
        console.error(error);
    }
}