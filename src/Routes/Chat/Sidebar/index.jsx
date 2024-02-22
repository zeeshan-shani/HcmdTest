import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { getGhostAccess } from 'utils/permission';
import { CONST } from 'utils/constants';
import { ChatsContentSidebarHeader } from './Header';
import ChatsContentSidebarList from 'Routes/Chat/Sidebar/Chat';
import PatientTab from 'Routes/Chat/Sidebar/Patient';
import CategoryTab from 'Routes/Chat/Sidebar/Category';

export const ListType = {
    CHAT: "chat",
    PATIENT: "patient",
    CATEGORY: "category"
}

const defaultSearch = {
    model: false,
    update: 1,
    data: {},
};
const defaultState = {
    filterUsers: CONST.CHAT_TYPE.ALL_CHATS,
    viewUnread: false,
    listType: Object.values(ListType).reverse().find(item => window.location.pathname.includes(item)) || ListType.CHAT
};

export const ChatsContentSidebar = ({ setChatState }) => {
    const { user } = useSelector(state => state.user);
    const { patientList, categoryList } = useSelector(state => state.chat);
    const [chatSidebarState, setChatSidebarState] = useState(defaultState);
    const [searchGlobal, setSearchGlobal] = useState({ search: [], type: true });
    const [advanceSearch, setAdvanceSearch] = useState(defaultSearch);

    const ghostOn = useMemo(() => getGhostAccess({ ghostUser: user?.ghostUser, isGhostActive: user?.isGhostActive }),
        [user?.ghostUser, user?.isGhostActive]);

    const tabProps = useMemo(() => ({
        key: advanceSearch.data && !!Object.keys(advanceSearch.data).length ?
            `advanceSearch-${advanceSearch.update}` : "normal",
        setChatState: setChatState,
        newGlobal: searchGlobal.search,
        searchType: searchGlobal.type,
        advanceSearch: advanceSearch,
        ghostOn: ghostOn,
        chatSidebarState: chatSidebarState,
        setChatSidebarState: setChatSidebarState,
    }), [advanceSearch, chatSidebarState, ghostOn, searchGlobal.search, searchGlobal.type, setChatState]);

    return (
        <div className="tab-pane active">
            <div className="d-flex flex-column h-100">
                <div className="hide-scrollbar h-100">
                    <ChatsContentSidebarHeader
                        searchGlobal={searchGlobal}
                        setSearchGlobal={setSearchGlobal}
                        advanceSearch={advanceSearch}
                        setAdvanceSearch={setAdvanceSearch}
                        setChatSidebarState={setChatSidebarState}
                        chatSidebarState={chatSidebarState}
                    />
                    <div className={`${chatSidebarState.listType !== ListType.CHAT ? "d-none" : ""}`}>
                        <ChatsContentSidebarList {...tabProps} />
                    </div>
                    {(chatSidebarState.listType === ListType.PATIENT || !!patientList.length) &&
                        <div className={`${chatSidebarState.listType !== ListType.PATIENT ? "d-none" : ""}`}>
                            <PatientTab {...tabProps} />
                        </div>}
                    {(chatSidebarState.listType === ListType.CATEGORY || !!categoryList.length) &&
                        <div className={`${chatSidebarState.listType !== ListType.CATEGORY ? "d-none" : ""}`}>
                            <CategoryTab {...tabProps} />
                        </div>}
                </div>
            </div>
        </div>);
}