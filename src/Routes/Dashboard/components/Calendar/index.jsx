// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useSelector } from 'react-redux/es/hooks/useSelector';
// import moment from "moment";
// import CalendarHeader from "./calenderData/CalendarHeader";
// import CalenderWrapper from "./calenderData/calender.style";
// import EventDialog from "./calenderData/EventDialog";
// import ErrorBoundary from "Components/ErrorBoundry";
// import { generatePayload, LazyComponent, toastPromise } from "redux/common";
// import { toast } from "react-hot-toast";
// import AppoinmentModal from "Routes/SuperAdmin/components/AppoinmentCalendar/AppoinmentModal";

// import { Calendar as BigCalendar, momentLocalizer, Views } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
// import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
// import { CONST } from "utils/constants";
// import { TakeConfirmation } from "Components/components";

// const localizer = momentLocalizer(moment);
// const DragAndDropCalendar = withDragAndDrop(BigCalendar);
// let allViews = Object.keys(Views).map(k => Views[k]);

// const COLORS = {
//     AVAILABLE: '#defadf',
//     PATIENT: CONST.APPOINTMENT_TYPE.PATIENT.color,
//     FAMILY: CONST.APPOINTMENT_TYPE.FAMILY.color,
// }

// export default function Calendar({ userdata, type = "provider" }) {
//     const { user } = useSelector(state => state.user);
//     const [state, setState] = useState({
//         calendarView: Views.DAY
//     })
//     const [userDetails, setUserDetails] = useState(type === "provider" ? user : userdata);
//     const [modal, setModal] = useState(false);
//     const [action, setAction] = useState("add");
//     const [modalEvent, setmodalEvent] = useState(null);
//     const [date, setDate] = useState(new Date());
//     const [events, setEvents] = useState([]);

//     useEffect(() => {
//         if (userdata) setUserDetails(userdata);
//     }, [userdata]);

//     useEffect(() => {
//         if (!modal) setmodalEvent(null);
//     }, [modal]);

//     useEffect(() => {
//         if (modalEvent) setModal(true);
//     }, [modalEvent]);

//     // const { isLoading, error, data, isFetching } = useQuery({
//     //     queryKey: ["getCalendarSlots"],
//     //     queryFn: async () => {
//     //         const payload = await generatePayload({
//     //             rest: {
//     //                 userId: user.id, dateFilter: {
//     //                     key: "start",
//     //                     month: 2,
//     //                     year: 2023
//     //                 }
//     //             }
//     //         })
//     //         const { data } = await .post('/providerslot/list', payload);
//     //         return data?.status ? data.data : [];
//     //     }
//     // });
//     // if (isLoading) return "Loading...";

//     // if (error) return "An error has occurred: " + error.message;

//     const getEvents = useCallback(async () => {
//         await toastPromise({
//             func: async (resolve, reject) => {
//                 try {
//                     const payload = await generatePayload({
//                         rest: {
//                             userId: userDetails ? userDetails.id : undefined,
//                             dateFilter: { key: "start", month: date.getMonth(), year: date.getFullYear() }
//                         },
//                         options: {
//                             populate: ['providerSlotInfo']
//                         }
//                     })
//                     const { data } = await .post('/providerslot/list', payload);
//                     if (data?.status === 1) setEvents([...data.data]);
//                     resolve(1);
//                 } catch (error) {
//                     console.error(error);
//                     reject(0)
//                 }
//             }, loading: 'Fetching slots', error: 'Could not load slots', success: 'Successfully fetched.'
//         })
//     }, [date, userDetails]);

//     useEffect(() => {
//         getEvents()
//     }, [date, userDetails, getEvents]);

//     // const hasPermission = useCallback(() => {
//     //     if (type === "provider" || (type === "admin" && (userDetails.id === user.id))) return 1;
//     //     showError(<div>You don't have permission for apply changes to <strong>{userDetails.name}</strong> Schedule</div>);
//     //     return 0;
//     // }, [type, user.id, userDetails]);

