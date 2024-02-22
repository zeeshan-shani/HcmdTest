import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { dispatch } from "redux/store";
import { useSelector } from "react-redux";
import { CHAT_CONST, LOADER } from "redux/constants/chatConstants";

import { generatePayload } from "redux/common";
import { CONST } from "utils/constants";
import { ChatListLoader } from "Components/Loaders/Loaders";
import ErrorBoundary from "Components/ErrorBoundry";
import { ItemContent } from "./ItemContent";
import taskCategoryService from "services/APIs/services/taskCategoryService";
import { useNavigate } from "react-router-dom";
import { ListType } from "..";
import categoryMessageService from "services/APIs/services/categoryMessageService";
import { SocketListener } from "utils/wssConnection/Socket";

const defaultchatlistState = {
    offset: 0,
    limit: CONST.CHAT_GET_LIMIT,
    isNextAvailable: false,
    AllReceived: false
}

export default function CategoryTab({
    newGlobal,
    advanceSearch,
    chatSidebarState,
    setChatSidebarState
}) {
    const navigate = useNavigate();
    const { user, connected } = useSelector((state) => state.user);
    const { activeCategoryChat, categoryList, loaders, refreshChats } = useSelector((state) => state.chat);
    const [categorylistState, setCategorylistState] = useState({ ...defaultchatlistState, search: newGlobal });
    const [totalCategory, settotalCategory] = useState(user?.chatList?.length || 0);
    const categoryListRef = useRef();

    const callNextList = useCallback(async (args) => {
        try {
            if (!!Object.keys(advanceSearch.data).length || chatSidebarState.listType !== ListType.CATEGORY) return;
            dispatch({ type: LOADER.CATEGORY_LIST_LOADER, payload: true });
            let payload = await generatePayload({
                keys: ["name"],
                value: !!newGlobal.length && newGlobal[0],
                options: {
                    populate: ["lastMessageCategory", { "method": ["unreadMentionCount", [user.id]] }],
                    sort: [["updatedAt", "DESC"]],
                    limit: categorylistState?.limit,
                    offset: args.hasOwnProperty('offset') ? args.offset : categorylistState.offset,
                    pagination: true,
                },
                isCount: true,
                // currSearch: state.currSearch
            });
            const data = await taskCategoryService.list({ payload });
            if (data?.status === 1) {
                dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHAT_CATEGORYLIST_DATA, payload: data.data.rows });
                settotalCategory(data.data.count);
                const isLast = (data?.data?.rows?.length < CONST.CHAT_GET_LIMIT && data?.data?.rows?.length <= totalCategory)
                setCategorylistState(prev => ({
                    ...prev,
                    isNextAvailable: !isLast,
                    AllReceived: isLast,
                    offset: prev.offset + data?.data?.rows?.length,
                    currSearch: newGlobal
                }))
            } else if (data?.status === 0) setCategorylistState(prev => ({ ...prev, isNextAvailable: false, AllReceived: true }))
            dispatch({ type: LOADER.CATEGORY_LIST_LOADER, payload: false });
        } catch (error) {
            console.error(error);
        }
    }, [categorylistState?.limit, categorylistState.offset, newGlobal, totalCategory, advanceSearch.data, chatSidebarState.listType, user.id]);

    const resetData = useCallback(async () => {
        dispatch({ type: CHAT_CONST.CLEAR_CATEGORY_LIST_DATA });
        await callNextList({ offset: 0 });
    }, [callNextList]);

    useEffect(() => {
        if (!!newGlobal?.length) resetData();
        //eslint-disable-next-line
    }, [newGlobal]);

    useEffect(() => {
        if (categorylistState.offset !== 0) return;
        resetData();
        setChatSidebarState(prev => ({ ...prev, ghostStateChanged: false }));
        //eslint-disable-next-line
    }, [newGlobal, categorylistState.offset]);

    useEffect(() => {
        if (refreshChats && connected) {
            resetData();
            setChatSidebarState(prev => ({ ...prev, ghostStateChanged: false }));
            dispatch({ type: "RECONNECTED_REFRESH_CHATS", payload: false });
        }
        SocketListener("CATEGORY_MENTION_CHAT", (data) => {
            let bodyData = { ...data.categoryChatInfo, categoryChats: [{ unreadMentionCount: data.unreadMentionCount }] }
            dispatch({ type: CHAT_CONST.APPEND_SEARCH_CHAT_CATEGORYLIST_DATA, payload: [bodyData], initial: true });
        });
    }, [refreshChats, connected, advanceSearch.data, resetData, setChatSidebarState]);

    const onNextChatListLoad = useCallback(async () => {
        callNextList({ offset: categoryList.length });
    }, [callNextList, categoryList?.length]);

    const setActiveCategory = useCallback(async (category) => {
        dispatch({ type: CHAT_CONST.SET_ACTIVE_CATEGORY_CHAT, payload: category })
        navigate(`/chats/category/${category.id}`);
        await categoryMessageService.markAsRead({
            payload: { categoryId: category.id }
        });
    }, [navigate]);

    return (
        <ErrorBoundary>
            <ul className="contacts-list bg__chat-f-dark text-color hide-scrollbar pl-0">
                {loaders.categoryList && !categoryList.length && <ChatListLoader />}
                {(advanceSearch.data && !Object.keys(advanceSearch.data).length) &&
                    <div
                        id="scrollableDiv-categoryList"
                        className="d-flex overflow-scroll flex-column hide-horizonal-scroll"
                        style={{ height: 'auto', maxHeight: '100%' }}
                        ref={categoryListRef}
                    >
                        <InfiniteScroll
                            className="d-flex flex-column overflow-unset"
                            dataLength={categoryList.length}
                            next={onNextChatListLoad}
                            scrollThreshold={`200px`}
                            pullDownToRefresh={false}
                            hasMore={totalCategory > categoryList.length}
                            loader={<ChatListLoader />}
                            scrollableTarget="scrollableDiv-categoryList"
                        >
                            {categoryList?.map((item) => {
                                return (
                                    <li className={`contacts-item ${(item.id === activeCategoryChat?.id) ? 'active' : ''} ${-1 > 0 ? 'unread' : ''}`} key={item.id}>
                                        <div className="contacts-link" onClick={() => setActiveCategory(item)} style={{ minHeight: "60px" }}>
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