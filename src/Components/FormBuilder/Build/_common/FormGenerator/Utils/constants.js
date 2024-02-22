export const VALUE_TYPES = {
	STRING: "string",
	NUMBER: "number",
	ARRAY: "array",
	MIXED: "mixed",
	BOOLEAN: "boolean",
	DATE: "date",
	OBJECT: "object",
};

export const VALIDATION_TYPES = {
	REQUIRED: "required",
	MIN: "min",
	MAX: "max",
	LENGTH: "length",
	EMAIL: "email",
	MATCHES: "matches",
};

export const FIELD_TYPES_OPTIONS = [
	{ value: "text", label: "Text" },
	{ value: "email", label: "Email" },
	{ value: "number", label: "Number" },
	{ value: "password", label: "Password" },
	{ value: "phone", label: "Phone Input" },
	{ value: "textarea", label: "Text Area" },
	{ value: "radio", label: "Radio" },
	{ value: "checkbox", label: "Checkbox" },
	{ value: "select", label: "Select" },
	// { value: "file", label: "File Upload" },
	{ value: "date", label: "Date Input" },
];

export const FIELD_TYPES_NAME = {
	text: "text",
	email: "email",
	number: "number",
	password: "password",
	phone: "phone",
	textarea: "textarea",
	radio: "radio",
	checkbox: "checkbox",
	select: "select",
	file: "file",
	date: "date",
};

export const FRAMEWORK_TYPES = {
	mui: "mui",
	react_bs: "bs",
};
