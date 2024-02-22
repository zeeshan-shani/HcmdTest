// This file contains a React functional component called Timeout. It imports necessary dependencies and components for implementing a timeout functionality in a web application. The component utilizes the react-idle-timer library to detect user inactivity and trigger certain actions accordingly.

// The Timeout component initializes a state variable showTOModal using the useState hook. It also uses the useIdleTimerContext hook to access the idle timer context provided by the IdleTimerProvider component.

// The component defines several callback functions such as onIdle, onPrompt, onActive, and onAction, which are called based on different user interactions and timeout events. The onIdle function toggles a popup and sets a logout timer using setTimeout. The onPrompt, onActive, and onAction functions are placeholders for handling specific user actions.

// The togglePopup function is used to toggle the showTOModal state variable, controlling the display of a timeout modal. The handleStayLoggedIn function is called when the user chooses to stay logged in, canceling the logout timer.

// The component renders an IdleTimerProvider component, which wraps the timeout functionality around the application. It also renders a TimeoutModal component, which is displayed when the showTOModal state variable is true.

import React, { useState } from 'react';
import TimeoutModal from 'Components/Modals/TimeoutModal';
import { CONST } from 'utils/constants';
import { onLogout } from 'redux/actions/userAction';
import { IdleTimerProvider, useIdleTimerContext } from 'react-idle-timer';
let logoutTimer = null;

export default function Timeout() {
    const [showTOModal, setTimeoutModal] = useState(false);
    // const [showOffModal, setOfflineModal] = useState(false);
    const idleTimer = useIdleTimerContext();

    // useEffect(() => {
    //     if (connected !== undefined)
    //         setOfflineModal(!connected);
    // }, [connected]);

    const onIdle = () => {
        togglePopup();
        logoutTimer = setTimeout(() => {
            onLogout();
        }, CONST.IDLE_TIMEOUT);
    }
    const onPrompt = () => { /* Fire a Modal Prompt */ }
    const onActive = () => { /* Do some active action */ }
    const onAction = () => { /* Do something when a user triggers a watched event */ }
    const togglePopup = () => setTimeoutModal(!showTOModal);
    // const ReloadAction = () => window.location.reload();
    // const handleStayOffline = () => toggleOffline(false);
    // const toggleOffline = (val) => setOfflineModal(val ? val : !showOffModal);
    const handleStayLoggedIn = () => {
        clearTimeout(logoutTimer);
        logoutTimer = null;
        togglePopup();
    }

    return (<>
        <IdleTimerProvider
            ref={idleTimer}
            timeout={CONST.IDLE_TIME}
            onPrompt={onPrompt}
            onIdle={onIdle}
            onActive={onActive}
            onAction={onAction}
        />
        <TimeoutModal
            showModal={showTOModal}
            togglePopup={togglePopup}
            handleStayLoggedIn={handleStayLoggedIn}
            handleLogout={onLogout}
        />
    </>);
}