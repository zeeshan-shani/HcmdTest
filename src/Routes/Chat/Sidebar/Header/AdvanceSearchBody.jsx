import React, { useCallback, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap';
import { Mention, MentionsInput } from 'react-mentions';
import { getPatientData } from 'Routes/Chat/Main/UserChat/footer/ChatFooter';
import { menuStyle } from 'Routes/Chat/Main/UserChat/footer/css/defaultStyle';
import DatePicker from "react-datepicker";
import AsyncSelect from 'react-select/async';
import debounce from 'lodash/debounce';
import moment from 'moment-timezone';
import { generatePayload } from 'redux/common';
import { CONST } from 'utils/constants';
import { useSelector } from 'react-redux';
import { MultiSelectTextInput } from 'Components/components';
import useDebounce from 'services/hooks/useDebounce';
import { components } from "react-select";
import Input from 'Components/FormBuilder/components/Input';
import chatService from 'services/APIs/services/chatService';
const { DropdownIndicator } = components;

export default function AdvanceSearchBody({
    advanceSearch,
    setAdvanceSearch
}) {
    const { user } = useSelector(state => state.user);
    const [searchData, setSearchData] = useState(advanceSearch.data || {});
    const [isAsyncLoading, setIsAsyncLoading] = useState(false);
    const [value, setValue] = useState(advanceSearch?.data?.message ? advanceSearch.data.message.map(i => ({ label: i, value: i })) : []);
    const newValueArr = useDebounce(value, 500);
    const [inputValue, setInputValue] = useState('');
    const newInputValue = useDebounce(inputValue, 700);
    const [searchGlobal, setSearchGlobal] = useState({
        search: [],
        type: advanceSearch.data.hasOwnProperty("searchType") ? advanceSearch.data.searchType : true
    });

    const inputChange = useCallback((e) => {
        const { value, name } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
    }, []);

    const onSearch = useCallback(() => {
        let body = searchData;
        let message = [...newValueArr.map(i => i.value)]
        if (newInputValue) message.push(newInputValue)
        setAdvanceSearch(prev => ({
            ...prev, model: false, update: prev.update ? prev.update + 1 : 1,
            data: { ...body, message, searchType: searchGlobal.type },
        }))
    }, [searchData, setAdvanceSearch, newValueArr, newInputValue, searchGlobal.type]);

    const onCancel = useCallback(() => {
        setAdvanceSearch(prev => ({ ...prev, model: false }));
    }, [setAdvanceSearch]);

    const loadSuggestions = debounce(async (query, callback) => {
        if (!query) return [];
        setIsAsyncLoading(true);
        const payload = await generatePayload({
            rest: { search: [query] },
            options: { pagination: true, limit: 10, "populate": ["lastMessage"] }
        });
        const data = await chatService.chatList({ payload });
        setIsAsyncLoading(false);
        if (data?.status === 1) {
            callback(data.data.map(i => {
                let chatname = i.name;
                if (i.type === CONST.CHAT_TYPE.PRIVATE) {
                    const privUsrId = i.users.find(item => item !== user.id) || ((i.users[0] === i.users[1]) ? i.chatusers[0].user.id : null);
                    const privateUser = i.chatusers.find(item => item.userId === privUsrId)?.user;
                    chatname = privateUser.name || i.name;
                }
                return ({ id: i.id, label: chatname, value: i.id })
            }));
        }
    }, 700);

    return (<>
        <Row>
            <Col xs={12} xl={6} className="form-group mb-0">
                <div className="form-group flex-column d-flex">
                    <label htmlFor={"dateRange"}>
                        {"Date range"}
                    </label>
                    <DatePicker
                        className={`form-control`}
                        placeholderText={"Date Range"}
                        startDate={searchData.date && searchData.date[0] ? new Date(searchData.date[0]) : null}
                        endDate={searchData.date && searchData.date[1] ? new Date(searchData.date[1]) : null}
                        selectsRange
                        isClearable
                        autoComplete="off"
                        onChange={(dates) => {
                            const [a, b] = dates;
                            inputChange({ target: { name: "date", value: [a ? moment(a).startOf("day").toLocaleString() : null, b ? moment(b).endOf("day").toLocaleString() : null] } })
                        }}
                    />
                </div>
            </Col>
            <Col xs={12} xl={6} className="form-group mb-0">
                <div className="form-group flex-column d-flex">
                    <label htmlFor={"chats"}>
                        {"Chat"}
                    </label>
                    <AsyncSelect
                        classNamePrefix="select"
                        className={`basic-single`}
                        isClearable
                        value={searchData.chatData || []}
                        placeholder={`Select Chat...`}
                        loadOptions={loadSuggestions}
                        isLoading={isAsyncLoading}
                        menuPlacement="auto"
                        onChange={(value) => inputChange({ target: { value, name: "chatData" } })}
                    />
                </div>
            </Col>
            <Col xs={12} xl={6} className="form-group mb-0">
                <Input
                    Label="Subject"
                    placeholder="Type Subject"
                    name="subject"
                    handleChange={inputChange}
                    value={searchData.subject}
                />
            </Col>
            <Col xs={12} xl={6} className="form-group mb-0">
                <div className="form-group flex-column d-flex">
                    <label htmlFor={"patient"}>
                        {"Patient"}
                    </label>
                    <MentionsInput
                        id="patientInput"
                        name="patient"
                        autoComplete="off"
                        placeholder="@"
                        type="text"
                        style={menuStyle}
                        value={searchData?.patient ? searchData.patient : ''}
                        onChange={e => {
                            e.target.name = "patient"
                            inputChange(e)
                        }}
                        className='mentions_advance_search inputField'
                        singleLine
                    >
                        <Mention
                            type="user"
                            trigger="@"
                            markup="<@__id__>(__display__)"
                            data={getPatientData}
                            displayTransform={(id, display) => { return `@${display} ` }}
                            className="text-highlight-blue z-index-1"
                            style={{ zIndex: 1, position: 'inherit' }}
                        />
                    </MentionsInput>
                </div>
            </Col>
            <Col xs={12} className="form-group mb-0">
                <label htmlFor={"search"}>
                    {"Message/Task description"}
                </label>
                <div className="input-group w-100 mb-3">
                    <MultiSelectTextInput
                        setInputValue={setInputValue}
                        inputValue={inputValue}
                        setValue={(data) => setValue(data)}
                        value={value}
                        placeholder='Search messages...'
                        className="cs w-100 cstm-multi-search hide-scroll"
                        innerClass='cstm-multi-input'
                        DropdownIndicator={(prop) => {
                            if (value && !!value?.length && value?.length > 1)
                                return (
                                    <DropdownIndicator {...prop}>
                                        <button className="btn btn-sm btn-outline-secondary custom-dropdown" type="button" onClick={() => { setSearchGlobal(prev => ({ ...prev, type: !prev.type })) }}>
                                            {searchGlobal?.type ? 'AND' : 'OR'}
                                        </button>
                                    </DropdownIndicator>
                                );
                        }}
                    />
                </div>
            </Col>
        </Row>
        <div className="form-buttons gap-10 justify-content-end">
            <Button variant='secondary' onClick={onCancel}>Cancel</Button>
            <Button onClick={onSearch}>Search</Button>
        </div>
    </>);
}
