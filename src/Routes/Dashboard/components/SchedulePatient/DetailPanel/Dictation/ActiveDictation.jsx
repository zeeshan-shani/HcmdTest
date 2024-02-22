import { useCallback, useMemo } from "react";
import { Divider, Timeline } from "antd";
import ModalReactstrap from "Components/Modals/Modal";
import moment from "moment-timezone";
import { Button, Col, Row } from "react-bootstrap";
import { getAudioUrl } from "redux/common";

export default function ActiveAudio({ activeAudio, onClose, onContinueDictation, onDeleteAttachment }) {

    const onDelete = useCallback((id) => {
        onDeleteAttachment(id, activeAudio?.id)
    }, [onDeleteAttachment, activeAudio?.id]);

    const audioList = useMemo(() => [{
        children: <AudioItem audio={activeAudio} autoPlay onDelete={onDelete} />,
        color: "green"
    }], [activeAudio, onDelete]);

    return (<>
        <ModalReactstrap
            header="Dictation"
            Modalprops={{ className: 'text-color' }}
            show={Boolean(activeAudio)}
            toggle={onClose}
            size='lg'
            bodyProps={{ style: { overflow: "auto", maxHeight: window.innerWidth < 767 ? "calc(100vh - 100px)" : "calc(100vh - 180px)" } }}
            body={
                activeAudio &&
                <Row>
                    <Col>
                        <Timeline items={audioList} className="mt-2" />
                    </Col>
                </Row>}
            footer={<>
                <div className={`d-flex gap-10`}>
                    <Button variant='secondary' onClick={onClose}>{'Close'}</Button>
                    <Button onClick={() => onContinueDictation(activeAudio)}>{'Continue Dictation'}</Button>
                </div>
            </>}
        />
    </>
    )
}

const AudioItem = ({ audio, autoPlay, onDelete, index }) => {
    return (
        <div className='d-flex flex-column'>
            <Divider className='d-flex text-color mt-0 mb-2' style={{ borderColor: 'grey' }} orientation='left'>
                {audio.label ? audio.label : 'Unknown label'}
            </Divider>
            <div className='d-flex align-items-center w-100'>
                <audio controls id={'audio-' + audio.id} preload="metadata" className='w-100 my-0' autoPlay={autoPlay}>
                    <source src={getAudioUrl(audio.mediaUrl, false)} type="audio/mpeg" />
                    <source src={getAudioUrl(audio.mediaUrl, false)} type="audio/ogg" />
                    Your browser does not support the audio element.
                </audio>
            </div>
            <div className="my-1 w-100">
                <p className="mb-1">{`Notes: ${audio.note ? audio.note : 'N/A'}`}</p>
                <div className='d-flex justify-content-between align-items-center'>
                    <h6 className="mb-0">{`File: ${audio.fileName}`}</h6>
                    <p className="mb-0 desg-tag">{`${moment(audio.createdAt).format("MM/DD/YY")}`}</p>
                </div>
            </div>
        </div>
    )
}