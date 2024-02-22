import React, { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import { getOptions } from "../../Utils/common";
import { FRAMEWORK_TYPES } from "../../Utils/constants";

const Checkbox = ({
	name,
	label = "",
	optionKey: opKey = {
		url: "",
		method: "",
		payload: {},
		labelField: "",
		valueField: "",
	},
	options: staticOptions = [],
	isEditable = true,
	isRequired = false,
	onChange: changeHandler = () => { },
	classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
	framework = FRAMEWORK_TYPES.react_bs,
}) => {
	const { control } = useFormContext();
	const [options, setOptions] = useState(staticOptions);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setOptions(staticOptions);
	}, [staticOptions]);

	useEffect(() => {
		if (opKey.url !== "") {
			setIsLoading(true);
			getOptions(opKey)
				.then((res) => setOptions(res))
				.finally(() => setIsLoading(false));
		}
	}, [opKey]);

	const checkChangeHandler = (e, field, value) => {
		if (isEditable === false) {
			return;
		}
		field.onChange(e.target.checked ? [...value, e.target.value] : [...value.filter((val) => val !== e.target.value)]);
		changeHandler(e);
	};
	return (
		<Form.Group className={`mb-2 ${customClasses.wrapper}`} controlId={name}>
			{label !== "" && (
				<>
					<Form.Label className={customClasses.label}>
						{label}
						{isRequired && <span className="small text-danger">*</span>}
					</Form.Label>
					<br />
				</>
			)}
			{isLoading === true ? (
				<Spinner animation="border" />
			) : (
				<Controller
					control={control}
					name={name}
					render={({ field: { value, ...field }, fieldState: { error } }) => (
						<>
							{options.map((op) => (
								<Form.Check
									type={"checkbox"}
									inline
									{...field}
									key={op.value}
									id={`${name} ${op.value}`}
									label={op.label}
									className={`${customClasses.field}`}
									value={op.value}
									disabled={isEditable === false}
									checked={Array.isArray(value) ? value?.includes(op.value) : value}
									onChange={(e) => checkChangeHandler(e, field, value)}
								/>
							))}
							{!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
						</>
					)}
				/>
			)}
		</Form.Group>
	);
};

export default Checkbox;
