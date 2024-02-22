import { Switch, SwitchLabel, SwitchRadio, SwitchSelection } from 'Routes/Dashboard/components/Chat/styles';
import React from 'react';

const titleCase = str =>
    str.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

const ClickableLabel = ({ title, onChange, selected }) =>
    <SwitchLabel onClick={() => onChange(title)} className={`mb-0 ${selected === title ? 'text-white' : ''}`}>
        {titleCase(title !== 'tasks' ? title : 'chat')}
    </SwitchLabel>;

const ConcealedRadio = ({ value, selected }) =>
    <SwitchRadio type="radio" name="switch" checked={selected === value} onChange={() => { }} />;

export const ToggleSwitch = ({ values = [], selected = null, OnChange, style = {} }) => {

    const handleChange = val => OnChange(val);
    const selectionStyle = () => {
        return {
            left: `${values.indexOf(selected) / values.length * 100}%`,
        };
    };
    return (
        <Switch className='input-border' style={style}>
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
