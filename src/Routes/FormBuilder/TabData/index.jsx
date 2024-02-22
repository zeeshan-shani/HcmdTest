import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ErrorBoundary from 'Components/ErrorBoundry'
import { MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid'
import { TakeConfirmation } from 'Components/components';
import NewFormModal from './NewFormModal';
import { Plus } from 'react-bootstrap-icons';
import FormTemplate from '../FormTemplate';
import templateGroupService from 'services/APIs/services/templateGroupService';
import templateTabService from 'services/APIs/services/templateTabService';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';

export default function TabData({ state, setState, addNewTab, closeModals }) {

    const [jsonSchema, setSchema] = useState(
        (state?.tabData?.formData?.components && JSON.parse(state.tabData.formData?.components)) || { components: [] });
    const [fetchingForm, setFetchingForm] = useState(false);

    const setFormData = useCallback(async (e, data) => {
        e?.preventDefault();
        setFetchingForm(true);
        const res = await templateTabService.list({
            payload: {
                query: { id: data.id },
                options: { populate: ["group-chat"] },
                findOne: true
            }
        });
        if (res.status === 1) {
            setState(prev => ({
                ...prev,
                tabData: {
                    ...prev.tabData,
                    formData: res.data
                },
            }))
            setSchema(JSON.parse(res.data.components));
        }
        setFetchingForm(false);
    }, [setState]);

    useEffect(() => {
        if (!!state?.tabData?.forms?.length && !state?.tabData?.formData)
            setFormData(null, state?.tabData?.forms[0])
    }, [setFormData, state?.tabData?.formData, state?.tabData?.forms]);

    const forms = useMemo(() => {
        if (!state.tabData?.forms) return [];
        return state.tabData?.forms?.map((item) => ({
            className: `nav-link ${item.id === state.tabData?.formData?.id ? 'active' : ''}`,
            ...item
        }));
    }, [state?.tabData?.forms, state.tabData?.formData?.id]);

    const addNewForm = useCallback(() => setState(prev => ({ ...prev, addNewForm: true })), [setState]);

    // To remove tab of a group
    const onRemoveTab = useCallback(async ({ id, parentTabId }) => {
        TakeConfirmation({
            title: "Are you sure to delete the current tab?",
            onDone: async () => {
                const data = await templateGroupService.delete({ payload: { id } });
                setState(prev => ({
                    ...prev,
                    groups: prev.groups.map(item => {
                        if (item.id === parentTabId)
                            return { ...item, templateGroups: item.templateGroups.filter(i => i.id !== Number(data.data)) }
                        return item;
                    }),
                    tabData: null
                }));
            }
        })
    }, [setState]);

    const addFormTemplate = useMemo(() => (
        <div className="d-flex flex-column justify-content-center text-center h-100 my-5">
            <div className="container">
                <h5 className='username-text'>{state.tabData?.title}</h5>
                {fetchingForm ?
                    <Loader height={'80px'} /> : <>
                        <p className="text-muted">Please create/select forms to start using.</p>
                        <button className="btn btn-outline-primary no-box-shadow" onClick={() => addNewForm()}>
                            Add Form
                        </button>
                    </>}
            </div>
        </div>
    ), [addNewForm, state.tabData?.title, fetchingForm]);

    return (
        <div className='pt-2'>
            <div className="form-inline justify-content-between mb-3 d-flex flex-wrap">
                <div className="d-flex">
                    <div className='my-2'>
                        <h3 className='mb-0'>{state.tabData.title}</h3>
                    </div>
                    <div className='d-flex gap-10 align-items-center mx-2'>
                        <MuiEditAction onClick={() => addNewTab(state.tabData)} />
                        <MuiDeleteAction onClick={() => onRemoveTab(state.tabData)} />
                    </div>
                </div>
            </div>
            <nav className='dashboard-nav my-2'>
                {!!forms?.length &&
                    <div className="nav nav-tabs hide-scrollbar" id="nav-tab" role="tablist" style={{ overflowX: 'auto' }}>
                        {forms.map((tabr) => {
                            // if (!tabr.path || tabr.path === "*" || (tabr.hasOwnProperty('access') && !tabr.access)) return null;
                            return (
                                <button key={tabr.id} className={tabr.className} id={tabr.id} type="button" role="tab" onClick={(e) => setFormData(e, tabr)}>
                                    <nobr>{tabr.title}</nobr>
                                </button>
                            )
                        })}
                        <button className={'nav-link'} type="button" role="tab" onClick={() => addNewForm()}>
                            <Plus size={22} />
                        </button>
                    </div>}
            </nav>
            <div className="tab-content" id="nav-tabContent">
                <div className={"tab-pane fade show active"} role="tabpanel">
                    <ErrorBoundary>
                        {state.tabData?.formData ?
                            <FormTemplate
                                key={state.tabData?.formData?.id + new Date().now}
                                state={state}
                                setState={setState}
                                jsonSchema={jsonSchema}
                                setSchema={setSchema}
                                fetchingForm={fetchingForm}
                            />
                            :
                            addFormTemplate
                        }
                    </ErrorBoundary>
                </div>
            </div>
            <NewFormModal
                state={state}
                setState={setState}
                closeModals={closeModals}
            />
        </div>
    )
}
