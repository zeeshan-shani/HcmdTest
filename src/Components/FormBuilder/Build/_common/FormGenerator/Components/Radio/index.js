import React, { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import { getOptions } from "../../Utils/common";
import { FRAMEWORK_TYPES } from "../../Utils/constants";

const Radio = ({
	label = "",
	name,
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
	onChange: changeHandler = () => {},
	classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
	framework = FRAMEWORK_TYPES.react_bs,
}) => {
	const { control } = useFormContext();
	const [options, setOptions] = useState(staticOptions);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (opKey.url !== "") {
			setIsLoading(true);
			getOptions(opKey)
				.then((res) => setOptions(res))
				.finally(() => setIsLoading(false));
		}
	}, [opKey]);

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
							{options.map((o) => (
								<Form.Check
									inline
									{...field}
									key={o.value}
									type={"radio"}
									id={`${name} ${o.value}`}
									name={name}
									className={customClasses.field}
									label={o.label}
									value={o.value}
									{...o}
									// disabled={isEditable === false}
									// disabled={o?.disabled === true}
									checked={value === o.value}
									onChange={(e) => {
										if (isEditable === false) {
											return;
										}
										field.onChange(e.target.value);
										changeHandler(e);
									}}
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

export default Radio;
