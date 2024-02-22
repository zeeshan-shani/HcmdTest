import React, { useCallback, useEffect, useState } from 'react'
import { Select, Switch } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { generatePayload, getStatusColor } from 'redux/common';
import { getDesignationByKey } from 'services/helper';
import { CONST, SOCKET } from 'utils/constants';
import useDebounce from 'services/hooks/useDebounce';
import { getUsersList } from 'redux/actions/chatAction';
import taskProviderService from 'services/APIs/services/taskProviderService';
import ErrorBoundary from 'Components/ErrorBoundry';
import { useSelector } from 'react-redux';
import { getTaskReviewer } from './TaskMembers';
import { dispatch } from 'redux/store';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { showSuccess } from 'utils/package_config/toast';

const getReviewer = (reviewers) => {
    if (!!reviewers?.length) {
        const [reviewer] = reviewers;
        return { ...reviewer, label: reviewer.user.name, value: reviewer.userId }
    }
    return;
}

export default function AssignedProvider({ taskDetails, isTaskFinished = false, haveAccess }) {
    const { user } = useSelector(state => state.user);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [reviewer, setReviewer] = useState(getReviewer(getTaskReviewer(taskDetails?.taskmembers)));
    const newSearch = useDebounce(search, 500);

    useEffect(() => {
        setReviewer(getReviewer(getTaskReviewer(taskDetails?.taskmembers)));
    }, [taskDetails?.taskmembers]);

    // User List API 
    const getData = useCallback(async () => {
        let payload = await generatePayload({
            rest: {
                designationId: getDesignationByKey(CONST.DESIGNATION_KEY.PROVIDER, "selectable")?.id,
                status: "active",
                ownProvider: true
            },
            keys: ["name", "firstName", "lastName", "email", "companyName"],
            value: newSearch,
            options: {
                attributes: ["id", "name",],
                sort: [["name", "ASC"]],
                populate: ["users:own"], // "designations", "companyRoleData"
                // limit: 5,
                // page: 1,
                // pagination: true,
            },
        });
        const data = await getUsersList(payload);
        if (data?.status === 1) return data.data.map(item => ({ id: item.id, label: item.name, value: item.name }));
        return [];
    }, [newSearch]);

    const { data: providers, isFetching } = useQuery({
        queryKey: ["/users/list", newSearch],
        queryFn: getData,
        keepPreviousData: true,
        staleTime: CONST.QUERY_STALE_TIME.L1,
    });

    const onUpdateProvider = useCallback(async (username, { id }) => {
        const payload = {
            taskId: taskDetails.id,
            chatId: taskDetails.chatDetails.id,
            addedMember: [id],
            removedMember: reviewer?.userId ? [reviewer.userId, id] : [id],
        }
        const data = await taskProviderService.create({ payload });
        if (data?.status === 1) {
            dispatch({ type: TASK_CONST.UPDATE_TASK_MEMBERS, payload: data.data });
            const reviewer = data.data.taskMembers.find(i => i.userId === id);
            if (reviewer) return setReviewer({ ...reviewer, label: reviewer.user?.name, value: reviewer.userId });
        }
        return setReviewer();
    }, [taskDetails.chatDetails.id, taskDetails.id, reviewer?.userId]);

    const onChangeStatus = useCallback((status) => {
        setLoading(true);
        const data = {
            status,
            taskId: taskDetails.id,
            chatId: taskDetails.chatId,
            messageId: taskDetails.messageId,
            reviewUserId: taskDetails?.taskStatuses.find(item => item.status === CONST.TASK_STATUS[4].value)?.userId || null
        }
        SocketEmiter(SOCKET.REQUEST.UPDATE_REVIEW_STATUS, data, (data) => {
            setLoading(false);
            if (data?.status === 1) showSuccess(data?.message || "Task reviewed successfuly.");
            if (taskDetails?.id !== -1 && taskDetails?.id === data?.data.provider.taskId)
                dispatch({ type: TASK_CONST.UPDATE_REVIEW_STATUS, payload: data.data });
        });
    }, [taskDetails.chatId, taskDetails.id, taskDetails.messageId, taskDetails?.taskStatuses]);

    let taskStatus = taskDetails?.taskStatuses?.find((usr => usr.userId === reviewer?.userId))?.status || "";

    return (
        <ErrorBoundary>
            <span className='font-weight-bold'>Assigned Provider</span>
            <Select
                size={"middle"}
                className="mt-2"
                value={reviewer ? [{ ...reviewer }] : []}
                loading={isFetching}
                onSelect={onUpdateProvider}
                // onClick={() => isTaskFinished && showError("Task is already Finished. Can't modify members")}
                style={{ width: "100%" }}
                placement="topLeft"
                placeholder="Select provider"
                options={providers}
                onSearch={e => setSearch(e)}
                showSearch={true}
                // open={haveAccess}
                disabled={isTaskFinished}
            />
            {(reviewer?.userId === user.id) ?
                (<div className='mt-2 d-flex justify-content-between align-items-center'>
                    <p className='mb-0'>Review status:</p>
                    <Switch
                        className={`outline-none text-capitalize ${CONST.TASK_STATUS[3].value === taskStatus ? "bg-success" : ""}`}
                        unCheckedChildren={CONST.TASK_STATUS[0].value}
                        checkedChildren={CONST.TASK_STATUS[3].value}
                        checked={taskStatus === CONST.TASK_STATUS[3].value}
                        loading={loading}
                        disabled={isTaskFinished}
                        onChange={(val) => {
                            onChangeStatus(CONST.TASK_STATUS[val ? 3 : 0].value)
                        }}
                    />
                </div>)
                :
                (taskStatus &&
                    <div className={`task-status ${getStatusColor(taskStatus)} br-6 mt-2`}>
                        <p className="text-white text-capitalize px-1 mb-0">
                            {`Review ${taskStatus}`}
                        </p>
                    </div>)
            }
            {/* {reviewer &&
                    <div className={`${classes["card-task-member"]} d-flex flex-column`}>
                        <MuiTooltip title={`Click to view ${reviewer.user.name}'s info`}>
                            <li id={`member-${reviewer.user.id}`} className={`d-flex ${classes.member} cursor-pointer gap-10`} onClick={() => setInspectUser(reviewer.user.id)}>
                                <div className={`position-relative task-profile-svg`} title={`${reviewer.user.name} ${taskStatus && `, Status: ${taskStatus}`}`}>
                                    <img className='' src={getImageURL(reviewer.user.profilePicture, '30x30')} alt="m" width={30} height={30} />
                                    <div className="position-absolute svg-wrap">
                                        {getTaskStatusSvg(taskStatus)}
                                    </div>
                                </div>
                                <span className='text-truncate d-flex align-items-center'>{reviewer.user.name}</span>
                            </li>
                        </MuiTooltip>
                    </div>} */}
            <hr />
        </ErrorBoundary>
    )
}
