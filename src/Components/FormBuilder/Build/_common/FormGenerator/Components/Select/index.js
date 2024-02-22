import React, { useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import ReactSelect from "react-select";
import makeAnimated from "react-select/animated";
import CreatableSelect from "react-select/creatable";
import AsyncCreatableSelect from 'react-select/async-creatable';
import AsyncSelect from 'react-select/async';
import { getOptions } from "../../Utils/common";
import { FRAMEWORK_TYPES } from "../../Utils/constants";
import { debounce } from "lodash";

const animatedComponents = makeAnimated();

const Select = ({
	name,
	label = "",
	placeholder = "",
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
	menuPlacement = "auto",
	onChange: changeHandler = () => { },
	onDelete: deleteHandler = () => { },
	pluginConfiguration: config = {
		isCreatable: false,
		isAsyncSelect: false,
		isMulti: false,
		isClearable: false,
		isRtl: false,
		isSearchable: false,
		defaultOptions: false,
		isOptionRemovable: false
	},
	classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
	framework = FRAMEWORK_TYPES.react_bs,
}) => {
	const { control } = useFormContext();
	const selectRef = useRef();
	const [options] = useState(staticOptions);
	const [isLoading] = useState(false);
	const [isAsyncLoading, setIsAsyncLoading] = useState(false);

	// useEffect(() => {
	// 	if (opKey.url !== "") {
	// 		setIsLoading(true);
	// 		getOptions(opKey)
	// 			.then((res) => setOptions(res))
	// 			.finally(() => setIsLoading(false));
	// 	}
	// }, [opKey]);

	const setValueHandler = (val = []) => {
		try {
			if (!val) return [];
			if (Array.isArray(val) && val.every((v) => typeof v === "object")) {
				const some = val.map((v) => v.value);
				return options.filter((op) => some && some.includes(op.value));
			} else {
				return options.filter((op) => val && val.includes(op.value));
			}
		} catch (error) {
			console.error(error);
		}
	};
	const loadSuggestions = debounce(async (query, callback) => {
		// if (!query) return [];
		setIsAsyncLoading(true);
		opKey.payload.value = query;
		getOptions(opKey)
			.then((res) => callback(res))
			.finally(() => setIsAsyncLoading(false));
	}, 1000);

	return (
		<Form.Group className={`mb-2 ${customClasses.wrapper}`} controlId={name}>
			{label !== "" && (
				<Form.Label className={customClasses.label}>
					{label}
					{isRequired && <span className="small text-danger">*</span>}
				</Form.Label>
			)}
			{isLoading === true ? (
				<Spinner animation="border" />
			) : (
				<Controller
					control={control}
					name={name}
					render={({ field, fieldState: { error } }) => {
						if (config.isAsyncSelect && config.isCreatable) {
							return (
								<AsyncCreatableSelect
									ref={selectRef}
									defaultOptions={config.defaultOptions ? true : []}
									classNamePrefix="select"
									className={`basic-single ${customClasses.field}`}
									isMulti={config.isMulti}
									isClearable={config.isMulti || config.isClearable}
									placeholder={placeholder ? placeholder : label}
									loadOptions={loadSuggestions}
									isLoading={isAsyncLoading}
									menuPlacement={menuPlacement}
									onChange={(value) => {
										if (isEditable === false) {
											return;
										}
										if (config.isMulti) {
											field.onChange(value);
											changeHandler(value);
										} else {
											field.onChange([value]);
											changeHandler([value]);
										}
									}}
								/>
							)
						}
						if (config.isCreatable) {
							return (<>
								<CreatableSelect
									{...field}
									ref={selectRef}
									options={options}
									isMulti={config.isMulti}
									components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
									placeholder={`Select ${placeholder ? placeholder : label}...`}
									menuPlacement={menuPlacement}
									isClearable={config.isClearable}
									onChange={(value) => {
										if (isEditable === false) return;
										if (config.isMulti) {
											field.onChange(value);
											changeHandler(value);
										} else {
											field.onChange([value]);
											changeHandler([value]);
										}
									}}
								/>
								{config.isOptionRemovable && !config.isMulti && !!field?.value?.length &&
									field?.value[0] && !field?.value[0]?.["__isNew__"] &&
									<div className="d-flex justify-content-end">
										<Button variant="link" className="text-muted" onClick={() => {
											deleteHandler(field?.value[0].id);
											changeHandler([]);
										}}>
											{config.removedText}
										</Button>
									</div>}
							</>);
						}
						if (config.isAsyncSelect) {
							return (<>
								<AsyncSelect
									{...field}
									ref={selectRef}
									classNamePrefix="select"
									className={`basic-single ${customClasses.field}`}
									isMulti={config.isMulti}
									isClearable={config.isMulti || config.isClearable}
									// defaultOptions={config.defaultOptions ? true : []}
									defaultOptions
									cacheOptions={true}
									placeholder={`Select ${placeholder ? placeholder : label}...`}
									loadOptions={loadSuggestions}
									isLoading={isAsyncLoading}
									menuPlacement={menuPlacement}
									required={isRequired}
									onChange={(value) => {
										if (isEditable === false) {
											return;
										}
										if (config.isMulti) {
											field.onChange(value);
											changeHandler(value);
										} else {
											field.onChange(value ? [value] : []);
											changeHandler(value ? [value] : []);
										}
									}}
								/>
								{!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
							</>
							);
						}
						return (
							<>
								<ReactSelect
									ref={selectRef}
									className={`basic-single ${customClasses.field}`}
									classNamePrefix="select"
									placeholder={`Select ${placeholder ? placeholder : label}...`}
									name={name}
									value={setValueHandler(field.value)}
									// value={!config.isMulti ? setValueHandler([field.value]) : setValueHandler(field.value)}
									options={options}
									isDisabled={isEditable === false}
									isMulti={config.isMulti}
									onChange={(value) => {
										if (isEditable === false) {
											return;
										}
										if (config.isMulti) {
											field.onChange(value);
											changeHandler(value);
										} else {
											field.onChange(value ? [value] : []);
											changeHandler(value ? [value] : []);
										}
									}}
									isLoading={isLoading}
									isClearable={config.isClearable}
									isRtl={config.isRtl}
									menuPlacement={menuPlacement}
									isSearchable={config.isSearchable}
									components={animatedComponents}
								/>
								{!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
							</>
						);
					}}
				/>
			)}
		</Form.Group>
	);
};

export default Select;
