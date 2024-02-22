/*
*
*
* Please be careful while making changes to this file.
*
*
*/
export const CONST = {
	APP_NAME: "HCMD Communication",
	APP_LOGO: "https://chatapp-storage-2022.s3.us-west-2.amazonaws.com/logo.png",
	DEFAULT_USER_IMAGE: "https://chatapp-storage-2022.s3.us-west-2.amazonaws.com/user_pic.jpg",
	GHOST_IMAGE: "https://chatapp-storage-2022.s3.us-west-2.amazonaws.com/incognito1.png",
	CLOUD_IMAGE: "https://dbvegu4yzhf6f.cloudfront.net",
	ENCRYPT_KEY: "HCMDCOMMUNICATION",
	DEFAULT_COUNTRY: 1,
	RUN_MODE: {
		PRODUCTION: "PRODUCTION",
		STAGING: "STAGING",
		DEV_PRODUCTION: "DEV_PRODUCTION",
		DEVELOPMENT: "DEVELOPMENT",
	},
	APP_ROUTES: {
		DASHBOARD: "/dashboard",
		SUPER_ADMIN: "/admin",
		TEMPLATE_TASK: "/template/tasks",
		CHAT: "/chats",
		TASK: "/tasks",
		// ISSUES: "/issues",
		ISSUES: "/knowledge",
		EMAIL_VERIFICATION: "/user/verification",
		PROFILE: "/profile",
		FORM_BUILDER: "/form-builder",
		TourController:"/tour-controller"
	},
	TIMEZONE: "America/Los_Angeles",
	SERVER_TIMEZONE: "Africa/Abidjan",
	// TIMEZONE: "Europe/London",
	MESSAGE_GET_LIMIT: 25, // message list limit
	CHAT_GET_LIMIT: 20, // chat list list limit
	GLOBAL_SEARCH_GET_LIMIT: 10, // global search - message list limit
	MAX_MESSAGE_COUNT: 99, // max notification count should display
	IDLE_TIME: 1000 * 60 * 60 * 1, // milliseconds - warning
	IDLE_TIMEOUT: 1000 * 60 * 60 * 1, // milliseconds - logout user
	QUERY_STALE_TIME: {
		L_1: 1 * 10 * 1000,
		L0: 1 * 30 * 1000,
		L1: 1 * 60 * 1000,
		L2: 5 * 60 * 1000,
		L3: 60 * 60 * 1000,
		L4: 24 * 60 * 60 * 1000,
	},
	// DESIGNATION_KEY is based on Key for user designation
	DESIGNATION_KEY: {
		PROVIDER: "PROVIDER",
		NURSE_PRACTITIONER: "NURSE_PRACTITIONER",
		ROUNDING_SHEET: "ROUNDING_SHEET",
	},
	// PROVIDERS is based on Key for user designation
	PROVIDERS: ["PROVIDER", "NURSE_PRACTITIONER", "ROUNDING_SHEET"],
	API: {
		USER: {
			LIST: `/user/list`,
			UPDATE: "/user/update",
			LOGS_LIST: `/log/list`,
			EMAIL_VERIFICATION: `/user/verification`,
		},
		AUTH: {
			LOGIN: `/auth/login`,
			VERIFY_TOKEN: `/auth/verifyToken`,
		},
		MESSAGE: {
			LIST: `/message/`,
			PRESIGNED_URL: `/message/file`,
			GLOBAL_SEARCH: `/message/searchMessageAndChat`,
			THREAD_LIST: `/message/threadMessageList`,
			FILES_DATA: `/message/chatGallaryMedia`,
			IMPORTANT_LIST: `/importantmessage/get`,
			ADD_IMPORTANT: `/importantmessage/update`,
			REMOVE_IMPORTANT: `/importantmessage/update`,
			CHECK_LAST: `/message/checkUserLastMessage`,
			GET_RECEIPENTS: `/message/recipient`,
		},
		CHAT: {
			NEW_CHAT: `/chat`,
			CHATLIST: `/chat/list`,
			CHAT_USERS: `/chat/user/list`,
			GET_CHATUSERS: `/chat/chatusers`,
			DASHBOARD_LIST: `/chat/dashboard/list`,
			UPDATE_NOTIFICATION_SETTING: `/chat/updateMuteNotification`,
		},
		TASK: {
			CREATE_TASK: `/task`,
			LIST: `/task/list`,
			FILTER_LIST: `/task/filter/list`,
			DETAILS: `/task/manageTask/detail`,
			UPDATE_TASK: `/task/manageTask/update`,
			DETAILS_BY_MESSAGE: `/task/manageTask/message/detail`,
			SEND_ATTACHMENT: `/task/manageTask/attachment/add`,
			DELETE_ATTACHMENT: `/task/manageTask/attachment/delete/`,
			CREATE_SUBTASK: `/task/subtask/create`,
			SUBTASK_COMMENTS: `/task/subtask/comment/list`,
			ADD_SUBTASK_COMMENT: `/task/subtask/comment/add`,
			UPDATE_SUBTASK_STATUS: `/task/subtask`,
			DELETE_SUBTASK: `/task/subtask/delete`,
			UPDATE_MEMBERS: `/task/manageTask/member-update`,
			DELETE_TEMPLATE_ATTACHMENT: `/task/template/attachment/delete/`,
		},
		ISSUES: {
			SEND_ATTACHMENT: `/issue/attachment/add`,
			DELETE_ATTACHMENT: `/issue/attachment/delete/`,
		},
		NOTE: {
			CRAETE: `/note`,
			LIST: `/note/list`,
			DELETE: `/note/delete`,
			UPDATE: `/note/update`,
		},
		PATIENT: {
			LIST: `/patient/list`,
			CRAETE: `/patient/create`,
			DELETE: `/patient/delete`,
			UPDATE: `/patient/update`,
		},
		EMAIL_VERIFICATION: `/user/verification`, //
		USER_UPDATE: `/user/update`, //
		PRESIGNED_URL: `/message/file`, //
		LOGIN: `/auth/login`, //
		VERIFY_TOKEN: `/auth/verifyToken`, //
		GET_TASK_DETAILS: `/task/manageTask/detail`, //
		GET_FILTER_TASK: `/task/filter/list`, //
		GET_GLOBAL_SEARCH: `/message/searchMessageAndChat`, //
		GET_TASK_DETAILS_BY_MESSAGE: `/task/manageTask/message/detail`, //
		USER_LOGS_LIST: `/log/list`,
		SEND_ATTACHMENT_DATA: `/task/manageTask/attachment/add`, //
		DELETE_ATTACHMENT: `/task/manageTask/attachment/delete/`, //
		SEND_ATTACHMENT_ISSUES_DATA: `/issue/attachment/add`, //
		DELETE_ISSUES_ATTACHMENT: `/issue/attachment/delete/`, //
		UPDATE_TASK: `/task/manageTask/update`, //
		CREATE_SUBTASK: `/task/subtask/create`, //
		GET_SUBTASK_COMMENTS: `/task/subtask/comment/list`, //
		ADD_SUBTASK_COMMENT: `/task/subtask/comment/add`, //
		UPDATE_SUBTASK_STATUS: `/task/subtask`, //
		DELETE_SUBTASK: `/task/subtask/delete`, //
		UPDATE_TASK_MEMBERS: `/task/manageTask/member-update`, //
		GET_TASK_LOGS: `/task/list`, //
		LOAD_USER_DASHBOARDLIST: `/chat/dashboard/list`, //
		LOAD_USER_CHATLIST: `/chat/list`, //
		LOAD_CHAT_USERS: `/chat/user/list`, //
		CREATE_TASK: `/task`, //
		GET_TASKS_LIST: `/task/list`, //
		CREATE_NEW_CHAT: `/chat`, //
		UPDATE_NOTIFICATION_SETTING: `/chat/updateMuteNotification`, //
		GET_USERS_LIST: `/user/list`, //
		CRAETE_NEW_NOTE: `/note`, //
		GET_NOTE_LIST: `/note/list`, //
		DELETE_NOTE: `/note/delete`, //
		UPDATE_NOTE: `/note/update`, //
		GET_RES_THREAD: `/message/threadMessageList`, //
		GET_FILES_DATA: `/message/chatGallaryMedia`, //
		ADD_IMPORTANT_MESSAGE: `/importantmessage/update`, //
		REMOVE_IMPORTANT_MESSAGE: `/importantmessage/update`, //
		GET_IMPORTANT_MSG_LIST: `/importantmessage/get`, //
		DELETE_TEMPLATE_ATTACHMENT: `/task/template/attachment/delete/`, //
		GET_MESSAGE_LIST: `/message/`, //
		CHECK_LAST_MESSAGE: `/message/checkUserLastMessage`, //
		GET_MESSAGE_RECEIPENTS: `/message/recipient`, //
		GET_PATIENT_LIST: `/patient/list`, //
		CRAETE_PATIENT: `/patient/create`, //
		DELETE_PATIENT: `/patient/delete`, //
		UPDATE_PATIENT: `/patient/update`, //
		GET_CHATUSERS: `/chat/chatusers`, //
		ADD_WATCHLIST_MESSAGE: `/watchList/update`, //
	},
	API_TIMEOUT: {
		L1: { timeout: 1000 * 10, timeoutErrorMessage: 'Request Timeout' },
		L2: { timeout: 1000 * 30, timeoutErrorMessage: 'Request Timeout' },
		L3: { timeout: 1000 * 60 * 1, timeoutErrorMessage: 'Request Timeout' },
	},
	CHAT_TYPE: {
		ALL_CHATS: "Chats",
		PRIVATE: "private",
		GROUP: "group",
	},
	USER_TYPE: {
		SA: "superAdmin",
		ADMIN: "admin",
		USER: "user",
	},
	NOTE_TYPE: {
		PUBLIC: "public",
		PRIVATE: "private",
		PERSONAL: "personal",
		// WORK: "work",
		// FAVOURITE: "favourite",
		// IMPORTANT: "important",
	},
	PROFILE: {
		ONLINE: "online",
		OFFLINE: "offline",
		AVAILABLE: "available",
		BUSY: "busy",
		BREAK: "break",
		ONCALL: "oncall",
		VACATION: "vacation",
	},
	MSG_TYPE: {
		ALL_MSG: "All Messages",
		ROUTINE: "routine",
		EMERGENCY: "emergency",
		URGENT: "urgent",
		CHAT_LOG: {
			NAME: "chat_log",
			CHAT_CREATED: "chat_created",
			USER_ADDED: "user_added",
			USER_REMOVED: "user_removed",
			USER_LEFT: "user_left",
			ADDED_BY_LINK: "user_added_via_link",
			TYPES: ["chat_log", "chat_created", "user_added", "user_removed", "user_left"],
		},
	},
	TASK_TYPE: ["single", "team", "dept"],
	TASK_BOARD_VIEW: {
		BOARD: "board",
		LIST: "list",
		CALENDAR: "calendar",
	},
	MEDIA_TYPE: {
		IMAGE: "image",
		VIDEO: "video",
		AUDIO: "audio",
		PDF: "pdf",
		TEXT: "text",
		APPLICATION: "application",
	},
	MAX_THREAD_LEVEL: 3,
	THREAD_TYPE: {
		PARENT: "parent",
		CHILD: "child",
	},
	TASK_STATUS: [
		{ id: 1, value: "pending", color: "#FF5757", colorClass: "error" },
		{ id: 2, value: "started", color: "#008FBC", colorClass: "info" },
		{ id: 3, value: "paused", color: "#FFCE74", colorClass: "warning" },
		{ id: 4, value: "finished", color: "#00D4A4", colorClass: "success" },
		{ id: 5, value: "review", color: "#FFCE74", colorClass: "warning" },
	],
	TASK_MEMBER_TYPE: {
		REVIEWER: 'reviewer',
		MEMBER: 'member',
	},
	PROVIDER_TYPE: {
		ATTENDEE: "ATTENDEE",
		HCMD_PROVIDER: "HCMD_PROVIDER",
		CONSULTANCY_PROVIDER: "CONSULTANCY_PROVIDER"
	},
	GENDER_TYPE: [
		{ value: "male", label: "Biological Male" },
		{ value: "female", label: "Biological Female" },
		{ value: "other", label: "Other" },
	],
	MARITAL_TYPE: [
		{ "label": "Single", "value": "single" },
		{ "label": "Married", "value": "married" },
		{ "label": "Widowed", "value": "widowed" },
		{ "label": "Divorced", "value": "divorced" },
		{ "label": "Separated", "value": "separated" },
		{ "label": "Other", "value": "other" }
	],
	// FILTER_TASK_TYPE: {
	// 	ALL: "all",
	// 	CREATOR: "creator",
	// 	ASSIGNEE: "assign",
	// 	CHAT_TASK: "tasks",
	// },
	FILTER_TASK_TYPE: {
		ALL: { value: "all", label1: "All", label2: "All Tasks" },
		CREATOR: { value: "creator", label1: "Created", label2: "Created Tasks" },
		ASSIGNEE: { value: "assign", label1: "Assigned", label2: "Assigned Tasks" },
		CHAT_TASK: { value: "tasks", label1: "Chat Tasks", label2: "All Chat Tasks" },
	},
	ISSUE_STATUS: [
		{ id: 1, value: "open" },
		{ id: 2, value: "resolved" },
		{ id: 3, value: "reopen" },
	],
	TEMPLATE_MSG: {
		START_CHAT: "Start Conversation",
		DELETE: "This message was deleted",
		UPDATE: "Changed Group Members",
	},
	USER_STATUS: [
		{ id: 1, value: "active", },
		{ id: 2, value: "inactive", },
		{ id: 3, value: "disabled", },
	],
	ISSUE_ATTACHMENT_TYPE: [
		{ id: 1, value: "creator" },
		{ id: 2, value: "assignee" },
	],
	BILLING_CODE_TYPES: {
		NEW_BILLING_CODE: { label: "New Billing code", value: "new_billing_code" },
		FOLLOWUP_CODE: { label: "Followup code", value: "followup_code" },
		SECONDARY_BILLING_CODE: { label: "Secondary", value: "secondary_billing_code" },
	},
	APPOINTMENT_TYPE: {
		PATIENT: { value: "patient", color: '#8fff93' },
		FAMILY: { value: "family", color: '#f4b976' }
	},
	REGEX: {
		/* eslint-disable */
		MESSAGE_REPLACE: /<<message#\d+>>\(([^)]+)\)/g,
		MENTION_USER: /(?:@)(?:(?!\s))((?:(?!\s|\n).)+)(?!:\s)/g,
		TAG_MARKUP1: /<@([^>]+?)>\(([^\)]+?)\)/g,
		HASH_TAG_MARKUP: /(?:#)(?:(?!\s))((?:(?!\s|\n).)+)(?!:\s)/g,
		// TAG_MARKUP2: /<\#([^>]+?)>\(@([^\)]+?)\)/g,
		// BACKTICK_WORD: /(<@)((?:(?!\s|\n).)+)(>)/g,
		START_WORD: /(?:\*)(?:(?!\s))((?:(?!\*|\n).)+)(?:\*)/g,
		UNDERSCORE_WORD: /(?:_)(?:(?!\s))((?:(?!\n|_).)+)(?:_)/g,
		DOUBLE_DASH_WORD: /(?:--)(?:(?!\s))((?:(?!\n|--).)+)(?:--)/g,
		SUM_WORD: /(?:~)(?:(?!\s))((?:(?!\n|~).)+)(?:~)/g,
		BACKTICK_WORD: /(?:```)(?:(?!\s))((?:(?!\n|```).)+)(?:```)/g,
		LINK: {
			PATTERN_1: /(\b(https?|ftp):\/\/[-A-Z0-9+&>@{}#\/%?=~_|!:,.;]*[-A-Z0-9+&>@{}#\/%=~_|])/gim,
			// PATTERN_1: /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gim,
			// PATTERN_1: /(?<!"|')(http|https|ftp):\/\/[\S]+/gim,
			// PATTERN_1: /(?<!"|')(http?|https?|ftp)(:\/\/[\S]+(\b|$))/gim,
			PATTERN_2: /(^|[^\/])(www\.[\S]+(\b|$))/gim,
			PATTERN_3: /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2, 6})+)/gim,
		},
		/* eslint-enable */
	},
	disallowedTags: ['script', 'style', 'html', 'font', 'button', 'center', 'dfn', 'form', 'input', 'link',],
	sanitize_message: {
		allowedTags: ['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
			'big', 'blockquote', 'br', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data',
			'datalist', 'dd', 'del', 'details', 'dialog', 'dir', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
			'figcaption', 'figure', 'footer', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head',
			'header', 'hr', 'i', 'iframe', 'img', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map',
			'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noframes', 'noscript', 'object', 'ol', 'optgroup',
			'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp',
			'section', 'select', 'slot', 'small', 'source', 'span', 'strike', 'strong', 'sub', 'summary', 'sup',
			'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
			'tt', 'u', 'ul', 'var', 'video', 'wbr'],
		exclusiveFilter: (frame) => {
			return !frame.text && CONST.disallowedTags.includes(frame.tag);
		}
	},
	ATTRIBUTES: {
		CHATS: ['id', 'name', 'users', 'image', 'description', 'createdBy', 'type', 'routineHour', 'routineMinute', 'emergencyHour', 'emergencyMinute', 'urgentHour', 'urgentMinute', 'allowOnlyAdminMessage', 'createdAt', 'updatedAt']
	}
};

export const SOCKET = {
	CONNECT: "connect",
	DISCONNECT: "disconnect",
	JOIN_DEVICE: "join-device",
	JOIN_CHAT: "join-chat",
	MESSAGE: "message",
	NEW_MESSAGE: "new-message",
	UPDATE_NOTIFICATION: "update-notification",
	NEW_CHAT_REQUEST: "new-chat-request",
	USER_ONLINE: "user-online",
	USER_OFFLINE: "user-offline",
	USER_STATUS_CHANGED: "user-status-changed",
	CHANGE_PROFILE_STATUS: "change-profile-status",
	REQUEST: {
		DISCONNECT_CHAT: "disconnect-user-chat",
		CHANGE_USER_ROLE: "change-user-role",
		DEACTIVATE_ACCOUNT: "deactive-account",
		CHAT_LIST: "chat-list",
		UPDATE_PROFILE_PIC: "profile-picture:req-update",
		UPDATE_GROUP_DATA: "group-details:req-update",
		DESIGNATION_LIST: "designation:req-list",
		UPDATE_CHAT_BACKGROUND: "req-update-chat-background",
		GET_CHAT_GROUPS: "req-get-chat-groups",
		// dashboard starts
		WORK_HOURS: "dashboard:req-tasks-work-hours",
		USER_LOGS: "list-user-logs",
		CREATE_USER_LOG: "create-user-log",
		// dashboard ends
		// admin starts
		DELETE_USER: "delete-user",
		GET_USER_TASKS: "req-user-tasks",
		GET_GROUP_TASKS: "req-get-chat-tasks",
		// admin ends

		// chat sockets starts from here
		ALLOW_SEND_MESSAGE: "req-allow-send-message",
		// SETTIME_ADMIN_NOTIFICAION: "req-set-time-admin-notification",
		EDIT_CHAT_MESSAGE: "req-edited-chat-message",
		DELETE_CHAT_MESSAGE: "req-delete-chat-message",
		MARK_READ_CHAT: "mark-read-chat",
		VIEW_DELETED_MESSAGE: "req-view-deleted-message",
		MESSAGE_COUNT_RANGE: "req-message-count-range",
		ADD_MEMBER: "req-add-member",
		FORWARD_MESSAGE: "req-forward-follow-message",
		REMOVE_MEMBER: "req-remove-member",
		MAKE_GROUP_ADMIN: "req-make-group-admin",
		REMOVE_GROUP_ADMIN: "req-remove-group-admin",
		ADD_TO_TASK: "req-create-task",
		// chat sockets ends here

		// Tasks sockets starts from here
		// TASK_LIST: "manage-task-module:req-task-list",
		CREATE_TASK_LOG: "create-task-log",
		UPDATE_ASSIGN_MEMBER: "manage-task-module:req-new-assign-task",
		UPDATE_TASK: "manage-task-module:req-update-task",
		UPDATE_TASK_DATA: "manage-task-module:req-update-task-data",
		DELETE_TASK: "manage-task-module:req-delete",
		ADD_TASK_COMMENT: "manage-task-module:req-add-comment",
		DELETE_TASK_COMMENT: "manage-task-module:req-delete-comment",
		UPDATE_REVIEW_STATUS: "task-module:req-update-review-status",
		UPDATE_TASK_COMMENT: "manage-task-module:req-update-comment",
		// Tasks sockets ends from here

		// Issue sockets starts from here
		CREATE_ISSUE: "issues:req-create",
		UPDATE_ISSUE: "issues:req-update-issue",
		ISSUE_UPDATE_SOLUTION: "issues:req-update-solution",
		ISSUE_ADD_SOLUTION: "issues:req-add-solution",
		ISSUE_DELETE: "issues:req-delete",
		READ_ASSIGNED_ISSUE: "issues:req-read-request",
		ISSUE_ADD_COMMENT: "issues:req-add-comment",
		ISSUE_UPDATE_COMMENT: "issues:req-update-comment",
		ISSUE_DELETE_COMMENT: "issues:req-delete-comment",
		// Issue sockets ends here
	},
	RESPONSE: {
		CHANGE_USER_ROLE: "res-change-user-role",
		UPDATE_DASHBOARD_BOARDLIST: "dashboard:res-update-boardlist",
		DEACTIVATE_ACCOUNT: "res-deactive-account",
		// USER_ROLE_LIST: "res-fetch-role-list",
		CHAT_LIST: "res-chat-list",
		UPDATE_PROFILE_PIC: "profile-picture:res-update",
		UPDATE_GROUP_DATA: "group-details:res-update",
		DESIGNATION_LIST: "designation:res-list",
		UPDATE_CHAT_BACKGROUND: "res-update-chat-background",
		// dashboard starts
		WORK_HOURS: "dashboard:res-tasks-work-hours",
		USER_LOGS: "res-create-user-log",
		CREATE_USER_LOG: "create-user-log",
		// dashboard ends
		// admin starts
		DELETE_USER: "res-delete-user",
		GET_USER_TASKS: "res-user-tasks",
		GET_GROUP_TASKS: "res-get-chat-tasks",
		// chat sockets starts from here
		ALLOW_SEND_MESSAGE: "res-allow-send-message",
		NEW_CHAT_RECIEVED: "new-chat-data",
		MARK_READ_CHAT: "res-mark-read-chat",
		UPDATE_MESSAGE: "update-realtime-message",
		ADD_NOTIFICATION: "add-notification",
		UPDATE_GROUP_MEMBER: "group-update-member",
		// SETTIME_ADMIN_NOTIFICAION: "res-set-time-admin-notification",
		EDIT_CHAT_MESSAGE: "res-edited-chat-message",
		DELETE_CHAT_MESSAGE: "res-delete-chat-message",
		MESSAGE_COUNT_RANGE: "res-message-count-range",
		VIEW_DELETED_MESSAGE: "res-view-deleted-message",
		ADD_MEMBER: "res-add-member",
		REMOVE_MEMBER: "res-remove-member",
		MAKE_GROUP_ADMIN: "res-make-group-admin",
		REMOVE_GROUP_ADMIN: "res-remove-group-admin",
		ADD_TO_TASK: "res-create-task",
		FORWARD_MESSAGE: "res-forward-message",
		UPDATE_CHATLIST: "res-update-chat-list",
		// UNREAD_USER_TO_ADMIN: "unread-users-notified-to-admins",
		SINGLE_CHATLIST: "res-single-chat-list",
		// chat sockets ends here

		// Tasks sockets starts from here
		// CREATE_TASK: "manage-task-module:res-create",
		// TASK_LIST: "manage-task-module:res-task-list",
		CREATE_TASK_LOG: "res-create-task-log",
		UPDATE_ASSIGN_MEMBER: "manage-task-module:res-new-assign-task",
		UPDATE_TASK: "manage-task-module:res-update-task",
		UPDATE_TASK_DATA: "manage-task-module:res-update-task-data",
		DELETE_TASK: "manage-task-module:res-delete",
		ADD_TASK_COMMENT: "manage-task-module:res-add-comment",
		MENTION_TASK_COMMENT: "manage-task-module:res-mention-user-comment",
		DELETE_TASK_COMMENT: "manage-task-module:res-delete-comment",
		UPDATE_TASK_COMMENT: "manage-task-module:res-update-comment",
		GET_TASK_NOTIFICATION: "manage-task-module:res-notification-comment",
		UPDATE_REVIEW_STATUS: "task-module:res-update-review-status",
		// Tasks sockets ends from here

		// Issue sockets starts from here
		CREATE_ISSUE: "issues:res-create",
		ISSUE_UPDATE_SOLUTION: "issues:res-update-solution",
		UPDATE_ISSUE: "issues:res-update-issue",
		ISSUE_ADD_SOLUTION: "issues:res-add-solution",
		ISSUE_DELETE: "issues:res-delete",
		ISSUE_ADD_COMMENT: "issues:res-add-comment",
		ISSUE_UPDATE_COMMENT: "issues:res-update-comment",
		UPDATE_NEW_ISSUE: "issues:update-new-issue",
		ISSUE_DELETE_COMMENT: "issues:res-delete-comment",
		// Issue sockets ends here
	},
};
