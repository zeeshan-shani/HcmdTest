/**
 * This file contains common functions used throughout the application.
 * It includes functions for data encryption, URL manipulation, image handling, and more.
 * The file also includes functions for handling notifications, formatting text, and other utility functions.
 */

import { Suspense } from "react";
import axios from "axios";
import moment from "moment-timezone";
import fileDownload from "js-file-download";
import CryptoJS from "crypto-js";
import { dispatch } from "redux/store";
import { CONST } from "utils/constants";
import { base, firebaseConfig } from "utils/config";
import { toast } from "react-hot-toast";
import { onMessage } from "firebase/messaging";
import { chatBackgrounds } from "Routes/UserProfile/Settings/ApplicationSettings/ChatBackground";
import { USER_CONST } from "./constants/userContants";
import { ReactComponent as Loader } from "assets/media/messageLoader.svg";
import * as serviceWorkerRegistration from "serviceWorkerRegistration";

let suppourtedExt = ["jpg", "png", "jpeg"];
let hostEndsWith = (host, ends) => ends.some((element) => host?.toLowerCase().endsWith(element.toLowerCase()));

export const encryptData = async (data, secretPass = CONST.ENCRYPT_KEY) => {
	return CryptoJS.AES.encrypt(JSON.stringify(data), secretPass).toString();
};

export const getAudioUrl = (url, cache = false) => {
	return cache ? url : `${url}?timestamp=${Date.now()}`;
};
export const getImageURL = (profilePic, size = "500x500", cache = true) => {
	const url = profilePic ? profilePic : CONST.DEFAULT_USER_IMAGE;
	const imageUrl = hostEndsWith(url, suppourtedExt) ? `${base.CLOUD_IMAGE}/${size}/${url.split("/").pop()}` : url;
	return cache ? imageUrl : `${imageUrl}?timestamp=${Date.now()}`;
};
export const getChatImageURL = ({ imageurl, size = "500x500", quality = 5, cache = false }) => {
	const url = hostEndsWith(imageurl, suppourtedExt) ? `${base.CLOUD_IMAGE}/filters:quality(${quality})/${size}/${imageurl.split("/").pop()}` : imageurl;
	return cache ? url : `${url}?timestamp=${Date.now()}`;
}

export const getChatBackgroudClass = (code) => {
	const findItem = chatBackgrounds.find((item) => item.colorCode === code);
	if (findItem) return findItem.class;
	return "bg-chat-dark";
};
export const getProfileStatus = (status) => {
	switch (status) {
		case CONST.PROFILE.ONLINE:
			return "avatar-online";
		case CONST.PROFILE.OFFLINE:
			return "avatar-offline";
		case CONST.PROFILE.AVAILABLE:
			return "avatar-away";
		case CONST.PROFILE.BUSY:
			return "avatar-busy";
		case CONST.PROFILE.BREAK:
			return "avatar-vacation";
		case CONST.PROFILE.ONCALL:
			return "avatar-vacation";
		case CONST.PROFILE.VACATION:
			return "avatar-vacation";
		default:
			return "";
	}
};

export const setBadge = async (args) => {
	if ("setAppBadge" in navigator) {
		navigator.setAppBadge(args).catch((error) => { });
	}
};

export const clearBadge = () => {
	if ("clearAppBadge" in navigator) {
		navigator.clearAppBadge().catch((error) => { });
	}
};

export const getDateLabel = (date) => {
	if (moment().format("MM/DD/YY") === moment(date).format("MM/DD/YY")) return `Today`;
	if (moment().subtract(1, "days").format("MM/DD/YY") === moment(date).format("MM/DD/YY")) return `Yesterday`;
	return moment(date).format("MM/DD/YY");
};

export const getBackgroundColorClass = (item) => {
	switch (item) {
		case CONST.MSG_TYPE.ROUTINE:
			return "bg-routine";
		case CONST.MSG_TYPE.EMERGENCY:
			return "bg-emergency";
		case CONST.MSG_TYPE.URGENT:
			return "bg-urgent";
		case "q-" + CONST.MSG_TYPE.ROUTINE:
			return "bg-q-routine";
		case "q-" + CONST.MSG_TYPE.EMERGENCY:
			return "bg-q-emergency";
		case "q-" + CONST.MSG_TYPE.URGENT:
			return "bg-q-urgent";
		default:
			return "bg-routine";
	}
};
export const getTaskBackgroundColorClass = (item) => {
	switch (item) {
		case CONST.TASK_STATUS[0].value:
			return "bg-pending";
		case CONST.TASK_STATUS[1].value:
			return "bg-started";
		case CONST.TASK_STATUS[2].value:
		case CONST.TASK_STATUS[4].value:
			return "bg-paused";
		case CONST.TASK_STATUS[3].value:
			return "bg-finished";
		default:
			return "bg-pending";
	}
};
export const getTypeClass = (type) => {
	switch (type) {
		case CONST.MSG_TYPE.EMERGENCY:
			return "task-type-danger";
		case CONST.MSG_TYPE.URGENT:
			return "task-type-warning";
		case CONST.MSG_TYPE.ROUTINE:
			return "task-type-routine";
		default:
			return "task-type-routine";
	}
};

