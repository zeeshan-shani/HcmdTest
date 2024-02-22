import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useDebounce from "services/hooks/useDebounce";
import { components } from "react-select";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import {
  At,
  Bell,
  BellSlash,
  FilterCircle,
  FilterCircleFill,
  Incognito,
  People,
  PersonAdd,
} from "react-bootstrap-icons";

import CampaignIcon from "@mui/icons-material/Campaign";
import { dispatch } from "redux/store";
import { changeModel } from "redux/actions/modelAction";
import { updateUserAPI } from "redux/actions/userAction";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { getImageURL, getProfileStatus } from "redux/common";
import { getSuperAdminAccess } from "utils/permission";
import { CONST, SOCKET } from "utils/constants";
import { SocketEmiter } from "utils/wssConnection/Socket";
import { MuiActionButton } from "Components/MuiDataGrid";
import { ProfileStatusAvailable } from "Components/Dropdowns/ProfileStatusDD";
import { MultiSelectTextInput, MuiTooltip } from "Components/components";
import AdvanceSearchBody from "./AdvanceSearchBody";
import ModalReactstrap from "Components/Modals/Modal";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import ErrorBoundary from "Components/ErrorBoundry";
import { showSuccess } from "utils/package_config/toast";
import { Tab, Tabs } from "@mui/material";
import { ListType } from "..";
import { USER_CONST } from "redux/constants/userContants";
const { DropdownIndicator } = components;

