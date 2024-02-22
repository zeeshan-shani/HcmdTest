import React, { useCallback, useMemo, useState } from 'react'
import { dispatch } from 'redux/store';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { BuildingFillCheck, QuestionCircle, StarFill, TelephoneFill } from 'react-bootstrap-icons';
import ModalReactstrap from './Modal';
import ErrorBoundary from 'Components/ErrorBoundry';
import { getImageURL } from 'redux/common';
import GlobalSearch from 'Routes/SuperAdmin/components/GlobalSearch';

export const getListdata = (insUser) => {
    return [
        { title: 'Facility', content: insUser?.facilityInfo?.name, icon: <BuildingFillCheck className='text-muted' /> },
        { title: 'Phone', content: insUser.phone, icon: <TelephoneFill className='text-muted' /> },
        { title: 'SSN', content: insUser.SSN, icon: <StarFill className='text-muted' /> },
        { title: 'DOB', content: insUser.DOB, icon: <StarFill className='text-muted' /> },
        { title: 'Gender', content: insUser.gender, icon: <QuestionCircle className='text-muted' /> },
    ]
}

export const getPatientName = (name1, name2, name3) =>
    [name1, name2, name3].filter(i => i).join(" ")

export default function PatientInfoModal({ showModal, inspectPatient }) {
    const [tab, setTab] = useState(1);

    const onClose = useCallback(() => dispatch({ type: CHAT_CONST.SET_INSPECT_PATIENT, payload: null }), []);
    // const onClickUserChat = useCallback(async () => {
    //     await toastPromise({
    //         func: async (myResolve, myReject) => {
    //             try {
    //                 const res = await CreatePrivateChat(inspectUser?.id, user.id);
    //                 const payload = await generatePayload({
    //                     rest: { includeChatUserDetails: false },
    //                     options: { "populate": ["lastMessage"] },
    //                     isCount: true
    //                 });
    //                 if (res?.status === 1) {
    //                     onClose();
    //                     loadUserChatList(payload);
    //                     notifyUsers(res.data.createdBy, res.data.id, res.data.users, res.data.type);
    //                     setUserHandler({ chat: res.data, activeChatId: activeChat?.id, userId: user.id, navigate });
    //                     ConnectInNewChat(res.data, user.id);
    //                 } else if (res?.status === 2) {
    //                     onClose();
    //                     loadUserChatList(payload);
    //                     setUserHandler({ chat: res.data, activeChatId: activeChat?.id, userId: user.id, navigate });
    //                 }
    //                 myResolve("OK");
    //             } catch (error) {
    //                 myReject("Error");
    //             }
    //         },
    //         loading: "Requesting Chat",
    //         success: <b>Successfully Get Chat</b>,
    //         error: <b>Could not load Chat.</b>,
    //         options: { id: "get-user-data" }
    //     })
    // }, [activeChat?.id, navigate, onClose, inspectUser?.id, user?.id]);

    return (
        <ModalReactstrap
            show={showModal ? true : false}
            header="Patient Info"
            toggle={onClose}
            Modalprops={{ modalClassName: 'hide-scrollbar', className: 'user-info-modal' }}
            size="lg"
            body={<ErrorBoundary>
                {showModal &&
                    <div className="container-xl">
                        <div className="row">
                            <div className="col">
                                <div className="card card-body card-bg-1 mb-3">
                                    <div className="d-flex align-items-center gap-10">
                                        <div className="avatar avatar-lg mx-2">
                                            <img className="avatar-img" src={getImageURL(inspectPatient?.profilePicture, '80x80')} alt="" />
                                        </div>
                                        <div className="d-flex flex-column">
                                            <h5 className="mb-1">
                                                {getPatientName(inspectPatient?.lastName, inspectPatient?.firstName, inspectPatient?.middleName)}
                                            </h5>
                                            {!!inspectPatient?.patientSlots?.length && inspectPatient?.patientSlots[0]?.roomNumber &&
                                                <span className='text-muted mb-1'>Room no.: {inspectPatient?.patientSlots[0]?.roomNumber}</span>}
                                            <div className='d-flex flex-wrap'>
                                                {inspectPatient?.patientAssigns?.map((provider) => (
                                                    <nobr key={provider?.userId} className="desg-tag mr-1 p-1 mb-1">
                                                        {provider?.usersPatient?.name}
                                                    </nobr>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <nav className='dashboard-nav mb-2'>
                            <div className="nav nav-tabs flex-nowrap hide-scrollbar" id="nav-tab" role="tablist" style={{ overflowX: 'auto' }}>
                                <div className={`nav-link ${tab === 1 ? 'active' : ''}`} type="button" role="tab" onClick={() => setTab(1)}>
                                    <nobr>{"Info"}</nobr>
                                </div>
                                <div className={`nav-link ${tab === 2 ? 'active' : ''}`} type="button" role="tab" onClick={() => setTab(2)}>
                                    <nobr>{"Messages"}</nobr>
                                </div>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent" style={{ paddingBottom: '60px' }}>
                            <div className={"tab-pane fade show active"} role="tabpanel">
                                <ErrorBoundary>
                                    {tab === 1 && <PatientInfo inspectPatient={inspectPatient} />}
                                    {tab === 2 && <PatientMessages inspectPatient={inspectPatient} />}
                                </ErrorBoundary>
                            </div>
                        </div>
                    </div>}
            </ErrorBoundary>}

        />);
    // return (
    //     <ModalReactstrap
    //         show={showModal ? true : false}
    //         header="Patient Info"
    //         toggle={onClose}
    //         Modalprops={{ modalClassName: 'hide-scrollbar', className: 'user-info-modal' }}
    //         size="lg"
    //         body={
    //             <ErrorBoundary>

    //             </ErrorBoundary>}
    //     />
    // )
}

const PatientInfo = ({ inspectPatient }) => {
    const userdataList = useMemo(() => inspectPatient && getListdata(inspectPatient), [inspectPatient]);

    return (
        <div className="row friends-info">
            <div className="col">
                <div className="card">
                    <ul className="list-group list-group-flush">
                        {userdataList && userdataList.map((item, index) => {
                            return (
                                <li className="list-group-item" key={index}>
                                    <div className="media align-items-center">
                                        <div className="media-body">
                                            <p className="small mb-0">{item.title}</p>
                                            {item.content ?
                                                <p className="mb-0">{item.content}</p>
                                                : <p className="mb-0 text-muted">{'(Not added yet)'}</p>
                                            }
                                        </div>
                                        {item.icon}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}

const PatientMessages = ({ inspectPatient }) => {
    return (
        <GlobalSearch
            modalView={false}
            label={getPatientName(inspectPatient?.lastName, inspectPatient?.firstName)}
            searchArr={[`<@${inspectPatient?.id}>`]}
        />
    )
}