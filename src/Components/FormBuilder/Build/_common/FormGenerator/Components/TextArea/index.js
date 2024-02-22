import React from "react";
import { Form } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import { FRAMEWORK_TYPES } from "../../Utils/constants";

const TextArea = ({
	name,
	label = "",
	isEditable = true,
	placeholder = "",
	isRequired = false,
	onChange: changeHandler = () => { },
	pluginConfiguration: config = { rows: 2 },
	classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
	framework = FRAMEWORK_TYPES.react_bs,
}) => {
	const { control } = useFormContext();

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
				render={({ field, fieldState: { error } }) => (
					<>
						<Form.Control
							as="textarea"
							{...field}
							rows={config.rows}
							className={`${customClasses.field} form-control`}
							placeholder={label}
							disabled={isEditable === false}
							onChange={(e) => {
								if (isEditable === false) {
									return;
								}
								field.onChange(e.target.value);
								changeHandler(e);
							}}
						/>
						{!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
					</>
				)}
			/>
		</Form.Group>
	);
};

export default TextArea;
