import React, { useCallback, useMemo, useState } from 'react'
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { TakeConfirmation } from 'Components/components';
import { generatePayload, toastPromise, updateState } from 'redux/common';
import moment from 'moment-timezone';
import useDebounce from 'services/hooks/useDebounce';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { CONST } from 'utils/constants';
import { useQuery } from '@tanstack/react-query';
import { MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import getPaymentCodeForm from './paymentCodeForm';
import { Button, Col } from 'react-bootstrap';
import { debounce } from 'lodash';
import paymentCodeService from 'services/APIs/services/paymentCodeService';
import Input from 'Components/FormBuilder/components/Input';

const defaultColor = "#ff0000"
export default function PaymentCode() {
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
        form: {
            isDefault: false,
        }
    });
    const [colorCode, setColorCode] = useState(defaultColor);
    const newSearch = useDebounce(state.search, 500);

    const onCancelHandler = useCallback(() => {
        updateState(setState, { create: false, update: false });
        setColorCode(defaultColor);
    }, []);

    const getData = useCallback(async () => {
        const payload = await generatePayload({
            keys: ['code'], value: newSearch,
            options: {
                sort: [["code", "ASC"]],
                limit: state.pageSize,
                page: state.page,
                pagination: true,
            }, isCount: true,
            currSearch: state.currSearch
        });
        const data = await paymentCodeService.list({ payload });
        setState(prev => ({
            ...prev, currSearch: newSearch,
            page: (state.currSearch !== newSearch) ? 1 : prev.page
        }));
        if (data?.status === 1) {
            data.data.lastUpdated = moment().format();
            return data.data
        };
        return [];
    }, [newSearch, state.page, state.pageSize, state.currSearch]);

    const { data: paymentCodeList, isFetching, refetch } = useQuery({
        queryKey: ["/paymentcode/list", state.page, state.pageSize, newSearch ? newSearch : undefined],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    const onSubmitHandler = useCallback(async (payload, mode = state.update ? 'update' : 'create') => {
        if (state.update) payload.id = state.update.id;
        payload.colorCode = colorCode
        payload.isDefault = payload.isDefault === "true"
        toastPromise({
            func: async (resolve, reject) => {
                try {
                    mode === 'update' ?
                        await paymentCodeService.update({ payload }) :
                        await paymentCodeService.create({ payload });
                    refetch();
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            }, loading: 'Loading Payment code.', error: 'Could not load payment code.', success: 'Payment code loaded.'
        });
        onCancelHandler();
    }, [refetch, state.update, onCancelHandler, colorCode]);

    const onEdit = useCallback((data) => {
        updateState(setState, { update: data })
        setColorCode(prev => data.colorCode ? data.colorCode : prev);
    }, []);

    const onDelete = useCallback((id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the payment code?',
            onDone: async () => {
                const data = await paymentCodeService.delete({ payload: { id } });
                if (data.status === 1) refetch();
            }
        })
    }, [refetch]);

    // Create a debounced version of setState
    const debouncedsetColorCode = debounce((value) => {
        setColorCode(value);
    }, 500);

    const handleChangeColor = useCallback((event) => {
        const { value } = event.target;
        // Call the debounced version of setState
        debouncedsetColorCode(value);
    }, [debouncedsetColorCode]);

    const columns = useMemo(() => [
        {
            field: "createdAt", headerName: "Created on", minWidth: 180, headerAlign: "center", align: 'center',
            renderCell: ({ row }) => (<>{moment(row.createdAt).format("MM/DD/YY")}</>)
        },
        {
            field: "code", headerName: "Code", minWidth: 180, flex: 1, headerAlign: "center", align: 'center',
            renderCell: ({ row }) => {
                return (<>
                    <div className='color-dot mr-1' style={row.colorCode ?
                        { background: row.colorCode, height: "12px", width: "12px" } : {}} />
                    <div>{row.code}</div>
                </>)
            }
        },
        {
            field: "codeType", headerName: "Type", minWidth: 180, flex: 1, headerAlign: "center", align: 'center',
            renderCell: ({ row }) => {
                const typeLabel = Object.keys(CONST.BILLING_CODE_TYPES).find(item =>
                    CONST.BILLING_CODE_TYPES[item].value === row.codeType
                )
                return (<div className='d-flex gap-10'>
                    {CONST.BILLING_CODE_TYPES[typeLabel]?.label || ''}
                    {(CONST.BILLING_CODE_TYPES[typeLabel]?.label !== CONST.BILLING_CODE_TYPES["SECONDARY_BILLING_CODE"]?.label) && row.isDefault &&
                        <div className='desg-tag'>Default</div>}
                </div>)
            }
        },
        {
            field: "actions", type: "actions", headerName: "Actions", flex: 1,
            getActions: (params) => [
                <MuiEditAction tooltip='Edit' onClick={() => onEdit(params.row)} />,
                <MuiDeleteAction tooltip='Delete' onClick={() => onDelete(params.id)} />,
            ],
        },
    ], [onDelete, onEdit]);

    const formJSON = useMemo(() => {
        const FORMJSON = getPaymentCodeForm();
        return FORMJSON.map((item) => {
            if (state.update && state.update.hasOwnProperty(item.name) && item.name === 'codeType') item.value = state.update[item.name]
            if (state.update && state.update.hasOwnProperty(item.name) && item.name === 'isDefault') item.value = String(state.update[item.name])
            else if (state.update && state.update.hasOwnProperty(item.name)) item.value = state.update[item.name]
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
                    placeholder="Search Paymentcode..."
                    handleChange={(e) => updateState(setState, { search: e.target.value })}
                />
            </div>
            <Button onClick={() => setState(prev => ({ ...prev, create: true }))}>
                Add New
            </Button>
        </div>
        <div className={`mt-2 cstm-mui-datagrid ${!paymentCodeList?.rows?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
            <DataGridPro
                rows={paymentCodeList?.rows ? paymentCodeList?.rows : []}
                columns={columns}
                autoHeight
                density="compact"
                disableColumnFilter
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () =>
                        <MuiDataGridFooter isFetching={isFetching}
                            lastUpdated={paymentCodeList?.lastUpdated}
                            pagination={{ page: state?.page, total: paymentCodeList?.count || 0, pageSize: state?.pageSize }}
                            onPageChange={(e, page) => {
                                updateState(setState, { page });
                            }}
                        />
                }}
            />
        </div>
        <ModalReactstrap
            size='md'
            show={Boolean(state.create || state.update)}
            toggle={onCancelHandler}
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
                                <label htmlFor="colorCode" className='mb-0'>Select Color:</label>
                                <input type="color" id="colorCode" name="colorCode" defaultValue={colorCode} onChange={handleChangeColor} />
                            </div>
                        </Col>}
                        onSubmit={onSubmitHandler}
                    />}
            </>}
        />
    </>)
}
