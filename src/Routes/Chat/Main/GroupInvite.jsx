import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getImageURL } from "redux/common";
import { SOCKET } from "utils/constants";
import { SocketEmiter } from "utils/wssConnection/Socket";
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { showError, showSuccess } from "utils/package_config/toast";

export default function GroupInvite() {
    const { user } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        const decrypted = atob(params.key);
        const regex = /chatId=(\d+),userId=(\d+)/;
        // Use exec() method to get the matched groups
        const match = regex.exec(decrypted);
        if (!match) return;
        const chatId = Number(match[1]);
        const creatorId = Number(match[2]);
        setLoading(true);
        SocketEmiter(SOCKET.REQUEST.ADD_MEMBER, { chatId, users: [user.id], initialMessage: false, creatorId }, (data) => {
            if (data?.status) {
                setLoading(false);
                navigate(`/chats/chat/${data.data.chatId}`);
                showSuccess(data.message);
            }
            else if (!data?.status) {
                setLoading(false);
                showError(data.message);
            }
        });
    }, [params.key, user.id, navigate]);

    return (
        <div className="chats">
            <div className="d-flex flex-column justify-content-center text-center h-100 w-100">
                <div className="container">
                    <div className="avatar avatar-lg mb-2">
                        <img className="avatar-img" src={getImageURL(user?.profilePicture, '80x80')} alt="" />
                    </div>
                    <h5 className='username-text'>Welcome, {user?.name}!</h5>
                    <p className="text-muted">You're being added to the Group.</p>
                    {loading && <Loader height={'80px'} />}
                </div>
            </div>
        </div>);
}
