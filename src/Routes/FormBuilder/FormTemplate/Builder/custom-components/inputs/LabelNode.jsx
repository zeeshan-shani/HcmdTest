import React, { memo } from 'react';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';
import { useHover } from 'react-use';
import ActionController from '../ActionController';

export default memo((props) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const { selected, setInputField, rendered = false, id, output } = props; // data
    const node = getNode(id);
    const { data: nodeData } = node;

    const element = (hovered) => {
        return (
            <div className={`m-1 cstm-field-edit-border cstm-form-input-field ${(hovered && !rendered) ? "hovered" : ""}`}>
                {!rendered &&
                    <ActionController show={true} setNodes={setNodes} setInputField={setInputField} nodeId={id} />}
                {!rendered &&
                    <NodeResizer
                        color="#ff0071"
                        isVisible={selected}
                        minWidth={100}
                        minHeight={57} />}
                <div className="form-inline p-1">
                    <div className="input-group theme-border w-100">
                        <div dangerouslySetInnerHTML={{ __html: props.data.value || "Unknown label" }} />
                    </div>
                </div>
            </div>
        )
    };
    const [hoverable, hovered] = useHover(element);

    if (output && node.output?.hasOwnProperty("visibility") && !node.output.visibility) return;
    if (!output && !!nodeData?.onlyOutput?.length) return;

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