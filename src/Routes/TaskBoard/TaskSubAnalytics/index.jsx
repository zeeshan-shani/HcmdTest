import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import ErrorBoundary from 'Components/ErrorBoundry';
import TaskAlertList from '../TaskAlertList';
import TaskWatchList from '../TaskWatchList'

const bussinessMan = "https://chatapp-storage-2022.s3.us-west-2.amazonaws.com/businessman+in+black+suit+giving+thumbs+up.png";
const confettiCard = "https://chatapp-storage-2022.s3.us-west-2.amazonaws.com/confetti.png";
const confettiCard1 = "https://chatapp-storage-2022.s3.us-west-2.amazonaws.com/confetti+(1).png";

export default function TaskSubAnalytics({ filterObj }) {
    return (
        <ErrorBoundary>
            <div className='mx-md-1 mx-lg-3 my-2'>
                <Row>
                    <Col md={12} lg={9}>
                        <Row>
                            <Col md={12} lg={6}>
                                <TaskWatchList filterObj={filterObj} />
                            </Col>
                            <Col md={12} lg={6}>
                                <TaskAlertList filterObj={filterObj} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md={12} lg={3} className="my-md-2 my-lg-0 text-color">
                        <Card className='p-2 d-flex flex-row'>
                            <div className='w-50'>
                                <h4>Good Job!</h4>
                                <p>You're making remarkable progress! Keep up the great work and continue reaching for new heights</p>
                            </div>
                            <div className='w-50 position-relative' style={{ height: '200px' }}>
                                <img src={bussinessMan} alt="" className='position-absolute' style={{ zIndex: "3", top: '0', left: '15%' }} />
                                <img src={confettiCard} alt="" className='position-absolute' style={{ zIndex: "2", top: '0', left: '15%' }} />
                                <img src={confettiCard1} alt="" className='position-absolute' style={{ zIndex: "1", top: '5%', left: '15%' }} />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </ErrorBoundary>
    )
}