import React, { useRef, useState, useEffect } from "react";
import { MuiTooltip } from "Components/components";
import { ProfileStatusAvailable } from "Components/Dropdowns/ProfileStatusDD";
import {
  BoxArrowLeft,
  Question,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { changeModel } from "redux/actions/modelAction";
import { onLogout } from "redux/actions/userAction";
import { getImageURL, getProfileStatus, toggleTheme } from "redux/common";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import ProfilePicUpdate from "Routes/Chat/Models/ProfilePicUpdate";
import { useClickAway } from "react-use";
import { Button } from "@mui/material";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { FindInPage } from "@mui/icons-material";

export default function UserProfile({ clockOutHandler, isClockOut }) {
  const { name } = useSelector((state) => state.model);
  const { user } = useSelector((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef();
  const [localStorageData, setLocalStorageData] = useState([]);

  useClickAway(dropdownRef, () => setShowMenu(false));
  // Extracting properties from the first item in localStorageData (adjust as needed)
  const localStorageItem = localStorageData[0] || {};
  const localStorageId = localStorageItem.id || "";
  const localStorageTitle = localStorageItem.title || "";
  const localStorageDescription = localStorageItem.description || "";
  const [help, setHelp] = useState(false);
  const [checkId, setCheckId] = useState(false);
  const buttonRef = useRef(null);

  const clickHandler = (event) => {
    setHelp(true);
  };
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("data")) || [];
    setLocalStorageData(savedData);

    // Log all data to the console
    console.log("Data from localStorage:", savedData);
  }, []);

  const clickHandlerId = () => {
    setCheckId(true);
  };
  useEffect(() => {
    const handleClick = (event) => {
      const clickedElementId = event.target.id;
      // console.log('checkId:', checkId);
      // console.log('event.target:', event.target);
      
      // if (checkId && event.target !== buttonRef.current) {
        console.log(`Clicked element ID: ${clickedElementId}`);
        setCheckId(false);
      // }
    };
  
    // Add a global click event listener
    document.addEventListener("click", handleClick);
  
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [checkId]);

  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: `#${localStorageId}`, // Set the ID dynamically
        popover: {
          title: localStorageTitle, // Set the title dynamically
          description: localStorageDescription, // Set the description dynamically
          side: "left",
          align: "start",
        },
      },
      {
        element: `#${localStorageId}`, // Set the ID dynamically
        popover: {
          title: localStorageTitle, // Set the title dynamically
          description: localStorageDescription, // Set the description dynamically
          side: "left",
          align: "start",
        },
      },
    ],
    onCloseClick: () => {
      setHelp(false);
    },
    onDestroyed: () => {
      setHelp(false);
    },
    active: false,
  });

  const updateProfilePicture = () => changeModel(CHAT_MODELS.PROFILE_PIC);
  return (
    <>
      <div className="media align-items-center contacts-link primary">
        {/* <Button onClick={clickHandler} title="Help">
          <Question size={20} />
        </Button>
        <Button
          id="dont12"
          ref={(node) => (buttonRef.current = node)}
          onClick={clickHandlerId}
          title="Find Id"
        >
          <FindInPage size={20} />
        </Button> */}
        <div
          className={`avatar ${getProfileStatus(
            user?.profileStatus
          )} d-sm-inline-block mr-2 avatar-sm user-avatar`}
          title="Upload Profile++"
          onClick={help ? () => driverObj.drive() : updateProfilePicture}
          id={localStorageId}
        >
          <img src={getImageURL(user?.profilePicture, "50x50")} alt="Profile" />
        </div>

        <div className="contacts-content align-self-center">
          <div className="contacts-info line-height-1">
            <h6 className="chat-name text-truncate username-text mb-0">
              {user?.name}
            </h6>
            <ProfileStatusAvailable
              user={user}
              isClockOut={isClockOut}
              clockOutHandler={clockOutHandler}
            />
          </div>
        </div>
        <div className="dropdown ml-2 d-none dash-head-icon" ref={dropdownRef}>
          <div
            className="cursor-pointer text-color"
            onClick={() => setShowMenu(!showMenu)}
          >
            <ThreeDotsVertical size={18} />
          </div>
          {showMenu && (
            <ul className="dropdown-menu dropdown-menu-right text-light m-1 show">
              <li className="dropdown-item d-flex justify-content-between">
                <span>Dark Mode</span>
                <div className="custom-control custom-switch ml-1">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="themeSwitch"
                    checked={user.themeMode === "dark"}
                    onChange={toggleTheme}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="themeSwitch"
                  ></label>
                </div>
              </li>
              <li
                className="dropdown-item d-flex justify-content-between"
                onClick={onLogout}
              >
                <span>Logout</span>
                <div className="mx-1">
                  <BoxArrowLeft size={20} />
                </div>
              </li>
            </ul>
          )}
        </div>
        <ul className="nav flex-nowrap d-none d-sm-block mx-1">
          <li className="nav-item list-inline-item mr-0 cursor-pointer mx-1 btn-svg">
            <MuiTooltip title="Toggle Dark Mode">
              <div className="custom-control custom-switch ml-1">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="themeSwitch"
                  checked={user.themeMode === "dark"}
                  onChange={(e) => toggleTheme(e)}
                />
                <label
                  className="custom-control-label"
                  htmlFor="themeSwitch"
                ></label>
              </div>
            </MuiTooltip>
          </li>
          <li
            className="nav-item list-inline-item mr-0 cursor-pointer mx-1 btn-svg"
            onClick={onLogout}
          >
            <MuiTooltip title="Logout">
              <BoxArrowLeft size={20} />
            </MuiTooltip>
          </li>
        </ul>
      </div>
      {name === CHAT_MODELS.PROFILE_PIC && (
        <>
          <div className="backdrop backdrop-visible" />
          <ProfilePicUpdate />
        </>
      )}
    </>
  );
}
