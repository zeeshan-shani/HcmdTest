import React, { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment-timezone'
import useDebounce from 'services/hooks/useDebounce'
import ReactDatePicker from 'react-datepicker'
import { useSelector } from 'react-redux/es/hooks/useSelector'
import { useNavigate } from 'react-router-dom'
import { CONST } from 'utils/constants'
import { dispatch } from 'redux/store'
import { TASK_CONST } from 'redux/constants/taskConstants'
import { loadUserDashboardList } from 'redux/actions/chatAction'

import { DashboardListLoader } from 'Components/Loaders/Loaders'
import { Board } from 'Routes/Dashboard/components/Chat/Board'
import { ToggleSwitch } from 'Routes/Dashboard/components/Chat/ToggleSwitch'
import { setUserHandler } from 'Routes/Chat/Sidebar/Chat'
import Input from 'Components/FormBuilder/components/Input'
import { Col, Row } from 'react-bootstrap'
import chatService from 'services/APIs/services/chatService'
import { useQuery } from '@tanstack/react-query'

const initState = { search: "", chatType: CONST.CHAT_TYPE.ALL_CHATS }

export default function BoardList() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const { filterTaskData } = useSelector((state) => state.task);
    const { loaders, dashboardList, dashboardUpdate } = useSelector((state) => state.chat);
    const [filters, setFilters] = useState(initState);
    const newObj = useDebounce(filters, 250);

    useEffect(() => {
        if (filterTaskData.dateFrom && !filterTaskData.dateTo) return;
        loadUserDashboardList(user.id, {
            ...newObj,
            dateFrom: filterTaskData.dateFrom,
            dateTo: filterTaskData.dateTo
        });
    }, [user.id, newObj, filterTaskData, dashboardUpdate]);

    const { data: messageCount = { unreadCount: 0, mentionCount: 0 } } = useQuery({
        queryKey: ["/chat/user/list", "unreadCount", user.id, dashboardUpdate],
        queryFn: async () => {
            const data = await chatService.chatuserList({
                payload: {
                    query: { userId: user.id },
                    options: {
                        group: [
                            ["atTheRateMentionMessageCount", "sum"],
                            ["routineUnreadMessageCount", "sum"],
                            ["emergencyUnreadMessageCount", "sum"],
                            ["urgentUnreadMessageCount", "sum"],
                        ],
                        attributes: ["userId"]
                    },
                    findOne: true
                }
            });
            if (data?.status === 1)
                return {
                    unreadCount: (
                        Number(data.data?.sum_routineUnreadMessageCount || 0) +
                        Number(data.data?.sum_emergencyUnreadMessageCount || 0) +
                        Number(data.data?.sum_urgentUnreadMessageCount || 0)
                    ),
                    mentionCount: data.data?.sum_atTheRateMentionMessageCount || 0
                }
            return;
        },
        keepPreviousData: false,
        refetchInterval: 30 * 1000
    });

    const onFilterUsersHandler = useCallback((type) => setFilters((prev) => ({ ...prev, chatType: type })), []);

    const onChangeDate = useCallback((data) => dispatch({ type: TASK_CONST.SET_TASK_FILTER_DATA, payload: data }), []);

    const gotoBoard = useCallback((board) => {
        dispatch({ type: TASK_CONST.NEW_CHAT_SELECTED, payload: board });
        dispatch({ type: TASK_CONST.SET_NEW_TASK_LIST, payload: [] });
        navigate(CONST.APP_ROUTES.TASK);
    }, [navigate]);

    const gotoChat = useCallback((chat) => {
        setUserHandler({ chat, activeChatId: -2, userId: user.id, navigate })
    }, [navigate, user.id]);

    const { groupChats, personalChats } = useMemo(() => ({
        groupChats: dashboardList?.filter((chat) => (chat.type === CONST.CHAT_TYPE.GROUP)) || [],
        personalChats: dashboardList?.filter((chat) => (chat.type === CONST.CHAT_TYPE.PRIVATE)) || []
    }), [dashboardList]);

    try {
        return (<>
            <div className="d-flex sidebar-sub-header p-1 flex-wrap justify-content-between">
                <div className="chat-filter d-flex align-items-center">
                    <div className="toggle_chat mr-1">
                        <ToggleSwitch
                            values={[CONST.CHAT_TYPE.ALL_CHATS, CONST.CHAT_TYPE.PRIVATE, CONST.CHAT_TYPE.GROUP]}
                            OnChange={onFilterUsersHandler}
                            selected={newObj.chatType} />
                    </div>
                    
                    <div className="form-inline">
                        <Input
                            placeholder="Search User/Group"
                            className='search'
                            name="subject"
                            handleChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                            value={filters.search}
                        />
                    </div>
                </div>
                <div className="date-task-filter d-flex align-items-center">
                    <div className="input-group d-flex px-0 flex-nowrap m-1" title="Date from">
                        <ReactDatePicker
                            selectsRange={true}
                            startDate={filterTaskData.dateFrom ? new Date(filterTaskData.dateFrom) : null}
                            endDate={filterTaskData.dateTo ? new Date(filterTaskData.dateTo) : null}
                            placeholderText="Date range"
                            className="form-control search mr-3"
                            isClearable={true}
                            onChange={(update) => {
                                const [a, b] = update;
                                onChangeDate({ dateFrom: a ? moment(a).toLocaleString() : null, dateTo: b ? moment(b).toLocaleString() : null })
                            }}
                        />
                    </div>
                </div>
            </div>
            <Row className='mt-2 mx-1'>
                <Col xs={12} md={6}>
                    <div className="dashboard-unread-count d-flex py-1">
                        <div className='d-flex justify-content-between align-items-center w-100 mx-2'>
                            <div>
                                Unread messages
                            </div>
                            <div className='font-weight-bold'>{messageCount.unreadCount}</div>
                        </div>
                    </div>
                </Col>
                <Col xs={12} md={6}>
                    <div className="dashboard-unread-count d-flex py-1">
                        <div className='d-flex justify-content-between align-items-center w-100 mx-2'>
                            <div>
                                Mentions
                            </div>
                            <div className='font-weight-bold'>{messageCount.mentionCount}</div>
                        </div>
                    </div>
                </Col>
            </Row>
            {(newObj.chatType === CONST.CHAT_TYPE.GROUP || newObj.chatType === CONST.CHAT_TYPE.ALL_CHATS) &&
                <div className='dashboard_chat'>
                    <div className="bold-text">
                        <h5 className='col m-0'>
                            Group Chats
                            {!!groupChats.length ?
                                <span className='mx-1'>{`(${groupChats.length})`}</span> :
                                <span className='mx-1 light-text-70'>{'(No message/task)'}</span>}
                        </h5>
                    </div>
                    <div className="row m-0">
                        {(!!groupChats.length) && groupChats.map((board, i) => (
                            <Board
                                key={i}
                                chatType={CONST.CHAT_TYPE.GROUP}
                                unique={CONST.CHAT_TYPE.GROUP}
                                gotoBoard={gotoBoard}
                                gotoChat={gotoChat}
                                board={board}
                                filterTaskData={filterTaskData} />
                        ))}
                        {loaders.dashboardList && <DashboardListLoader />}
                    </div>
                </div>}
            {(newObj.chatType === CONST.CHAT_TYPE.PRIVATE || newObj.chatType === CONST.CHAT_TYPE.ALL_CHATS) &&
                <div className='dashboard_chat'>
                    <div className="bold-text">
                        <h5 className='col m-0'>
                            Personal Chats
                            {!!personalChats.length ?
                                <span className='mx-1'>{`(${personalChats.length})`}</span> :
                                <span className='mx-1 light-text-70'>{'(No message/task)'}</span>}
                        </h5>
                    </div>
                    <div className="row m-0">
                        {(!!personalChats.length) && personalChats.map((board, i) => (
                            <Board
                                key={i}
                                chatType={CONST.CHAT_TYPE.PRIVATE}
                                unique={CONST.CHAT_TYPE.PRIVATE}
                                gotoBoard={gotoBoard}
                                gotoChat={gotoChat}
                                board={board}
                                filterTaskData={filterTaskData} />
                        ))}
                        {loaders.dashboardList && <DashboardListLoader />}
                    </div>
                </div>}
        </>);
    } catch (error) {
        console.error(error);
    }
}
