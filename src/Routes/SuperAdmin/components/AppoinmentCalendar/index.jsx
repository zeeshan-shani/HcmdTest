import React, { lazy, useState } from 'react'
import { LazyComponent } from 'redux/common';
import { UsersDropdown } from 'Routes/SuperAdmin/UsersDropdown'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { CONST } from 'utils/constants';

// const Calendar = lazy(() => wait(500).then(() => import('Routes/Dashboard/components/Calendar')));
const Calendar = lazy(() => import('Routes/Dashboard/components/Calendar'));

export default function AppoinmentCalendar({ onlyProviders = true }) {
    const { user } = useSelector(state => state.user);
    const [userData, setUserData] = useState(user);
    return (
        <div className='dashboard-date-logs p-md-2 card'>
            <div className='m-2 d-flex flex-wrap text-color'>
                <div className='mr-2 align-items-center d-flex'>{`Select ${onlyProviders ? 'Provider' : 'Users'}: `}</div>
                <UsersDropdown userData={userData} setUserData={setUserData} classes={''} designations={onlyProviders && CONST.PROVIDERS} />
            </div>
            <div className='m-md-2'>
                <LazyComponent>
                    <Calendar userdata={userData} type="admin" />
                </LazyComponent>
            </div>
        </div>
    );
}
