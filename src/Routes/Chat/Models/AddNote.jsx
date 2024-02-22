import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactSelect from 'react-select';
import ModalReactstrap from 'Components/Modals/Modal';
import { Button } from 'react-bootstrap';
import { CONST } from 'utils/constants';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { visibility as Visible } from '../Appbar/TemplateTask/NewTemplate';
import noteService from 'services/APIs/services/noteServices';

const defaultState = { title: '', detail: '', visibility: Visible.PUBLIC.value }

export default function AddNote({ closeModal, editMode = false, refetch }) {
    const { activeChat } = useSelector((state) => state.chat);
    const [state, setState] = useState(defaultState);
    const { title, detail, visibility } = state;
    const titleRef = useRef();

    useEffect(() => {
        if (editMode) setState(prev => ({ ...prev, ...editMode }))
    }, [editMode]);

    const inputChange = useCallback(e => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, [name]: value }));
    }, []);

    const onAddNoteHandler = useCallback(async (e) => {
        if (!title) {
            titleRef.current.focus();
            e.target.disabled = false;
            return;
        }
        const data = await noteService.create({ payload: { title, detail, chatId: activeChat.id, visibility } });
        if (data?.status === 1) {
            refetch();
            closeModal();
        }
    }, [activeChat.id, closeModal, detail, title, visibility, refetch]);

    const onEditNoteHandler = useCallback(async (e) => {
        if (!title) {
            titleRef.current.focus();
            e.target.disabled = false;
            return;
        }
        const data = await noteService.update({ payload: { id: editMode.id, title, detail, visibility } });
        if (data?.status) {
            refetch();
            closeModal();
        }
    }, [closeModal, detail, editMode.id, title, visibility, refetch]);

    const { options, value } = useMemo(() => {
        const options = Object.values(CONST.NOTE_TYPE).map(i => ({ label: i, value: i }));
        const value = options.find(i => i.value === state.visibility)
        return { options, value }
    }, [state.visibility]);

    try {
        return (<>
            {/* <div className="backdrop backdrop-visible z-index-1025"></div> */}
            <ModalReactstrap
                show={true}
                header={editMode ? 'Edit Note' : 'Add Note'}
                toggle={closeModal}
                body={<>
                    <div className="form-group">
                        <label htmlFor="addNoteName" className="col-form-label">Note title:</label>
                        <input ref={titleRef} type="text" className="form-control" id="addNoteName" name="title" value={title} onChange={inputChange}
                            autoFocus placeholder="Add note title here" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="addNoteDetails" className="col-form-label">Note details:</label>
                        <textarea
                            className="form-control hide-scrollbar"
                            id="addNoteDetails"
                            name="detail"
                            rows={4}
                            value={detail}
                            onChange={inputChange}
                            placeholder="Add note descriptions" />
                    </div>
                    <div className="form-group">
                        <label className="col-form-label">Visibility:</label>
                        <ReactSelect
                            name="visibility"
                            options={options}
                            value={[value]}
                            placeholder={'Visibility'}
                            onChange={e => setState(prev => ({ ...prev, visibility: e.value }))}
                            menuPlacement='auto'
                            className="basic-multi-select input-border"
                            classNamePrefix="select"
                        />
                    </div>
                </>}
                footer={<>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                    <Button variant="primary" onClick={(e) => {
                        e.target.disabled = true;
                        Boolean(editMode) ? onEditNoteHandler(e) : onAddNoteHandler(e)
                    }}>
                        {Boolean(editMode) ? 'Update Note' : 'Add Note'}
                    </Button>
                </>}
            />
        </>);
    } catch (error) {
        console.error(error);
    }
}