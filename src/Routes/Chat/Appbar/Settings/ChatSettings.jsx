import React from 'react'

export const ChatSettings = ({
    isImportantChat,
    onChangeImportant
}) => {
    return (
        <div className="mute-setting p-2">
            <div className="todo-title">
                <h6 className="">Chat Settings</h6>
            </div>
            <ul className="list-group border list-group-flush">
                <li className="list-group-item py-2">
                    <div className="media align-items-center">
                        <div className="media-body">
                            <p className="mb-0">Hide</p>
                        </div>
                        <div className="custom-control custom-switch ml-2">
                            <input type="checkbox" className="custom-control-input"
                                id="markAsImportantChat"
                                checked={!isImportantChat}
                                onChange={e => onChangeImportant(!e.target.checked)} />
                            <label className="custom-control-label" htmlFor="markAsImportantChat">&nbsp;</label>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    )
}
