import moment from "moment-timezone";
import { FIELD_TYPES_NAME, FIELD_TYPES_OPTIONS, VALIDATION_TYPES, VALUE_TYPES } from "../../../_common/FormGenerator/Utils/constants";

export const deleteUnwantedFields = (data) => {
	if (data.type !== FIELD_TYPES_NAME.select && data.type !== FIELD_TYPES_NAME.radio && data.type !== FIELD_TYPES_NAME.checkbox) {
		delete data.options;
		delete data.optionKey;
	}
	if (data.optionsChoice === "url") {
		delete data.options;
	} else if (data.optionsChoice === "static") {
		delete data.optionKey;
	}
	if (data?.addClasses?.length === 0) {
		delete data.classes;
	}
	delete data.addClasses;
	delete data.isDateRange;
	delete data.selectPluginConfigs;
	delete data.rows;
	delete data.fileConfigs;
	delete data.maxFiles;
	delete data.maxFileSize;
	delete data.optionsChoice;
	delete data.validationsObj;

	return data;
};

export const getPluinConfings = (data, dateRange) => {
	switch (data.type) {
		case FIELD_TYPES_NAME.select:
			return data.pluginConfiguration
				? data.pluginConfiguration
				: data.selectPluginConfigs.reduce((prev, next) => {
					return { ...prev, [next]: true };
				}, {});

		case FIELD_TYPES_NAME.file:
			if (data.pluginConfiguration) {
				return data.pluginConfiguration;
			} else {
				let obj = data.fileConfigs.reduce((prev, next) => {
					return { ...prev, [next]: true };
				}, {});
				obj.maxFiles = data.maxFiles;
				obj.maxFileSize = data.maxFileSize;
				obj.acceptedFileTypes = [];
				return obj;
			}

		case FIELD_TYPES_NAME.textarea:
			return data.pluginConfiguration ? data.pluginConfiguration : { rows: data.rows };

		case FIELD_TYPES_NAME.date:
			return data.pluginConfiguration ? data.pluginConfiguration : { isDateRange: dateRange.length !== 0 ? true : false };

		default:
			return;
	}
};

export const setDefaultValues = (data) => {
	if (data.value !== "") {
		if (data.type === FIELD_TYPES_NAME.date) {
			data.value = moment(data.value).toDate();
		}
		if (data.type === FIELD_TYPES_NAME.checkbox && typeof data.value === VALUE_TYPES.STRING) {
			data.value = data.value.split(",").map((e) => e.trim());
		}
		if (data.type === FIELD_TYPES_NAME.select && typeof data.value === VALUE_TYPES.STRING) {
			if (data.pluginConfiguration.isMulti) {
				data.value = data.value.split(",").map((e) => e.trim());
			} else {
				data.value = [data.value];
			}
		}
	}
	return data;
};

export const getValidationsArray = (obj, regex) => {
	if (obj)
		return Object.entries(obj)
			.filter(([_, value]) => value.check.length !== 0)
			.map(([key, value]) => {
				return value.value
					? key !== VALIDATION_TYPES.MATCHES
						? {
							type: key,
							params: [value.value, value.message],
						}
						: {
							type: key,
							params: [new RegExp(regex.str, regex.flag), value.message],
						}
					: {
						type: key,
						params: [value.message],
					};
			});
};

export const checkIsValidJSON = (text) => {
	if (isJsonString(text)) {
		const fields = JSON.parse(text);
		const names = new Set(fields.map((field) => field.name));
		if (names.size !== fields.length) {
			throw new Error("Name should be unique!");
		}

		let valid = ["name", "label", "valueKey", "value", "type", "validationType", "validations", "isEditable"];
		fields.forEach((field) => {
			if (field.name === "") {
				throw new Error("Name is required!");
			}

			let temp = valid.every((value) => Object.keys(field).includes(value));
			if (temp === false) {
				throw new Error("Missing Field!");
			}

			if (!Object.keys(FIELD_TYPES_NAME).includes(field.type)) {
				throw new Error("Enter a valid type!");
			}

			if (!Object.values(VALUE_TYPES).includes(field.validationType)) {
				throw new Error("Enter a valid validationType!");
			}

			// validations array
			if (!Array.isArray(field.validations)) {
				throw new Error("Validations must be an array!");
			} else {
				if (!field.validations.every((entry) => Object.keys(entry).includes("type") && Object.keys(entry).includes("params"))) {
					throw new Error("All validations must have type and params");
				} else if (!field.validations.every((entry) => Object.values(VALIDATION_TYPES).includes(entry.type))) {
					throw new Error("All validations must have a valid type!");
				} else if (!field.validations.every((entry) => Array.isArray(entry.params))) {
					throw new Error("All validations must have params as an array!");
				}
			}

			if (typeof field.isEditable !== "boolean") {
				throw new Error("isEditable must be a boolean value!");
			}

			// options & option key
			if (field.type === FIELD_TYPES_NAME.checkbox || field.type === FIELD_TYPES_NAME.radio || field.type === FIELD_TYPES_NAME.select) {
				const optionKeyFlag = Object.keys(field).includes("optionKey");
				const optionsFlag = Object.keys(field).includes("options");
				if (!optionsFlag && !optionKeyFlag) {
					throw new Error("Options or Option key must be there!");
				} else if (optionsFlag && optionKeyFlag) {
					throw new Error("Enter either options or optionKey.");
				}
				if (optionKeyFlag) {
					if (
						!Object.keys(field.optionKey).includes("url") ||
						!Object.keys(field.optionKey).includes("method") ||
						!Object.keys(field.optionKey).includes("valueField") ||
						!Object.keys(field.optionKey).includes("labelField")
					) {
						throw new Error("Option key must include url, method, labelField and valueField!");
					}
				}
				if (optionsFlag) {
					if (!Array.isArray(field.options)) {
						throw new Error("Options must be an array!");
					} else {
						if (!field.options.every((entry) => Object.keys(entry).includes("label") && Object.keys(entry).includes("value"))) {
							throw new Error("All options must have label and value");
						}
					}
				}
			}
		});
	} else {
		throw new Error("Invalid JSON Text!");
	}
};