export const getStatusColor = (status) => {
	switch (status) {
		case CONST.TASK_STATUS[0].value:
			return "bg-pending";
		case CONST.TASK_STATUS[1].value:
			return "bg-started";
		case CONST.TASK_STATUS[2].value:
		case CONST.TASK_STATUS[4].value:
			return "bg-paused";
		case CONST.TASK_STATUS[3].value:
		case "finished":
			return "bg-finished";
		default:
			return "bg-pending";
	}
};

export const getDueDateObj = (date, taskStatus) => {
	let color = "bg-duedate_1", isOverDue = false, visible = false, dueDate;
	if (date && taskStatus !== CONST.TASK_STATUS[3].value) dueDate = moment(date);
	else return { visible };
	const todayDate = moment();
	if (dueDate.diff(todayDate, "days") < 3) visible = true;
	if (dueDate.diff(todayDate, "days") < 0) {
		color = "bg-duedate_3";
		isOverDue = true;
	}
	else if (dueDate.diff(todayDate, "days") < 1) color = "bg-duedate_3";
	else if (dueDate.diff(todayDate, "days") < 3) color = "bg-duedate_2";
	return { color, isOverDue, visible }
};

export const getUserColor = (id) => `c-user-${id % 10}`;

export const handleDownload = async (url, filename) => {
	try {
		await axios.get(url, { responseType: "blob" })
			.then((res) => {
				fileDownload(res.data, filename);
			});
	} catch (error) {
		console.error(error);
	}
};

export const getDateXDaysAgoStartOf = (numOfDays, date = new Date()) =>
	moment().subtract(numOfDays, "days").startOf("day");

export const getDateXDaysAgoEndOf = (numOfDays, date = new Date()) =>
	moment().subtract(numOfDays, "days").endOf("day");

export const getTaskStatus = (status) => {
	switch (status) {
		case CONST.TASK_STATUS[0].value:
			return "avatar-busy";
		case CONST.TASK_STATUS[1].value:
			return "avatar-primary";
		case CONST.TASK_STATUS[2].value:
		case CONST.TASK_STATUS[4].value:
			return "avatar-away";
		case CONST.TASK_STATUS[3].value:
			return "avatar-online";
		default:
			return "";
	}
};

// ------------------------------ Theme start ------------------------------
var theme = document.getElementById("dark-theme-link");
export const storedTheme = localStorage.getItem("theme");
const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

export const defaultLight = storedTheme === "light" || (storedTheme === null && prefersLight);
export const defaultDark = storedTheme === "dark" || (storedTheme === null && prefersDark);

export const setDark = () => {
	localStorage.setItem("theme", "dark");
	document.documentElement.setAttribute("data-theme", "dark");
	theme.setAttribute("href", base.FURL + "/assets/css/skins/dark-skin.min.css");
	// lazy(() => import('assets/css/skins/dark-skin.min.css'));
	dispatch({ type: USER_CONST.SET_THEME_MODE, payload: "dark" });
};

export const setLight = () => {
	localStorage.setItem("theme", "light");
	document.documentElement.setAttribute("data-theme", "light");
	theme.setAttribute("href", "");
	dispatch({ type: USER_CONST.SET_THEME_MODE, payload: "light" });
};

if (!theme.getAttribute("href") && defaultLight) theme.setAttribute("href", "");
if (!theme.getAttribute("href") && defaultDark) theme.setAttribute("href", base.FURL + "/assets/css/skins/dark-skin.min.css");
document.documentElement.setAttribute("data-theme", storedTheme ? storedTheme : "light");

export const toggleTheme = (e) => (e.target.checked) ? setDark() : setLight();

// ****************************************  Theme end  ****************************************

