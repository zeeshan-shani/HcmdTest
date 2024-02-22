import React, { useCallback, useMemo } from 'react'
import { Select, Space } from 'antd'
import { CONST } from 'utils/constants';
import { compareName } from '../info/group-chat-info/GroupChatInfo';
import { useSelector } from 'react-redux';

const { Option, OptGroup } = Select;

export default function MemberAssign({
    memberRef, assignMembers, userDesignations, setAssignMem, assignDesignation, setAssignDesg
}) {
    const { activeChat } = useSelector(state => state.chat);
    const { desgOpt, memberOpt } = useMemo(() => {
        const desgOpt = userDesignations?.map(i =>
            ({ label: i.name, value: i.name, id: i.id, type: "desg", data: i })) || [];
        const memberOpt = activeChat.chatusers.sort(compareName)
            .map(i => ({ label: i.user.name, value: i.user.name, id: i.user.id, type: "user", data: i })) || [];
        return { desgOpt, memberOpt }
    }, [activeChat.chatusers, userDesignations]);

    const addMemberHandler = useCallback((member) => {
        if (assignMembers.some((mem) => mem.user.id === member.userId))
            setAssignMem((prev) => (prev.filter((mem) => mem.user.id !== member.userId)));
        else setAssignMem((prev) => ([...prev, member]));
    }, [setAssignMem, assignMembers]);

    const addDesgMembers = useCallback((desg) => {
        if (assignDesignation.some((item) => item.id === desg.id)) {
            activeChat?.chatusers.forEach(user => {
                if (user?.user?.userDesignations &&
                    user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    assignMembers.some((mem) => mem.user.id === user.user.id))
                    addMemberHandler(user)
            });
            setAssignDesg((prev) => (prev.filter((item) => item.id !== desg.id)))
        } else {
            activeChat?.chatusers.forEach(user => {
                if (user?.user?.userDesignations &&
                    user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    !assignMembers.some((mem) => mem.user.id === user.user.id))
                    addMemberHandler(user)
            });
            setAssignDesg((prev) => ([desg, ...prev]))
        }
    }, [addMemberHandler, assignDesignation, activeChat?.chatusers, assignMembers, setAssignDesg]);

    const handleDesgOption = (desg) => addDesgMembers(desg.data);
    const handleMemberOption = (member) => addMemberHandler(member.data);

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Select
                ref={memberRef}
                mode="multiple"
                size={"middle"}
                value={[
                    ...assignMembers?.map((i) => i.user.name),
                    ...assignDesignation?.map(i => i.name),
                ] || []}
                onSelect={(e, v) => v.onClick()}
                virtual={true}
                onDeselect={(e, v) => v.onClick()}
                style={{ width: "100%" }}
                placement="topLeft"
                placeholder="Select Members"
            // maxTagCount=""
            >
                {(activeChat.type === CONST.CHAT_TYPE.GROUP) &&
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
    )
}

// {/* <div className="dropdown show chat-member-dropdown open-upside" ref={dropdownTaskRef}>
//     <MuiTooltip title={`${!!assignMembers.length ? `Assigned to: ${assignMembers.map((item) => item.user.name).join(", ")}` : 'Click to assign members'}`}>
//         <button className="dropdown-toggle btn btn-sm bg-dark-f light-text-70 p-4_8 input-border font-inherit"
//             onClick={() => setShowMembers(!showMembers)}
//             ref={memberRef}>
//             <span>{`Members (${assignMembers?.length})`}</span>
//         </button>
//     </MuiTooltip>
//     {showMembers &&
//         <ul className="dropdown-menu text-light show font-inherit">
//             {userDesignations?.map((item) => (
//                 <li key={'d-' + item.id} className={`dropdown-item cursor-pointer`} onClick={() => addDesgMembers(item)}>
//                     <div className="d-flex justify-content-between w-100">
//                         <span>{item.name}</span>
//                         <span>
//                             {!!assignDesignation.filter((desg) => desg.id === item.id).length ? (<Check size={16} />) : ("")}
//                         </span>
//                     </div>
//                 </li>
//             ))}
//             <hr className='my-1' />
//             {activeChat?.chatusers
//                 .filter(item => item?.user?.isActive && !item?.isGhostChat && !item?.isDeleted)
//                 .sort(compareName)
//                 .map((member) => (
//                     <li key={member.user.id} className={`dropdown-item cursor-pointer`} onClick={() => addMemberHandler(member)}>
//                         <div className="d-flex justify-content-between w-100">
//                             <span>{member.user.name}</span>
//                             <span>
//                                 {!!assignMembers.filter((mem) => mem.user.id === member.user.id).length ? (<Check size={16} />) : ("")}
//                             </span>
//                         </div>
//                     </li>
//                 ))}
//         </ul>}
// </div>  */}