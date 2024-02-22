import React, { useEffect, useState } from 'react'
import classes from 'Routes/Dashboard/components/Header/clock.module.css';
import moment from 'moment-timezone';
import { CONST } from 'utils/constants';
import { useSelector } from 'react-redux';

export const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ClockTime = ({ h24 = true }) => {
    const { user } = useSelector(state => state.user);
    const firstLog = user?.workHours?.firstLog;
    const [diff, setDiff] = useState(0);

    useEffect(() => {
        const isClockOut = user?.clockTime?.clockin?.length === user?.clockTime?.clockout?.length;
        const update = () => setDiff(moment.utc().diff(moment(firstLog).utc()));
        update();
        const interval = !isClockOut && setInterval(() => {
            update();
        }, 1000);
        return () => clearInterval(interval);
    }, [h24, user?.clockTime, firstLog]);

    return (
        <div className={classes["clock"]}>
            <div className={`datetime-color ${classes["calendar"]}`}>
                <h6 className='mb-0'>
                    {`${moment.tz(CONST.TIMEZONE).format("MMMM Do YYYY")}`}
                </h6>
            </div>
            <div className={classes["row"]}>
                <div className={`d-flex align-items-center ${classes["hour"]}`}>
                    <Number value={!h24 ? (moment(diff).utc().hours() % 12 || 0) : moment(diff).utc().hours()} />
                    <Word value={':'} />
                    <Number value={moment(diff).utc().minutes()} />
                    <Word value={':'} />
                    <Number value={moment(diff).utc().seconds()} />
                </div>
                <div className={`align-items-center d-flex ${classes["ampm"]}`}>
                    <Word value={'hrs'} />
                </div>
            </div>
            <div className={`datetime-color ${classes["calendar"]}`}>
                <h6 className='mb-0'>
                    Today's session
                </h6>
            </div>
        </div>
    )
}

const Number = ({ value = 0 }) => {
    const result = String(value).padStart(2, "0");
    return <div className={classes["digital"]}>
        <h2 className='mb-0'>{result}</h2>
    </div>
}

const Word = ({ value, hidden = false }) => {
    return <div className={classes["digital"]}>
        <h2 className='mb-0'>{value}</h2>
    </div>
}