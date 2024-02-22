import React from "react";
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { getImageURL, handleDownload } from "redux/common";
import { ThreeDots } from "react-bootstrap-icons";
import { CONST } from "utils/constants";
import { dispatch } from "redux/store";

export default function AttachmentCard({ att, attchmentDeleteHandler, setImageShow }) {
	const onClickImageHandler = () => {
		dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: att.id });
		setImageShow(true);
	}
	const itemType = att?.mediaType.split("/").shift();
	return (
		<div className="card p-1 my-1 mr-2 light-shadow">
			<div className="card-title text-right m-0">
				<div className="dropdown d-flex justify-content-end">
					<button className="btn nav-link text-muted p-0" id={`Attachment-${att.id}`} data-bs-toggle="dropdown">
						<ThreeDots />
					</button>
					<ul className="dropdown-menu m-0" aria-labelledby={`Attachment-${att.id}`}>
						<li className='dropdown-item' onClick={() => handleDownload(att?.mediaUrl, att.fileName)}>
							Download
						</li>
						<li className="dropdown-item" onClick={() => { navigator.clipboard.writeText(att?.mediaUrl) }}>
							Copy Link
						</li>
						<li className="dropdown-item" onClick={() => { attchmentDeleteHandler(att.id); }}>
							Delete Attachment
						</li>
					</ul>
				</div>
			</div>
			{itemType === CONST.MEDIA_TYPE.IMAGE &&
				<div className={classes["attached-img-box"]}>
					<img src={getImageURL(att?.mediaUrl, '200x200', false)} alt="attachment" className="attachment-image" onClick={() => onClickImageHandler()} />
					<p className="mb-0 mt-1 att-filename">{att.fileName}</p>
				</div>}
			{itemType === CONST.MEDIA_TYPE.VIDEO &&
				<div className={classes["attached-img-box"]}>
					<video width="320" height="240" alt="attachment" className="attachment-image m-auto" onClick={() => onClickImageHandler()}>
						<source src={att?.mediaUrl} type="video/mp4" />
						<source src={att?.mediaUrl} type="video/ogg" />
						Your browser does not support the video tag.
					</video>
					<p className="mb-0 mt-1 att-filename">{att.fileName}</p>
				</div>}
			{![CONST.MEDIA_TYPE.IMAGE, CONST.MEDIA_TYPE.VIDEO].includes(itemType) &&
				<div className={classes["attached-img-box"]}>
					<div className="document">
						<div className="document-body">
							<ul className="list-inline small mb-0">
								<li className="list-inline-item">
									<span className="text-muted text-uppercase">{att?.mediaType?.split("/").pop()}</span>
								</li>
							</ul>
							<p className="mb-0 mt-1 text-muted att-filename">{att.fileName}</p>
						</div>
					</div>
				</div>}
		</div>
	);
}
