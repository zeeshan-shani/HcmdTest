import React, { useCallback, useMemo, useState } from 'react'
import { generatePayload, toastPromise, updateState } from 'redux/common';
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro/DataGridPro';
import { Button, Col } from 'react-bootstrap';
import useDebounce from 'services/hooks/useDebounce';

import { MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import { TakeConfirmation } from 'Components/components';
import ModalReactstrap from 'Components/Modals/Modal';
import Input from 'Components/FormBuilder/components/Input';
import { useQuery } from '@tanstack/react-query';
import { CONST } from 'utils/constants';
import taskCategoryService from 'services/APIs/services/taskCategoryService';
import moment from 'moment-timezone';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { debounce } from 'lodash';
import taskcategoryForm from './taskcategoryForm';

const defaultColor = "#ff0000"
export default function TaskCategories() {
    const [state, setState] = useState({
        pageSize: 10,
        page: 1,
        loading: false,
        search: '',
        create: false,
        update: false,
    });
    const newSearch = useDebounce(state.search, 500);
    const [colorCode, setColorCode] = useState(defaultColor);
    const onEdit = useCallback((data) => {
        updateState(setState, { update: data })
        setColorCode(prev => data.colorCode ? data.colorCode : prev);
    }, []);
    const onCancel = useCallback(() => {
        updateState(setState, { create: false, update: false });
        setColorCode(defaultColor);
    }, []);

    const getData = useCallback(async () => {
        let payload = await generatePayload({
            keys: ["name"],
            value: newSearch,
            options: {
                // populate: ["designationChatInfo"],
                sort: [["name", "ASC"]],
                limit: state.pageSize,
                page: state.page,
                pagination: true,
            },
            isCount: true,
            currSearch: state.currSearch
        });
        const data = await taskCategoryService.list({ payload });
        setState(prev => ({ ...prev, currSearch: newSearch, page: (state.currSearch !== newSearch) ? 1 : prev.page }));
        if (data?.status === 1) {
            data.data.lastUpdated = moment().format();
            return data.data;
        };
        return [];
    }, [newSearch, state.page, state.pageSize, state.currSearch]);

    const { data: taskCategoryData, isFetching, refetch } = useQuery({
        queryKey: ["/taskCategory/list", state.page, state.pageSize, newSearch ? newSearch : undefined],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    const onDelete = useCallback((id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the category?',
            onDone: async () => {
                await taskCategoryService.delete({ payload: { id } });
                refetch();
            }
        })
    }, [refetch]);

    const onSubmitHandler = useCallback(async (payload, mode, id) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    if (colorCode) payload.colorCode = colorCode;
                    (mode === 'update') ?
                        await taskCategoryService.update({ payload: { ...payload, id } }) :
                        await taskCategoryService.create({ payload });
                    refetch();
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            },
            options: { id: "task-category" }
        });
        onCancel();
    }, [colorCode, refetch, onCancel]);

    const columns = useMemo(() => [
        { field: "name", headerName: "Category", minWidth: 180, flex: 1 },
        {
            field: "colorOption", headerName: "Color Indicator",
            renderCell: ({ row }) => (<>
                <div className='color-square mr-1' style={row.colorCode ?
                    { background: row.colorCode } : {}} />
            </>), flex: 1
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: (params) => [
                <MuiEditAction tooltip="Edit Category" onClick={() => onEdit(params.row)} />,
                <MuiDeleteAction tooltip="Delete Category" onClick={() => onDelete(params.id)} />,
            ], minWidth: 180
        },
    ], [onDelete, onEdit]);

    const formJSON = useMemo(() => {
        const FORMJSON = taskcategoryForm();
        return FORMJSON.map((item) => {
            if (state.update && state.update.hasOwnProperty(item.name) && item.name === 'codeType') item.value = state.update[item.name]
            if (state.update && state.update.hasOwnProperty(item.name) && item.name === 'isDefault') item.value = String(state.update[item.name])
            else if (state.update && state.update.hasOwnProperty(item.name)) item.value = state.update[item.name]
            return item;
        })
    }, [state.update]);

    // Create a debounced version of setState
    const debouncedsetColorCode = debounce((value) => {
        setColorCode(value);
    }, 500);

    const handleChangeColor = useCallback((event) => {
        const { value } = event.target;
        // Call the debounced version of setState
        debouncedsetColorCode(value);
    }, [debouncedsetColorCode]);

    return (<>
        <div className="d-flex form-inline justify-content-between">
            <div className="input-group admin-search m-0">
                <Input
                    name="search_user"
                    value={state.search}
                    type="text"
                    placeholder="Task Category..."
                    handleChange={(e) => updateState(setState, { search: e.target.value.trim() })}
                />
            </div>
            <Button onClick={() => updateState(setState, { create: true })}>
                Add Category
            </Button>
        </div>
        <div className={`mt-2 cstm-mui-datagrid ${isFetching && !taskCategoryData?.rows.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%' }}>
            <DataGridPro
                rows={taskCategoryData?.rows || []}
                loading={isFetching}
                columns={columns}
                autoHeight
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () =>
                        <MuiDataGridFooter
                            // lastUpdated={usersList?.lastUpdated}
                            pagination={{ page: state?.page, total: taskCategoryData?.count || 0, pageSize: state?.pageSize }}
                            onPageChange={(e, page) => updateState(setState, { page })}
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
            header={state.create ? 'Create Payment Code' : 'Edit Payment Code'}
            body={<>
                {(state.create || state.update) &&
                    <FormGenerator
                        className={'m-0'}
                        formClassName="row"
                        dataFields={formJSON}
                        extraFields={<Col>
                            <div className='d-flex align-items-center gap-10 mb-3'>
                                <label htmlFor="colorCode" className='mb-0'>Color Indicator:</label>
                                <input type="color" id="colorCode" name="colorCode" defaultValue={colorCode} onChange={handleChangeColor} />
                            </div>
                        </Col>}
                        onSubmit={data => onSubmitHandler(data, state.update ? 'update' : 'create', state.update ? state.update.id : null)}
                    />}
            </>}
        />
    </>)
}
