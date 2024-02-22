import React from "react";
import { Form } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";
import { LazyComponent } from "redux/common";
import MyCkEditor from "Routes/KnowledgeBase/MyCkEditor";
import { FRAMEWORK_TYPES } from "../../Utils/constants";

const CkEditor = ({
    label = "",
    placeholder = "",
    name,
    isEditable = true,
    autoFocus = false,
    isRequired = false,
    autoComplete,
    onChange: changeHandler = () => { },
    note = "",
    defaultValue = "",
    classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
    framework = FRAMEWORK_TYPES.react_bs,
    pluginConfiguration: config = { viewable: false },
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
                render={({ field, fieldState: { error } }) => (<>
                    <LazyComponent>
                        <MyCkEditor
                            name={name}
                            value={field.value ?? ''}
                            onChange={data => {
                                field.onChange(data);
                                changeHandler(data);
                            }}
                            module="form-builder"
                            placeHolder={placeholder} />
                        {!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>}
                    </LazyComponent>
                    {/* {upsideError && !!error && <Form.Text className={`text-danger ${customClasses.error} mt-0`}>{error.message}</Form.Text>} */}
                    {/* {config.viewable && inputType === "password" ?
						<InputGroup>
							<CustomController field={field} />
							{config.viewable &&
								<InputGroup.Text onClick={() => setShowPassword(prev => !prev)}>
									{showPassword ? <VisibilityOff /> : <Visibility />}
								</InputGroup.Text>}
						</InputGroup>
						:
						<CustomController field={field} />
					} */}
                </>
                )}
            />
            {note !== "" && <Form.Text>&nbsp;{`(${note})`}</Form.Text>}
        </Form.Group>
    );
};

export default CkEditor;
