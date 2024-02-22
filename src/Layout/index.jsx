import React, { useCallback, useEffect, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { createBrowserHistory } from "history";
import moment from "moment-timezone";
// Mui
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
// Redux
import { dispatch } from "redux/store";
import { useSelector } from "react-redux";
import { toggleTheme } from "redux/common";
import { USER_CONST } from "redux/constants/userContants";
import { saveUserRoles } from "redux/api/Prefetch";
import { changeTask } from "redux/actions/modelAction";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { sendPushNotiToken } from "redux/actions/userAction";
import { checkNotifications, setThreadMessage } from "redux/actions/chatAction";
// Utils
import { base } from "utils/config";
import { CONST } from "utils/constants";
import { getAdminAccess } from "utils/permission";
import { receiveMessage } from "utils/wssConnection/Socket";
import logoImage from "assets/media/logo.png";
import getAppRoutes from "Routes";
// Models and Components
import UserImageData from "Components/Modals/UserImageData";
import ErrorBoundary from "Components/ErrorBoundry";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import UserInfoModal from "Components/Modals/UserInfoModal";
import Timeout from "Layout/Timeout";
// import swDev from "swDev";
// App Routes components
import NewChat from "Routes/Chat/Models/NewChat";
import DropZone from "Routes/Chat/Models/Dropzone";
import MediaFiles from "Routes/Chat/Models/MediaFiles";
import CreateGroup from "Routes/Chat/Models/CreateGroup";
import AddUsertoGroup from "Routes/Chat/Models/AddUsertoGroup";
import ImageGalleryZone from "Routes/Chat/Models/ImageGalleryZone";
import ProfilePicUpdate from "Routes/Chat/Models/ProfilePicUpdate";
import ForwardMessage from "Routes/Chat/Models/ForwardMessage";
import GroupUpdate from "Routes/Chat/Models/GroupUpdate";
import PdfViewer from "Routes/Chat/Models/PdfViewer";
import PatientInfoModal from "Components/Modals/PatientInfoModal";
import { getImageURL, getProfileStatus } from "../redux/common";

const history = createBrowserHistory({ window });
moment.suppressDeprecationWarnings = true;

export default function MainLayout() {
  const navigate = useNavigate();
  const { activeChat, chatList, dashboardList, inspectUser, inspectPatient } =
    useSelector((state) => state.chat);
  const { hasNotification } = useSelector((state) => state.task);
  const { user } = useSelector((state) => state.user); //notificationData
  const { name, userImageData } = useSelector((state) => state.model);
  const { taskName } = useSelector((state) => state.model);
  const { pathname } = useLocation();
  const adminAccess = getAdminAccess(user);

  useEffect(() => {
    // swDev();
    sendPushNotiToken();
    saveUserRoles();
  }, []);
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  function getLastName(fullName) {
    // Check if fullName is provided and is a string
    if (fullName && typeof fullName === 'string') {
        // Split the full name by space
        const nameParts = fullName.trim().split(' ');
        // Return the last part of the name
        return nameParts[nameParts.length - 1];
    } else {
        // Return null if fullName is not provided or not a string
        return null;
    }
}
  useEffect(() => {
    checkNotifications(dashboardList, chatList, user.id);
    checkProvider(user.userDesignations);
  }, [user.id, dashboardList, chatList, user.userDesignations]);

  useEffect(() => {
    receiveMessage(
      activeChat?.id,
      user && user?.id,
      !!chatList?.length ? chatList : dashboardList
    );
  }, [activeChat, activeChat?.id, chatList, dashboardList, user, navigate]);

  const setLocationChat = useCallback(
    (val) => {
      if (
        val ||
        (window.location.pathname.includes(CONST.APP_ROUTES.CHAT) &&
          activeChat.id !== -1)
      ) {
        // history.replace(CONST.APP_ROUTES.CHAT, { replace: true });
        dispatch({ type: CHAT_CONST.DELETE_ACTIVE_CHAT, payload: null });
        navigate(CONST.APP_ROUTES.CHAT);
      }
    },
    [activeChat?.id, navigate]
  );

  useEffect(() => {
    try {
      history.listen(({ location, action }) => {
        if (action === "POP") {
          if (window.matchMedia("(display-mode: standalone)").matches) {
            // The website is running as a PWA
            if (
              location.pathname === CONST.APP_ROUTES.TASK ||
              location.pathname === "/tasks/list"
            ) {
              setLocationChat(true);
            } else if (
              location.pathname.includes(CONST.APP_ROUTES.CHAT) &&
              activeChat.id !== -1
            ) {
              setLocationChat();
              // navigate(CONST.APP_ROUTES.CHAT);
              if (taskName !== "") {
                changeTask();
                setThreadMessage();
                dispatch({
                  type: CHAT_CONST.GET_TASKS_SUCCESS,
                  payload: { data: [] },
                });
              }
            } else if (
              location.pathname.includes(CONST.APP_ROUTES.CHAT) &&
              activeChat.id === -1
            ) {
              showExitMessage();
              function showExitMessage() {
                // Create a div element to hold the message
                const exitMessage = document.createElement("div");
                exitMessage.textContent = "Press back again to exit";
                exitMessage.className = "exitpop-up";
                document.body.appendChild(exitMessage);
                // Set a timeout to remove the message after 2 seconds
                setTimeout(function () {
                  exitMessage.remove();
                }, 2000);
              }
            }
          } else {
            setLocationChat();
            // The website is running in a Browser // no need to perform any action
          }
          return false;
        }
      });
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line
  }, [activeChat, navigate]);

  const routesData = useMemo(
    () =>
      getAppRoutes({
        isProvider: user?.isProvider,
        roleData: user?.roleData,
      }).filter((route) => route.id !== "profile-tab"), // Exclude 'Profile' tab
    [user?.isProvider, user?.roleData]
  );

  const tabClass = `chats-tab-open h-100 ${name ? "modal-open" : ""}`;
  const profileClickHandler = () => {
    navigate("/profile");
  };

  return (
    <ErrorBoundary>
      <div className={tabClass}>
        <div className="main-layout prevent-overscroll-reload">
          <div className="navigation navbar navbar-light bg-primary prevent-overscroll-reload">
            {/* <!-- Logo Start --> */}
            <Tooltip
              TransitionComponent={Zoom}
              title={CONST.APP_NAME}
              placement="right"
            >
              <Link
                className="d-none d-xl-block rounded p-1"
                to={CONST.APP_ROUTES.DASHBOARD}
              >
                <img src={logoImage} className="w-100" alt="" />
              </Link>
            </Tooltip>
            <ul
              className="nav nav-minimal flex-row flex-grow-1 justify-content-around flex-xl-column justify-content-xl-start"
              id="mainNavTab"
              role="tablist"
            >
              {routesData.map((route) => {
                route.isActive = pathname.includes(route.pathname)
                  ? " active"
                  : "";
                if (route.hasOwnProperty("access") && !route?.access)
                  return null;
                return (
                  route.id !== "profile-tab" && (
                    <li
                      className={`${route.className} py-xl-1`}
                      key={route.id}
                      onClick={() => {
                        route.onClick && route.onClick();
                      }}
                    >
                      <Tooltip
                        TransitionComponent={Zoom}
                        title={route.title}
                        placement="right"
                      >
                        <Link
                          id={route.id}
                          className={
                            route.linkClassName +
                            route.isActive +
                            " position-relative"
                          }
                          to={route.pathname}
                        >
                          {route.path === "tasks" && hasNotification && (
                            <span className="sidebar-notification blinking"></span>
                          )}
                          {route.icon}
                        </Link>
                      </Tooltip>
                      <label
                        className={route.isActive + "sidebar-label"}
                        style={{ fontSize: "0.5625rem" }}
                      >
                        {route.title}
                      </label>
                    </li>
                  )
                );
              })}
              {base.RUNNING === "LOCAL" && (
                <li className="nav-item">
                  <div className="toggle-theme-wrapper">
                    <label className="toggle-theme" htmlFor="checkbox">
                      <input
                        type="checkbox"
                        id="checkbox"
                        onChange={toggleTheme}
                        checked={user.themeMode === "dark"}
                      />
                      <div className="slider round"></div>
                    </label>
                  </div>
                </li>
              )}
            </ul>
            <div className="flex-row flex-xl-column justify-content-around justify-content-xl-end">
              <div
                className={`avatar ${getProfileStatus(
                  user?.profileStatus
                )} d-sm-inline-block avatar-sm user-avatar`}
                title="Upload Profile"
                onClick={profileClickHandler}
              >
                <img
                  src={getImageURL(user?.profilePicture, "50x50")}
                  alt="Profile"
                />
              </div>
              <div className="contacts-content align-self-center">
                <div className="contacts-info line-height-1">
                  <h6 className="chat-name text-truncate username-text mb-0">
                    {getLastName(user?.name)}
                  </h6>
                  <p style={{fontSize:"11px",fontWeight:"bold"}}>{capitalizeFirstLetter(user.profileStatus)}</p>
                </div>
              </div>
            </div>
            {/* <!-- Main Nav End --> */}
          </div>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
      {!adminAccess && (
        <ErrorBoundary>
          <Timeout />
        </ErrorBoundary>
      )}
      {/* <AppUpdate /> */}
      <UserInfoModal
        showModal={Boolean(inspectUser)}
        inspectUser={inspectUser}
        user={user}
        activeChat={activeChat}
      />
      {inspectPatient && (
        <PatientInfoModal
          showModal={Boolean(inspectPatient)}
          inspectPatient={inspectPatient}
        />
      )}
      <UserImageData showModal={Boolean(userImageData)} data={userImageData} />
      {modelElement(name)}
    </ErrorBoundary>
  );
}

function checkProvider(designations = []) {
  const restrict = designations.some((desg) =>
    CONST.PROVIDERS.includes(desg?.designation?.key)
  );
  dispatch({
    type: USER_CONST.UPDATE_FIELDS,
    payload: { isProvider: restrict },
  });
}

const modelElement = (model) => {
  // All Models
  switch (model) {
    // Modal 1 :: Start a Conversation
    case CHAT_MODELS.NEW_CHAT:
      return <NewChat />;
    // Modal 2 :: Create Group
    case CHAT_MODELS.CREATE_GROUP:
      return <CreateGroup />;
    // Modal 3 :: Invite Others
    // case INVITE_OTHERS:
    // 	return <InviteOthers />;
    // Modal 4 :: Notifications
    // case NOTIFICATION_MODEL:
    // 	return <Notification />;
    // Modal 5 :: Add Note
    // case CHAT_MODELS.ADD_NOTE:
    // 	return <AddNote />;
    // Modal 6 :: Edit Task
    // case EDIT_TASK:
    // 	return <EditTask />;
    // Modal 7 :: Add Task
    // case ADD_TASK:
    // 	return <AddTask />;
    // Modal 8 :: Dropzone
    case CHAT_MODELS.DROP_ZONE:
      return <DropZone />;
    // Modal 9 :: Image gallery
    case CHAT_MODELS.IMAGE_GALLERY:
      return <ImageGalleryZone />;
    // Modal 10 :: PDF Viewer
    case CHAT_MODELS.PDF_VIEWER:
      return <PdfViewer />;
    // Modal 11 :: PDF Viewer
    case CHAT_MODELS.MEDIA_FILES:
      return <MediaFiles />;
    // Modal 12 :: Add User to Group
    case CHAT_MODELS.ADD_USER_TO_GROUP:
      return <AddUsertoGroup />;
    // Modal 13 :: Update Profile Picture
    case CHAT_MODELS.PROFILE_PIC:
      return <ProfilePicUpdate />;
    // Modal 13 :: Update Group Details
    case CHAT_MODELS.UPDATE_GROUP_DEATILS:
      return <GroupUpdate />;
    // Modal 13 :: Forward Message
    // Modal 14 :: Followup Task
    case CHAT_MODELS.FORWARD_MSG:
    case CHAT_MODELS.FOLLOWUP_TASK_GROUP:
      return <ForwardMessage />;
    default:
      return null;
  }
};
