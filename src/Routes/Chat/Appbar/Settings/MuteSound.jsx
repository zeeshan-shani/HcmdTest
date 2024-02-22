import React from 'react'

export const MuteSound = ({
    OnChangeMuteAllHandler,
    routineNotification,
    emergencyNotification,
    urgentNotification,
    setState,
    muteAllNotification,
    isImportantChat
}) => {
    return (
        <div className="mute-setting p-2">
            <div className="todo-title">
                <h6 className="">Mute Notifications</h6>
            </div>
            <ul className="list-group border list-group-flush">
                <li className="list-group-item py-2">
                    <div className="media align-items-center">
                        <div className="media-body">
                            <p className="mb-0">All</p>
                        </div>
                        <div className="custom-control custom-switch ml-2">
                            <input type="checkbox" className="custom-control-input" id="quickSettingSwitch1"
                                checked={muteAllNotification}
                                onChange={OnChangeMuteAllHandler}
                            // disabled={!isImportantChat}
                            />
                            <label className="custom-control-label" htmlFor="quickSettingSwitch1">&nbsp;</label>
                        </div>
                    </div>
                </li>
                <li className="list-group-item py-2">
                    <div className="media align-items-center">
                        <div className="media-body">
                            <p className="mb-0">Routine</p>
                        </div>
                        <div className="custom-control custom-switch ml-2">
                            <input type="checkbox" className="custom-control-input" id="quickSettingSwitch2" checked={routineNotification}
                                // disabled={!isImportantChat}
                                onChange={() => setState(prev => ({ ...prev, routineNotification: !routineNotification }))} />
                            <label className="custom-control-label" htmlFor="quickSettingSwitch2">&nbsp;</label>
                        </div>
                    </div>
                </li>
                <li className="list-group-item py-2">
                    <div className="media align-items-center">
                        <div className="media-body">
                            <p className="mb-0">Emergency</p>
                        </div>
                        <div className="custom-control custom-switch ml-2">
                            <input type="checkbox" className="custom-control-input" id="quickSettingSwitch3" checked={emergencyNotification}
                                // disabled={!isImportantChat}
                                onChange={() => setState(prev => ({ ...prev, emergencyNotification: !emergencyNotification }))} />
                            <label className="custom-control-label" htmlFor="quickSettingSwitch3">&nbsp;</label>
                        </div>
                    </div>
                </li>
                <li className="list-group-item py-2">
                    <div className="media align-items-center">
                        <div className="media-body">
                            <p className="mb-0">Urgent</p>
                        </div>
                        <div className="custom-control custom-switch ml-2">
                            <input type="checkbox" className="custom-control-input" id="quickSettingSwitch4" checked={urgentNotification}
                                // disabled={!isImportantChat}
                                onChange={() => setState(prev => ({ ...prev, urgentNotification: !urgentNotification }))} />
                            <label className="custom-control-label" htmlFor="quickSettingSwitch4">&nbsp;</label>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    )
}
