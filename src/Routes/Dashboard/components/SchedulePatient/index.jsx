import React, { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment-timezone';
import ReactSelect from 'react-select';
import ReactDatePicker from 'react-datepicker';
import { isMobile } from 'react-device-detect';
import { useLocation } from 'react-router-dom';
// Bootstrap
import { Button } from 'react-bootstrap';
import { Image, ListTask, MicFill, PersonDashFill, StickyFill } from 'react-bootstrap-icons';
// Mui Components
import { LinearProgress } from '@mui/material';
import { MuiActionButton, MuiDataGridFooter, MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import { DataGridPro, GRID_CHECKBOX_SELECTION_COL_DEF, GRID_DETAIL_PANEL_TOGGLE_COL_DEF, useGridApiRef } from '@mui/x-data-grid-pro';
// React Query
import { useQuery } from '@tanstack/react-query';
// Redux
import { dispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { MODEL_CONST } from 'redux/constants/modelConstants';
import { generatePayload, getDateXDaysAgoStartOf, getImageURL, toastPromise, updateState } from 'redux/common';

import { CONST } from 'utils/constants';
import { showError, showSuccess } from 'utils/package_config/toast';
import useDebounce from 'services/hooks/useDebounce';

// Components
import DetailPanelContent from 'Routes/Dashboard/components/SchedulePatient/DetailPanel';
import AddNewPatient from 'Routes/Dashboard/components/SchedulePatient/AddNewPatient';
import TransferPatient from 'Routes/Dashboard/components/SchedulePatient/components/TransferPatient';
import DeletePatient from 'Routes/Dashboard/components/SchedulePatient/components/DeletePatient';
import PatientIsVisited from 'Routes/Dashboard/components/SchedulePatient/components/PatientIsVisited';
import SecondaryBillingCode from 'Routes/Dashboard/components/SchedulePatient/components/SecondaryBillingCode';
import { CreateEditTodo } from 'Routes/Dashboard/components/SchedulePatient/DetailPanel/TodoList';
import { CreateEditNotes } from 'Routes/Dashboard/components/SchedulePatient/DetailPanel/PatientNotes';
import { CreateEditDictation } from 'Routes/Dashboard/components/SchedulePatient/DetailPanel/Dictation/CreateEditDictation';
import { CreateEditAttachment } from 'Routes/Dashboard/components/SchedulePatient/DetailPanel/PictureData/CreateEditAttachment';
import { getHCMDProviders } from 'Routes/SuperAdmin/components/Facility/CreateEditFacility';
import { downloadFilebyBlob, getLocalStore, reorderColumnOrderObject, setLocalStore, sortCharByField } from 'services/helper/default';
import { getDesignationByKey } from 'services/helper';
import { getAdminAccess } from 'utils/permission';
import ErrorBoundary from 'Components/ErrorBoundry';
import patientService from 'services/APIs/services/patientService';
import facilityService from 'services/APIs/services/facilityService';
import paymentCodeService from 'services/APIs/services/paymentCodeService';
import userService from 'services/APIs/services/userService';
import patientslotService, { patientpaymentService } from 'services/APIs/services/patientslotService';
import { TakeConfirmation } from 'Components/components';

const defaultSort = [{ field: 'createdAt', sort: 'desc' }];
const getDefaultState = (params, isProvider, providervalue) => {
    const localData = getLocalStore("filters");
    return {
        rows: [],
        page: 1,
        total: 0,
        pageSize: 20,
        rowCountState: 0,
        loading: false,
        isHistory: false,
        search: localData?.rounding?.search ? localData?.rounding.search : '',
        currSearch: "",
        roomNumber: localData?.rounding?.roomNumber ? localData?.rounding.roomNumber : null,
        filters: {
            facility: localData?.rounding?.facility ? localData?.rounding.facility : null,
            attendee: params?.provider ? params.provider : (isProvider ? providervalue :
                (localData?.rounding?.attendee ? localData?.rounding.attendee : null)),
            visitDate: getDateXDaysAgoStartOf(0).toLocaleString()
        },
        sortModel: defaultSort,
        paymentOptions: [],
        primaryPaymentOptions: [],
        secondaryPaymentOptions: [],
        loadingExport: false,
        loadingPaymentOptions: false,
        facilityOptions: [],
        providerOptions: [],
        nurseOptions: [],
        attendingOptions: [],
        loadingOptions: false,
        dictation: false,
        todoModel: false,
        pictureData: false,
        selectedPatientId: null,
        addNewPatient: false,
        selectionModel: [],
        transferModel: false,
        noteModel: false,
        orderRooms: {
            inputValue: '',
            value: [],
        },
        deleteModel: false,
        row: null,
        updatedDetailData: null
    }
}

const POPULATE_PATIENT = ["patientAssignFacility", "patientPaymentCode", "facilityInfo", "patientAvailable"] // "secondaryPaymentCodeInfo",
const columnFields = [
    "roomNumber",
    "lastName",
    "visited",
    "actions",
    "profilePicture",
    "facility",
    "TypeofDischarge",
    "reasonOfDischarge",
    "insurance",
    "attending",
    "primaryBillCode",
    "secondaryBillCode",
    "admitDate"
];

export default function SchedulePatient({ isHistory = false }) {
    const location = useLocation();
    const apiRef = useGridApiRef();
    const { user } = useSelector(state => state.user);
    const { userDesignations } = useSelector(state => state.chat);
    const { updateTable } = useSelector(state => state.model);
    const params = useMemo(() => location.state || {}, [location.state]);
    const [state, setState] = useState(getDefaultState(params, user?.isProvider));
    const newSearch = useDebounce(state.search, 1000);
    const roomNumberFilter = useDebounce(state.roomNumber, 1000);
    const [colOrderState, setOrderState] = useState(1);

    useEffect(() => {
        // Fetch facility list (provider based)
        (async () => {
            setState(prev => ({ ...prev, loadingOptions: true }));
            try {
                const isAdmin = getAdminAccess(user);
                const payload = {
                    "query": { "providerId": (!isAdmin && user?.isProvider) ? user.id : undefined },
                    "options": { "populate": ["facilityProviderInfo", "organizationInfo"] }
                }
                const facilityData = await facilityService.list({ payload });
                setState(prev => ({
                    ...prev,
                    loadingOptions: false,
                    facilityOptions: facilityData?.data?.map(i => ({ id: i.id, value: i, label: i.name })) || [],
                }));
            } catch (error) { console.error(error) }
        })();
        // Fetch Primary and secondary code list
        (async () => {
            try {
                setState(prev => ({ ...prev, loadingPaymentOptions: true }))
                const primaryPaymentOptions = await paymentCodeService.list({ payload: { "options": { populate: ['primaryCode'] } } });
                const secondaryPaymentOptions = await paymentCodeService.list({ payload: { "options": { populate: ['secondaryCode'] } } });
                setState(prev => ({
                    ...prev,
                    loadingPaymentOptions: false,
                    primaryPaymentOptions: primaryPaymentOptions.data.map((item => ({ id: item.id, value: item.id, label: <ColorCodeLabel item={item} /> }))),
                    secondaryPaymentOptions: secondaryPaymentOptions.data.map((item => ({ id: item.id, value: item.id, label: <ColorCodeLabel item={item} /> }))),
                }));
            } catch (error) { showError('Could not fetch payment codes.', error) }
        })();
    }, [user]);

    // Fetch HCMD Providers, MD, NP for filtered list
    useEffect(() => {
        (async () => {
            if (userDesignations) {
                setState(prev => ({ ...prev, loadingPaymentOptions: true }));
                const providerDesignation = await getDesignationByKey(CONST.DESIGNATION_KEY.PROVIDER, "selectable");
                const NursePracDesignation = await getDesignationByKey(CONST.DESIGNATION_KEY.NURSE_PRACTITIONER);
                const providers = await getHCMDProviders('', providerDesignation?.id, ["providerInfoAssignfacility"]);
                const nurses = await getHCMDProviders('', NursePracDesignation?.id, ["providerInfoAssignfacility"]);
                const attendeeData = await userService.list({
                    payload: { "options": { "populate": ["providerInfoAssignfacility"] } }
                })
                setState(prev => ({
                    ...prev,
                    loadingPaymentOptions: false,
                    attendingOptions: attendeeData.data.map(i => ({ id: i.id, value: i, label: i.name })),
                    providerOptions: providers.data.map(i => ({ id: i.id, value: i, label: i.name })),
                    nurseOptions: nurses.data.map(i => ({ id: i.id, value: i, label: i.name })),
                }));
            }
        })();
    }, [userDesignations]);

    const getData = useCallback(async ({ exportExcel = false, config = {} }) => {
        if (!Boolean(state.filters?.visitDate)) return null;
        // if no facility allocated to user
        if (!state.facilityOptions.length) return null;
        const mdDesg = await getDesignationByKey(CONST.DESIGNATION_KEY.PROVIDER, "selectable");
        const npDesg = await getDesignationByKey(CONST.DESIGNATION_KEY.NURSE_PRACTITIONER, "selectable");
        // const isAdmin = getAdminAccess(user);
        if (state.filters?.MD?.value && !mdDesg) return null;
        if (state.filters?.NP?.value && !npDesg) return null;
        let payload = await generatePayload({
            keys: ["firstName", "lastName", "phone", "insurance"],
            value: newSearch,
            options: {
                page: state.page, limit: state.pageSize, pagination: !exportExcel,
                // populate: isHistory ? [...POPULATE_PATIENT, "patientSlots"] : POPULATE_PATIENT,
                populate: POPULATE_PATIENT,
                sort: !!state.sortModel?.length ? state.sortModel.map(i => ([i.field, i.sort])) : undefined,
            },
            body: {
                [isHistory ? 'dischargeDate' : 'start']: {
                    dateFrom: moment(state.filters.visitDate).format("YYYY-MM-DD"),
                    dateTo: moment(state.filters.visitDate).format("YYYY-MM-DD")
                }
            },
            rest: {
                discharge: isHistory,
                facilityId:
                    (state.filters?.facility?.value?.id && [state.filters?.facility?.value?.id]) ||
                    (!!state?.facilityOptions?.length && state.facilityOptions.map(i => i.id)) ||
                    undefined,
                // (!isAdmin ? state.facilityOptions.map(i => i.id) : undefined) || undefined,
                roomNumber: roomNumberFilter || undefined,
                attendeeId: state.filters?.facility || params?.provider ? state.filters?.attendee?.value : undefined,
                MD: state.filters?.MD ? { id: state.filters?.MD?.value, designationId: mdDesg?.id } : undefined,
                NP: state.filters?.NP ? { id: state.filters?.NP?.value, designationId: npDesg?.id } : undefined,
            },
            isCount: true, currSearch: state.currSearch
        });
        payload.options.sort = [...(payload.options.sort || []), ["patientSlots", "start", "desc"]]
        if (!!payload.options.sort?.length && payload.options.sort[0][0] === "roomNumber")
            payload.options.sort[0].unshift("patientSlots")
        if (exportExcel) payload.exportExcel = exportExcel;
        const data = await patientService.list({ payload, config });
        {
            let localStore = getLocalStore("filters");
            if (!localStore.hasOwnProperty("rounding")) localStore.rounding = {};
            localStore.rounding.search = newSearch || null
            localStore.rounding.facility = state.filters?.facility || null;
            localStore.rounding.attendee = state.filters?.attendee || null;
            setLocalStore("filters", localStore);
        }
        setState(prev => ({
            ...prev, loading: false, currSearch: state.currSearch,
            page: (state.currSearch !== newSearch) ? 1 : prev.page
        }));
        if (exportExcel) return data;
        if (data.status === 1) {
            data.data.rows = data.data.rows.map((i) => {
                if (i.patientSlots[0]?.roomNumber) i.roomNumber = i.patientSlots[0]?.roomNumber;
                return i;
            });
            // updateState(setState, { loading: false, rows: data.data.rows, total: data.data.count });
            data.data.lastUpdated = moment().format();
            return data.data;
        }
        return null;
    }, [state?.filters, newSearch, state?.sortModel, state.currSearch, state.page, state.pageSize, isHistory, params?.provider, roomNumberFilter, state.facilityOptions]);

    // Query hook to fetch data based on queryString & caching
    const { data: patientSlotList, refetch, isFetching } = useQuery({ // isFetching,
        queryKey: ["/patient/list", state.page, state.pageSize, newSearch, roomNumberFilter, state.filters, state.sortModel, isHistory, state.facilityOptions, updateTable],
        queryFn: getData,
        keepPreviousData: false,
        // staleTime: CONST.QUERY_STALE_TIME.L1,
        refetchOnWindowFocus: false,
    });

    // Request for update primary and secondary billing code
    const updatePaymentCode = useCallback(async (payload, isPrimary) => {
        if (isPrimary) {
            payload.paymentCode = payload.addedCode[0] ? payload.addedCode[0] : undefined;
            // Delete unwanted properties
            ['patientId', 'addedCode', 'removedCode'].forEach(prop => delete payload[prop]);
        }
        isPrimary ?
            await patientslotService.update({ payload }) :
            await patientpaymentService.secondarypaymentcodeUpdate({ payload });
        refetch();
        return;
    }, [refetch]);

    // close all models
    const closeModals = useCallback((refresh = false) => {
        setState(prev => ({ ...prev, deleteModel: false, todoModel: false, dictation: false, noteModel: false, pictureData: false, row: null, addNewPatient: false, update: false }));
        refresh && refetch();
    }, [refetch]);

    // Request for update patient visited
    const updatePatientVisited = useCallback(async (payload) => {
        const data = await patientslotService.update({ payload });
        if (payload.hasOwnProperty("slotIds")) {
            apiRef.current.setSelectionModel([]);
            refetch();
            return showSuccess("Slots marked as done successfully.");
        }
        if (patientSlotList.rows)
            patientSlotList.rows.find(i => i.patientSlots[0]?.id === payload.id).patientSlots[0].isVisited = data.data.isVisited;
    }, [patientSlotList, refetch, apiRef]);

    const setPatientProfile = useCallback((patientId, profilePicture) => {
        if (patientSlotList?.rows.find(i => i.id === patientId)) {
            patientSlotList.rows.find(i => i.id === patientId).profilePicture = profilePicture;
            setOrderState(prev => prev + 1);
        }
    }, [patientSlotList]);

    // Create picture data for a patient 
    const onSubmitPicturedata = useCallback(async (body, mode, id) => {
        if (state.dictation) {
            body = {
                ...body,
                fileName: body.fileName,
                mediaType: body.mediaType,
                mediaUrl: body.mediaUrl,
            }
        }
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = await patientService.attachmentCreate({ payload: { patientId: id, ...body } });
                    closeModals();
                    setState(prev => ({ ...prev, updatedDetailData: data.data }));
                    if (body.profilePicture)
                        setPatientProfile(id, body.mediaUrl);
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            }, loading: 'Creating File Data.', error: 'Could not create File Data.', success: 'File data created.',
            options: { id: "create-picture" }
        });
    }, [closeModals, state.dictation, setPatientProfile]);

    // Create and assign todo for a patient
    const onSubmitHandlerTodo = useCallback(async (body, mode, id) => {
        // if (body.assigneeId === user.id) return toast.error("Can't assign to own user, Please select another assignee")
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    await patientService.taskCreate({ payload: { patientId: id, ...body } });
                    updateState(setState, { dictation: false, pictureData: false, todoModel: false, noteModel: false })
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            }, loading: 'Creating Todo.', error: 'Could not create todo.', success: 'Todo created.',
            options: { id: "create-todo" }
        });
    }, []);

    // Create notes for a patient
    const onSubmitNotes = useCallback(async (body, mode, id) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    await patientService.noteCreate({ payload: { patientId: id, ...body } });
                    closeModals();
                    resolve(1);
                } catch (error) {
                    console.error(error);
                    reject(0);
                }
            }, loading: 'Creating note.', error: 'Could not create note.', success: 'note created.',
            options: { id: "create-notes" }
        });
    }, [closeModals]);

    const onDeleteSlot = useCallback((patient) => {
        TakeConfirmation({
            title: `Are you sure about to delete the slot of the patient "${patient?.lastName}"?`,
            onDone: async () => {
                const [{ id }] = patient?.patientSlots;
                await patientslotService.delete({ payload: { id } });
                refetch();
            }
        })
    }, [refetch]);

    // Data grid columns
    const columns = useMemo(() => {
        let orderer = {};
        const isToday = state.filters.visitDate ? moment().format("MM/DD/YYYY") === moment(state.filters.visitDate).format("MM/DD/YYYY") : null;
        const colOrder = JSON.parse(localStorage.getItem('rounding-sheet-col-order'));
        if (colOrderState && colOrder)
            columnFields.map((i, index) => {
                const order = (colOrder[i] || colOrder[i] === 0) ? colOrder[i] : index;
                orderer[i] = order;
                return { name: i, order }
            });
        localStorage.setItem('rounding-sheet-col-order', JSON.stringify(orderer));
        let commonColumns = [
            {
                field: "roomNumber", headerName: "Room", headerAlign: "center", align: 'center', hide: isHistory,
                renderCell: ({ row }) => {
                    const roomNumber = row?.patientSlots[0]?.roomNumber;
                    return (<>{roomNumber ? roomNumber : '-'}</>)
                }
            },
            {
                field: "lastName", headerName: "Patient name", minWidth: 180, headerAlign: "center", align: 'center', flex: 1,
                renderCell: ({ row }) => {
                    const { firstName, lastName, middleName, patientSlots } = row;
                    const username = getPatientName(lastName, firstName, middleName); // get patient name in specific order
                    const { name = "-", image = "" } = patientSlots[0]?.facilitySlotInfo?.info || {};
                    return (
                        <div className='d-flex align-items-center gap-10'>
                            {username}
                            <img src={getImageURL(image, '35x35', false)} alt=""
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({
                                        type: MODEL_CONST.USER_IMAGE_DATA, payload: {
                                            name,
                                            image,
                                            id: row.facilityInfo?.info?.id,
                                            updateTable: "rounding-sheet",
                                            updateType: "organization",
                                            updateField: "image"
                                        }
                                    })
                                }}
                            />
                        </div>)
                }
            },
            {
                field: "visited", headerName: "Done", headerAlign: "center", align: 'center', hide: isHistory,  // sortable: false, type: 'boolean', editable: true
                renderCell: ({ row }) => {
                    return <PatientIsVisited key={state.filters.visitDate} row={row} updatePatientVisited={updatePatientVisited} />
                }
            },
            {
                field: "actions", headerName: "Actions", headerAlign: "center", align: 'center', sortable: false,
                minWidth: isHistory ? 180 : isMobile || !isToday ? 150 : 240,
                renderCell: ({ row }) => {
                    return (<div onClick={e => e.stopPropagation()} className="d-flex flex-wrap">
                        <MuiActionButton Icon={ListTask} color="primary" fontSize={16} size="sm" tooltip='Todo' onClick={() => updateState(setState, { todoModel: true, selectedPatientId: row.id, row })} />
                        <MuiActionButton Icon={StickyFill} color="primary" fontSize={16} size="sm" tooltip='Note' onClick={() => updateState(setState, { noteModel: true, selectedPatientId: row.id, row })} />
                        <MuiActionButton Icon={Image} color="primary" fontSize={16} size="sm" tooltip='Picture Data' onClick={() => updateState(setState, { pictureData: true, selectedPatientId: row.id })} />
                        <MuiActionButton Icon={MicFill} color="primary" fontSize={16} size="sm" tooltip='Recorder' onClick={() => updateState(setState, { dictation: true, selectedPatientId: row.id })} />
                        <MuiEditAction tooltip='Edit' onClick={() => updateState(setState, { update: row })} />
                        {!isHistory && <MuiActionButton Icon={PersonDashFill} color="secondary" fontSize={16} size="sm" tooltip='Discharge' onClick={() => updateState(setState, { deleteModel: row })} />}
                        {!isHistory && <MuiDeleteAction tooltip='Delete' onClick={() => onDeleteSlot(row)} />}
                    </div>)
                }
            },
            {
                field: "profilePicture", headerName: "Profile", maxWidth: 80, headerAlign: "center", align: 'center', sortable: false,
                renderCell: ({ row }) => {
                    const { firstName, lastName, middleName, profilePicture: profile } = row;
                    const username = getPatientName(lastName, firstName, middleName); // get patient name in specific order
                    return (
                        <div className='d-flex'>
                            <img src={getImageURL(profile, '35x35', false)} alt=""
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({
                                        type: MODEL_CONST.USER_IMAGE_DATA, payload: {
                                            id: row.id,
                                            name: username,
                                            image: profile,
                                            updateType: "patient",
                                            updateTable: "rounding-sheet"
                                        }
                                    })
                                }} />
                        </div>)
                }
            },
            {
                field: "facility", headerName: "Facility", headerAlign: "left", align: 'left', sortable: false,
                renderCell: ({ row }) => {
                    const facility = row.patientSlots[0]?.facilitySlotInfo?.name || null;
                    return (<>{facility ? facility : '-'}</>)
                }
            },
            {
                field: "TypeofDischarge", headerName: "Discharge Type", minWidth: 150, headerAlign: "left", align: 'left', hide: !isHistory, sortable: false,
                renderCell: ({ row }) => {
                    const reasonType = row.patientSlots[0]?.patientDischarge?.reasonType || null;
                    return (<>{reasonType ? reasonType : '-'}</>)
                }
            },
            {
                field: "reasonOfDischarge", headerName: "Discharge Reason", minWidth: 150, headerAlign: "left", align: 'left', hide: !isHistory, sortable: false,
                renderCell: ({ row }) => {
                    const reason = row.patientSlots[0]?.patientDischarge?.reason || null;
                    return (<>{reason ? reason : '-'}</>)
                }
            },
            {
                field: "insurance", headerName: "Insurance", headerAlign: "left", align: 'left', sortable: false,
                renderCell: ({ row }) => (<>{row.insurance ? row.insurance : '-'}</>)
            },
            {
                field: "attending", headerName: "Attending", headerAlign: "left", align: 'left', flex: 1, sortable: false,
                renderCell: ({ row }) => {
                    const attendee =
                        (row.patientAssigns?.find(i => i.type === CONST.PROVIDER_TYPE.ATTENDEE)?.usersPatient?.name || null)
                    return (<>{attendee ? attendee : '-'}</>)
                },
            },
            {
                field: "primaryBillCode", headerName: "Primary Billing Code", minWidth: 250, flex: 1, headerAlign: "center", align: 'center', sortable: false,
                renderCell: (params) => {
                    const { row } = params;
                    const indexValue = params.api.getRowIndex(params.row.id);
                    const payCode = (row.patientSlots[0] && row.patientSlots[0].patientPaymentCode) || null;
                    const paymentCode = (payCode && [{
                        label: <div className='d-flex gap-5 align-items-center'>
                            {payCode?.colorCode && <div className='color-dot' style={
                                { background: payCode?.colorCode, height: "12px", width: "12px" }} />}
                            {payCode?.code}
                        </div>,
                        value: payCode?.id
                    }]) || null;
                    return (<SecondaryBillingCode indexValue={indexValue} paymentCode={paymentCode} row={row} apiRef={apiRef}
                        paymentOptions={state.primaryPaymentOptions} loading={state.loadingPaymentOptions}
                        onUpdate={(data) => updatePaymentCode({ ...data, patientId: row.id, id: row.patientSlots[0].id }, true)} />)
                }
            },
            {
                field: "secondaryBillCode", headerName: "Secondary Billing Code", minWidth: 250, flex: 1, headerAlign: "center", align: 'center', sortable: false,
                renderCell: (params) => {
                    const { row } = params;
                    const indexValue = params.api.getRowIndex(params.row.id);
                    const paymentCode = row.patientSlots[0].secondaryPaymentCodes?.map(i => ({
                        label: <div className='d-flex gap-5 align-items-center'>
                            {i?.paymentCodeInfo?.colorCode && <div className='color-dot' style={
                                { background: i?.paymentCodeInfo?.colorCode, height: "12px", width: "12px" }} />}
                            {i?.paymentCodeInfo?.code}
                        </div>,
                        value: i?.paymentCodeInfo?.id
                    }))
                    return (<SecondaryBillingCode indexValue={indexValue} paymentCode={paymentCode} row={row} apiRef={apiRef}
                        loading={state.loadingPaymentOptions} paymentOptions={state.secondaryPaymentOptions} isMulti={true}
                        onUpdate={(data) =>
                            updatePaymentCode({ ...data, patientId: row.id, slotId: row.patientSlots[0].id })} />)
                }
            },
            {
                field: "admitDate", headerName: "Admit Date", headerAlign: "center", align: 'center', sortable: false,
                renderCell: ({ row }) => {
                    const admitDate = row.admitDate || null;
                    return (<>{admitDate ? moment(admitDate).format("MM/DD/YY") : '-'}</>)
                }
            },
        ].map(i => ({ ...i, order: orderer[i.field] }));
        commonColumns.sort((a, b) => {
            if (a.order > b.order) return 1;
            if (a.order < b.order) return -1;
            return 0;
        })
        if (!isHistory) commonColumns.push({ ...GRID_CHECKBOX_SELECTION_COL_DEF });
        commonColumns.push({ ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF, hide: true });
        return commonColumns;
    }, [apiRef, isHistory, state.primaryPaymentOptions, state.secondaryPaymentOptions, state.filters.visitDate, state.loadingPaymentOptions,
        updatePaymentCode, updatePatientVisited, onDeleteSlot, colOrderState]);

    const toggleTransferModel = useCallback((refresh = false) => {
        refresh && refetch();
        setState(prev => ({ ...prev, transferModel: !prev.transferModel }));
    }, [refetch]);

    const { providerOptions, nurseOptions, attendingOptions } = useMemo(() => {
        const facility = state.filters.facility;
        let [providers, nurses, attendee] = [state.providerOptions, state.nurseOptions, state.attendingOptions];
        if (facility) {
            providers = providers.filter(i => i.value.facilityAssigns.map(j => j.facilityId).includes(facility.id));
            nurses = nurses.filter(i => i.value.facilityAssigns.map(j => j.facilityId).includes(facility.id));
            attendee = attendee.filter(i => i.value.facilityAssigns.map(j => j.facilityId).includes(facility.id));
        }
        providers = sortCharByField(providers.map(i => ({ ...i, value: i.id })), 'label');
        nurses = sortCharByField(nurses.map(i => ({ ...i, value: i.id })), 'label');
        attendee = sortCharByField(attendee.map(i => ({ ...i, value: i.id })), 'label');
        return { providerOptions: providers, nurseOptions: nurses, attendingOptions: attendee };
    }, [state.providerOptions, state.nurseOptions, state.attendingOptions, state.filters.facility]);

    // Export excel data for a specified filters
    const onExportDataHandler = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loadingExport: true }));
            const config = {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'application/vnd.ms-excel',
                    'Content-Type': 'application/vnd.ms-excel'
                }
            }
            const data = await getData({ exportExcel: true, config });
            const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
            downloadFilebyBlob(blob, `Patient_Slot_${moment(state.filters.visitDate).format('MM/DD/YY')}.xlsx`);
            setState(prev => ({ ...prev, loadingExport: false }));
            showSuccess('File Downloaded Successfully');
        } catch (error) {
            console.error(error);
        }
    }, [state?.filters?.visitDate, getData]);

    // Mark as Done (visited) for every slot
    const allMarkasVisited = useCallback(async () => {
        if (!!state.selectionModel.length) {
            const slotIds = state.selectionModel.map(patientId => {
                const slot = patientSlotList?.rows.find(i => i.id === patientId);
                if (slot) return slot.patientSlots[0]?.id;
                return null;
            }).filter(i => i);
            await updatePatientVisited({ slotIds, isVisited: true });
        }
    }, [state.selectionModel, updatePatientVisited, patientSlotList?.rows]);

    const onColumnOrderChange = useCallback((data) => {
        let colOrder = JSON.parse(localStorage.getItem('rounding-sheet-col-order'));
        const { targetIndex, oldIndex, field } = data;
        const updatedColumnOrderObject = reorderColumnOrderObject(colOrder, targetIndex, oldIndex, field);
        localStorage.setItem('rounding-sheet-col-order', JSON.stringify(updatedColumnOrderObject));
        setOrderState(prev => prev + 1);
    }, []);

    const schedulePatients = useMemo(() => (
        <ErrorBoundary>
            <DataGridPro
                apiRef={apiRef}
                rows={patientSlotList?.rows || []}
                columns={columns}
                loading={isFetching}
                autoHeight
                disableColumnFilter
                disableVirtualization
                getDetailPanelHeight={() => 'auto'}
                getDetailPanelContent={(params) =>
                    <DetailPanelContent
                        visitDate={state.filters.visitDate}
                        setPatientProfile={setPatientProfile}
                        updatedDetailData={state.updatedDetailData}
                        setMainState={setState}
                        params={params} />
                }
                checkboxSelection={!isHistory}
                onRowClick={(params) => {
                    apiRef.current.setSelectionModel(state.selectionModel.includes(params.id) ?
                        state.selectionModel.filter(i => i !== params.id) : state.selectionModel.push(params.id));
                    apiRef.current.toggleDetailPanel(params.id);
                }}
                onColumnOrderChange={onColumnOrderChange}
                sortModel={state.sortModel}
                onSortModelChange={(data) =>
                    setState(prev => ({ ...prev, sortModel: !data.length ? prev.sortModel : data }))
                }
                disableRowSelectionOnClick
                onSelectionModelChange={(selectionModel) => setState(prev => ({ ...prev, selectionModel: selectionModel }))}
                selectionModel={state.selectionModel}
                keepNonExistentRowsSelected
                components={{
                    LoadingOverlay: LinearProgress,
                    Footer: () =>
                        <MuiDataGridFooter isFetching={state.loading}
                            lastUpdated={patientSlotList?.lastUpdated}
                            pagination={{ page: state?.page, total: patientSlotList?.count || 0, pageSize: state?.pageSize }}
                            onPageChange={(e, page) => {
                                updateState(setState, { page: page });
                            }}
                        />,
                }}
                density="standard"
                getRowHeight={() => "auto"}
                getRowClassName={({ row }) => `min-height-60`} // ${row.patientSlots[0]?.isVisited ? "patient-visited-row" : ""} // for different color
                classes={{
                    virtualScroller: "react-select-datagrid-MuiDataGrid-virtualScroller",
                }}
            />
        </ErrorBoundary>
        //eslint-disable-next-line
    ), [apiRef, columns, isHistory, onColumnOrderChange, patientSlotList, state.loading, colOrderState, state?.page, state?.pageSize,
        state.selectionModel, state.sortModel, state.updatedDetailData, setPatientProfile, state.filters.visitDate]);

    // Calculate the start and end indices for the current page
    const { startIndex, endIndex } = useMemo(() => {
        const startIndex = (state?.page - 1) * state.pageSize + 1;
        const endIndex = Math.min(state?.page * state.pageSize, patientSlotList?.count);
        return { startIndex, endIndex }
    }, [patientSlotList?.count, state?.page, state.pageSize]);

    return (<>
        <div className="d-flex flex-wrap justify-content-between mb-2">
            <div className='d-flex gap-10 my-1'>
                <div className="accordion-button collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target={`#rounding-sheet-filters`}
                    aria-expanded="false"
                    aria-controls={`rounding-sheet-filters`}
                >
                    <Button variant='primary'>Filters</Button>
                </div>
                <Button variant='secondary' onClick={onExportDataHandler} disabled={state.loadingExport}>
                    {state.loadingExport ? 'Exporting...' : 'Export'}
                </Button>
            </div>
            {!isHistory &&
                <div className='d-flex gap-10 my-1'>
                    {!!state.selectionModel.length && <>
                        <Button variant='primary' onClick={allMarkasVisited}>Mark as Done</Button>
                        <Button variant='primary' onClick={toggleTransferModel}>Transfer</Button>
                    </>}
                    <Button variant='primary' onClick={() => updateState(setState, { addNewPatient: true })}>Add Patient</Button>
                </div>}
        </div>
        <div id={`rounding-sheet-filters`} className={`accordion-collapse collapse ${!isMobile ? "show" : ""}`}>
            <div className="accordion-body mb-2">
                <div className="date-task-filter d-flex flex-wrap align-items-center gap-5">
                    <div className="d-flex px-0 align-items-center" title="Visit date">
                        <nobr htmlFor="visitDate-filter" className='fs-14 mb-0 mr-1'>{isHistory ? 'Discharge Date:' : 'Visit Date:'}</nobr>
                        <ReactDatePicker
                            id="visitDate-filter"
                            name="visitDate"
                            placeholderText="Visit Date"
                            className="form-control search"
                            selected={state.filters?.visitDate ? moment(state.filters?.visitDate).toDate() : null}
                            value={state.filters?.visitDate ? moment(state.filters?.visitDate).toDate() : null}
                            onChange={(date) => setState(prev => ({ ...prev, filters: { ...prev.filters, visitDate: date } }))}
                            dateFormat="MM/dd/yyyy"
                        />
                    </div>
                    <div className="form-inline">
                        <div className="input-group theme-border">
                            <input type="text" className="form-control search"
                                placeholder="Search patient"
                                title="Search User/Group"
                                value={state.search || ''}
                                onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))} />
                        </div>
                    </div>
                    <div className="form-inline">
                        <div className="input-group theme-border">
                            <input type="text" className="form-control search"
                                placeholder="Room no."
                                title="Search by room"
                                value={state.roomNumber || ''}
                                onChange={(e) => setState((prev) => ({ ...prev, roomNumber: e.target.value }))} />
                        </div>
                    </div>
                    <div className="form-inline">
                        <ReactSelect
                            value={[state.filters.facility]}
                            isLoading={state.loadingOptions}
                            classNamePrefix="select"
                            placeholder="Select facility"
                            className={"min-width-160"}
                            name={"facility"}
                            options={state.facilityOptions && !!state.facilityOptions.length ? state.facilityOptions : []}
                            onChange={(item) => setState(prev => ({
                                ...prev,
                                filters: { ...prev.filters, facility: item, attendee: item ? prev.filters.attendee : null }
                            }))}
                            menuPlacement='bottom'
                            isClearable={true}
                        />
                    </div>
                    {(state.filters.facility || state.filters.attendee) &&
                        <div className="form-inline">
                            <ReactSelect
                                name={"attendee"}
                                isLoading={state.loadingOptions}
                                menuPlacement='bottom'
                                value={[state.filters.attendee]}
                                classNamePrefix="select"
                                placeholder="Attendee Provider"
                                options={attendingOptions && !!attendingOptions.length ? attendingOptions : []}
                                onChange={(item) => setState(prev => ({ ...prev, filters: { ...prev.filters, attendee: item } }))}
                                isClearable={true}
                                className={"min-width-160"} />
                        </div>}
                    <div className="form-inline">
                        <ReactSelect
                            name={"hcmd_md"}
                            isLoading={state.loadingOptions}
                            menuPlacement='bottom'
                            value={[state.filters.MD]}
                            classNamePrefix="select"
                            placeholder="HCMD MD"
                            options={providerOptions && !!providerOptions.length ? providerOptions : []}
                            onChange={(item) => setState(prev => ({ ...prev, filters: { ...prev.filters, MD: item } }))}
                            isClearable={true}
                            className={"min-width-160"} />
                    </div>
                    <div className="form-inline">
                        <ReactSelect
                            name={"hcmd_np"}
                            isLoading={state.loadingOptions}
                            menuPlacement='bottom'
                            value={[state.filters.NP]}
                            classNamePrefix="select"
                            placeholder="HCMD NP"
                            options={nurseOptions && !!nurseOptions.length ? nurseOptions : []}
                            onChange={(item) => setState(prev => ({ ...prev, filters: { ...prev.filters, NP: item } }))}
                            isClearable={true}
                            className={"min-width-160"} />
                    </div>
                </div>
            </div>
        </div>
        {Boolean(startIndex && endIndex && patientSlotList?.count) &&
            <p className='d-flex justify-content-end'>{`${startIndex}-${endIndex} Rows of ${patientSlotList?.count} Records`}</p>}
        <div className={`cstm-mui-datagrid stripe-table ${!patientSlotList?.rows?.length || state.loading ? 'loading' : 'not_loading react-select-datagrid'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
            {schedulePatients}
        </div>
        <CreateEditAttachment
            type={state.pictureData ? "image" : "audio"}
            fieldName={state.dictation ? 'Dictation' : 'Picture Data'}
            showModal={state.pictureData}
            onSubmit={onSubmitPicturedata}
            onCancel={closeModals}
            patientId={state.selectedPatientId}
        />
        <CreateEditDictation
            type={"audio"}
            fieldName={'Dictation'}
            showModal={Boolean(state.dictation)}
            visitDate={state.filters.visitDate}
            onSubmit={onSubmitPicturedata}
            onCancel={closeModals}
            patientId={state.selectedPatientId}
        />
        <CreateEditTodo
            fieldName='Todo'
            showModal={Boolean(state.todoModel)}
            onSubmit={onSubmitHandlerTodo}
            onCancel={closeModals}
            patientId={state.selectedPatientId}
            rowData={state.row}
        />
        <CreateEditNotes
            fieldName='Note'
            showModal={Boolean(state.noteModel)}
            onSubmit={onSubmitNotes}
            onCancel={closeModals}
            patientId={state.selectedPatientId}
            rowData={state.row}
        />
        {(state.addNewPatient || state.update) &&
            <AddNewPatient onSubmit={refetch} updateData={state.update} onCancel={closeModals} />}
        <TransferPatient state={state} toggleTransferModel={toggleTransferModel} data={patientSlotList?.rows || []} providers={state.providerOptions} />
        <DeletePatient state={state} toggleDeleteModel={closeModals} />
    </>)
}

const ColorCodeLabel = ({ item }) => (
    <div className='d-flex gap-10 align-items-center'>
        {item.colorCode &&
            <div className='color-dot' style={{ background: item.colorCode, height: "12px", width: "12px" }} />}
        {item.code}
    </div>)

const getPatientName = (name1, name2, name3) =>
    [name1, name2, name3].filter(i => i).join(", ")