import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import useDebounce from 'services/hooks/useDebounce';
import { USER_CONST } from 'redux/constants/userContants';
import { dispatch } from 'redux/store';
import { updateUserAPI } from 'redux/actions/userAction';

export default function FontRange({ start = '7', end = '20' }) {
    const { user } = useSelector(state => state.user);
    const [userFontSize, setFontSize] = useState(user?.fontSize ? user.fontSize : 14);
    const newFontSize = useDebounce(userFontSize, 500);

    useEffect(() => {
        if (newFontSize !== user?.fontSize) {
            dispatch({ type: USER_CONST.SET_MSG_FONT_SIZE, payload: newFontSize });
            updateUserAPI({ userId: user.id, fontSize: newFontSize });
        }
    }, [newFontSize, user?.fontSize, user.id]);

    const onFontChange = e => setFontSize(Number(e.target.value));
    return (<>
        <label className='mb-0 text-color' htmlFor="fontId">Font size:</label>
        <input
            type="range"
            id="fontId"
            list='markers'
            name="fontrange"
            min={start}
            max={end}
            defaultValue={userFontSize}
            onChange={onFontChange} />

        <datalist id="markers">
            <option value="7"></option>
            <option value="11"></option>
            <option value="14"></option>
            <option value="20"></option>
        </datalist>
    </>
    )
}