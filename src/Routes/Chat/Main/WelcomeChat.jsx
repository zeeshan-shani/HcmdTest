import { useSelector } from "react-redux";
import { changeModel } from "redux/actions/modelAction";
import { getImageURL } from "redux/common";
import { CHAT_MODELS } from "../Models/models";

export default function WelcomeChat() {
    const { user } = useSelector((state) => state.user);
    return (<div className="chats">
        <div className="d-flex flex-column justify-content-center text-center h-100 w-100">
            <div className="container">
                <div className="avatar avatar-lg mb-2">
                    <img className="avatar-img" src={getImageURL(user?.profilePicture, '80x80')} alt="" />
                </div>
                <h5 className='username-text'>Welcome, {user?.name}!</h5>
                <p className="text-muted">Please select a chat to Start messaging.</p>
                <button className="btn btn-outline-primary no-box-shadow" onClick={() => changeModel(CHAT_MODELS.NEW_CHAT)}>
                    Start a conversation
                </button>
            </div>
        </div>
    </div>);
}
