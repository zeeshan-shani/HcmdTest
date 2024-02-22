/**
 * This file imports the necessary dependencies such as applyMiddleware, mainReducer, thunk, composeWithDevTools, and base from various modules.
 * The middleware array includes the thunk middleware.
 * The store is created using the createStore function, which takes in the mainReducer and applies the middleware.
 * If the base.RUNNING variable is set to "LOCAL", the composeWithDevTools function is used to enhance the store with the Redux DevTools Extension.
 * The store object is exported along with the dispatch and getState functions.
 */

import { applyMiddleware, createStore } from "redux";
import mainReducer from "redux/reducer";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { base } from "utils/config";

const middleware = [thunk];

const store = createStore(
	mainReducer,
	base.RUNNING === "LOCAL"
		? composeWithDevTools(applyMiddleware(...middleware))
		: applyMiddleware(...middleware)
);

export const { dispatch, getState } = store;
export default store;