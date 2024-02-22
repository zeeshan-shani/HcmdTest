import React, { lazy, useCallback, useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap';
import { LazyComponent } from 'redux/common';
import ErrorBoundary from 'Components/ErrorBoundry';
import { ReactComponent as BlocksLoader } from "assets/media/BlocksLoader.svg";
import Sidebar from './Sidebar';
import { ReactFlowProvider } from 'reactflow';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { MuiTooltip } from 'Components/components';
import Properties from '../Builder/FieldProperties';
const FormRenderer = lazy(() => import('Routes/FormBuilder/FormTemplate/FormOutput/FormRenderer'));

const formDefinition = { components: [] };

export default function FormOutput({ jsonSchema, state, fetchingForm, setSchema }) {
    const [selectedNode, setSelectedNode] = useState();

    const onFormChange = useCallback((schema, jsonSchema) => {
        const oldComponents = jsonSchema.components;
        const components = schema.components
            // .filter(item => oldComponents.find(comp => comp.id === item.id))
            .map((item) => {
                // const node = getNode(item.id);
                const comp = oldComponents.find(comp => comp.id === item.id);
                let body = {
                    ...item,
                    output: { ...item.output, }
                }
                if (comp) body.output = { ...body.output, ...comp.output, }
                body.output.position = item.position
                return body
            })
        setSchema({ ...schema, components });
    }, [setSchema]);

    const onDragStart = useCallback((event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    return (
        <ReactFlowProvider>
            <Row>
                <Col md={8}>
                    <Card className='p-2 bg-light'>
                        <Card.Header className='d-flex justify-content-between align-items-center'>
                            <h5 className='mb-0'>{state.tabData.formData.title || 'Rendered Form'}</h5>
                            <MuiTooltip title="Drag label">
                                <Button
                                    className="btn btn-secondary formcomponent drag-copy"
                                    onDragStart={(event) => onDragStart(event, "LabelNode")}
                                    draggable
                                    size='sm'
                                >
                                    <TextFieldsIcon />
                                </Button>
                            </MuiTooltip>
                        </Card.Header>
                        <ErrorBoundary>
                            <LazyComponent fallback={blockLoader}>
                                {fetchingForm ?
                                    blockLoader :
                                    <FormRenderer
                                        form={jsonSchema || formDefinition}
                                        selectedNode={selectedNode}
                                        setSelectedNode={setSelectedNode}
                                        onChange={onFormChange}
                                    // onSubmit={console.log}
                                    />
                                }
                            </LazyComponent>
                        </ErrorBoundary>
                    </Card>
                </Col>
                <Col md={4} className="d-flex flex-column gap-10">
                    {selectedNode?.type === "LabelNode" &&
                        <Properties
                            key={selectedNode?.id}
                            field={selectedNode}
                            setField={setSelectedNode}
                            output
                        />}
                    <Sidebar
                        jsonSchema={jsonSchema}
                    />
                </Col>
            </Row>
        </ReactFlowProvider>
    )
}

export const blockLoader = (
    <div className='d-flex flex-column justify-content-center'>
        <BlocksLoader height={"100px"} />
        <p className='text-center text-muted'>Building Form...</p>
    </div>
);