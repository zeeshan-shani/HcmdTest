import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlow, useNodesState } from 'reactflow'
import { isStringNumeric } from 'services/helper';
import useDebounce from 'services/hooks/useDebounce';
import ButtonNode from '../Builder/custom-components/inputs/ButtonNode';
import CheckBoxNode from '../Builder/custom-components/inputs/CheckBoxNode';
import DateTimeNode from '../Builder/custom-components/inputs/DateTimeNode';
import ImageNode from '../Builder/custom-components/inputs/ImageNode';
import LabelNode from '../Builder/custom-components/inputs/LabelNode';
import NumberNode from '../Builder/custom-components/inputs/NumberNode';
import PasswordNode from '../Builder/custom-components/inputs/PasswordNode';
import RadioNode from '../Builder/custom-components/inputs/RadioNode';
import SelectNode from '../Builder/custom-components/inputs/SelectNode';
import SignatureNode from '../Builder/custom-components/inputs/SignatureNode';
import TextAreaNode from '../Builder/custom-components/inputs/TextAreaNode';
import TextField from '../Builder/custom-components/inputs/TextField';
import { buildInputNode } from '../Builder/Services/NodeBuilder';

export default function FormRenderer({
    onChange = () => { },
    form,
    height,
    setSelectedNode = () => { },
    rendered,
    nodeUpdateDelay = 500
}) {

    const reactFlowWrapper = useRef(null);
    const initialNodes = JSON.parse(localStorage.getItem('formNodes')) || [];
    const [nodes, setNodes, onNodesChange] = useNodesState(form.components || initialNodes);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const bouncedNodes = useDebounce(nodes, nodeUpdateDelay);

    useEffect(() => {
        if (!!bouncedNodes?.length)
            // localStorage.setItem("formNodes", JSON.stringify(bouncedNodes));
            localStorage.setItem("formNodes", JSON.stringify([]));
        onChange({ components: bouncedNodes }, form)
        //eslint-disable-next-line
    }, [bouncedNodes, onChange]);

    useEffect(() => {
        const formNodes = form.components && form.components.map((node) => {
            return buildInputNode({ id: node.id, type: node.type, position: node.position, nodeData: node.data })
        });
        setNodes(formNodes || initialNodes);
        //eslint-disable-next-line
    }, [setNodes]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) return;
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        let builtNode = buildInputNode({ type, position });
        setNodes((nds) => [...nds?.map((i => ({ ...i, selected: false })))].concat({ ...builtNode, selected: true }));
    }, [reactFlowInstance, setNodes]);

    const nodeTypes = useMemo(() => {
        return {
            LabelNode: props => <LabelNode {...props} output rendered={rendered} />,
            TextFieldNode: props => <TextField {...props} output rendered={rendered} />,
            TextAreaNode: props => <TextAreaNode {...props} output rendered={rendered} />,
            NumberNode: props => <NumberNode {...props} output rendered={rendered} />,
            ButtonNode: props => <ButtonNode {...props} output rendered={rendered} />,
            PasswordNode: props => <PasswordNode {...props} output rendered={rendered} />,
            SelectNode: props => <SelectNode {...props} output rendered={rendered} />,
            RadioNode: props => <RadioNode {...props} output rendered={rendered} />,
            CheckBoxNode: props => <CheckBoxNode {...props} output rendered={rendered} />,
            DateTimeNode: props => <DateTimeNode {...props} output rendered={rendered} />,
            ImageNode: props => <ImageNode {...props} output rendered={rendered} />,
            SignatureNode: props => <SignatureNode {...props} output rendered={rendered} />,
        }
    }, [rendered]);

    const { pageHeight = 0 } = useMemo(() => {
        let maxCoordinates = { pageHeight: 2000 }
        if (!!bouncedNodes?.length) {
            const ymin = Math.min(...bouncedNodes.map(i => i.position?.y)) || 2000;
            const ymax = Math.max(...bouncedNodes.map(i => i.position?.y)) || 2000;
            maxCoordinates = { pageHeight: Number((ymax - ymin).toFixed(0)) + 1000 }
        }
        return maxCoordinates;
    }, [bouncedNodes]);

    return (
        <div className="hcmd-form-builder">
            <div className="form-canvas dnddlow" style={{ height: height ? height : "85vh", maxWidth: 1200 }}>
                <div className="reactflow-wrapper h-100 bg-light" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        onNodesChange={onNodesChange}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        style={{ background: '#fff' }}
                        nodeTypes={nodeTypes}
                        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                        // ---------- For Render Only -----------
                        nodesDraggable={!rendered}
                        selectNodesOnDrag
                        nodesFocusable={true}
                        draggable={false}
                        zoomOnScroll={false}
                        zoomOnPinch={false}
                        zoomOnDoubleClick={false}
                        panOnDrag={false}
                        panOnScroll={true}
                        panOnScrollMode={"free"}
                        selectionOnDrag={true}
                        // proOptions={{ hideAttribution: true }}
                        // panOnScrollMode={"free"}
                        onSelectionChange={({ nodes }) =>
                            setSelectedNode(!!nodes.length ? nodes[0] : null)}
                        translateExtent={[[0, 0], [1200, pageHeight]]}
                    // zoomOnScroll={false}
                    // draggable={true}
                    // elementsSelectable={false}
                    // selectNodesOnDrag
                    // onSelect={e => console.log('e', e)}
                    // onSelectionChange={({ nodes }) => setSelectedNode(!!nodes.length ? nodes[0] : null)}
                    // nodesDraggable={false}
                    // edges={edges}
                    // onEdgesChange={onEdgesChange}
                    // onConnect={onConnect}
                    // snapToGrid={true}
                    // snapGrid={snapGrid}
                    >
                        {/* <Controls
                                showZoom={false}
                                showFitView={false}
                            /> */}
                    </ReactFlow>
                </div>
            </div>
        </div>
    )
}

export const calculateByExpression = ({ expression, nodes }) => {
    const variableNames = [...new Set(expression.match(/[a-zA-Z_]+/g))];
    let modifiedExp = expression, isAnyNull = false;
    if (!variableNames?.length) return;
    let fieldNameValues =
        variableNames.map((field) => {
            if (!field) return ({ name: field, value: "" });
            const findNodeData = nodes.find(nd => nd.data.name === field)?.data;
            if (!findNodeData || !findNodeData.value) return ({ name: field, value: "" });
            return ({ name: field, value: findNodeData.value });
        });

    for (const iterator of variableNames) {
        let findVal = fieldNameValues.find(j => j.name === iterator).value || "";
        findVal = findVal.trim();
        modifiedExp = modifiedExp.replaceAll(iterator, isStringNumeric(findVal) ? `${Number(findVal) || 0}` : `'${String(findVal) || ""}'`);
        if (!findVal) isAnyNull = true;
    }
    if (!isAnyNull) {
        let value = `${eval(modifiedExp)}` || ""; //eslint-disable-line
        if (isStringNumeric(value)) value = `${Number(value).toFixed(0)}`
        return { value, isNull: isAnyNull }
    }
    return { isNull: isAnyNull }
}