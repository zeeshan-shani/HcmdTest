import React, { useEffect, useState } from 'react'
import { dispatch } from 'redux/store';
import { toastPromise } from 'redux/common';
import { useSelector } from 'react-redux';
import { USER_CONST } from 'redux/constants/userContants';
import userService from 'services/APIs/services/userService';

export default function Accounts() {
    const { user } = useSelector(state => state.user);
    const [userData, setUserData] = useState(user);
    const [updateData, setUpdateData] = useState({});

    useEffect(() => {
        setUserData(user);
    }, [user]);

    const onReset = () => {
        setUpdateData({});
    }
    const onUpdateSaveChanges = async () => {
        let payload = { userId: user.id, ...updateData };
        toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = await userService.update({ payload });
                    if (data?.status === 1) dispatch({ type: USER_CONST.LOAD_USER_SUCCESS, payload: data.user });
                    resolve(data);
                } catch (error) {
                    reject(0);
                }
            },
            loading: 'Updating data', success: <b>Successfully Updated</b>, error: <b>Could not updated</b>,
        })
    }
    return (
        <div className="card mb-3">
            <div className="card-header">
                <h6 className="mb-1">Account</h6>
                <p className="mb-0 text-muted small">Update personal &amp; contact information</p>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 col-12">
                        <div className="form-group">
                            <label htmlFor="firstName">User Name</label>
                            <input type="text" className="form-control form-control-md" id="userName" placeholder="Type your name"
                                onChange={e => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                                disabled
                                defaultValue={userData?.name} />
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="form-group">
                            <label htmlFor="mobileNumber">Mobile number</label>
                            <input type="text" className="form-control form-control-md" id="mobileNumber" placeholder="Type your mobile number"
                                onChange={e => setUpdateData(prev => ({ ...prev, phone: e.target.value }))}
                                defaultValue={userData?.phone} />
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="form-group">
                            <label htmlFor="emailAddress">Email address</label>
                            <input type="email" className="form-control form-control-md" id="emailAddress" placeholder="Type your email address"
                                // onChange={e => setUpdateData(prev => ({ ...prev, email: e.target.value }))}
                                disabled
                                defaultValue={userData?.email} />
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="form-group">
                            <label htmlFor="extension">Extension</label>
                            <input type="text" className="form-control form-control-md" id="extension" placeholder="Type your extesnsion"
                                onChange={e => setUpdateData(prev => ({ ...prev, extension: e.target.value }))}
                                defaultValue={userData?.extension} />
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="form-group">
                            <label htmlFor="companyName">Company Name</label>
                            <input type="text" className="form-control form-control-md" id="companyName" placeholder="Type your company name"
                                disabled
                                defaultValue={userData?.companyName} />
                        </div>
                    </div>
                    {/* <div className="col-md-6 col-12">
                            <div className="form-group">
                                <label htmlFor="designation">Designation</label>
                                <input type="text" className="form-control form-control-md" id="designation" placeholder="Type your designation"
                                    defaultValue={userData?.companyRoleData.name} />
                            </div>
                        </div> */}
                    <div className="col-12">
                        <div className="form-group">
                            <label htmlFor="Address">Address</label>
                            <input type="text" className="form-control form-control-md" id="Address" placeholder="Type your address"
                                onChange={e => setUpdateData(prev => ({ ...prev, address: e.target.value }))}
                                defaultValue={userData?.address} />
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                            <label htmlFor="About">About</label>
                            <textarea className="form-control form-control-md" id="About" placeholder="Type about yourself" rows={2}
                                onChange={e => setUpdateData(prev => ({ ...prev, about: e.target.value }))}
                                defaultValue={userData?.about} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-footer d-flex justify-content-end">
                <button type="button" className="btn btn-link text-muted mx-1" onClick={onReset}>Reset</button>
                <button type="button" className="btn btn-primary" onClick={onUpdateSaveChanges}>Save Changes</button>
            </div>
        </div>
    )
}