// ****************************************  Format Start  ****************************************
// Following Functinos will be used to display bold, italic, link text and many more patterns as defined.
export function messageFormat(text, searchKey, cc) {
	let str = text;
	if (searchKey) str = textToShow(format_tagged_markup(str), searchKey, cc);
	return format_all(str);
}

const findTagUrl = (match, p1, p2) => {
	if (p2 && (!match.includes('<img') || !match.includes('<a'))) return p2;
	else if (p1) return `<a class="word-break" href="${p1}" target="_blank">${p1}</a>`;
	else return match;
}
export function format_all(text, sanitize = CONST.sanitize_message) {
	const textString = String(text)
		.replace(CONST.REGEX.TAG_MARKUP1, "<span class='text-highlight-blue mr-1'>@$2</span>")
		.replace(CONST.REGEX.HASH_TAG_MARKUP, "<span class='text-highlight-blue mr-1'>#$1</span>")
		.replace(CONST.REGEX.START_WORD, "<b>$1</b>")
		.replace(CONST.REGEX.UNDERSCORE_WORD, "<i>$1</i>")
		.replace(CONST.REGEX.DOUBLE_DASH_WORD, "<u>$1</u>")
		.replace(CONST.REGEX.SUM_WORD, "<s>$1</s>")
		.replace(CONST.REGEX.BACKTICK_WORD, "<tt>$1</tt>")
		// .replace(CONST.REGEX.MENTION_USER, "<span class='text-highlight-blue'>$1</span>")
		.replace(CONST.REGEX.LINK.PATTERN_1, '<a class="word-break" href="$1" target="_blank">$1</a>')
		// .replace(CONST.REGEX.LINK.PATTERN_1, findTagUrl)
		.replace(CONST.REGEX.LINK.PATTERN_2, '$1<a class="word-break" href="http://$2" target="_blank">$2</a>')
		.replace(CONST.REGEX.LINK.PATTERN_3, '<a class="word-break" href="mailto:$1">$1</a>')
	const cleaned = sanitizeHTMLText(textString, sanitize);
	return cleaned;
}
export function format_tagged_markup(text, sanitize = CONST.sanitize_message) {
	return sanitizeHTMLText(
		String(text).replace(CONST.REGEX.TAG_MARKUP1, "<span class='text-highlight-blue mr-1'>@$2</span>"),
		sanitize
	);
}
export function format_mention(text, sanitize = CONST.sanitize_message) {
	return sanitizeHTMLText(String(text).replace(CONST.REGEX.TAG_MARKUP1, "@$2"), sanitize);
}
export function format_patient(text, sanitize = CONST.sanitize_message) {
	return sanitizeHTMLText(
		String(text)
			.replace(CONST.REGEX.TAG_MARKUP1, "<span class='text-highlight-blue mr-1'>$2</span>")
			.replace(CONST.REGEX.START_WORD, "<b>$1</b>")
			.replace(CONST.REGEX.UNDERSCORE_WORD, "<i>$1</i>")
			.replace(CONST.REGEX.DOUBLE_DASH_WORD, "<u>$1</u>")
			.replace(CONST.REGEX.SUM_WORD, "<s>$1</s>")
			.replace(CONST.REGEX.BACKTICK_WORD, "<tt>$1</tt>")
			// .replace(CONST.REGEX.LINK.PATTERN_1, '<a class="word-break" href="$1" target="_blank">$1</a>')
			.replace(CONST.REGEX.LINK.PATTERN_1, findTagUrl)
			.replace(CONST.REGEX.LINK.PATTERN_2, '$1<a class="word-break" href="http://$2" target="_blank">$2</a>')
			.replace(CONST.REGEX.LINK.PATTERN_3, '<a class="word-break" href="mailto:$1">$1</a>'),
		sanitize
	);
}
export function format_ccText(text, sanitize = CONST.sanitize_message) {
	const textString = String(text)
		.replace(CONST.REGEX.TAG_MARKUP1, "<span class='text-highlight-blue mr-1'>$2</span>")
		.replace(CONST.REGEX.START_WORD, "<b>$1</b>")
		.replace(CONST.REGEX.UNDERSCORE_WORD, "<i>$1</i>")
		.replace(CONST.REGEX.DOUBLE_DASH_WORD, "<u>$1</u>")
		.replace(CONST.REGEX.SUM_WORD, "<s>$1</s>")
		.replace(CONST.REGEX.BACKTICK_WORD, "<tt>$1</tt>")
		// .replace(CONST.REGEX.LINK.PATTERN_1, '<a class="word-break" href="$1" target="_blank">$1</a>')
		.replace(CONST.REGEX.LINK.PATTERN_1, findTagUrl)
		.replace(CONST.REGEX.LINK.PATTERN_2, '$1<a class="word-break" href="http://$2" target="_blank">$2</a>')
		.replace(CONST.REGEX.LINK.PATTERN_3, '<a class="word-break" href="mailto:$1">$1</a>')
	const cleaned = sanitizeHTMLText(textString, sanitize)
	return cleaned;
}
export const textToShow = (text, findTxt, cc = false, sanitize = CONST.sanitize_message) => {
	let regex;
	if (!text || !findTxt || !findTxt.length) return String(text);
	if (typeof findTxt === "object") {
		if (cc) regex = new RegExp("(@" + findTxt.join("|@") + ")", "gi");
		else regex = new RegExp("(" + findTxt.join("|") + ")", "gi");
		return String(text).replace(regex, `<mark>$&</mark>`);
	}
	if (cc) regex = new RegExp(`@${findTxt}`, "gi");
	else regex = new RegExp(findTxt, "gi");
	return sanitizeHTMLText(
		String(text).replace(regex, `<mark>$&</mark>`), sanitize
	);
};
// ****************************************  Format end  ****************************************

