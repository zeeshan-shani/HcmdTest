import { AccessTime } from '@mui/icons-material';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { isMobile } from 'react-device-detect';
import ClockView from './ClockView';
import UpcomingReminders from './UpcomingReminders';

export default function UserClock({ isClockOut, onClockOut }) {

    const CardView = (
        <div className="card-content collapse show">
            <div className="card-body row m-0">
                <ClockView onClockOut={onClockOut} isClockOut={isClockOut} />
                <UpcomingReminders />
            </div>
        </div>
    )

    return (<>
        {isMobile ?
            <div className='accordion text-color'>
                <div>
                    <div
                        className="accordion-button collapsed cursor-pointer d-inline-flex bg-grey position-absolute dashboard-sm-clock"
                        data-bs-toggle="collapse"
                        data-bs-target={`#panelsStayOpen-collapse-dashboard-clock`}
                        aria-expanded="false"
                        aria-controls={`panelsStayOpen-collapse-dashboard-clock`}
                    >
                        <MuiActionButton Icon={AccessTime} />
                    </div>
                </div>
                <div id={`panelsStayOpen-collapse-dashboard-clock`} className={`accordion-collapse collapse`} aria-labelledby={`card-dashboard-clock`}>
                    <div className="accordion-body">
                        {CardView}
                    </div>
                </div>
            </div> :
            CardView
        }
    </>)
}