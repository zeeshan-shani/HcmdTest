import React, { useCallback, useMemo, useState } from 'react'
import useDebounce from 'services/hooks/useDebounce';
import { generatePayload, toastPromise, updateState } from 'redux/common';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro/DataGridPro';
import { TakeConfirmation } from 'Components/components';
import { dispatch } from 'redux/store';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { Button } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { CONST } from 'utils/constants';
import { LinearProgress } from '@mui/material';
import { MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import moment from 'moment-timezone';
import { base } from 'utils/config';
import designationService from 'services/APIs/services/designationService';
import Input from 'Components/FormBuilder/components/Input';

export default function UserDesignation() {
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
    });
    const newSearch = useDebounce(state.search, 500);
    const onCancel = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), []);

    const getData = useCallback(async () => {
        let payload = await generatePayload({
            keys: ["name"],
            value: newSearch,
            options: {
                populate: ["designationChatInfo"],
                sort: [["name", "ASC"]],
                limit: state.pageSize,
                page: state.page,
                pagination: true,
            },
            isCount: true,
            currSearch: state.currSearch
        });
        const data = await designationService.list({ payload });
        setState(prev => ({ ...prev, currSearch: newSearch, page: (state.currSearch !== newSearch) ? 1 : prev.page }));
        if (data?.status === 1) {
            data.data.lastUpdated = moment().format();
            return data.data;
        };
        return [];
    }, [newSearch, state.page, state.pageSize, state.currSearch]);

    const { data: designationList, isFetching, refetch } = useQuery({
        queryKey: ["/designation/list", state.page, state.pageSize, newSearch ? newSearch : undefined],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    const onDelete = useCallback((id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the user group?',
            onDone: async () => {
                const data = await designationService.delete({ payload: { id } });
                dispatch({ type: CHAT_CONST.RES_DELETE_DESIGNATION, payload: (data.status === 1) ? data.data : 0 });
                refetch();
            }
        })
    }, [refetch]);

    const columns = useMemo(() => [
        { field: "name", headerName: "Group", minWidth: 200, flex: 1 },
        {
            field: "chatGroups", headerName: "Default Groups", minWidth: 200, flex: 1,
            renderCell: ({ row }) => {
                return (<>
                    {row?.designationGroups?.map((desg, index) => (
                        <nobr key={index} className="desg-tag mr-1 px-1">
                            {desg?.designationChatInfo?.name}
                        </nobr>
                    ))}
                </>)
            },
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 1,
            getActions: (params) => [
                <MuiEditAction tooltip="Edit Group" onClick={() => setState(prev => ({ ...prev, update: params.row }))} />,
                <MuiDeleteAction tooltip="Delete Group" onClick={() => onDelete(params.id)} />
            ]
        }
    ], [onDelete]);

    const onSubmitHandler = useCallback(async (body, mode = state.update ? 'update' : 'create') => {
        if (body.groupIds) body.groupIds = body.groupIds.map((i) => i.value)
        if (state.update) body.id = state.update.id;
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = (mode === 'update') ?
                        await designationService.update({ payload: body })
                        : await designationService.create({ payload: body });
                    dispatch({ type: (mode === 'create') ? CHAT_CONST.RES_CREATE_DESIGNATION : CHAT_CONST.RES_UPDATE_DESIGNATION, payload: (data?.status === 1) ? data.data : [] });
                    refetch();
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            },
            options: { id: "user-desg" }
        });
        onCancel();
    }, [state.update, onCancel, refetch]);

    const formJSON = useMemo(() => [
        {
            "name": "name",
            "label": "User Group",
            "valueKey": "name",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["User group name is required!"]
            }],
            "isEditable": true,
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
        },
        {
            "name": "groupIds",
            "label": "Chat Groups",
            "valueKey": "groupIds",
            "value": "",
            "placeholder": "Chat groups",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "optionKey": {
                "url": base.URL + '/chat/detail/list',
                "payload": {
                    "query": {
                        "type": "group"
                    },
                    "options": {
                        "attributes": ["id", "name"],
                        "sort": [["name", "ASC"]],
                        "pagination": true,
                        "limit": 10,
                        "offset": 0
                    },
                    "keys": ["name"],
                    "value": "",
                },
                "method": "post",
                "labelField": "name",
                "valueField": "id",
            },
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isMulti": true,
                "isClearable": false,
            },
            "classes": { wrapper: "col-12", label: "", field: "", error: "" }
        },
    ].map((item) => {
        if (state.update && state.update.hasOwnProperty(item.name) && item.name === 'name')
            item.value = state.update[item.name]
        else if (state.update && state.update.hasOwnProperty("designationGroups") && item.name === 'groupIds')
            item.value = state.update["designationGroups"]
                .map((item) => ({ id: item.designationChatInfo.id, label: item.designationChatInfo.name, value: item.designationChatInfo.id, }));
        return item;
    }), [state.update]);

    try {
        return (<>
            <div className="form-inline d-flex justify-content-between">
                <div className="input-group admin-search m-0">
                    <Input
                        name="search_desg"
                        value={state.search}
                        type="text"
                        placeholder="Search Designation..."
                        handleChange={(e) => updateState(setState, { search: e.target.value.trim() })}
                    />
                </div>
                <Button variant='primary' onClick={() => updateState(setState, { create: true })}>
                    Add Designation
                </Button>
            </div>
            <div className={`mt-2 cstm-mui-datagrid ${!designationList?.rows?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
                <DataGridPro
                    columns={columns}
                    rows={designationList?.rows ? designationList.rows : []}
                    autoHeight
                    components={{
                        LoadingOverlay: LinearProgress,
                        Footer: () =>
                            <MuiDataGridFooter isFetching={isFetching}
                                lastUpdated={designationList?.lastUpdated}
                                pagination={{ page: state?.page, total: designationList?.count || 0, pageSize: state?.pageSize }}
                                onPageChange={(e, page) => {
                                    updateState(setState, { page: page });
                                }}
                            />
                    }}
                    density="compact"
                    disableColumnFilter
                />
            </div>
            <ModalReactstrap
                size='md'
                show={Boolean(state.create || state.update)}
                toggle={onCancel}
                centered
                header={state.create ? 'Create User Group' : 'User group'}
                body={<>
                    <FormGenerator
                        className={'m-1'}
                        formClassName="row"
                        dataFields={formJSON}
                        onSubmit={onSubmitHandler}
                    />
                </>}
            />
        </>)
    } catch (error) {
        console.error(error);
    }
}