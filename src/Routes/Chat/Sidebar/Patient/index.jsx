import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { dispatch } from "redux/store";
import { useSelector } from "react-redux";
import { CHAT_CONST, LOADER } from "redux/constants/chatConstants";

import { generatePayload } from "redux/common";
import { CONST } from "utils/constants";
import { ChatListLoader } from "Components/Loaders/Loaders";
import patientService from "services/APIs/services/patientService";
import ErrorBoundary from "Components/ErrorBoundry";
import { ItemContent } from "./ItemContent";
import { useNavigate } from "react-router-dom";
import { ListType } from "..";
import { SocketListener } from "utils/wssConnection/Socket";

const defaultchatlistState = {
    offset: 0,
    limit: CONST.CHAT_GET_LIMIT,
    isNextAvailable: false,
    AllReceived: false
}

export default function PatientTab({
    newGlobal,
    advanceSearch,
    chatSidebarState,
    setChatSidebarState
}) {
    const navigate = useNavigate();
    const { user, connected } = useSelector((state) => state.user);
    const { activePatientChat, patientList, loaders, refreshChats } = useSelector((state) => state.chat);
    const [patientlistState, setPatientlistState] = useState({ ...defaultchatlistState, search: newGlobal });
    const [totalPatients, settotalPatients] = useState(user?.chatList?.length || 0);
    const innerChatsRef = useRef();

    const callNextPatientList = useCallback(async (args) => {
        try {
            if (!!Object.keys(advanceSearch.data).length || chatSidebarState.listType !== ListType.PATIENT) return;
            dispatch({ type: LOADER.PATIENT_LIST_LOADER, payload: true });
            let payload = await generatePayload({
                keys: ["firstName", "lastName", "middleName"],  // remaining doctor filter
                value: !!newGlobal.length && newGlobal[0],
                options: {
                    populate: ["lastPatientMessage", { "method": ["unreadMentionCount", [user.id]] }],
                    pagination: true,
                    limit: patientlistState?.limit,
                    offset: args.hasOwnProperty('offset') ? args.offset : patientlistState.offset,
                    sort: [["updatedAt", "DESC"]],
                },
                isCount: true,
            });
            const data = await patientService.list({ payload });
            if (data?.status === 1) {
                dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHAT_PATIENTLIST_DATA, payload: data.data.rows });
                settotalPatients(data.data.count);
                const isLast = (data?.data?.rows?.length < CONST.CHAT_GET_LIMIT && data?.data?.rows?.length <= totalPatients)
                setPatientlistState(prev => ({
                    ...prev,
                    isNextAvailable: !isLast,
                    AllReceived: isLast,
                    offset: prev.offset + data?.data?.rows?.length,
                    currSearch: newGlobal
                }))
            } else if (data?.status === 0) setPatientlistState(prev => ({ ...prev, isNextAvailable: false, AllReceived: true }))
            dispatch({ type: LOADER.PATIENT_LIST_LOADER, payload: false });
        } catch (error) {
            console.error(error);
        }
    }, [patientlistState?.limit, patientlistState.offset, newGlobal, totalPatients, advanceSearch.data, chatSidebarState?.listType, user.id]);

    const resetData = useCallback(async () => {
        dispatch({ type: CHAT_CONST.CLEAR_PATIENT_LIST_DATA, payload: [] });
        await callNextPatientList({ offset: 0 });
    }, [callNextPatientList]);

    useEffect(() => {
        if (!!newGlobal?.length) resetData();
        //eslint-disable-next-line
    }, [newGlobal]);

    useEffect(() => {
        if (patientlistState.offset !== 0) return;
        resetData();
        setChatSidebarState(prev => ({ ...prev, ghostStateChanged: false }));
        //eslint-disable-next-line
    }, [newGlobal, patientlistState.offset]);

    useEffect(() => {
        if (refreshChats && connected) {
            resetData();
            setChatSidebarState(prev => ({ ...prev, ghostStateChanged: false }));
            dispatch({ type: "RECONNECTED_REFRESH_CHATS", payload: false });
        }
        SocketListener("PATIENT_MENTION_CHAT", (data) => {
            dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHAT_PATIENTLIST_DATA, payload: [data], initial: true });
        });
    }, [refreshChats, connected, advanceSearch.data, resetData, setChatSidebarState]);

    const onNextChatListLoad = useCallback(async () => {
        callNextPatientList({ offset: patientList.length });
    }, [callNextPatientList, patientList.length]);

    const setActivePatient = useCallback(async (patient) => {
        navigate(`/chats/patient/${patient.id}`);
        dispatch({ type: CHAT_CONST.SET_ACTIVE_PATIENT_CHAT, payload: patient });
        await patientService.markAsRead({
            payload: { patientId: patient.id }
        });
    }, [navigate]);

    return (
        <ErrorBoundary>
            <ul className="contacts-list bg__chat-f-dark text-color hide-scrollbar pl-0">
                {loaders.patientList && !patientList.length && <ChatListLoader />}
                {(advanceSearch.data && !Object.keys(advanceSearch.data).length) &&
                    <div
                        id="scrollableDiv-patientlist"
                        className="d-flex overflow-scroll flex-column hide-horizonal-scroll"
                        style={{ height: 'auto', maxHeight: '100%' }}
                        ref={innerChatsRef}
                    >
                        <InfiniteScroll
                            className="d-flex flex-column overflow-unset"
                            dataLength={patientList.length}
                            next={onNextChatListLoad}
                            scrollThreshold={`200px`}
                            pullDownToRefresh={false}
                            hasMore={totalPatients > patientList.length}
                            loader={<ChatListLoader />}
                            scrollableTarget="scrollableDiv-patientlist"
                        >
                            {patientList?.map((item) => {
                                return (
                                    <li className={`contacts-item ${(item.id === activePatientChat?.id) ? 'active' : ''}`} key={item.id}>
                                        <div className="contacts-link" onClick={() => setActivePatient(item)}>
                                            <ItemContent item={item} />
                                        </div>
                                    </li>
                                );
                            })}
                        </InfiniteScroll>
                    </div>}
            </ul>
        </ErrorBoundary>)
}