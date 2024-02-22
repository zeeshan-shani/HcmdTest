import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button } from 'react-bootstrap'
import ModalReactstrap from 'Components/Modals/Modal'
import { CONST } from 'utils/constants'
import moment from 'moment-timezone'
// import Switch from 'antd/lib/switch'
import { NewPatientScheduler } from './NewPatientSchedule'
import { AttendeeProvider } from './AttendeeProvider'
import ConsultancyProvider from './ConsultancyProvider'
import NextofKin from './NextOfKin'
import HCMDProvider from './HCMDProvider'
import PatientForm from './PatientForm'
import { TakeConfirmation } from 'Components/components'
import patientService from 'services/APIs/services/patientService'
import patientslotService from 'services/APIs/services/patientslotService'
import { showError, showSuccess } from 'utils/package_config/toast'
import { generatePayload } from 'redux/common'
import ErrorBoundary from 'Components/ErrorBoundry'

export const defaultState = {
    patientError: null,
    provider: null,
    facility: null,
    location: null,
    patientData: {},
    consultancyProvider: [],
    facilityOptions: [],
    HCMDProvider: [],
    nextOfKin: [],
    scheduleInfo: {
        roomNumber: null,
        duration: 15,
        note: '',
        start: moment().toDate(),
        // end: moment().add(15, 'minute').toDate(),
        appointmentType: CONST.APPOINTMENT_TYPE.PATIENT.value,
    },
    isPatientloading: false,
    isNewPatient: true
}
const getUpdateState = ({ defaultState, updateData }) => {
    const { facilityInfo, patientAssigns, patientSlots, ...patientData } = updateData;
    const patientSlot = (updateData.patientSlots && updateData.patientSlots[0]) || null
    const facility = patientSlot?.facilitySlotInfo ? { id: patientSlot?.facilitySlotInfo.id, value: patientSlot?.facilitySlotInfo, label: patientSlot?.facilitySlotInfo.name } : null;
    const HCMDProvider = patientAssigns
        .filter(item => (item.type === CONST.PROVIDER_TYPE.HCMD_PROVIDER))
        .map(i => ({ ...i.usersPatient, designation: i.usersPatient.facilityAssigns.find(i => i?.facility?.id === facility?.id)?.desiInfo || "" }));
    const consultancyProvider = patientAssigns.filter(item => (item.type === CONST.PROVIDER_TYPE.CONSULTANCY_PROVIDER)).map(i => i.usersPatient);
    const attendee = patientAssigns.find(item => (item.type === CONST.PROVIDER_TYPE.ATTENDEE))?.usersPatient || null;
    const provider = attendee ? { label: attendee.name, value: attendee } : null;
    const scheduleInfo = {
        ...defaultState.scheduleInfo,
        roomNumber: patientSlot?.roomNumber ? { label: patientSlot.roomNumber, value: patientSlot.roomNumber } : null,
        start: moment(patientSlot.start).toDate(),
        dischargeDate: patientSlot?.dischargeDate,
        note: patientSlot.title,
        dischargeReason: (patientSlot?.patientDischarge?.reasonType &&
            { label: patientSlot?.patientDischarge?.reasonType, value: patientSlot?.patientDischarge?.reasonType }) || [],
        reason: patientSlot?.patientDischarge?.reason || "",
    }
    return {
        ...defaultState, patientData: { ...patientData, patientSlot }, facility, HCMDProvider, consultancyProvider, provider, scheduleInfo, isNewPatient: false
    };
}
export default function AddNewPatient({ onCancel, onSubmit, updateData }) {
    const [state, setState] = useState(updateData ? getUpdateState({ defaultState, updateData }) : defaultState);
    const patientDataRef = useRef();
    const attendeeRef = useRef();

    useEffect(() => {
        if (updateData?.id) {
            (async () => {
                let payload = await generatePayload({
                    rest: { id: updateData.id },
                    options: { populate: ["patientGuardians"] },
                    findOne: true
                })
                const data = await patientService.list({ payload });
                if (data?.status === 1)
                    setState(prev => ({ ...prev, nextOfKin: data.data.patientGuardians || [] }))
            })();
        }
    }, [updateData?.id]);

    const isDischarge = useMemo(() => {
        const [slot] = updateData?.patientSlots || [];
        return Boolean(slot && slot.discharge && slot.patientDischarge)
    }, [updateData?.patientSlots]);

    // TODO
    // useEffect(() => {
    //     (async () => {
    //         if (!state.isNewPatient) {
    //             const payload = await generatePayload({
    //                 rest: { id: state.patientData.id },
    //                 options: { "populate": ["patientAssignFacility", "patientGuardians"] },
    //                 findOne: true
    //             });
    //             const { data } = await .post("/patient/list", payload)
    //             if (data.status) {
    //                 let HCMDProvider = [], consultancyProvider = [], nextOfKin = [];
    //                 if (data.data.hasOwnProperty("patientAssigns")) {
    //                     HCMDProvider = data.data.patientAssigns
    //                         .filter(i => i.type === CONST.PROVIDER_TYPE.HCMD_PROVIDER)
    //                         .map(i => ({ ...i.usersPatient, designation: i.usersPatient.facilityAssigns.find(i => i?.facility?.id === state.facility?.id)?.desiInfo || "" }));
    //                     consultancyProvider = data.data.patientAssigns.filter(i => i.type === CONST.PROVIDER_TYPE.CONSULTANCY_PROVIDER).map(i => i.usersPatient);
    //                     nextOfKin = data.data.patientGuardians;
    //                 }
    //                 setState(prev => ({
    //                     ...prev,
    //                     HCMDProvider, consultancyProvider, nextOfKin
    //                 }))
    //             }
    //         }
    //     })();
    // }, [state.isNewPatient, state.patientData?.id, state.facility?.id]);

    const onSubmitHandler = useCallback(async () => {
        if (!state.patientData.lastName) {
            patientDataRef.current?.scrollIntoView({ behavior: "smooth" });
            return showError("Please fill patient data");
        }
        if (!state.facility) { //  || !state.provider
            attendeeRef.current?.scrollIntoView({ behavior: "smooth" });
            if (!state.facility) return showError("Please assign facility");
            // if (!state.provider) return showError("Please assign provider");
        }
        let payload = {
            patientInfo: state.isNewPatient ? { ...state.patientData, firstName: state.patientData.firstName } : { ...state.patientData, id: state.patientData.id },
            scheduleInfo: {
                ...state.scheduleInfo,
                roomNumber: state.scheduleInfo?.roomNumber?.value || null,
                isNewRoom: state.scheduleInfo?.roomNumber?.isNew,
            },
            // patientAssigns: state?.provider ? [{ label: state?.provider?.value?.name, value: state?.provider?.value?.id }] : null,
            patientAssigns: state?.provider ? [{
                type: CONST.PROVIDER_TYPE.ATTENDEE,
                value: state?.provider?.value?.id,
                name: state?.provider?.isNew ? state?.provider?.value : undefined,
                isNew: state?.provider?.isNew || undefined,
            }] : [],
            isPatientExist: !state.isNewPatient,
            isDischarge
        };
        if (payload.scheduleInfo.dischargeReason) {
            payload.scheduleInfo.reasonType = payload.scheduleInfo.dischargeReason.value;
            delete payload.scheduleInfo.dischargeReason;
        }
        if (!!state.nextOfKin?.length) payload.nextOfKin = state.nextOfKin
        if (!!state.HCMDProvider?.length) payload.patientAssigns = [
            ...payload.patientAssigns,
            ...state.HCMDProvider.map(item => ({ value: item.id, type: CONST.PROVIDER_TYPE.HCMD_PROVIDER, designationId: item.designation?.id }))
        ];
        if (!!state.consultancyProvider?.length) payload.patientAssigns = [
            ...payload.patientAssigns,
            ...state.consultancyProvider.map(item => ({ value: item.id, type: CONST.PROVIDER_TYPE.CONSULTANCY_PROVIDER }))
        ];
        if (updateData) payload.scheduleInfo.id = (updateData.patientSlots && updateData.patientSlots[0].id) || undefined;
        payload.scheduleInfo.facilityId = state.facility.id || undefined;
        payload.isUpdate = Boolean(updateData);
        const data = await patientService.createPatientSchedule({ payload });
        if (data?.status === 1) {
            onSubmit();
            onCancel();
        } else if (data.status === 3) {
            TakeConfirmation({
                title: <div dangerouslySetInnerHTML={{ __html: data.message }} />,
                content: "",
                onDone: async () => {
                    await patientslotService.dischargeUpdate({ payload: data.patientInfo });
                    showSuccess("Patient discharge successfully");
                },
                onCancel: () => attendeeRef.current?.scrollIntoView({ behavior: "smooth" }),
                okText: "Discharge",
                cancelText: "Select Room"
            });
        } else if (data.status === 2) {
            showError(<div dangerouslySetInnerHTML={{ __html: data.message }} />);
        }
    }, [state, onSubmit, onCancel, updateData, isDischarge]);

    return (
        <ModalReactstrap
            header={updateData ? `Edit Schedule for patient "${updateData.lastName}"` : "Schedule New Patient"}
            Modalprops={{ className: 'text-color' }}
            show={true}
            toggle={() => onCancel()}
            size='lg'
            bodyProps={{ style: { overflow: "auto", maxHeight: window.innerWidth < 767 ? "calc(100vh - 100px)" : "calc(100vh - 180px)" } }}
            body={
                <ErrorBoundary>
                    <div ref={attendeeRef} />
                    <AttendeeProvider setState={setState} state={state} updateData={updateData} isDischarge={isDischarge} />
                    <div ref={patientDataRef} />
                    <PatientForm setState={setState} state={state} updateData={updateData} />
                    <ConsultancyProvider setMainState={setState} mainState={state} />
                    <HCMDProvider setMainState={setState} mainState={state} />
                    <NextofKin setMainState={setState} mainState={state} />
                    <NewPatientScheduler setState={setState} state={state} updateData={updateData} isDischarge={isDischarge} />
                </ErrorBoundary>}
            footer={<>
                <div className={`d-flex gap-10 align-items-center`}>
                    {updateData && updateData?.patientSlots[0]?.discharge &&
                        <div>
                            <Badge pill bg="danger" className='text-white font-weight-normal'>
                                Discharged
                            </Badge>
                        </div>}
                    <Button variant='secondary' onClick={() => onCancel()}>{'Cancel'}</Button>
                    <Button onClick={onSubmitHandler}>{updateData ? 'Update' : 'Submit'}</Button>
                </div>
            </>}
        />
    )
}