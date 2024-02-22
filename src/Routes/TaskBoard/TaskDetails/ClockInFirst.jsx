import { Button } from 'antd';
import ModalReactstrap from 'Components/Modals/Modal'
import React, { useCallback, useState } from 'react'
import { CONST, SOCKET } from 'utils/constants';
import { showError, showSuccess } from 'utils/package_config/toast';
import { changeProfileStatus, SocketEmiter } from 'utils/wssConnection/Socket';

export default function ClockInFirst({ state, setState }) {
    const [loadingBtn, setloadingBtn] = useState(false);
    const [disabledBtn, setDisableBtn] = useState(false);
    const onCancel = useCallback(() => setState(prev => ({ ...prev, clockInFirstModel: false })), [setState]);
    const onClockIn = useCallback(() => {
        setloadingBtn(true);
        SocketEmiter(SOCKET.REQUEST.CREATE_USER_LOG, { clockin: true }, (data) => {
            if (data?.status) {
                changeProfileStatus(CONST.PROFILE.ONLINE);
                setloadingBtn(false);
                setDisableBtn(true);
                showSuccess("Clocked In successfully");
                onCancel();
            } else {
                setloadingBtn(false);
                showError("Could not clock-in. Please try again");
            }
        });
    }, [onCancel]);

    return (
        <ModalReactstrap
            show={state.clockInFirstModel}
            header="Clock-in Confirmation"
            toggle={onCancel}
            body={<p>You're not clock-in yet. Are you sure you want to clock-in?</p>}
            footer={<>
                <Button type="text" onClick={onCancel}>Cancel</Button>
                <Button loading={loadingBtn} type="primary" onClick={onClockIn} disabled={disabledBtn}>Clock-In</Button>
            </>}
        />
    )
}
