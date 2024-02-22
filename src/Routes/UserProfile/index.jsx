import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { CONST } from 'utils/constants';
import Profile from 'Routes/UserProfile/Profile'
import UserSettings from 'Routes/UserProfile/Settings'
import ErrorBoundary from 'Components/ErrorBoundry';
// import { useSyncExternalStore } from 'react';

const defaultState = {
    settingsVisible: false, width: window.innerWidth
}
export default function UserProfile() {
    const { user } = useSelector(state => state.user);
    const [state, setState] = useState(defaultState);
    const { settingsVisible } = state;

    useEffect(() => {
        window.onresize = () => { setState(prev => ({ ...prev, width: window.innerWidth })); }
        window.onpopstate = () => (window.location.pathname === CONST.APP_ROUTES.PROFILE) && setState(defaultState);
        if (window.innerWidth > 1199) setState(prev => ({ ...prev, settingsVisible: true }));
    }, []);

    useEffect(() => {
        if (state.width > 1199) setState(prev => ({ ...prev, settingsVisible: true }));
    }, [state.width]);

    return (
        <ErrorBoundary>
            <aside className='sidebar'>
                <Profile setMainState={setState} />
            </aside>
            <main className={`main ${settingsVisible ? 'main-visible' : ''}`}>
                <UserSettings setMainState={setState} settingsVisible={settingsVisible} />
            </main>
        </ErrorBoundary>
    );
}
