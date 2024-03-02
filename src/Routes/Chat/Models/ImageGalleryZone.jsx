import React, { useCallback, useLayoutEffect, useState } from 'react'
import ReactImageVideoLightbox from "react-image-video-lightbox";
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { MuiTooltip } from 'Components/components';
import { BoxArrowUpLeft, ChatLeftQuoteFill } from 'react-bootstrap-icons';
import { dispatch } from 'redux/store';

export default function ImageGalleryZone() {
    const { name } = useSelector((state) => state.model);
    const { imageId, mediaFiles, taskAttachments } = useSelector((state) => state.chat);
    const [mediaList, setMediaList] = useState([]);
    const [currFile, setCurrFile] = useState();

    const onChangeCurrFile = useCallback((index) => {
        setCurrFile(!!taskAttachments?.length ? taskAttachments[index] : mediaFiles[index]);
    }, [mediaFiles, taskAttachments]);

    useLayoutEffect(() => {
        if (taskAttachments && !!taskAttachments.length) {
            setMediaList(
                taskAttachments
                    .filter(i => ["image", "video"].includes(i.mediaType.split("/").shift()))
                    .map((item) => {
                        const itemType = item.mediaType.split("/").shift();
                        if (itemType === "video")
                            return { ...item, url: item.mediaUrl, type: "video", title: 'video title' }
                        return { ...item, url: item.mediaUrl, type: "photo", altTag: 'Alt Photo' }
                    }));
            onChangeCurrFile(0);
        }
        else if (mediaFiles && !!mediaFiles.length) {
            setMediaList(mediaFiles.map((item) => {
                const itemType = item.mediaType.split("/").shift();
                if (itemType === "video")
                    return { ...item, url: item.mediaUrl, type: "video", title: 'video title' }
                return { ...item, url: item.mediaUrl, type: "photo", altTag: 'Alt Photo' }
            }));
            onChangeCurrFile(mediaFiles.findIndex((item) => item.id === imageId));
        }
    }, [imageId, mediaFiles, name, taskAttachments, onChangeCurrFile]);

    const onCloseHandler = useCallback(() => {
        changeModel("");
        dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 });
        dispatch({ type: CHAT_CONST.UPDATE_TASK_ATTACHMENTS, payload: [] });
    }, []);

    const onQuote = useCallback(() => {
        dispatch({ type: CHAT_CONST.SET_QUOTE_MESSAGE, payload: currFile.id });
        changeModel("");
    }, [currFile?.id]);

    const onViewPopupAndQuote = useCallback(() => {
        dispatch({ type: CHAT_CONST.SET_POPUP_FILE, payload: currFile.id });
        onQuote();
    }, [currFile?.id, onQuote]);

    return (
        <div className="modal modal-lg-fullscreen fade show d-block" id="imageGallery" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true">
            {!taskAttachments.length && !navigator?.userAgentData?.mobile &&
                <div className="modal-quote-cstm-buttons d-flex" style={{ gap: '8px' }}>
                    <MuiTooltip title='View Popup and Quote'>
                        <button className='btn-primary btn-sm border-0' onClick={onViewPopupAndQuote}>
                            <BoxArrowUpLeft size={20} fill='#fff' />
                        </button>
                    </MuiTooltip>
                    <MuiTooltip title='Quote File'>
                        <button className='btn-primary btn-sm border-0' onClick={onQuote}>
                            <ChatLeftQuoteFill size={20} fill='#fff' />
                        </button>
                    </MuiTooltip>
                </div>}
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => changeModel("")}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="modal-body image-video-gallery position-relative">
                        <ReactImageVideoLightbox
                            data={mediaList}
                            startIndex={
                                !!taskAttachments?.length ? 0 :
                                    mediaFiles.findIndex((item) => item.id === imageId)
                            }
                            showResourceCount={true}
                            onCloseCallback={onCloseHandler}
                            onNavigationCallback={(currentIndex) => {
                                onChangeCurrFile(currentIndex)
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>);
}
