import { Chat } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { MuiActionButton, MuiDeleteAction } from 'Components/MuiDataGrid';
import moment from 'moment-timezone';
import { useCallback } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { generatePayload } from 'redux/common';
import reminderService from 'services/APIs/services/reminderService';
import { CONST } from 'utils/constants';

export default function ReminderModal({ onMove }) {
    const { user } = useSelector(state => state.user);

    const { data: reminders = [], refetch } = useQuery({
        queryKey: ["/reminders/list"],
        queryFn: async () => {
            const payload = await generatePayload({
                rest: { userId: user.id },
                options: {
                    // pagination: true,
                    populate: ["message"],
                    // page: 1,
                    // limit: 2
                },
            })
            const data = await reminderService.list({ payload });
            if (data?.status === 1) return data.data
            return [];
        },
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L_1,
    });

    if (!!reminders?.length)
        return (
            <ListGroup>
                {reminders.map((item, index) => (
                    <Reminder key={index} reminder={item} refetch={refetch} onMove={onMove} />
                ))}
            </ListGroup>
        )
    return (<div className='text-center'>No Reminders</div>)
}

function Reminder({ reminder, refetch, onMove }) {

    const onDelete = useCallback(async () => {
        await reminderService.delete({ payload: { id: reminder.id } });
        refetch();
    }, [reminder.id, refetch]);

    return (
        <ListGroup.Item className=''>
            <div className='mb-1'>
                <div className='text-truncate in-one-line'>
                    {reminder.message.message}
                </div>
            </div>
            <div className='d-flex justify-content-between align-items-center'>
                <div className=''>
                    {`Trigger ${moment(reminder.triggerTime).fromNow()}`}
                </div>
                <div className='d-flex gap-10'>
                    <MuiActionButton Icon={Chat} onClick={() => onMove(reminder)} />
                    <MuiDeleteAction onClick={onDelete} />
                </div>
            </div>
        </ListGroup.Item>
    )
}
