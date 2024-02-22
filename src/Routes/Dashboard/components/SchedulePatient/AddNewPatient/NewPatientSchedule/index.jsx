import { useCallback } from "react";
import Divider from 'antd/lib/divider'
import ReactDatePicker from "react-datepicker";
import moment from 'moment-timezone'
import { Col, Row } from "react-bootstrap";
import CreatableSelect from 'react-select/creatable';
import Input from "Components/FormBuilder/components/Input";
import dischargeReasonService from "services/APIs/services/dischargeReasonService";
import { useQuery } from "@tanstack/react-query";
import { CONST } from "utils/constants";

export const NewPatientScheduler = ({ state, setState, isDischarge, updateData }) => {
    const { scheduleInfo } = state;
    // const [dischargeReasons, setDischargeReasons] = useState([]);
    // const durationTime = useDebounce(scheduleInfo.duration, 1000);

    // const TimeSlotDuartion = useMemo(() => getTimeFromMins(durationTime), [durationTime]);
    const setStartDate = useCallback((date) => {
        // const endDate = moment(date).add(durr ? durr : durationTime, 'minute').toDate();
        let payload = { start: date, dateError: null }
        payload.dischargeDate = moment(date).isBefore(moment().format("MM/DD/YY")) ? moment().format() : null;
        setState(prev => ({ ...prev, scheduleInfo: { ...prev.scheduleInfo, ...payload } }));
    }, [setState]);

    const setDischargeTime = useCallback((date) => {
        let payload = {}
        payload.dischargeDate = date ? moment(date).format() : null;
        setState(prev => ({ ...prev, scheduleInfo: { ...prev.scheduleInfo, ...payload } }));
    }, [setState]);

    // const setEndDate = useCallback((date) => {
    //     const startDate = moment(date).subtract(durationTime, 'minute').toDate();
    //     setState(prev => ({ ...prev, scheduleInfo: { ...prev.scheduleInfo, end: date, start: startDate, dateError: null } }));
    // }, [durationTime, setState]);

    // Query hook to fetch data based on queryString & caching
    const { data: dischargeReasons } = useQuery({
        queryKey: ["/deschargeReason/list"],
        queryFn: async () => {
            const data = await dischargeReasonService.list({});
            return (data.data.map(item => ({ id: item.id, label: item.title, value: item.title })) || []);
        },
        keepPreviousData: false,
        refetchOnWindowFocus: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
        enabled: Boolean(scheduleInfo?.dischargeDate)
    });

    // useEffect(() => {
    //     (async () => {
    //         if (!scheduleInfo.dischargeDate) return;
    //         const data = await dischargeReasonService.list({});
    //         setDischargeReasons(data.data.map(item => ({ id: item.id, label: item.title, value: item.title })) || []);
    //     })();
    // }, [scheduleInfo.dischargeDate]);

    return (<>
        <Divider className='text-color mt-4' style={{ borderColor: 'grey' }} orientation='left'>Patient Schedule</Divider>
        {/* <Row>
            <Col md={6} className="form-group">
                <label htmlFor="duration" className="mb-1">Duration (in minutes):</label>
                <input type='number'
                    className={`form-control`}
                    step={15}
                    min={15}
                    defaultValue={scheduleInfo.duration || 15}
                    onChange={(e) => {
                        setState(prev => ({ ...prev, scheduleInfo: { ...prev.scheduleInfo, duration: parseInt(e.target.value) > 0 && parseInt(e.target.value) <= 1440 ? parseInt(e.target.value) : 15 } }))
                        setStartDate(scheduleInfo.start, e.target.value);
                    }}
                />
                <p className={`mb-1 ${TimeSlotDuartion.status ? 'text-color' : 'text-danger'}`}>{TimeSlotDuartion.message}</p>
            </Col>
        </Row> */}
        <Row>
            <Col md={6}>
                <label>Visit Date</label>
                <ReactDatePicker
                    onChange={(date) => setStartDate(date)}
                    selected={scheduleInfo?.start ? moment(scheduleInfo.start).toDate() : null}
                    showTimeSelect
                    // minTime={moment(event.start).toDate()}
                    // maxTime={moment(event.end).toDate()}
                    popperPlacement="auto"
                    dateFormat="MM/dd/yy h:mm aa"
                    // dateFormat="MM/dd/yy"
                    placeholderText="Visit Date"
                    // showTimeSelectOnly
                    className={`form-control search ${scheduleInfo.dateError ? 'border-danger' : ''}`}
                    wrapperClassName="form-group"
                    calendarClassName="min-width-328"
                    timeIntervals={15}
                    timeCaption="Time"
                    autoFocus={scheduleInfo?.dateError}
                    disabled={isDischarge || updateData}
                />
            </Col>
            {scheduleInfo.dischargeDate && <>
                <Col md={6}>
                    <label>Discharge Time</label>
                    <ReactDatePicker
                        onChange={(date) => setDischargeTime(date)}
                        selected={scheduleInfo?.dischargeDate ? moment(scheduleInfo.dischargeDate).toDate() : null}
                        showTimeSelect
                        minDate={moment(scheduleInfo.start).toDate()}
                        maxDate={moment().toDate()}
                        // maxTime={moment(event.end).toDate()}
                        popperPlacement="auto"
                        dateFormat="MM/dd/yy h:mm aa"
                        // dateFormat="MM/dd/yy"
                        placeholderText="Discharge Date"
                        // showTimeSelectOnly
                        className={`form-control search ${scheduleInfo.dateError ? 'border-danger' : ''}`}
                        wrapperClassName="form-group"
                        calendarClassName="min-width-328"
                        timeIntervals={15}
                        timeCaption="Time"
                        autoFocus={scheduleInfo?.dateError}
                        disabled={isDischarge}
                        isClearable={!isDischarge}
                    />
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <label htmlFor='dischargeReason'>Discharge reason</label>
                        <CreatableSelect
                            name={"dischargeReason"}
                            value={[state.scheduleInfo.dischargeReason]}
                            onChange={(data) => {
                                const reasonId = !data?.__isNew__ ? dischargeReasons.find((i) => i.value === data.value)?.id : undefined;
                                setState(prev => ({
                                    ...prev, scheduleInfo: {
                                        ...prev.scheduleInfo,
                                        reasonId,
                                        reasonType: data.value,
                                        dischargeReason: data ? { label: data.label, value: data.value, isNew: data?.__isNew__ } : null
                                    }
                                }))
                            }}
                            options={dischargeReasons ? dischargeReasons : []}
                            menuPlacement='auto'
                            className="basic-multi-select issue-multi-select_user-dropdown input-border"
                            classNamePrefix="select"
                            placeholder='Reason for discharge'
                            isClearable
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <Input
                            name="reason"
                            Label="Reason"
                            placeholder="Reason"
                            handleChange={(e) =>
                                setState(prev => ({
                                    ...prev, scheduleInfo: { ...prev.scheduleInfo, reason: e.target.value }
                                }))}
                            value={scheduleInfo?.reason || ""}
                        />
                    </div>
                </Col>
            </>}
            {/* <Col md={6}>
                <label>End Time</label>
                <ReactDatePicker
                    selected={moment(scheduleInfo?.end ? scheduleInfo.end : null).toDate()}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    // minTime={moment(event.start).toDate()}
                    // maxTime={moment(event.end).toDate()}
                    placeholderText="End Time"
                    popperPlacement="auto"
                    dateFormat="MM/dd/yy h:mm aa"
                    calendarClassName="min-width-328"
                    // showTimeSelectOnly
                    className={`form-control search ${scheduleInfo.dateError ? 'border-danger' : ''}`}
                    wrapperClassName="form-group"
                    timeIntervals={15}
                    timeCaption="Time"
                    excludeTimes={[
                        moment(scheduleInfo.start).toDate()
                    ]}
                />
            </Col> */}
        </Row>
        {scheduleInfo?.dateError && <p className="text-danger">{scheduleInfo.dateError}</p>}
        <Row>
            <Col>
                <div className="form-group w-100">
                    <label htmlFor="slotNote" className="mb-1">Note:</label>
                    <textarea
                        type='text'
                        rows={3}
                        placeholder="Type Patient notes here"
                        className={`form-control`}
                        value={scheduleInfo.note || ''}
                        onChange={e => setState(prev => ({ ...prev, scheduleInfo: { ...prev.scheduleInfo, note: e.target.value } }))}
                    />
                </div>
            </Col>
        </Row>
    </>)
}