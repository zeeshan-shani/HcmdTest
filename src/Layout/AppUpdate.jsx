/**
 * This file contains a React functional component called AppUpdate.
 * It imports necessary dependencies and uses Redux and React Redux for state management.
 * The component checks for available app updates and displays a modal if an update is available.
 * The modal includes the version number and notes of the update.
 * The component also checks for any previously stored update data in local storage.
 * If found, it dispatches an action to mark the update as available.
 * The component returns null if no update is available.
 */

/* NOT IMPORTANT FILE */

import React from 'react';
import { dispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import ModalReactstrap from 'Components/Modals/Modal';

export default function AppUpdate() {
    const { update } = useSelector(state => state.user);
    try {
        if (update?.data && update.data.versionId && !update.checked) {
            return (
                <ModalReactstrap
                    header='App Update Available'
                    show={true}
                    toggle={() => {
                        dispatch({ type: 'UPDATE_AVAILABLE', payload: { ...update, checked: true } })
                    }}
                    body={<>
                        <div
                            className='white-space-preline'
                            dangerouslySetInnerHTML={{
                                __html:
                                    `Version: ${update.data.versionId}
                            \nNotes: ${update.data.note}`
                            }} />
                    </>}
                />)
        }
        const updateData = localStorage.getItem('update');
        if (updateData && !JSON.parse(updateData)?.checked) {
            dispatch({ type: 'UPDATE_AVAILABLE', payload: JSON.parse(updateData) });
        }

        return null;
    } catch (error) {
        console.error(error);
    }
}