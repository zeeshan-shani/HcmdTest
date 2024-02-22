import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
    ReactFlowProvider,
    useNodesState,
    Controls,
    Background,
} from 'reactflow';
import Sidebar from './custom-components/Sidebar';
import { buildInputNode } from './Services/NodeBuilder';
import useDebounce from 'services/hooks/useDebounce';

// Custom Inputs components
import TextAreaNode from './custom-components/inputs/TextAreaNode';
import TextField from './custom-components/inputs/TextField';
import NumberNode from './custom-components/inputs/NumberNode';
import LabelNode from './custom-components/inputs/LabelNode';
import ButtonNode from './custom-components/inputs/ButtonNode';
import PasswordNode from './custom-components/inputs/PasswordNode';
import SelectNode from './custom-components/inputs/SelectNode';
import RadioNode from './custom-components/inputs/RadioNode';
import CheckBoxNode from './custom-components/inputs/CheckBoxNode';
import DateTimeNode from './custom-components/inputs/DateTimeNode';
import SignatureNode from './custom-components/inputs/SignatureNode';
import ImageNode from './custom-components/inputs/ImageNode';
import InputDialogue from './InputDialogue';
import { Col, Row } from 'react-bootstrap';
import Properties from './FieldProperties';
import { dispatch } from 'redux/store';
import { MODEL_CONST } from 'redux/constants/modelConstants';
import { useSelector } from 'react-redux';
import { showError, showSuccess } from 'utils/package_config/toast';

