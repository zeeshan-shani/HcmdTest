import React, { useState, lazy } from "react";
import moment from "moment-timezone";
import { Col, Row } from "react-bootstrap";
import { LazyComponent } from "redux/common";
import { isMobile } from "react-device-detect";
import ModalReactstrap from "Components/Modals/Modal";
import AppointedPatientSlot from "./AppointedPatientSlot";
const ScheduleChart = lazy(() => import("Routes/SuperAdmin/components/AppoinmentCalendar/AppoinmentChart"));

export default function AppoinmentModal(props) {
    const {
        providerData,
        className,
        modal,
        toggleModal,
        event,
        // action,
        // eventDeleteHandler,
        // eventCloseHandler,
        // setEvents, updateEvent
    } = props;
    const [state, setState] = useState({
        rows: [],
        loading: false,
        create: false,
        update: false,
        chart: false
    });

    return (
        <ModalReactstrap
            size="lg"
            centered
            show={modal}
            toggle={toggleModal}
            Modalprops={{ className }}
            header={<div className="font-weight-bold line-clamp line-clamp-2">Patient Scheduler</div>}
            body={<>
                <Row>
                    <Col md={8}>
                        <Row>
                            <Col>
                                <p className='font-weight-bold mb-0'>Provider:</p>
                                {providerData.name}
                            </Col>
                        </Row>
                        <Row className=''>
                            <Col>
                                <p className='font-weight-bold mb-0'>Availablity:</p>
                                {moment(event?.start).format("MM/DD/YY hh:mm a")} - {moment(event?.end).format("MM/DD/YY hh:mm a")}
                            </Col>
                        </Row>
                        <Row className=''>
                            <Col>
                                <p className='font-weight-bold mb-0'>Title:</p>
                                {event?.title ? event.title : '-'}
                            </Col>
                        </Row>
                    </Col>
                    {(!isMobile || state.chart) &&
                        <Col md={4}>
                            <LazyComponent fallback={<></>}>
                                <div>
                                    <ScheduleChart dataRows={state.rows.length ? state.rows : []} event={event} />
                                </div>
                            </LazyComponent>
                        </Col>}
                </Row>
                <div className="dropdown-divider" />
                <AppointedPatientSlot providerData={providerData} event={event} state={state} setState={setState} />
            </>}
        />
    );
};