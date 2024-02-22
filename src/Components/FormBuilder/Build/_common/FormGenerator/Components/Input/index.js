import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import { FRAMEWORK_TYPES } from "../../Utils/constants";

const Input = ({
	label = "",
	placeholder = "",
	name,
	type: inputType = "text",
	isEditable = true,
	autoFocus = false,
	isRequired = false,
	autoComplete,
	onChange: changeHandler = () => { },
	note = "",
	upsideError,
	defaultValue = "",
	classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
	framework = FRAMEWORK_TYPES.react_bs,
	pluginConfiguration: config = { viewable: false },
}) => {
	const { control } = useFormContext();
	const [showPassword, setShowPassword] = useState(false);

	const CustomController = ({ field }) => (
		<Form.Control
			{...field}
			value={field.value || ""}
			type={(inputType === "password" && (config.viewable && showPassword ? "text" : "password")) || inputType}
			placeholder={placeholder ? placeholder : label}
			className={`${customClasses.field} form-control`}
			disabled={isEditable === false}
			autoComplete={autoComplete ? autoComplete : undefined}
			autoFocus={autoFocus}
			defaultValue={defaultValue ? defaultValue : undefined}
			onChange={(e) => {
				if (isEditable === false) {
					return;
				}
				if (inputType === "number") {
					field.onChange(Number(e.target.value));
				} else {
					field.onChange(e.target.value);
				}
				changeHandler(e);
			}}
		/>
	)

	return (
		<Form.Group className={`mb-2 ${customClasses.wrapper} form-group`} controlId={name}>
			{label !== "" && (
				<Form.Label className={customClasses.label}>
					{label}
					{isRequired && <span className="small text-danger">*</span>}
				</Form.Label>
			)}
			<Controller
				control={control}
				name={name}
				render={({ field, fieldState: { error } }) => (<>
					{upsideError && !!error && <Form.Text className={`text-danger ${customClasses.error} mt-0`}>{error.message}</Form.Text>}
					{config.viewable && inputType === "password" ?
						<InputGroup>
							<CustomController field={field} />
							{config.viewable &&
								<InputGroup.Text onClick={() => setShowPassword(prev => !prev)}>
									{showPassword ? <VisibilityOff /> : <Visibility />}
								</InputGroup.Text>}
						</InputGroup>
						:
						<CustomController field={field} />
					}
					{!upsideError && !!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
				</>
				)}
			/>
			{note !== "" && <Form.Text>&nbsp;{`(${note})`}</Form.Text>}
		</Form.Group>
	);
};

export default Input;
