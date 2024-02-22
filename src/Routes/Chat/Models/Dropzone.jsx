import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel, onSetPasteFiles, pastedFiles } from 'redux/actions/modelAction';
import { getPresignedUrl, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { sendMessage } from 'utils/wssConnection/Socket';
import { CONST } from 'utils/constants';
import { getSendToUsers } from 'redux/actions/chatAction';
import { ProgressBar } from 'react-bootstrap';
import Dropzone from 'react-dropzone'
import jsPDF from 'jspdf';
import moment from 'moment-timezone';
import PreviewFile from 'Routes/KnowledgeBase/CategoryData/GenerateRequest/PreviewFile';

const defaultState = {
    otherFiles: [],
    imageFiles: [],
    isUploading: false,
    pdfName: '',
    pdfCaption: '',
    pdfUploadLoad: null
}
export default function DropZone({ onCancel = () => { }, message = null, cb = () => { } }) {
    const { activeChat } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.user);

    const inputFileRef = useRef();
    const [state, setState] = useState(defaultState)

    const onDropFilesHandler = useCallback((filesList) => {
        let imageFiles = [];
        let otherFiles = [];
        Array.from(filesList).map((i, ind) => {
            const fileData = { id: ind + 1, file: i, name: i.name, caption: "", uploadLoad: 0 };
            if (i.type.includes("image")) imageFiles.push(fileData);
            else otherFiles.push(fileData);
            return null
        });
        setState(prev => ({ ...prev, imageFiles, otherFiles }));
        return () => {
            setState(defaultState);
        }
    }, []);

    useEffect(() => {
        if (!pastedFiles.length) inputFileRef?.current?.click();
        else if (!!pastedFiles.length) onDropFilesHandler(pastedFiles);
    }, [onDropFilesHandler]);

    const onCancelHandler = useCallback(() => {
        changeModel("");
        onCancel();
        // setFiles([]);
        setState(defaultState);
        if (!!pastedFiles.length) onSetPasteFiles([]);
    }, [onCancel]);

    const onUploadImage = useCallback(async (file) => {
        if (!file) return;
        const res = await getPresignedUrl({ fileName: file.name, fileType: file.type });
        return res.data.url;
    }, []);

    const funcupload = useCallback(async (i, isImagePDF = false) => {
        const file = i.file;
        //eslint-disable-next-line
        const onUploadProgress = (e) => {
            if (isImagePDF)
                setState(prev => ({ ...prev, pdfUploadLoad: parseInt(e.progress * 100) }))
            else
                setState(prev => ({
                    ...prev, otherFiles: prev.otherFiles.map((item) => {
                        if (item.id === i.id) item.uploadLoad = parseInt(e.progress * 100);
                        return item;
                    })
                }))
        }
        const presignedUrl = await onUploadImage(file);
        const uploadedImageUrl = await uploadToS3(presignedUrl, file, onUploadProgress);
        let msgObject = {
            chatType: activeChat.type,
            chatId: activeChat.id,
            mediaType: `${file.type.split("/").shift()}/${file.name?.split(".").pop()}`,
            mediaUrl: uploadedImageUrl,
            type: CONST.MSG_TYPE.ROUTINE,
            sendTo: getSendToUsers(user.id, activeChat.type, activeChat.chatusers),
            sendBy: user.id,
            quotedMessageId: null,
            // message: caption[index].caption ? caption[index].caption : "",
            message: i.caption,
            // fileName: caption[index].name,
            fileName: i.name,
            isMessage: true
        }
        if (message?.subject) msgObject.subject = message?.subject;
        if (message?.patient) msgObject.patient = message?.patient;
        if (message?.ccText) msgObject.ccText = message?.ccText;
        if (message?.message) msgObject.message = msgObject.message + '\n' + message?.message;
        sendMessage(msgObject);
    }, [activeChat, message, onUploadImage, user.id]);

    const mergeImagestoPdf = useCallback(async () => {
        const pdf = new jsPDF("p", "");
        const pdfName = state.pdfName || "HCMD_PDF_" + moment().format("MM/DD/YY");
        const paddingX = 5;
        const paddingY = 5;
        const pageWidth = pdf.internal.pageSize.getWidth();
        // const pageHeight = pdf.internal.pageSize.getHeight();
        state.imageFiles.forEach((item, index) => {
            const { file } = item
            const imageURL = URL.createObjectURL(file);
            // pdf.addImage(imageURL, 'any', 10, (index + 1) * 10, 210, 297);
            // pdf.addImage(imageURL, 'any',);
            pdf.addImage(imageURL, "any", paddingX, paddingY, pageWidth - (paddingX * 2), 0);
            pdf.addPage();
        });
        pdf.deletePage(state.imageFiles.length + 1);
        let pdfData = pdf.output("blob")
        let myBlob = new Blob([pdfData], { type: 'application/pdf' });
        myBlob.name = pdfName;
        // myBlob.lastModified = new Date();
        const myFile = new File([myBlob], `${pdfName}.pdf`, { type: myBlob.type, });
        // pdf.save(pdfName + '.pdf');
        await funcupload({
            file: myFile,
            name: state.pdfName,
            caption: state.pdfCaption
        }, true)
    }, [state.imageFiles, state.pdfName, state.pdfCaption, funcupload]);

    const onSendFileMessage = useCallback(async () => {
        setState(prev => ({ ...prev, isUploading: true }))
        for (const i of state.otherFiles) await funcupload(i)
        if (state.imageFiles.length === 1) await funcupload(state.imageFiles[0])
        else if (state.imageFiles.length > 1) await mergeImagestoPdf()
        setState(prev => ({ ...prev, isUploading: false }))
        cb();
        onCancelHandler();
    }, [cb, onCancelHandler, state.otherFiles, state.imageFiles, funcupload, mergeImagestoPdf]);

    return (<>
        <div className="modal modal-lg-fullscreen fade show d-block" id="dropZone" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom">
                <div className="modal-content overflow-scroll hide-scrollbar">
                    <div className="modal-header">
                        <h5 className="modal-title js-title-step" id="dropZoneLabel">&nbsp;<span className="label label-success">1</span> Select File to Send</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onCancelHandler}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="modal-body hide-scrollbar">
                        <Dropzone onDrop={onDropFilesHandler}>
                            {({ getRootProps, getInputProps }) => (
                                <section className='border-1 text-center py-2'>
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} className="dropzone-input" ref={inputFileRef} />
                                        <div className='py-2 mb-0 text-color'>Drag / drop files here, or click to select files</div>
                                    </div>
                                </section>
                            )}
                        </Dropzone>
                        {!!state?.otherFiles?.length && (
                            state.otherFiles.map(item =>
                                <FileTarget key={item.id} item={item} isUploading={state.isUploading}
                                    setState={setState} progress={state.isUploading && { value: item.uploadLoad }}
                                    mutable={true}
                                />
                            )
                        )}
                        {!!state?.imageFiles?.length && <>
                            {state?.imageFiles.length > 1 ?
                                <MultipleImage state={state} setState={setState} mutable={true} />
                                :
                                (state.imageFiles.map(item =>
                                    <FileTarget key={item.id} item={item} isUploading={state.isUploading}
                                        setState={setState} progress={state.isUploading && { value: item.uploadLoad }}
                                        mutable={true}
                                    />))
                            }
                        </>}
                    </div>
                    <div className="modal-footer">
                        {!state.isUploading &&
                            <button
                                className="btn btn-link text-muted js-btn-step mr-auto"
                                data-orientation="cancel"
                                data-dismiss="modal"
                                onClick={onCancelHandler}>
                                Cancel
                            </button>}
                        <button
                            className="btn btn-primary js-btn-step"
                            data-orientation="next"
                            onClick={onSendFileMessage}
                            disabled={(!state.imageFiles.length && !state.otherFiles.length) || state.isUploading}
                        >
                            {state.isUploading ? `Sending...` : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>);
}

