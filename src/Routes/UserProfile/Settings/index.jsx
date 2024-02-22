import React, { useEffect } from 'react'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Accounts from 'Routes/UserProfile/Settings/Accounts';
import ApplicationSetting from 'Routes/UserProfile/Settings/ApplicationSettings';
import ChangePassword from 'Routes/UserProfile/Settings/ChangePassword';
import Timer from 'Routes/UserProfile/Settings/Timer';
import Notifications from 'Routes/UserProfile/Settings/Notifications';
import PreTypedMessages from 'Routes/UserProfile/Settings/PreTypedMessages';

export default function UserSettings({ setMainState, settingsVisible }) {

    useEffect(() => {
        if (settingsVisible)
            window.history.pushState({}, "");
    }, [settingsVisible]);

    return (
        <div className="profile d-block">
            <div className="page-main-heading sticky-top py-2 px-3 mb-3">
                {/* <!-- Chat Back Button (Visible only in Small Devices) --> */}
                <button className="btn btn-secondary btn-icon btn-minimal btn-sm text-muted d-xl-none" type="button" data-close="" onClick={() => setMainState(prev => ({ ...prev, settingsVisible: false }))}>
                    <ArrowBackRoundedIcon />
                </button>
                <div className="pl-2 pl-xl-0">
                    <h5 className="font-weight-semibold">Settings</h5>
                    <p className="text-muted mb-0">Update Personal Information &amp; Settings</p>
                </div>
            </div>
            {settingsVisible &&
                <div className="container-xl px-2 px-sm-3">
                    <div className="row">
                        <div className="col">
                            <Accounts />
                            <ApplicationSetting />
                            <PreTypedMessages />
                            <Timer />
                            <ChangePassword />
                            <Notifications />
                        </div>
                    </div>
                </div>}
        </div>
    )
}
