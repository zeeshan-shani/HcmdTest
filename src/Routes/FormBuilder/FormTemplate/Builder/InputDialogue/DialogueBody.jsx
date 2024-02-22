import React, { useMemo, useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import GenerateField from './GenerateField';
import inputDialogueTabs from './tabs'

export default function DialogueBody({ editField }) {
    const [activeTab, setActiveTab] = useState("display");

    const fieldJsonEditor = useMemo(() => {
        return (
            <Card>
                <Card.Header className='pb-0 px-0'>
                    <nav className='task-nav'>
                        <div className="nav nav-tabs px-2" id="nav-tab" role="tablist">
                            {inputDialogueTabs.components.map((tab) => (
                                <button className={`nav-link ${tab.key === activeTab ? 'active' : ''}`} type="button" role="tab" onClick={() => setActiveTab(tab.key)}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </nav>
                </Card.Header>
                <Card.Body>
                    {inputDialogueTabs.components.find(i => i.key === activeTab)?.components.map((comp) => (
                        <GenerateField component={comp} />
                    ))}
                </Card.Body>
            </Card>
        )
    }, [activeTab]);

    const fieldPreviewer = useMemo(() => {
        return (
            <div>
                <Card>
                    <Card.Header>
                        <h5 className='mb-0'>Preview</h5>
                    </Card.Header>
                    <Card.Body>

                    </Card.Body>
                </Card>
                <div className="buttons d-flex gap-10 my-2">
                    <Button variant='success'>Save</Button>
                    <Button variant='secondary'>Cancel</Button>
                    <Button variant='danger'>Remove</Button>
                </div>
            </div>)
    }, []);

    return (
        <Row>
            <Col sm={12} md={6}>
                {fieldJsonEditor}
            </Col>
            <Col sm={12} md={6}>
                {fieldPreviewer}
            </Col>
        </Row>
    )
}
