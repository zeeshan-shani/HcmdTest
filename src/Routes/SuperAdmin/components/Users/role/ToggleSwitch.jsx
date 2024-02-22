import React from 'react';
import { CONST } from 'utils/constants.js';
import { Switch, SwitchLabel, SwitchRadio, SwitchSelection } from './styles.js';

const titleCase = str =>
    str.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

const ClickableLabel = ({ title, onChange, selected, index }) =>
    <SwitchLabel htmlFor={`${title}-${index}`} onClick={() => onChange(title)} className={`mb-0 ${selected === title ? 'text-white' : ''}`}>
        {titleCase(title !== CONST.USER_TYPE.SA ? title : 'SA')}
    </SwitchLabel>;

const ConcealedRadio = ({ value, selected, index }) =>
    <SwitchRadio type="radio" id={`${value}-${index}`} name="switch" checked={selected === value} onChange={() => { }} />;


export const ToggleSwitch = ({ values = [], selected = null, OnChange, userId }) => {

    const handleChange = val => {
        OnChange(userId, val);
    };
    const selectionStyle = () => {
        return {
            left: `${values.indexOf(selected) / 3 * 100}%`,
        };
    };
    return (
        <Switch>
            {values.map((val, index) => {
                return (
                    <span key={val}>
                        <ConcealedRadio value={val} index={`${index}-${userId}`} selected={selected} />
                        <ClickableLabel title={val} index={`${index}-${userId}`} onChange={handleChange} selected={selected} />
                    </span>
                );
            })}
            <SwitchSelection style={selectionStyle()} />
        </Switch>
    )
}
