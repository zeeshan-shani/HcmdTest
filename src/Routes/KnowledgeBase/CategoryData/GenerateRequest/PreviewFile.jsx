import React from 'react'
import { X } from 'react-bootstrap-icons'

export default function PreviewFile({ item, OnClose, setSelectedFile }) {
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
                    : <video className="img-fluid rounded border">
                        <source src={URL.createObjectURL(item.file)} type="video/mp4" />
                        <source src={URL.createObjectURL(item.file)} type="video/ogg" />
                        Your browser does not support the video tag.
                    </video>}
            </div>
        </div>
    )
}
