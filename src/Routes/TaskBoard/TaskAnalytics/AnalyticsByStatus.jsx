import React from 'react'
import { Box, LinearProgress, Typography } from '@mui/material'
import { Card, Col, Row } from 'react-bootstrap'
import { CONST } from 'utils/constants'
import { useSelector } from 'react-redux'

export default function AnalyticsByStatus({ analytics }) {
    const { user } = useSelector(state => state.user);

    return (
        <div className='task-status-analytics px-2'>
            <Row>
                {CONST.TASK_STATUS
                    .filter(item => (user.isProvider || item.value !== CONST.TASK_STATUS[4].value))
                    .map((item, index) => {
                        const total = analytics?.totalTask || null;
                        const tasks = analytics?.taskStatus?.find((i => i.status === item.value))?.countTaskStatus || 0;
                        const ratio = (total && Math.round((tasks / total) * 100)) || 0;
                        return (
                            <Col key={index} xl={3} md={6} sm={6}>
                                <Card className='analytics-card p-2 my-1 text-color'>
                                    <LinearProgressWithLabel
                                        {...item}
                                        label={item.value}
                                        color={item.color} value={ratio}
                                        subLable={total && `${tasks}/${total}`} />
                                </Card>
                            </Col>
                        )
                    })}
            </Row>
        </div>
    )
}

function LinearProgressWithLabel({ label, value, color, colorClass = "primary", subLable }) {
    return (<>
        <div className="d-flex justify-content-between mb-2 align-items-end">
            <Typography variant="h6" className='text-capitalize' color={color}>
                {label}
            </Typography>
            <Typography variant="body2">
                {`${Math.round(value)}%`}
            </Typography>
        </div>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={value}
                    color={colorClass}
                />
            </Box>
        </Box>
        {subLable &&
            <div className='d-flex justify-content-end my-1 text-color'>
                {subLable}
            </div>}
    </>);
}