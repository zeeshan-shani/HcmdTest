import React, { useCallback, useEffect, useState } from 'react'
import { X } from 'react-bootstrap-icons';
import { CONST } from 'utils/constants';
import { defaultUserState } from '..';
import { SearchInfoBody } from './SearchInfoBody';
import { MultiSelectTextInput } from 'Components/components';
import { components } from "react-select";
import ErrorBoundary from 'Components/ErrorBoundry';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { useSelector } from 'react-redux';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import { AlternateEmail } from '@mui/icons-material';
const { DropdownIndicator } = components;

// const defaultValue = { search: [], type: '', searchGlobal: "OR" };

export const ChatSearch = ({
    userChatState,
    SetUserChatState,
    setInspectUser,
    isPrivateChat
}) => {
    const { user } = useSelector(state => state.user);
    const { taggedSearch, activeChat } = useSelector(state => state.chat);
    const { isOpen, type = null } = userChatState?.isSearchOpen;
    const searchType = Boolean(userChatState.isSearchOpen.searchType);

    const [value, setValue] = useState([]);
    const [inputValue, setInputValue] = useState();

    useEffect(() => {
        if (taggedSearch) {
            setValue([{ label: `@${user.name}`, value: `@${user.name}` }]);
            dispatch({ type: CHAT_CONST.SET_SEARCH_TAGGED, payload: false });
        }
        // return () => { setValue(defaultValue.search); }
    }, [taggedSearch, user?.name, isOpen, activeChat.id]);

    const onClose = useCallback(() =>
        SetUserChatState(prev => ({
            ...prev,
            isSearchOpen: defaultUserState.isSearchOpen,
            chatInfoVisible: false,
        })), [SetUserChatState]);

    const typeHandler = useCallback((data) => {
        SetUserChatState(prev => ({ ...prev, isSearchOpen: { ...prev.isSearchOpen, ...data } }));
    }, [SetUserChatState]);

    if (!isOpen) return null;
    return (
        <ErrorBoundary>
            <div className={`chat-info chat-search-visible ${userChatState?.isSearchOpen?.hide ? '' : 'chat-info-visible'}`}>
                <div className="d-flex h-100 flex-column">
                    <div className="chat-search-info-header chat-info-header">
                        <div className="container-fluid py-1">
                            <div className="input-group justify-content-between">
                                <div className='d-flex gap-10'>
                                    <div className="dropdown">
                                        <button className="btn dropdown-toggle text-capitalize custom-dropdown text-color" id="searchBarDropdown" data-bs-toggle="dropdown">
                                            <span>{type ? type : 'All'}</span>
                                        </button>
                                        <ul className="dropdown-menu m-0" aria-labelledby="searchBarDropdown">
                                            <li className="dropdown-item" onClick={() => typeHandler({ type: '' })}>All Messages</li>
                                            <li className="dropdown-item" onClick={() => typeHandler({ type: CONST.MSG_TYPE.ROUTINE })}>Routine</li>
                                            <li className="dropdown-item" onClick={() => typeHandler({ type: CONST.MSG_TYPE.EMERGENCY })}>Emergency</li>
                                            <li className="dropdown-item" onClick={() => typeHandler({ type: CONST.MSG_TYPE.URGENT })}>Urgent</li>
                                        </ul>
                                    </div>
                                    <MuiActionButton Icon={AlternateEmail} tooltip="Mentioned messages" size='small' className='text-primary'
                                        onClick={() => setValue([{ label: `@${user.name}`, value: `@${user.name}` }])} />
                                </div>
                                <MuiActionButton tooltip='close' Icon={X} className='text-color' onClick={onClose} />
                            </div>
                            <div className="input-group search-bar_chat-header w-100 m-0 mt-1">
                                <MultiSelectTextInput
                                    setInputValue={setInputValue}
                                    inputValue={inputValue}
                                    setValue={setValue}
                                    value={value}
                                    placeholder='Search messages...'
                                    className="cs w-100 hide-scroll"
                                    innerClass='cstm-multi-input'
                                    autoFocus={true}
                                    DropdownIndicator={(prop) => {
                                        if (value && !!value?.length && value?.length > 1)
                                            return (
                                                <DropdownIndicator {...prop}>
                                                    <button className="btn btn-sm btn-outline-secondary custom-dropdown" type="button"
                                                        onClick={() => SetUserChatState(prev => ({ ...prev, isSearchOpen: { ...prev.isSearchOpen, searchType: !prev.isSearchOpen.searchType } }))}>
                                                        {searchType ? 'AND' : 'OR'}
                                                    </button>
                                                </DropdownIndicator>
                                            );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="chat-search-info-body hide-scrollbar flex-fill">
                        <SearchInfoBody
                            search={value.map((item) => item.value)}
                            searchType={searchType}
                            type={type}
                            SetUserChatState={SetUserChatState}
                            setInspectUser={setInspectUser}
                            isPrivateChat={isPrivateChat}
                            isOpen={userChatState.isSearchOpen.isOpen}
                        />
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}