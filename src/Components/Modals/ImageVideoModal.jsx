import React, { useMemo } from 'react'
import ReactImageVideoLightbox from "react-image-video-lightbox";

export default function ImageVideoModal({ data, startImgID, showResourceCount = true, onCloseImageHandler }) {

    const ImageVideoData = useMemo(() =>
        data.filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
            .map((item) => {
                const itemType = item.mediaType.split("/").shift();
                if (itemType === "video") return { ...item, url: item.mediaUrl, type: "video", title: 'video title' }
                return { ...item, url: item.mediaUrl, type: "photo", altTag: 'Alt Photo' }
            }), [data]);

    const startIndex = useMemo(() =>
        startImgID ? ImageVideoData.findIndex((item) => item.id === startImgID) : 0,
        [ImageVideoData, startImgID]);

    return (
        <div className="modal modal-lg-fullscreen fade show d-block task-image-gallery" id="imageGallery" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true">
            <ReactImageVideoLightbox
                data={ImageVideoData}
                startIndex={startIndex}
                showResourceCount={showResourceCount}
                onCloseCallback={onCloseImageHandler}
            />
        </div>)
}
