/**
 * It imports several reducers from different files and combines them using the combineReducers function from the Redux library.
 * The combined reducer object consists of reducers for user, chat, task, model, and issues.
 * This file is used to manage the state of the application using Redux.
 */

import { combineReducers } from "redux";
import { chatReducer } from "redux/reducers/chatReducer";
import { issuesReducer } from "redux/reducers/issuesReducer";
import { modelReducer } from "redux/reducers/modelReducer";
import { taskReducer } from "redux/reducers/taskReducer";
import { userReducer } from "redux/reducers/userReducer";
// import announcementReducer from "redux/reducers/announcementReducer";
import announceReducer from "redux/reducers/announceReducer";

export default combineReducers({
  user: userReducer,
  chat: chatReducer,
  task: taskReducer,
  model: modelReducer,
  issues: issuesReducer,
  // announcement: announcementReducer,
  announce: announceReducer,
});