export const FileTarget = ({ item, progress, isUploading, setState, mutable, OnClose }) => {
    return (<>
        <div className="mt-3 preview-attachments media-image">
            <PreviewFile item={item} OnClose={OnClose} />
        </div>
        <div className="mt-1">
            {!mutable &&
                <p className='mb-0 text-color'>
                    Image Selected
                </p>}
            <p className='mb-0 text-color'>{item.name}</p>
        </div>
        {progress && <ProgressBar now={progress.value} label={`${progress.value}%`} />}
        {mutable && <>
            <div className="form-group mb-1">
                <input type="text" className="mt-1 form-control p-4_8"
                    placeholder='File name'
                    defaultValue={item.name}
                    disabled={isUploading || progress}
                    onChange={e => {
                        setState(prev => ({
                            ...prev,
                            otherFiles: prev.otherFiles.map((itemFile) => {
                                if (itemFile.id === item.id) itemFile.name = e.target.value;
                                return itemFile
                            }),
                            imageFiles: prev.imageFiles.map((itemFile) => {
                                if (itemFile.id === item.id) itemFile.name = e.target.value;
                                return itemFile
                            }),
                        }))
                    }} />
            </div>
            <div className="form-group mb-1">
                <textarea
                    className="form-control p-4_8"
                    placeholder='Add Caption'
                    disabled={isUploading || progress}
                    rows={1}
                    onChange={e => {
                        setState(prev => ({
                            ...prev,
                            otherFiles: prev.otherFiles.map((itemFile) => {
                                if (itemFile.id === item.id) itemFile.caption = e.target.value;
                                return itemFile
                            }),
                            imageFiles: prev.imageFiles.map((itemFile) => {
                                if (itemFile.id === item.id) itemFile.caption = e.target.value;
                                return itemFile
                            }),
                        }))
                    }} />
            </div>
        </>}
    </>);
}

export const MultipleImage = ({ state, setState, mutable }) => {
    return (<>
        <div className="mt-2">
            <p className='mb-0 text-color'>
                {state.imageFiles.length} Images Selected
            </p>
            <small className='text-muted'>(Images will be send as PDF file)</small>
        </div>
        {(state.isUploading && state.pdfUploadLoad) &&
            <ProgressBar now={state.pdfUploadLoad} label={`${state.pdfUploadLoad}%`} />}
        {mutable && <>
            <div className="form-group mb-1">
                <input type="text" className="mt-1 form-control p-4_8"
                    placeholder='PDF Filename'
                    disabled={state.isUploading || state.pdfUploadLoad}
                    onChange={e => setState(prev => ({ ...prev, pdfName: e.target.value }))} />
            </div>
            <div className="form-group mb-1">
                <textarea
                    className="form-control p-4_8"
                    placeholder='Add Caption'
                    disabled={state.isUploading || state.pdfUploadLoad}
                    rows={1}
                    onChange={e => setState(prev => ({ ...prev, pdfCaption: e.target.value }))} />
            </div>
        </>}
    </>);
}