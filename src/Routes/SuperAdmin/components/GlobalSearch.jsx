import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChatListLoader } from 'Components/Loaders/Loaders';
import moment from 'moment-timezone';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { Modal, ModalBody } from 'reactstrap';
import { textToShow } from 'redux/common';
import { LOADER } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import { getDataMessages, ResultMessage } from 'Routes/Chat/Sidebar/Chat';
import { CONST } from 'utils/constants';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';

/* 
**********************************
Only for patient message search
**********************************
 */
export default function GlobalSearch({ modalView = true, showModal, onClose, searchArr, label }) {
    const { user } = useSelector((state) => state.user);
    const [state, setState] = useState({
        globalSearch: [],
        offset: 0,
        totalMessages: 0,
        messages: []
    });
    // const [value, setValue] = useState([]);
    // const newValueArr = useDebounce(value, 0);
    const { loaders } = useSelector((state) => state.chat);
    const innermessagesRef = useRef();
    const newGlobal = useMemo(() => [...new Set(searchArr)], [searchArr]);

    // useEffect(() => {
    //     setValue(searchArr.map(item => ({ label: item, value: item })));
    // }, [searchArr]);

    // useEffect(() => {
    //     setState(prev => ({ ...prev, globalSearch: newValueArr.map(item => item.value) }))
    // }, [newValueArr]);
    const callNextGlobalMessages = useCallback(async () => {
        try {
            if (!newGlobal.length) return;
            dispatch({ type: LOADER.CHATLIST_LOADER, payload: true });
            let payload = {
                search: newGlobal,
                limit: CONST.GLOBAL_SEARCH_GET_LIMIT,
                offset: state.offset,
                isCount: true
            }
            if (user?.ghostUser && user?.isGhostActive) payload.ghostStatus = true;
            const data = await getDataMessages(payload);
            if (data?.status === 1) {
                // dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHATLIST_DATA, payload: data?.data?.rows });
                if ((data?.data?.rows?.length < CONST.GLOBAL_SEARCH_GET_LIMIT))
                    setState(prev => ({
                        ...prev,
                        isNextAvailable: false,
                        AllReceived: true,
                        offset: prev.offset + data?.data?.rows?.length,
                        totalMessages: data.data.count,
                        messages: [...prev.messages, ...data.data.rows]
                    }))
                else setState(prev => ({
                    ...prev,
                    isNextAvailable: true,
                    AllReceived: false,
                    offset: prev.offset + data?.data?.rows.length,
                    totalMessages: data.data.count,
                    messages: [...prev.messages, ...data.data.rows]
                }))
            } else if (data?.status === 0) setState(prev => ({
                ...prev,
                isNextAvailable: false,
                AllReceived: true,
                messages: []
            }));
            dispatch({ type: LOADER.CHATLIST_LOADER, payload: false });
        } catch (error) {
            console.error(error);
        }
    }, [newGlobal, state.offset, user]);

    const resetData = useCallback(async () => {
        // dispatch({ type: CHAT_CONST.RES_SEARCH_CHATLIST_DATA, payload: { data: { messages: [] } } });
        await callNextGlobalMessages();
    }, [callNextGlobalMessages]);

    useEffect(() => {
        // if (state.offset === 0)
        resetData();
        //eslint-disable-next-line
    }, []);
    // state.offset, resetData

    const onClickMessage = (item) => { }

    const messagesBody = (
        <ul className="contacts-list bg__chat-f-dark text-color hide-scrollbar" id="chatContactTab">
            {newGlobal && !!newGlobal.length && <>
                {loaders.chatList && <Loader height={'80px'} />}
                {!!state?.messages?.length ?
                    <div
                        id="scrollableDiv-chatlist-messages"
                        className="d-flex overflow-scroll flex-column hide-horizonal-scroll"
                        style={{ height: 'auto', maxHeight: '100%' }}
                        ref={innermessagesRef}
                    >
                        <InfiniteScroll
                            className="d-flex flex-column overflow-unset"
                            dataLength={state.messages.length}
                            next={callNextGlobalMessages}
                            scrollThreshold={`100px`}
                            pullDownToRefresh={false}
                            hasMore={state.totalMessages > state?.messages?.length}
                            loader={<ChatListLoader />}
                            scrollableTarget="scrollableDiv-chatlist-messages"
                        >
                            {state.messages.map((item) => {
                                if (item.chatDetails.type === CONST.CHAT_TYPE.GROUP) {
                                    const { name = "Unknown chat" } = item.chatDetails;
                                    return (
                                        <li className="contacts-item" key={item.id + '-m'}>
                                            <div className="contacts-link p-1 pt-3 position-relative" onClick={() => onClickMessage(item)}>
                                                <div className="contacts-content px-1">
                                                    <div className="contacts-info">
                                                        <h6 className="chat-name text-truncate username-text mb-0">{name}</h6>
                                                        <div className="chat-time message light-text-70">{moment(item.createdAt).format("MM/DD/YY hh:mm A")}</div>
                                                    </div>
                                                    <div className="contacts-texts text-truncate">
                                                        <h6 className="text-color in-one-line mb-0" dangerouslySetInnerHTML={{ __html: textToShow(`${item?.sendByDetail?.name}: `, newGlobal) }}></h6>
                                                    </div>
                                                    <div className="contacts-texts justify-content-start">
                                                        {!item?.isDeleted ?
                                                            <ResultMessage item={item} searchText={newGlobal} /> :
                                                            <p className='font-weight-normal deleted-message text-color mb-0' style={{ fontSize: user?.fontSize }}>
                                                                {CONST.TEMPLATE_MSG.DELETE}
                                                            </p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>);
                                }
                                else {
                                    const { name = "Unknown user" } = item.chatDetails?.chatusers?.find(x => x.userId !== user.id)?.user;
                                    return (
                                        <li className="contacts-item" key={item.id + '-m'}>
                                            <div className="contacts-link p-1 pt-3 position-relative" onClick={() => onClickMessage(item)}>
                                                <div className="contacts-content px-1">
                                                    <div className="contacts-info">
                                                        <h6 className="chat-name text-truncate username-text mb-0">{name}</h6>
                                                        <div className="chat-time message light-text-70">{moment(item.createdAt).format("MM/DD/YY hh:mm A")}</div>
                                                    </div>
                                                    <div className="contacts-texts justify-content-start">
                                                        {!item?.isDeleted ? <ResultMessage item={item} searchText={newGlobal} /> : <p className='font-weight-normal deleted-message text-color mb-0' style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.DELETE}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>)
                                }
                            })}
                        </InfiniteScroll>
                    </div>
                    :
                    ((!!newGlobal.length && !loaders.chatList) &&
                        <li className="contacts-item">
                            <div className="contacts-link p-1">
                                <div className="contacts-content">
                                    <div className="contacts-texts justify-content-center">
                                        No matches found for "{label}"
                                    </div>
                                </div>
                            </div>
                        </li>)}
            </>}
        </ul>
    )

    if (modalView)
        return (
            <Modal isOpen={showModal} backdrop="static" size='lg'>
                <div className="modal-header">
                    <h5 className="modal-title">
                        Search Results for "{label}"
                    </h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <ModalBody>
                    {/* <div className="d-flex py-1 justify-content-between align-items-center">
                    <div className="input-group search-bar_chat-header w-100">
                        <MultiSelectTextInput
                            setInputValue={setInputValue}
                            inputValue={inputValue}
                            setValue={setValue}
                            value={value}
                            placeholder='Search'
                            className="cs w-100"
                            innerClass='cstm-multi-input'
                        />
                    </div>
                </div> */}
                    <div>
                        <div className="divider">
                            <span className="light-text-70 mx-1">MESSAGES</span>
                        </div>
                        {messagesBody}
                    </div>
                </ModalBody>
            </Modal>
        )
    return messagesBody;
}
