import React from 'react';
import { CONST } from 'utils/constants';
import { Switch, SwitchLabel, SwitchRadio, SwitchSelection } from './styles';

const titleCase = str =>
    str.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

const ClickableLabel = ({ title, onChange, selected }) =>
    <SwitchLabel onClick={() => onChange(title)} className={`mb-0 ${selected === title ? 'text-white' : ''}`}>
        {titleCase(title !== CONST.CHAT_TYPE.ALL_CHATS ? title : 'All')}
    </SwitchLabel>;

const ConcealedRadio = ({ value, selected }) =>
    <SwitchRadio type="radio" name="switch" checked={selected === value} onChange={() => { }} />;


export const ToggleSwitch = ({ values = [], selected = null, OnChange }) => {

    const handleChange = val => {
        OnChange(val);
    };
    const selectionStyle = () => {
        return {
            left: `${values.indexOf(selected) / 3 * 100}%`,
        };
    };
    return (
        <Switch className='input-border'>
            {values.map(val => {
                return (
                    <span key={val}>
                        <ConcealedRadio value={val} selected={selected} />
                        <ClickableLabel title={val} onChange={handleChange} selected={selected} />
                    </span>
                );
            })}
            <SwitchSelection style={selectionStyle()} />
        </Switch>
    )
}