//     const updateEvent = useCallback(async (body) => {
//         let payload = {}
//         if (body.id) payload.id = body.id
//         if (body.patientId) payload.patientId = body.patientId
//         if (body.providerId) payload.providerId = body.providerId
//         if (body.providerSlotId) payload.providerSlotId = body.providerSlotId
//         if (body.start) payload.start = body.start
//         if (body.end) payload.end = body.end
//         if (body.hasOwnProperty('cstmSlotId')) {
//             payload.id = body.cstmSlotId
//             const { data } = await .post('/patientslot/update', payload);
//             if (data?.status === 1) getEvents();
//             if (data?.status === 2) showError(data.message);
//             return;
//         }
//         if (body.title) payload.title = body.title
//         const { data } = await .post('/providerslot/update', payload);
//         if (data?.status === 1) getEvents();
//         if (data?.status === 2) showError(data.message);
//     }, [getEvents]);

//     const moveEvent = ({ event, start, end }) => {
//         // if (!hasPermission()) return;
//         updateEvent({ ...event, start, end });
//     };

//     const resizeEvent = ({ event, start, end }) => {
//         // if (!hasPermission()) return;
//         updateEvent({ ...event, start, end });
//     };

//     const onViewChange = (view) => setState(prev => ({ ...prev, calendarView: view }));
//     const handleNavigate = (e) => setDate(moment(e).toDate());
//     const eventCloseHandler = () => setModal(false);

//     const eventDeleteHandler = useCallback(async (body) => {
//         // if (!hasPermission()) return;
//         TakeConfirmation({
//             title: `Are you sure about to delete availability slot?`,
//             content: !!body?.patientSlots?.length ? `There is ${body?.patientSlots?.length} patient slots found. That can't be recovered once deleted.` : undefined,
//             onDone: async () => {
//                 const { data } = await .delete('/providerslot/delete/' + body.id);
//                 setEvents(prev => prev.filter(event => event.id !== parseInt(data.data)));
//                 eventCloseHandler();
//             }
//         });
//     }, []);

//     const onToggle = useCallback(() => {
//         getEvents();
//         setModal(prev => !prev);
//         setmodalEvent(null);
//     }, [getEvents]);

//     const BackgroundEvents = useMemo(() => {
//         const variable = events.map(i => {
//             if (i.hasOwnProperty('start')) i.start = new Date(i.start);
//             if (i.hasOwnProperty('end')) i.end = new Date(i.end);
//             return [i];
//         });
//         return variable.flatMap(i => i);
//     }, [events]);

//     const CalendarEvents = useMemo(() => {
//         const variable = events.map(i => {
//             let innerSlots = [];
//             if (i?.patientSlots && !!i.patientSlots.length) {
//                 innerSlots = i.patientSlots.map((slot) => {
//                     const patientName = `Patient: ${slot.patientInfo.firstName} ${slot.patientInfo.lastName ? slot.patientInfo.lastName : ''}`;
//                     const patientLocation = slot?.patientInfo?.location && `\nLocation: ${slot.patientInfo.location}`;
//                     return {
//                         ...slot,
//                         id: 'patient-' + slot.id,
//                         title: `${patientName} ${patientLocation ? patientLocation : ''} ${slot.title ? `\nNote: ${slot.title}` : ''}`,
//                         start: new Date(slot.start),
//                         end: new Date(slot.end),
//                         cstmSlotId: slot.id,
//                         cstmSlotDetails: i,
//                     }
//                 })
//             }
//             return [...innerSlots];
//         });
//         return variable.flatMap(i => i);
//     }, [events]);

//     const getEventsforProvider = useCallback((eventType) => {
//         if (eventType === "background") return []
//         const events = state.calendarView === Views.MONTH ? BackgroundEvents : [...BackgroundEvents, ...CalendarEvents];
//         return events || []
//     }, [BackgroundEvents, CalendarEvents, state.calendarView]);

//     const getEventsforAdmin = useCallback((eventType) => {
//         if (eventType === "background") return BackgroundEvents;
//         const events = state.calendarView === Views.MONTH ? BackgroundEvents : CalendarEvents;
//         return events || []
//     }, [BackgroundEvents, CalendarEvents, state.calendarView]);

//     const slotGroupPropGetter = useCallback(
//         (data) => ({ style: { minHeight: 120 } }), []
//     )

