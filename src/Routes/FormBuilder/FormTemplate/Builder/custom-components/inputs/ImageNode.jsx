import React, { memo, useCallback } from 'react';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';
import { useHover } from 'react-use';
import ActionController from '../ActionController';
import { getImageURL } from 'redux/common';

export default memo((props) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const { selected, setInputField, rendered = false, id, output } = props;
    const node = getNode(id);
    const { data: nodeData } = node;
    // const [imageMethod] = useState((nodeData?.method[0] && nodeData?.method[0].value) || "static");
    // const [value, setValue] = useState(nodeData.value || "");
    // const textValue = useDebounce(value, 500);

    // const onChangeValueNode = useCallback((textValue) => {
    //     if (!rendered) return;
    //     setNodes(
    //         nodes.map((node) => {
    //             if (node.id === id) node.data = { ...node.data, value: textValue };
    //             return node;
    //         })
    //     );
    // }, [id, setNodes, nodes, rendered]);

    // useEffect(() => {
    //     if (!rendered) return;
    //     onChangeValueNode(textValue);
    //     // eslint-disable-next-line
    // }, [textValue, rendered]);

    const onResizeNode = useCallback((e, { height, width }) => {
        setNodes(
            nodes.map((node) => {
                if (node.id === id) node.data = { ...node.data, style: { height, width } };
                return node;
            })
        );
    }, [id, nodes, setNodes]);

    const element = (hovered) => {
        return (
            <div className={`cstm-field-edit-border cstm-form-input-field m-1 ${hovered && !rendered ? "hovered" : ""}`} style={nodeData.style}>
                {!rendered && <ActionController show={true} nodeId={id} setNodes={setNodes} setInputField={setInputField} />}
                {!rendered &&
                    <NodeResizer
                        color="#ff0071"
                        isVisible={selected}
                        onResizeEnd={onResizeNode}
                        minWidth={100}
                        minHeight={57} />}
                <div className='overflow-hidden'
                    // style={{ height: nodeData.height, width: nodeData.width }}
                    style={nodeData.style}
                >
                    {/* Sample text */}
                    {/* {imageMethod === "static" && */}
                    <img
                        // `${nodeData.style.width}x${nodeData.style.height}`
                        src={getImageURL(nodeData.imageURL)}
                        // className="w-100"
                        style={nodeData.style}
                        alt="" />
                    {/* } */}
                </div>
            </div>
        )
    };
    const [hoverable, hovered] = useHover(element);

    if (output && node.output?.hasOwnProperty("visibility") && !node.output.visibility) return;

    if (nodeData.conditional && rendered) {
        const dependantValue = !!nodes?.length && nodeData?.conditional?.when &&
            nodes?.find(nd => nd.id === nodeData.conditional.when)?.data?.value;
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