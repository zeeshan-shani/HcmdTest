import React, { useCallback, useMemo } from 'react'
import { Card, Col, Row } from 'react-bootstrap'

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function AnalyticsForToday({ analytics }) {

    const { ratio } = useMemo(() => {
        const total = analytics?.totalTask || 0;
        const finishedTaskCount = analytics?.taskStatus?.find((i => i.status === "finished"))?.countTaskStatus || 0;
        const ratio = (total && Math.round((finishedTaskCount / total) * 100)) || 0;
        return { ratio };
    }, [analytics]);

    const getTextBasedonRatio = useCallback((ratio) => {
        let message = "";
        if (ratio === 100) message = "Task Complete!";
        else if (ratio === 50) message = "Halfway There!";
        else if (ratio === 0) message = "Start Now!";
        else if (ratio > 75) message = "Almost Done!";
        else if (ratio > 50) message = "Keep It Up!";
        else if (ratio > 25) message = "Keep Going!";
        else if (ratio > 0) message = "Stay Motivated!";
        else message = "Keep Moving!";
        return message;
    }, []);

    return (
        <Card className='task-status-analytics analytics-card'>
            <div className="header">
                <h5 className='mx-1'>Tasks</h5>
                {/* {filterObj.dateFrom && filterObj.dateTo &&
                    `(${`${moment(filterObj.dateFrom).format("MM/DD/YY")} - ${moment(filterObj.dateTo).format("MM/DD/YY")}`})`} */}
            </div>
            <Row>
                <Col className='d-flex justify-content-center'>
                    <div className='p-2' style={{ width: "100%", maxWidth: "200px" }}>
                        <CircularProgressbar value={ratio} text={getTextBasedonRatio(ratio)}
                            styles={buildStyles({
                                width: "40%",
                                textColor: "grey",
                                textSize: "10px",
                                pathColor: "#665fde",

                            })}
                        />
                    </div>
                </Col>
                <Col className='d-flex flex-column justify-content-center text-color'>
                    <div className='d-flex gap-10 mb-3'>
                        <div className="bg-primary br-6" style={{ width: '12px', height: '50px' }} />
                        <div>
                            <p className='mb-0'>Completed</p>
                            <small>{`${ratio}%`}</small>
                        </div>
                    </div>
                    <div className='d-flex gap-10'>
                        <div className="bg-secondary br-6" style={{ width: '12px', height: '50px' }} />
                        <div>
                            <p className='mb-0'>Incompleted</p>
                            <small>{`${100 - ratio}%`}</small>
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>
    )
}


