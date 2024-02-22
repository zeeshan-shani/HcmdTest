import React, { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { useNavigate } from 'react-router-dom';
import { ChatFill } from 'react-bootstrap-icons';
import { LinearProgress, Tab, Tabs } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro/DataGridPro';
import { dispatch } from 'redux/store';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { generatePayload, updateState } from 'redux/common';
import { ConnectInNewChat, notifyUsers } from 'utils/wssConnection/Socket';
import { CreatePrivateChat, loadUserChatList } from 'redux/actions/chatAction';

import useDebounce from 'services/hooks/useDebounce';
import moment from 'moment-timezone';
import { isMobile } from 'react-device-detect';
import { CONST } from 'utils/constants';

import { MuiActionButton, MuiDataGridFooter } from 'Components/MuiDataGrid';
import { setUserHandler } from 'Routes/Chat/Sidebar/Chat';
import userService from 'services/APIs/services/userService';
import Input from 'Components/FormBuilder/components/Input';
import { showError } from 'utils/package_config/toast';

const defaultState = {
    sortModel: [{ field: 'name', sort: 'asc' }]
}

export default function UsersInfo() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const { activeChat, userDesignations } = useSelector((state) => state.chat);

    const [state, setState] = useState({
        rows: [],
        page: 1,
        total: 0,
        pageSize: 10,
        rowCountState: 0,
        loading: false,
        filters: { search: null, currSearch: null, designation: null, status: CONST.PROFILE.ONLINE },
        sortModel: defaultState.sortModel
    });
    const newSearch = useDebounce(state.filters.search, 500);

    let { data: usersStatusCount } = useQuery({
        queryKey: ["/users/statuses"],
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        queryFn: async () => {
            const payload = {
                options: {
                    "group": ["profileStatus", "COUNT"],
                    "attributes": ["profileStatus"]
                }
            }
            const data = await userService.list({ payload });
            if (data?.status) {
                const statuses = data.data.flatMap((item) => ({ [item.profileStatus]: item.hasOwnProperty('count_profileStatus') && parseInt(item['count_profileStatus']) }));
                return Object.assign({}, ...statuses) || {};
            }
            return {};
        },
    });

    const setInspectUser = useCallback((usr) => {
        usr ? dispatch({ type: CHAT_CONST.SET_INSPECT_USER, payload: usr }) : showError("User is not available");
    }, []);

    const gotoChat = useCallback(async (chat) => {
        const res = await CreatePrivateChat(chat.id, user.id);
        const payload = await generatePayload({
            // rest: { includeChatUserDetails: false },
            options: {
                "populate": ["lastMessage", "chatUser"],
                attributes: { exclude: ["users"] }
            },
            isCount: true
        })
        if (res?.status === 1) {
            loadUserChatList(payload);
            notifyUsers(res.data.createdBy, res.data.id, res.data.users, res.data.type);
            ConnectInNewChat(res.data, user.id);
            setUserHandler({ chat: res.data, activeChatId: -3, userId: user.id, navigate });
        } else if (res?.status === 2) {
            loadUserChatList(payload);
            setUserHandler({ chat: res.data, activeChatId: activeChat?.id, userId: user.id, navigate });
        }
    }, [activeChat?.id, navigate, user.id]);

    const columns = useMemo(() => [
        {
            field: "name", headerName: "Username", minWidth: 200,
            renderCell: (params) => (
                <div className='MuiDataGrid-cellContent cursor-pointer' onClick={() => setInspectUser(params.row)}>
                    {params.row.name}
                </div>
            ),
        },
        { field: "companyName", headerName: "Comapany name", minWidth: 180 },
        { field: "extension", headerName: "Extension", minWidth: 180 },
        {
            field: "userDesignations", headerName: "Designation", disableSort: true, minWidth: 180, flex: 1,
            renderCell: (params) => (<>
                {params.row?.companyRoleData && <nobr className={`desg-tag mr-1 px-1 main-desg-tag`}>
                    {params.row.companyRoleData.name}</nobr>}
                {params.row?.userDesignations?.map((desg) => (
                    <nobr key={desg.designationId} className="desg-tag mr-1 px-1">
                        {desg.designation.name}
                    </nobr>
                ))}
            </>),
        },
        { field: "profileStatus", headerName: "Status", minWidth: 180 },
        {
            field: "actions",
            type: "actions",
            minWidth: 180,
            getActions: (params) => [<>
                <MuiActionButton Icon={ChatFill} tooltip={`Move to ${params.row.name}'s Chat`} onClick={() => gotoChat(params)} />
            </>],
        },
    ], [gotoChat, setInspectUser]);

    const getUserListData = useCallback(async () => {
        try {
            const payload = await generatePayload({
                body: { designationId: state.filters?.designation?.id, profileStatus: state.filters?.status },
                keys: ["name"],
                value: newSearch,
                options: {
                    sort: !!state.sortModel?.length ? state.sortModel.map(i => ([i.field, i.sort])) : defaultState.sortModel.map(i => ([i.field, i.sort])),
                    populate: ["designations", "companyRoleData"],
                    limit: state.pageSize, page: state.page, pagination: true
                }, isCount: true,
                currSearch: state.filters.currSearch
            });
            const data = await userService.list({ payload });
            setState(prev => ({
                ...prev, filters: { ...prev.filters, currSearch: newSearch },
                page: newSearch && (state.currSearch !== newSearch) ? 1 : prev.page
            }));
            if (data?.status === 1 && data.data) {
                data.data.lastUpdated = moment().format();
                return data.data;
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }, [newSearch, state]);

    const { data: userList, isFetching, refetch } = useQuery({
        queryKey: ["/users/list", state.page, state.pageSize, newSearch ? newSearch : undefined, state.filters?.designation?.id, state.filters?.status, state.sortModel],
        queryFn: getUserListData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L1,
    });

    const onSortModelChange = useCallback(async (data) => {
        setState(prev => ({ ...prev, sortModel: data }));
        await refetch();
    }, [refetch]);

    try {
        if (usersStatusCount) usersStatusCount[state.filters.status] = userList?.count || 0;
        return (<>
            <div className="form-inline mt-2">
                <div className="input-group admin-search theme-border m-0 mr-1">
                    <Input
                        placeholder="Search User, Company..."
                        name="name"
                        handleChange={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, search: e.target.value } }))}
                        value={state.filters.search}
                    />
                </div>
                <div className="dropdown">
                    <button
                        className="btn btn-outline-default mr-1 dropdown-toggle text-capitalize text-truncate width-limit-200 dropdown-max-width custom-dropdown"
                        id="desgDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        type="button"
                    >
                        <p className='d-inline'>User: {state.filters.designation ? state.filters.designation.name : 'All'}</p>
                    </button>
                    <ul className="dropdown-menu m-0" aria-labelledby="desgDropdown">
                        <li key={-1}
                            className="dropdown-item cursor-pointer text-capitalize"
                            onClick={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, designation: null } }))}
                        >
                            {'All users'}
                        </li>
                        {userDesignations?.map((desg) => (
                            <li
                                key={desg.id}
                                className="dropdown-item cursor-pointer text-capitalize"
                                onClick={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, designation: desg } }))}
                            >
                                {desg.name}
                            </li>
                        ))}
                    </ul>
                </div>
                {isMobile &&
                    <div className="dropdown d-md-none">
                        <button
                            className="btn btn-outline-default mr-1 dropdown-toggle text-capitalize custom-dropdown"
                            id="statusDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            type="button"
                        >
                            <span>status: {state.filters.status ? state.filters.status : 'All'}</span>
                        </button>
                        <ul className="dropdown-menu m-0" aria-labelledby="statusDropdown">
                            {[CONST.PROFILE.ONLINE, CONST.PROFILE.AVAILABLE, CONST.PROFILE.ONCALL, CONST.PROFILE.BUSY, CONST.PROFILE.BREAK, CONST.PROFILE.OFFLINE]
                                .map((item, index) => {
                                    return (
                                        <li className="dropdown-item text-capitalize" onClick={() => setState(prev => ({ ...prev, filters: { ...prev.filters, status: item } }))}>
                                            {item}
                                        </li>
                                    )
                                })}
                        </ul>
                    </div>}
            </div>
            <div className='d-flex mt-2'>
                {!isMobile &&
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={state.filters.status}
                        onChange={(e, v) => setState(prev => ({ ...prev, filters: { ...prev.filters, status: v } }))}
                        aria-label="Vertical tabs example"
                        className='Mui-verticalTabs mr-2'
                        classes={{ indicator: 'bg-primary' }}
                        style={{ minWidth: '180px' }}
                    >
                        {[CONST.PROFILE.ONLINE, CONST.PROFILE.AVAILABLE, CONST.PROFILE.ONCALL, CONST.PROFILE.BUSY, CONST.PROFILE.BREAK, CONST.PROFILE.OFFLINE]
                            .map((item, index) => {
                                const count = item !== CONST.PROFILE.OFFLINE && usersStatusCount?.hasOwnProperty(item) && usersStatusCount[item] ? `(${usersStatusCount[item]})` : '';
                                return (<Tab key={index} label={`${item} ${count ? count : ''}`} value={item} className='Mui-vericalTab' id={`vertical-tab-${index}`} aria-controls={`vertical-tabpanel-${index}`} />)
                            })}
                    </Tabs>}
                <div className={`cstm-mui-datagrid ${!userList?.rows?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
                    <DataGridPro
                        rows={userList?.rows || []}
                        columns={columns}
                        autoHeight
                        density="compact"
                        disableColumnFilter
                        disableVirtualization
                        sortModel={state.sortModel}
                        onSortModelChange={onSortModelChange}
                        loading={isFetching}
                        components={{
                            LoadingOverlay: LinearProgress,
                            Footer: () =>
                                <MuiDataGridFooter isFetching={isFetching}
                                    lastUpdated={userList?.lastUpdated}
                                    pagination={{ page: state?.page, total: userList?.count || 0, pageSize: state?.pageSize }}
                                    onPageChange={(e, page) => {
                                        updateState(setState, { page: page });
                                    }}
                                />
                        }}
                    />
                </div>
            </div>

        </>)
    } catch (error) {
        console.error(error);
    }
}