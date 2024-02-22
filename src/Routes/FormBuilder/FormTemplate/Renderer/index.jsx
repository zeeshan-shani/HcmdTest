import React, { lazy, useMemo } from 'react'
import { Card, Col, Row } from 'react-bootstrap';
import { LazyComponent } from 'redux/common';
import { ReactComponent as BlocksLoader } from "assets/media/BlocksLoader.svg";
import ErrorBoundary from 'Components/ErrorBoundry';
const FormRenderer = lazy(() => import('Routes/FormBuilder/FormTemplate/Renderer/FormRenderer'));

const formDefinition = { components: [] };

export default function Renderer({ jsonSchema, state, fetchingForm }) {

    const blockLoader = useMemo(() => (
        <div className='d-flex flex-column justify-content-center'>
            <BlocksLoader height={"100px"} />
            <p className='text-center text-muted'>Building Form...</p>
        </div>
    ), []);

    return (
        <Row>
            <Col md={8}>
                <Card className='p-2 bg-light'>
                    <h5>{state.tabData.formData.title || 'Rendered Form'}</h5>
                    <ErrorBoundary>
                        <LazyComponent fallback={blockLoader}>
                            {fetchingForm ?
                                blockLoader :
                                <FormRenderer
                                    form={jsonSchema || formDefinition}
                                // onSubmit={console.log}
                                />
                            }
                        </LazyComponent>
                    </ErrorBoundary>
                </Card>
            </Col>
        </Row>
    )
}
