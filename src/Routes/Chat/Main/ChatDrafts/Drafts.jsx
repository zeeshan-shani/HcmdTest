import React, { useCallback, useState } from 'react'
import { CancelScheduleSend, Delete, Edit, ScheduleSend, Send } from '@mui/icons-material';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { format_all, generatePayload } from 'redux/common';
import { showSuccess } from 'utils/package_config/toast';
import { sendMessage } from 'utils/wssConnection/Socket';
import ModalReactstrap from 'Components/Modals/Modal';
import moment from 'moment-timezone';
import ReactDatePicker from 'react-datepicker';
import draftMessageService from 'services/APIs/services/draftMessageService';
import { getChatName } from 'redux/actions/chatAction';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { Virtuoso } from 'react-virtuoso';
import { useMount } from 'react-use';
import { useNavigate } from 'react-router-dom';

export default function Drafts({ scheduled = false, sent = false }) {
    const navigate = useNavigate();
    const [state, setState] = useState({
        draftList: [],
        schedule: null,
        isSending: false
    });
    const { draftList, } = state;

    const onDraftDelete = useCallback(async (id) => {
        await draftMessageService.delete({ payload: { id } });
        setState(prev => ({ ...prev, draftList: prev.draftList.filter((i) => i.id !== id) }))
    }, []);

    const onSendMessage = useCallback((item) => {
        const messageData = JSON.parse(item.message);
        setState(prev => ({ ...prev, isSending: true }));
        sendMessage(messageData, (data) => {
            setState(prev => ({
                ...prev, isSending: false,
                draftList: prev.draftList.filter((i) => i.id !== item.id)
            }));
        });
    }, []);

    const onSchedule = useCallback((item) => {
        setState(prev => ({ ...prev, schedule: item }))
    }, []);

    const onCancelSchedule = useCallback(async (item) => {
        await draftMessageService.update({ payload: { id: item.id, schedule: null, chatId: item.chatId } });
        setState(prev => ({ ...prev, draftList: prev.draftList.filter((i) => i.id !== item.id) }))
    }, []);

    const getDraftList = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        const payload = await generatePayload({
            rest: {
                schedule: scheduled || sent,
                sent
            },
            options: {
                pagination: true,
                offset: state.draftList.length,
                limit: 20,
                sort: [["createdAt", "DESC"]],
                populate: ["draftInfo"]
            },
            isCount: true
        });
        const data = await draftMessageService.list({ payload });
        setState(prev => ({
            ...prev,
            isLoading: false,
            draftList: data?.data.rows ? prev.draftList.concat(data.data.rows) : prev.draftList,
            hasMore: data?.data?.count > state.draftList.length
        }));
        if (data?.status === 1) return data.data;
    }, [state?.draftList?.length, scheduled, sent, setState]);

    const onNextLoad = useCallback(async () => {
        await getDraftList();
    }, [getDraftList]);
    const onEditDraft = (item) => navigate('/chats/chat/' + item.chatId)

    useMount(() => {
        onNextLoad();
    }, [onNextLoad]);

    return (<>
        <div className="note-container overflow-auto h-100">
            {!draftList.length && <p className='text-center'>No Drafts Available</p>}
            <Virtuoso
                // style={{ height: '100%' }}
                // className='overflow-auto'
                data={draftList || []}
                endReached={() => state.hasMore && onNextLoad()}
                overscan={200}
                atBottomThreshold={0}
                itemContent={(index, item) => (
                    <DraftMessage
                        item={item}
                        onDraftDelete={onDraftDelete}
                        onSendMessage={onSendMessage}
                        onSchedule={onSchedule}
                        onCancelSchedule={onCancelSchedule}
                        onEditDraft={onEditDraft}
                    />
                )}
                components={{ Footer: () => <>{(state.isLoading) && <Loader height={"80px"} />}</> }}
            />
        </div>
        {Boolean(state.schedule) &&
            <ScheuleDraft
                state={state}
                setState={setState}
            />}
    </>)
}

