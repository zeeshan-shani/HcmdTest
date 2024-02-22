import * as Yup from "yup";

export const defaults = {
	name: "",
	label: "",
	valueKey: "",
	value: "",
	type: [],
	validationType: "",
	validations: [],
	isEditable: [],
	optionKey: {
		url: "",
		method: "",
		labelField: "",
		valueField: "",
	},
	options: [],
	isDateRange: [],
	selectPluginConfigs: [],
	rows: 1,
	fileConfigs: [],
	maxFiles: 1,
	maxFileSize: 0,
	optionsChoice: "",
	validationsObj: {
		required: {
			check: [],
		},
		min: {
			check: [],
			value: 0,
		},
		max: {
			check: [],
			value: 0,
		},
		length: {
			check: [],
			value: 0,
		},
		matches: {
			check: [],
			value: "",
		},
	},
	addClasses: [],
};

export const schema = Yup.object().shape({
	name: Yup.string(),
	// .trim().required("Field Name is required!"),
	label: Yup.string().trim().required("Label is required!"),
	valueKey: Yup.string(),
	// .trim().required("Value Key is required!"),
	type: Yup.array().min(1, "Field Type is required!"),
	validationType: Yup.string().trim(),
	validations: Yup.array(),
	isDateRange: Yup.array(),
	rows: Yup.number().when("type", {
		is: (t) => t.length !== 0 && t[0].value === "textarea",
		then: (s) => s.moreThan(0, "Rows must be more than 0."),
	}),
	selectPluginConfigs: Yup.array(),
	optionsChoice: Yup.string(),
	// .trim()
	// .when("type", {
	// 	is: (t) => t.length !== 0 && (t[0].value === "select" || t[0].value === "radio" || t[0].value === "checkbox"),
	// 	then: (s) => s.required("This is a required field!"),
	// }),
	optionKey: Yup.object({
		url: Yup.string().trim(),
		method: Yup.string().trim(),
		labelField: Yup.string().trim(),
		valueField: Yup.string().trim(),
	}),
	// .when("optionsChoice", {
	// 	is: (t) => t === "url",
	// 	then: (s) =>
	// 		Yup.object({
	// 			url: Yup.string().trim().required("URL is required!"),
	// 			method: Yup.string().trim().required("Method is required!"),
	// 			labelField: Yup.string().trim().required("Label field is required!"),
	// 			valueField: Yup.string().trim().required("Value field is required!"),
	// 		}),
	// 	otherwise: Yup.object({
	// 		url: Yup.string().trim(),
	// 		method: Yup.string().trim(),
	// 		labelField: Yup.string().trim(),
	// 		valueField: Yup.string().trim(),
	// 	}),
	// }),
	options: Yup.array(
		Yup.object({
			label: Yup.string().trim().required("Label is required!"),
			value: Yup.string().trim(),
		})
	),
	// 		label: Yup.string().trim(),
	// 		value: Yup.string().trim(),
	// 	})
	// ).when("optionsChoice", {
	// 	is: (t) => t === "static",
	// 	then: Yup.array(
	// 		Yup.object({
	// 			label: Yup.string().trim().required("Label is required!"),
	// 			value: Yup.string().trim().required("Value is required!"),
	// 		})
	// 	),
	// 	otherwise: Yup.array(
	// 		Yup.object({
	// 			label: Yup.string().trim(),
	// 			value: Yup.string().trim(),
	// 		})
	// 	),
	// }),
	fileConfigs: Yup.array(),
	maxFiles: Yup.number(),
	maxFileSize: Yup.number(),
	validationsObj: Yup.object({
		required: Yup.object({
			check: Yup.array(),
			message: Yup.string().trim(),
		}),
		min: Yup.object({
			check: Yup.array(),
			value: Yup.number().when("check", {
				is: (c) => c.length !== 0,
				then: (s) => s.moreThan(0, "Value must be non zero."),
			}),
			message: Yup.string().trim(),
		}),
		max: Yup.object({
			check: Yup.array(),
			value: Yup.number().when("check", {
				is: (c) => c.length !== 0,
				then: (s) => s.moreThan(0, "Value must be non zero."),
			}),
			message: Yup.string().trim(),
		}),
		length: Yup.object({
			check: Yup.array(),
			value: Yup.number().when("check", {
				is: (c) => c.length !== 0,
				then: (s) => s.moreThan(0, "Value must be non zero."),
			}),
			message: Yup.string().trim(),
		}),
		matches: Yup.object({
			check: Yup.array(),
			value: Yup.string()
				.trim()
				.when("check", {
					is: (c) => c.length !== 0,
					then: (s) => s.required("Pattern is required!"),
				}),
			message: Yup.string().trim(),
		}),
	}),
});
