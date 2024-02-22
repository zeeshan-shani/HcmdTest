import React from 'react'
import { getImageURL } from 'redux/common';
import { useSelector } from 'react-redux';
import { onLogout } from 'redux/actions/userAction';
import { getListdata } from 'Components/Modals/UserInfoModal';
// import { Link } from 'react-router-dom';
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import { changeModel } from "redux/actions/modelAction";

export default function Profile({ setMainState }) {
    const { user } = useSelector(state => state.user);
    const userdataList = user && getListdata(user);
    const updateProfilePicture = () => changeModel(CHAT_MODELS.PROFILE_PIC);
    return (
        <div className="tab-content">
            <div className="tab-pane active" id="profile-content">
                <div className="d-flex flex-column h-100">
                    <div className="hide-scrollbar">
                        <div className="sidebar-header sticky-top p-2 mb-3">
                            <h5 className="font-weight-semibold">Profile</h5>
                            <p className="text-muted mb-0">Personal Information & Settings</p>
                        </div>
                        <div className="container-xl">
                            <div className="row">
                                <div className="col">
                                    <div className="card card-body card-bg-5">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="avatar avatar-lg mb-3 bg-white" onClick={updateProfilePicture}>
                                                <img className="avatar-img" src={getImageURL(user?.profilePicture, '80x80')} alt="" />
                                            </div>
                                            <div className="d-flex flex-column align-items-center">
                                                <h5>{user?.name}</h5>
                                            </div>
                                            <div className="d-flex">
                                                <button className="btn btn-secondary mx-1" type="button" onClick={onLogout}>
                                                    <span>Logout</span>
                                                </button>
                                                <button className="btn btn-primary mx-1 d-xl-none" data-profile-edit="" type="button" onClick={() => setMainState(prev => ({ ...prev, settingsVisible: true }))}>
                                                    <span>Settings</span>
                                                </button>
                                            </div>
                                        </div>
                                        {/* <div className="card-options">
                                            <div className="dropdown">
                                                <button className="btn btn-secondary btn-icon btn-minimal btn-sm text-muted" id="profileDropdown" data-bs-toggle="dropdown">
                                                    <ThreeDotsVertical />
                                                </button>
                                                <ul className="dropdown-menu m-0" aria-labelledby="profileDropdown">
                                                    <li className="dropdown-item" onClick={() => { }}>Change Profile Picture</li>
                                                    <li className="dropdown-item" onClick={() => { }}>Change Number</li>
                                                </ul>
                                            </div>
                                        </div> */}
                                    </div>
                                    <div className="card my-3">
                                        <ul className="list-group list-group-flush">
                                            {userdataList && userdataList.map((item, index) => {
                                                return (
                                                    <li className="list-group-item py-2" key={index}>
                                                        <div className="media align-items-center">
                                                            <div className="media-body">
                                                                <p className="small text-muted mb-0">{item.title}</p>
                                                                {item.content ?
                                                                    <p className="mb-0">{item.content}</p>
                                                                    : <p className="mb-0 text-muted">{'(Not added yet)'}</p>}
                                                            </div>
                                                            {item.icon}
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                            {/* <li className="list-group-item">
                                                <Link className='btn btn-danger' to={'/developer-tools'}>
                                                    Developer Tools
                                                </Link>
                                            </li> */}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
