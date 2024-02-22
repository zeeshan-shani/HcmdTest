import React from "react";
import { Form } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import PhoneInput2 from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FRAMEWORK_TYPES } from "../../Utils/constants";

const PhoneInput = ({
	name,
	label = "",
	placeholder = "",
	isEditable = true,
	isRequired = false,
	onChange: changeHandler = () => { },
	pluginConfiguration: config = {
		country: "us",
		onlyCountries: [],
		preferredCountries: [],
		excludeCountries: [],
		disableCountryCode: false
	},
	classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
	framework = FRAMEWORK_TYPES.react_bs,
}) => {
	const { control } = useFormContext();
	return (
		<Form.Group className={`mb-2 ${customClasses.wrapper}`} controlId={name}>
			<Form.Label className={customClasses.label}>
				{label}
				{isRequired && <span className="small text-danger">*</span>}
			</Form.Label>
			<Controller
				control={control}
				name={name}
				render={({ field: { ref, ...field }, fieldState: { error } }) => (
					<>
						<div className={customClasses.field}>
							<PhoneInput2
								{...field}
								value={field.value || ""}
								inputClass="w-100"
								placeholder={placeholder ? placeholder : label}
								label={label}
								disabled={isEditable === false}
								onChange={(phone) => {
									if (isEditable === false) {
										return;
									}
									field.onChange(phone);
									changeHandler(phone);
								}}
								country={config.country}
								disableCountryCode={config.disableCountryCode}
								onlyCountries={config.onlyCountries}
								preferredCountries={config.preferredCountries}
								excludeCountries={config.excludeCountries}
							/>
						</div>
						{!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
					</>
				)}
			/>
		</Form.Group>
	);
};

export default PhoneInput;
