import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import useDebounce from 'services/hooks/useDebounce';
import { getUsersList } from 'redux/actions/chatAction';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { SOCKET } from 'utils/constants';
import { generatePayload, getImageURL } from 'redux/common';
import { MuiTooltip } from 'Components/components';
import { Check } from 'react-bootstrap-icons';
import { useClickAway } from 'react-use';

const defaultState = {
    users: [],
    searchUser: '',
    checked: [],
    selectAll: false,
    assignMembers: [],
    assignDesignation: [],
    showMembers: false,
    initMessage: false
}
export default function AddUsertoGroup() {
    // const { name } = useSelector((state) => state.model);
    const { activeChat, userDesignations } = useSelector((state) => state.chat);
    const [state, setState] = useState(defaultState);
    const { users, searchUser, checked, selectAll, assignMembers, assignDesignation, showMembers } = state;

    const AllUsersId = [...activeChat?.chatusers?.map((item) => item.userId)];
    const memberRef = useRef();
    const newUser = useDebounce(searchUser, 500);
    const dropdownTaskRef = useRef();
    useClickAway(dropdownTaskRef, () => setState(prev => ({ ...prev, showMembers: false })))

    useEffect(() => {
        const getData = async () => {
            const payload = await generatePayload({
                keys: ["name", "firstName", "lastName"], value: newUser,
                rest: { includeOwn: false, isActive: true },
                options: {
                    sort: [["name", "ASC"]],
                    populate: ["designations", "companyRoleData", "users:own"],
                }
            });
            const res = await getUsersList(payload);
            if (res?.status === 1)
                setState(prev => ({ ...prev, users: res.data.filter(item => !AllUsersId.includes(item.id)) }));
        }
        getData();
        //eslint-disable-next-line
    }, [newUser]);

    const onchangeSelectAll = useCallback((e) => {
        const selectChecked = e.target.checked;
        let updatedList = checked;
        for (const item of users) {
            if (selectChecked) {
                updatedList = updatedList.filter((itemId) => itemId !== Number(item.id));
                updatedList = [...updatedList, Number(item.id)];
            } else {
                if (updatedList.includes(item.id))
                    updatedList = updatedList.filter((itemId) => itemId !== Number(item.id));
            }
        }
        setState(prev => ({ ...prev, selectAll: e.target.checked, checked: updatedList }));
    }, [checked, users]);

    const onAddUserClickHandler = useCallback(() => {
        SocketEmiter(SOCKET.REQUEST.ADD_MEMBER, { chatId: activeChat.id, users: checked, initialMessage: state.initMessage });
        changeModel();
    }, [activeChat.id, checked, state.initMessage]);

    // Add/Remove checked item from list
    const handleCheck = useCallback((event) => {
        let updatedList = [...checked];
        if (event.target.checked) updatedList = [...checked, Number(event.target.value)];
        else {
            const index = updatedList.findIndex((itemId) => itemId === Number(event.target.value));
            updatedList.splice(index, 1);
        }
        setState(prev => ({ ...prev, checked: updatedList }));
    }, [checked]);

    const addMemberHandler = useCallback((member) => {
        if (assignMembers.some((mem) => mem.id === member.id))
            setState(prev => ({ ...prev, assignMembers: prev.assignMembers.filter((mem) => mem.id !== member.id), checked: prev.checked.filter((memId) => memId !== member.id) }));
        else
            setState(prev => ({ ...prev, assignMembers: [member, ...prev.assignMembers], checked: [member.id, ...prev.checked] }));
    }, [assignMembers]);

    const addDesgMembers = useCallback((desg) => {
        if (assignDesignation.some((item) => item.id === desg.id)) {
            users.forEach(usr => {
                if (usr?.userDesignations &&
                    usr?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    assignMembers.some((mem) => mem.id === usr.id))
                    addMemberHandler(usr);
            });
            setState(prev => ({ ...prev, assignDesignation: prev.assignDesignation.filter((item) => item.id !== desg.id) }));
        } else {
            users.forEach(usr => {
                if (usr?.userDesignations &&
                    usr?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    !assignMembers.some((mem) => mem.id === usr.id))
                    addMemberHandler(usr);
            });
            setState(prev => ({ ...prev, assignDesignation: [desg, ...prev.assignDesignation] }));
        }
    }, [assignMembers, assignDesignation, addMemberHandler, users]);

    try {
        return (<>
            <div className="modal modal-lg-fullscreen fade show d-block" data-toggle="modal" id="startConversation" tabIndex={-1} role="dialog" aria-labelledby="startConversationLabel" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="startConversationLabel">Add User to Group</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => changeModel("")}>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body p-0 hide-scrollbar">
                            <div className="row pt-2" data-title="Add Group Members">
                                <div className="col-12">
                                    <form className="form-inline w-100 px-2 pb-2 border-bottom" onSubmit={e => e.preventDefault()}>
                                        <div className="input-group w-100">
                                            <div className="input-group-append">
                                                <div className="input-group-text p-0" role="button">
                                                    <div className="dropdown show select-group-dropdown transparent-bg" ref={dropdownTaskRef}>
                                                        <MuiTooltip title={`${!!assignDesignation.length ? `Assigned to: ${assignDesignation.map((item) => item.name).join(", ")}` : 'Click to select designation'}`}>
                                                            <button className="dropdown-toggle btn btn-sm border-0 light-text-70 p-4_8"
                                                                // bg-dark-f
                                                                onClick={() => setState(prev => ({ ...prev, showMembers: !prev.showMembers }))}
                                                                ref={memberRef}>
                                                                <span>{`Designation (${assignDesignation?.length})`}</span>
                                                            </button>
                                                        </MuiTooltip>
                                                        {showMembers &&
                                                            <ul className="dropdown-menu text-light show">
                                                                {userDesignations?.map((item) => (
                                                                    <li key={'d-' + item.id} className={`dropdown-item cursor-pointer`} onClick={() => addDesgMembers(item)}>
                                                                        <div className="d-flex justify-content-between w-100">
                                                                            <span>{item.name}</span>
                                                                            <span>
                                                                                {!!assignDesignation.filter((desg) => desg.id === item.id).length ? (<Check size={16} />) : ("")}
                                                                            </span>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>}
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="text" className="form-control form-control-md search br-0" placeholder="Search User"
                                                value={searchUser}
                                                onChange={(e) => setState(prev => ({ ...prev, searchUser: e.target.value }))} />
                                        </div>
                                    </form>
                                </div>
                                <div className="col-12">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item border-0" key={-1}>
                                            <div className="media justify-content-between">
                                                <div>
                                                    <p className='mb-0'>Select all</p>
                                                </div>
                                                <div className="media-options">
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            className="custom-control-input"
                                                            id={`select-all`}
                                                            name={`select-all`}
                                                            type="checkbox"
                                                            value={-2}
                                                            checked={selectAll}
                                                            onChange={onchangeSelectAll}
                                                        />
                                                        <label className="custom-control-label" htmlFor={`select-all`} />
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="media-label" htmlFor={`select-all`} />
                                        </li>
                                        {users.map((item, index) => {
                                            const subline = (item?.companyRoleData?.name && item?.companyName) ? `${item.companyRoleData.name} at ${item.companyName}` : item?.companyName;
                                            return (<li className="list-group-item" key={item.id}>
                                                <div className="media">
                                                    <div className={`avatar avatar-${item.profileStatus} mr-2`}>
                                                        <img src={getImageURL(item.profilePicture, '50x50')} alt="" />
                                                    </div>
                                                    <div className="media-body">
                                                        <h6 className="text-truncate">
                                                            <div className="text-reset username-text">{item.name}</div>
                                                        </h6>
                                                        <p className="mb-0 text-truncate in-one-line">{subline}</p>
                                                    </div>
                                                    <div className="media-options">
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                className="custom-control-input"
                                                                id={`chx-user-${item.id}`}
                                                                name={`chx-users`}
                                                                type="checkbox"
                                                                value={item.id}
                                                                checked={checked.includes(item.id)}
                                                                onChange={handleCheck}
                                                            />
                                                            <label className="custom-control-label" htmlFor={`chx-user-${item.id}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <label className="media-label" htmlFor={`chx-user-${item.id}`} />
                                            </li>)
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" name='rememberMe' className="custom-control-input" id="checkbox-remember" value={state.initMessage} onChange={(e) => setState(prev => ({ ...prev, initMessage: e.target.checked }))} />
                                <label className="custom-control-label text-muted font-size-sm" htmlFor="checkbox-remember">View initial messages</label>
                            </div>
                            <button className="btn btn-primary js-btn-step" disabled={!checked.length} onClick={onAddUserClickHandler}>
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    } catch (error) {
        console.error(error);
    }
}