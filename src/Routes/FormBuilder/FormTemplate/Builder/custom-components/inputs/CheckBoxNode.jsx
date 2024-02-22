import React, { memo, useCallback, useEffect, useState } from 'react';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';
import { useHover } from 'react-use';
import ActionController from '../ActionController';
import { Form } from 'react-bootstrap';

export default memo((props) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const { selected, setInputField, rendered = false, id, output } = props; // data
    const [checked, setChecked] = useState([]);
    const node = getNode(id);
    const { data: nodeData } = node;

    const onChangeValueNode = useCallback((checked) => {
        if (!rendered) return;
        setNodes(
            nodes.map((node) => {
                if (node.id === id)
                    node.data = { ...node.data, value: checked };
                return node;
            })
        );
    }, [id, setNodes, nodes, rendered]);

    useEffect(() => {
        if (!rendered) return;
        onChangeValueNode(checked);
        //eslint-disable-next-line
    }, [checked]);

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
                <div className="form-inline p-1">
                    <div className="text-left">
                        <Form.Label>{nodeData?.label}</Form.Label>
                        {nodeData?.options && !!nodeData.options.length ?
                            nodeData?.options?.map((op, index) => (
                                <Form.Check
                                    type={"checkbox"}
                                    inline
                                    // {...nodeData}
                                    key={op.value}
                                    id={`${props.id}-${index}`}
                                    name={id}
                                    label={op.label}
                                    className={`d-flex justify-content-start gap-10`}
                                    // value={op.value}
                                    checked={checked.includes(op.value)}
                                    disabled={!!nodeData?.isEditable?.length && (nodeData?.isEditable[0]) === "false"}
                                    // checked={Array.isArray(value) ? value?.includes(op.value) : value}
                                    onChange={(e) => {
                                        if (e.target.checked) setChecked(prev => [...prev, op.value])
                                        else if (!e.target.checked) setChecked(prev => prev.filter(i => i !== op.value))
                                    }}
                                />
                            )) :
                            <Form.Text as={"p"} className="text-muted">
                                No options
                            </Form.Text>
                        }
                        {/* {!!error && <Form.Text className={`text-danger ${customClasses.error}`}>{error.message}</Form.Text>} */}
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