import React from 'react'
import moment from 'moment-timezone'
import { MuiTooltip } from 'Components/components'
import { Card, Col } from 'react-bootstrap'
import { IconButton } from '@mui/material'
import { useSelector } from 'react-redux'
import ImageVideoModal from 'Components/Modals/ImageVideoModal'
import { CHAT_CONST } from 'redux/constants/chatConstants'
import { dispatch } from 'redux/store'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getImageURL } from 'redux/common'
import { changeModel } from 'redux/actions/modelAction'
import { CHAT_MODELS } from 'Routes/Chat/Models/models'

export default function PictureDataImage({ data, onEdit, onUpdate, onDelete, imagesData = [] }) {
    const { imageId } = useSelector((state) => state.chat);
    if (imageId)
        return (
            <ImageVideoModal
                data={imagesData}
                startImgID={imageId}
                onCloseImageHandler={() => dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 })}
            />
        )
    return (
        // <li className="my-1">
        <Col md={4}>
            <Card className='flex-row'>
                {data.mediaType.includes("image") ?
                    <Card.Img variant="left" src={getImageURL(data.mediaUrl, "200x200", false)} height={'auto'} width={200} className="cursor-pointer"
                        onClick={() => dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: data.id })} />
                    :
                    <div style={{ height: "auto", width: "200px", cursor: "pointer" }}
                        onClick={() => {
                            changeModel(CHAT_MODELS.PDF_VIEWER);
                            dispatch({ type: CHAT_CONST.SET_PDF_URL, payload: data.mediaUrl, fileName: data.fileName, id: data.id })
                        }}
                    >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                }
                <Card.Body className='d-flex flex-column justify-content-between'>
                    <Card.Text className='line-clamp line-clamp-6'>{data.note}</Card.Text>
                    <div className='d-flex align-items-center'>
                        <div className='mb-0'>
                            <MuiTooltip title="Edit">
                                <IconButton color='primary' onClick={() => onEdit(data)}>
                                    <EditIcon />
                                </IconButton>
                            </MuiTooltip>
                            <MuiTooltip title="Delete">
                                <IconButton color='secondary' onClick={() => onDelete(data.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </MuiTooltip>
                            <Card.Text className='desg-tag mb-0 mt-1'>
                                {`Created on ${moment(data.createdAt).format("MM/DD/YY")}`}
                            </Card.Text>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        // </li>
    )
}
