import { getImageURL } from 'redux/common';

export const MessageOptions = ({ item, prevMsg }) => {
    const isoptionAvailable = prevMsg?.sendBy !== item.sendBy;
    if (isoptionAvailable)
        return (
            <div className="message-options position-relative z-index-1">
                <div className="avatar avatar-sm sm-transition">
                    <img alt="" src={getImageURL(item?.sendByDetail?.profilePicture, '40x40')} />
                </div>
            </div>
        )
}