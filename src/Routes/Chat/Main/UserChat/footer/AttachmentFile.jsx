import { useCallback, useState } from "react";
import { FileEarmark, Mic, Paperclip, PlusCircle, Save } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { toastPromise } from "redux/common";
import DropZone from "Routes/Chat/Models/Dropzone";
import preTypedMessageService from "services/APIs/services/preTypedMessageService";
import { showError } from "utils/package_config/toast";

export const AttachmentFile = ({ setAttachmentFiles, setRecorder, attachmentFiles, message, cb, refetchPreMsg }) => {
    const { user } = useSelector(state => state.user);
    const [showDropzone, setDropzone] = useState(false);

    const onClickDocumentHandler = useCallback(() => setDropzone(true), []);

    const onClickAudioRecorderHandler = () => setRecorder(true);

    const onChangeHandler = useCallback(async (e) => {
        const files = e.target.files;
        let selectedFiles = [];
        let index = 1;
        for (const file of files) {
            selectedFiles.push({ file, id: index + file.lastModified });
            index++;
        };
        if (!!selectedFiles.length) {
            if (!!attachmentFiles.length) setAttachmentFiles((prev) => ([...prev, ...selectedFiles]));
            else setAttachmentFiles(selectedFiles);
        }
    }, [attachmentFiles.length, setAttachmentFiles]);

    const saveTypedMessage = useCallback(async (message) => {
        if (!message.message) return showError("Please type message to save");
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = await preTypedMessageService.create({ payload: { message: message.message } });
                    if (!data?.status) return reject(data.message)
                    refetchPreMsg();
                    resolve(1);
                } catch (error) {
                    reject(0);
                }
            },
            loading: "Saving message", success: "Message saved",
            error: (error) => error ? error : "Message couldn't save"
        })
    }, [refetchPreMsg]);

    return (<>
        <div className="attachment" style={{ zIndex: 1 }}>
            <div className="dropdown">
                <button className="btn btn-secondary btn-icon btn-minimal btn-sm" id="attachmentDropdown" data-bs-toggle="dropdown" type="button">
                    <PlusCircle size={user?.fontSize} />
                </button>
                <ul className="dropdown-menu chat-attachment-dropdown m-0 font-inherit" aria-labelledby="attachmentDropdown">
                    <li className="dropdown-item">
                        <label htmlFor="fileUpload" className="cursor-pointer m-0" title="Task Attchment">
                            <Paperclip size={user?.fontSize} className="mr-2 rotate-45deg" />
                            <span>Task Attachment</span>
                        </label>
                        <input id="fileUpload" type="file" onChange={onChangeHandler} multiple hidden />
                    </li>
                    {[
                        { id: 1, name: "Message Attachment", title: "Attachment", Icon: FileEarmark, onClick: onClickDocumentHandler },
                        { id: 2, name: "Audio Recorder", title: "Audio Recorder", Icon: Mic, onClick: onClickAudioRecorderHandler },
                        { id: 3, name: "Save typed message", title: "Save typed message", Icon: Save, onClick: () => saveTypedMessage(message) },
                    ].map((Item) => (
                        <li className="dropdown-item" onClick={Item.onClick} key={Item.id}>
                            <label className="cursor-pointer m-0" title={Item.name}>
                                <Item.Icon size={user?.fontSize} className="mr-2" />
                                <span>{Item.title}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        {showDropzone && <>
            <div className="backdrop backdrop-visible" />
            <DropZone onCancel={() => setDropzone(false)} message={message} cb={cb} />
        </>}
    </>);
}