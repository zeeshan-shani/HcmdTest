import React, { useEffect, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Badge, Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { TrashFill, X } from 'react-bootstrap-icons';
import { yupResolver } from '@hookform/resolvers/yup';

// import Checkbox from 'Components/FormBuilder/Build/_common/FormGenerator/Components/Checkbox';
import Input from 'Components/FormBuilder/Build/_common/FormGenerator/Components/Input';
// import Radio from 'Components/FormBuilder/Build/_common/FormGenerator/Components/Radio';
import Select from 'Components/FormBuilder/Build/_common/FormGenerator/Components/Select';
import DefaultValuefield from 'Components/FormBuilder/Build/pages/FormBuilder/Components/Fields/DefaultValueField';
import TypeBasedFields from 'Components/FormBuilder/Build/pages/FormBuilder/Components/Fields/TypeBasedFields';
// import ValidationsFileds from 'Components/FormBuilder/Build/pages/FormBuilder/Components/Fields/ValidationsFileds';
import { defaults, schema } from 'Components/FormBuilder/Build/pages/FormBuilder/Utils/constants';
import { FIELD_TYPES_NAME, FIELD_TYPES_OPTIONS, VALUE_TYPES } from 'Components/FormBuilder/Build/_common/FormGenerator/Utils/constants';
import { deleteUnwantedFields, getPluinConfings, getValidationsArray, reorder, setDefaultValues } from 'Components/FormBuilder/Build/pages/FormBuilder/Utils/functions';
import { MuiTooltip } from 'Components/components';
import ErrorBoundary from 'Components/ErrorBoundry';
import ModalReactstrap from 'Components/Modals/Modal';
import { isString } from 'lodash';
import ValidationsFileds from 'Components/FormBuilder/Build/pages/FormBuilder/Components/Fields/ValidationsFileds';

const CustomForm = ({ oldData, setOldData, setDataJson, dataJson, setShowPreview }) => {
    const [showForm, setShowForm] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    // const [rows, setRows] = useState(2);
    const [isEditFlag, setIsEditFlag] = useState(false);
    const [regexState, setRegexState] = useState({ str: "", flag: "" });

    const formContext = useForm({
        mode: "all",
        reValidateMode: "onChange",
        defaultValues: { ...defaults },
        resolver: yupResolver(schema),
    });

    const { handleSubmit, reset, watch, setValue, getValues, control, setError } = formContext;
    const { fields, append, remove } = useFieldArray({ control, name: "options" }); // replace


    // const inputJSONFormContext = useForm({
    //     defaultValues: { inputJSONText: "[]" },
    // });

    // const {
    //     setValue: setInputJSONValue,
    //     getValues: getInputJSONValues,
    //     setError: setInputJSONerror,
    //     watch: watchInputJSON,
    //     clearErrors: clearJSONErrors,
    //     // formState: { errors: inputJSONErrors },
    // } = inputJSONFormContext;

    // watchers
    const valTypeChange = watch("type")[0]?.value;
    const dateRange = watch("isDateRange");
    // const opChoice = watch("optionsChoice");
    const opChoice = "static";
    // const classesChoice = watch("addClasses");
    const checkObj = {
        checkRequired: watch("validationsObj.required.check"),
        checkMin: watch("validationsObj.min.check"),
        checkMax: watch("validationsObj.max.check"),
        checkLength: watch("validationsObj.length.check"),
        checkMatches: watch("validationsObj.matches.check"),
    };
    // const JSONText = watchInputJSON("inputJSONText");

    // set validationType automatically based on fieldType
    useEffect(() => {
        if (valTypeChange === FIELD_TYPES_NAME.checkbox ||
            valTypeChange === FIELD_TYPES_NAME.select ||
            valTypeChange === FIELD_TYPES_NAME.radio)
            setValue("options", [{ label: "", value: "" }])
        else setValue("options", [])
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
        let newField = data;
        // const nameVal = convertToCamelCase(data.label);
        const nameVal = data.label;
        newField.name = nameVal;
        newField.valueKey = nameVal;
        if (valTypeChange === FIELD_TYPES_NAME.checkbox ||
            valTypeChange === FIELD_TYPES_NAME.select ||
            valTypeChange === FIELD_TYPES_NAME.radio)
            newField.options = newField.options.map(i => ({ label: i.label, value: i.label }));
        if (!isEditFlag && oldData.find((entry) => entry.name === newField.name)) {
            setError("label", { type: "custom", message: "Label should be unique!" });
        } else {
            setShowForm(false);
            if (isEditFlag) {
                setOldData((prev) => {
                    const temp = prev.findIndex((e) => e.name === newField.name);
                    if (temp !== -1) {
                        prev.splice(temp, 1, newField);
                    }
                    changeDataJSON(prev);
                    return prev;
                });
                setIsEditFlag(false);
            } else {
                setOldData((prev) => {
                    changeDataJSON([...prev, newField]);
                    return [...prev, newField];
                });
            }
            reset();
        }
    };

    const changeDataJSON = (prevData) => {
        const x = JSON.parse(JSON.stringify(prevData));
        x.map((data) => {
            if (isString(data.type)) return data;
            data.type = data.type[0].value;
            data.isEditable = data.isEditable[0] ? false : true;
            data.validations = getValidationsArray(data.validationsObj, regexState);
            data.pluginConfiguration = getPluinConfings(data, dateRange);

            data = setDefaultValues(data);
            data = deleteUnwantedFields(data);
            return data;
        });
        // editInputJSONText(x);
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
        // editInputJSONText(dataJson.filter((field) => field.name !== name));
        setShowDelete(null);
    };

    // const editFieldHandler = (editField) => {
    //     setIsEditFlag(true);
    //     reset();
    //     const field = oldData.filter((f) => f.name === editField.name)[0];
    //     Object.entries(field).forEach((entry) => setValue(entry[0], entry[1]));
    //     if (field.options) {
    //         replace(field.options);
    //     }
    //     setShowForm(true);
    // };

    const onDragEnd = (result) => {
        // dropped outside the list
        if (!result.destination) return;
        const items = reorder(oldData, result.source.index, result.destination.index);
        setOldData(items);
        setDataJson(items);
    };

    // const inputJSONHeightHandler = (val) => {
    //     const newLines = val.match(/\n/g)?.length;
    //     if (!newLines) setRows(2);
    //     else setRows(newLines + 1);
    // }

    // const editInputJSONText = (data) => {
    //     const val = JSON.stringify(data, undefined, 4);
    //     setInputJSONValue("inputJSONText", val);
    //     inputJSONHeightHandler(val);
    // };

    // const updateBuilderFields = () => {
    //     clearJSONErrors("inputJSONText");
    //     const updatedFields = JSON.parse(getInputJSONValues("inputJSONText"));
    //     const newFields = getDetailedFields(updatedFields);
    //     setOldData(newFields);
    //     changeDataJSON(newFields);
    // };

    // const generateError = (err) => {
    //     setInputJSONerror("inputJSONText", {
    //         type: "custom",
    //         message: err?.message,
    //     });
    // };

    // const createFormBuilderFields = () => {
    //     try {
    //         checkIsValidJSON(JSONText);
    //         updateBuilderFields();
    //     } catch (err) {
    //         generateError(err);
    //     }
    // };

    return (<>
        <Card>
            <Card.Header>
                <Row className="align-items-center">
                    <Col>
                        <h5 className="m-0">Form Fields</h5>
                    </Col>
                    <Col className='d-flex'>
                        <div className="ml-auto">
                            <Button size="sm" variant="primary" onClick={() => setShowPreview(true)}>Form Preview</Button>
                            <Button size="sm" className='ml-1' onClick={() => setShowForm(true)}>
                                Add Field
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                <ErrorBoundary>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {oldData && oldData.map((dataField, index) => (
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
                                                                        {dataField?.type && Array.isArray(dataField.type) ? dataField?.type[0].label : dataField?.type}
                                                                    </Badge>
                                                                </div>
                                                            </Col>
                                                            <Col className='d-flex'>
                                                                <div className='ml-auto'>
                                                                    {/* <MuiTooltip title="Edit (Disabled)">
                                                                        <Button
                                                                            size="sm"
                                                                            className="btn-outline-warning float-end mx-1 disabled"
                                                                            variant="light"
                                                                            onClick={() => editFieldHandler(dataField)}
                                                                            {...{ component: "div", onClick: undefined }}
                                                                        >
                                                                            <PencilFill size={20} />
                                                                        </Button>
                                                                    </MuiTooltip> */}
                                                                    <MuiTooltip title="Delete">
                                                                        <Button size="sm" className="btn-outline-danger float-end" variant="light" onClick={() => setShowDelete(dataField)}>
                                                                            <TrashFill size={20} />
                                                                        </Button>
                                                                    </MuiTooltip>
                                                                </div>
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
                </ErrorBoundary>
            </Card.Body>
        </Card>
        {/* Add Fields */}
        {!!showForm && (<>
            <ModalReactstrap
                show={true}
                // scrollable={true}
                backdrop="static"
                toggle={handleCloseForm}
                size="lg"
                header={isEditFlag ? "Edit Field" : "Add Field"}
                body={<>
                    <FormProvider {...formContext}>
                        <Form onSubmit={handleSubmit(submitHandler)}>
                            {/* name & label */}
                            <Row>
                                {/* <Col md={6}>
                                    <Input
                                        label="Field Name"
                                        name="name"
                                        value=""
                                        valueKey="name"
                                        type="text"
                                        isEditable={isEditFlag ? false : true}
                                        validationType="string"
                                        validations={[{
                                            type: "required",
                                            params: ["Field Name is required!"],
                                        }]}
                                        isRequired={true}
                                    />
                                </Col> */}
                                <Col md={6}>
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
                                {/* valueKey & field type */}
                                {/* <Col md={6}>
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
                                </Col> */}
                                <Col md={6}>
                                    <Select
                                        label="Field Type"
                                        name="type"
                                        value={[]}
                                        valueKey="type"
                                        type="select"
                                        isEditable={true}
                                        optionKey={{ url: "", method: "", payload: {} }}
                                        options={FIELD_TYPES_OPTIONS}
                                        menuPlacement="bottom"
                                        validationType="array"
                                        validations={[
                                            { type: "min", params: [1, "Coutry is required!"] },
                                        ]}
                                        pluginConfiguration={{ isMulti: false }}
                                        isRequired={true}
                                        onChange={clearPreviousValues}
                                    />
                                </Col>
                            </Row>
                            {/* value & disable */}
                            <Row>
                                <Col>
                                    <DefaultValuefield type={valTypeChange} formContext={formContext} />
                                </Col>
                                {/* Disable */}
                                {/* <Col>
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
                                </Col> */}
                            </Row>
                            <TypeBasedFields type={valTypeChange} formContext={formContext} />
                            {/* plugin configs, optionKey & options */}
                            <Row>
                                {(valTypeChange === "select" || valTypeChange === "radio" || valTypeChange === "checkbox") && (
                                    <Col>
                                        {/* <Radio
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
                                                { value: "url", label: "API call", disabled: true },
                                                { value: "static", label: "Mannually", disabled: false },
                                            ]}
                                            isEditable={true}
                                            validationType="string"
                                            validations={[]}
                                            isRequired={true}
                                            onChange={(e) => (e.target.value === "static" ? setValue("options", [{ label: "", value: "" }]) : setValue("options", []))}
                                        /> */}
                                        {/* {opChoice === "url" && (
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
                                        )} */}
                                        {opChoice === "static" && (<>
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
                                                            upsideError={true}
                                                        />
                                                    </Col>
                                                    {/* <Col md={5}>
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
                                                    </Col> */}
                                                    {getValues("options").length > 1 && (
                                                        <div className="d-flex align-items-end mb-2">
                                                            <Button variant="danger" type="button" onClick={() => remove(index)}>
                                                                <X size={20} />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Row>
                                            ))}
                                            <Row>
                                                <Col>
                                                    <Button type="button" className="mb-3" onClick={() => append({ label: "", value: "" })}>
                                                        Add Option
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </>
                                        )}
                                    </Col>
                                )}
                            </Row>
                            {/* validation type (auto filled) */}
                            <Row className='d-none'>
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
                            {/* <Row>
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
                        )} */}
                            <Button type="submit">Submit</Button>
                        </Form>
                    </FormProvider>
                </>}
            />
        </>
        )}
        {/* Delete Fields */}
        {!!showDelete && (<>
            <div className="backdrop backdrop-visible" />
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
        </>)}
        {/* <CodeSnippetCard /> */}
    </>
    )
}
export default CustomForm;