export default function FormBuilder({ onChange, form, setState }) {
    const reactFlowWrapper = useRef(null);
    const { form_builder_field } = useSelector(state => state.model);
    const initialNodes = JSON.parse(localStorage.getItem('formNodes')) || [];
    const [nodes, setNodes, onNodesChange] = useNodesState(form?.components || initialNodes); // 
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [editingInputField, setInputField] = useState();
    const [selectedNode, setSelectedNode] = useState();
    const bouncedNodes = useDebounce(nodes, 500);

    useEffect(() => {
        if (!!bouncedNodes?.length)
            // localStorage.setItem("formNodes", JSON.stringify(bouncedNodes));
            localStorage.setItem("formNodes", JSON.stringify([]));
        onChange({ components: bouncedNodes })
    }, [bouncedNodes, onChange]);

    useEffect(() => {
        const formNodes = form?.components && form.components.map((node) => {
            return buildInputNode({
                id: node.id,
                type: node.type,
                position: node.position,
                output: node.output,
                nodeData: node.data,
                style: node.style
            })
        });
        setNodes(formNodes || initialNodes); // 
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

    const onCopyNode = useCallback(async () => {
        if (!selectedNode) return showError("Please select item to copy", { id: "form_builder_error" })
        dispatch({ type: MODEL_CONST.FORM_BUILDER_CLIPBOARD_FIELD, payload: { form_builder_field: selectedNode } })
        showSuccess("Field Copied to board", { id: "form_builder_copy" });
    }, [selectedNode]);

    const onPasteNode = useCallback(() => {
        if (!form_builder_field) return showError("No item found on board", { id: "form_builder_error" })
        const POSITION_VAR = 25;
        let field = form_builder_field;
        field.id = `dndnode_${Date.now()}`
        field.name = ""
        field.position = {
            x: form_builder_field.position.x + POSITION_VAR,
            y: form_builder_field.position.y - POSITION_VAR,
        };
        field.selected = false;
        field.positionAbsolute = field.position;
        setNodes(prev => [...prev, field]);
        dispatch({ type: MODEL_CONST.FORM_BUILDER_CLIPBOARD_FIELD, payload: { form_builder_field: null } });
        showSuccess("Field Pasted to board", { id: "form_builder_paste" });
    }, [form_builder_field, setNodes]);

    const onCutNode = useCallback(async () => {
        if (!selectedNode) return showError("Please select item to cut", { id: "form_builder_error" })
        dispatch({ type: MODEL_CONST.FORM_BUILDER_CLIPBOARD_FIELD, payload: { form_builder_field: selectedNode } })
        showSuccess("Field Cut from board", { id: "form_builder_cut" });
        setNodes(nd => nd.filter(i => i.id !== selectedNode.id));
    }, [selectedNode, setNodes]);

    const onCancelNode = useCallback(() => {
        if (!form_builder_field) return;
        setSelectedNode();
        dispatch({ type: MODEL_CONST.FORM_BUILDER_CLIPBOARD_FIELD, payload: { form_builder_field: null } })
        showSuccess("Field Removed", { id: "form_builder_cancel" });
    }, [form_builder_field]);

    const nodeTypes = useMemo(() => {
        return {
            LabelNode: props => <LabelNode {...props} setInputField={setInputField} />,
            TextFieldNode: props => <TextField {...props} setInputField={setInputField} />,
            TextAreaNode: props => <TextAreaNode {...props} setInputField={setInputField} />,
            NumberNode: props => <NumberNode {...props} setInputField={setInputField} />,
            ButtonNode: props => <ButtonNode {...props} setInputField={setInputField} />,
            PasswordNode: props => <PasswordNode {...props} setInputField={setInputField} />,
            SelectNode: props => <SelectNode {...props} setInputField={setInputField} />,
            RadioNode: props => <RadioNode {...props} setInputField={setInputField} />,
            CheckBoxNode: props => <CheckBoxNode {...props} setInputField={setInputField} />,
            DateTimeNode: props => <DateTimeNode {...props} setInputField={setInputField} />,
            SignatureNode: props => <SignatureNode {...props} setInputField={setInputField} />,
            ImageNode: props => <ImageNode {...props} setInputField={setInputField} />,
        }
    }, []);

    const { pageHeight = 0 } = useMemo(() => {
        let maxCoordinates = { pageHeight: 2000 }
        if (!!bouncedNodes?.length) {
            const ymin = Math.min(...bouncedNodes.map(i => i.position.y)) || 2000;
            const ymax = Math.max(...bouncedNodes.map(i => i.position.y)) || 2000;
            maxCoordinates = { pageHeight: Number((ymax - ymin).toFixed(0)) + 1000 }
        }
        return maxCoordinates;
    }, [bouncedNodes]);

    return (<>
        <div className="hcmd-form-builder">
            <Sidebar
                onCopyNode={onCopyNode}
                onPasteNode={onPasteNode}
                onCutNode={onCutNode}
                onCancelNode={onCancelNode}
            />
            <ReactFlowProvider>
                <Row>
                    <Col md={8} className="d-flex justify-content-center">
                        <div className="form-canvas dndflow" style={{ height: "85vh", maxWidth: 1200 }}>
                            {/* <Sidebar /> */}
                            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                                <ReactFlow
                                    nodes={nodes.filter(i => !i?.data?.onlyOutput?.length)}
                                    // nodes={nodes}
                                    onNodesChange={onNodesChange}
                                    onInit={setReactFlowInstance}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    nodeTypes={nodeTypes}
                                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                                    // fitView
                                    selectNodesOnDrag
                                    draggable={false}
                                    zoomOnScroll={false}
                                    zoomOnPinch={false}
                                    zoomOnDoubleClick={false}
                                    panOnDrag={false}
                                    panOnScroll={true}
                                    panOnScrollMode={"free"}
                                    selectionOnDrag={true}
                                    onSelectionChange={({ nodes }) =>
                                        setSelectedNode(!!nodes.length ? nodes[0] : null)}
                                    // style={{ overflow: "none" }}
                                    style={{ background: '#fff' }}
                                    // onSelect={e => console.log('e', e)}
                                    // nodesDraggable={false}
                                    // nodesFocusable={false}
                                    // edges={edges}
                                    // onEdgesChange={onEdgesChange}
                                    // onConnect={onConnect}
                                    // snapToGrid={true}
                                    // snapGrid={snapGrid}
                                    translateExtent={[[0, 0], [1200, pageHeight]]}
                                >
                                    <Controls
                                        showZoom={false}
                                        showFitView={false}
                                    />
                                    <Background color="#aaa" gap={16} />
                                </ReactFlow>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <Properties
                            key={selectedNode?.id}
                            field={selectedNode}
                            setField={setSelectedNode}
                            setNodes={setNodes}
                            setState={setState}
                        />
                    </Col>
                </Row>
            </ReactFlowProvider>
            {<InputDialogue
                editingInputField={editingInputField}
                setInputField={setInputField} />}
        </div>
    </>)
}