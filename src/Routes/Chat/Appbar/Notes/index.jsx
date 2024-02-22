import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { ThreeDots, X } from "react-bootstrap-icons";
import moment from 'moment-timezone';
import useDebounce from "services/hooks/useDebounce";
import AddNote from "Routes/Chat/Models/AddNote";
import { CONST } from "utils/constants";
import { changeTask } from "redux/actions/modelAction";
import { visibility } from "../TemplateTask/NewTemplate";
import { queryClient } from "index";
import { useQuery } from "@tanstack/react-query";
import { generatePayload } from "redux/common";
import { Button, Spinner } from "react-bootstrap";
import { MuiActionButton } from "Components/MuiDataGrid";
import noteService from "services/APIs/services/noteServices";
import Input from "Components/FormBuilder/components/Input";

const defaultState = { type: null, search: '', addNote: false, editNote: false, visibleType: visibility.PRIVATE.value }
export default function Notes({ taskName }) {
    const { activeChat } = useSelector((state) => state.chat); //, notesList
    const [State, setState] = useState(defaultState);
    const searchnotes = useDebounce(State.search, 500);

    const getNotes = useCallback(async ({ queryKey }) => {
        const { search, chatId, visibility } = queryKey[2];
        const payload = await generatePayload({
            rest: { chatId, visibility },
            keys: ["title", "detail"],
            value: search,
        });
        const data = await noteService.list({ payload });
        if (data?.status === 1) return data.data;
        return [];
    }, []);

    const { data: notesList = [], isFetching, refetch } = useQuery({
        queryKey: ["/note/list", activeChat.id, {
            search: searchnotes,
            chatId: activeChat.id,
            visibility: State.visibleType,
        }],
        queryFn: getNotes,
        keepPreviousData: false,
    });

    const getNoteTypeClass = (type) => {
        switch (type) {
            case "favourite": return "badge-primary"
            case "public":
            case "personal": return "badge-info"
            case "private":
            case "work": return "badge-warning"
            default: return "badge-danger"
        }
    }
    const UpdateNote = (item) => setState(prev => ({ ...prev, editNote: item }));

    const deleteNoteHandler = useCallback(async (noteId) => {
        const data = await noteService.delete({ payload: { id: noteId } });
        if (data?.status === 1)
            queryClient.setQueryData(["/note/list", activeChat.id, {
                search: searchnotes,
                chatId: activeChat.id,
                visibility: State.visibleType,
            }], prev => prev.filter((item) => item.id !== Number(data.data)))
    }, [State.visibleType, activeChat.id, searchnotes]);

    const UpdateNoteHandler = useCallback(async (payload) => {
        const data = await noteService.update({ payload });
        if (data?.status === 1) refetch();
    }, [refetch]);

    return (<>
        <div className="tab-pane h-100 active" id="notes" role="tabpanel" aria-labelledby="notes-tab">
            <div className="appnavbar-content-wrapper">
                <div className="appnavbar-scrollable-wrapper">
                    <div className="appnavbar-heading sticky-top">
                        <div className="nav justify-content-between align-items-center">
                            <h5 className="text-truncate mb-0">Notes</h5>
                            <MuiActionButton Icon={X} size="small" className="text-color" onClick={() => changeTask()} />
                        </div>
                    </div>
                    <div className="appnavbar-body">
                        <div className="appnavbar-body-title">
                            <div className="dropdown mr-2">
                                <button className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown" id="notesFilterDropdown" data-bs-toggle="dropdown">
                                    {State?.visibleType !== undefined ? (State?.visibleType) : "All notes"}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-left m-0" aria-labelledby="notesFilterDropdown">
                                    {Object.values(CONST.NOTE_TYPE).map((item) => (
                                        <li key={item} className="dropdown-item text-capitalize" onClick={() => setState(prev => ({ ...prev, visibleType: item }))}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="form-inline">
                                <Input
                                    placeholder='Search notes'
                                    value={State.search}
                                    handleChange={e => setState(prev => ({ ...prev, search: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="note-container">
                            <div className="text-center">
                                {isFetching && <Spinner animation="border" />}
                            </div>
                            {!!notesList?.length && notesList?.map((item) => {
                                return (
                                    <div className="note" key={item.id}>
                                        <div className="note-body">
                                            <div className="note-added-on">{moment(item.createdAt).format("MM/DD/YY hh:mm A")}</div>
                                            <h5 className="note-title">{item.title}</h5>
                                            <p className="note-description white-space-preline">{item.detail}</p>
                                        </div>
                                        <div className="note-footer p-2">
                                            <div className="note-tools">
                                                <span className={`badge ${getNoteTypeClass(item.visibility)} text-capitalize`}>
                                                    {item.visibility}
                                                </span>
                                            </div>
                                            <div className="note-tools">
                                                <div className="dropdown mr-2">
                                                    <button className="btn btn-secondary btn-icon btn-minimal btn-sm text-muted height-fit-content" id={`note-item-${item.id}`} data-bs-toggle="dropdown">
                                                        <ThreeDots />
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-right notes-options-menu m-0" aria-labelledby={`note-item-${item.id}`}>
                                                        {Object.values(CONST.NOTE_TYPE).map((type) => (
                                                            <li key={type} className="dropdown-item text-capitalize" onClick={() => UpdateNoteHandler({ id: item.id, visibility: type })}>{type}</li>
                                                        ))}
                                                        <div className="dropdown-divider"></div>
                                                        <li className="dropdown-item" onClick={() => UpdateNote(item)}>Edit</li>
                                                        <li className="dropdown-item text-danger" onClick={() => deleteNoteHandler(item.id)}>Delete</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)
                            })}
                        </div>
                    </div>
                    <div className="appnavbar-footer">
                        <Button
                            className="w-100"
                            onClick={() => setState(prev => ({ ...prev, addNote: true }))}>
                            Add new note
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        {(State.addNote || State.editNote) &&
            <AddNote
                closeModal={() => setState(prev => ({ ...prev, addNote: false, editNote: false }))}
                editMode={State.editNote}
                refetch={refetch} />}
    </>);
}