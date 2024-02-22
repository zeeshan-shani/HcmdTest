import { IconButton, } from '@mui/material';
// import AudioPlayer from 'react-h5-audio-player';
// import { RHAP_UI } from 'react-h5-audio-player/lib/constants.js';
// import 'react-h5-audio-player/lib/styles.css';
import { MuiTooltip } from 'Components/components';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment-timezone';
import { getAudioUrl } from 'redux/common';

export default function DictationCard({ data, onDelete }) {
    return (
        <li className="card">
            <div className="card-body d-flex justify-content-between p-2">
                <div className='d-flex document flex-column'>
                    <div className='d-flex align-item-center w-100'>
                        <audio controls id={'audio-' + data.id} preload="metadata" className='w-100'>
                            <source src={getAudioUrl(data.mediaUrl, false)} type="audio/ogg" />
                            <source src={getAudioUrl(data.mediaUrl, false)} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                        <MuiTooltip title="Delete">
                            <IconButton color='secondary' onClick={() => onDelete(data.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </MuiTooltip>
                    </div>
                    <div className="my-1 w-100">
                        <p className="mb-1">{`Notes: ${data.note ? data.note : 'N/A'}`}</p>
                        <div className='d-flex justify-content-between align-items-center'>
                            <h6 className="mb-0">{`File: ${data.fileName}`}</h6>
                            <p className="mb-0 desg-tag">{`${moment(data.createdAt).format("MM/DD/YY")}`}</p>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
}