export const ChatsContentSidebarHeader = ({
  searchGlobal,
  setSearchGlobal,
  advanceSearch,
  setAdvanceSearch,
  chatSidebarState,
  setChatSidebarState,
}) => {
  const navigate = useNavigate();
  const { globalSearch, hiddenChatNotiCount, hiddenCountTime, hiddenChats } =
    useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);

  const { filterUsers, viewUnread } = chatSidebarState;

  const [value, setValue] = useState([]);
  const newValueArr = useDebounce(value, 500);
  const [inputValue, setInputValue] = useState("");
  const newInputValue = useDebounce(inputValue, 700);
  const advanceSearchRef = useRef();
  const ModelHandler = useCallback((name) => changeModel(name), []);

  // onChange chat filter type
  const onFilterUsersHandler = useCallback(
    (type, isHiddenCall) => {
      setChatSidebarState((prev) => ({ ...prev, filterUsers: type }));
      // if (!isHiddenCall) setChatSidebarState(prev => ({ ...prev, hiddenChats: false }));
      if (!isHiddenCall)
        dispatch({ type: CHAT_CONST.SET_HIDDEN_CHATS, payload: false });
    },
    [setChatSidebarState]
  );

  // onChange filter type to hidden
  const onFilterHideChat = useCallback(
    (type) => {
      dispatch({ type: CHAT_CONST.SET_HIDDEN_CHATS, payload: true });
      // setChatSidebarState(prev => ({ ...prev, hiddenChats: true }));
      onFilterUsersHandler(type, true);
    },
    [onFilterUsersHandler]
  );

  // open profile pic update modal
  const updateProfilePicture = useCallback(
    () => changeModel(CHAT_MODELS.PROFILE_PIC),
    []
  );

  // Is user clocked out
  const isClockOut = useMemo(
    () =>
      user?.clockTime?.clockin?.length === user?.clockTime?.clockout?.length,
    [user?.clockTime?.clockin?.length, user?.clockTime?.clockout?.length]
  );

  // Function for clock out user
  const clockOutHandler = useCallback(
    () => SocketEmiter(SOCKET.REQUEST.CREATE_USER_LOG, { clockout: true }),
    []
  );

  // Function for change search call
  const onChangeSearch = useCallback(
    (value, arrValue = []) => {
      let search = arrValue.map((item) => item.value);
      if (value) search.push(value);
      setSearchGlobal((prev) => ({ ...prev, search: [...new Set(search)] }));
    },
    [setSearchGlobal]
  );

  // Function for trigger ghost mode
  const onGhostModeChange = useCallback(async () => {
    await updateUserAPI({
      userId: user.id,
      isGhostActive: !user?.isGhostActive,
    });
    SocketEmiter(
      !user?.isGhostActive ? "join-chat-ghost-mode" : "leave-chat-ghost-mode"
    );
    navigate("/chats");
    dispatch({ type: CHAT_CONST.DELETE_ACTIVE_CHAT });
    setChatSidebarState((prev) => ({ ...prev, ghostStateChanged: true }));
    dispatch({ type: CHAT_CONST.CLEAR_CHAT_LIST_DATA, payload: true });
    showSuccess(`Turning ghost mode ${!user?.isGhostActive ? "on" : "off"}`);
  }, [user.id, user?.isGhostActive, setChatSidebarState, navigate]);

  useEffect(() => {
    if (hiddenChats && hiddenCountTime)
      dispatch({
        type: CHAT_CONST.VERIFY_HIDDEN_CHAT_MENTION,
        userId: user.id,
      });
  }, [hiddenChats, hiddenCountTime, user.id]);

  // Debounce onchange search and call API
  useEffect(() => {
    onChangeSearch(newInputValue, newValueArr);
  }, [newInputValue, newValueArr, onChangeSearch]);

  useEffect(() => {
    if (!globalSearch?.length) return;
    setValue([{ label: globalSearch[0], value: globalSearch[0] }]);
    dispatch({ type: CHAT_CONST.SET_GLOBAL_SEARCH, payload: null });
  }, [globalSearch]);

  // Toggle mute notification
  const toggleSilent = useCallback(async () => {
    await updateUserAPI({ userId: user.id, isSilentMode: !user?.isSilentMode });
    showSuccess(`Turned silent mode ${user?.isSilentMode ? "on" : "off"}`);
  }, [user?.isSilentMode, user.id]);

  // Count of advance search keywords
  const advanceKeysLength = Object.keys(advanceSearch.data).length;

  const onChangeTab = useCallback(
    (e, val) => {
      setChatSidebarState((prev) => ({ ...prev, listType: val }));
    },
    [setChatSidebarState]
  );

  const onMentionUnread = useCallback(async () => {
    dispatch({
      type: USER_CONST.UPDATE_USER_DATA,
      payload: { id: user.id, showMentionUnread: !user?.showMentionUnread },
    });
    showSuccess(
      `${user?.showMentionUnread ? "Hide" : "Show"} mention unread chats`
    );
  }, [user.id, user?.showMentionUnread]);

  return (
    <ErrorBoundary>
      <div
        className="sidebar-header sticky-top bg__chat-dark"
        style={{ padding: ".75rem .75rem  0 .75rem" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="media align-items-center contacts-link">
            <div
              className={`avatar ${getProfileStatus(
                user?.profileStatus
              )} d-sm-inline-block mr-2 user-avatar`}
              title="Upload Profile"
              onClick={updateProfilePicture}
            >
              <img
                src={getImageURL(user?.profilePicture, "50x50")}
                alt="Profile"
              />
            </div>
            <div className="contacts-content align-self-center">
              <div className="contacts-info">
                <h6 className="chat-name text-truncate username-text mb-0">
                  {user?.name}
                </h6>
                <ProfileStatusAvailable
                  isClockOut={isClockOut}
                  clockOutHandler={clockOutHandler}
                />
              </div>
            </div>
          </div>
          <ul className="nav flex-wrap gap-5">
            <li
              className="nav-item list-inline-item mr-0 cursor-pointer mx-1 btn-svg"
              onClick={() => navigate("announcement")}
            >
              <div style={{ display: "flex" }}>
                <MuiTooltip title={`Announcements`}>
                  <CampaignIcon />
                </MuiTooltip>
              </div>
            </li>
            <li className="nav-item" onClick={toggleSilent}>
              <MuiActionButton
                tooltip={`Tap to turn silent mode ${
                  user?.isSilentMode ? "off" : "on"
                }`}
                Icon={!user.isSilentMode ? Bell : BellSlash}
                size="small"
                className="text-color"
                onClick={toggleSilent}
              />
            </li>
            <li className="nav-item" onClick={onMentionUnread}>
              <MuiActionButton
                tooltip={`Tap to ${
                  user?.showMentionUnread ? "hide" : "show"
                } mention unread chats`}
                Icon={At}
                className={`${
                  !user.showMentionUnread ? "text-color" : "text-primary"
                }`}
                size="small"
                onClick={onMentionUnread}
              />
            </li>
            {getSuperAdminAccess(user) && user?.ghostUser && (
              <li className="nav-item" onClick={onGhostModeChange}>
                <MuiActionButton
                  tooltip={`Tap to turn ${
                    !user?.isGhostActive ? "on" : "off"
                  } ghost mode`}
                  Icon={Incognito}
                  className={user.isGhostActive ? "text-primary" : "text-color"}
                  size="small"
                  onClick={onGhostModeChange}
                />
              </li>
            )}
            <li className="nav-item">
              <MuiActionButton
                tooltip={"New Chat"}
                Icon={PersonAdd}
                size="small"
                className="text-color"
                onClick={() => ModelHandler(CHAT_MODELS.NEW_CHAT)}
              />
            </li>
            <li className="nav-item">
              <MuiActionButton
                tooltip={"Create Group"}
                Icon={People}
                size="small"
                className="text-color"
                onClick={() => ModelHandler(CHAT_MODELS.CREATE_GROUP)}
              />
            </li>
            <li className={`nav-item`}>
              <MuiActionButton
                tooltip={"Filter Unraed Chat"}
                Icon={viewUnread ? FilterCircleFill : FilterCircle}
                size="small"
                className={`${viewUnread ? "text-success" : "text-color"}`}
                onClick={() =>
                  setChatSidebarState((prev) => ({
                    ...prev,
                    viewUnread: !prev.viewUnread,
                  }))
                }
              />
            </li>
          </ul>
        </div>
        <div className="d-flex py-1 justify-content-between">
          <div className="dropdown">
            <button
              className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown"
              id="chatFilterDropdown"
              data-bs-toggle="dropdown"
            >
              {hiddenChats ? "Hidden" : filterUsers}
              {Boolean(hiddenChatNotiCount) && (
                <span className="sidebar-notification" />
              )}
            </button>
            <ul
              className="dropdown-menu m-0"
              aria-labelledby="chatFilterDropdown"
            >
              <li
                className="dropdown-item"
                onClick={() => onFilterUsersHandler(CONST.CHAT_TYPE.ALL_CHATS)}
              >
                Chats
              </li>
              <li
                className="dropdown-item"
                onClick={() => onFilterUsersHandler(CONST.CHAT_TYPE.PRIVATE)}
              >
                Private
              </li>
              <li
                className="dropdown-item"
                onClick={() => onFilterUsersHandler(CONST.CHAT_TYPE.GROUP)}
              >
                Groups
              </li>
              <li
                className="dropdown-item"
                onClick={() => onFilterHideChat(CONST.CHAT_TYPE.ALL_CHATS)}
              >
                Hidden{" "}
                {Boolean(hiddenChatNotiCount) && (
                  <Badge pill bg="primary" className="text-white ml-1">
                    {hiddenChatNotiCount === true ? "@" : hiddenChatNotiCount}
                  </Badge>
                )}
              </li>
            </ul>
          </div>
          <div
            className="input-group search-bar_chat-header w-100"
            style={{ maxWidth: "calc(100% - 96px)" }}
          >
            <MultiSelectTextInput
              setInputValue={setInputValue}
              inputValue={inputValue}
              setValue={(data) => {
                if (
                  (chatSidebarState.listType === ListType.PATIENT ||
                    chatSidebarState.listType === ListType.CATEGORY) &&
                  data.length <= 1
                )
                  return setValue(data);
                else if (chatSidebarState.listType === ListType.CHAT)
                  setValue(data);
              }}
              value={value}
              placeholder="Search messages..."
              className="cs w-100 cstm-multi-search hide-scroll"
              innerClass="cstm-multi-input"
              DropdownIndicator={(prop) => {
                if (value && !!value?.length && value?.length > 1)
                  return (
                    <DropdownIndicator {...prop}>
                      <button
                        className="btn btn-sm btn-outline-secondary custom-dropdown"
                        type="button"
                        onClick={() => {
                          setSearchGlobal((prev) => ({
                            ...prev,
                            type: !prev.type,
                          }));
                        }}
                      >
                        {searchGlobal?.type ? "AND" : "OR"}
                      </button>
                    </DropdownIndicator>
                  );
              }}
            />
          </div>
        </div>
        <div
          className={`badges ${"d-flex justify-content-end"}`}
          ref={advanceSearchRef}
        >
          <Badge
            pill
            bg={"secondary"}
            text="light"
            className="p-1 px-2 mr-1 cursor-pointer"
            onClick={() => navigate("threads")}
          >
            Threads
          </Badge>
          <Badge
            pill
            bg={"secondary"}
            text="light"
            className="p-1 px-2 mr-1 cursor-pointer"
            onClick={() => navigate("drafts")}
          >
            Drafts
          </Badge>
          <Badge
            pill
            bg={advanceKeysLength ? "success" : "secondary"}
            text="light"
            className="p-1 px-2 mr-1 cursor-pointer"
            onClick={() =>
              setAdvanceSearch((prev) => ({ ...prev, model: true }))
            }
          >
            {`Advance Search`}
          </Badge>
          {!!advanceKeysLength && (
            <Badge
              pill
              bg="secondary"
              text="light"
              className="p-1 px-2 mr-1 cursor-pointer"
              onClick={() => setAdvanceSearch({ model: false, data: {} })}
            >
              Reset
            </Badge>
          )}
        </div>
        <ModalReactstrap
          header={"Advance Search"}
          toggle={() => setAdvanceSearch((prev) => ({ ...prev, model: false }))}
          show={advanceSearch.model}
          size="lg"
          body={
            advanceSearch.model && (
              <AdvanceSearchBody
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
              />
            )
          }
        />
        <Tabs
          value={chatSidebarState.listType}
          onChange={onChangeTab}
          // textColor="secondary"
          indicatorColor="primary"
          className="bg-transparent"
          variant="fullWidth"
          classes={{
            flexContainer: "justify-content-around",
          }}
        >
          {Object.values(ListType).map((item) => (
            <Tab
              key={item}
              className="text-capitalize bg-none"
              style={{ color: "var(--text-color)" }}
              value={item}
              label={item}
            />
          ))}
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};
