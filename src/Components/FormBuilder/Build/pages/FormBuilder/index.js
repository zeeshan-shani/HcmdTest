import React, { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../_common/FormGenerator/Components/Input";
import Select from "../../_common/FormGenerator/Components/Select";
import Checkbox from "../../_common/FormGenerator/Components/Checkbox";
import Radio from "../../_common/FormGenerator/Components/Radio";
import TypeBasedFields from "./Components/Fields/TypeBasedFields";
import DefaultValueField from "./Components/Fields/DefaultValueField";
import ValidationsFileds from "./Components/Fields/ValidationsFileds";
import { FIELD_TYPES_NAME, FIELD_TYPES_OPTIONS, VALUE_TYPES } from "../../_common/FormGenerator/Utils/constants";
import { checkIsValidJSON, deleteUnwantedFields, getDetailedFields, getPluinConfings, getValidationsArray, reorder, setDefaultValues } from "./Utils/functions";
import { defaults, schema } from "./Utils/constants";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { RxCopy } from "react-icons/rx";
import { TfiClose } from "react-icons/tfi";
import { HiPencil } from "react-icons/hi";
import CodeSnippetCard from "./Components/Cards/CodeSnippetCard";
import RenderedFormCard from "./Components/Cards/RenderedFormCard";
import TextArea from "../../_common/FormGenerator/Components/TextArea";

const FormBuilder = () => {
	const [dataJson, setDataJson] = useState([]);
	const [oldData, setOldData] = useState([]);
	const [regexState, setRegexState] = useState({ str: "", flag: "" });
	const [isEditFlag, setIsEditFlag] = useState(false);
	const [copied, setCopied] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [showDelete, setShowDelete] = useState(null);
	const [rows, setRows] = useState(2);

	const formContext = useForm({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: { ...defaults },
		resolver: yupResolver(schema),
	});

	const inputJSONFormContext = useForm({
		defaultValues: { inputJSONText: "[]" },
	});

	const {
		setValue: setInputJSONValue,
		getValues: getInputJSONValues,
		setError: setInputJSONerror,
		watch: watchInputJSON,
		clearErrors: clearJSONErrors,
		// formState: { errors: inputJSONErrors },
	} = inputJSONFormContext;

	const { handleSubmit, reset, watch, setValue, getValues, control, setError } = formContext;

	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "options",
	});

	// watchers
	const valTypeChange = watch("type")[0]?.value;
	const dateRange = watch("isDateRange");
	const opChoice = watch("optionsChoice");
	const classesChoice = watch("addClasses");
	const checkObj = {
		checkRequired: watch("validationsObj.required.check"),
		checkMin: watch("validationsObj.min.check"),
		checkMax: watch("validationsObj.max.check"),
		checkLength: watch("validationsObj.length.check"),
		checkMatches: watch("validationsObj.matches.check"),
	};
	const JSONText = watchInputJSON("inputJSONText");

	// set validationType automatically based on fieldType
	useEffect(() => {
		if (
			valTypeChange === FIELD_TYPES_NAME.text ||
			valTypeChange === FIELD_TYPES_NAME.email ||
			valTypeChange === FIELD_TYPES_NAME.password ||
			valTypeChange === FIELD_TYPES_NAME.phone ||
			valTypeChange === FIELD_TYPES_NAME.textarea ||
			valTypeChange === FIELD_TYPES_NAME.radio
		) {
			setValue("validationType", VALUE_TYPES.STRING);
		} else if (valTypeChange === FIELD_TYPES_NAME.number) {
			setValue("validationType", VALUE_TYPES.NUMBER);
		} else if (valTypeChange === FIELD_TYPES_NAME.checkbox || valTypeChange === FIELD_TYPES_NAME.select || valTypeChange === FIELD_TYPES_NAME.file) {
			setValue("validationType", VALUE_TYPES.ARRAY);
		} else if (valTypeChange === FIELD_TYPES_NAME.date && dateRange.length !== 0) {
			setValue("validationType", VALUE_TYPES.ARRAY);
		} else if (valTypeChange === FIELD_TYPES_NAME.date && dateRange.length === 0) {
			setValue("validationType", VALUE_TYPES.STRING);
		}
	}, [dateRange, setValue, valTypeChange]);

	useEffect(() => {
		if (copied === true) {
			setTimeout(() => {
				setCopied(false);
			}, 2000);
		}
	}, [copied]);

	// clear previously selected options on field type change
	const clearPreviousValues = () => {
		setValue("value", "");
		setValue("optionsChoice", "");
		setValue("optionKey", {
			url: "",
			method: "",
			labelField: "",
			valueField: "",
		});
		setValue("options", []);
		setValue("rows", 0);
	};

	const submitHandler = (data) => {
		if (!isEditFlag && oldData.find((entry) => entry.name === data.name)) {
			setError("name", {
				type: "custom",
				message: "Name should be unique!",
			});
		} else {
			setShowForm(false);
			if (isEditFlag) {
				setOldData((prev) => {
					const temp = prev.findIndex((e) => e.name === data.name);
					if (temp !== -1) {
						prev.splice(temp, 1, data);
					}
					changeDataJSON(prev);
					return prev;
				});
				setIsEditFlag(false);
			} else {
				setOldData((prev) => {
					changeDataJSON([...prev, data]);
					return [...prev, data];
				});
			}
			reset();
		}
	};

	const changeDataJSON = (prevData) => {
		const x = JSON.parse(JSON.stringify(prevData));
		x.map((data) => {
			data.type = data.type[0].value;
			data.isEditable = data.isEditable[0] ? false : true;
			data.validations = getValidationsArray(data.validationsObj, regexState);
			data.pluginConfiguration = getPluinConfings(data, dateRange);

			data = setDefaultValues(data);
			data = deleteUnwantedFields(data);
			return data;
		});
		editInputJSONText(x);
		setDataJson(x);
	};

	const handleCloseForm = () => {
		setShowForm(false);
		setIsEditFlag(false);
		reset();
	};

	const deleteFormField = (name) => {
		setDataJson(dataJson.filter((field) => field.name !== name));
		setOldData(oldData.filter((field) => field.name !== name));
		editInputJSONText(dataJson.filter((field) => field.name !== name));
		setShowDelete(null);
	};

	const editFieldHandler = (editField) => {
		setIsEditFlag(true);
		reset();
		const field = oldData.filter((f) => f.name === editField.name)[0];
		Object.entries(field).forEach((entry) => setValue(entry[0], entry[1]));
		if (field.options) {
			replace(field.options);
		}
		setShowForm(true);
	};

	const onDragEnd = (result) => {
		// dropped outside the list
		if (!result.destination) {
			return;
		}
		const items = reorder(oldData, result.source.index, result.destination.index);
		setOldData(items);
	};

	const inputJSONHeightHandler = (val) => {
		const newLines = val.match(/\n/g)?.length;
		if (!newLines) setRows(2);
		else setRows(newLines + 1);
	};

	const editInputJSONText = (data) => {
		const val = JSON.stringify(data, undefined, 4);
		setInputJSONValue("inputJSONText", val);
		inputJSONHeightHandler(val);
	};

	const updateBuilderFields = () => {
		clearJSONErrors("inputJSONText");
		const updatedFields = JSON.parse(getInputJSONValues("inputJSONText"));
		const newFields = getDetailedFields(updatedFields);
		setOldData(newFields);
		changeDataJSON(newFields);
	};

	const generateError = (err) => {
		setInputJSONerror("inputJSONText", {
			type: "custom",
			message: err?.message,
		});
	};

	const createFormBuilderFields = () => {
		try {
			checkIsValidJSON(JSONText);
			updateBuilderFields();
		} catch (err) {
			generateError(err);
		}
	};
	// useEffect(() => {
	//   const check = setTimeout(() => {
	//     try {
	//       checkIsValidJSON(JSONText);
	//       updateBuilderFields();
	//     } catch (err) {
	//       generateError(err);
	//     }
	//   }, 500);

	//   return () => {
	//     clearTimeout(check);
	//   };
	// }, [JSONText, generateError, updateBuilderFields]);

	return (
		<div className="container-fluid">
			<Row>
				<h3 className="my-2">Form Builder</h3>
				<Col md={6} className="border-1">
					<Card>
						<Card.Header>
							<Row className="align-items-center">
								<Col>
									<h5 className="m-0">Field Form</h5>
								</Col>
								<Col>
									<Button size="sm" className="float-end" onClick={() => setShowForm(true)}>
										Add Field
									</Button>
								</Col>
							</Row>
						</Card.Header>
						<Card.Body>
							<DragDropContext onDragEnd={onDragEnd}>
								<Droppable droppableId="droppable">
									{(provided, snapshot) => (
										<div
											{...provided.droppableProps}
											ref={provided.innerRef}
										// style={getListStyle(snapshot.isDraggingOver)}
										>
											{oldData.map((dataField, index) => (
												<Draggable draggableId={dataField.name} key={dataField.name} index={index}>
													{(provided, snapshot) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
														// style={getItemStyle(
														//   snapshot.isDragging,
														//   provided.draggableProps.style
														// )}
														>
															<Card className="my-2">
																<Row className="px-3 py-2">
																	<Col>
																		<div className="d-flex align-items-center">
																			<span className="fs-5">{dataField.label}</span>
																			&nbsp;
																			<Badge pill bg="success">
																				{dataField.type[0].label}
																			</Badge>
																		</div>
																	</Col>
																	<Col>
																		<>
																			<Button size="sm" className="btn-outline-danger float-end" variant="light" onClick={() => setShowDelete(dataField)}>
																				<TfiClose fontSize={20} />
																			</Button>
																			<Button
																				size="sm"
																				className="btn-outline-warning float-end mx-1"
																				variant="light"
																				onClick={() => editFieldHandler(dataField)}>
																				<HiPencil fontSize={20} />
																			</Button>
																		</>
																	</Col>
																</Row>
															</Card>
														</div>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>
						</Card.Body>
					</Card>
					<CodeSnippetCard />
				</Col>
				{showForm && (
					<Modal show={showForm} scrollable={true} backdrop="static" onHide={handleCloseForm} size="lg" fullscreen="lg-down">
						<Modal.Header closeButton>
							<Modal.Title>{isEditFlag ? "Edit " : "Add "}Field</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<FormProvider {...formContext}>
								<Form onSubmit={handleSubmit(submitHandler)}>
									{/* name & label */}
									<Row>
										<Col>
											<Input
												label="Field Name"
												name="name"
												value=""
												valueKey="name"
												type="text"
												isEditable={isEditFlag ? false : true}
												validationType="string"
												validations={[
													{
														type: "required",
														params: ["Field Name is required!"],
													},
												]}
												isRequired={true}
												note={"The field name in the database."}
											/>
										</Col>
										<Col>
											<Input
												label="Label"
												name="label"
												value=""
												valueKey="label"
												type="text"
												isEditable={true}
												validationType="string"
												validations={[
													{
														type: "required",
														params: ["Label is required!"],
													},
												]}
												isRequired={true}
											/>
										</Col>
									</Row>
									{/* valueKey & field type */}
									<Row>
										<Col>
											<Input
												label="Value Key"
												name="valueKey"
												value=""
												valueKey="valueKey"
												type="text"
												isEditable={true}
												validationType="string"
												validations={[
													{
														type: "required",
														params: ["Value Key is required!"],
													},
												]}
												isRequired={true}
											/>
										</Col>
										<Col>
											<Select
												label="Field Type"
												name="type"
												value={[]}
												valueKey="type"
												type="select"
												isEditable={true}
												optionKey={{ url: "", method: "", payload: {} }}
												options={FIELD_TYPES_OPTIONS}
												validationType="array"
												validations={[{ type: "min", params: [1, "Coutry is required!"] }]}
												pluginConfiguration={{ isMulti: false }}
												isRequired={true}
												onChange={clearPreviousValues}
											/>
										</Col>
									</Row>
									{/* value & disable */}
									<Row>
										<Col>
											<DefaultValueField type={valTypeChange} formContext={formContext} />
										</Col>
										<Col>
											{/* Disable */}
											<h6>Disable</h6>
											<Checkbox
												label=""
												name="isEditable"
												value={[]}
												valueKey="isEditable"
												type="checkbox"
												optionKey={{
													url: "",
													method: "",
												}}
												options={[{ value: "false", label: "Disable this field" }]}
												isEditable={true}
												validationType="array"
												validations={[]}
											/>
										</Col>
									</Row>
									<TypeBasedFields type={valTypeChange} formContext={formContext} />
									{/* plugin configs, optionKey & options */}
									<Row>
										{(valTypeChange === "select" || valTypeChange === "radio" || valTypeChange === "checkbox") && (
											<>
												<Radio
													label="How would you like to add options?"
													name="optionsChoice"
													value=""
													valueKey="optionsChoice"
													type="radio"
													optionKey={{
														url: "",
														method: "",
													}}
													options={[
														{ value: "url", label: "API call" },
														{ value: "static", label: "Mannually" },
													]}
													isEditable={true}
													validationType="string"
													validations={[]}
													isRequired={true}
													onChange={(e) => (e.target.value === "static" ? setValue("options", [{ label: "", value: "" }]) : setValue("options", []))}
												/>
												{opChoice === "url" && (
													<>
														<Row>
															<Col>
																<Input
																	label="URL"
																	name="optionKey.url"
																	value=""
																	valueKey="optionKey.url"
																	type="text"
																	isEditable={true}
																	validationType="string"
																	validations={[]}
																	isRequired={true}
																	note="Enter full url"
																/>
															</Col>
															<Col>
																<Radio
																	label="Method"
																	name="optionKey.method"
																	value=""
																	valueKey="optionKey.method"
																	type="radio"
																	optionKey={{
																		url: "",
																		method: "",
																	}}
																	options={[
																		{ value: "get", label: "GET" },
																		{ value: "post", label: "POST" },
																	]}
																	isEditable={true}
																	validationType="string"
																	validations={[]}
																	isRequired={true}
																/>
															</Col>
														</Row>
														<Row>
															<Col>
																<Input
																	label="Label Field"
																	name="optionKey.labelField"
																	value=""
																	valueKey="optionKey.labelField"
																	type="text"
																	isEditable={true}
																	validationType="string"
																	validations={[]}
																	isRequired={true}
																	note="DB field name for label."
																/>
															</Col>
															<Col>
																<Input
																	label="Value Field"
																	name="optionKey.valueField"
																	value=""
																	valueKey="optionKey.valueField"
																	type="text"
																	isEditable={true}
																	validationType="string"
																	validations={[]}
																	isRequired={true}
																	note="DB field name for value."
																/>
															</Col>
														</Row>
													</>
												)}
												{opChoice === "static" && (
													<>
														{fields.map((item, index) => (
															<Row key={item.id}>
																<Col md={5}>
																	<Input
																		label="Label"
																		name={`options.${index}.label`}
																		value=""
																		valueKey={`options.${index}.label`}
																		type="text"
																		isEditable={true}
																		validationType="string"
																		validations={[]}
																		isRequired={true}
																	/>
																</Col>
																<Col md={5}>
																	<Input
																		label="Value"
																		name={`options.${index}.value`}
																		value=""
																		valueKey={`options.${index}.value`}
																		type="text"
																		isEditable={true}
																		validationType="string"
																		validations={[]}
																		isRequired={true}
																	/>
																</Col>
																<Col className="d-flex flex-column mb-3">
																	{getValues("options").length > 1 && (
																		<>
																			<span className="mt-2">&nbsp;</span>
																			<Button variant="danger" type="button" onClick={() => remove(index)}>
																				<TfiClose />
																			</Button>
																		</>
																	)}
																</Col>
															</Row>
														))}
														<Col md={3}>
															<Button type="button" className="mb-3" onClick={() => append({ label: "", value: "" })}>
																Add Option
															</Button>
														</Col>
													</>
												)}
											</>
										)}
									</Row>
									{/* validation type (auto filled) */}
									<Row>
										<Col md={6}>
											<Input
												label="Validation Type"
												name="validationType"
												valueKey="validationType"
												type="text"
												isEditable={false}
												validationType="string"
												validations={[]}
												isRequired={true}
											/>
										</Col>
									</Row>
									{/* validations */}
									<ValidationsFileds checkObj={checkObj} formContext={formContext} setRegexState={setRegexState} />
									{/* custom classes */}
									<Row>
										<h6>Classes</h6>
										<Checkbox
											label=""
											name="addClasses"
											value={[]}
											valueKey="addClasses"
											type="checkbox"
											optionKey={{
												url: "",
												method: "",
											}}
											options={[{ value: "true", label: "Add custom classes" }]}
											isEditable={true}
											validationType="array"
											validations={[]}
										/>
									</Row>
									{classesChoice.length !== 0 && (
										<>
											<Form.Text>{`(Enter classes as in className property)`}</Form.Text>
											<Row>
												<Col>
													<Input
														label="Wrapper Classes"
														name="classes.wrapper"
														value=""
														valueKey="classes.wrapper"
														type="text"
														isEditable={true}
														validationType="string"
														validations={[]}
													/>
												</Col>
												<Col>
													<Input
														label="Label Classes"
														name="classes.label"
														value=""
														valueKey="classes.label"
														type="text"
														isEditable={true}
														validationType="string"
														validations={[]}
													/>
												</Col>
											</Row>
											<Row>
												<Col>
													<Input
														label="Field Classes"
														name="classes.field"
														value=""
														valueKey="classes.field"
														type="text"
														isEditable={true}
														validationType="string"
														validations={[]}
													/>
												</Col>
												<Col>
													<Input
														label="Error Classes"
														name="classes.error"
														value=""
														valueKey="classes.error"
														type="text"
														isEditable={true}
														validationType="string"
														validations={[]}
													/>
												</Col>
											</Row>
										</>
									)}
									<Button type="submit">Submit</Button>
								</Form>
							</FormProvider>
						</Modal.Body>
					</Modal>
				)}
				{!!showDelete && (
					<Modal backdrop="static" show={!!showDelete}>
						<Modal.Header>Confirm Deletion</Modal.Header>
						<Modal.Body>Are you sure you want to delete {showDelete.label} field?</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={() => setShowDelete(null)}>
								Cancel
							</Button>
							<Button onClick={() => deleteFormField(showDelete.name)}>Confirm</Button>
						</Modal.Footer>
					</Modal>
				)}

				<Col md={6}>
					<Card>
						<Card.Header>
							<Row className="align-items-center">
								<Col>
									<h6 className="m-0">JSON</h6>
								</Col>
								<Col>
									<OverlayTrigger
										key={"copy-to-clipboard"}
										placement={"bottom"}
										overlay={<Tooltip id={`tooltip-copy-to-clipboard`}>Copy to Clipboard</Tooltip>}>
										<CopyToClipboard text={JSON.stringify(dataJson, undefined, 4)} onCopy={() => setCopied(true)}>
											<Button size="sm" variant="light" className="float-end p-0">
												<RxCopy fontSize={"18px"} />
											</Button>
										</CopyToClipboard>
									</OverlayTrigger>
									{copied && <Form.Text className="float-end">Copied!</Form.Text>}
								</Col>
							</Row>
						</Card.Header>
						<Card.Body>
							<FormProvider {...inputJSONFormContext}>
								<TextArea
									name="inputJSONText"
									pluginConfiguration={{ rows }}
									onChange={(e) => {
										inputJSONHeightHandler(e.target.value);
									}}
									classes={{ field: "w-100 h-100" }}
								/>
								<Button size="sm" onClick={createFormBuilderFields}>
									Create Fields
								</Button>
							</FormProvider>
							{/* <pre>{JSON.stringify(dataJson, undefined, 4)}</pre> */}
						</Card.Body>
					</Card>

					<RenderedFormCard dataJson={dataJson} />
				</Col>
			</Row>
		</div>
	);
};

export default FormBuilder;
