import React from 'react'
import { Button } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';

export const AttachmentPreview = ({ attachmentFiles, setAttachmentFiles, inputRef, uploadDone, setUploadDone, setUploading, isUploading }) => {
    const OnClose = (item) =>
        setAttachmentFiles((prev) => [...prev.filter(file => file.id !== item.id)]);

    const onCancel = () => {
        setUploading(false);
        setAttachmentFiles([]);
        inputRef?.current?.focus();
    }
    const onClearAll = () => {
        setAttachmentFiles([]);
        setUploading(false);
    }
    return (
        <div className="preview-attachments">
            <div className="files d-flex flex-wrap my-1 justify-content-between">
                <div className='d-flex light-text-70 align-items-center'>
                    {attachmentFiles?.map((file, index) => {
                        return (
                            <PreviewTaskFile key={index} item={file} OnClose={OnClose} />
                        )
                    })}
                </div>
                <div className="buttons d-flex align-items-end gap-5 mx-1">
                    {(isUploading || uploadDone) &&
                        <Button variant='primary' size='sm' disabled>
                            {isUploading ? 'Uploading' : (uploadDone ? 'Uploaded' : 'Upload')}
                        </Button>}
                    <Button variant='secondary' size='sm' onClick={isUploading ? onCancel : onClearAll}>
                        {isUploading ? 'Cancel' : 'Clear All'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export const PreviewTaskFile = ({ item, OnClose, setSelectedFile }) => {
    return (
        <div className="media-image m-2">
            <button className='close-btn' onClick={() => OnClose(item)}>
                <X size={16} />
            </button>
            <div className="cursor-pointer" onClick={() => {
                // setSelectedFile(item?.file)
            }}>
                {item.file.type.startsWith("image") ?
                    <img className="img-fluid rounded border" src={URL.createObjectURL(item.file)} alt="" />
                    : (item.file.type.startsWith("video") ? <video className="img-fluid rounded border">
                        <source src={URL.createObjectURL(item.file)} type="video/mp4" />
                        <source src={URL.createObjectURL(item.file)} type="video/ogg" />
                        Your browser does not support the video tag.
                    </video>
                        :
                        <div className='preview-file-doc'>
                            <span>
                                {'Preview not available'}
                            </span>
                        </div>)}
            </div>
        </div>
    )
}
