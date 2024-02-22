import React, { useEffect, useState, useTransition } from "react";
import { Button, Spinner } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
// import Form from "react-bootstrap/Form";
import { DEFAULT_VALUES, FIELD_TYPES } from "../../_common/FormGenerator";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { checkIsRequired, createFormSchema } from "../../_common/FormGenerator/Utils/common";

const FormGenerator = ({
	beforeSubmit = ({ x, data }) => ({ shouldSubmit: true, payload: data }),
	dataFields,
	onSubmit,
	framework,
	className,
	formClassName,
	FormButtons,
	buttonsClass,
	preForm,
	forceFormButtons,
	resetOnSubmit = true,
	extraFields,
	spinner = true
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [APIResponse, setAPIResponse] = useState({});

	useEffect(() => {
		setIsLoading(true);
		const delay = setTimeout(() => {
			setAPIResponse(
				dataFields.reduce(
					(prev, next) => ({
						...prev,
						[next.name]: next.value ? next.value : DEFAULT_VALUES[next.type],
					}),
					{}
				)
			);
			setIsLoading(false);
		}, 5);

		return () => clearTimeout(delay);
	}, [dataFields]);

	useEffect(() => {
		setIsLoading(true);
		const delay = setTimeout(() => {
			const response = {};
			setAPIResponse((prev) => ({ ...prev, ...response }));
			setIsLoading(false);
		}, 100);

		return () => clearTimeout(delay);
	}, []);

	if (isLoading && spinner) {
		return <Spinner animation="border" />;
	}

	return (
		<div className={className ? className : "m-3"}>
			<FormComp
				key={isLoading}
				defaults={APIResponse}
				dataFields={dataFields}
				onSubmit={onSubmit}
				framework={framework}
				formClassName={formClassName}
				FormButtons={FormButtons}
				buttonsClass={buttonsClass}
				preForm={preForm}
				forceFormButtons={forceFormButtons}
				resetOnSubmit={resetOnSubmit}
				extraFields={extraFields}
				beforeSubmit={beforeSubmit}
			/>
		</div>
	);
};

export default FormGenerator;

const FormComp = ({ beforeSubmit, defaults, dataFields, onSubmit, framework, formClassName = "", FormButtons, buttonsClass, preForm, forceFormButtons, resetOnSubmit, extraFields }) => {
	const [disabledBtn, setdisabledBtn] = useState(false);
	const [isPending, startTransition] = useTransition();
	const validateFields = dataFields.map((field) => ({
		name: field.name,
		validationType: field.validationType,
		validations: field.validations,
		isEditable: field.isEditable,
		inputType: field.type,
	}));

	const formContext = useForm({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: { ...defaults },
		resolver: yupResolver(Yup.object().shape(createFormSchema(validateFields))),
	});

	const { handleSubmit, reset, setError, setFocus } = formContext;

	const submitHandler = async (data) => {
		setdisabledBtn(true);
		const { shouldSubmit, payload = data } = await beforeSubmit({ setError, data, setFocus });
		if (!shouldSubmit) return setdisabledBtn(false);
		await onSubmit(payload);
		startTransition(() => {
			resetOnSubmit && reset();
			setdisabledBtn(false);
		});
	};

	try {
		return (
			<FormProvider {...formContext}>
				<form onSubmit={handleSubmit(submitHandler)} className={`${formClassName} text-color`}>
					{preForm && preForm}
					{dataFields.map((d) => {
						d.type = d?.type ? (Array.isArray(d.type) ? d.type[0] : d.type) : "text";
						d.type = typeof d.type === "object" && d.type !== null && d.type.hasOwnProperty("value") ? d.type.value : d.type;
						const Component = FIELD_TYPES[d.type];
						return (
							<Component key={d.name} {...d}
								inputType={d.type}
								isRequired={checkIsRequired(d)}
								framework={framework}
								isEditable={d.isEditable && !disabledBtn}
							/>);
					})}
					{extraFields && <>{extraFields}</>}
					{(forceFormButtons || dataFields.length !== 0) && (<>
						{FormButtons ? (
							<FormButtons reset={reset} disabledBtn={disabledBtn} />
						) : (
							<div className={`col-12 gap-5 ${buttonsClass}`}>
								<Button variant="secondary" disabled={disabledBtn} onClick={reset}>
									Reset
								</Button>
								<Button disabled={disabledBtn} type="submit">{
									isPending ? 'Submitting' : 'Submit'}</Button>
							</div>
						)}
					</>)}
				</form>
			</FormProvider>
		);
	} catch (error) {
		console.error(error);
	}
};
