import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment-timezone';
import ModalReactstrap from 'Components/Modals/Modal';
import { updateState } from 'redux/common';
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';
import { AssignToPatients } from 'Components/Dropdowns/AssignToPatients';
import ReactDatePicker from 'react-datepicker';
import ReactSelect from 'react-select';
import { CONST } from 'utils/constants';
import useDebounce from 'services/hooks/useDebounce';
import patientslotService from 'services/APIs/services/patientslotService';

export default function Scheduler({ mainState, setMainState, updateData, providerData, event, mode = 'create', onSubmit, AllocatedEvents = [] }) {
    const [patient, setPatient] = useState({
        patientId: updateData?.patientId ? updateData.patientId : 0,
        start: updateData?.start ? updateData.start : moment(updateData?.start ? updateData.start : event.start).toDate(),
        end: updateData?.end ? updateData.end : moment(updateData?.end ? updateData.end : event.end).toDate(),
        note: updateData?.title ? updateData.title : '',
        appointmentType: updateData?.appointmentType ? updateData.appointmentType : CONST.APPOINTMENT_TYPE.PATIENT.value,
        loading: false, dateError: null, patientError: null,
        isTimeChange: false
    });
    const [state, setState] = useState({
        duration: (updateData.start && updateData.end) && Math.round(moment.duration(moment(updateData.end).diff(moment(updateData.start))).asMinutes()) ?
            Math.round(moment.duration(moment(updateData.end).diff(moment(updateData.start))).asMinutes()) : 15,
        slots: []
    });
    const durationTime = useDebounce(state.duration, 1000);

    useEffect(() => {
        const availability = allocateTime(durationTime, event.start, event.end, AllocatedEvents.sort((a, b) => {
            if (new Date(a[0]) > new Date(b[0])) return 1;
            if (new Date(a[0]) < new Date(b[0])) return -1;
            return 0;
        }));
        if (availability && !!availability.length) {
            if (!updateData || (patient.isTimeChange))
                setPatient(prev => ({ ...prev, start: moment(availability[0][0]).toDate(), end: moment(availability[0][0]).add(durationTime, 'minute').toDate() }));
        }
        setState(prev => ({ ...prev, slots: availability }));
    }, [durationTime, event.start, event.end, AllocatedEvents, updateData, patient.isTimeChange, event]);

    const startRef = useRef(null);

    const setStartDate = useCallback((date) => {
        const endDate = moment(date).add(durationTime, 'minute').toDate();
        setPatient(prev => ({ ...prev, start: date, end: endDate, dateError: null })); //, isTimeChange: true
    }, [durationTime]);

    const setEndDate = useCallback((date) => {
        const startDate = moment(date).subtract(durationTime, 'minute').toDate();
        setPatient(prev => ({ ...prev, end: date, start: startDate, dateError: null })); //, isTimeChange: true
    }, [durationTime]);

    const onSubmitSlot = useCallback(async () => {
        try {
            if (!patient.patientId) {
                setPatient(prev => ({ ...prev, patientError: "Please Select Patient " }));
                return;
            }
            setPatient(prev => ({ ...prev, loading: true }));
            if (mode === 'create') {
                const payload = {
                    title: patient.note || '',
                    start: patient.start || '',
                    end: patient.end || '',
                    appointmentType: patient.appointmentType || CONST.APPOINTMENT_TYPE.PATIENT.value,
                    patientId: patient.patientId,
                    providerId: providerData.id,
                    providerSlotId: event.id
                }
                const data = await patientslotService.create({ payload });
                if (data?.status === 1) onSubmit();
                else if (data?.status === 2) {
                    setPatient(prev => ({ ...prev, loading: false, dateError: data?.message }));
                    return;
                }
                setPatient(prev => ({ ...prev, loading: false }));
            } else if (mode === "edit") {
                const payload = {
                    title: patient.note || '',
                    start: patient.start || '',
                    end: patient.end || '',
                    appointmentType: patient.appointmentType || CONST.APPOINTMENT_TYPE.PATIENT.value,
                    id: updateData.id,
                    providerSlotId: updateData.providerSlotId,
                    patientId: patient.patientId,
                }
                const data = await patientslotService.update({ payload });
                if (data?.status === 1) onSubmit();
                else if (data?.status === 2) {
                    setPatient(prev => ({ ...prev, loading: false, dateError: data?.message }));
                    return;
                }
                setPatient(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error(error);
        }
    }, [event.id, mode, onSubmit, patient.appointmentType, patient.end, patient.note, patient.patientId, patient.start,
    providerData.id, updateData.id, updateData.providerSlotId]);

    const TimeSlotDuartion = useMemo(() => getTimeFromMins(durationTime), [durationTime]);
    return (<>
        <ModalReactstrap
            show={Boolean(mainState.create || mainState.update)}
            toggle={() => updateState(setMainState, { create: false, update: false })}
            Modalprops={{ className: 'text-color' }}
            header={`${mode === 'edit' ? 'Edit' : 'Create'} Schedule`}
            body={<>
                <Row>
                    <Col>
                        <AssignToPatients
                            providerId={providerData.id}
                            assignMembers={updateData ? { id: updateData.patientInfo.id, value: updateData.patientInfo.id, label: updateData.patientInfo.firstName + ' ' + updateData.patientInfo.firstName } : undefined}
                            setAssignMem={(data) => setPatient(prev => ({ ...prev, patientId: data.value, patientError: null }))}
                            placeholder={'Type patient name here'}
                            autoFocus={true}
                            className={`${patient.patientError ? 'select_border_danger' : ''}`}
                            label={true} />
                        <p className="mb-1 text-danger">{patient.patientError}</p>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <div className="form-group">
                            <label htmlFor="duration" className="mb-1">Duration (in minutes):</label>
                            <input type='number'
                                className={`form-control`}
                                step={15}
                                min={15}
                                defaultValue={state.duration || 15}
                                onChange={(e) => {
                                    setState(prev => ({ ...prev, duration: parseInt(e.target.value) > 0 && parseInt(e.target.value) <= 1440 ? parseInt(e.target.value) : 15 }))
                                    setPatient(prev => ({ ...prev, isTimeChange: true }))
                                }}
                            />
                            <p className={`mb-1 ${TimeSlotDuartion.status ? 'text-secondary' : 'text-danger'}`}>{TimeSlotDuartion.message}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className='form-group'>
                            <label htmlFor="appoinmentType" className="mb-1">Appoinment type:</label>
                            <ReactSelect
                                name={"patientSlotType"}
                                options={Object.values(CONST.APPOINTMENT_TYPE).map((i, id) => ({ id, value: i.value, label: i.value }))}
                                defaultValue={patient.appointmentType ? [{ id: 1, value: patient.appointmentType, label: patient.appointmentType }] : null}
                                onChange={(data) => setPatient(prev => ({ ...prev, appointmentType: data.value }))}
                                menuPlacement='auto'
                                className="basic-multi-select issue-multi-select_user-dropdown input-border"
                                classNamePrefix="select"
                                placeholder='Appoinment Type'
                            // styles={{ minWidth: '180px' }}
                            />
                        </div>
                    </Col>
                </Row>
                {(!updateData || (patient.isTimeChange)) &&
                    <Row>
                        <Col className='d-flex justify-content-start align-items-center mb-1'>
                            <label className='mb-0 mr-1'>Available Slots:</label>
                            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                                {!!state.slots.length ?
                                    state.slots.map((item, index) => (
                                        <Button key={index} size='sm' onClick={() => setStartDate(moment(item[0]).toDate())}>Slot {index + 1}</Button>
                                    ))
                                    :
                                    <Button size='sm' disabled>No Slot Available</Button>
                                }
                            </ButtonGroup>
                        </Col>
                    </Row>}
                <Row>
                    <Col md={6}>
                        <label>Start Time</label>
                        <ReactDatePicker
                            ref={startRef}
                            onChange={(date) => setStartDate(date)}
                            selected={moment(patient?.start ? patient.start : event.start).toDate()}
                            showTimeSelect
                            minDate={moment(event.start).toDate()}
                            maxDate={moment(event.end).toDate()}
                            // minTime={moment(event.start).toDate()}
                            // maxTime={moment(event.end).toDate()}
                            popperPlacement="auto"
                            dateFormat="MM/dd/yy h:mm aa"
                            placeholderText="Start Time"
                            // showTimeSelectOnly
                            className={`form-control search ${patient.dateError ? 'border-danger' : ''}`}
                            wrapperClassName="form-group"
                            calendarClassName="min-width-328"
                            timeIntervals={15}
                            timeCaption="Time"
                            autoFocus={patient?.dateError}
                        />
                    </Col>
                    <Col md={6}>
                        <label>End Time</label>
                        <ReactDatePicker
                            selected={moment(patient?.end ? patient.end : event.end).toDate()}
                            onChange={(date) => setEndDate(date)}
                            showTimeSelect
                            minDate={moment(event.start).toDate()}
                            maxDate={moment(event.end).toDate()}
                            // minTime={moment(event.start).toDate()}
                            // maxTime={moment(event.end).toDate()}
                            placeholderText="End Time"
                            popperPlacement="auto"
                            dateFormat="MM/dd/yy h:mm aa"
                            calendarClassName="min-width-328"
                            // showTimeSelectOnly
                            className={`form-control search ${patient.dateError ? 'border-danger' : ''}`}
                            wrapperClassName="form-group"
                            timeIntervals={15}
                            timeCaption="Time"
                            excludeTimes={[
                                moment(patient.start).toDate()
                            ]}
                        />
                    </Col>
                </Row>
                {patient?.dateError && <p className="text-danger">{patient.dateError}</p>}
                <Row>
                    <Col>
                        <div className="form-group w-100">
                            <label htmlFor="slotNote" className="mb-1">Note:</label>
                            <textarea
                                type='text'
                                rows={3}
                                placeholder="Type Patient notes here"
                                className={`form-control`}
                                value={patient.note || ''}
                                onChange={e => setPatient(prev => ({ ...prev, note: e.target.value }))}
                            />
                        </div>
                    </Col>
                </Row>
            </>
            }
            footer={<>
                <Button variant="secondary" onClick={() => updateState(setMainState, { create: false, update: false })}>Cancel</Button>
                <Button variant="primary" onClick={onSubmitSlot} disabled={patient.loading || (!state?.slots?.length)}>
                    {mode === 'edit' ? (patient.loading ? 'Updating...' : 'Update') : (patient.loading ? 'Creating...' : 'Create')}
                </Button>
            </>}
        />
    </>);
}

function allocateTime(duration, availableStartTime, availableEndTime, events) {
    const availableTimeSlots = [];
    let currentTime = new Date(availableStartTime);
    for (const event of events) {
        const [eventStartTime, eventEndTime] = event.map(timeStr => new Date(timeStr));
        if (currentTime < eventStartTime) {
            const availableTimeSlot = [new Date(currentTime), eventStartTime.getTime() - currentTime.getTime()];
            availableTimeSlots.push(availableTimeSlot);
        }
        currentTime = eventEndTime;
    }
    if (currentTime < new Date(availableEndTime)) {
        const availableTimeSlot = [new Date(currentTime), new Date(availableEndTime).getTime() - currentTime.getTime()];
        availableTimeSlots.push(availableTimeSlot);
    }
    const filteredTimeSlots = availableTimeSlots.filter(timeSlot => timeSlot[1] / 1000 / 60 >= duration);
    return filteredTimeSlots;
}

export function getTimeFromMins(mins = 0) {
    if (mins > 24 * 60 || mins < 0) return ({ status: 0, message: "Value should be ranges between 0 and 1440 (in minutes)." });
    let h = mins / 60 | 0, m = mins % 60 | 0;
    return ({ status: 1, message: `Time: ${moment.utc().hours(h).minutes(m).format(`${h ? 'hh [hr]' : ''} ${m ? 'mm [min]' : ''}`)}` });
}