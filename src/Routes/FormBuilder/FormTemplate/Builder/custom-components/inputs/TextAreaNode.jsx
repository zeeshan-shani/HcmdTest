import React, { memo, useCallback, useEffect, useState } from 'react';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';
import { useHover } from 'react-use';
import ActionController from '../ActionController';
import { Form, InputGroup } from 'react-bootstrap';
import useDebounce from 'services/hooks/useDebounce';
import { calculateByExpression } from 'Routes/FormBuilder/FormTemplate/Renderer/FormRenderer';
import { isStringNumeric } from 'services/helper';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Calculate } from '@mui/icons-material';
import { showError } from 'utils/package_config/toast';

export default memo((props) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const { selected, setInputField, customClasses = {}, rendered = false, id, output } = props;
    const node = getNode(id);
    const { data: nodeData } = node;
    const [value, setValue] = useState(nodeData.value || "");
    const textValue = useDebounce(value, 500);

    const onChangeValueNode = useCallback((textValue) => {
        if (!rendered) return;
        setNodes(
            nodes.map((node) => {
                if (node.id === id)
                    node.data = { ...node.data, value: textValue, };
                return node;
            })
        );
    }, [id, setNodes, nodes, rendered]);

    useEffect(() => {
        if (!rendered) return;
        onChangeValueNode(textValue);
        //eslint-disable-next-line
    }, [textValue, rendered]);

    const getCalculatedValue = useCallback(() => {
        const expression = nodeData.calculated;
        try {
            let { value, isNull } = calculateByExpression({ expression, nodes });
            if (value && !isNull) {
                if (isStringNumeric(value)) value = `${Number(value).toFixed(2)}`
                setValue(value);
            }
        } catch (error) {
            showError(`There is an error occured while calculating the value. Check the given expression: ${expression}`)
            console.error(error);
        }
    }, [nodes, nodeData]);

    const element = (hovered) => {
        return (
            <div className={`m-1 cstm-field-edit-border cstm-form-input-field ${hovered && !rendered ? "hovered" : ""}`}>
                {!rendered && <ActionController show={true} nodeId={id} setNodes={setNodes} setInputField={setInputField} />}
                {!rendered &&
                    <NodeResizer
                        color="#ff0071"
                        isVisible={selected}
                        minWidth={100}
                        minHeight={57} />}
                <div className="form-inline">
                    <div className='text-left w-100 p-1'>
                        {nodeData?.label !== "" && (
                            <Form.Label className={`${customClasses.label} d-flex justify-content-start mb-1`}>
                                {nodeData?.label}
                                {nodeData?.isRequired && <span className="small text-danger">*</span>}
                            </Form.Label>
                        )}
                        <InputGroup className="mb-0 d-flex">
                            {nodeData?.prefix && <InputGroup.Text id={`${nodeData.id}-prefix`}>{nodeData.prefix}</InputGroup.Text>}
                            <Form.Control
                                value={value || ""}
                                as={"textarea"}
                                placeholder={nodeData.placeholder ? nodeData.placeholder : nodeData.label}
                                className={`form-control`}
                                disabled={!!nodeData?.isEditable?.length && (nodeData?.isEditable[0]) === "false"}
                                autoComplete={nodeData?.autoComplete ? nodeData?.autoComplete : undefined}
                                autoFocus={!!nodeData?.autoFocus?.length && Boolean(nodeData?.autoFocus[0])}
                                defaultValue={nodeData?.defaultValue ? nodeData?.defaultValue : undefined}
                                onChange={(e) => {
                                    if (nodeData?.isEditable === false) return;
                                    else setValue(e.target.value);
                                }}
                            />
                            {nodeData?.suffix && <InputGroup.Text id={`${id}-suffix`}>{nodeData.suffix}</InputGroup.Text>}
                            {nodeData.calculated && rendered &&
                                <MuiActionButton Icon={Calculate} onClick={getCalculatedValue} tooltip="Calculate value" />
                            }
                        </InputGroup>

                        {nodeData?.description &&
                            <Form.Text id={`${id}-description`}>
                                {nodeData?.description}
                            </Form.Text>}
                        {nodeData?.error &&
                            <Form.Text id={`${id}-error`}>
                                {nodeData?.error}
                            </Form.Text>}
                    </div>
                </div>
            </div>
        )
    };
    const [hoverable, hovered] = useHover(element);

    if (output && node.output?.hasOwnProperty("visibility") && !node.output.visibility) return;

    if (nodeData.conditional && rendered) {
        const dependantValue = !!nodes?.length && nodeData?.conditional?.when && nodes?.find(nd => nd.id === nodeData.conditional.when)?.data?.value;
        if ((nodeData.conditional.show === "true" && dependantValue !== nodeData?.conditional?.eq) ||
            (nodeData.conditional.show === "false" && dependantValue === nodeData?.conditional?.eq)) {
            return <div></div>
        }
    }

    return (
        <div className={`${hovered ? "" : ""}`}>
            {hoverable}
        </div>
    );
});

// export default memo(({ data, isConnectable }) => {
//     return (<>
//         <div>
//             Custom Color Picker Node: <strong>{data.color}</strong>
//         </div>
//         <input className="nodrag" type="color" onChange={data.onChange} defaultValue={data.color} />
//     </>);
// });