import React from "react";
import Checkbox from "../../../../_common/FormGenerator/Components/Checkbox";
import Input from "../../../../_common/FormGenerator/Components/Input";

const ValidationsFileds = ({
	checkObj: obj = {
		checkRequired: [],
		checkMin: [],
		checkMax: [],
		checkLength: [],
		checkMatches: [],
	},
	formContext,
	setRegexState,
}) => {
	// const { setError, clearErrors, setValue } = formContext;

	// const checkRegex = (string) => {
	// 	let str = string;
	// 	let flag = "";
	// 	if (string === "" || string === "/") {
	// 		str = "//";
	// 		setValue("validationsObj.matches.value", str);
	// 	}
	// 	if (!str.startsWith("/")) {
	// 		str = "/" + str;
	// 		setValue("validationsObj.matches.value", str);
	// 	}
	// 	if (str.indexOf("/") === str.lastIndexOf("/")) {
	// 		str = str + "/";
	// 		setValue("validationsObj.matches.value", str);
	// 	}
	// 	flag = str.substring(str.lastIndexOf("/") + 1);
	// 	str = str.substring(1, str.lastIndexOf("/"));
	// 	try {
	// 		new RegExp(str, flag);
	// 		setRegexState(() => ({ str, flag }));
	// 		clearErrors("validationsObj.matches.value");
	// 	} catch (err) {
	// 		setTimeout(() => {
	// 			setError("validationsObj.matches.value", {
	// 				type: "custom",
	// 				message: "Invalid Regex pattern!",
	// 			});
	// 		}, 3);
	// 	}
	// };

	return (
		<>
			<h6>Validations</h6>
			{/* required */}
			<div className="d-flex align-items-center">
				<Checkbox
					label=""
					name="validationsObj.required.check"
					value={[]}
					valueKey="validationsObj.required.check"
					type="checkbox"
					optionKey={{
						url: "",
						method: "",
					}}
					options={[{ value: "true", label: "Required" }]}
					isEditable={true}
					validationType="array"
					validations={[]}
				/>
				{obj.checkRequired.length !== 0 && (
					<div className="flex-grow-1">
						<Input
							label="Error message"
							name="validationsObj.required.message"
							value=""
							valueKey="validationsObj.required.message"
							type="text"
							isEditable={true}
							validationType="string"
							validations={[]}
						/>
					</div>
				)}
			</div>
			{/* minimum */}
			<div className="d-flex align-items-center justify-content-between">
				<Checkbox
					label=""
					name="validationsObj.min.check"
					value={[]}
					valueKey="validationsObj.min.check"
					type="checkbox"
					optionKey={{
						url: "",
						method: "",
					}}
					options={[{ value: "true", label: "Minimum" }]}
					isEditable={true}
					validationType="array"
					validations={[]}
				/>
				{obj.checkMin.length !== 0 && (
					<>
						<div className="w-25 mx-1">
							<Input
								label="Value"
								name="validationsObj.min.value"
								// value={0}
								valueKey="validationsObj.min.value"
								type="number"
								isEditable={true}
								validationType="number"
								validations={[{ type: "required", params: ["Value is required!"] }]}
								isRequired={true}
							/>
						</div>
						<div className="flex-grow-1">
							<Input
								label="Error message"
								name="validationsObj.min.message"
								value=""
								valueKey="validationsObj.min.message"
								type="text"
								isEditable={true}
								validationType="string"
								validations={[]}
							/>
						</div>
					</>
				)}
			</div>
			{/* maximum */}
			<div className="d-flex align-items-center justify-content-between">
				<Checkbox
					label=""
					name="validationsObj.max.check"
					value={[]}
					valueKey="validationsObj.max.check"
					type="checkbox"
					optionKey={{
						url: "",
						method: "",
					}}
					options={[{ value: "true", label: "Maximum" }]}
					isEditable={true}
					validationType="array"
					validations={[]}
				/>
				{obj.checkMax.length !== 0 && (
					<>
						<div className="w-25 mx-1">
							<Input
								label="Value"
								name="validationsObj.max.value"
								value=""
								valueKey="validationsObj.max.value"
								type="number"
								isEditable={true}
								validationType="number"
								validations={[]}
								isRequired={true}
							/>
						</div>
						<div className="flex-grow-1">
							<Input
								label="Error message"
								name="validationsObj.max.message"
								value=""
								valueKey="validationsObj.max.message"
								type="text"
								isEditable={true}
								validationType="string"
								validations={[]}
							/>
						</div>
					</>
				)}
			</div>
			{/* length */}
			<div className="d-flex align-items-center justify-content-between">
				<Checkbox
					label=""
					name="validationsObj.length.check"
					value={[]}
					valueKey="validationsObj.length.check"
					type="checkbox"
					optionKey={{
						url: "",
						method: "",
					}}
					options={[{ value: "true", label: "Length" }]}
					isEditable={true}
					validationType="array"
					validations={[]}
				/>
				{obj.checkLength.length !== 0 && (
					<>
						<div className="w-25 mx-1">
							<Input
								label="Value"
								name="validationsObj.length.value"
								value=""
								valueKey="validationsObj.length.value"
								type="number"
								isEditable={true}
								validationType="number"
								validations={[]}
								isRequired={true}
							/>
						</div>
						<div className="flex-grow-1">
							<Input
								label="Error message"
								name="validationsObj.length.message"
								value=""
								valueKey="validationsObj.length.message"
								type="text"
								isEditable={true}
								validationType="string"
								validations={[]}
							/>
						</div>
					</>
				)}
			</div>
			{/* Regex */}
			{/* <div className="d-flex align-items-center">
				<Checkbox
					label=""
					name="validationsObj.matches.check"
					value={[]}
					valueKey="validationsObj.matches.check"
					type="checkbox"
					optionKey={{
						url: "",
						method: "",
					}}
					options={[{ value: "true", label: "Regex" }]}
					isEditable={true}
					validationType="array"
					validations={[]}
				/>
				{obj.checkMatches.length !== 0 && (
					<div className="flex-grow-1">
						<Input
							label="Pattern"
							name="validationsObj.matches.value"
							value=""
							valueKey="validationsObj.matches.value"
							type="text"
							isEditable={true}
							validationType="string"
							validations={[{ type: "required", params: ["Pattern is required!"] }]}
							isRequired={true}
							onChange={(e) => checkRegex(e.target.value)}
						/>
						<Input
							label="Error message"
							name="validationsObj.matches.message"
							value=""
							valueKey="validationsObj.matches.message"
							type="text"
							isEditable={true}
							validationType="string"
							validations={[]}
						/>
					</div>
				)}
			</div> */}
		</>
	);
};

export default ValidationsFileds;
