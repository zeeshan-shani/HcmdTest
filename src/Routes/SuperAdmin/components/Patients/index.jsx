import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useDebounce from 'services/hooks/useDebounce';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro/DataGridPro';
import { deletePatient, getPatientList } from 'redux/actions/chatAction';
import { TakeConfirmation } from "Components/components";
import { generatePayload, getImageURL, toastPromise, updateState } from 'redux/common';
import { LinearProgress } from '@mui/material';
import GlobalSearch from '../GlobalSearch';
import moment from 'moment-timezone';
import { dispatch } from 'redux/store';
import { MODEL_CONST } from 'redux/constants/modelConstants';
import { useSelector } from 'react-redux';
import { MuiActionButton, MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import { Chat } from '@mui/icons-material';
import Input from 'Components/FormBuilder/components/Input';
import { PureName } from 'services/helper/default';
import { getPatientName } from 'Components/Modals/PatientInfoModal';
import patientService from 'services/APIs/services/patientService';
import patientForm from './patientForm';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
// import PatientModal from './PatientModal';

export default function Patients() {
    const [state, setState] = useState({
        rows: [],
        pageSize: 10,
        page: 1,
        loading: false,
        rowCountState: 0,
        total: 0,
        search: '',
        currSearch: '',
        GlobalSearch: false,
        searchName: '',
        create: false,
        update: false,
    });
    const { updateTable } = useSelector(state => state.model);
    const newSearch = useDebounce(state.search, 500);

    const getData = useCallback(async () => {
        updateState(setState, { loading: true });
        const payload = await generatePayload({
            keys: ["firstName", "lastName", "insurance"],  // remaining doctor filter
            value: newSearch,
            options: {
                page: state.page, limit: state.pageSize, pagination: true,
                populate: ["patientAssign", "facilityInfo", "lastAllocatedSlot"],
                sort: [["firstName", "ASC"]],
            },
            isCount: true, currSearch: state.currSearch
        });
        const res = await getPatientList(payload);
        setState(prev => ({
            ...prev, currSearch: newSearch,
            page: (state.currSearch !== newSearch) ? 1 : prev.page
        }));
        if (res.status)
            return updateState(setState, { loading: false, rows: res.data.rows, total: res.data.count });
        updateState(setState, { loading: false });
    }, [state.page, state.pageSize, newSearch, state.currSearch]);

    const onEdit = useCallback((id) => async () => {
        setState(prev => ({ ...prev, update: prev.rows.find(item => item.id === id) }));
    }, []);

    const onDelete = useCallback((data) => async () => {
        const room = data.patientSlots[0] && data.patientSlots[0].roomNumber;
        TakeConfirmation({
            title: `Are you sure about deleting patient ${PureName(data.firstName + " " + data.lastName)}?`,
            content: room && `Room ${room} is Allocated to the patient. once patient deleted, Room will be available.`,
            onDone: async () => {
                await deletePatient({ id: data.id });
                getData();
            }
        })
    }, [getData]);

    const onSearchMessage = useCallback((data) => async () => {
        if (data) {
            const { id } = data; // firstName, lastName
            // let name = firstName;
            // if (lastName) name = [firstName, lastName].join('-');
            setState(prev => ({
                ...prev,
                GlobalSearch: true,
                searchName: `<@${id}>`,
                label: getPatientName(data.lastName, data.firstName)
            }));
        }
    }, []);

    const columns = useMemo(() => [
        {
            field: "actions", type: "actions", headerName: "Actions", minWidth: 150,
            getActions: (params) => [
                <MuiActionButton Icon={Chat} tooltip="View Messages of Patient" onClick={onSearchMessage(params.row)} />,
                <MuiEditAction tooltip="Edit Patient" onClick={onEdit(params.id)} />,
                <MuiDeleteAction tooltip="Delete Patient" onClick={onDelete(params.row)} />,
            ],
            flex: 1
        },
        {
            field: "profilePicture", headerName: "Profile", minWidth: 100, headerAlign: "center", align: 'center', disableSort: true,
            renderCell: ({ row }) => {
                if (row.profilePicture) {
                    const profile = row.profilePicture;
                    return (
                        <div className='d-flex'>
                            <img src={getImageURL(profile, '35x35', false)} alt=""
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({
                                        type: MODEL_CONST.USER_IMAGE_DATA, payload: {
                                            name: `${row.firstName} ${row.lastName ? row.lastName : ''}`,
                                            image: profile,
                                            updateType: "patient",
                                            id: row.id,
                                            updateTable: "patient-table"
                                        }
                                    })
                                }} />
                        </div>)
                }
            }
        },
        // { field: "id", headerName: "Id" },
        { field: "firstName", headerName: "First Name", minWidth: 180 },
        { field: "lastName", headerName: "Last Name", minWidth: 180 },
        { field: "middleName", headerName: "Middle Name", minWidth: 180 },
        {
            field: "admitDate", headerName: "Admit Date", minWidth: 120,
            renderCell: (params) => {
                return (<div>{(params.row.admitDate) ? moment(params.row.admitDate).format("MM/DD/YY") : '-'}</div>)
            }
        },
        {
            field: "phone", headerName: "Phone", type: "number", minWidth: 180,
            renderCell: (params) => {
                return (<div>{params.row.phone ? params.row.phone : '-'}</div>)
            }
        },
        {
            field: "facility", headerName: "Faciity", minWidth: 180,
            renderCell: ({ row }) => {
                const facility = row.facilityInfo ? row.facilityInfo.name : "-"
                return (<div>{facility}</div>)
            }
        },
        {
            field: "insurance", headerName: "Insurance", minWidth: 180,
            renderCell: (params) => {
                return (<div>{params.row.insurance ? params.row.insurance : '-'}</div>)
            }
        },
        { field: "SSN", headerName: "SSN" },
        {
            field: "DOB", headerName: "DOB",
            renderCell: (params) => {
                return (<div>{(params.row.DOB) ? moment(params.row.DOB).format("MM/DD/YY") : '-'}</div>)
            }
        },
        {
            field: "state", headerName: "State",
            renderCell: (params) => {
                return (<div>{params.row.state ? params.row.state : '-'}</div>)
            }
        },
        {
            field: "city", headerName: "City",
            renderCell: (params) => {
                return (<div>{params.row.city ? params.row.city : '-'}</div>)
            }
        },
        {
            field: "zip", headerName: "Zip",
            renderCell: (params) => {
                return (<div>{params.row.zip ? params.row.zip : '-'}</div>)
            }
        },
        { field: "gender", headerName: "Gender" },
        { field: "maritalStatus", headerName: "MaritalStatus", },
        {
            field: "location", headerName: "Location", renderCell: (params) => {
                return (<div>{params.row.location ? params.row.location : '-'}</div>)
            }
        },
        {
            field: "roomNumber", headerName: "Room no.", renderCell: (params) => {
                return (<div>{params.row?.patientSlots[0]?.roomNumber ? params.row?.patientSlots[0]?.roomNumber : '-'}</div>)
            }
        },
        { field: "medicalRecordNumber", headerName: "Medical Record Number" },
        {
            field: "providers", headerName: "Assigned Provider", minWidth: 180,
            renderCell: (params) => (<>
                {params.row?.patientAssigns?.map((assign) => (
                    <nobr key={assign.userId} className="desg-tag mr-1 px-1 main-desg-tag">
                        {assign.usersPatient?.name}
                    </nobr>
                ))}
            </>),
        },
    ], [onDelete, onEdit, onSearchMessage]);

    useEffect(() => {
        getData();
        //eslint-disable-next-line
    }, [state.page, state.pageSize, newSearch, state.filters, updateTable]);

    const onCancel = () => updateState(setState, { create: false, update: false });

    const onSubmitHandler = useCallback(async (body, mode = state.update ? 'update' : 'create') => {
        if (body.hasOwnProperty('gender')) body.gender = body.gender[0]?.value || null;
        if (body.hasOwnProperty('facilityId')) body.facilityId = body.facilityId[0]?.value || null;
        if (body.hasOwnProperty('maritalStatus')) body.maritalStatus = body.maritalStatus[0]?.value || null;
        if (state.update) {
            body.id = state.update.id;
            const patientUser = state.update?.patientAssigns?.map((item) => item.userId);
            const latestUser = body['patientAssigns'].map((item) => item.value) || [];
            body.addedPatientAssign = latestUser?.filter(item => !patientUser.includes(item));
            body.removedPatientAssign = patientUser?.filter(item => !latestUser.includes(item));
            delete body['patientAssigns'];
        }
        await toastPromise({
            func: async (myResolve, myReject) => {
                try {
                    const data = (mode === 'update') ?
                        await patientService.update({ payload: body }) :
                        await patientService.create({ payload: body });
                    myResolve(data);
                } catch (error) {
                    myReject("Error");
                }
            },
            loading: "Updating patient...", success: <b>Successfully Updated</b>, error: <b>Could not update patient.</b>,
            options: { id: "update-patient" }
        }).then((data) => {
            getData();
            onCancel();
        });
    }, [getData, state.update]);

    const formJSON = useMemo(() =>
        (!state.create || !state.update) ?
            patientForm.map((item) => {
                if (state.update) {
                    if (state.update.hasOwnProperty(item.name)) {
                        if (item.name === 'patientAssigns') item.value = state.update.patientAssigns.map((item) => ({ id: item.userId, label: item.usersPatient.name, value: item.userId }));
                        else if (item.name === 'DOB' || item.name === 'admitDate') item.value = state.update[item.name] ? moment(state.update[item.name]).toDate() : "";
                        else if (item.name === 'gender' || item.name === 'maritalStatus') item.value = [item.options.find((i) => i.value === state.update[item.name])]
                        else if (item.name === 'facilityId' && state.update?.facilityInfo)
                            item.value = [{ label: state.update["facilityInfo"].name, value: state.update["facilityInfo"].id }]
                        else item.value = state.update[item.name]
                    }
                } else item.value = patientForm[item.name];
                return item;
            }) : [], [state.create, state.update]);

    return (<>
        <div className="form-inline">
            <div className="input-group admin-search m-0">
                <Input
                    name="search_user"
                    value={state.search}
                    type="text"
                    placeholder="Search Patient..."
                    handleChange={(e) => updateState(setState, { search: e.target.value })}
                />
            </div>
            <button className='btn btn-primary ml-auto' type="button" onClick={() => setState(prev => ({ ...prev, create: true }))}>
                Add Patient
            </button>
        </div>
        <div className={`mt-2 cstm-mui-datagrid ${state.loading || !state.rows.length ? 'loading' : 'not_loading'}`} style={{ height: '88vh', width: '100%' }}>
            <DataGridPro
                paginationMode="server"
                loading={state.loading}
                rows={state.rows}
                columns={columns}
                onPageSizeChange={(newPageSize) => updateState(setState, { pageSize: newPageSize })}
                onPageChange={(newPage) => updateState(setState, { page: newPage + 1 })}
                rowsPerPageOptions={[10, 20]}
                rowCount={state.total}
                pageSize={state.pageSize}
                pagination
                autoHeight
                page={state.page - 1}
                initialState={{
                    pagination: { page: state.page, },
                }}
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () =>
                        <MuiDataGridFooter isFetching={state.loading}
                            // lastUpdated={usersList?.lastUpdated}
                            pagination={{ page: state?.page, total: state.total || 0, pageSize: state?.pageSize }}
                            onPageChange={(e, page) => {
                                updateState(setState, { page: page });
                            }}
                        />
                }}
                disableColumnFilter
            />
        </div>
        {/* {(state.create || state.update) && <>
            <PatientModal
                onCancel={onCancel}
            />
        </>} */}
        {(state.create || state.update) && <>
            <ModalReactstrap
                size='lg'
                show={Boolean(state.create || state.update)}
                toggle={onCancel}
                centered
                header={state.create ? 'Create Patient' : 'Edit Patient'}
                body={
                    <FormGenerator
                        className={'m-1'}
                        formClassName="row"
                        dataFields={formJSON}
                        onSubmit={onSubmitHandler}
                    />
                }
            />
        </>}
        {state?.GlobalSearch &&
            <GlobalSearch
                showModal={state?.GlobalSearch}
                label={state?.label}
                searchArr={[state?.searchName]}
                onClose={() => setState(prev => ({ ...prev, GlobalSearch: false, searchName: '', label: "" }))}
            />}
    </>)
}

