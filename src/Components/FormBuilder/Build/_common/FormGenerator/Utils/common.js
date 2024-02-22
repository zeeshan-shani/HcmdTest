import { VALIDATION_TYPES, VALUE_TYPES } from "./constants";
import * as Yup from "yup";
import ApiService from "services/APIs/services/APIService";

export const checkIsRequired = (field) => {
	const { validationType, validations, isEditable } = field;

	if (isEditable === true) {
		switch (validationType) {
			case VALUE_TYPES.STRING:
				if (validations?.some((val) => val.type === VALIDATION_TYPES.REQUIRED)) {
					return true;
				}
				return false;

			case VALUE_TYPES.ARRAY:
				if (validations?.some((val) => val.type === VALIDATION_TYPES.MIN || val.type === VALIDATION_TYPES.REQUIRED)) {
					return true;
				}
				return false;

			case VALUE_TYPES.DATE:
				if (validations?.some((val) => val.type === VALIDATION_TYPES.MIN)) {
					return true;
				}
				return false;

			case VALUE_TYPES.MIXED:
				if (validations?.some((val) => val.type === VALIDATION_TYPES.REQUIRED)) {
					return true;
				}
				return false;

			default:
				if (validations?.some((val) => val.type === "required")) {
					return true;
				}
				return false;
		}
	}
	return false;
};

export const createFormSchema = (validateFields) => {
	let schema = {};
	validateFields.forEach((field) => {
		if (Yup[field.validationType] && field.isEditable === true) {
			let validator = Yup[field.validationType]();
			if (field.validationType === VALUE_TYPES.STRING) {
				validator = validator.trim();
			}
			if (field.validationType === VALUE_TYPES.ARRAY) {
				const temp = field.validations?.find((v) => v.type === VALIDATION_TYPES.REQUIRED);
				if (!!temp) {
					validator = validator.min(1, temp.params[0] ? temp.params[0] : "This field is required");
				}
			}
			if (field.inputType === VALIDATION_TYPES.EMAIL) {
				validator = validator.email();
			}
			field.validations?.forEach((validation) => {
				const { params, type } = validation;
				if (!validator[type]) {
					return;
				}
				validator = validator[type](...params);
			});
			schema[field.name] = validator;
		}
	});
	return schema;
};

export const getOptions = async ({ url = "", method = "", payload = {}, valueField = "", labelField = "" }) => {
	let options = [];
	if (url !== "") {
		if (method === "get") {
			try {
				const data = await ApiService.apiCall({ route: url, method });
				options = data.data.map((item) => ({
					value: item[valueField],
					label: item[labelField],
				}));
				return Promise.resolve(options);
			} catch (error) {
				return Promise.reject(error);
			}
		} else if (method === "post") {
			try {
				const data = await ApiService.apiCall({ route: url, payload, method });
				options = data.data.map((item) => ({
					value: valueField ? item[valueField] : item,
					label: item[labelField],
				}));
				return Promise.resolve(options);
			} catch (error) {
				return Promise.reject(error);
			}
		} else {
			return Promise.reject("error");
		}
	}
	return options;
};