// ****************************************  Notification start  ****************************************
export const showNotificationfunc = async ({ msg = "NA", title = CONST.APP_NAME, photo = CONST.DEFAULT_USER_IMAGE }) => {
	try {
		const body = { msg, title, photo };
		let permission = Notification.permission;
		if (permission === "granted") showNotification(body);
		else if (permission === "default") requestAndShowPermission(body);
		// const data = {
		// 	title,
		// 	options: {
		// 		body: body.msg,
		// 		icon: "maskable_icon_x192.png",
		// 		tag: "pwa",
		// 	},
		// };
		// pwa.Notification(data);
	} catch (error) {
		console.error(error);
		// alert(error);
	}
};

function requestAndShowPermission(data) {
	Notification.requestPermission(function (permission) {
		if (permission === "granted") showNotification(data);
	});
}
function showNotification(data) {
	navigator.serviceWorker.getRegistration().then((registration) => {
		const options = {
			body: data.msg,
			icon: `${process.env.PUBLIC_URL}/icons/badge.png`,
			image: data.photo,
			badge: `${process.env.PUBLIC_URL}/icons/badge.png`,
			data: {
				this: "my-data",
			},
		};
		registration.showNotification(data?.title, options);
	});
}
// ****************************************  Notification ends  ****************************************

// ****************************************  Others  ****************************************

export const isArrayEquals = (a, b) => {
	return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
};

export const isAnyMatchWithArrayElements = (a = [], str = "") => {
	if (!a || !str) return false;
	return a.some((val) => str.toLowerCase().includes(val.toLowerCase()));
};

export const updateState = (setState, updates = {}) => {
	return setState((prev) => ({ ...prev, ...updates }));
};

