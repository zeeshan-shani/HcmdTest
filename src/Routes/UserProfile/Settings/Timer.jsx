import React, { useCallback, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toastPromise } from 'redux/common';
import { USER_CONST } from 'redux/constants/userContants';
import { dispatch } from 'redux/store';
import userService from 'services/APIs/services/userService';

const timer = [
    { title: "30 Minutes", value: 0.5 * 60 },
    { title: "1 Hour", value: 1 * 60 },
    { title: "2 Hour", value: 2 * 60 },
    { title: "6 Hour", value: 6 * 60 },
    { title: "1 Day", value: 24 * 60 },
]

export default function Timer() {
    const { user } = useSelector(state => state.user);
    const [duration, setDuration] = useState(user.taskAlertTimer);

    const onChangeTimer = useCallback((duration) => {
        let payload = { userId: user.id, taskAlertTimer: duration };
        toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = await userService.update({ payload });
                    if (data?.status === 1) dispatch({ type: USER_CONST.LOAD_USER_SUCCESS, payload: data.user });
                    setDuration(data.user.taskAlertTimer);
                    resolve(data);
                } catch (error) {
                    reject(0);
                }
            },
            loading: 'Updating data', success: <b>Successfully Updated</b>, error: <b>Could not updated</b>,
        })
    }, [user]);

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h6 className="mb-1">Timer</h6>
                <p className="mb-0 text-muted small">Set Reminder for task</p>
            </div>
            <div className="card-body">
                {/* <div className="row">
                    <div className="col-12">
                        <h6 className='mb-1'>Timer for routine, emergency and urgent would be appear here</h6>
                    </div>
                </div> */}
                <ul className="list-group list-group-flush list-group-sm-column row">
                    <li className="list-group-item py-2">
                        <div className="media align-items-center">
                            <div className="media-body">
                                <p className="mb-0">{"Duration for Task alert"}</p>
                                <p className="small text-muted mb-0">{"Set Pending task alerts for tasks with imminent deadlines"}</p>
                            </div>
                            <DropdownButton id="dropdown-basic-button" title={!duration ? "Disabled" : `${timer.find(i => i.value === duration).title || "Not specified"}`}>
                                <Dropdown.Item onClick={() => onChangeTimer(0)}>
                                    {"Turn off"}
                                </Dropdown.Item>
                                {timer.map((item, index) => {
                                    return (
                                        <Dropdown.Item key={index} onClick={() => onChangeTimer(item.value)}>
                                            {item.title}
                                        </Dropdown.Item>
                                    )
                                })}
                            </DropdownButton>
                        </div>
                    </li>
                </ul>
            </div>
            {/* <div className="card-footer d-flex justify-content-end">
                    <button type="button" className="btn btn-link text-muted mx-1">Reset</button>
                    <button type="button" className="btn btn-primary">Save Changes</button>
                </div> */}
        </div>
    )
}
