import { useCallback, useState } from "react";
import { Col, Row } from "react-bootstrap";
import AudioFooter from "Routes/Chat/Main/UserChat/footer/AudioFooter";
import ModalReactstrap from "Components/Modals/Modal";
import Input from "Components/FormBuilder/components/Input";
import ReactDatePicker from "react-datepicker";
import moment from "moment-timezone";

const defaultState = {
    label: '',
    note: '', file: null,
    uploading: false,
    comment: '',
}

export const CreateEditDictation = ({
    showModal,
    type,
    onSubmit,
    onCancel,
    mode = 'create',
    updateData,
    continueDictation,
    fieldName = 'field',
    patientId,
    visitDate = moment().toLocaleString()
}) => {

    return (
        <ModalReactstrap
            show={showModal}
            size='lg'
            header={<>{continueDictation ? `Continue Dictation of ${continueDictation.label || "Unknown label"}`
                : (mode === 'update' ? 'Edit ' + fieldName : 'Create ' + fieldName)}</>}
            toggle={onCancel}
            body={
                showModal &&
                <RecordDictation
                    visitDate={visitDate}
                    onSubmit={onSubmit}
                    mode={mode}
                    patientId={patientId}
                    continueDictation={continueDictation}
                />
            }
        />
    )
}

const RecordDictation = ({ visitDate, onSubmit, mode, patientId, continueDictation }) => {
    const [state, setState] = useState({ ...defaultState, date: visitDate });

    const inputChange = useCallback((e) => {
        const { value, name } = e.target;
        setState(prev => ({ ...prev, [name]: value }));
    }, []);

    const onSubmitAudio = useCallback(async ({ fileType, fileName, uploadedAudioUrl, fileData }) => {
        if (!navigator.onLine) {
            // Dictation won't upload if user is offline
        } else {
            await onSubmit({
                fileName,
                mediaType: fileType,
                mediaUrl: uploadedAudioUrl,
                note: state.note,
                label: state.label,
                comment: state.comment,
                createdAt: state.date,
                dictationDate: moment(state.date).format("YYYY-MM-DD")
            }, mode, patientId);
            setState({ ...defaultState, date: visitDate });
        }
    }, [mode, onSubmit, patientId, state, visitDate]);
    return (
        <Row>
            {!continueDictation &&
                <Col>
                    <Input
                        Label="Label"
                        placeholder="Enter Label"
                        name="label"
                        handleChange={inputChange}
                        formgroupClass=''
                        type="text"
                        error=''
                        isRequired={false}
                        value={state.label}
                    />
                    <Input
                        Label="Notes"
                        placeholder="Type notes here"
                        name="note"
                        handleChange={inputChange}
                        formgroupClass=''
                        type="text"
                        error=''
                        isRequired={false}
                        value={state.note}
                    />
                    <Input
                        Label="Comment"
                        placeholder="Type comments here"
                        name="comment"
                        handleChange={inputChange}
                        formgroupClass=''
                        type="text"
                        error=''
                        isRequired={false}
                        value={state.comment}
                    />
                    <div className="form-group cstm-datepicker">
                        <label htmlFor="dictationDate">Dictation date</label>
                        <ReactDatePicker
                            id="dictation_date"
                            name="dictationDate"
                            placeholderText="Dictation date"
                            className="form-control flex-grow-1 bg-dark-f input-border text-color font-inherit"
                            selected={state.date ? new Date(state.date) : null}
                            value={state.date ? new Date(state.date) : null}
                            onChange={(date) => setState(prev => ({ ...prev, date: date }))}
                            isClearable={true}
                            autoComplete='off'
                        />
                    </div>
                </Col>}
            <Col className='my-1' md={12}>
                <AudioFooter setRecorder={() => { }} onSubmitAudio={onSubmitAudio} type='dictation'
                    parentFile={continueDictation}
                    visitDate={visitDate} />
            </Col>
        </Row>
    )
}