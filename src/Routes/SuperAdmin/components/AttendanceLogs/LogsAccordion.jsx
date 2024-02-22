import React from 'react'
import moment from 'moment-timezone'
import { CONST } from 'utils/constants';
import { Alarm, ArrowDownLeft, ArrowUpRight } from 'react-bootstrap-icons';

export const LogsAccordion = ({ Start = [], End = [], StartTitle = '', EndTitle = '', Title = '', gross = '', id, collapsed = false }) => {
    const grossHours = gross && gross?.split(':');
    return (
        <div className='accordion text-color my-1 user-logs-data py-1 card'>
            <div className={`accordion-item transparent-bg`}>
                <div
                    className={`accordion-button collapsed cursor-pointer d-flex p-2 justify-content-between ${collapsed ? 'collapsed' : ''}`}
                    data-bs-toggle="collapse"
                    data-bs-target={`#panelsStayOpen-collapse-${id}`}
                    aria-expanded="false"
                    aria-controls={`panelsStayOpen-collapse-${id}`}
                >
                    <p className='mb-0 flex-60 in-four-line text-truncate'><b>{Title}</b></p>
                    {!!grossHours.length && <p className='mb-0'><Alarm className='mr-1' />{grossHours[0]}h {grossHours[1]}m</p>}
                </div>
                <div id={`panelsStayOpen-collapse-${id}`} className={`accordion-collapse collapse`} aria-labelledby={`card-${id}`}>
                    <div className="accordion-body">
                        <LogsRowCols start={Start} end={End} startTitle={StartTitle} endTitle={EndTitle} colClass="col-6 mt-10 text-center px-1" />
                    </div>
                </div>
            </div>
        </div>
    )
}


export const LogsRowCols = ({ start = [], end = [], startTitle = '', endTitle = '', className = "row m-0", colClass = "col-6 mt-10 text-center" }) => {
    if (!!start.length || !!end.length) {
        return <div className={className}>
            <div className={colClass}>
                <div className="d-flex align-items-center justify-content-center">
                    <h6 className='my-1'>{startTitle}</h6>
                </div>
                {!!start?.length && start.map(item => {
                    return (
                        <div key={item.id} className="d-flex align-items-center justify-content-center mb-1">
                            <ArrowDownLeft color='green' className='mr-1' />
                            <small className='light-text-70'>{moment(item.time).tz(CONST.TIMEZONE).format("hh:mm:ss A")}</small>
                        </div>)
                })}
            </div>
            <div className={colClass}>
                <div className="d-flex align-items-center justify-content-center">
                    <h6 className='my-1'>{endTitle}</h6>
                </div>
                {!!end?.length && end.map(item => {
                    return (
                        <div key={item.id} className="d-flex align-items-center justify-content-center mb-1">
                            <ArrowUpRight color='red' className='mr-1' />
                            <small className='light-text-70'>{moment(item.time).tz(CONST.TIMEZONE).format("hh:mm:ss A")}</small>
                        </div>)
                })}
            </div>
        </div>
    } else {
        return <p className='d-flex justify-content-center mb-0'>No entries found</p>
    }
}
