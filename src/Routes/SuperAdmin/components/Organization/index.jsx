import React, { useCallback, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { dispatch } from 'redux/store';
import { useQuery } from '@tanstack/react-query';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { MODEL_CONST } from 'redux/constants/modelConstants';
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { generatePayload, getImageURL, toastPromise, updateState } from 'redux/common';
import { CONST } from 'utils/constants';
import moment from 'moment-timezone';
import useDebounce from 'services/hooks/useDebounce';
import getOrganizationForm from './organization';
import organizationService from 'services/APIs/services/organizationService';

import Input from 'Components/FormBuilder/components/Input';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { TakeConfirmation } from 'Components/components';
import { MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';

export default function Organization() {
    const [state, setState] = useState({
        pageSize: 10,
        page: 1,
        search: '',
        currSearch: '',
        create: false,
        update: false,
        isUploading: false,
    });
    const { updateTable } = useSelector(state => state.model);
    const newSearch = useDebounce(state.search, 500);
    const onCancelHandler = useCallback(() => updateState(setState, { create: false, update: false }), []);

    const getData = useCallback(async () => {
        const payload = await generatePayload({
            keys: ['name'], value: newSearch,
            options: {
                limit: state.pageSize,
                page: state.page,
                pagination: true,
            }, isCount: true, currSearch: state.currSearch
        });
        const data = await organizationService.list({ payload });
        setState(prev => ({ ...prev, currSearch: newSearch, page: (state.currSearch !== newSearch) ? 1 : prev.page }));
        if (data?.status === 1) {
            data.data.lastUpdated = moment().format();
            return data.data
        };
        return [];
    }, [newSearch, state.page, state.pageSize, state.currSearch]);

    const { data: facilityList, isFetching, refetch } = useQuery({
        queryKey: ["/organization/list", state.page, state.pageSize, newSearch ? newSearch : undefined, updateTable],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    const onSubmitHandler = useCallback(async (payload, mode = state.update ? 'update' : 'create') => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    if (payload.hasOwnProperty("image")) {
                        if (!!payload.image.length) {
                            const [file] = payload.image;
                            const presignedUrl = await onUploadImage(file);
                            const uploadedImageUrl = await uploadToS3(presignedUrl, file);
                            payload.image = uploadedImageUrl;
                        } else delete payload.image
                    }
                    if (state.update) payload.id = state.update.id;
                    (mode === 'update') ?
                        await organizationService.update({ payload }) :
                        await organizationService.create({ payload });
                    refetch();
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            }, loading: 'Loading organization.', error: 'Could not load organization.', success: 'organization loaded.',
            options: { id: "get-organization" }
        });
        onCancelHandler();
    }, [state.update, onCancelHandler, refetch]);

    const onEdit = useCallback((data) => updateState(setState, { update: data }), []);
    const onDelete = useCallback((id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the organization?',
            onDone: async () => {
                const data = await organizationService.delete({ payload: { id } });
                if (data.status === 1) refetch();
            }
        })
    }, [refetch]);

    const columns = useMemo(() => [
        {
            field: "Organization", headerName: "Organization", minWidth: 180, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => (<>{row.name}</>)
        },
        {
            field: "image", headerName: "Image", minWidth: 180, headerAlign: "center", align: 'center', flex: 1,
            renderCell: ({ row }) => (<>
                <div className='d-flex align-items-center gap-10'>
                    <img src={getImageURL(row?.image, '35x35')} alt=""
                        onClick={() => dispatch({
                            type: MODEL_CONST.USER_IMAGE_DATA, payload: {
                                ...row,
                                id: row.id,
                                updateType: "organization",
                                updateTable: "organization",
                                updateField: "image"
                            }
                        })} />
                </div>
            </>)
        },

        {
            field: "actions", type: "actions", headerName: "Actions", flex: 1,
            getActions: (params) => [
                <MuiEditAction onClick={() => onEdit(params.row)} />,
                <MuiDeleteAction onClick={() => onDelete(params.id)} />,
            ],
        },
    ], [onDelete, onEdit]);

    const formJSON = useMemo(() => {
        const facilityForm = getOrganizationForm();
        return facilityForm.map((item) => {
            if (state.update) {
                if (state.update.hasOwnProperty(item.name) && item.name === 'name') item.value = state.update[item.name]
                if (state.update.hasOwnProperty(item.name) && item.name === 'location') item.value = state.update[item.name]
            }
            return item;
        })
    }, [state.update]);

    return (<>
        <div className="form-inline d-flex justify-content-between">
            <div className="input-group admin-search m-0">
                <Input
                    name="search_user"
                    value={state.search}
                    type="text"
                    placeholder="Search Organization..."
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
                components={{
                    Footer: () =>
                        <MuiDataGridFooter isFetching={isFetching}
                            lastUpdated={facilityList?.lastUpdated}
                            pagination={{ page: state?.page, total: facilityList?.count || 0, pageSize: state?.pageSize }}
                            onPageChange={(e, page) => {
                                updateState(setState, { page });
                            }}
                        />
                }}
                disableColumnFilter
            />
        </div>
        <ModalReactstrap
            size='md'
            show={Boolean(state.create || state.update)}
            toggle={onCancelHandler}
            centered
            header={state.create ? 'Create Organization' : 'Edit Organization'}
            body={<>
                {(state.create || state.update) &&
                    <FormGenerator
                        className={'m-1'}
                        dataFields={formJSON}
                        onSubmit={onSubmitHandler}
                    />
                }
            </>}
        />
    </>)
}
