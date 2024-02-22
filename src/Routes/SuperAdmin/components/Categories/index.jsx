import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { CircleFill, StarFill, TagFill } from 'react-bootstrap-icons';
import { toastPromise, updateState } from 'redux/common';
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro/DataGridPro';
import { dispatch } from 'redux/store';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { Button } from 'react-bootstrap';
import useDebounce from 'services/hooks/useDebounce';
import KBCategoryService from 'services/APIs/services/KBCategoryService';

import { ALL_LABELS } from 'Routes/TaskBoard/config';
import { AssignToDesignation } from 'Routes/SuperAdmin/AssignToDesignation';
import { MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import { TakeConfirmation } from 'Components/components';
import ModalReactstrap from 'Components/Modals/Modal';
import Input from 'Components/FormBuilder/components/Input';

// Knowledge base categories
export default function KBCategory() {
    const { taskLabels } = useSelector((state) => state.task);
    const [state, setState] = useState({
        rows: [],
        pageSize: 10,
        page: 1,
        loading: false,
        rowCountState: 0,
        total: 0,
        search: '',
        createCategory: false,
        updateCategory: false,
    });
    const newSearch = useDebounce(state.search, 500);
    const onEdit = (data) => updateState(setState, { updateCategory: data });
    const onCancel = () => updateState(setState, { createCategory: false, updateCategory: false })

    const onDelete = useCallback((id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the category?',
            onDone: async () => {
                const data = await KBCategoryService.delete({ payload: { id } });
                dispatch({ type: TASK_CONST.DELETE_TASK_LABEL, payload: (data.status === 1) ? data.data : 0 });
            }
        })
    }, []);

    const columns = useMemo(() => [
        { field: "name", headerName: "Category", minWidth: 180 },
        {
            field: "linkcategorydesignations", headerName: "Access Groups",
            renderCell: (params) => (
                <>
                    {params.row?.linkcategorydesignations?.map((model) => (
                        <div key={model.id} className="desg-tag mr-1 px-1">
                            {model ? model.designation?.name : 'N/A'}</div>
                    ))}
                </>
            ), flex: 1
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
    ], [onDelete]);

    useEffect(() => {
        if (newSearch) {
            const updateRows = taskLabels.filter((item) => (newSearch === "" || item?.name?.toLowerCase().includes(newSearch.toLowerCase())));
            updateState(setState, { rows: updateRows, total: updateRows.length });
            return;
        }
        updateState(setState, { rows: taskLabels, total: taskLabels.length });
    }, [taskLabels, newSearch]);

    const onSubmitcategory = useCallback((payload, mode) => {
        toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data =
                        (mode === 'update') ?
                            await KBCategoryService.update({ payload }) :
                            await KBCategoryService.create({ payload });
                    (mode === 'create') ?
                        dispatch({ type: TASK_CONST.CREATE_TASK_LABEL, payload: (data?.status === 1) ? data.data : [] }) :
                        dispatch({ type: TASK_CONST.UPDATE_TASK_LABEL, payload: (data?.status === 1) ? data.data : [] });
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            }
        });
        onCancel();
    }, []);

    return (<>
        <div className="d-flex form-inline justify-content-between">
            <div className="input-group admin-search m-0">
                <Input
                    name="search_user"
                    value={state.search}
                    type="text"
                    placeholder="Search Category..."
                    handleChange={(e) => updateState(setState, { search: e.target.value.trim() })}
                />
            </div>
            <Button onClick={() => updateState(setState, { createCategory: true })}>
                Add Category
            </Button>
        </div>
        <div className={`mt-2 cstm-mui-datagrid ${state.loading || !state.rows.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%' }}>
            <DataGridPro
                rows={state.rows}
                columns={columns}
                onPageSizeChange={(newPageSize) => updateState(setState, { pageSize: newPageSize })}
                onPageChange={(newPage) => updateState(setState, { page: newPage + 1 })}
                rowsPerPageOptions={[10]}
                rowCount={state.total}
                pageSize={state.pageSize}
                pagination
                autoHeight
                page={state.page - 1}
                initialState={{
                    pagination: { page: state.page }
                }}
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () =>
                        <MuiDataGridFooter
                            // lastUpdated={usersList?.lastUpdated}
                            pagination={{ page: state?.page, total: state?.total || 0, pageSize: state?.pageSize }}
                            onPageChange={(e, page) => {
                                updateState(setState, { page: page });
                            }}
                        />
                }}
                density="compact"
                disableColumnFilter
            />
        </div>
        <AddCategory
            showModal={state.createCategory || state.updateCategory} onSubmit={onSubmitcategory} onCancel={onCancel}
            mode={(state.createCategory ? 'create' : (state.updateCategory && 'update'))}
            updateData={state.updateCategory}
        />
    </>)
}


export const AddCategory = ({ showModal, onCancel, onSubmit, mode = 'create', updateData }) => {
    const [formData, setFormData] = useState({
        name: "",
        color: ALL_LABELS[0].color
    });
    const [error, setError] = useState();
    const [assignDesignation, setDesignation] = useState();

    useEffect(() => {
        if (mode === 'update' && updateData) {
            if (!!updateData.linkcategorydesignations?.length) {
                let assign = updateData.linkcategorydesignations.map((item) => ({
                    id: item.designation.id, value: item.designation.id, label: item.designation.name
                }));
                setDesignation(assign);
            }
            setFormData((prev) => ({ ...prev, ...updateData }));
        }
        else
            setFormData((prev) => ({ ...prev, color: ALL_LABELS[0].color }));
        if (!showModal) {
            setFormData({ name: "", color: ALL_LABELS[0].color })
            setDesignation();
            setError();
        }
    }, [updateData, mode, showModal]);

    if (!showModal) return;
    const onSubmitHandler = (e) => {
        e.preventDefault();
        let body = { ...formData }
        if (mode === 'create') {
            body = {
                ...body,
                designations: assignDesignation?.map((item) => item.id) || []
            }
        }
        if (mode === 'update') {
            if (assignDesignation) {
                const userDesg = updateData.linkcategorydesignations.map((item) => item.designation.id) || [];
                const latestDesg = assignDesignation?.map((item) => item.id) || [];
                const addedDesignation = latestDesg?.filter(item => !userDesg.includes(item));
                const removedDesignation = userDesg?.filter(item => !latestDesg.includes(item));
                body = { ...body, addedDesignation, removedDesignation }
            }
        }
        onSubmit(body, mode);
    }
    const inputEvent = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            let val = value;
            return { ...prev, [name]: val }
        });
    };
    const onBlurcategory = async (e) => {
        const { name, value } = e.target;
        if (!value) {
            setError((prev) => ({ ...prev, [name]: 'Category is required!' }));
            return;
        }
        setError((prev) => ({ ...prev, [name]: null }));
    };
    return (<>
        <ModalReactstrap
            show={Boolean(showModal)}
            header={mode === 'create' ? 'Create Category' : 'Update Category'}
            body={<>
                {error?.name && <span className='text-danger line-height-1'>{error.name}</span>}
                <div className="input-group w-100 bg-light my-2">
                    <div className="input-group-append">
                        <div className="input-group-text border-right-0">
                            <TagFill />
                        </div>
                    </div>
                    <input type="text"
                        className={`form-control form-control-md ${error?.name ? 'border-danger' : ''}`}
                        id="newcategory"
                        placeholder="Enter Category Name"
                        title='name'
                        defaultValue={formData?.name}
                        name="name"
                        onChange={inputEvent}
                        onBlur={onBlurcategory}
                        required
                    />
                </div>
                <div className="input-group d-flex w-100 bg-light my-2 flex-nowrap">
                    <div className="input-group-append">
                        <div className="input-group-text border-right-0">
                            <StarFill />
                        </div>
                    </div>
                    <AssignToDesignation
                        assignDesignation={assignDesignation}
                        setDesignation={setDesignation}
                    />
                </div>
                <div className="input-group w-100 my-2">
                    <div className="input-group-append">
                        <div className="input-group-text border-right-0">
                            <CircleFill />
                        </div>
                    </div>
                    <select
                        className="custom-select font-size-sm text-color input-border"
                        id="newColor"
                        placeholder="Tag Color"
                        name="color"
                        onChange={inputEvent}
                    >
                        {formData?.color &&
                            <option value={formData.color}>{formData.color}</option>}
                        {ALL_LABELS.map((item, index) => (
                            <option key={item.id} className="text-capitalize"
                                onClick={() => setFormData((prev) => ({
                                    ...prev,
                                    color: item.color
                                }))}>{item.color}</option>)
                        )}
                    </select>
                </div>
            </>}
            footer={<>
                <Button color="secondary" onClick={onCancel}>Cancel</Button>
                <Button color="primary" onClick={onSubmitHandler}
                    type="submit"
                >{mode === 'create' ? 'Create' : 'Update'}</Button>
            </>}
        />
    </>
    )
}
