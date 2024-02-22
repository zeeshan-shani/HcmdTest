import React from 'react'
import { ArrowLeft } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom';
import { CONST } from 'utils/constants';

export default function Header() {
    const navigate = useNavigate();
    const onCloseActiveChat = () => navigate(CONST.APP_ROUTES.CHAT);
    return (
        <div className="chat-header bg__chat-dark">
            <button className="btn btn-secondary btn-icon btn-minimal btn-sm  d-xl-none" type="button" onClick={onCloseActiveChat}>
                <ArrowLeft size={20} />
            </button>
            <div className={`media chat-name align-items-center text-truncate`}>
                <div className="media-body align-self-center light-text-70">
                    <h4 className="text-truncate mb-0 username-text">
                        Threads
                    </h4>
                </div>
            </div>
        </div>
    )
}
