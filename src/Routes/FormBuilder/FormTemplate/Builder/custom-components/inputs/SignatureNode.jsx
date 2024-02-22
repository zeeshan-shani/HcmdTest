import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';
import { useHover } from 'react-use';
import ActionController from '../ActionController';
import SignatureCanvas from 'react-signature-canvas';
import { Form } from 'react-bootstrap';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Replay } from '@mui/icons-material';

export default memo((props) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const { selected, setInputField, id, rendered = false, output } = props; // data,

    const sigRef = useRef();
    const node = getNode(id);
    const { data: nodeData } = node;
    const [signature, setSignature] = useState(nodeData.value || null);
    const handleSignatureEnd = useCallback(() => {
        setSignature(sigRef.current.toDataURL());
    }, []);

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

    const onClear = useCallback(() => {
        sigRef.current.clear();
        setSignature(null);
    }, []);

    useEffect(() => {
        if (!rendered) return;
        onChangeValueNode(signature);
        //eslint-disable-next-line
    }, [signature, rendered]);

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
                <div className="form-inline p-2">
                    <Form.Label>{nodeData.label || ""}</Form.Label>
                    <div className={`input-group theme-border w-100 signature-wrapper position-relative`}>
                        {rendered ?
                            <div className='signature' >
                                <SignatureCanvas
                                    penColor="green"
                                    ref={sigRef}
                                    canvasProps={{ className: 'bg-light-color' }}
                                    onEnd={handleSignatureEnd}
                                />
                            </div> :
                            <div className='bg-light-color' style={{ height: "140px", width: "100%", minWidth: "300px" }}>
                            </div>}
                        <div className='position-absolute' style={{ right: 0, bottom: "100%" }}>
                            <MuiActionButton Icon={Replay} size="medium" onClick={onClear} />
                        </div>
                    </div>
                    <Form.Text>{nodeData.description || ""}</Form.Text>
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