function isJsonString(str) {
	if (str === "[]") {
		return true;
	}
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

export const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

export const getDetailedFields = (fields) => {
	const newFields = JSON.parse(JSON.stringify(fields));
	newFields.map((entry) => {
		// date range
		if (entry.pluginConfiguration?.isDateRange === true) {
			entry.isDateRange = ["true"];
		} else {
			entry.isDateRange = [];
		}

		// text area rows
		if (entry.type === FIELD_TYPES_NAME.textarea) {
			entry.rows = entry.pluginConfiguration.rows;
		} else {
			entry.rows = 0;
		}

		// select plugin config
		entry.selectPluginConfigs = [];
		if (entry.type === FIELD_TYPES_NAME.select) {
			for (const [key, value] of Object.entries(entry.pluginConfiguration)) {
				if (value === true) entry.selectPluginConfigs.push(key);
			}
		}

		// file input plugin config
		if (entry.type === FIELD_TYPES_NAME.file) {
			entry.fileConfigs = [];
			entry.maxFileSize = entry.pluginConfiguration.maxFileSize;
			entry.maxFiles = entry.pluginConfiguration.maxFiles;
			for (const [key, value] of Object.entries(entry.pluginConfiguration)) {
				if (key === "isMulti" && value === true) {
					entry.fileConfigs.push("isMulti");
				} else if (key === "imagePreview" && value === true) {
					entry.fileConfigs.push("imagePreview");
				}
			}
		} else {
			entry.fileConfigs = [];
			entry.maxFileSize = 0;
			entry.maxFiles = 1;
		}

		// options, optionKey & optionsChoice
		if (entry.type === FIELD_TYPES_NAME.select || entry.type === FIELD_TYPES_NAME.radio || entry.type === FIELD_TYPES_NAME.checkbox) {
			entry.optionsChoice = entry.optionKey ? "url" : "static";
			if (entry.optionKey) {
				entry.optionsChoice = "url";
				entry.options = [];
			} else {
				entry.optionsChoice = "static";
				entry.optionKey = {
					url: "",
					method: "",
					labelField: "",
					valueField: "",
				};
			}
		}

		// type
		entry.type = FIELD_TYPES_OPTIONS.filter((opt) => opt.value === entry.type);

		// isEditable
		entry.isEditable === true ? (entry.isEditable = []) : (entry.isEditable = ["false"]);

		// validationsObj
		entry.validationsObj = {};
		Object.values(VALIDATION_TYPES).forEach((val) => {
			if (val !== VALIDATION_TYPES.EMAIL) {
				if (val !== VALIDATION_TYPES.MATCHES) {
					entry.validationsObj[val] = { check: [], value: 0 };
				} else {
					entry.validationsObj[val] = { check: [], value: "" };
				}
			}
		});
		if (entry.validations.length !== 0) {
			entry.validations.forEach((e) => {
				if (e.type === VALIDATION_TYPES.REQUIRED) {
					return (entry.validationsObj[e.type] = {
						check: ["true"],
						message: e.params[0] === null ? undefined : e.params[0],
					});
				} else {
					return (entry.validationsObj[e.type] = {
						check: ["true"],
						value: e.params[0],
						message: e.params[1] === null ? undefined : e.params[1],
					});
				}
			});
		}

		// classes
		if (entry.classes) {
			entry.addClasses = ["true"];
			const c = {
				error: undefined,
				field: undefined,
				label: undefined,
				wrapper: undefined,
			};
			for (const [key, value] of Object.entries(entry.classes)) {
				c[key] = value;
			}
			entry.classes = { ...c };
		} else {
			entry.addClasses = [];
		}

		return entry;
	});
	return newFields;
};
