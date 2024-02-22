import React, { useEffect, useMemo, useState } from 'react'
import { getAdminAccess } from 'utils/permission';
import { getImageURL } from 'redux/common';
import { MuiTooltip } from 'Components/components';

import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { getTaskStatusSvg } from 'Routes/TaskBoard/TaskPage';
import { compareName } from 'Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo';
import MembersMenu from './MembersMenu';
import { Accordion } from 'react-bootstrap';
import ErrorBoundary from 'Components/ErrorBoundry';
import { CONST } from 'utils/constants';
import AssignedProvider from './AssignedProvider';
import { useSelector } from 'react-redux';

export const getTaskMembers = (users) => {
    return users.filter(item => item.type === CONST.TASK_MEMBER_TYPE.MEMBER);
}
export const getTaskReviewer = (users) => {
    return users.filter(item => item.type === CONST.TASK_MEMBER_TYPE.REVIEWER);
}

export const TaskMembers = ({ taskDetails, isTaskFinished = false, setInspectUser }) => {
    const { user } = useSelector(state => state.user);
    const { userDesignations } = useSelector(state => state.chat);
    const [taskMembers, setTaskMember] = useState(getTaskMembers(taskDetails?.taskmembers));
    const [assignDesignation, setAssignDesg] = useState(taskDetails?.taskDepartments ?
        taskDetails?.taskDepartments.map((i) => ({ id: i?.designationId, name: i.taskDesignationInfo?.name })) : []);

    useEffect(() => {
        if (taskDetails?.taskmembers)
            setTaskMember(getTaskMembers(taskDetails.taskmembers));
    }, [taskDetails?.taskmembers]);

    const { completedBy, haveAccess, completedByData } = useMemo(() => {
        const { completedBy, taskmembers, taskStatuses } = taskDetails
        const haveAccess = taskDetails.createdBy === user.id || taskDetails?.chatDetails?.users?.includes(user.id) || getAdminAccess(user);
        let completedByData = null;
        if (completedBy && !!taskmembers?.length) {
            completedByData = taskmembers.find(usr => usr.userId === completedBy)?.user || {};
            completedByData.status = taskStatuses.find((usr => usr.userId === completedBy))?.status || "";
        }
        return { completedBy, taskmembers, taskStatuses, haveAccess, completedByData }
    }, [taskDetails, user]);

    const AssignedMembers = useMemo(() => {
        return (
            <div className={`${classes["card-task-member"]} d-flex flex-column`}>
                <ErrorBoundary>
                    {taskMembers && !!taskMembers.length && <>
                        <span className='font-weight-bold'>Assigned Members</span>
                        <ul className='mb-0'>
                            {taskMembers
                                .sort(compareName)
                                .map((member, i) => {
                                    const fStatus = taskDetails?.taskStatuses?.find(item => item.userId === member.user?.id) || null;
                                    const taskStatus = fStatus && !(completedBy) ? fStatus.status : 'Undefined';
                                    return (
                                        <MuiTooltip title={`Click to view ${member.user?.name}'s info`} key={i}>
                                            <li id={`member-${member.user?.id}`} className={`d-flex ${classes.member} cursor-pointer gap-10`} onClick={() => setInspectUser(member.user?.id)}>
                                                <div className={`position-relative task-profile-svg`} title={`${member.user?.name} ${taskStatus && `, Status: ${taskStatus}`}`}>
                                                    <img className='' src={getImageURL(member.user?.profilePicture, '30x30')} alt="m" width={30} height={30} />
                                                    <div className="position-absolute svg-wrap">
                                                        {getTaskStatusSvg(taskStatus)}
                                                    </div>
                                                </div>
                                                <span className='text-truncate d-flex align-items-center'>{member.user?.name}</span>
                                            </li>
                                        </MuiTooltip>
                                    );
                                })}
                        </ul>
                    </>}
                    {taskMembers && !taskMembers.length &&
                        <span>No members assigned</span>}
                </ErrorBoundary>
            </div>
        )
    }, [completedBy, setInspectUser, taskDetails?.taskStatuses, taskMembers]);

    const FinishedByUsers = useMemo(() => {
        return (<>
            {(completedBy && completedByData) &&
                <div className={`${classes["card-task-member"]} d-flex flex-column`}>
                    <span className='font-weight-bold'>Finished by</span>
                    <MuiTooltip title={`Click to view ${completedByData.name}'s info`}>
                        <li id={`member-${completedByData.id}`} className={`d-flex ${classes.member} cursor-pointer gap-10`} onClick={() => setInspectUser(completedByData.id)}>
                            <div className={`position-relative task-profile-svg`} title={`${completedByData.name} ${completedByData.status && `, Status: ${completedByData.status}`}`}>
                                <img className='' src={getImageURL(completedByData.profilePicture, '30x30')} alt="m" width={30} height={30} />
                                <div className="position-absolute svg-wrap">
                                    {getTaskStatusSvg(completedByData.status)}
                                </div>
                            </div>
                            <span className='text-truncate d-flex align-items-center'>{completedByData.name}</span>
                        </li>
                    </MuiTooltip>
                </div>}
        </>)
    }, [completedBy, completedByData, setInspectUser]);

    const AssignedDepartments = useMemo(() => {
        const taskDepartments = taskDetails?.taskDepartments || [];
        const deptIds = taskDepartments.map((i => i.designationId));
        try {
            return (<>
                <div className={`${classes["card-task-member"]} d-flex flex-column`}>
                    {taskDepartments && !!taskDepartments.length && <>
                        <span className='font-weight-bold'>Assigned Dept.</span>
                        <Accordion defaultActiveKey={['0']} alwaysOpen className=''>
                            {taskDepartments.map((dept, index) => {
                                const members = taskMembers?.filter((mem) => mem.user?.userDesignations.map(i => i.designationId)?.includes(dept.designationId))
                                return (
                                    <div className='accordion text-color mt-2' key={index}>
                                        <div
                                            className="accordion-button collapsed cursor-pointer mb-1 btn btn-secondary btn-sm w-100"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#panelsStayOpen-dept-${dept.id}`}
                                            aria-expanded="false"
                                            aria-controls={`panelsStayOpen-dept-${dept.id}`}
                                        >
                                            {dept?.taskDesignationInfo?.name}
                                        </div>
                                        <div id={`panelsStayOpen-dept-${dept.id}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-dashboard-clock`}>
                                            <div className="accordion-body">
                                                {members.map((mem, i) => {
                                                    const fStatus = taskDetails?.taskStatuses?.find(item => item.userId === mem.user.id) || null;
                                                    const taskStatus = fStatus && !(completedBy) ? fStatus.status : 'Undefined';
                                                    return (
                                                        <MuiTooltip title={`Click to view ${mem.user.name}'s info`} key={i}>
                                                            <li id={`member-${mem.user.id}`} className={`d-flex ${classes.member} cursor-pointer mb-1`} onClick={() => setInspectUser(mem.user.id)}>
                                                                <div className={`position-relative task-profile-svg`} title={`${mem.user.name} ${taskStatus && `, Status: ${taskStatus}`}`}>
                                                                    <img className='' src={getImageURL(mem.user.profilePicture, '30x30')} alt="m" width={30} height={30} />
                                                                    <div className="position-absolute svg-wrap">
                                                                        {getTaskStatusSvg(taskStatus)}
                                                                    </div>
                                                                </div>
                                                                <span className='ml-2 text-truncate d-flex align-items-center'>{mem.user.name}</span>
                                                            </li>
                                                        </MuiTooltip>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </Accordion>
                    </>}
                    <span className='font-weight-bold'>Other Members</span>
                    {taskMembers?.map((mem, index) => {
                        const isOther = ![...mem.user?.userDesignations?.map(i => i.designationId).filter(i => deptIds.includes(i))].length;
                        if (isOther) {
                            const fStatus = taskDetails?.taskStatuses?.find(item => item.userId === mem.user.id) || null;
                            const taskStatus = fStatus && !(completedBy) ? fStatus.status : 'Undefined';
                            return (
                                <MuiTooltip title={`Click to view ${mem.user.name}'s info`} key={index}>
                                    <li id={`member-${mem.user.id}`} className={`d-flex ${classes.member} cursor-pointer mb-1 gap-10`} onClick={() => setInspectUser(mem.user.id)}>
                                        <div className={`position-relative task-profile-svg`} title={`${mem.user.name} ${taskStatus && `, Status: ${taskStatus}`}`}>
                                            <img className='' src={getImageURL(mem.user.profilePicture, '30x30')} alt="m" width={30} height={30} />
                                            <div className="position-absolute svg-wrap">
                                                {getTaskStatusSvg(taskStatus)}
                                            </div>
                                        </div>
                                        <span className='text-truncate d-flex align-items-center'>{mem.user.name}</span>
                                    </li>
                                </MuiTooltip>
                            )
                        }
                        return null;
                    })}

                </div>
            </>)
        } catch (error) {
            console.error(error);
        }
    }, [taskDetails?.taskDepartments, taskMembers, completedBy, setInspectUser, taskDetails?.taskStatuses]);

    return (
        <ErrorBoundary>
            <div className="col-sm-6 col-md-12">
                <div className="card mb-2 light-shadow">
                    <div className="card-body p-2">
                        {(taskDetails.status === CONST.TASK_STATUS[4].value ||
                            taskDetails.status === CONST.TASK_STATUS[3].value) &&
                            <AssignedProvider
                                taskDetails={taskDetails}
                                isTaskFinished={isTaskFinished}
                                setInspectUser={setInspectUser}
                                haveAccess={haveAccess}
                            />}
                        {haveAccess &&
                            <MembersMenu
                                taskMembers={taskMembers}
                                setTaskMember={setTaskMember}
                                taskDetails={taskDetails}
                                userDesignations={userDesignations}
                                isTaskFinished={isTaskFinished}
                                setAssignDesg={setAssignDesg}
                                assignDesignation={assignDesignation}
                            />}
                        {taskDetails?.isDepartment ? <>
                            {AssignedDepartments}
                        </> : <>
                            {FinishedByUsers}
                            {AssignedMembers}
                        </>
                        }
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}