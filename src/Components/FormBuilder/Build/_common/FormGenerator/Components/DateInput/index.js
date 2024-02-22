import React from "react";
import { Form } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FRAMEWORK_TYPES } from "../../Utils/constants";
import "./index.css";

const DateInput = ({
	label = "",
	name,
	placeholder = "",
	isEditable = true,
	isRequired = false,
	onChange: changeHandler = () => { },
	pluginConfiguration: config = { isDateRange: false, timeRequired: false, isClearable: false },
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
				render={({ field: { ref, ...field }, fieldState: { error } }) => (
					<>
						<br />
						{config.isDateRange ? (
							<DatePicker
								{...field}
								className={`${customClasses.field} form-control`}
								placeholderText={placeholder ? placeholder : label}
								selected={field.value && field.value[0]}
								selectsRange
								isClearable={config.isClearable}
								autoComplete="off"
								startDate={field.value && field.value[0]}
								endDate={field.value && field.value[1]}
								disabled={isEditable === false}
								onChange={(dates) => {
									if (isEditable === false) return;
									field.onChange(dates.filter((d) => !!d));
									changeHandler(dates);
								}}
							/>
						) : (
							<DatePicker
								{...field}
								className={`form-control ${customClasses.field}`}
								placeholderText={label}
								selected={field.value}
								disabled={isEditable === false}
								onChange={(date) => {
									if (isEditable === false) {
										return;
									}
									field.onChange(date);
									changeHandler(date);
								}}
								isClearable={config.isClearable}
								showTimeSelect={config.timeRequired}
								timeFormat="HH:mm"
								autoComplete="off"
								timeIntervals={15}
								dateFormat="MMMM d, yyyy h:mm aa"
								timeCaption="time"
							/>
						)}
						{!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
					</>
				)}
			/>
		</Form.Group>
	);
};

export default DateInput;
