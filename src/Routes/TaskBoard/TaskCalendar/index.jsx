import React, { useMemo, useState } from 'react'
import ErrorBoundary from 'Components/ErrorBoundry';
import CalenderWrapper from "./calender.style";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from 'moment-timezone';
import { getDueDateObj, LazyComponent } from 'redux/common';
import { Calendar as BigCalendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarHeader from 'Components/Calendar/Header';
import DayEvent from './Events/DayEvent';
import MonthEvent from './Events/MonthEvent';
import WeekEvent from './Events/WeekEvent';
import { dispatch } from 'redux/store';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { isArray } from 'lodash';
import { useSelector } from 'react-redux';
import { CONST } from 'utils/constants';

const DragAndDropCalendar = withDragAndDrop(BigCalendar);
const localizer = momentLocalizer(moment);
let allViews = Object.keys(Views).map(k => Views[k]);
const objectData = [{
    attachments: [],
    chatId: 276,
    comments: [],
    completedBy: null,
    createdAt: "2024-01-24T08:19:54.202Z",
    createdBy: 49,
    description: "heloooooooooooo",
    dueDate: "2024-01-25T07:56:47.000Z",
    id: 978,
    isDeleted: false,
    isDepartment: true,
    isTeam: false,
    label: [],
    messageId: 15064,
    name: "kjhk",
    patient: "",
    status: "pending",
    subject: "",
    subtasks: [],
    taskStatuses: [
      { id: 2037, taskId: 978, userId: 49, status: "pending", createdAt: "2024-01-24T08:19:54.222Z" },
      { id: 2036, taskId: 978, userId: 174, status: "pending", createdAt: "2024-01-24T08:19:54.222Z" }
    ],
    taskmembers: [
      { id: 2059, userId: 174, taskId: 978, chatId: 277, type: "member" },
      { id: 2060, userId: 49, taskId: 978, chatId: 277, type: "member" }
    ],
    type: "routine",
    updatedAt: "2024-01-24T08:19:54.202Z"
  },{
    attachments: [],
    chatId: 277,
    comments: [],
    completedBy: null,
    createdAt: "2024-01-24T08:19:54.202Z",
    createdBy: 49,
    description: "xyzzzzzzzzzzzzzzzzz",
    dueDate: "2024-01-25T07:56:47.000Z",
    id: 978,
    isDeleted: false,
    isDepartment: true,
    isTeam: false,
    label: [],
    messageId: 15064,
    name: "kjhk",
    patient: "",
    status: "pending",
    subject: "",
    subtasks: [],
    taskStatuses: [
      { id: 2037, taskId: 978, userId: 49, status: "pending", createdAt: "2024-01-24T08:19:54.222Z" },
      { id: 2036, taskId: 978, userId: 174, status: "pending", createdAt: "2024-01-24T08:19:54.222Z" }
    ],
    taskmembers: [
      { id: 2059, userId: 174, taskId: 978, chatId: 277, type: "member" },
      { id: 2060, userId: 49, taskId: 978, chatId: 277, type: "member" }
    ],
    type: "routine",
    updatedAt: "2024-01-24T08:19:54.202Z"
  }];
export default function TaskCalendar({
    activeTaskList,
}) {
    const { user } = useSelector(state => state.user);
    //eslint-disable-next-line
    const [state, setState] = useState({
        calendarView: Views.MONTH,
        date: new Date()
    });
    const events = useMemo(() => {
        return activeTaskList?.map((item => {
            let event = {
                ...item,
                title: getTaskTitle(item),
            }
            if (item.dueDate) {
                event.dueDateObj = getDueDateObj(item.dueDate, item.taskStatuses?.find(i => i.userId === user.id)?.status);
            }
            // if (item.dueDate)
            //     return {
            //         ...event,
            //         start: moment(item.createdAt).toDate(),
            //         end: moment(item.dueDate).toDate(),
            //     }
            return {
                ...event,
                start: moment(item.createdAt).toDate(),
                end: moment(item.createdAt).add(2, "hour").toDate(),
            }
        }))
    }, [activeTaskList, user.id]);

    // const moveEvent = ({ event, start, end }) => {
    //     updateEvent({ ...event, start, end });
    // };

    // const resizeEvent = ({ event, start, end }) => {
    //     updateEvent({ ...event, start, end });
    // };

    const onViewChange = (view) => setState(prev => ({ ...prev, calendarView: view }));
    const handleNavigate = (e) => setState(prev => ({ ...prev, date: moment(e).toDate() }));

    return (
        <ErrorBoundary>
            <LazyComponent>
                <div className='dashboard-date-logs p-2 card'>
                    <CalenderWrapper className="">
                        {/* <PageTitle
                                 title="sidebar.calender"
                                 className="plr-15"
                                 breadCrumb={[{name: "sidebar.app"},{name: "sidebar.calender"}]}
                             /> */}
                        <div className="roe-card-style mt-15 mb-30 mlr-15 mobile-spacing-class no-box-container">
                            <div className="roe-card-body pb-15 plr-0" style={{ backgroundColor: "white", borderRadius: "6px" }}>
                                <DragAndDropCalendar
                                    className="flex flex-1 container"
                                    // selectable
                                    resizable
                                    localizer={localizer}
                                    events={events || []}
                                    // events={type === "admin" ? getEventsforAdmin('event') : getEventsforProvider('event')}
                                    // backgroundEvents={type === "admin" ? getEventsforAdmin('background') : getEventsforProvider('background')}
                                    // events={ScheduledEvents}
                                    // slotPropGetter={type === "admin" && state.calendarView === Views.DAY ?
                                    //     slotPropGetter : () => { }}
                                    // onEventDrop={moveEvent}
                                    // onEventResize={resizeEvent}
                                    defaultView={Views.DAY}
                                    defaultDate={new Date()}
                                    startAccessor="start"
                                    endAccessor="end"
                                    // step={10}
                                    views={allViews}
                                    showMultiDayTimes
                                    components={{
                                        toolbar: CalendarHeader,
                                        day: { event: DayEvent },
                                        week: { event: WeekEvent },
                                        month: { event: MonthEvent }
                                        // event: MyEvent
                                        // eventWrapper: MyEventWrapper
                                    }}
                                    step={15}
                                    timeslots={4}
                                    onView={onViewChange}
                                    onNavigate={handleNavigate}
                                    onSelectEvent={event => {
                                        // setAction("edit");
                                        // setmodalEvent(event.hasOwnProperty('cstmSlotId') ? { ...event, ...event.cstmSlotDetails } : event);
                                    }}
                                    onRangeChange={(range) => {
                                        const rangeArr = isArray(range)
                                        dispatch({
                                            type: TASK_CONST.SET_TASK_FILTER_DATA,
                                            payload: {
                                                dateFrom: moment(rangeArr ? range[0] : range.start).startOf("day").toLocaleString(),
                                                dateTo: moment(rangeArr ? range.pop() : range.end).endOf("day").toLocaleString()
                                            }
                                        })
                                    }}
                                    onSelectSlot={slotInfo => {
                                        // if (type === "admin") {
                                        //     // showError('Please ask provider to schedule availability.')
                                        //     return;
                                        // }
                                        // setAction("add");
                                        // setmodalEvent(slotInfo);
                                    }}

                                    // slotGroupPropGetter={slotGroupPropGetter}
                                    eventPropGetter={(event, start, end, isSelected) => {
                                        let style = {}
                                        if (event.dueDateObj?.isOverDue)
                                            style.borderRightColor = (event.type === CONST.MSG_TYPE.ROUTINE) ? 'rgb(180, 165, 105)' : 'rgb(212, 99, 99)';
                                        if (event.taskStatuses.find(i => i.userId === user.id)?.status === CONST.TASK_STATUS[3].value)
                                            style.textDecoration = 'line-through'
                                        return { style };
                                    }}
                                />
                            </div>
                        </div>
                    </CalenderWrapper>
                </div>
            </LazyComponent>
        </ErrorBoundary>
    )
}

const getTaskTitle = ({ subject, patient, description }) => {
    if (subject) return subject;
    if (patient) return patient;
    if (description) return description;
}