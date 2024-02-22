import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap'
import taskService from 'services/APIs/services/taskService';
import AnalyticsByStatus from './AnalyticsByStatus'
import AnalyticsForToday from './AnalyticsForToday'

export default function TaskAnalytics({
    userId,
    chatId,
    showAnalyticsToday = true,
    label,
    filterObj
}) {
    const { data: analytics = [] } = useQuery({
        queryKey: ["/task/analytics", chatId ? `chat/${chatId}` : `user/${userId}`, filterObj.dateFrom, filterObj.dateTo],
        queryFn: async () => {
            let startDate, endDate;
            startDate = filterObj.dateFrom;
            endDate = filterObj.dateTo;
            let payload = { dateFilter: [startDate, endDate] }
            if (chatId) payload.chatId = chatId;
            else if (userId) payload.userId = userId;
            const data = await taskService.analytics({ payload });
            if (data?.status === 1) return data.data;
            return null;
        },
        keepPreviousData: false,
        // refetchOnMount: true,
        enabled: Boolean(chatId || userId)
    });

    return (
        <div className='mx-1 my-2'>
            {label &&
                <div className="header mx-1">
                    <h5>{label}</h5>
                </div>}
            <Row className='mx-1'>
                <Col lg={showAnalyticsToday ? 9 : 12} md={12} sm={12} className="mb-2 px-0">
                    <AnalyticsByStatus analytics={analytics} filterObj={filterObj} />
                </Col>
                {showAnalyticsToday &&
                    <Col lg={3} md={12} sm={12} className="mb-2">
                        <AnalyticsForToday analytics={analytics} filterObj={filterObj} />
                    </Col>}
            </Row>
        </div>
    )
}