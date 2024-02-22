import React, { useCallback, useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap';
import PageHeader from 'Routes/SuperAdmin/components/PageHeader';
import TreeViewTabs from './TreeViewTabs';
import TabData from './TabData';
import ErrorBoundary from 'Components/ErrorBoundry';

const defaultState = {
    addNewTemplate: false,
    groups: [],
    tabData: null,
}

export default function HCMDFormBuilder() {
    const [state, setState] = useState(defaultState);

    const addNewTab = useCallback((update) => setState(prev => ({ ...prev, addNewTemplate: true, updateTab: update })), []);

    const closeModals = useCallback(() => setState(prev => ({ ...prev, addNewTemplate: false, addNewForm: false })), []);

    const options = useMemo(() => (
        <ul className="list-inline mb-0 d-flex">
            {/* <li>
                <Button size='sm' variant='secondary' onClick={() => addNewForm()}>
                    Add tab
                </Button>
            </li> */}
        </ul>
    ), []);

    const templateStarter = useMemo(() => (
        <div className="d-flex flex-column justify-content-center text-center h-100">
            <div className="container">
                <h5 className='username-text'>Template Forms</h5>
                <p className="text-muted">Please select a tab to start using forms.</p>
                <button className="btn btn-outline-primary no-box-shadow" onClick={() => addNewTab()}>
                    Create Tab
                </button>
            </div>
        </div>
    ), [addNewTab]);

    return (
        <div className="super-admin super-admin-list p-2 col vh-100 overflow-auto prevent-overscroll-reload">
            <PageHeader title='Templates' options={options} />
            <Row style={{ height: 'calc(100vh - 85px)' }}>
                <Col md={2}>
                    <TreeViewTabs state={state} setState={setState} addNewForm={addNewTab} closeModals={closeModals} />
                </Col>
                <Col md={10}>
                    <ErrorBoundary>
                        {state.tabData ?
                            <TabData state={state} setState={setState} addNewTab={addNewTab} closeModals={closeModals} />
                            :
                            templateStarter
                        }
                    </ErrorBoundary>
                </Col>
            </Row>
        </div>
    )
}