//     try {
//         return (
//             <ErrorBoundary>
//                 <LazyComponent>
//                     <div className='dashboard-date-logs p-2 card'>
//                         <CalenderWrapper className="calender-app">
//                             {/* <PageTitle
//                                 title="sidebar.calender"
//                                 className="plr-15"
//                                 breadCrumb={[{name: "sidebar.app"},{name: "sidebar.calender"}]}
//                             /> */}
//                             <div className="roe-card-style mt-15 mb-30 mlr-15 mobile-spacing-class no-box-container">
//                                 <div
//                                     className="roe-card-body pb-15 plr-0"
//                                     style={{ backgroundColor: "white", borderRadius: "6px" }}
//                                 >
//                                     <DragAndDropCalendar
//                                         className="flex flex-1 container"
//                                         selectable
//                                         resizable
//                                         localizer={localizer}
//                                         events={type === "admin" ? getEventsforAdmin('event') : getEventsforProvider('event')}
//                                         backgroundEvents={type === "admin" ? getEventsforAdmin('background') : getEventsforProvider('background')}
//                                         // events={ScheduledEvents}
//                                         // slotPropGetter={type === "admin" && state.calendarView === Views.DAY ?
//                                         //     slotPropGetter : () => { }}
//                                         onEventDrop={moveEvent}
//                                         onEventResize={resizeEvent}
//                                         defaultView={Views.DAY}
//                                         defaultDate={new Date()}
//                                         startAccessor="start"
//                                         endAccessor="end"
//                                         // step={10}
//                                         views={allViews}
//                                         showMultiDayTimes
//                                         components={{
//                                             toolbar: CalendarHeader,
//                                             // event: MyEvent
//                                             // eventWrapper: MyEventWrapper
//                                         }}
//                                         step={15}
//                                         timeslots={4}
//                                         onView={onViewChange}
//                                         onNavigate={handleNavigate}
//                                         onSelectEvent={event => {
//                                             setAction("edit");
//                                             setmodalEvent(event.hasOwnProperty('cstmSlotId') ? { ...event, ...event.cstmSlotDetails } : event);
//                                         }}
//                                         onSelectSlot={slotInfo => {
//                                             if (type === "admin") {
//                                                 // showError('Please ask provider to schedule availability.')
//                                                 return;
//                                             }
//                                             setAction("add");
//                                             setmodalEvent(slotInfo);
//                                         }}
//                                         slotGroupPropGetter={slotGroupPropGetter}
//                                         eventPropGetter={(event, start, end, isSelected) => {
//                                             const newStyles = getEventStyles({ event, isSelected })
//                                             return {
//                                                 style: {
//                                                     color: 'black',
//                                                     backgroundColor: 'white',
//                                                     borderRadius: '6px',
//                                                     opacity: 1,
//                                                     display: 'block',
//                                                     ...newStyles
//                                                 }
//                                             };
//                                         }}
//                                     />
//                                 </div>
//                             </div>
//                             {(type === 'admin' || (modal && modalEvent?.hasOwnProperty('cstmSlotId'))) ?
//                                 <AppoinmentModal
//                                     providerData={userDetails}
//                                     modal={modal}
//                                     toggleModal={onToggle}
//                                     event={modalEvent}
//                                     action={action}
//                                     eventCloseHandler={eventCloseHandler}
//                                     eventDeleteHandler={eventDeleteHandler}
//                                     setEvents={setEvents}
//                                     updateEvent={updateEvent}
//                                     className="text-color"
//                                 />
//                                 :
//                                 <EventDialog
//                                     modal={modal}
//                                     toggleModal={onToggle}
//                                     event={modalEvent}
//                                     action={action}
//                                     eventCloseHandler={eventCloseHandler}
//                                     eventDeleteHandler={eventDeleteHandler}
//                                     setEvents={setEvents}
//                                     updateEvent={updateEvent}
//                                     className="text-color"
//                                 />}
//                         </CalenderWrapper>
//                     </div>
//                 </LazyComponent>
//             </ErrorBoundary>
//         );
//     } catch (error) {
//         console.error(error);
//     }
// };

// const getEventStyles = ({ event, isSelected }) => {
//     if (event.hasOwnProperty('patientSlots')) return { backgroundColor: COLORS.AVAILABLE, zIndex: 1 };
//     if (event.hasOwnProperty('appointmentType')) {
//         const types = event?.appointmentType;
//         if (types === CONST.APPOINTMENT_TYPE.PATIENT.value) return { backgroundColor: COLORS.PATIENT, opacity: 1, zIndex: 2 };
//         if (types === CONST.APPOINTMENT_TYPE.FAMILY.value) return { backgroundColor: COLORS.FAMILY, opacity: 1, zIndex: 2 };
//     }
//     return { backgroundColor: '#fff' };
// }