const DraftMessage = ({
    item,
    onDraftDelete,
    onSendMessage,
    onSchedule,
    onCancelSchedule,
    onEditDraft
}) => {
    const { user } = useSelector(state => state.user);
    const { message, chat, schedule } = item;
    const messageData = JSON.parse(message);
    let chatname = getChatName({ chat, userId: user.id })
    return (
        <div className="note message-draft text-color m-2" key={item.id}>
            <div className="note-body">
                {item.chat &&
                    <h5 className="note-title">{chatname}</h5>}
                {messageData.subject &&
                    <h6 className="note-title" dangerouslySetInnerHTML={{ __html: format_all(messageData.subject) }}></h6>}
                {messageData?.message &&
                    <p className="note-title mb-0" dangerouslySetInnerHTML={{ __html: format_all(messageData.message) }} />}
                <div className="justify-content-between d-flex align-items-center">
                    <p className="mb-0 text-muted">
                        {item.schedule ? `send ${moment(item.schedule).format("MM/DD/YY [at] hh:mm A")}` : `created ${moment(message.updatedAt).fromNow()}`}
                    </p>
                    <div className='draft-tools gap-10'>
                        {<MuiActionButton
                            tooltip="Delete Draft"
                            Icon={Delete}
                            size="small"
                            className="text-danger"
                            onClick={() => onDraftDelete(item.id)}
                        />}
                        {!schedule && <MuiActionButton
                            tooltip="Edit Draft"
                            Icon={Edit}
                            size="small"
                            onClick={() => onEditDraft(item)}
                        />}
                        <MuiActionButton
                            tooltip="Schedule Draft"
                            Icon={ScheduleSend}
                            size="small"
                            className={item.schedule ? "text-success" : "text-color"}
                            onClick={() => onSchedule(item)}
                        />
                        {schedule &&
                            <MuiActionButton
                                tooltip="Cancel schedule"
                                Icon={CancelScheduleSend}
                                size="small"
                                className={"text-color"}
                                onClick={() => onCancelSchedule(item)}
                            />}
                        {!schedule && <MuiActionButton
                            tooltip="Send Draft"
                            Icon={Send}
                            size="small"
                            onClick={() => onSendMessage(item)}
                        />}
                    </div>
                </div>
            </div>
        </div>)
}
const ScheuleDraft = ({ state, setState }) => {
    const [dateTime, setDateTime] = useState(state.schedule.schedule);
    const [loading, setLoading] = useState(false);

    const onSchedule = useCallback(async () => {
        setLoading(true);
        const data = await draftMessageService.update({
            payload: {
                id: state.schedule.id,
                chatId: state.schedule.chatId,
                schedule: dateTime
            }
        });
        if (data?.status === 1 && data.data.schedule) {
            setState(prev => ({
                ...prev,
                schedule: null,
                draftList: prev.draftList.map((i) => {
                    if (i.id === state.schedule.id) return { ...i, ...data.data };
                    return i;
                })
            }))
            showSuccess(`Message Scheduled at ${moment(data.data.schedule).format("MM/DD/YY hh:mm a")}`)
            setLoading(false);
        }
    }, [state.schedule, dateTime, setState]);

    const onCancel = () => setState(prev => ({ ...prev, schedule: null }))

    return (
        <ModalReactstrap
            show={Boolean(state.schedule)}
            header="Schedule Message"
            toggle={() => setState(prev => ({ ...prev, schedule: null }))}
            body={Boolean(state.schedule) && <>
                <label>Set Date & time ({moment().tz(moment.tz.guess()).format("z")})</label>
                <ReactDatePicker
                    onChange={(date) => setDateTime(date)}
                    selected={dateTime ? moment(dateTime).toDate() : null}
                    showTimeSelect
                    popperPlacement="auto"
                    dateFormat="MM/dd/yy h:mm aa"
                    placeholderText="Schedule Date & Time"
                    className={`form-control search`}
                    wrapperClassName="form-group"
                    calendarClassName="min-width-328"
                    timeIntervals={15}
                    timeCaption="Time"
                // autoFocus
                />
            </>}
            footer={<div className='d-flex justify-content-end gap-10'>
                <Button variant='secondary' onClick={onCancel}>Cancel</Button>
                <Button variant='primary' onClick={onSchedule} disabled={loading || !dateTime}>
                    {loading ? 'Scheduling...' : 'Schedule Message'}
                </Button>
            </div>}
        />
    )
}
