import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { generatePayload, toastPromise } from 'redux/common';
import { MuiActionButton, MuiDeleteAction } from 'Components/MuiDataGrid';
import { Add } from '@mui/icons-material';
import { TakeConfirmation } from 'Components/components';
import AddTemplate from './AddTemplate';
import templateTabService from 'services/APIs/services/templateTabService';
import templateGroupService from 'services/APIs/services/templateGroupService';

export default function TreeViewTabs({ state, setState, addNewForm, closeModals }) {
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);

    const onClickSubItem = useCallback(async (tab) => {
        // if (tabs && !!tabs.length) return;
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    setState(prev => ({ ...prev, tabData: tab, groupData: null }));
                    const payload = await generatePayload({
                        rest: { templateGroupId: tab.id },
                        options: { sort: [['createdAt', 'asc']] },
                        isCount: true
                    });
                    const data = await templateTabService.list({ payload });
                    if (data?.status === 1) {
                        setState(prev => ({
                            ...prev,
                            tabData: {
                                ...prev.tabData,
                                forms: data.data.rows,
                                // formData: !!data.data.rows.length && data.data.rows[0],
                            }
                        }));
                    }
                    resolve();
                } catch (error) {
                    console.error(error);
                    reject("Error");
                }
            },
            loading: 'Fetching forms',
            success: 'Successfully fetched forms',
            error: "Couldn't fetch froms",
            options: { id: "get-tabs" }
        })
    }, [setState]);

    const onSubmitNewTab = useCallback(async (body) => {
        if (body.groupTitle[0].__isNew__) {
            body.groupTitle = body.groupTitle[0].value;
            body.isNewGroup = true;
            delete body.templateGroupId;
        }
        else if (!body.groupTitle[0].__isNew__ && body.groupTitle[0].hasOwnProperty("id")) {
            body.parentTabId = body.groupTitle[0].id;
            delete body.groupTitle;
        }
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    if (state.updateTab) {
                        body.id = state.updateTab.id;
                        const data = await templateGroupService.update({ payload: body });
                        if (data?.status === 1) {
                            setState(prev => ({
                                ...prev,
                                groups:
                                    prev.groups.map((item) => {
                                        if (body.parentTabId !== prev.updateTab?.parentTabId) {
                                            if (item.id === prev.updateTab?.parentTabId) return { ...item, templateGroups: item.templateGroups.filter(i => i.id !== body.id) };
                                            if (item.id === body.parentTabId) return { ...item, templateGroups: [...item.templateGroups, data.data] }
                                        }
                                        if (item.id === body.parentTabId) return {
                                            ...item,
                                            templateGroups: item.templateGroups.map(i => {
                                                if (i.id === body.id) return { ...i, ...data.data };
                                                return i;
                                            })
                                        }
                                        return item;
                                    }),
                                tabData: data.data,
                            }));
                            onClickSubItem(data.data);
                            resolve(data.message || 'Successfully updated tab');
                            closeModals();
                        }
                        return;
                    }
                    else {
                        const data = await templateGroupService.create({ payload: body });
                        if (data?.status === 1) {
                            if (body.isNewGroup) {
                                setState(prev => ({
                                    ...prev,
                                    groups: [...prev.groups, data.data]
                                }))
                            }
                            else {
                                setState(prev => ({
                                    ...prev,
                                    groups: prev.groups.map((item) => {
                                        if (item.id === data.data.parentTabId)
                                            return { ...item, templateGroups: [...item.templateGroups, data.data] };
                                        return item;
                                    }),
                                }));
                            }
                            resolve(data.message || 'Successfully created tab');
                            closeModals();
                        }
                    }
                } catch (error) {
                    console.error(error);
                    reject("Error");
                }
            }, loading: 'Creating new template tab', success: msg => msg || 'Created', error: "Could not created tab",
            options: { id: "create-tab" }
        });
    }, [state.updateTab, closeModals, setState, onClickSubItem]);

    const getTabGroups = useCallback(async () => {
        const payload = await generatePayload({
            options: {
                sort: [['createdAt', 'asc']],
                populate: ["templateChildTabInfo"],
            },
            isCount: true
        });
        const data = await templateGroupService.list({ payload });
        if (data?.status === 1) setState(prev => ({ ...prev, groups: data.data.rows }));
    }, [setState]);

    useEffect(() => {
        getTabGroups();
    }, [getTabGroups]);

    const handleToggle = (event, nodeIds) => setExpanded(nodeIds);

    const handleSelect = (event, nodeIds) => setSelected(nodeIds);

    const getGroupsAndTabs = useMemo(() => {
        return (
            <TreeView
                aria-label="controlled"
                className='my-2'
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={expanded}
                selected={selected}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}
                multiSelect
            >
                {state.groups.map((groupItem) => {
                    const id = `${groupItem.title}_${groupItem.id}`;
                    return (
                        <TreeItem key={id} nodeId={id} label={`${groupItem.title}`}
                            onClick={() => setState(prev => ({ ...prev, groupData: groupItem }))}
                        >
                            {groupItem?.templateGroups?.map((tabItem) => {
                                return (
                                    <TreeItem
                                        key={tabItem.id}
                                        nodeId={`${groupItem.title}_${tabItem.id}`}
                                        label={`${tabItem.title}`}
                                        onClick={() => onClickSubItem(tabItem)}
                                    />
                                )
                            })}
                        </TreeItem>
                    )
                })}
            </TreeView>
        )
    }, [expanded, selected, state.groups, onClickSubItem, setState]);

    const onClickDeleteGroup = useCallback(({ id }) => {
        TakeConfirmation({
            title: "Are you sure to remove the tab?",
            onDone: async () => {
                const data = await templateGroupService.delete({ payload: { id } });
                setState(prev => ({
                    ...prev,
                    groups: prev.groups.filter(i => i.id !== Number(data.data)),
                    tabData: prev.tabData?.parentTabId !== id ? prev.tabData : null
                }));
            }
        })
    }, [setState]);

    return (
        <div className='card my-2 h-100 text-color'>
            <div className="d-flex justify-content-end">
                {state?.groupData &&
                    <MuiDeleteAction onClick={() => onClickDeleteGroup(state?.groupData)} />}
                <MuiActionButton Icon={Add} onClick={() => addNewForm()} />
            </div>
            {getGroupsAndTabs}
            <AddTemplate state={state} groups={state.groups} closeModals={closeModals} onSubmit={onSubmitNewTab} />
        </div>
    )
}