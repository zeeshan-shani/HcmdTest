import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import { getUsersList } from 'redux/actions/chatAction';
import { getPresignedUrl, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { ConnectInNewChat, notifyUsers, SocketEmiter } from 'utils/wssConnection/Socket';
import useDebounce from 'services/hooks/useDebounce';
import { generatePayload, getImageURL } from 'redux/common';
import { MuiTooltip } from 'Components/components';
import { Check } from 'react-bootstrap-icons';
import { CONST, SOCKET } from 'utils/constants';
import { useClickAway } from 'react-use';
import { Col, Row } from 'react-bootstrap';
import Input from 'Components/FormBuilder/components/Input';
import { Verified } from '@mui/icons-material';
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';
import templateTabService from 'services/APIs/services/templateTabService';
import chatService from 'services/APIs/services/chatService';

const defaultState = {
    currStep: 1,
    groupName: '',
    usersList: [],
    searchUser: '',
    checked: [],
    isGroupCreating: false,
    profileImage: { name: "Choose File" },
    selectAll: false,
    assignMembers: [],
    assignDesignation: [],
    showMembers: false,
    loadingTemplates: false,
    templateData: []
}
export default function CreateGroup() {
    const { user } = useSelector((state) => state.user);
    const [state, setState] = useState(defaultState);
    const {
        currStep,
        groupName,
        searchUser,
        checked,
        isGroupCreating,
        profileImage,
    } = state;
    const newUser = useDebounce(searchUser, 500);

    const onCancelHandler = () => {
        setState(defaultState);
        changeModel("");
    }
    const onFinishHandler = () => onCancelHandler();

    useEffect(() => {
        // Get User List on Search
        const getData = async () => {
            const payload = await generatePayload({
                keys: ["name", "firstName", "lastName"], value: newUser,
                rest: { includeOwn: false, isActive: true },
                options: {
                    populate: ["designations", "companyRoleData", "users:own"],
                    sort: [["name", "ASC"]],
                }
            });
            const res = await getUsersList(payload);
            if (res?.status)
                setState(prev => ({ ...prev, usersList: res.data }));
        }
        getData();
    }, [newUser]);
    try {
        const inputChange = e => {
            const { name, value } = e.target;
            setState(prev => ({ ...prev, [name]: value }));
        }


        const onUploadImage = async () => {
            if (profileImage && profileImage.name !== "Choose File") {
                const res = await getPresignedUrl({
                    fileName: profileImage.name,
                    fileType: profileImage.type
                });
                return res.data.url;
            } return null;
        }

        const onCreateGroupHandler = async () => {
            const presignedUrl = await onUploadImage();
            const uploadedImageUrl = await uploadToS3(presignedUrl, profileImage);
            const res = await chatService.createChat({
                payload: {
                    type: CONST.CHAT_TYPE.GROUP,
                    users: [user.id],
                    name: groupName, image: uploadedImageUrl,
                    templateTabIds: state.templateData.map(i => i.value)
                }
            });
            if (res?.status === 1) {
                setState(prev => ({ ...prev, currStep: prev.currStep + 1, isGroupCreating: false }));
                SocketEmiter(SOCKET.REQUEST.ADD_MEMBER, { chatId: res.data.id, users: checked });
                // loadUserChatList(user.id, false, true);
                notifyUsers(res.data.createdBy, res.data.id, res.data.users, res.data.type);
                // setUserHandler(res.data, activeChat.id, user.id);
                ConnectInNewChat(res.data, user.id);
            }
        }

        return (<>
            <div className="modal modal-lg-fullscreen fade show" id="createGroup" tabIndex={-1} role="dialog" aria-labelledby="createGroupLabel" aria-modal="true" style={{ display: 'block' }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title js-title-step" id="createGroupLabel">&nbsp;<span className="label label-success">1</span> Create a New Group</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => changeModel("")}>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body py-0 hide-scrollbar">
                            {/* Step: 1 - Create a new group  */}
                            {currStep === 1 &&
                                <ChatStep1
                                    state={state}
                                    currStep={currStep}
                                    inputChange={inputChange}
                                    setState={setState}
                                    profileImage={profileImage}
                                />}
                            {/* Step: 2 - Add group members  */}
                            {currStep === 2 &&
                                <ChatStep2
                                    state={state}
                                    setState={setState}
                                    inputChange={inputChange}
                                />}
                            {/* Step: 3 - template Allocation  */}
                            {currStep === 3 &&
                                <ChatStep3
                                    currStep={currStep}
                                    state={state}
                                    setState={setState}
                                />}
                            {/* Step: 4 - Finished  */}
                            {currStep === 4 && <ChatStep4 currStep={currStep} />}
                        </div>
                        <div className="modal-footer">
                            {currStep !== 4 && <>
                                <button
                                    className="btn btn-link text-muted js-btn-step mr-auto"
                                    data-orientation="cancel"
                                    data-dismiss="modal"
                                    onClick={() => onCancelHandler()}>Cancel</button>
                                <button
                                    className="btn btn-secondary  js-btn-step"
                                    data-orientation="previous"
                                    data-step={currStep}
                                    disabled={currStep === 1}
                                    onClick={() => setState(prev => ({ ...prev, currStep: prev.currStep - 1 }))}>Previous</button></>}
                            {!isGroupCreating ? <button
                                className="btn btn-primary js-btn-step"
                                data-orientation="next"
                                data-step={(currStep === 4) ? 'complete' : currStep}
                                onClick={() => {
                                    if (currStep < 4 && groupName !== "") {
                                        if (currStep === 3) {
                                            // setCreatingStatus(true);
                                            setState(prev => ({ ...prev, isGroupCreating: true }));
                                            onCreateGroupHandler();
                                        } else {
                                            setState(prev => ({ ...prev, currStep: prev.currStep + 1 }))
                                        }
                                    }
                                    else if (currStep === 4) onFinishHandler();
                                }}
                                disabled={groupName === "" || groupName.length < 4}
                            >
                                {currStep === 4 ? 'Finish' : 'Next'}
                            </button> :
                                <button
                                    className="btn btn-primary js-btn-step"
                                    data-orientation="next"
                                    data-step={3}
                                    disabled
                                >
                                    {`Creating Group...`}
                                </button>
                            }
                        </div>
                    </div>
                </div>
                <input type="hidden" id="actual-step" defaultValue={currStep} /></div>
        </>);
    } catch (error) {
        console.error(error);
    }
}

const ChatStep1 = ({ inputChange, state, setState, profileImage }) => {
    const OnProfileImageChangeHandler = (e) => {
        if (e.target.files && e.target.files.length > 0)
            setState(prev => ({ ...prev, profileImage: e.target.files[0] }));
    }
    return (
        <Row className={"pt-2"}>
            <Col xs={12}>
                <Input
                    Label="Group name"
                    name="groupName"
                    value={state.groupName}
                    isRequired={true}
                    handleChange={inputChange}
                    inputProps={{ maxLength: 25 }}
                    placeholder="Type group name here"
                    autoFocus
                />
            </Col>
            <Col xs={12}>
                <div className="form-group">
                    <label>Choose profile picture</label>
                    <div className="custom-file">
                        <input
                            type="file"
                            className="custom-file-input"
                            id="profilePictureInput"
                            accept="image/jpeg, image/jpg, image/png"
                            onChange={OnProfileImageChangeHandler}
                        />
                        <label className="custom-file-label" htmlFor="profilePictureInput">
                            {profileImage?.name}
                        </label>
                    </div>
                </div>
            </Col>
        </Row>
    )
}

const ChatStep2 = ({ state, setState, inputChange }) => {
    const { userDesignations } = useSelector((state) => state.chat);
    const dropdownTaskRef = useRef();
    useClickAway(dropdownTaskRef, (e) => setState(prev => ({ ...prev, showMembers: false })))

    const {
        usersList,
        searchUser,
        checked,
        selectAll,
        assignMembers,
        assignDesignation,
        showMembers,
    } = state;
    const memberRef = useRef();

    // Add/Remove checked item from list
    const handleCheck = async (event) => {
        let updatedList = [...checked];
        if (event.target.checked)
            updatedList = [...checked, Number(event.target.value)];
        else {
            const index = updatedList.findIndex((itemId) => itemId === Number(event.target.value));
            updatedList.splice(index, 1);
        }
        setState(prev => ({ ...prev, checked: updatedList }));
    };

    const onchangeSelectAll = (e) => {
        const selectChecked = e.target.checked;
        let updatedList = checked;
        for (const item of usersList) {
            if (selectChecked) {
                updatedList = updatedList.filter((itemId) => itemId !== Number(item.id));
                updatedList = [...updatedList, Number(item.id)];
            } else {
                if (updatedList.includes(item.id))
                    updatedList = updatedList.filter((itemId) => itemId !== Number(item.id));
            }
        }
        setState(prev => ({ ...prev, selectAll: e.target.checked, checked: updatedList }));
    }

    const addMemberHandler = (member) => {
        if (assignMembers.some((mem) => mem.id === member.id))
            setState(prev => ({ ...prev, assignMembers: prev.assignMembers.filter((mem) => mem.id !== member.id), checked: prev.checked.filter((memId) => memId !== member.id) }));
        else
            setState(prev => ({ ...prev, assignMembers: [member, ...prev.assignMembers], checked: [member.id, ...prev.checked] }));
    };
    const addDesgMembers = (desg) => {
        if (assignDesignation.some((item) => item.id === desg.id)) {
            usersList.forEach(usr => {
                if (usr?.userDesignations &&
                    usr?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    assignMembers.some((mem) => mem.id === usr.id))
                    addMemberHandler(usr);
            });
            setState(prev => ({ ...prev, assignDesignation: prev.assignDesignation.filter((item) => item.id !== desg.id) }));
        } else {
            usersList.forEach(usr => {
                if (usr?.userDesignations &&
                    usr?.userDesignations.map(item => item.designationId).includes(desg.id) &&
                    !assignMembers.some((mem) => mem.id === usr.id))
                    addMemberHandler(usr);
            });
            setState(prev => ({ ...prev, assignDesignation: [desg, ...prev.assignDesignation] }));
        }
    };
    return (
        <Row>
            <Col xs={12} className="p-0">
                {/* Search Start */}
                <form className="form-inline w-100 p-2 border-bottom" onSubmit={e => e.preventDefault()}>
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
                        <input type="text" className="form-control form-control-md search br-0"
                            placeholder="Search User"
                            value={searchUser}
                            id="searchUser"
                            name="searchUser"
                            onChange={inputChange}
                        />
                    </div>
                </form>
            </Col>
            <Col xs={12} className="p-0">
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
                    {usersList.map((item, index) => {
                        const subline = (item?.companyRoleData?.name && item?.companyName) ? `${item.companyRoleData.name} at ${item.companyName}` : item?.companyName;
                        return (
                            <li className="list-group-item" key={item.id}>
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
            </Col>
        </Row>
    )
}

const ChatStep3 = ({ setState, state }) => {
    const loadSuggestions = debounce(async (query, callback) => {
        setState(prev => ({ ...prev, loadingTemplates: true }));
        let payload = await generatePayload({
            keys: ["title"], value: query || "",
            options: {
                attributes: ["id", "title"],
                pagination: true, limit: 10,
            },
        });
        const data = await templateTabService.list({ payload });
        setState(prev => ({ ...prev, loadingTemplates: false }));
        if (data?.status === 1)
            return callback(data.data.map(item => ({ label: item.title, value: item.id })));
        return callback([]);
    }, 1000);

    return (
        <div className='mt-2'>
            <label>Group Message Templates</label>
            <AsyncSelect
                classNamePrefix="select"
                className={`basic-single`}
                isClearable
                value={state.templateData || []}
                placeholder={`Select Message Templates...`}
                loadOptions={loadSuggestions}
                isLoading={state.loading}
                menuPlacement="bottom"
                onChange={(value) => setState(prev => ({ ...prev, templateData: value }))}
                isMulti
            />
        </div>
    )
}

const ChatStep4 = () => {
    return (
        <div className="d-flex justify-content-center align-items-center flex-column h-100">
            <Verified className='text-success mb-2' style={{ width: '2em', height: '2em' }} />
            <h6>Group Created Successfully</h6>
            <p className="text-muted">Happy chatting!!</p>
        </div>
    )
}