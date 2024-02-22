import React, { useState } from 'react'
import moment from 'moment-timezone'
import ReactDatePicker from 'react-datepicker'
import { useSelector } from 'react-redux/es/hooks/useSelector'
import { getDateXDaysAgoEndOf, getDateXDaysAgoStartOf } from 'redux/common'
import { FormControlLabel, Switch } from '@mui/material'
import { TASK_STATUS } from 'Routes/TaskBoard/config'
import { ChatsDropdown } from 'Routes/SuperAdmin/ChatsDropdown'
import { UsersDropdown } from 'Routes/SuperAdmin/UsersDropdown'
import { TasklogsTable } from 'Routes/SuperAdmin/components/TaskLogs/TasklogsTable'
import Input from 'Components/FormBuilder/components/Input'
import { listenTaskActivities } from 'utils/wssConnection/Listeners/Tasklistener'
import { useMount, useUnmount } from 'react-use'

export default function UserTaskLogs() {
    const { user } = useSelector((state) => state.user);
    const [userData, setUserData] = useState({ id: user?.id, label: user?.name, value: user?.id });
    const [groupData, setGroupData] = useState();
    const [selectChats, setSelectOpt] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(JSON.parse(localStorage.getItem("taskAnalytics")));
    const [filters, setFilters] = useState({
        createdAt: {
            dateFrom: getDateXDaysAgoStartOf(7).toLocaleString(),
            dateTo: getDateXDaysAgoEndOf(0).toLocaleString()
        },
        dueDate: {
            dateFrom: null,
            dateTo: null
        },
        status: null,
        type: null
    });

    useMount(() => listenTaskActivities());

    useUnmount(() => localStorage.setItem("taskAnalytics", JSON.stringify(showAnalytics)));

    const onChangeDate = (data) => setFilters((prev) => ({ ...prev, ...data }));

    return (<>
        <div className='dashboard-date-logs border-0'>
            <div className="row m-2 py-2 align-items-center justify-content-between">
                <div className='d-flex flex-wrap'>
                    <div className="dropdown-select-options mr-1 d-flex align-items-center">
                        <div className='p-1'>
                            <p className='mb-0'>Filter: </p>
                        </div>
                        <div className='options'>
                            <div className={`option p-1 ${!selectChats ? 'active' : ''}`} onClick={() => setSelectOpt(false)}>
                                <p className='mb-0'>User</p>
                            </div>
                            <div className={`option p-1 ${selectChats ? 'active' : ''}`} onClick={() => setSelectOpt(true)}>
                                <p className='mb-0'>Group</p>
                            </div>
                        </div>
                    </div>
                    {selectChats ?
                        <ChatsDropdown groupData={groupData} setGroupData={setGroupData} />
                        : <p>pp</p>}
                    <div className="dropdown mx-1">
                        <button
                            className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown"
                            id="statusDropdown"
                            data-bs-toggle="dropdown"
                        >
                            <span>Status: {filters.status ? filters.status : "All"}</span>
                        </button>
                        <ul className="dropdown-menu m-0" style={{ overflow: "unset" }} aria-labelledby="statusDropdown">
                            {TASK_STATUS.map((status) => (
                                <li
                                    key={status.id}
                                    className="dropdown-item cursor-pointer text-capitalize"
                                    onClick={() =>
                                        setFilters((prev) => ({ ...prev, status: status.value !== 'All' ? status.value : null }))
                                    }
                                >
                                    {status.value}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* <div className="dropdown mr-1">
                        <button
                            className="btn btn-outline-default dropdown-toggle text-capitalize  custom-dropdown" // p-4_8 btn-sm 
                            id="typeDropdown"
                            data-bs-toggle="dropdown"
                        >
                            <span>Type: {filters.type ? filters.type : "All"}</span>
                        </button>
                        <ul className="dropdown-menu m-0" style={{ overflow: "unset" }} aria-labelledby="typeDropdown">
                            <li
                                className="dropdown-item cursor-pointer text-capitalize"
                                onClick={() => {
                                    setFilters((prev) => ({ ...prev, type: null }))
                                }}
                            >
                                {'All'}
                            </li>
                            {TASK_CARDS.map((type) => (
                                <li
                                    key={type.id}
                                    className="dropdown-item cursor-pointer text-capitalize"
                                    onClick={() => setFilters((prev) => ({ ...prev, type: type.type, }))}
                                >
                                    {type.title}
                                </li>
                            ))}
                        </ul>
                    </div> */}
                    <Input
                        name='search'
                        placeholder='Search task'
                        value={filters.search}
                        rootClassName="mb-0"
                        handleChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    />
                </div>
                <div>
                    <div className="d-inline-block input-group py-1 w-auto date-label mr-2">
                        <span className='mr-1 light-text-70'>Created:</span>
                        <ReactDatePicker
                            id="createdOnDate"
                            placeholderText="Task created"
                            title="Created On"
                            autoComplete='off'
                            className="form-control search mr-3"
                            selectsRange={true}
                            startDate={filters.createdAt?.dateFrom ? new Date(filters.createdAt.dateFrom) : null}
                            endDate={filters.createdAt?.dateTo ? new Date(filters.createdAt.dateTo) : null}
                            maxDate={filters.createdAt?.dateFrom ? moment(filters.createdAt.dateFrom).add(1, "month").toDate() : null}
                            onChange={(update) => {
                                const [a, b] = update;
                                onChangeDate({ createdAt: { dateFrom: a ? moment(a).startOf('day').toLocaleString() : null, dateTo: b ? moment(b).endOf('day').toLocaleString() : null } })
                            }}
                            isClearable={true}
                        />
                    </div>
                    <div className="d-inline-block input-group py-1 w-auto date-label">
                        <span className='mr-1 light-text-70'>Due Date:</span>
                        <ReactDatePicker
                            id="dueDate"
                            placeholderText="Task due date"
                            title='due date'
                            autoComplete='off'
                            className="form-control search mr-3"
                            selectsRange={true}
                            startDate={filters.dueDate?.dateFrom ? new Date(filters.dueDate.dateFrom) : null}
                            endDate={filters.dueDate?.dateTo ? new Date(filters.dueDate.dateTo) : null}
                            maxDate={filters.dueDate?.dateFrom ? moment(filters.dueDate.dateFrom).add(1, "month").toDate() : null}
                            onChange={(update) => {
                                const [a, b] = update;
                                onChangeDate({ dueDate: { dateFrom: a ? moment(a).startOf('day').toLocaleString() : null, dateTo: b ? moment(b).endOf('day').toLocaleString() : null } })
                            }}
                            isClearable={true}
                        />
                    </div>
                    <FormControlLabel
                        className='mb-0'
                        control={
                            <Switch checked={showAnalytics} onChange={e => setShowAnalytics(e.target.checked)} />}
                        label="Analytics"
                        labelPlacement="start" />
                </div>
            </div>
        </div>
        <TasklogsTable
            filters={filters}
            userData={userData}
            groupData={groupData}
            selectChats={selectChats}
            showAnalytics={showAnalytics}
        />
    </>
    )
}
