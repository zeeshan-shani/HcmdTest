import React, { memo, useCallback, useEffect, useState } from 'react';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';
import { useHover } from 'react-use';
import ActionController from '../ActionController';
import ReactSelect from 'react-select';
import { Form } from 'react-bootstrap';
export default memo((props) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const { selected, setInputField, id, rendered = false, output } = props; // data
    const node = getNode(id);
    const { data: nodeData } = node;
    const [value, setValue] = useState(nodeData.value || []);

    const onChangeValueNode = useCallback((textValue) => {
        if (!rendered) return;
        setNodes(
            nodes.map((node) => {
                if (node.id === id) {
                    node.data = { ...node.data, value: textValue, };
                }
                return node;
            })
        );
    }, [id, setNodes, nodes, rendered]);

    useEffect(() => {
        if (!rendered) return;
        onChangeValueNode(value);
        //eslint-disable-next-line
    }, [value, rendered]);

    const element = (hovered) => {
        return (
            <div className={`m-1 cstm-field-edit-border cstm-form-input-field ${hovered && !rendered ? "hovered" : ""}`}>
                {!rendered && <ActionController show={true} nodeId={id} setNodes={setNodes} setInputField={setInputField} />}
                {!rendered &&
                    <NodeResizer
                        color="#ff0071"
                        isVisible={selected}
                        minWidth={185}
                        minHeight={57} />}
                <div className="form-inline">
                    <div className="input-group theme-border w-100 p-1">
                        <Form.Label>{nodeData?.label}</Form.Label>
                        <ReactSelect
                            value={[value]}
                            classNamePrefix="select"
                            placeholder="Select Options"
                            className={"min-width-160 w-100"}
                            name={nodeData.name}
                            options={nodeData?.options || []}
                            onChange={(item) => setValue(item)}
                            isClearable={true}
                        />
                        {nodeData?.description &&
                            <Form.Text>{nodeData?.description}</Form.Text>}
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