export function fnBrowserDetect() {
	let userAgent = navigator.userAgent;
	let browserName;
	if (userAgent.match(/chrome|chromium|crios/i)) browserName = "chrome";
	else if (userAgent.match(/firefox|fxios/i)) browserName = "firefox";
	else if (userAgent.match(/safari/i)) browserName = "safari";
	else if (userAgent.match(/opr\//i)) browserName = "opera";
	else if (userAgent.match(/edg/i)) browserName = "edge";
	else browserName = "No browser detection";
	return browserName;
}

// const markupToRegex = (markup) => {
// 	const escapedMarkup = escapeRegex(markup);
// 	const charAfterDisplay = markup[markup.indexOf(PLACEHOLDERS.display) + PLACEHOLDERS.display.length];
// 	const charAfterId = markup[markup.indexOf(PLACEHOLDERS.id) + PLACEHOLDERS.id.length];
// 	return new RegExp(
// 		escapedMarkup
// 			.replace(PLACEHOLDERS.display, `([^${escapeRegex(charAfterDisplay || "")}]+?)`)
// 			.replace(PLACEHOLDERS.id, `([^${escapeRegex(charAfterId || "")}]+?)`)
// 	);
// };
// const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// const PLACEHOLDERS = {
// 	id: "__id__",
// 	display: "__display__",
// };

// console.log(markupToRegex("<#__id__>(@__display__)"));

export const generatePayload = async ({ body = {}, rest = {}, keys = null, value = null, options = {}, isCount = false, findOne = false, currSearch = "" }) => {
	let payload = {
		query: { range: [] },
		options: { limit: 10, page: 1, pagination: false },
	};
	body && Object.keys(body).map((key, index) => {
		if (["date", "created", "createdAt", "dueDate", "start", "dischargeDate", "dictationDate"].includes(key)) {
			if (body[key].hasOwnProperty("dateFrom") && body[key].hasOwnProperty("dateTo") && body[key].dateFrom && body[key].dateTo)
				payload.query.range.push({ key, value: [body[key].dateFrom, body[key].dateTo] });
		}
		if (body.hasOwnProperty("status") && body.status) payload.query.status = body.status;
		if (body.hasOwnProperty("type") && body.type) payload.query.type = body.type;
		if (body.hasOwnProperty("designationId") && body.designationId) payload.query.designationId = body.designationId;
		if (body.hasOwnProperty("profileStatus") && body.profileStatus) payload.query.profileStatus = body.profileStatus;
		if (body.hasOwnProperty("subcategory")) payload.query.subcategory = body.subcategory;
		if (body.hasOwnProperty("assignedIssue")) payload.query.assignedIssue = body.assignedIssue;
		return null;
	});
	if (keys && value) {
		payload.keys = keys;
		payload.value = value;
	}
	payload.query = { ...payload.query, ...rest };
	payload.options = { ...payload.options, ...options };
	payload.options.page = (value && currSearch !== value ? 1 : options.page)
	if (payload.options.attributes) {
		if (payload.options.attributes.exclude && payload.options.attributes.data)
			payload.options.attributes = payload.options.attributes.data.filter(i => !payload.options.attributes.exclude.includes(i))
		delete payload.options.attributes.data;
	}
	payload.isCount = isCount;
	payload.findOne = findOne;
	return payload;
};

export const toastPromise = async ({ func, loading = "Loading", success = "Successfully done", error = "Error occured", options = {} }) => {
	const myPromise = new Promise(func);
	await toast.promise(myPromise, { loading, success, error }, options);
	return true;
};

export const LazyComponent = (props) =>
	<Suspense fallback={props.fallback ? props.fallback : <Loader height={"80px"} />}>{props.children}</Suspense>;

export const Loadable = (Component) => (props) =>
	<Suspense fallback={<Loader height={"80px"} />}><Component {...props} /></Suspense>;

export const makeUniqueObjects = (arr) => Array.from(new Set(arr.map((a) => a.id))).map((id) => arr.find((a) => a.id === id));

export const JSONParserer = (data) => (Array.isArray(data) ? data : JSONParserer(JSON.parse(data)));
export const JSONStringfier = (data) => (!Array.isArray(data) ? data : JSONStringfier(JSON.stringify(data)));

export function sanitizeHTMLText(text = "", options = {}) {
	// Allow only a super restricted set of tags and attributes
	// return sanitize(text, options);
	return (text);
}

export const wait = (t, func = 1) => new Promise(res => setTimeout(res(func), t));

// on user auth success
export function registerFirebase() {
	if (!navigator.onLine) return;
	try {
		/* global firebase */
		firebase.initializeApp(firebaseConfig);
		const messaging = firebase.messaging();
		firebase
			.messaging()
			.requestPermission()
			.then(() => messaging.getToken())
			.then((token) => localStorage.setItem("fcmtoken", token))
			.catch((err) => console.error("firebase registration failed:", err));
		// If you want your app to work offline and load faster, you can change
		// unregister() to register() below. Note this comes with some pitfalls.
		// Learn more about service workers: https://cra.link/PWA

		// -----------  Register Service Wroker ----------
		serviceWorkerRegistration.register();

		onMessage(messaging, (payload) => {
			// if (document.visibilityState === "hidden") return;
			navigator.serviceWorker.getRegistration().then((registration) => {
				const options = { ...payload.notification };
				registration.showNotification(payload?.notification?.title || 'HCMD', options);
			});
		});

		// If you want to start measuring performance in your app, pass a function
		// to log results (for example: reportWebVitals(console.log))
		// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
		// reportWebVitals();
	} catch (error) {
		console.error(error);
	}
}

export const safeExecute = (codeBlock) => {
	try {
		return codeBlock()
	} catch (error) {
		console.error(error);
	}
}

export const filterChatUsers = (data) => {
	return data?.filter((item) => !item?.isGhostChat && item?.user?.isActive) || [];
}