import React from 'react'
import AttachmentCard from './AttachmentCard'
import { useSelector } from 'react-redux/es/hooks/useSelector';

export const TaskAttachment = ({ taskDetails, setImageShow, attchmentDeleteHandler, isTemplate = false }) => {
    const attachments = isTemplate ? taskDetails.templateAttachments : taskDetails.attachments;
    const { uploadingAttachment } = useSelector(state => state.task);
    return (
        <div className="col-sm-6 col-md-12">
            <div className="card mb-2 light-shadow">
                <div className="card-body task-attachment-body">
                    <h6>
                        Attachments ({attachments?.length})
                    </h6>
                    {uploadingAttachment && <p>Uploading File...</p>}
                    {!!attachments?.length && attachments?.map((att) => (
                        <AttachmentCard
                            key={att.id}
                            att={att}
                            setImageShow={setImageShow}
                            attchmentDeleteHandler={attchmentDeleteHandler}
                        />)
                    )}
                    {!attachments?.length && <span>No File Attached</span>}
                </div>
            </div>
        </div>
    )
}
