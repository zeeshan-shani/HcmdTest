import React, { useCallback, useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { MuiDeleteAction } from 'Components/MuiDataGrid';
// import Input from "Components/FormBuilder/Build/_common/FormGenerator/Components/Input";
import useDebounce from 'services/hooks/useDebounce';
import Input from 'Components/FormBuilder/components/Input';

export default function AddOptions({ options, setOptions }) {

    const append = (obj) => {
        let newArr = options;
        setOptions([...newArr, obj]);
    };

    const remove = (index) => {
        let newArr = options.filter((item, ind) => ind !== index);
        setOptions(newArr)
    };

    const onChangeOption = useCallback((index, updatedObj) => {
        options[index] = updatedObj;
        setOptions(options);
    }, [setOptions, options]);

    return (
        <div className='mb-2'>
            <h6 className='mb-1'>Add options:</h6>
            {options.map((item, index) => (
                <Row key={index}>
                    <OptionData item={item} index={index} onChangeOption={onChangeOption} />
                    <Col className="d-flex flex-column mb-3">
                        {options.length > 1 && (<>
                            <span className="mt-2">&nbsp;</span>
                            <MuiDeleteAction onClick={() => remove(index)} />
                        </>)}
                    </Col>
                </Row>
            ))}
            <Button type="button" size='sm' onClick={() => append({ label: "", value: "" })}>
                Add Option
            </Button>
        </div>
    )
}

const OptionData = ({ item, index, onChangeOption }) => {
    const [option, setOption] = useState(item);
    const optionLabel = useDebounce(option.label, 1000);
    const optionValue = useDebounce(option.value, 1000);

    useEffect(() => {
        onChangeOption(index, { label: optionLabel, value: optionValue })
    }, [optionLabel, optionValue, onChangeOption, index]);

    return (<>
        <Col md={5}>
            <Input
                Label="Label"
                name={`options.${index}.label`}
                value={option.label}
                valueKey={`options.${index}.label`}
                type="text"
                isEditable={true}
                validationType="string"
                isRequired={true}
                handleChange={e => setOption(prev => ({ ...prev, label: e.target.value }))}
            />
        </Col>
        <Col md={5}>
            <Input
                Label="Value"
                name={`options.${index}.value`}
                value={option.value}
                valueKey={`options.${index}.value`}
                type="text"
                isEditable={true}
                validationType="string"
                isRequired={true}
                handleChange={e => setOption(prev => ({ ...prev, value: e.target.value }))}
            />
        </Col>
    </>
    )
}