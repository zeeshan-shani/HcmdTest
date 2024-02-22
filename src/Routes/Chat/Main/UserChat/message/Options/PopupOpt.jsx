import React from 'react'
import { useSelector } from 'react-redux';
import { BoxArrowUpLeft } from 'react-bootstrap-icons'
import { MuiTooltip } from 'Components/components'

export const PopupOpt = ({ onPopupView, item }) => {
    const { user } = useSelector(state => state.user);
    return (
        <MuiTooltip title='pop-up view'>
            <div className='popup-opt-media cursor-pointer text-color' onClick={() => onPopupView(item)}>
                <BoxArrowUpLeft size={user?.fontSize} />
            </div>
        </MuiTooltip>
    )
}