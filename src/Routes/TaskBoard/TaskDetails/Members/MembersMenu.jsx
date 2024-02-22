import React, { useCallback, useMemo } from 'react'
import { Select, Space } from 'antd';
import { compareName } from 'Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo';
import { SocketEmiter, SocketListener } from 'utils/wssConnection/Socket';
import { CONST, SOCKET } from 'utils/constants';
import { showError, showSuccess } from 'utils/package_config/toast';
import { getAdminAccess } from 'utils/permission';
import { dispatch } from 'redux/store';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { useSelector } from 'react-redux';
const { Option, OptGroup } = Select;

export default function MembersMenu({
    taskMembers, taskDetails, setTaskMember, userDesignations, isTaskFinished, setAssignDesg, assignDesignation
}) {
    const { user } = useSelector(state => state.user);
    const { desgOpt, memberOpt } = useMemo(() => {
        const desgOpt = userDesignations?.map(i => ({ label: i.name, value: i.name, id: i.id, type: "desg", data: i })) || [];
        const isAdmin = taskDetails.createdBy === user.id || getAdminAccess({ roleData: user.roleData }) || taskDetails?.chatDetails.chatusers.find(i => i.userId === user.id)?.isAdmin;
        const memberOpt = taskDetails?.chatDetails?.chatusers
            .filter((usr) => isAdmin || usr.userId === user.id)
            .sort(compareName)
            .map(i => ({ label: i.user.name, value: i.user.name, id: i.user.id, type: "user", data: i })) || [];
        return { desgOpt, memberOpt };
    }, [taskDetails?.chatDetails?.chatusers, taskDetails?.createdBy, userDesignations, user?.id, user?.roleData]);

    const updateMembers = useCallback(async () => {
        if (taskMembers && taskMembers !== taskDetails.taskmembers) {
            const latestMembers = taskMembers.map((item) => item.user.id);
            const taskmembers = taskDetails.taskmembers.map((item) => item.user.id);
            const data = {
                taskId: taskDetails.id,
                chatId: taskDetails.chatDetails.id,
                addedMember: latestMembers?.filter(item => !taskmembers.includes(item)),
                removedMember: taskmembers?.filter(item => !latestMembers.includes(item)),
                designationIds: assignDesignation.map(i => i.id)
            }
            if (!!data.addedMember?.length || !!data.removedMember?.length) {
                SocketEmiter(SOCKET.REQUEST.UPDATE_ASSIGN_MEMBER, data, (data) => {
                    showSuccess(data.message || "Members Updated")
                });
                // ListenUpdateAssignMember(taskDetails);
                SocketListener(SOCKET.RESPONSE.UPDATE_ASSIGN_MEMBER, (data) => {
                    if (taskDetails && taskDetails.id) {
                        dispatch({ type: TASK_CONST.UPDATE_TASK_MEMBERS, payload: data.data });
                        dispatch({ type: TASK_CONST.UPDATE_ACTIVITY_LOGS });
                    }
                });
            }
        }
    }, [taskMembers, taskDetails, assignDesignation]);

    const addMemberHandler = useCallback((member) => {
        if (taskMembers.some((mem) => mem.user.id === member.userId))
            setTaskMember((prev) => (prev.filter((mem) => mem.user.id !== member.userId)));
        else setTaskMember((prev) => ([...prev, member]));
    }, [setTaskMember, taskMembers]);

    const addDesgMembers = useCallback((desg) => {
        if (assignDesignation.some((item) => item.id === desg.id)) {
            taskDetails?.chatDetails?.chatusers.forEach(user => {
                if (user?.user?.userDesignations &&
                    user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    taskMembers.some((mem) => mem.user.id === user.user.id))
                    addMemberHandler(user)
            });
            setAssignDesg((prev) => (prev.filter((item) => item.id !== desg.id)))
        } else {
            taskDetails?.chatDetails?.chatusers.forEach(user => {
                if (user?.user?.userDesignations &&
                    user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    !taskMembers.some((mem) => mem.user.id === user.user.id))
                    addMemberHandler(user)
            });
            setAssignDesg((prev) => ([desg, ...prev]))
        }
    }, [addMemberHandler, assignDesignation, taskDetails?.chatDetails?.chatusers, taskMembers, setAssignDesg]);

    const handleDesgOption = (desg) => addDesgMembers(desg.data);
    const handleMemberOption = (member) => addMemberHandler(member.data);

    return (
        <div className="text-center">
            <Space direction="vertical" style={{ width: "100%" }}>
                <Select
                    mode="multiple"
                    size={"middle"}
                    value={[
                        ...assignDesignation?.map(i => i.name),
                        ...taskMembers?.map((i) => i.user?.name)]
                        || []}
                    onSelect={(e, v) => v.onClick()}
                    onDeselect={(e, v) => v.onClick()}
                    onClick={() => isTaskFinished && showError("Task is already Finished. Can't modify members")}
                    style={{ width: "100%" }}
                    placement="topLeft"
                    onBlur={updateMembers}
                    disabled={isTaskFinished}
                    maxTagCount="responsive"
                >
                    {(!taskDetails.chatDetails || taskDetails.chatDetails.type === CONST.CHAT_TYPE.GROUP) &&
                        !!desgOpt?.length &&
                        <OptGroup label="Designations">
                            {desgOpt
                                ?.map((item, index) => (
                                    <Option key={`desg-${index}`} value={item.value} onClick={() => handleDesgOption(item)}>
                                        {item.label}
                                    </Option>
                                ))}
                        </OptGroup>}
                    {!!memberOpt?.length &&
                        <OptGroup label="Users">
                            {memberOpt?.map((item, index) => (
                                <Option key={`member-${index}`} value={item.value} onClick={() => handleMemberOption(item)}>
                                    {item.label}
                                </Option>
                            ))}
                        </OptGroup>}
                </Select>
            </Space>
        </div>
    )
}
